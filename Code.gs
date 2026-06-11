const SECRET_KEY = 'mypf2025'; // change this to anything you like

function doGet(e) {
  // if (e.parameter.key !== SECRET_KEY) {
  //   return ContentService
  //     .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
  //     .setMimeType(ContentService.MimeType.JSON);
  // }

  const sheet_names = ['Records', 'Instalments', 'Dropdowns'];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const output = {};

  sheet_names.forEach(name => {
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

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
