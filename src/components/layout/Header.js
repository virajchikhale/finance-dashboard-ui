import React from 'react';
import { PALETTE } from '../../utils/helpers';

const Header = ({ tabs, activeTab, setActiveTab, filtersOpen, setFiltersOpen, lastUpdated, loading, fetchData, sheetUrl, onChangeUrl, onOpenSettings }) => (
  <div style={{ background: PALETTE.surface, borderBottom: `1px solid ${PALETTE.border}`, padding: '14px 24px', position: 'sticky', top: 0, zIndex: 100 }} className="flex-header">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentAlt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💰</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: PALETTE.white }}>Finance Dashboard</div>
        <div style={{ fontSize: 10, color: PALETTE.muted }}>Personal Finance Tracker • {new Date().getFullYear()}</div>
      </div>
    </div>
    
    <div className="header-tabs">
      {tabs.map(t => (
        <button key={t} onClick={() => setActiveTab(t)} style={{
          padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: activeTab === t ? PALETTE.accent : 'transparent',
          color: activeTab === t ? PALETTE.white : PALETTE.muted,
          border: `1px solid ${activeTab === t ? PALETTE.accent : PALETTE.border}`,
          textTransform: 'capitalize', transition: 'all 0.15s'
        }}>{t === 'overview' ? '📊 Overview' : t === 'transactions' ? '📋 Transactions' : '👥 Friends'}</button>
      ))}
    </div>

    <div className="header-actions">
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setFiltersOpen(f => !f)} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: filtersOpen ? `${PALETTE.accent}22` : 'transparent',
          color: filtersOpen ? PALETTE.accent : PALETTE.muted,
          border: `1px solid ${filtersOpen ? PALETTE.accent : PALETTE.border}`
        }}>⚙ Filters {filtersOpen ? '▲' : '▼'}</button>

        <button onClick={onOpenSettings} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: 'transparent',
          color: PALETTE.muted, border: `1px solid ${PALETTE.border}`
        }}>🎯 Budget</button>

        <button onClick={onChangeUrl} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: 'transparent',
          color: PALETTE.muted, border: `1px solid ${PALETTE.border}`
        }}>🔗 Change URL</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {lastUpdated && (
          <span style={{ fontSize: 10, color: PALETTE.muted }}>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button onClick={() => fetchData(sheetUrl)} disabled={loading} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
          background: loading ? `${PALETTE.green}11` : `${PALETTE.green}22`,
          color: PALETTE.green, border: `1px solid ${PALETTE.green}44`,
          opacity: loading ? 0.6 : 1
        }}>{loading ? '⏳ Loading…' : '🔄 Refresh'}</button>
      </div>
    </div>
  </div>
);

export default Header;
