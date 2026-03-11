import React, { useState, useEffect, useRef } from "react";
import { PALETTE } from "../utils/helpers";

const MultiSelect = ({ label, options, selected, onChange, color, renderLabel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allSelected = selected.length === options.length;
  const toggleAll = () => onChange(allSelected ? [] : [...options]);
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);

  const summary = allSelected ? 'All' : selected.length === 0 ? 'None' : selected.length <= 2 ? selected.join(', ') : `${selected.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 140 }}>
      <div style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' }}>{label}</div>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
        background: PALETTE.card, border: `1px solid ${open ? (color || PALETTE.accent) : PALETTE.border}`,
        color: selected.length > 0 ? PALETTE.text : PALETTE.muted, fontSize: 12, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, textAlign: 'left',
        transition: 'border-color 0.15s'
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{summary}</span>
        <span style={{ color: PALETTE.muted, fontSize: 10, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 999,
          background: PALETTE.surface, border: `1px solid ${PALETTE.border}`,
          borderRadius: 10, minWidth: '100%', maxHeight: 240, overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {/* Select All row */}
          <div onClick={toggleAll} style={{
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', borderBottom: `1px solid ${PALETTE.border}`,
            background: allSelected ? `${color || PALETTE.accent}11` : 'transparent'
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${allSelected ? (color || PALETTE.accent) : PALETTE.border}`,
              background: allSelected ? (color || PALETTE.accent) : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>{allSelected && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: color || PALETTE.accent }}>Select All</span>
          </div>
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <div key={opt} onClick={() => toggle(opt)} style={{
                padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                background: active ? `${color || PALETTE.accent}11` : 'transparent',
                transition: 'background 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${color || PALETTE.accent}18`}
              onMouseLeave={e => e.currentTarget.style.background = active ? `${color || PALETTE.accent}11` : 'transparent'}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: `1.5px solid ${active ? (color || PALETTE.accent) : PALETTE.border}`,
                  background: active ? (color || PALETTE.accent) : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{active && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}</div>
                <span style={{ fontSize: 12, color: active ? PALETTE.text : PALETTE.muted, whiteSpace: 'nowrap' }}>
                  {renderLabel ? renderLabel(opt) : opt}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
