// Runs apps-script/Code.gs (the Apps Script) against an in-memory fake sheet, so the write API can be tested without Google.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { normalizeType, isOpeningBalance } from './utils/helpers';

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
const KEY = 'test-key-0123456789abcdef';

function fakeSheet(rows) {
  const data = rows.map(r => r.slice());
  const width = () => Math.max(0, ...data.map(r => r.length));
  const range = (row, col, nr = 1, nc = 1) => ({
    getValues: () => Array.from({ length: nr }, (_, i) =>
      Array.from({ length: nc }, (_, j) => (data[row - 1 + i] || [])[col - 1 + j] ?? '')),
    setValues: (vals) => vals.forEach((v, i) => v.forEach((x, j) => {
      while (data.length < row + i) data.push([]);
      data[row - 1 + i][col - 1 + j] = x;
    })),
    setValue: (x) => { while (data.length < row) data.push([]); data[row - 1][col - 1] = x; },
    copyTo: () => {},
  });
  return {
    data,
    getLastRow: () => data.length,
    getLastColumn: width,
    getRange: range,
    getDataRange: () => range(1, 1, data.length, width()),
  };
}

function load(sheets, { apiKey = KEY } = {}) {
  const book = {
    Records: fakeSheet([['Date', 'Description', 'Name', 'Amount', 'Transaction Type', 'Category', 'Account Name', 'To Account']]),
    Dropdowns: fakeSheet([
      ['Category', 'Bank Accounts', 'Friends', 'Category'], // duplicate empty "Category", as in the real sheet
      ['Rent & Housing', 'SBI', 'Mama', ''],
      ['Trip', 'HDFCCC', 'Rohan', ''],
    ]),
    ...sheets,
  };
  const ctx = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: n => book[n] || null }),
      CopyPasteType: { PASTE_DATA_VALIDATION: 1, PASTE_FORMAT: 2 },
      flush: () => {},
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => apiKey }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (t) => ({ setMimeType: () => JSON.parse(t) }),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(SOURCE, ctx);
  const post = (fields) => ctx.doPost({ parameter: { key: KEY, ...fields } });
  const get = (params) => ctx.doGet({ parameter: { key: KEY, ...params } });
  return { book, post, get, ctx };
}

const debit = { date: '2026-11-01', description: 'Lunch', amount: '1,250', transactionType: 'Debit', category: 'Trip', accountName: 'SBI' };

