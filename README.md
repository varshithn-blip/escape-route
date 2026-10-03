# Escape Route — Himalayan Trekking Co.

A static marketing site for a small Himalayan trekking company: home page, three detailed sample routes with altitude-profile infographics and day-by-day itineraries, a booking calendar showing available departure dates, and an enquiry form.

## Structure

```
index.html          Home page (single page: hero, routes, booking, enquiry, footer)
css/style.css        Theme (white / beige / brown), layout, components
js/data.js            Trek content and available departure dates — edit this to add/change treks or dates
js/config.js           Apps Script Web App URL (fill in after setup)
js/main.js             Rendering + interactivity: route cards, charts, calendar, form submission
apps-script/Code.gs    Google Apps Script backend that writes form submissions into the Google Sheet
apps-script/README.md  Step-by-step: deploy the script and connect it
```

## Running locally

It's a static site — no build step. Serve the folder with any static server, e.g.:

```
python3 -m http.server 8080
```

then open `http://localhost:8080`.

## Connecting bookings/enquiries to Google Sheets

See `apps-script/README.md`. In short: paste `apps-script/Code.gs` into the Apps Script editor attached to your Google Sheet, deploy it as a web app, and put the resulting URL into `js/config.js`.

## Editing content

- **Routes, itineraries, altitude profiles, prices:** `js/data.js` → `TREKS` array.
- **Available booking dates:** `js/data.js` → `AVAILABILITY` object (per trek, ISO `yyyy-mm-dd`).
- **Contact details, copy:** directly in `index.html`.
- **Colors/fonts:** CSS variables at the top of `css/style.css`.
