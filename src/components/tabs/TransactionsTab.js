import React from 'react';
import { PALETTE, fmtFull } from '../../utils/helpers';

const TransactionsTab = ({ filtered }) => (
  <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, overflow: 'hidden' }}>
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${PALETTE.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.white }}>📋 All Transactions</div>
      <div style={{ fontSize: 11, color: PALETTE.muted }}>{filtered.length} records</div>
    </div>
    <div className="table-container" style={{ maxHeight: 560, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <tr style={{ background: PALETTE.surface }}>
            {['Month','Date','Description','Name','Amount','Type','Category','Account','To Account'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: PALETTE.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: `1px solid ${PALETTE.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => {
            const typeColor = r['Transaction Type'] === 'Credit' ? PALETTE.green : r['Transaction Type'] === 'Debit' ? PALETTE.red : PALETTE.yellow;
            return (
              <tr key={i} style={{ borderBottom: `1px solid ${PALETTE.border}22`, background: i % 2 === 0 ? 'transparent' : `${PALETTE.surface}44` }}>
                <td style={{ padding: '8px 14px', color: PALETTE.accent, fontWeight: 700 }}>{r.Month}</td>
                <td style={{ padding: '8px 14px', color: PALETTE.muted }}>{r.Date || '–'}</td>
                <td style={{ padding: '8px 14px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.Description || '–'}</td>
                <td style={{ padding: '8px 14px', color: PALETTE.accentAlt }}>{r.Name || '–'}</td>
                <td style={{ padding: '8px 14px', fontFamily: 'monospace', fontWeight: 700, color: typeColor }}>{r['Transaction Type'] === 'Debit' ? '-' : '+'}{fmtFull(r.Amount)}</td>
                <td style={{ padding: '8px 14px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${typeColor}22`, color: typeColor }}>{r['Transaction Type']}</span>
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

export default TransactionsTab;