describe('Code.gs doPost', () => {
  test('appends a row by header name, with real Date and number values', () => {
    const { book, post } = load();
    expect(post(debit)).toEqual({ success: true, row: 2 });
    const [headers, row] = book.Records.data;
    expect(headers.slice(8)).toEqual(['ID', 'Entered At']);
    expect(row[0]).toEqual(new Date(2026, 10, 1));
    expect(row[3]).toBe(1250);
    expect(row[4]).toBe('Debit');
  });

  test('still accepts the MM/dd/yyyy date the current Shortcut sends', () => {
    const { book, post } = load();
    post({ ...debit, date: '11/01/2026' });
    expect(book.Records.data[1][0]).toEqual(new Date(2026, 10, 1));
  });

  test('rejects a wrong key and a missing server key', () => {
    expect(load().ctx.doPost({ parameter: { ...debit, key: 'nope' } }).error).toBe('Unauthorized');
    expect(load({}, { apiKey: '' }).post(debit).error).toMatch(/not configured/);
  });

  test('does not block credit card spending (no balance check)', () => {
    expect(load().post({ ...debit, accountName: 'HDFCCC', amount: '999999' }).success).toBe(true);
  });

  test.each([
    [{ amount: '-5' }, /positive/],
    [{ amount: 'abc' }, /positive/],
    [{ date: '2026-02-31' }, /Invalid date/],
    [{ transactionType: 'Expense' }, /Invalid transactionType/],
    [{ category: 'Nope' }, /Unknown category/],
    [{ category: '' }, /required for Debit/],
    [{ accountName: 'Nope' }, /Unknown account/],
    [{ accountName: '' }, /accountName/],
    [{ description: ' ' }, /description/],
  ])('rejects %p', (change, msg) => {
    const res = load().post({ ...debit, ...change });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(msg);
  });

  test('transfers need a different, known target account', () => {
    const t = { ...debit, transactionType: 'Transfer', category: '' };
    expect(load().post(t).error).toMatch(/toAccount is required/);
    expect(load().post({ ...t, toAccount: 'SBI' }).error).toMatch(/different/);
    expect(load().post({ ...t, toAccount: 'HDFCCC' }).success).toBe(true);
  });

  test('old spellings are saved under the new names', () => {
    const { book, post } = load();
    post({ ...debit, transactionType: 'Transferd', toAccount: 'HDFCCC' });
    expect(book.Records.data[1][4]).toBe('Transfer');
  });

  test('friend types need a known friend', () => {
    const owes = { ...debit, transactionType: 'Owes', category: '' };
    expect(load().post(owes).error).toMatch(/name is required/);
    expect(load().post({ ...owes, name: 'Stranger' }).error).toMatch(/Unknown friend/);
    expect(load().post({ ...owes, name: 'Mama' }).success).toBe(true);
  });

  test('a friend opening balance needs no account, a normal friend row does', () => {
    const opening = { ...debit, transactionType: 'Owed', name: 'Mama', category: 'Opening Balance', accountName: '' };
    expect(load().post(opening).success).toBe(true);
    expect(load().post({ ...opening, category: '' }).error).toMatch(/accountName/);
  });

  test('a repeated id is saved once', () => {
    const { book, post } = load();
    expect(post({ ...debit, id: 'abc-1' })).toEqual({ success: true, row: 2 });
    expect(post({ ...debit, id: 'abc-1' })).toEqual({ success: true, duplicate: true, row: 2 });
    expect(book.Records.data).toHaveLength(2);
  });

  test('accepts a JSON body', () => {
    const { ctx } = load();
    const res = ctx.doPost({ parameter: { key: KEY }, postData: { type: 'application/json', contents: JSON.stringify(debit) } });
    expect(res.success).toBe(true);
  });
});

describe('Code.gs doGet', () => {
  test('lists come from Dropdowns, ignoring the duplicate empty Category column', () => {
    expect(load().get({ action: 'lists' })).toEqual({
      categories: ['Rent & Housing', 'Trip'],
      accounts: ['SBI', 'HDFCCC'],
      friends: ['Mama', 'Rohan'],
      types: ['Credit', 'Debit', 'Transfer', 'Owes', 'Owed', 'Settled'],
    });
  });

  test('lists put the most recently used items first', () => {
    const { post, get } = load();
    post({ date: '2026-01-01', description: 'a', amount: '1', transactionType: 'Owes', name: 'Rohan', category: 'Trip', accountName: 'SBI' });
    post({ date: '2026-01-02', description: 'b', amount: '1', transactionType: 'Transfer', accountName: 'SBI', toAccount: 'HDFCCC' });
    post({ date: '2026-01-03', description: 'c', amount: '1', transactionType: 'Debit', category: 'Rent & Housing', accountName: 'SBI' });
    expect(get({ action: 'lists' })).toMatchObject({
      categories: ['Rent & Housing', 'Trip'],
      accounts: ['SBI', 'HDFCCC'],
      friends: ['Rohan', 'Mama'], // Mama is unused, so it goes after Rohan
    });
    post({ date: '2026-01-04', description: 'd', amount: '1', transactionType: 'Debit', category: 'Trip', accountName: 'HDFCCC' });
    expect(get({ action: 'lists' })).toMatchObject({ categories: ['Trip', 'Rent & Housing'], accounts: ['HDFCCC', 'SBI'] });
  });

  test('sheet dump keeps the first of two same-named columns', () => {
    expect(load().get({}).Dropdowns[0].Category).toBe('Rent & Housing');
  });
});

describe('type helpers', () => {
  test('old spellings map to new ones', () => {
    expect(normalizeType('Transferd')).toBe('Transfer');
    expect(normalizeType('Setteled')).toBe('Settled');
    expect(normalizeType('Debit')).toBe('Debit');
  });
  test('opening balance rows are recognised by category', () => {
    expect(isOpeningBalance({ Category: 'Opening Balance' })).toBe(true);
    expect(isOpeningBalance({ Category: 'Trip' })).toBe(false);
  });
});
