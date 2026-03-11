import React from 'react';
import { PALETTE } from '../utils/helpers';

const KpiCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
    borderRadius: 12, padding: '16px 20px', borderTop: `3px solid ${color}`,
    minWidth: 0
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: PALETTE.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 4 }}>{sub}</div>}
  </div>
);

export default KpiCard;
