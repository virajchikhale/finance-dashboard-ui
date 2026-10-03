/**
 * Read-only JSON endpoint for the dashboard.
 *
 * Setup (once):
 *   1. Project Settings > Script properties > Add script property:  API_KEY = <long random string>
 *      (generate one with `openssl rand -hex 24`). The key is NOT kept in this file or in git.
 *   2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 *   3. In the dashboard paste:  <web app URL>?key=<API_KEY>
 *
 * Without a configured API_KEY the endpoint refuses every request (it fails closed).
 */
const SHEET_NAMES = ['Records', 'Instalments', 'Dropdowns'];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Compares in time proportional to the length only, so response timing does not leak a matching prefix
function safeEquals_(a, b) {
  a = String(a || '');
  b = String(b || '');
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function doGet(e) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!apiKey || apiKey.length < 16) {
    return json_({ error: 'Server not configured: set the API_KEY script property (16+ characters).' });
  }
  const supplied = e && e.parameter ? e.parameter.key : '';
  if (!safeEquals_(supplied, apiKey)) {
    return json_({ error: 'Unauthorized' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const output = {};

  SHEET_NAMES.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const [headers, ...rows] = sheet.getDataRange().getValues();
    output[name] = rows
      .filter(r => r.some(c => c !== '' && c !== null))
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          if (!h) return; // skip unnamed columns
          const val = row[i];
          // Convert Date objects to ISO string for safe JSON serialization
          obj[h] = val instanceof Date ? val.toISOString() : (val ?? '');
        });
        return obj;
      });
  });

  return json_(output);
}
