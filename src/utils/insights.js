// Pure calculations behind the dashboard. Nothing here touches React, so it is easy to test.
import { MONTH_NAMES, FRIEND_TYPES, isOpeningBalance } from './helpers';

// ── months ───────────────────────────────────────────────────────────────────
// Months are keyed "YYYY-MM" so November 2026 and November 2027 never merge.
export const monthKey = (year, monthIndex) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
export const monthKeyOf = (date) => monthKey(date.getFullYear(), date.getMonth());
export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
};
export const monthShort = (key) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ’${String(y).slice(2)}`;
};
export const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const formatDay = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
};

// The month keys a preset covers, counted back from `today`
export function presetMonths(preset, today, available) {
  if (preset === 'all') return [...available];
  if (preset === 'thisYear') return available.filter(k => k.startsWith(`${today.getFullYear()}-`));
  const count = { thisMonth: 1, last3: 3, last6: 6 }[preset];
  if (!count) return [...available];
  const keys = [];
  for (let i = 0; i < count; i++) keys.push(monthKeyOf(new Date(today.getFullYear(), today.getMonth() - i, 1)));
  return available.filter(k => keys.includes(k));
}

// ── row kinds ────────────────────────────────────────────────────────────────
const typeOf = (r) => r['Transaction Type'];
export const isSpending = (r) => typeOf(r) === 'Debit' && !isOpeningBalance(r);
export const isIncome = (r) => typeOf(r) === 'Credit' && !isOpeningBalance(r);
export const sum = (rows) => rows.reduce((s, r) => s + r.Amount, 0);

// Credit cards and pay-later accounts: money owed, not money held.
// Default guess from the name (…CC, …PL); the user can change the list in Settings.
export const looksLikeCredit = (name) => /cc$/i.test(name) || /pl$/i.test(name);

// ── period totals ────────────────────────────────────────────────────────────
export function periodTotals(rows) {
  const income = sum(rows.filter(isIncome));
  const spending = sum(rows.filter(isSpending));
  const net = income - spending;
  return { income, spending, net, savingsRate: income > 0 ? (net / income) * 100 : null };
}

export function monthlySeries(rows, keys) {
  return keys.map(key => {
    const inMonth = rows.filter(r => r.MonthKey === key);
    return { key, label: monthShort(key), Income: sum(inMonth.filter(isIncome)), Spending: sum(inMonth.filter(isSpending)) };
  });
}

// Top categories by spending; the tail folds into one row so the chart stays readable
export function categoryBreakdown(rows, limit = 7) {
  const map = {};
  rows.filter(isSpending).forEach(r => { const c = r.Category || 'Uncategorised'; map[c] = (map[c] || 0) + r.Amount; });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  if (sorted.length <= limit) return sorted;
  const rest = sorted.slice(limit - 1);
  return [...sorted.slice(0, limit - 1), { name: `${rest.length} more categories`, value: rest.reduce((s, r) => s + r.value, 0) }];
}

// Share of spending that sits in "Other" or has no category
export function unclassifiedShare(rows) {
  const spend = rows.filter(isSpending);
  const total = sum(spend);
  if (!total) return { share: 0, amount: 0, count: 0 };
  const loose = spend.filter(r => !r.Category || r.Category.toLowerCase() === 'other');
  return { share: sum(loose) / total, amount: sum(loose), count: loose.length };
}

export function spendingByAccount(rows) {
  const map = {};
  rows.filter(isSpending).forEach(r => { if (r['Account Name']) map[r['Account Name']] = (map[r['Account Name']] || 0) + r.Amount; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

// Money moved between your own accounts: neither income nor spending
export function transferSummary(rows) {
  const moves = rows.filter(r => typeOf(r) === 'Transfer');
  const map = {};
  moves.forEach(r => {
    const k = `${r['Account Name']}→${r['To Account'] || '?'}`;
    if (!map[k]) map[k] = { from: r['Account Name'], to: r['To Account'] || '—', amount: 0, count: 0 };
    map[k].amount += r.Amount; map[k].count += 1;
  });
  return { total: sum(moves), count: moves.length, routes: Object.values(map).sort((a, b) => b.amount - a.amount) };
}

// Same description in 2+ months: likely a subscription or fixed cost
export function recurringSpending(rows, limit = 6) {
  const map = {};
  rows.filter(r => isSpending(r) && r.Description).forEach(r => {
    const k = r.Description.toLowerCase().trim();
    if (!map[k]) map[k] = { description: r.Description, months: new Set(), total: 0 };
    map[k].months.add(r.MonthKey); map[k].total += r.Amount;
  });
  return Object.values(map).filter(d => d.months.size >= 2).sort((a, b) => b.total - a.total).slice(0, limit)
    .map(d => ({ description: d.description, monthCount: d.months.size, total: d.total }));
}

// ── this month ───────────────────────────────────────────────────────────────
export function thisMonth(records, today, budget, fixedMonthly = 0) {
  const key = monthKeyOf(today);
  const spend = records.filter(r => r.MonthKey === key && isSpending(r));
  const spent = sum(spend);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const day = today.getDate();
  const dailyAvg = spent / day;
  const projected = dailyAvg * daysInMonth;
  return {
    key, spent, count: spend.length, day, daysInMonth, dailyAvg, projected, fixedMonthly,
    budget, budgetLeft: budget > 0 ? budget - spent : null,
    budgetUsed: budget > 0 ? spent / budget : null,
    projectedOver: budget > 0 ? projected > budget : false,
  };
}

// ── balances ─────────────────────────────────────────────────────────────────
// Balance and last entry date per account, from every row (filters do not apply to balances)
export function accountBalances(records) {
  const acc = {};
  const touch = (name, date) => {
    if (!acc[name]) acc[name] = { name, balance: 0, lastDate: '' };
    if (date && date > acc[name].lastDate) acc[name].lastDate = date;
    return acc[name];
  };
  records.forEach(r => {
    const name = r['Account Name'];
    if (!name) return;
    const a = touch(name, r.DateISO);
    switch (typeOf(r)) {
      case 'Credit': a.balance += r.Amount; break;
      case 'Debit': a.balance -= r.Amount; break;
      case 'Transfer':
        a.balance -= r.Amount;
        if (r['To Account']) touch(r['To Account'], r.DateISO).balance += r.Amount;
        break;
      case 'Owed': a.balance -= r.Amount; break; // you paid on a friend's behalf
      case 'Owes': a.balance += r.Amount; break; // a friend paid you
      default: break;                            // Settled moves no money
    }
  });
  return Object.values(acc);
}

export function friendBalances(records) {
  const map = {};
  records.filter(r => FRIEND_TYPES.has(typeOf(r)) && r.Name).forEach(r => {
    if (!(r.Name in map)) map[r.Name] = 0;
    if (typeOf(r) === 'Owes') map[r.Name] += r.Amount;      // friend owes you
    else if (typeOf(r) === 'Owed') map[r.Name] -= r.Amount; // you owe friend
  });
  return Object.entries(map)
    .map(([name, balance]) => ({ name, balance, status: balance > 0 ? 'owes-you' : balance < 0 ? 'you-owe' : 'settled' }))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
}

export function netWorth(balances, creditAccounts, friendsNet) {
  const isCredit = (a) => creditAccounts.includes(a.name);
  const bank = balances.filter(a => !isCredit(a)).sort((a, b) => b.balance - a.balance);
  const credit = balances.filter(isCredit).sort((a, b) => a.balance - b.balance);
  const cash = bank.reduce((s, a) => s + a.balance, 0);
  const creditNet = credit.reduce((s, a) => s + a.balance, 0); // negative = owed to the card
  return { bank, credit, cash, dues: Math.max(0, -creditNet), creditNet, friendsNet, total: cash + creditNet + friendsNet };
}

export function daysSince(iso, today) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((start - new Date(y, m - 1, d)) / 86400000);
}
