/**
 * JSON API for the finance sheet: the dashboard reads through it, the Apple Shortcut writes through it.
 *
 * Setup (once):
 *   1. Project Settings > Script properties > Add script property:  API_KEY = <long random string>
 *      (generate one with `openssl rand -hex 24`). The key is NOT kept in this file or in git.
 *   2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 *      After editing this file use Deploy > Manage deployments > Edit > New version, so the URL stays the same.
 *   3. Dashboard:  <web app URL>?key=<API_KEY>
 *      Shortcut:    GET  <web app URL>?key=<API_KEY>&action=lists   -> dropdown lists for the pickers
 *                   POST <web app URL>?key=<API_KEY>                 -> add one row to Records
 *
 * Without a configured API_KEY every request is refused (it fails closed).
 *
 * POST fields (form fields or a JSON body):
 *   date             YYYY-MM-DD (or anything Date() understands). Empty = today.
 *   description      required
 *   amount           required, positive number ("1,250" is fine)
 *   transactionType  Credit | Debit | Transfer | Owes | Owed | Settled
 *   category         must be in Dropdowns > Category (or "Opening Balance"); required for Debit
 *   accountName      must be in Dropdowns > Bank Accounts
 *   toAccount        Transfer only; must be a different bank account
 *   name             Owes / Owed / Settled only; must be in Dropdowns > Friends
 *   id               optional but recommended: a UUID from the Shortcut. A repeated id is not saved twice.
 *
 * Opening balances (start of a fresh sheet):
 *   - account:  Credit (or Debit for a negative balance), category "Opening Balance", accountName set
 *   - friend:   Owes / Owed, category "Opening Balance", name set, accountName left empty
 *               (no account is touched, only the friend's balance)
 */

const READ_SHEETS = ['Records', 'Instalments', 'Dropdowns'];
const RECORDS_SHEET = 'Records';
const DROPDOWNS_SHEET = 'Dropdowns';

const TYPES = ['Credit', 'Debit', 'Transfer', 'Owes', 'Owed', 'Settled'];
const FRIEND_TYPES = ['Owes', 'Owed', 'Settled'];
// Old spellings still sent by an older Shortcut are saved under the new names
const LEGACY_TYPES = { Transferd: 'Transfer', Setteled: 'Settled' };
const OPENING_CATEGORY = 'Opening Balance';

// Records sheet headers, in the order new sheets should have them. Matched by name, not position.
const COLUMNS = {
  date: 'Date',
  description: 'Description',
  name: 'Name',
  amount: 'Amount',
  transactionType: 'Transaction Type',
  category: 'Category',
  accountName: 'Account Name',
  toAccount: 'To Account',
  id: 'ID',
  enteredAt: 'Entered At',
};
// Added automatically to the header row if missing
const AUTO_COLUMNS = ['id', 'enteredAt'];

// Dropdowns sheet: list name -> header
const LISTS = { categories: 'Category', accounts: 'Bank Accounts', friends: 'Friends' };

// ── helpers ──────────────────────────────────────────────────────────────────

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(message) {
  return json_({ success: false, error: message });
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

// Returns an error message, or null when the request carries the right key
function authError_(params) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!apiKey || apiKey.length < 16) {
    return 'Server not configured: set the API_KEY script property (16+ characters).';
  }
  return safeEquals_(params.key, apiKey) ? null : 'Unauthorized';
}

// Header -> column index. When a header appears twice the first one wins, so a stray
// duplicate header (e.g. an empty second "Category") cannot overwrite the real column.
function headerIndex_(headers) {
  const idx = {};
  headers.forEach((h, i) => {
    const key = String(h).trim();
    if (key && !(key in idx)) idx[key] = i;
  });
  return idx;
}

function sheetToObjects_(sheet) {
  const [headers, ...rows] = sheet.getDataRange().getValues();
  const idx = headerIndex_(headers);
  return rows
    .filter(r => r.some(c => c !== '' && c !== null))
    .map(row => {
      const obj = {};
      Object.keys(idx).forEach(h => {
        const val = row[idx[h]];
        obj[h] = val instanceof Date ? val.toISOString() : (val ?? '');
      });
      return obj;
    });
}

function readLists_(ss) {
  const out = { categories: [], accounts: [], friends: [], types: TYPES.slice() };
  const sheet = ss.getSheetByName(DROPDOWNS_SHEET);
  if (!sheet) return out;
  const [headers, ...rows] = sheet.getDataRange().getValues();
  const idx = headerIndex_(headers);
  Object.keys(LISTS).forEach(list => {
    const col = idx[LISTS[list]];
    if (col === undefined) return;
    out[list] = rows.map(r => String(r[col]).trim()).filter(Boolean);
  });
  return out;
}

function str_(v) {
  return v === undefined || v === null ? '' : String(v).trim();
}

