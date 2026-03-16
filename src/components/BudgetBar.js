import React from 'react';
import { PALETTE, fmtFull } from '../utils/helpers';

const BudgetBar = ({ spent, budget }) => {
  if (!budget || budget <= 0) return null;
  
  const pct = Math.min((spent / budget) * 100, 100);
  const overBudget = spent > budget;
  const barColor = pct < 60 ? PALETTE.green : pct < 85 ? PALETTE.yellow : PALETTE.red;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 600 }}>
          {overBudget ? '⚠️ Over budget!' : `${pct.toFixed(0)}% of budget`}
        </span>
        <span style={{ fontSize: 10, color: PALETTE.muted }}>
          {fmtFull(spent)} / {fmtFull(budget)}
        </span>
      </div>
      <div style={{
        width: '100%', height: 6, borderRadius: 3,
        background: `${PALETTE.border}`,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
          transition: 'width 0.6s ease, background 0.3s ease',
          boxShadow: overBudget ? `0 0 8px ${PALETTE.red}88` : 'none'
        }} />
      </div>
    </div>
  );
};

export default BudgetBar;
