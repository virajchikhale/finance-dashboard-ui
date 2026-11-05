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

const personLabel = (n) => n || 'No person';
const categoryLabel = (c) => c || 'Uncategorised';

const Chip = ({ children, onRemove }) => (
  <span className="chip">{children}
    <button type="button" onClick={onRemove} aria-label={`Remove ${children}`}><Icon name="close" className="icon" /></button>
  </span>
);

const FilterPanel = ({
  open, onClose, allMonths, selMonths, setSelMonths, selTypes, setSelTypes,
  allBanks, selAccounts, setSelAccounts, allCategories, selCategories, setSelCategories,
  allPeople, selPeople, setSelPeople,
  dateFrom, setDateFrom, dateTo, setDateTo, search, setSearch, filteredCount,
  activePreset, onPresetChange, onResetAll,
}) => {
  const partial = (sel, all) => sel.length < all.length;
  const hasActive = search || dateFrom || dateTo || partial(selMonths, allMonths) || partial(selTypes, TX_TYPES)
    || partial(selAccounts, allBanks) || partial(selCategories, allCategories) || partial(selPeople, allPeople);

  // Chips for one filter, only when a few values are picked (a long list is clearer in the dropdown)
  const chipsFor = (sel, all, set, label = (v) => v, prefix) => (partial(sel, all) && sel.length <= 3 ? sel.map(v => (
    <Chip key={`${prefix}-${v}`} onRemove={() => set(sel.filter(x => x !== v))}>{label(v)}</Chip>
  )) : null);

  return (
    <section className="filters" aria-label="Filters">
      <div className="filter-bar">
        <div className="segmented" role="group" aria-label="Period">
          {PRESETS.map(p => (
            <button key={p.key} type="button" aria-pressed={activePreset === p.key} onClick={() => onPresetChange(p.key)}>{p.label}</button>
          ))}
        </div>
        <input className="input filter-search" type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search description, name or category" aria-label="Search" />
        {hasActive && <button type="button" className="btn btn-ghost" onClick={onResetAll}>Reset filters</button>}
        <span className="filter-count"><span className="num">{filteredCount}</span> transactions</span>
      </div>

      {open && (
        <>
          {/* On phones the filters open as a bottom sheet; the backdrop and header only show there */}
          <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
          <div className="filter-sheet">
            <div className="sheet-head">
              <span>Filters</span>
              <button type="button" className="btn" onClick={onClose}>Done</button>
            </div>
            <div className="filter-grid">
              <MultiSelect label="Month" options={allMonths} selected={selMonths} renderLabel={monthLabel}
                onChange={v => { setSelMonths(v); onPresetChange(null); }} />
              <MultiSelect label="Type" options={TX_TYPES} selected={selTypes} onChange={setSelTypes} />
              <MultiSelect label="Account" options={allBanks} selected={selAccounts} onChange={setSelAccounts} />
              <MultiSelect label="Category" options={allCategories} selected={selCategories} onChange={setSelCategories} renderLabel={categoryLabel} />
              {allPeople.some(Boolean) && <MultiSelect label="Person" options={allPeople} selected={selPeople}
                onChange={setSelPeople} renderLabel={personLabel} />}
              <label className="field">
                <span className="field-label">From</span>
                <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">To</span>
                <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </label>
            </div>
          </div>
        </>
      )}

      {hasActive && (
        <div className="chips">
          {chipsFor(selMonths, allMonths, setSelMonths, monthLabel, 'm')}
          {partial(selTypes, TX_TYPES) && selTypes.map(t => (
            <Chip key={`t-${t}`} onRemove={() => setSelTypes(selTypes.filter(x => x !== t))}>{t}</Chip>
          ))}
          {chipsFor(selAccounts, allBanks, setSelAccounts, undefined, 'a')}
          {chipsFor(selCategories, allCategories, setSelCategories, categoryLabel, 'c')}
          {chipsFor(selPeople, allPeople, setSelPeople, personLabel, 'p')}
          {dateFrom && <Chip onRemove={() => setDateFrom('')}>{`From ${formatDay(dateFrom)}`}</Chip>}
          {dateTo && <Chip onRemove={() => setDateTo('')}>{`To ${formatDay(dateTo)}`}</Chip>}
          {search && <Chip onRemove={() => setSearch('')}>{`“${search}”`}</Chip>}
        </div>
      )}
    </section>
  );
};

export default FilterPanel;