// "YYYY-MM-DD" is read as a calendar day in the script's time zone (new Date() would read it as UTC midnight)
function parseDate_(value) {
  const s = str_(value);
  if (!s) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getMonth() === Number(m[2]) - 1 ? d : null; // rejects 2026-02-31
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function readParams_(e) {
  const params = Object.assign({}, (e && e.parameter) || {});
  const body = e && e.postData;
  if (body && body.contents && /json/i.test(body.type || '')) {
    try {
      Object.assign(params, JSON.parse(body.contents));
    } catch (err) {
      params.__badJson = true;
    }
  }
  return params;
}

// ── validation (pure: no sheet access, so it can be tested on its own) ──────

// Returns { row } with clean values, or { error }
function validateEntry_(p, lists) {
  const type = LEGACY_TYPES[str_(p.transactionType)] || str_(p.transactionType);
  if (!TYPES.includes(type)) {
    return { error: `Invalid transactionType "${str_(p.transactionType)}". Use one of: ${TYPES.join(', ')}` };
  }

  const description = str_(p.description);
  if (!description) return { error: 'Missing required field: description' };

  const amount = parseFloat(str_(p.amount).replace(/,/g, ''));
  if (!isFinite(amount) || amount <= 0) return { error: 'Invalid amount: must be a positive number' };

  const date = parseDate_(p.date);
  if (!date) return { error: `Invalid date "${str_(p.date)}". Use YYYY-MM-DD` };

  const category = str_(p.category);
  const isOpening = category === OPENING_CATEGORY;
  if (category && !isOpening && !lists.categories.includes(category)) {
    return { error: `Unknown category "${category}". Add it to Dropdowns first` };
  }
  if (type === 'Debit' && !category) return { error: 'category is required for Debit' };

  const isFriend = FRIEND_TYPES.includes(type);
  const name = str_(p.name);
  if (isFriend) {
    if (!name) return { error: `name is required for ${type}` };
    if (!lists.friends.includes(name)) return { error: `Unknown friend "${name}". Add them to Dropdowns first` };
  }

  // A friend's opening balance moves no money, so it is the one case without an account
  const accountName = str_(p.accountName);
  const accountOptional = isOpening && isFriend;
  if (!accountName && !accountOptional) return { error: 'Missing required field: accountName' };
  if (accountName && !lists.accounts.includes(accountName)) {
    return { error: `Unknown account "${accountName}". Add it to Dropdowns first` };
  }

  let toAccount = '';
  if (type === 'Transfer') {
    toAccount = str_(p.toAccount);
    if (!toAccount) return { error: 'toAccount is required for Transfer' };
    if (!lists.accounts.includes(toAccount)) return { error: `Unknown toAccount "${toAccount}"` };
    if (toAccount === accountName) return { error: 'toAccount must be different from accountName' };
  }

  return {
    row: {
      date,
      description,
      name, // also kept on non-friend rows (e.g. a shop or person), but only checked for friend types
      amount: Math.round(amount * 100) / 100,
      transactionType: type,
      category,
      accountName,
      toAccount,
      id: str_(p.id),
    },
  };
}

// ── endpoints ────────────────────────────────────────────────────────────────

function doGet(e) {
  const params = (e && e.parameter) || {};
  const auth = authError_(params);
  if (auth) return json_({ error: auth });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (params.action === 'lists') return json_(readLists_(ss));

  const output = {};
  READ_SHEETS.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) output[name] = sheetToObjects_(sheet);
  });
  return json_(output);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const params = readParams_(e);
    const auth = authError_(params);
    if (auth) return fail_(auth);
    if (params.__badJson) return fail_('Body is not valid JSON');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(RECORDS_SHEET);
    if (!sheet) return fail_(`${RECORDS_SHEET} sheet not found`);

    const checked = validateEntry_(params, readLists_(ss));
    if (checked.error) return fail_(checked.error);
    const entry = checked.row;

    // One write at a time: two quick submissions must not land on the same row
    if (!lock.tryLock(15000)) return fail_('Sheet is busy, try again');

    // Make sure every expected header exists; add ID / Entered At at the end if missing
    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const idx = headerIndex_(headers);
    const missing = Object.keys(COLUMNS).filter(k => !(COLUMNS[k] in idx));
    const notAuto = missing.filter(k => !AUTO_COLUMNS.includes(k));
    if (notAuto.length) {
      return fail_(`Records sheet is missing column(s): ${notAuto.map(k => COLUMNS[k]).join(', ')}`);
    }
    let width = headers.length;
    missing.forEach(k => {
      width += 1;
      sheet.getRange(1, width).setValue(COLUMNS[k]);
      idx[COLUMNS[k]] = width - 1;
    });

    const lastRow = sheet.getLastRow();

    // Skip a repeat of an id we already saved (the Shortcut retried after a timeout)
    if (entry.id && lastRow > 1) {
      const idCol = idx[COLUMNS.id] + 1;
      const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
      const pos = ids.findIndex(r => String(r[0]) === entry.id);
      if (pos !== -1) return json_({ success: true, duplicate: true, row: pos + 2 });
    }

    const values = new Array(width).fill('');
    const toWrite = Object.assign({}, entry, { enteredAt: new Date() });
    Object.keys(COLUMNS).forEach(k => { values[idx[COLUMNS[k]]] = toWrite[k]; });

    const newRow = lastRow + 1;
    sheet.getRange(newRow, 1, 1, width).setValues([values]);
    if (lastRow > 1) {
      // Keep the dropdowns and number/date formats of the row above
      sheet.getRange(lastRow, 1, 1, width).copyTo(
        sheet.getRange(newRow, 1, 1, width), SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
      sheet.getRange(lastRow, 1, 1, width).copyTo(
        sheet.getRange(newRow, 1, 1, width), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    }
    SpreadsheetApp.flush();

    return json_({ success: true, row: newRow });
  } catch (err) {
    return fail_(String(err));
  } finally {
    lock.releaseLock();
  }
}
