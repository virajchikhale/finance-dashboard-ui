import React, { useState } from 'react';
import { PALETTE, isValidScriptUrl } from '../utils/helpers';

const SetupUrl = ({ onSave }) => {
  const [url, setUrl] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const isValid = url.trim() === '' || isValidScriptUrl(url.trim());
  const canSubmit = url.trim() !== '' && isValidScriptUrl(url.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onSave(url.trim());
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: PALETTE.text, fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>
      <div style={{ background: PALETTE.surface, padding: '40px 30px', borderRadius: 16, border: `1px solid ${PALETTE.border}`, width: '100%', maxWidth: 500, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentAlt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>💰</div>
        <h1 style={{ margin: '0 0 10px 0', fontSize: 24, color: PALETTE.white }}>Welcome to your Dashboard</h1>
        <p style={{ margin: '0 0 24px 0', color: PALETTE.muted, fontSize: 14, lineHeight: 1.5 }}>Connect your Google Apps Script endpoint to visualize your financial data securely.</p>
        
        {/* Security badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: `${PALETTE.green}11`, border: `1px solid ${PALETTE.green}33`, borderRadius: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontSize: 12, color: PALETTE.green, fontWeight: 600 }}>Your URL is stored securely with obfuscation — never as plain text</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Google Script URL</label>
              <button type="button" onClick={() => setShowHelp(h => !h)} style={{
                background: 'transparent', border: 'none', color: PALETTE.accent, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', padding: '2px 6px', borderRadius: 4
              }}>
                {showHelp ? '✕ Close' : '❓ What URL?'}
              </button>
            </div>
            
            {showHelp && (
              <div style={{ padding: '12px 14px', background: `${PALETTE.accent}11`, border: `1px solid ${PALETTE.accent}33`, borderRadius: 10, marginBottom: 12, fontSize: 12, color: PALETTE.muted, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: PALETTE.accent, marginBottom: 4 }}>How to get your URL:</div>
                <ol style={{ margin: '0', paddingLeft: 18 }}>
                  <li>Open your Google Sheet</li>
                  <li>Go to <strong style={{ color: PALETTE.text }}>Extensions → Apps Script</strong></li>
                  <li>Deploy as <strong style={{ color: PALETTE.text }}>Web App</strong></li>
                  <li>Copy the deployment URL</li>
                </ol>
                <div style={{ marginTop: 8, fontSize: 11, color: PALETTE.muted }}>
                  URL should start with <code style={{ color: PALETTE.accent, background: `${PALETTE.accent}11`, padding: '1px 4px', borderRadius: 3 }}>https://script.google.com/</code> or <code style={{ color: PALETTE.accent, background: `${PALETTE.accent}11`, padding: '1px 4px', borderRadius: 3 }}>https://script.googleusercontent.com/</code>
                </div>
              </div>
            )}

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                background: PALETTE.surface,
                border: `1px solid ${!isValid ? PALETTE.red : PALETTE.border}`,
                color: PALETTE.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = !isValid ? PALETTE.red : PALETTE.accent}
              onBlur={(e) => e.target.style.borderColor = !isValid ? PALETTE.red : PALETTE.border}
            />

            {/* Validation error */}
            {url.trim() !== '' && !isValid && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: `${PALETTE.red}11`, border: `1px solid ${PALETTE.red}33`, borderRadius: 8, fontSize: 12, color: PALETTE.red, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️</span>
                <span>Please enter a valid Google Apps Script URL (must start with https://script.google.com or https://script.googleusercontent.com)</span>
              </div>
            )}

            {/* Valid indicator */}
            {canSubmit && (
              <div style={{ marginTop: 8, fontSize: 12, color: PALETTE.green, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✓</span>
                <span>Valid Google Script URL</span>
              </div>
            )}
          </div>

          <button type="submit" disabled={!canSubmit} style={{
            width: '100%', padding: '14px', borderRadius: 8, fontSize: 15, fontWeight: 700, marginTop: 12,
            background: canSubmit ? PALETTE.accent : `${PALETTE.accent}44`,
            color: canSubmit ? PALETTE.white : `${PALETTE.white}66`,
            border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', boxShadow: canSubmit ? `0 4px 12px ${PALETTE.accent}44` : 'none'
          }}
          onMouseEnter={(e) => { if (canSubmit) e.target.style.opacity = 0.9; }}
          onMouseLeave={(e) => e.target.style.opacity = 1}>
            🔗 Connect Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupUrl;
