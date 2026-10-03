/**
 * Escape Route — form backend.
 * Deploy this as a Web App bound to the "Escape route" Google Sheet, then
 * paste the deployment URL into js/config.js as APPS_SCRIPT_URL.
 * See apps-script/README.md for step-by-step setup.
 */

var BOOKING_HEADERS = [
  "Submitted At", "Trek", "Trek Name", "Date", "Full Name", "Email", "Phone",
  "Trekkers", "Notes",
];

var ENQUIRY_HEADERS = [
  "Submitted At", "Full Name", "Email", "Phone", "Trek Interest", "Message",
];

function doPost(e) {
  try {
    var params = e.parameter || {};
    var sheetName = params.sheet === "Bookings" ? "Bookings" : "Enquiries";
    var sheet = getOrCreateSheet(sheetName);

    if (sheetName === "Bookings") {
      ensureHeaders(sheet, BOOKING_HEADERS);
      sheet.appendRow([
        params.submittedAt || new Date().toISOString(),
        params.trek || "",
        params.trekName || "",
        params.date || "",
        params.fullName || "",
        params.email || "",
        params.phone || "",
        params.trekkers || "",
        params.notes || "",
      ]);
    } else {
      ensureHeaders(sheet, ENQUIRY_HEADERS);
      sheet.appendRow([
        params.submittedAt || new Date().toISOString(),
        params.fullName || "",
        params.email || "",
        params.phone || "",
        params.trekInterest || "",
        params.message || "",
      ]);
    }

    return jsonOutput({ status: "ok" });
  } catch (err) {
    return jsonOutput({ status: "error", message: err && err.message });
  }
}

function doGet(e) {
  return jsonOutput({ status: "ok", message: "Escape Route booking endpoint is live." });
}

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
