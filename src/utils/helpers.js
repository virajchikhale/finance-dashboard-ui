export const toNum = (v) => {
  if (v === '' || v === null || v === undefined) return 0;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
};

export const toNumOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? null : n;
};

// ── TRANSACTION TYPES ───────────────────────────────────────────────────────
export const TX_TYPES = ['Credit', 'Debit', 'Transfer', 'Owes', 'Owed', 'Settled'];
// Owes / Owed / Settled track money between you and friends, not income or expense
export const FRIEND_TYPES = new Set(['Owes', 'Owed', 'Settled']);
// Old spellings from rows entered before Nov 2026
const LEGACY_TYPES = { Transferd: 'Transfer', Setteled: 'Settled' };
export const normalizeType = (t) => LEGACY_TYPES[t] || t;

// Rows that set a starting balance: they count toward balances, not toward income or spending
export const OPENING_CATEGORY = 'Opening Balance';
export const isOpeningBalance = (r) => r.Category === OPENING_CATEGORY;

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const parseSheetDate = (val) => {
  if (!val) return { month: '', day: 0, year: 2025 };
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const parts = val.slice(5, -1).split(',').map(Number);
    return { month: MONTH_NAMES[parts[1]] || '', day: parts[2] || 0, year: parts[0] || 2025 };
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) return { month: MONTH_NAMES[d.getMonth()] || '', day: d.getDate(), year: d.getFullYear() };
  return { month: '', day: 0, year: 2025 };
};

// ── SECURITY UTILITIES ──────────────────────────────────────────────────────
const XOR_KEY = 0x5A;

export const obfuscate = (str) => {
  if (!str) return '';
  const xored = Array.from(str).map(c => String.fromCharCode(c.charCodeAt(0) ^ XOR_KEY)).join('');
  return btoa(xored);
};

export const deobfuscate = (str) => {
  if (!str) return '';
  try {
    const decoded = atob(str);
    return Array.from(decoded).map(c => String.fromCharCode(c.charCodeAt(0) ^ XOR_KEY)).join('');
  } catch {
    return str; // fallback: return as-is if not obfuscated (migration)
  }
};

export const isValidScriptUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    // Exact hosts only: an endsWith() check would also accept look-alikes such as "evilscript.google.com"
    return parsed.protocol === 'https:' && (
      parsed.hostname === 'script.google.com' ||
      parsed.hostname === 'script.googleusercontent.com'
    );
  } catch {
    return false;
  }
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '');
};

// ── MONEY ───────────────────────────────────────────────────────────────────
const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
// ₹1,23,456 (no sign)
export const inr = (n) => `₹${INR.format(Math.abs(Math.round(n || 0)))}`;
// +₹1,234 / −₹1,234 (true minus sign)
export const inrSigned = (n) => `${n < 0 ? '−' : n > 0 ? '+' : ''}${inr(n)}`;
// Short axis labels: ₹950, ₹12k, ₹1.2L
export const inrShort = (n) => {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 100000) return `${sign}₹${(a / 100000).toFixed(a >= 1000000 ? 0 : 1)}L`;
  if (a >= 1000) return `${sign}₹${Math.round(a / 1000)}k`;
  return `${sign}₹${Math.round(a)}`;
};
