import React from 'react';
import { useMoney } from '../privacy';

const ChartTip = ({ active, payload, label }) => {
  const { inr } = useMoney();
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <div className="tooltip-title">{label ?? payload[0].payload?.name}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span><i style={{ background: p.color || p.fill }} />{p.name === 'value' ? 'Spent' : p.name}</span>
          <span className="num">{inr(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default ChartTip;
