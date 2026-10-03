/* Escape Route — site interactions: nav, route cards, charts, calendar, forms */
(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- helpers ---------------- */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ---------------- nav ---------------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  });
  navToggle.addEventListener("click", () => nav.classList.toggle("nav-open"));
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("nav-open"))
  );

  /* ---------------- scroll reveal ---------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  /* ---------------- icons ---------------- */
  const ICONS = {
    duration: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    distance: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 20c3-6 5-2 8-8s3 2 6-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="3" cy="20" r="1.4" fill="currentColor"/><circle cx="17" cy="8" r="1.4" fill="currentColor"/></svg>',
    altitude: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 19h18L14.5 7 10 13.5 7.5 10 3 19z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    group: '<svg viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="9" r="2.3" stroke="currentColor" stroke-width="1.8"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.8"/></svg>',
    season: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/></svg>',
  };
  const TERRAIN_ICON = {
    road: '<path d="M8 3l-4 18M16 3l4 18M10 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    forest: '<path d="M12 2l5 8H7l5-8zM12 7l6 9H6l6-9zM12 16v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>',
    snow: '<path d="M12 2v20M4 7l16 10M20 7L4 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    summit: '<path d="M4 20L12 4l8 16H4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 4v6l3 2" stroke="currentColor" stroke-width="1.8"/>',
    meadow: '<path d="M4 20c2-6 4-6 5-10 1 4 3 4 4 10M12 20c2-5 3-5 4-9 1 4 2 4 3 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
    pass: '<path d="M3 20l6-14 4 8 3-6 5 12H3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    lake: '<path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
    acclimatise: '<path d="M12 21s-7-4.6-7-10.6C5 6.4 8.1 3.5 12 3.5s7 2.9 7 6.9C19 16.4 12 21 12 21z" stroke="currentColor" stroke-width="1.8"/>',
    monastery: '<path d="M12 2l3 4H9l3-4zM6 10v10h12V10l-6-3-6 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    glacier: '<path d="M3 18l4-10 3 6 3-8 3 7 3-5 2 10H3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  };
  function terrainIcon(key) {
    return `<svg viewBox="0 0 24 24" fill="none">${TERRAIN_ICON[key] || TERRAIN_ICON.road}</svg>`;
  }

  /* ---------------- route art (per-trek mountain illustration) ---------------- */
  const ART_PALETTES = [
    { far: "#d9c7a8", mid: "#b99b73", near: "#8a6a4a", snow: "#fbf6ec" },
    { far: "#c7b394", mid: "#a8622f", near: "#6b4f37", snow: "#fdf9f3" },
    { far: "#9f8b73", mid: "#6b4f37", near: "#2e2015", snow: "#ffffff" },
  ];
  function buildRouteArt(trek, index) {
    const p = ART_PALETTES[index % ART_PALETTES.length];
    const seed = index * 37;
    return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration for ${escapeHtml(trek.name)}">
      <rect width="400" height="300" fill="${p.far}" opacity="0.25"/>
      <path d="M0 210 L${60+seed%20} 130 L120 190 L${190-seed%10} 90 L250 180 L320 120 L400 200 L400 300 L0 300 Z" fill="${p.mid}" opacity="0.7"/>
      <path d="M${190-seed%10} 90 L205 112 L172 118 Z" fill="${p.snow}" opacity="0.9"/>
      <path d="M0 250 L80 180 L140 230 L${210+seed%15} 150 L280 235 L360 190 L400 240 L400 300 L0 300 Z" fill="${p.near}"/>
      <path d="M${210+seed%15} 150 L232 176 L190 182 Z" fill="${p.snow}"/>
      <path d="M80 180 L98 202 L63 207 Z" fill="${p.snow}" opacity="0.85"/>
      <path d="M20 290 C 80 260, 120 275, 170 250 S 260 240, 300 265 S 370 280, 395 260" stroke="${p.snow}" stroke-width="3" stroke-dasharray="1 8" fill="none" opacity="0.7"/>
    </svg>`;
  }

  /* ---------------- altitude chart ---------------- */
  function buildAltitudeChart(trek) {
    const points = trek.altitudeProfile;
    const w = 560, h = 220;
    const padX = 28, padTop = 46, padBottom = 34;
    const vals = points.map((p) => p.m);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    const plotW = w - padX * 2;
    const plotH = h - padTop - padBottom;

    const coords = points.map((p, i) => ({
      x: padX + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW),
      y: padTop + plotH - ((p.m - min) / range) * plotH,
      ...p,
    }));

    const linePath = coords
      .map((c, i) => (i === 0 ? "M" : "L") + c.x.toFixed(1) + "," + c.y.toFixed(1))
      .join(" ");
    const base = (padTop + plotH).toFixed(1);
    const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${base} L${coords[0].x.toFixed(1)},${base} Z`;

    const gradId = `altGrad-${trek.id}`;
    let labels = "";
    let dots = "";
    coords.forEach((c, i) => {
      const above = i % 2 === 0;
      const valueY = above ? c.y - 24 : c.y + 26;
      const labelY = above ? c.y - 10 : c.y + 40;
      labels += `<text x="${c.x}" y="${valueY}" text-anchor="middle" class="alt-point-value">${c.m.toLocaleString()}m</text>`;
      labels += `<text x="${c.x}" y="${labelY}" text-anchor="middle" class="alt-point-label">${escapeHtml(c.label)}</text>`;
      dots += `<circle cx="${c.x}" cy="${c.y}" r="4.5" fill="#fffdfb" stroke="#8a4e23" stroke-width="2.5"/>`;
    });

    return `
    <figure class="altitude-chart">
      <div class="altitude-svg-wrap">
        <svg viewBox="0 0 ${w} ${h}" class="altitude-svg" role="img" aria-label="Altitude profile for ${escapeHtml(trek.name)}, ranging from ${min.toLocaleString()} to ${max.toLocaleString()} metres">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#a8622f" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#a8622f" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="${areaPath}" fill="url(#${gradId})"/>
          <path d="${linePath}" fill="none" stroke="#8a4e23" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          ${dots}
          ${labels}
        </svg>
      </div>
      <figcaption>Elevation across the trek, day by day</figcaption>
    </figure>`;
  }

  /* ---------------- difficulty meter ---------------- */
  function buildDifficultyMeter(trek) {
    const labelsArr = ["Easy", "Moderate", "Challenging"];
    const segs = [1, 2, 3]
      .map((lvl) => `<div class="difficulty-seg ${lvl <= trek.difficulty ? `is-active lvl-${trek.difficulty}` : ""}"></div>`)
      .join("");
    return `
    <div class="difficulty-meter">
      <div class="difficulty-track">${segs}</div>
      <div class="difficulty-labels">
        ${labelsArr.map((l, i) => (i + 1 === trek.difficulty ? `<strong>${l}</strong>` : `<span>${l}</span>`)).join("")}
      </div>
    </div>`;
  }

  /* ---------------- route card ---------------- */
  function buildRouteCard(trek, index) {
    const chips = `
      <div class="chip-row">
        <span class="chip">${ICONS.duration}${trek.duration}</span>
        <span class="chip">${ICONS.distance}${trek.distanceKm} km</span>
        <span class="chip">${ICONS.altitude}${trek.maxAltitudeM.toLocaleString()} m / ${trek.maxAltitudeFt.toLocaleString()} ft</span>
        <span class="chip">${ICONS.group}${trek.groupSize}</span>
        <span class="chip">${ICONS.season}${trek.bestSeason}</span>
      </div>`;

    const highlights = trek.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("");
    const expect = trek.expect.map((h) => `<li>${escapeHtml(h)}</li>`).join("");
    const timeline = trek.itinerary
      .map(
        (it) => `
      <div class="timeline-item">
        <span class="timeline-dot">${terrainIcon(it.terrain)}</span>
        <h5><span class="day-tag">Day ${it.day}</span>${escapeHtml(it.title)}</h5>
        <p>${escapeHtml(it.desc)}</p>
      </div>`
      )
      .join("");

    return `
    <div class="route-card reveal" data-trek="${trek.id}">
      <div class="route-summary" role="button" tabindex="0" aria-expanded="false">
        <div class="route-art">${buildRouteArt(trek, index)}</div>
        <div class="route-title-block">
          <span class="eyebrow">${escapeHtml(trek.region)}</span>
          <h3>${escapeHtml(trek.name)}</h3>
          <p class="route-tagline">${escapeHtml(trek.tagline)}</p>
          ${chips}
        </div>
        <button type="button" class="route-toggle" aria-hidden="true">
          <span class="chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          Details
        </button>
      </div>
      <div class="route-details">
        <div class="route-details-inner">
          <p>${escapeHtml(trek.summary)}</p>
          ${buildDifficultyMeter(trek)}
          <div class="detail-grid">
            <div class="detail-block">
              <h4>Day by day</h4>
              <div class="timeline">${timeline}</div>
            </div>
            <div class="detail-block">
              <h4>Altitude profile</h4>
              ${buildAltitudeChart(trek)}
              <h4 style="margin-top:28px;">Highlights</h4>
              <ul class="bullet-list">${highlights}</ul>
              <h4 style="margin-top:28px;">What to expect</h4>
              <ul class="bullet-list">${expect}</ul>
            </div>
          </div>
          <div class="detail-foot">
            <div class="price-tag">${trek.price}<span>per person, all-inclusive from ${trek.startEnd.split(" to ")[0]}</span></div>
            <a href="#booking" class="btn btn-primary book-this-trek" data-trek="${trek.id}">Book this trek</a>
          </div>
        </div>
      </div>
    </div>`;
  }

  const routesList = document.getElementById("routesList");
  routesList.innerHTML = TREKS.map((t, i) => buildRouteCard(t, i)).join("");
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // expand/collapse
  routesList.querySelectorAll(".route-summary").forEach((summary) => {
    const card = summary.closest(".route-card");
    function toggle() {
      const isOpen = card.classList.toggle("is-open");
      summary.setAttribute("aria-expanded", String(isOpen));
    }
    summary.addEventListener("click", toggle);
    summary.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // "Book this trek" -> preselect in booking form
  routesList.querySelectorAll(".book-this-trek").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const trekId = btn.dataset.trek;
      const select = document.getElementById("bookingTrekSelect");
      select.value = trekId;
      select.dispatchEvent(new Event("change"));
    });
  });

  /* ---------------- footer route links ---------------- */
  document.getElementById("footerRouteLinks").innerHTML = TREKS.map(
    (t) => `<li><a href="#routes">${escapeHtml(t.name)}</a></li>`
  ).join("");

  /* ---------------- trek selects ---------------- */
  const bookingSelect = document.getElementById("bookingTrekSelect");
  bookingSelect.innerHTML = TREKS.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");

  const enquireSelect = document.getElementById("eTrekInterest");
  enquireSelect.insertAdjacentHTML(
    "beforeend",
    TREKS.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("")
  );

  /* ---------------- calendar ---------------- */
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarMonthLabel = document.getElementById("calendarMonthLabel");
  const selectedDateBanner = document.getElementById("selectedDateBanner");
  const bTrekField = document.getElementById("bTrek");
  const bDateField = document.getElementById("bDate");

  let currentTrekId = bookingSelect.value;
  let viewYear, viewMonth; // 0-based month
  let selectedISO = null;

  function isoOf(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function availableSet(trekId) {
    return new Set(AVAILABILITY[trekId] || []);
  }

  function setInitialMonth(trekId) {
    const dates = (AVAILABILITY[trekId] || []).slice().sort();
    const today = new Date();
    const next = dates.find((iso) => new Date(iso + "T00:00:00") >= new Date(today.toDateString()));
    const base = next ? new Date(next + "T00:00:00") : today;
    viewYear = base.getFullYear();
    viewMonth = base.getMonth();
  }

  function renderCalendar() {
    const avail = availableSet(currentTrekId);
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    calendarMonthLabel.textContent = first.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    let cells = "";
    for (let i = 0; i < startDay; i++) cells += `<div class="cal-cell is-empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoOf(viewYear, viewMonth, d);
      const cellDate = new Date(viewYear, viewMonth, d);
      const isPast = cellDate < today;
      const isAvailable = avail.has(iso) && !isPast;
      const isSelected = iso === selectedISO;
      const classes = ["cal-cell"];
      if (isPast) classes.push("is-past");
      if (isAvailable) classes.push("is-available");
      if (isSelected) classes.push("is-selected");
      cells += `<div class="${classes.join(" ")}" ${isAvailable ? `data-iso="${iso}" role="button" tabindex="0"` : ""}>${d}</div>`;
    }
    calendarGrid.innerHTML = cells;

    calendarGrid.querySelectorAll(".is-available").forEach((cell) => {
      cell.addEventListener("click", () => selectDate(cell.dataset.iso));
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDate(cell.dataset.iso);
        }
      });
    });
  }

  function selectDate(iso) {
    selectedISO = iso;
    bDateField.value = iso;
    const trekName = TREKS.find((t) => t.id === currentTrekId)?.name || "";
    selectedDateBanner.style.display = "block";
    selectedDateBanner.textContent = `Selected: ${fmtDate(iso)} — ${trekName}`;
    renderCalendar();
  }

  document.getElementById("calPrev").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById("calNext").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  bookingSelect.addEventListener("change", () => {
    currentTrekId = bookingSelect.value;
    bTrekField.value = currentTrekId;
    selectedISO = null;
    selectedDateBanner.style.display = "none";
    setInitialMonth(currentTrekId);
    renderCalendar();
  });

  bTrekField.value = currentTrekId;
  setInitialMonth(currentTrekId);
  renderCalendar();

  /* ---------------- form submission ---------------- */
  function showMsg(el, kind, text) {
    el.className = `form-msg is-${kind}`;
    el.textContent = text;
  }

  async function submitToSheet(formEl, sheetName, msgEl, extra) {
    const fd = new FormData(formEl);
    const data = {};
    fd.forEach((v, k) => (data[k] = v));
    Object.assign(data, extra, { sheet: sheetName, submittedAt: new Date().toISOString() });

    if (!APPS_SCRIPT_URL) {
      showMsg(
        msgEl,
        "error",
        "Booking system isn't connected yet — please email hello@escaperoute.treks directly and we'll sort it out."
      );
      return;
    }

    const submitBtn = formEl.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Sending...";

    try {
      const body = new FormData();
      Object.entries(data).forEach(([k, v]) => body.append(k, v));
      const res = await fetch(APPS_SCRIPT_URL, { method: "POST", body });
      let ok = res.ok;
      try {
        const json = await res.json();
        ok = ok && json.status !== "error";
      } catch (_) {
        /* non-JSON response from Apps Script is fine as long as status was ok */
      }
      if (ok) {
        showMsg(msgEl, "success", "Thanks — we've got it. Expect a reply within a day.");
        formEl.reset();
        if (formEl.id === "bookingForm") {
          selectedISO = null;
          selectedDateBanner.style.display = "none";
          bTrekField.value = currentTrekId;
          renderCalendar();
        }
      } else {
        showMsg(msgEl, "error", "Something went wrong on our end. Please try again or email us directly.");
      }
    } catch (err) {
      showMsg(msgEl, "error", "Couldn't reach the booking system. Please try again or email us directly.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  }

  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("bookingMsg");
    if (!bDateField.value) {
      showMsg(msgEl, "error", "Pick an available date on the calendar first.");
      return;
    }
    const trekName = TREKS.find((t) => t.id === currentTrekId)?.name || currentTrekId;
    submitToSheet(bookingForm, "Bookings", msgEl, { trekName });
  });

  const enquireForm = document.getElementById("enquireForm");
  enquireForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("enquireMsg");
    submitToSheet(enquireForm, "Enquiries", msgEl, {});
  });
})();
