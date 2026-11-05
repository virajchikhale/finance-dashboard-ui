import { useState, useMemo, useEffect, useCallback } from 'react';
import { obfuscate, deobfuscate, isValidScriptUrl, TX_TYPES } from './utils/helpers';
import {
  monthLabel, presetMonths, periodTotals, monthlySeries, categoryBreakdown, unclassifiedShare,
  spendingByAccount, transferSummary, recurringSpending, thisMonth, accountBalances, friendBalances,
  netWorth, looksLikeCredit, isSpending, runningBalances,
} from './utils/insights';
import { PrivacyContext } from './privacy';
import { useSheetData } from './hooks/useSheetData';

import Header from './components/layout/Header';
import FilterPanel from './components/layout/FilterPanel';
import SetupUrl from './components/SetupUrl';
import SettingsModal from './components/SettingsModal';
import OverviewTab from './components/tabs/OverviewTab';
import TransactionsTab from './components/tabs/TransactionsTab';
import FriendsTab from './components/tabs/FriendsTab';

const PRESET_LABELS = { thisMonth: 'This month', last3: 'Last 3 months', last6: 'Last 6 months', thisYear: 'This year', all: 'All time' };

// localStorage can throw (private mode, blocked storage); the app must still work
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* not persisted */ } },
  remove: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};
const isWide = () => typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 641px)').matches;

