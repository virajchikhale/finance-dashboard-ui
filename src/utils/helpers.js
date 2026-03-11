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

export const PALETTE = {
  bg: '#0f1117', surface: '#1a1d27', card: '#1e2130',
  border: '#2a2e42', accent: '#6c63ff', accentAlt: '#ff6b9d',
  green: '#00d4aa', red: '#ff4f6b', yellow: '#ffc542',
  text: '#e2e8f0', muted: '#64748b', white: '#ffffff'
};

export const CAT_COLORS = ['#6c63ff','#ff6b9d','#00d4aa','#ffc542','#ff4f6b','#4ecdc4','#45b7d1','#f7dc6f','#82e0aa','#f1948a','#85c1e9','#c39bd3','#f0b27a','#a9cce3','#a3e4d7','#fad7a0','#d2b4de'];

export const fmt = (n) => n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;
export const fmtFull = (n) => `₹${Math.abs(n).toLocaleString('en-IN')}`;
