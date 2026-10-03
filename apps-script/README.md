# Connecting the site to your Google Sheet

The site uses your Google Sheet as its database for bookings and enquiries. It writes to it through a small Google Apps Script "Web App", which runs under your own Google account — no server or hosting needed for the backend.

Your sheet: https://docs.google.com/spreadsheets/d/1EVUIqQ49Ue6uJRkqrD1leMs2U703uos-jw3QMzoiS9Q/edit

## 1. Add the script to the sheet

1. Open the sheet above.
2. Go to **Extensions → Apps Script**.
3. Delete any placeholder code in `Code.gs` and paste in the contents of `apps-script/Code.gs` from this repo.
4. Save the project (give it a name like "Escape Route backend").

## 2. Deploy it as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access** and approve the permissions (it only writes to this one spreadsheet).
5. Copy the **Web app URL** it gives you — it looks like `https://script.google.com/macros/s/XXXXXXXX/exec`.

## 3. Wire it into the site

Open `js/config.js` and paste the URL in:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

Redeploy the site (or just refresh if testing locally). Booking requests and enquiries will now land as new rows on two tabs the script creates automatically the first time each form is used: **Bookings** and **Enquiries**.

## Updating the script later

If you edit `Code.gs` again, you must create a **new deployment** (Deploy → Manage deployments → pencil icon → New version) for the changes to go live — saving the file alone isn't enough.

## Notes

- The sheet's existing `Sheet1` tab is left untouched; you can delete it or use it for your own notes.
- Available departure dates shown on the site's calendar are defined in `js/data.js` (the `AVAILABILITY` object), not read from the sheet — edit that file to change which dates show as bookable.
