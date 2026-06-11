import React from 'react';
import { PALETTE } from '../../utils/helpers';
import MultiSelect from '../MultiSelect';

const ALL_TYPES = ['Credit', 'Debit', 'Transferd', 'Owes', 'Owed', 'Setteled'];

const TYPE_COLORS = {
  Credit: PALETTE.green,
  Debit: PALETTE.red,
  Transferd: PALETTE.yellow,
  Owes: PALETTE.accent,
  Owed: PALETTE.accentAlt,
  Setteled: PALETTE.muted,
};

const PRESETS = [
  { key: 'thisMonth', label: '📅 This Month' },
  { key: 'last3', label: '📊 Last 3 Months' },
  { key: 'last6', label: '📈 Last 6 Months' },
  { key: 'thisYear', label: '🗓 This Year' },
  { key: 'all', label: '🌐 All Time' },
];

const FilterPanel = ({
  allMonths, selMonths, setSelMonths,
  selTypes, setSelTypes,
  allBanks, selAccounts, setSelAccounts,
  allCategories, selCategories, setSelCategories,
  dateFrom, setDateFrom, dateTo, setDateTo,
  search, setSearch, filteredCount,
  activePreset, onPresetChange, onResetAll
}) => {
  const hasActiveFilters = search || dateFrom || dateTo ||
    selMonths.length < allMonths.length ||
    selTypes.length < ALL_TYPES.length ||
    selAccounts.length < allBanks.length ||
    selCategories.length < allCategories.length;

  return (
    <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
      
      {/* Quick Presets */}
      <div className="filter-presets">
        {PRESETS.map(p => (
          <button
            key={p.key}
            className={`preset-btn${activePreset === p.key ? ' active' : ''}`}
            onClick={() => onPresetChange(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Filter Dropdowns + Dates + Search */}
      <div className="grid-filters">
        <MultiSelect label="Month" options={allMonths} selected={selMonths} onChange={v => { setSelMonths(v); onPresetChange(null); }} color={PALETTE.accent} />
        
        <MultiSelect
          label="Type" options={ALL_TYPES} selected={selTypes} onChange={setSelTypes} color={PALETTE.green}
          renderLabel={opt => {
            const c = TYPE_COLORS[opt] || PALETTE.muted;
            return <span style={{ color: c, fontWeight: 600 }}>{opt}</span>;
          }}
        />

        <MultiSelect label="Bank Account" options={allBanks} selected={selAccounts} onChange={setSelAccounts} color={PALETTE.accentAlt} />
        <MultiSelect label="Category" options={allCategories} selected={selCategories} onChange={setSelCategories} color={PALETTE.yellow} renderLabel={opt => opt || '(Uncategorized)'} />

        <div>
          <div style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' }}>From Date</div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
              background: PALETTE.card, border: `1px solid ${dateFrom ? PALETTE.accent : PALETTE.border}`,
              color: dateFrom ? PALETTE.text : PALETTE.muted, fontSize: 12, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' }}>To Date</div>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
              background: PALETTE.card, border: `1px solid ${dateTo ? PALETTE.accent : PALETTE.border}`,
              color: dateTo ? PALETTE.text : PALETTE.muted, fontSize: 12, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' }}>Search</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  description, name…"
            style={{ width: '100%', background: PALETTE.card, border: `1px solid ${search ? PALETTE.accent : PALETTE.border}`, borderRadius: 8, padding: '7px 10px', color: PALETTE.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Actions Row: Chips + Reset + Count */}
      <div className="filter-actions">
        <div className="filter-chips">
          {selMonths.length < allMonths.length && selMonths.length <= 3 && selMonths.map(m => (
            <span key={m} className="filter-chip" style={{ background: `${PALETTE.accent}15`, color: PALETTE.accent, borderColor: `${PALETTE.accent}44` }}>
              {m}
              <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }} onClick={() => setSelMonths(selMonths.filter(x => x !== m))}>✕</span>
            </span>
          ))}
          {selTypes.length < ALL_TYPES.length && selTypes.map(t => {
            const c = TYPE_COLORS[t] || PALETTE.muted;
            return (
              <span key={t} className="filter-chip" style={{ background: `${c}15`, color: c, borderColor: `${c}44` }}>
                {t}
                <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }} onClick={() => setSelTypes(selTypes.filter(x => x !== t))}>✕</span>
              </span>
            );
          })}
          {selAccounts.length < allBanks.length && selAccounts.length <= 3 && selAccounts.map(a => (
            <span key={a} className="filter-chip" style={{ background: `${PALETTE.accentAlt}15`, color: PALETTE.accentAlt, borderColor: `${PALETTE.accentAlt}44` }}>
              {a}
              <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }} onClick={() => setSelAccounts(selAccounts.filter(x => x !== a))}>✕</span>
            </span>
          ))}
          {dateFrom && (
            <span className="filter-chip" style={{ background: `${PALETTE.accent}15`, color: PALETTE.accent, borderColor: `${PALETTE.accent}44` }}>
              From: {dateFrom}
              <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }} onClick={() => setDateFrom('')}>✕</span>
            </span>
          )}
          {dateTo && (
            <span className="filter-chip" style={{ background: `${PALETTE.accent}15`, color: PALETTE.accent, borderColor: `${PALETTE.accent}44` }}>
              To: {dateTo}
              <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }} onClick={() => setDateTo('')}>✕</span>
            </span>
          )}
          {search && (
            <span className="filter-chip" style={{ background: `${PALETTE.accent}15`, color: PALETTE.accent, borderColor: `${PALETTE.accent}44` }}>
              "{search}"
              <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }} onClick={() => setSearch('')}>✕</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {hasActiveFilters && (
            <button className="reset-all-btn" onClick={onResetAll}>
              ✕ Reset All
            </button>
          )}
          <div style={{ fontSize: 11, color: PALETTE.muted }}>
            <span style={{ color: PALETTE.accent, fontWeight: 700 }}>{filteredCount}</span> transactions
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
