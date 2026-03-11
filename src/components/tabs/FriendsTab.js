import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PALETTE, CAT_COLORS, fmtFull } from '../../utils/helpers';

const FriendsTab = ({ friendsSummary, rawRecords, selMonths, totalOwed }) => (
  <div className="grid-friends">
    <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: PALETTE.white }}>👥 Friends Balance</div>
      {friendsSummary.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${PALETTE.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${CAT_COLORS[i % CAT_COLORS.length]}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: CAT_COLORS[i % CAT_COLORS.length], fontWeight: 800 }}>{f.name[0]}</div>
            <div>
              <div style={{ fontWeight: 700, color: PALETTE.text }}>{f.name}</div>
              <div style={{ fontSize: 10, color: PALETTE.muted }}>owes you</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: PALETTE.green, fontFamily: 'monospace' }}>{fmtFull(f.amount)}</div>
            <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${PALETTE.red}22`, color: PALETTE.red }}>owed</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${PALETTE.border}` }}>
        <span style={{ fontWeight: 700, color: PALETTE.white }}>Total Owed to You</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: PALETTE.green, fontFamily: 'monospace' }}>{fmtFull(totalOwed)}</span>
      </div>
    </div>

    <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: PALETTE.white }}>📊 Friends Breakdown</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={friendsSummary.map(f => ({ name: f.name, value: f.amount }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
            {friendsSummary.map((_, i) => <Cell key={i} fill={CAT_COLORS[i]} />)}
          </Pie>
          <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, fontSize: 12 }} />
          <Legend formatter={(v) => <span style={{ fontSize: 11, color: PALETTE.muted }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
      
      <div style={{ marginTop: 16, padding: 14, background: `${PALETTE.accent}11`, borderRadius: 10, border: `1px solid ${PALETTE.accent}33` }}>
        <div style={{ fontSize: 11, color: PALETTE.muted }}>Transactions with friends this period</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[...new Set(rawRecords.filter(r => r.Name).map(r => r.Name))].slice(0,4).map((n, i) => {
            const cnt = rawRecords.filter(r => r.Name === n && selMonths.includes(r.Month)).length;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: CAT_COLORS[i] }}>{cnt}</div>
                <div style={{ fontSize: 10, color: PALETTE.muted }}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

export default FriendsTab;
