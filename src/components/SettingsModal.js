import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const SettingsModal = ({ isOpen, onClose, monthlyBudget, onSaveBudget, accounts, creditAccounts, onSaveCredit, onDisconnect }) => {
  const [budget, setBudget] = useState(monthlyBudget);
  const [credit, setCredit] = useState(creditAccounts);

  useEffect(() => { if (isOpen) { setBudget(monthlyBudget); setCredit(creditAccounts); } }, [isOpen, monthlyBudget, creditAccounts]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const save = () => {
    onSaveBudget(Math.max(0, parseFloat(budget) || 0));
    onSaveCredit(credit);
    onClose();
  };
  const toggle = (name) => setCredit(c => (c.includes(name) ? c.filter(x => x !== name) : [...c, name]));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="settings-title" className="section-title">Settings</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>

        <div className="modal-section">
          <label className="field">
            <span className="field-label">Monthly spending budget (₹)</span>
            <input className="input num" type="number" inputMode="numeric" min="0" value={budget} onChange={e => setBudget(e.target.value)} />
          </label>
          <span className="hint">Used for “Budget left” and the month-end projection. Set 0 to hide it.</span>
        </div>

        <div className="modal-section">
          <span className="field-label">Credit cards and pay-later accounts</span>
          <span className="hint">Their balance is shown as money you owe and is subtracted from net worth.</span>
          <div className="check-grid">
            {accounts.map(name => (
              <label key={name} className="check">
                <input type="checkbox" checked={credit.includes(name)} onChange={() => toggle(name)} /> {name}
              </label>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <span className="field-label">Data source</span>
          <span className="hint">Disconnecting removes the saved script URL and key from this browser.</span>
          <div><button type="button" className="btn btn-danger" onClick={onDisconnect}>Disconnect sheet</button></div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
