import { render, screen, act } from '@testing-library/react';
import App from './App';
import { obfuscate } from './utils/helpers';
import {
  monthKey, monthLabel, presetMonths, periodTotals, categoryBreakdown, unclassifiedShare, transferSummary,
  thisMonth, accountBalances, runningBalances, friendBalances, netWorth, looksLikeCredit, daysSince,
} from './utils/insights';

// Minimal rows in the shape useSheetData produces
const row = (date, type, amount, extra = {}) => ({
  DateISO: date, MonthKey: date.slice(0, 7), Description: extra.Description || 'x', Name: '', Category: '',
  'Account Name': 'SBI', 'To Account': '', Amount: amount, 'Transaction Type': type, ...extra,
});

const rows = [
  row('2026-11-01', 'Credit', 77453, { Category: 'Opening Balance' }),
  row('2026-11-01', 'Credit', 1000, { 'Account Name': 'ICICICC', Category: 'Opening Balance' }),
  row('2026-11-01', 'Debit', 52404, { 'Account Name': 'ICICICC', Category: 'Other' }),
  row('2026-11-02', 'Debit', 6815, { 'Account Name': 'ICICICC', Category: 'Clothing & Shopping' }),
  row('2026-11-02', 'Transfer', 5000, { 'To Account': 'HDFC' }),
  row('2026-11-02', 'Credit', 205, { Category: 'Other' }),
  row('2026-11-03', 'Owed', 900, { Name: 'Mama' }),
  row('2026-11-03', 'Owes', 300, { Name: 'Rohan', 'Account Name': '', Category: 'Opening Balance' }),
  row('2027-11-05', 'Debit', 10, { Category: 'Trip' }),
];

describe('months', () => {
  test('keys keep years apart', () => {
    expect(monthKey(2026, 10)).toBe('2026-11');
    expect(monthLabel('2027-11')).toBe('Nov 2027');
    const keys = [...new Set(rows.map(r => r.MonthKey))];
    expect(keys).toEqual(['2026-11', '2027-11']);
  });

  test('presets count back from today, including the year', () => {
    const avail = ['2025-12', '2026-01', '2026-02', '2026-11'];
    expect(presetMonths('last3', new Date(2026, 1, 10), avail)).toEqual(['2025-12', '2026-01', '2026-02']);
    expect(presetMonths('thisYear', new Date(2026, 1, 10), avail)).toEqual(['2026-01', '2026-02', '2026-11']);
    expect(presetMonths('thisMonth', new Date(2026, 10, 2), avail)).toEqual(['2026-11']);
  });
});

describe('totals', () => {
  test('opening balances and transfers are neither income nor spending', () => {
    const t = periodTotals(rows.filter(r => r.MonthKey === '2026-11'));
    expect(t.income).toBe(205);
    expect(t.spending).toBe(52404 + 6815);
  });

  test('categories fold their tail and flag a large "Other" share', () => {
    const many = Array.from({ length: 10 }, (_, i) => row('2026-11-01', 'Debit', 10 - i, { Category: `C${i}` }));
    const out = categoryBreakdown(many, 5);
    expect(out).toHaveLength(5);
    expect(out[4].name).toBe('6 more categories');
    expect(unclassifiedShare(rows).share).toBeGreaterThan(0.8);
  });

  test('transfers are summarised by route', () => {
    expect(transferSummary(rows)).toMatchObject({ total: 5000, count: 1, routes: [{ from: 'SBI', to: 'HDFC', amount: 5000 }] });
  });
});

describe('this month', () => {
  test('daily average, projection and budget', () => {
    const m = thisMonth(rows, new Date(2026, 10, 2), 60000);
    expect(m.spent).toBe(59219);
    expect(m.dailyAvg).toBeCloseTo(29609.5);
    expect(m.projected).toBeCloseTo(29609.5 * 30);
    expect(m.budgetLeft).toBe(781);
    expect(m.projectedOver).toBe(true);
  });
});

