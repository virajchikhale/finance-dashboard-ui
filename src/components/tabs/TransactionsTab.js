import React, { useState, useMemo } from 'react';
import { inr } from '../../utils/helpers';
import { formatDay } from '../../utils/insights';
import { useMoney } from '../../privacy';
import Icon from '../Icon';

const COLUMNS = [
  { key: 'DateISO', label: 'Date' },
  { key: 'Description', label: 'Description' },
  { key: 'Category', label: 'Category' },
  { key: 'Account Name', label: 'Account' },
  { key: 'Transaction Type', label: 'Type' },
  { key: 'Name', label: 'Person' },
  { key: 'Amount', label: 'Amount', align: 'right' },
];

// Columns that can be empty for every row; they are dropped when they are
const OPTIONAL = ['Category', 'Account Name', 'Name'];
const DRILL = { Category: 'category', 'Account Name': 'account', Name: 'person' };

// How each type reads from your point of view
const SIGN = { Credit: '+', Debit: '−', Owes: '+', Owed: '−' };
const TONE = { Credit: 'pos', Owes: 'pos' };
const amountText = (r) => `${SIGN[r['Transaction Type']] || ''}${inr(r.Amount)}`;
const typeText = (r) => (r['Transaction Type'] === 'Transfer' && r['To Account'] ? `Transfer → ${r['To Account']}` : r['Transaction Type']);

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const TransactionsTab = ({ filtered, balances, balanceAccount, onDrill }) => {
  const [sort, setSort] = useState({ key: 'DateISO', dir: 'desc' });
  const money = useMoney();

  const sorted = useMemo(() => {
    const { key, dir } = sort;
    const mul = dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let va = a[key] ?? '', vb = b[key] ?? '';
      if (key === 'Amount') { va = Number(va); vb = Number(vb); } else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      return va < vb ? -mul : va > vb ? mul : 0;
    });
  }, [filtered, sort]);

  const columns = useMemo(() => {
    const cols = COLUMNS.filter(c => !OPTIONAL.includes(c.key) || filtered.some(r => r[c.key]));
    return balances ? [...cols, { key: 'Balance', label: `${balanceAccount} balance`, align: 'right', noSort: true }] : cols;
  }, [filtered, balances, balanceAccount]);

  // A cell value you can click to filter by it
  const cell = (r, key) => {
    const v = r[key];
    if (!v) return '—';
    return <button type="button" className="link-btn" title={`Show only ${v}`} onClick={() => onDrill(DRILL[key], v)}>{v}</button>;
  };
  const balanceText = (r) => (balances?.has(r) ? money.inrSigned(balances.get(r)).replace('+', '') : '—');

  const onSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));

  const exportCSV = () => {
    const head = ['Date', 'Description', 'Name', 'Amount', 'Transaction Type', 'Category', 'Account Name', 'To Account'];
    const rows = sorted.map(r => [r.DateISO, r.Description, r.Name, r.Amount, r['Transaction Type'], r.Category, r['Account Name'], r['To Account']]);
    const csv = [head, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: '16px 20px 0' }}>
        <h2 className="card-title">Transactions <span className="muted num" style={{ fontWeight: 400 }}>{filtered.length}</span></h2>
        <button type="button" className="btn" onClick={exportCSV}><Icon name="download" /><span className="btn-label">Export CSV</span></button>
      </div>

      {sorted.length === 0 && <p className="state">No transactions match the filters.</p>}

      {/* Desktop and tablet: sortable table */}
      {sorted.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.key} style={c.align ? { textAlign: c.align } : undefined}
                    aria-sort={c.noSort ? undefined : sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    {c.noSort ? c.label : (
                      <button type="button" onClick={() => onSort(c.key)}>
                        {c.label}{sort.key === c.key && <span aria-hidden="true">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={i}>
                  {columns.map(c => {
                    switch (c.key) {
                      case 'DateISO': return <td key={c.key} className="num" style={{ whiteSpace: 'nowrap' }}>{formatDay(r.DateISO)}</td>;
                      case 'Description': return <td key={c.key} className="clip">{r.Description || '—'}</td>;
                      case 'Transaction Type': return <td key={c.key} className="muted" style={{ whiteSpace: 'nowrap' }}>{typeText(r)}</td>;
                      case 'Amount': return <td key={c.key} className={`amount ${TONE[r['Transaction Type']] || ''}`}>{amountText(r)}</td>;
                      case 'Balance': return <td key={c.key} className="amount muted">{balanceText(r)}</td>;
                      default: return <td key={c.key} className={c.key === 'Account Name' ? '' : 'muted'}>{cell(r, c.key)}</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Phones: one line per entry */}
      {sorted.length > 0 && (
        <ul className="rows tx-list" style={{ padding: '4px 16px 8px' }}>
          {sorted.map((r, i) => (
            <li key={i} className="row">
              <div className="row-main">
                <div className="row-title">{r.Description || '—'}</div>
                <div className="row-sub">{[formatDay(r.DateISO), r['Account Name'], r.Category, r.Name].filter(Boolean).join(' · ')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`row-value num ${TONE[r['Transaction Type']] || ''}`}>{amountText(r)}</div>
                <div className="row-sub">{typeText(r)}</div>
                {balances?.has(r) && <div className="row-sub">Bal {balanceText(r)}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TransactionsTab;