export default function App() {
  const [sheetUrl, setSheetUrl] = useState(() => {
    const stored = store.get('sheetUrl');
    if (!stored) return '';
    const decoded = deobfuscate(stored);
    return isValidScriptUrl(decoded) ? decoded : stored; // fallback for migration
  });
  const { rawRecords, rawInstalments, loading, error, lastUpdated, fetchData } = useSheetData();

  useEffect(() => { if (sheetUrl) fetchData(sheetUrl); }, [sheetUrl, fetchData]);

  // ── settings ────────────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const v = parseFloat(store.get('monthlyBudget'));
    return Number.isFinite(v) ? v : 50000;
  });
  const [creditSetting, setCreditSetting] = useState(() => {
    try { const v = JSON.parse(store.get('creditAccounts')); return Array.isArray(v) ? v : null; } catch { return null; }
  });

  const [hideAmounts, setHideAmounts] = useState(() => store.get('hideAmounts') === '1');
  const toggleHide = () => setHideAmounts(h => { store.set('hideAmounts', h ? '0' : '1'); return !h; });

  const handleSaveUrl = (url) => { store.set('sheetUrl', obfuscate(url)); setSheetUrl(url); };
  const handleDisconnect = () => { store.remove('sheetUrl'); setSettingsOpen(false); setSheetUrl(''); };
  const handleSaveBudget = (v) => { setMonthlyBudget(v); store.set('monthlyBudget', String(v)); };
  const handleSaveCredit = (list) => { setCreditSetting(list); store.set('creditAccounts', JSON.stringify(list)); };

  // ── filter options ──────────────────────────────────────────────────────────
  const allMonths = useMemo(() => [...new Set(rawRecords.map(r => r.MonthKey).filter(Boolean))].sort(), [rawRecords]);
  const allBanks = useMemo(() => [...new Set(rawRecords.flatMap(r => [r['Account Name'], r['To Account']]).filter(Boolean))].sort(), [rawRecords]);
  const allCategories = useMemo(() => [...new Set(rawRecords.map(r => r.Category))].sort(), [rawRecords]);
  // '' stands for rows with no person, shown as "No person" in the filter
  const allPeople = useMemo(() => [...new Set(rawRecords.map(r => r.Name))].sort((a, b) => a.localeCompare(b)), [rawRecords]);
  const creditAccounts = useMemo(() => creditSetting ?? allBanks.filter(looksLikeCredit), [creditSetting, allBanks]);

  // ── filter state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [filtersOpen, setFiltersOpen] = useState(isWide);
  const [activePreset, setActivePreset] = useState('all');
  const [selMonths, setSelMonths] = useState([]);
  const [selTypes, setSelTypes] = useState([...TX_TYPES]);
  const [selAccounts, setSelAccounts] = useState([]);
  const [selCategories, setSelCategories] = useState([]);
  const [selPeople, setSelPeople] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { setSelMonths([...allMonths]); }, [allMonths]);
  useEffect(() => { setSelAccounts([...allBanks]); }, [allBanks]);
  useEffect(() => { setSelCategories([...allCategories]); }, [allCategories]);
  useEffect(() => { setSelPeople([...allPeople]); }, [allPeople]);

  const resetAll = useCallback(() => {
    setSelMonths([...allMonths]); setSelTypes([...TX_TYPES]); setSelAccounts([...allBanks]);
    setSelCategories([...allCategories]); setSelPeople([...allPeople]);
    setSearch(''); setDateFrom(''); setDateTo(''); setActivePreset('all');
  }, [allMonths, allBanks, allCategories, allPeople]);

  // Clicking a category, account, person or month narrows the filters to just that value
  const drill = useCallback((field, value, { openTransactions = true } = {}) => {
    if (field === 'category') setSelCategories([value]);
    else if (field === 'account') setSelAccounts([value]);
    else if (field === 'person') setSelPeople([value]);
    else if (field === 'month') { setSelMonths([value]); setActivePreset(null); }
    if (openTransactions) { setActiveTab('transactions'); window.scrollTo?.(0, 0); }
  }, []);
  // Overview shows "Uncategorised" for an empty category and folds the tail into "N more categories"
  const categoryKey = useCallback((name) => (allCategories.includes(name) ? name
    : name === 'Uncategorised' && allCategories.includes('') ? '' : null), [allCategories]);

  const applyPreset = (preset) => {
    setActivePreset(preset);
    if (preset) setSelMonths(presetMonths(preset, new Date(), allMonths));
  };

  // ── filtered rows ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawRecords.filter(r => {
      if (r.Amount === 0) return false;
      if (!selMonths.includes(r.MonthKey)) return false;
      if (!selTypes.includes(r['Transaction Type'])) return false;
      // a row matches an account filter through either side of a transfer
      if (!selAccounts.includes(r['Account Name']) && !(r['To Account'] && selAccounts.includes(r['To Account']))
        && !(r['Account Name'] === '' && selAccounts.length === allBanks.length)) return false;
      if (!selCategories.includes(r.Category)) return false;
      if (!selPeople.includes(r.Name)) return false;
      if (dateFrom && r.DateISO < dateFrom) return false;
      if (dateTo && r.DateISO > dateTo) return false;
      if (q && ![r.Description, r.Name, r.Category].some(v => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rawRecords, selMonths, selTypes, selAccounts, allBanks.length, selCategories, selPeople, search, dateFrom, dateTo]);

  // ── derived figures ─────────────────────────────────────────────────────────
  const today = useMemo(() => lastUpdated || new Date(), [lastUpdated]); // "today" = when the data was last loaded
  const friends = useMemo(() => friendBalances(rawRecords), [rawRecords]);
  const friendsNet = useMemo(() => friends.reduce((s, f) => s + f.balance, 0), [friends]);
  const worth = useMemo(() => netWorth(accountBalances(rawRecords), creditAccounts, friendsNet), [rawRecords, creditAccounts, friendsNet]);
  const fixedMonthly = useMemo(() => rawInstalments.reduce((s, i) => s + i.monthly, 0), [rawInstalments]);
  const month = useMemo(() => thisMonth(rawRecords, today, monthlyBudget, fixedMonthly), [rawRecords, today, monthlyBudget, fixedMonthly]);

  // With one account picked, show its balance after each row (computed from every row, not just filtered ones)
  const balanceAccount = selAccounts.length === 1 && allBanks.length > 1 ? selAccounts[0] : null;
  const balances = useMemo(() => (balanceAccount ? runningBalances(rawRecords, balanceAccount) : null), [rawRecords, balanceAccount]);

  const shownMonths = useMemo(() => allMonths.filter(m => selMonths.includes(m)), [allMonths, selMonths]);
  const overview = useMemo(() => ({
    totals: periodTotals(filtered),
    monthly: monthlySeries(filtered, shownMonths),
    categories: categoryBreakdown(filtered),
    unclassified: unclassifiedShare(filtered),
    byAccount: spendingByAccount(filtered),
    topSpending: [...filtered].filter(isSpending).sort((a, b) => b.Amount - a.Amount).slice(0, 6),
    transfers: transferSummary(filtered),
    recurring: recurringSpending(filtered),
  }), [filtered, shownMonths]);

  const periodLabel = activePreset ? PRESET_LABELS[activePreset]
    : shownMonths.length === 1 ? monthLabel(shownMonths[0])
    : shownMonths.length ? `${monthLabel(shownMonths[0])} – ${monthLabel(shownMonths[shownMonths.length - 1])}` : 'No months selected';

  // ── render ──────────────────────────────────────────────────────────────────
  if (!sheetUrl) return <SetupUrl onSave={handleSaveUrl} />;

  const hasData = rawRecords.length > 0;

  return (
    <PrivacyContext.Provider value={hideAmounts}>
      <Header
        tabs={['overview', 'transactions', 'friends']}
        activeTab={activeTab} setActiveTab={setActiveTab}
        filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}
        lastUpdated={lastUpdated} loading={loading}
        onRefresh={() => fetchData(sheetUrl)}
        onOpenSettings={() => setSettingsOpen(true)}
        hideAmounts={hideAmounts} onToggleHide={toggleHide}
      />

      <SettingsModal
        isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}
        monthlyBudget={monthlyBudget} onSaveBudget={handleSaveBudget}
        accounts={allBanks} creditAccounts={creditAccounts} onSaveCredit={handleSaveCredit}
        onDisconnect={handleDisconnect}
      />

      <main className="page">
        {loading && !hasData && <p className="state">Loading your sheet…</p>}

        {error && !hasData && (
          <div className="state">
            <p style={{ color: 'var(--text)', fontWeight: 600, margin: '0 0 4px' }}>Could not load data</p>
            <p className="small" style={{ margin: '0 0 16px' }}>{error}</p>
            <button type="button" className="btn" onClick={() => fetchData(sheetUrl)}>Try again</button>
          </div>
        )}

        {hasData && (
          <>
            <FilterPanel
              open={filtersOpen} onClose={() => setFiltersOpen(false)}
              allMonths={allMonths} selMonths={selMonths} setSelMonths={setSelMonths}
              selTypes={selTypes} setSelTypes={setSelTypes}
              allBanks={allBanks} selAccounts={selAccounts} setSelAccounts={setSelAccounts}
              allCategories={allCategories} selCategories={selCategories} setSelCategories={setSelCategories}
              allPeople={allPeople} selPeople={selPeople} setSelPeople={setSelPeople}
              dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
              search={search} setSearch={setSearch} filteredCount={filtered.length}
              activePreset={activePreset} onPresetChange={applyPreset} onResetAll={resetAll}
            />

            {activeTab === 'overview' && (
              <OverviewTab today={today} month={month} worth={worth} periodLabel={periodLabel}
                instalments={rawInstalments} {...overview} onDrill={drill} categoryKey={categoryKey} />
            )}
            {activeTab === 'transactions' && (
              <TransactionsTab filtered={filtered} balances={balances} balanceAccount={balanceAccount}
                onDrill={(field, value) => drill(field, value, { openTransactions: false })} />
            )}
            {activeTab === 'friends' && (
              <FriendsTab friends={friends} rows={filtered}
                person={selPeople.length === 1 && selPeople[0] ? selPeople[0] : null}
                onPickPerson={(name) => setSelPeople(name ? [name] : [...allPeople])}
                onViewAll={() => setActiveTab('transactions')} />
            )}
          </>
        )}
      </main>
    </PrivacyContext.Provider>
  );
}