describe('balances and net worth', () => {
  const balances = accountBalances(rows.filter(r => r.MonthKey === '2026-11'));
  const by = Object.fromEntries(balances.map(b => [b.name, b]));

  test('per account, with the last entry date', () => {
    expect(by.SBI.balance).toBe(77453 - 5000 + 205 - 900);
    expect(by.HDFC.balance).toBe(5000);
    expect(by.ICICICC.balance).toBe(1000 - 52404 - 6815);
    expect(by.SBI.lastDate).toBe('2026-11-03');
  });

  test('running balance ends at the account balance', () => {
    const nov = rows.filter(r => r.MonthKey === '2026-11');
    ['SBI', 'HDFC', 'ICICICC'].forEach(name => {
      const run = runningBalances(nov, name);
      const ordered = nov.filter(r => run.has(r)).sort((a, b) => (a.DateISO < b.DateISO ? -1 : a.DateISO > b.DateISO ? 1 : 0));
      expect(run.get(ordered[ordered.length - 1])).toBe(by[name].balance);
    });
    expect(runningBalances(nov, 'SBI').get(nov[0])).toBe(77453); // first row: just the opening balance
  });

  test('cards are dues, friends add to net worth', () => {
    const friends = friendBalances(rows);
    expect(friends.find(f => f.name === 'Mama')).toMatchObject({ balance: 900, status: 'owes-you' }); // you paid for Mama
    expect(friends.find(f => f.name === 'Rohan')).toMatchObject({ balance: -300, status: 'you-owe' });
    const credit = ['ICICICC'].filter(looksLikeCredit);
    const w = netWorth(balances, credit, -600);
    expect(w.dues).toBe(58219);
    expect(w.cash).toBe(by.SBI.balance + 5000);
    expect(w.total).toBe(w.cash - 58219 - 600);
  });

  test('paying for a friend moves value, it does not change net worth', () => {
    const before = [row('2026-11-01', 'Credit', 1000, { Category: 'Opening Balance' })];
    const after = [...before, row('2026-11-02', 'Owed', 400, { Name: 'Mama' })];
    const worthOf = (rs) => netWorth(accountBalances(rs), [], friendBalances(rs).reduce((s, f) => s + f.balance, 0)).total;
    expect(worthOf(after)).toBe(worthOf(before));
  });

  test('credit accounts are guessed from the name', () => {
    expect(['ICICICC', 'HDFCCC', 'AmazonPL', 'SBI', 'Cash'].filter(looksLikeCredit)).toEqual(['ICICICC', 'HDFCCC', 'AmazonPL']);
    expect(daysSince('2026-10-20', new Date(2026, 10, 2, 15))).toBe(13);
  });
});

test('dashboard renders the main sections from sheet data', async () => {
  localStorage.setItem('sheetUrl', obfuscate('https://script.google.com/macros/s/x/exec?key=k'));
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      Records: [
        { Date: '2026-11-01T00:00:00.000Z', Description: 'Opening', Amount: '77,453', 'Transaction Type': 'Credit', Category: 'Opening Balance', 'Account Name': 'SBI' },
        { Date: '2026-11-02T00:00:00.000Z', Description: 'Snitch shopping', Amount: 6815, 'Transaction Type': 'Debit', Category: 'Other', 'Account Name': 'ICICICC' },
        { Date: '2026-11-02T00:00:00.000Z', Description: 'Rent', Amount: 6000, 'Transaction Type': 'Transferd', 'Account Name': 'SBI', 'To Account': 'HDFC' },
      ],
      Instalments: [{ Category: 'LIC', Annually: 12000, Monthly: 1000, Daily: 33 }],
    }),
  }));
  await act(async () => { render(<App />); });
  expect(await screen.findByText('Net worth')).toBeInTheDocument();
  expect(screen.getByText('Card and pay-later dues')).toBeInTheDocument();
  expect(screen.getByText('Moved between accounts')).toBeInTheDocument();
  expect(screen.getByText(/is under “Other”/)).toBeInTheDocument();
  expect(screen.getByText('Fixed commitments')).toBeInTheDocument();
  localStorage.clear();
});
