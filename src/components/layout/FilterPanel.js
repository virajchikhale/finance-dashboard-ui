import React from 'react';
import { TX_TYPES } from '../../utils/helpers';
import { monthLabel, formatDay } from '../../utils/insights';
import MultiSelect from '../MultiSelect';
import Icon from '../Icon';

const PRESETS = [
  { key: 'thisMonth', label: 'This month' },
  { key: 'last3', label: '3 months' },
  { key: 'last6', label: '6 months' },
  { key: 'thisYear', label: 'This year' },
  { key: 'all', label: 'All time' },
];

const Chip = ({ children, onRemove }) => (
  <span className="chip">{children}
    <button type="button" onClick={onRemove} aria-label={`Remove ${children}`}><Icon name="close" className="icon" /></button>
  </span>
);

const FilterPanel = ({
  open, allMonths, selMonths, setSelMonths, selTypes, setSelTypes,
  allBanks, selAccounts, setSelAccounts, allCategories, selCategories, setSelCategories,
  dateFrom, setDateFrom, dateTo, setDateTo, search, setSearch, filteredCount,
  activePreset, onPresetChange, onResetAll,
}) => {
  const partial = (sel, all) => sel.length < all.length;
  const hasActive = search || dateFrom || dateTo || partial(selMonths, allMonths) || partial(selTypes, TX_TYPES)
    || partial(selAccounts, allBanks) || partial(selCategories, allCategories);

  return (
    <section className="filters" aria-label="Filters">
      <div className="filter-bar">
        <div className="segmented" role="group" aria-label="Period">
          {PRESETS.map(p => (
            <button key={p.key} type="button" aria-pressed={activePreset === p.key} onClick={() => onPresetChange(p.key)}>{p.label}</button>
          ))}
        </div>
        {hasActive && <button type="button" className="btn btn-ghost" onClick={onResetAll}>Reset filters</button>}
        <span className="filter-count"><span className="num">{filteredCount}</span> transactions</span>
      </div>

      {open && (
        <>
          <div className="filter-grid">
            <MultiSelect label="Month" options={allMonths} selected={selMonths} renderLabel={monthLabel}
              onChange={v => { setSelMonths(v); onPresetChange(null); }} />
            <MultiSelect label="Type" options={TX_TYPES} selected={selTypes} onChange={setSelTypes} />
            <MultiSelect label="Account" options={allBanks} selected={selAccounts} onChange={setSelAccounts} />
            <MultiSelect label="Category" options={allCategories} selected={selCategories} onChange={setSelCategories} />
            <label className="field">
              <span className="field-label">From</span>
              <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">To</span>
              <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </label>
            <label className="field span-all">
              <span className="field-label">Search</span>
              <input className="input" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Description, name or category" />
            </label>
          </div>

          {hasActive && (
            <div className="chips">
              {partial(selMonths, allMonths) && selMonths.length <= 3 && selMonths.map(m => (
                <Chip key={m} onRemove={() => setSelMonths(selMonths.filter(x => x !== m))}>{monthLabel(m)}</Chip>
              ))}
              {partial(selTypes, TX_TYPES) && selTypes.map(t => (
                <Chip key={t} onRemove={() => setSelTypes(selTypes.filter(x => x !== t))}>{t}</Chip>
              ))}
              {partial(selAccounts, allBanks) && selAccounts.length <= 3 && selAccounts.map(a => (
                <Chip key={a} onRemove={() => setSelAccounts(selAccounts.filter(x => x !== a))}>{a}</Chip>
              ))}
              {dateFrom && <Chip onRemove={() => setDateFrom('')}>{`From ${formatDay(dateFrom)}`}</Chip>}
              {dateTo && <Chip onRemove={() => setDateTo('')}>{`To ${formatDay(dateTo)}`}</Chip>}
              {search && <Chip onRemove={() => setSearch('')}>{`“${search}”`}</Chip>}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default FilterPanel;
