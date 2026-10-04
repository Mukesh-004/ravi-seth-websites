// Paste this into the Apps Script project attached to the call-request Sheet.
// Set WEBHOOK_SECRET in Script Properties before deploying as a web app.
const SHEET_ID = '1a2W8xxgXSaUx1DjFQwiIHNq0gg8CvRNtXA1-1HxJCbs';
const TAB_NAME = 'Call Requests';

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!expected || payload.secret !== expected) return reply({ok:false,error:'Unauthorized'});
    const request = payload.request || {};
    if (!request.id || !request.phone || !request.name) return reply({ok:false,error:'Missing request fields'});
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB_NAME);
      if (!sheet) return reply({ok:false,error:'Sheet tab missing'});
      const ids = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getDisplayValues().flat() : [];
      if (!ids.includes(String(request.id))) {
        const safe = value => {
          const text = String(value == null ? '' : value).slice(0,1000);
          return /^[=+\-@]/.test(text) ? "'" + text : text;
        };
        sheet.appendRow([
          safe(request.id), safe(request.createdAt), safe(request.source), safe(request.item),
          safe(request.name), safe(request.phone), safe(request.note), request.consent ? 'Yes' : 'No', 'New'
        ]);
      }
      return reply({ok:true,id:String(request.id)});
    } finally { lock.releaseLock(); }
  } catch (error) { return reply({ok:false,error:String(error).slice(0,200)}); }
}

function reply(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
