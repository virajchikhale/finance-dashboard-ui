import React from 'react';
import { PALETTE } from '../../utils/helpers';
import MultiSelect from '../MultiSelect';

const FilterPanel = ({
  allMonths, selMonths, setSelMonths,
  selTypes, setSelTypes,
  allBanks, selAccounts, setSelAccounts,
  allCategories, selCategories, setSelCategories,
  dateFrom, setDateFrom, dateTo, setDateTo,
  search, setSearch, filteredCount
}) => {
  return (
    <div style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
      <div className="grid-filters">
        <MultiSelect label="Month" options={allMonths} selected={selMonths} onChange={setSelMonths} color={PALETTE.accent} />
        
        <MultiSelect
          label="Type" options={['Credit','Debit','Transferd']} selected={selTypes} onChange={setSelTypes} color={PALETTE.green}
          renderLabel={opt => {
            const c = opt === 'Credit' ? PALETTE.green : opt === 'Debit' ? PALETTE.red : PALETTE.yellow;
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
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  description, name…"
              style={{ flex: 1, background: PALETTE.card, border: `1px solid ${search ? PALETTE.accent : PALETTE.border}`, borderRadius: 8, padding: '7px 10px', color: PALETTE.text, fontSize: 12, outline: 'none', minWidth: 0 }} />
            {(search || dateFrom || dateTo) && (
              <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }} style={{
                padding: '6px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', flexShrink: 0,
                background: `${PALETTE.red}22`, border: `1px solid ${PALETTE.red}44`, color: PALETTE.red, fontWeight: 700
              }}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selMonths.length < 3 && selMonths.map(m => <span key={m} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${PALETTE.accent}22`, color: PALETTE.accent, border: `1px solid ${PALETTE.accent}44` }}>{m}</span>)}
          {selTypes.length < 3 && selTypes.map(t => {
            const c = t === 'Credit' ? PALETTE.green : t === 'Debit' ? PALETTE.red : PALETTE.yellow;
            return <span key={t} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${c}22`, color: c, border: `1px solid ${c}44` }}>{t}</span>;
          })}
          {selAccounts.length < allBanks.length && selAccounts.map(a => <span key={a} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${PALETTE.accentAlt}22`, color: PALETTE.accentAlt, border: `1px solid ${PALETTE.accentAlt}44` }}>{a}</span>)}
          {dateFrom && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${PALETTE.accent}22`, color: PALETTE.accent, border: `1px solid ${PALETTE.accent}44` }}>From: {dateFrom}</span>}
          {dateTo && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${PALETTE.accent}22`, color: PALETTE.accent, border: `1px solid ${PALETTE.accent}44` }}>To: {dateTo}</span>}
        </div>
        <div style={{ fontSize: 11, color: PALETTE.muted, flexShrink: 0 }}>
          <span style={{ color: PALETTE.accent, fontWeight: 700 }}>{filteredCount}</span> transactions
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
