import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PALETTE, CAT_COLORS, fmt, fmtFull } from '../../utils/helpers';
import KpiCard from '../KpiCard';
import ChartTip from '../ChartTip';

const OverviewTab = ({ kpis, totalOwed, friendsSummary, monthlyData, accountData, categoryData, topTxns, currentBalances }) => {
  return (
    <>
      <div className="grid-overview-top">
        <KpiCard label="Total Income" value={fmtFull(kpis.income)} sub={`${kpis.txnCount} transactions`} color={PALETTE.green} icon="💹" />
        <KpiCard label="Total Expenses" value={fmtFull(kpis.expense)} sub="Debit only" color={PALETTE.red} icon="💸" />
        <KpiCard label="Net Balance" value={fmtFull(kpis.net)} sub={kpis.net >= 0 ? 'Surplus ✓' : 'Deficit ✗'} color={kpis.net >= 0 ? PALETTE.green : PALETTE.red} icon="📊" />
        <KpiCard label="Savings Rate" value={`${kpis.savingsRate}%`} sub="of income saved" color={PALETTE.accent} icon="🎯" />
        <KpiCard label="Friends Owed" value={fmtFull(totalOwed)} sub={`${friendsSummary.length} people`} color={PALETTE.yellow} icon="🤝" />
      </div>

      <div className="grid-overview-mid">
        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: PALETTE.white }}>📈 Monthly Income vs Expense</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis dataKey="month" tick={{ fill: PALETTE.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fill: PALETTE.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: PALETTE.muted }} />
              <Bar dataKey="Income" fill={PALETTE.green} radius={[4,4,0,0]} />
              <Bar dataKey="Expense" fill={PALETTE.red} radius={[4,4,0,0]} />
              <Bar dataKey="Net" fill={PALETTE.accent} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: PALETTE.white }}>🏦 Spending by Account</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={accountData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>
                {accountData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, fontSize: 12 }} />
              <Legend formatter={(v) => <span style={{ fontSize: 10, color: PALETTE.muted }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-overview-bot">
        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: PALETTE.white }}>🏷 Top Spending Categories</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} tick={{ fill: PALETTE.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: PALETTE.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: PALETTE.white }}>🔥 Top Expenses</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topTxns.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `${CAT_COLORS[i % CAT_COLORS.length]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: CAT_COLORS[i % CAT_COLORS.length], fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: PALETTE.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.Description}</div>
                  <div style={{ fontSize: 10, color: PALETTE.muted }}>{t.Month} • {t['Account Name']} {t.Category ? `• ${t.Category.split(' ').slice(0,2).join(' ')}` : ''}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: PALETTE.red, fontFamily: 'monospace', flexShrink: 0 }}>{fmtFull(t.Amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: PALETTE.white }}>💳 Current Balances</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentBalances.length > 0 ? currentBalances.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: `1px solid ${PALETTE.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${PALETTE.accentAlt}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏦</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.text }}>{b.name}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: b.balance >= 0 ? PALETTE.green : PALETTE.red, fontFamily: 'monospace' }}>
                  {fmtFull(b.balance)}
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 12, color: PALETTE.muted, textAlign: 'center', marginTop: 20 }}>No balance data available</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;
