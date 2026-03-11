import React from 'react';
import { PALETTE, fmtFull } from '../utils/helpers';

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: PALETTE.muted, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {fmtFull(p.value)}</p>
      ))}
    </div>
  );
};

export default ChartTip;
