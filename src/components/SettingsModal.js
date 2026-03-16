import React, { useState, useEffect } from 'react';
import { PALETTE } from '../utils/helpers';

const SettingsModal = ({ isOpen, onClose, monthlyBudget, onSaveBudget }) => {
  const [budget, setBudget] = useState(monthlyBudget);

  useEffect(() => {
    setBudget(monthlyBudget);
  }, [monthlyBudget, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const val = parseFloat(budget) || 0;
    onSaveBudget(val);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.2s ease'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PALETTE.surface, borderRadius: 16,
        border: `1px solid ${PALETTE.border}`, padding: '28px 24px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: PALETTE.white }}>⚙️ Settings</div>
            <div style={{ fontSize: 12, color: PALETTE.muted, marginTop: 2 }}>Configure your dashboard</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${PALETTE.border}`,
            background: 'transparent', color: PALETTE.muted, fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Monthly Budget (₹)
          </label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="50000"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
              color: PALETTE.text, fontSize: 16, fontWeight: 700,
              fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = PALETTE.accent}
            onBlur={e => e.target.style.borderColor = PALETTE.border}
          />
          <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 6 }}>
            This is used to track your spending against a target. The budget bar will appear on the Overview tab.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'transparent', border: `1px solid ${PALETTE.border}`,
            color: PALETTE.muted, cursor: 'pointer', transition: 'all 0.2s'
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 1, padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: PALETTE.accent, border: 'none',
            color: PALETTE.white, cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: `0 4px 12px ${PALETTE.accent}44`
          }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
