import React, { useState } from 'react';
import { PALETTE } from '../utils/helpers';

const SetupUrl = ({ onSave }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim());
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: PALETTE.text, fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>
      <div style={{ background: PALETTE.surface, padding: '40px 30px', borderRadius: 16, border: `1px solid ${PALETTE.border}`, width: '100%', maxWidth: 500, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentAlt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>💰</div>
        <h1 style={{ margin: '0 0 10px 0', fontSize: 24, color: PALETTE.white }}>Welcome to your Dashboard</h1>
        <p style={{ margin: '0 0 30px 0', color: PALETTE.muted, fontSize: 14, lineHeight: 1.5 }}>Connect your Google Apps Script endpoint to visualize your financial data securely.</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Google Script URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.googleusercontent.com/macros/echo?user_content_key=..."
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                background: PALETTE.surface, border: `1px solid ${PALETTE.border}`,
                color: PALETTE.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = PALETTE.accent}
              onBlur={(e) => e.target.style.borderColor = PALETTE.border}
            />
          </div>
          <button type="submit" style={{
            width: '100%', padding: '14px', borderRadius: 8, fontSize: 15, fontWeight: 700,
            background: PALETTE.accent, color: PALETTE.white, border: 'none', cursor: 'pointer',
            transition: 'opacity 0.2s', boxShadow: `0 4px 12px ${PALETTE.accent}44`
          }}
          onMouseEnter={(e) => e.target.style.opacity = 0.9}
          onMouseLeave={(e) => e.target.style.opacity = 1}>
            Connect Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupUrl;
