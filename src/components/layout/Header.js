import React from 'react';
import Icon from '../Icon';

const LABELS = { overview: 'Overview', transactions: 'Transactions', friends: 'Friends' };

const Header = ({ tabs, activeTab, setActiveTab, filtersOpen, setFiltersOpen, lastUpdated, loading, onRefresh, onOpenSettings }) => (
  <header className="topbar">
    <div className="topbar-inner">
      <div className="brand">
        <span className="brand-mark"><Icon name="mark" className="icon" /></span>
        Finances
      </div>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {tabs.map(t => (
          <button key={t} type="button" role="tab" className="tab" aria-selected={activeTab === t} onClick={() => setActiveTab(t)}>
            {LABELS[t]}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        {lastUpdated && <span className="updated">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        <button type="button" className="btn" aria-pressed={filtersOpen} onClick={() => setFiltersOpen(f => !f)} title="Filters">
          <Icon name="filter" /><span className="btn-label">Filters</span>
        </button>
        <button type="button" className="btn" onClick={onRefresh} disabled={loading} title="Refresh">
          <Icon name="refresh" /><span className="btn-label">{loading ? 'Refreshing…' : 'Refresh'}</span>
        </button>
        <button type="button" className="btn btn-ghost" onClick={onOpenSettings} title="Settings" aria-label="Settings">
          <Icon name="settings" />
        </button>
      </div>
    </div>
  </header>
);

export default Header;
