import React, { useState, useMemo } from 'react';
import { PALETTE, fmtFull } from '../../utils/helpers';

const COLUMNS = [
  { key: 'Month', label: 'Month' },
  { key: 'Date', label: 'Date' },
  { key: 'Description', label: 'Description' },
  { key: 'Name', label: 'Name' },
  { key: 'Amount', label: 'Amount' },
  { key: 'Transaction Type', label: 'Type' },
  { key: 'Category', label: 'Category' },
  { key: 'Account Name', label: 'Account' },
  { key: 'To Account', label: 'To Account' },
];

const MONTH_ORDER = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };

const TYPE_COLOR = {
  Credit: PALETTE.green,
  Debit: PALETTE.red,
  Transfer: PALETTE.yellow,
  Owes: PALETTE.accent,
  Owed: PALETTE.accentAlt,
  Settled: PALETTE.muted,
};

const TYPE_PREFIX = {
  Credit: '+',
  Debit: '-',
  Transfer: '⇄',
  Owes: '+',   // friend owes you — positive for you
  Owed: '-',   // you owe friend — negative for you
  Settled: '✓',
};

const TransactionsTab = ({ filtered }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'Month') { va = MONTH_ORDER[va] || 99; vb = MONTH_ORDER[vb] || 99; }
      if (sortKey === 'Amount' || sortKey === 'Date') { va = Number(va) || 0; vb = Number(vb) || 0; }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const exportCSV = () => {
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(r => COLUMNS.map(c => {
      const val = r[c.key];
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val ?? '';
    }));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${PALETTE.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.white }}>📋 All Transactions</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: PALETTE.muted }}>{filtered.length} records</div>
          <button onClick={exportCSV} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: `${PALETTE.accent}22`, border: `1px solid ${PALETTE.accent}44`,
            color: PALETTE.accent, transition: 'all 0.2s'
          }}>📥 Export CSV</button>
        </div>
      </div>
      <div className="table-container" style={{ maxHeight: 560, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ background: PALETTE.surface }}>
              {COLUMNS.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={{
                  padding: '10px 14px', textAlign: 'left', color: sortKey === c.key ? PALETTE.accent : PALETTE.muted,
                  fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  whiteSpace: 'nowrap', borderBottom: `1px solid ${PALETTE.border}`, cursor: 'pointer',
                  userSelect: 'none', transition: 'color 0.15s'
                }}>
                  {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const txType = r['Transaction Type'];
              const typeColor = TYPE_COLOR[txType] || PALETTE.muted;
              const prefix = TYPE_PREFIX[txType] || '';
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${PALETTE.border}22`, background: i % 2 === 0 ? 'transparent' : `${PALETTE.surface}44` }}>
                  <td style={{ padding: '8px 14px', color: PALETTE.accent, fontWeight: 700 }}>{r.Month}</td>
                  <td style={{ padding: '8px 14px', color: PALETTE.muted }}>{r.Date || '–'}</td>
                  <td style={{ padding: '8px 14px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.Description || '–'}</td>
                  <td style={{ padding: '8px 14px', color: PALETTE.accentAlt }}>{r.Name || '–'}</td>
                  <td style={{ padding: '8px 14px', fontFamily: 'monospace', fontWeight: 700, color: typeColor }}>{prefix}{fmtFull(r.Amount)}</td>
                  <td style={{ padding: '8px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${typeColor}22`, color: typeColor }}>{txType}</span>
                  </td>
                  <td style={{ padding: '8px 14px', color: PALETTE.muted, fontSize: 11 }}>{r.Category || '–'}</td>
                  <td style={{ padding: '8px 14px', color: PALETTE.yellow, fontWeight: 600 }}>{r['Account Name'] || '–'}</td>
                  <td style={{ padding: '8px 14px', color: PALETTE.muted }}>{r['To Account'] || '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTab;
