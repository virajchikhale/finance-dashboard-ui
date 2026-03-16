import { useState, useMemo, useEffect } from "react";
import { PALETTE, MONTH_NAMES, obfuscate, deobfuscate, isValidScriptUrl } from "./utils/helpers";
import { useSheetData } from "./hooks/useSheetData";

import Header from "./components/layout/Header";
import FilterPanel from "./components/layout/FilterPanel";
import SetupUrl from "./components/SetupUrl";
import SettingsModal from "./components/SettingsModal";
import OverviewTab from "./components/tabs/OverviewTab";
import TransactionsTab from "./components/tabs/TransactionsTab";
import FriendsTab from "./components/tabs/FriendsTab";

export default function App() {
  const [sheetUrl, setSheetUrl] = useState(() => {
    const stored = localStorage.getItem("sheetUrl");
    if (!stored) return '';
    const decoded = deobfuscate(stored);
    return isValidScriptUrl(decoded) ? decoded : stored; // fallback for migration
  });
  const { rawRecords, rawFriends, loading, error, lastUpdated, fetchData } = useSheetData();

  useEffect(() => {
    if (sheetUrl) fetchData(sheetUrl);
  }, [sheetUrl, fetchData]);

  const handleSaveUrl = (url) => {
    localStorage.setItem("sheetUrl", obfuscate(url));
    setSheetUrl(url);
  };

  const handleChangeUrl = () => {
    localStorage.removeItem("sheetUrl");
    localStorage.removeItem("monthlyBudget");
    setSheetUrl("");
  };

  // ── FILTER OPTIONS ──────────────────────────────────────────────────────────
  const allMonths = useMemo(() => {
    const order = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };
    const s = [...new Set(rawRecords.map(r => r.Month).filter(Boolean))];
    return s.sort((a,b) => (order[a]||99) - (order[b]||99));
  }, [rawRecords]);

  const allBanks = useMemo(() => [...new Set(rawRecords.map(r => r['Account Name']).filter(Boolean))].sort(), [rawRecords]);
  const allCategories = useMemo(() => [...new Set(rawRecords.map(r => r.Category))], [rawRecords]);

  // ── STATE ────────────────────────────────────────────────────────────────────
  const [selMonths, setSelMonths] = useState([]);
  const [selTypes, setSelTypes] = useState(['Credit','Debit','Transferd']);
  const [selAccounts, setSelAccounts] = useState([]);
  const [selCategories, setSelCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activePreset, setActivePreset] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const stored = localStorage.getItem('monthlyBudget');
    return stored ? parseFloat(stored) : 50000;
  });

  const handleSaveBudget = (val) => {
    setMonthlyBudget(val);
    localStorage.setItem('monthlyBudget', String(val));
  };

  useEffect(() => { if (allMonths.length) setSelMonths([...allMonths]); }, [allMonths]);
  useEffect(() => { if (allBanks.length) setSelAccounts([...allBanks]); }, [allBanks]);
  useEffect(() => { if (allCategories.length) setSelCategories([...allCategories]); }, [allCategories]);

  // ── PRESET / RESET ──────────────────────────────────────────────────────────
  const applyPreset = (preset) => {
    if (preset === activePreset) return;
    setActivePreset(preset);
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelTypes(['Credit','Debit','Transferd']);
    if (allBanks.length) setSelAccounts([...allBanks]);
    if (allCategories.length) setSelCategories([...allCategories]);

    if (!preset || preset === 'all') {
      if (allMonths.length) setSelMonths([...allMonths]);
      return;
    }

    const now = new Date();
    const curMonthIdx = now.getMonth(); // 0-based
    let count = preset === 'thisMonth' ? 1 : preset === 'last3' ? 3 : preset === 'last6' ? 6 : 12;
    const target = [];
    for (let i = 0; i < count; i++) {
      const idx = (curMonthIdx - i + 12) % 12;
      target.push(MONTH_NAMES[idx]);
    }
    setSelMonths(allMonths.filter(m => target.includes(m)));
  };

  const resetAllFilters = () => {
    setSelMonths([...allMonths]);
    setSelTypes(['Credit','Debit','Transferd']);
    setSelAccounts([...allBanks]);
    setSelCategories([...allCategories]);
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setActivePreset('all');
  };

  // ── DATA PROCESSING ──────────────────────────────────────────────────────────
  const MONTH_NUM = useMemo(() => ({ Jan: 1, Feb: 2, Mar: 3, Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 }), []);
  
  const filtered = useMemo(() => {
    return rawRecords.filter(r => {
      if (r.Amount === 0) return false;
      if (!selMonths.includes(r.Month)) return false;
      if (!selTypes.includes(r['Transaction Type'])) return false;
      if (!selAccounts.includes(r['Account Name'])) return false;
      if (!selCategories.includes(r.Category)) return false;
      if ((dateFrom || dateTo) && r.Date > 0) {
        const mIdx = MONTH_NUM[r.Month] || 0;
        const fyExtracted = r.Year || 2025; // using dynamically parsed Year with fallback 2025
        const recordVal = fyExtracted * 10000 + mIdx * 100 + r.Date;
        
        if (dateFrom) {
          const [fy, fm, fd] = dateFrom.split('-').map(Number);
          if (recordVal < fy * 10000 + fm * 100 + fd) return false;
        }
        if (dateTo) {
          const [ty, tm, td] = dateTo.split('-').map(Number);
          if (recordVal > ty * 10000 + tm * 100 + td) return false;
        }
      }
      if (search !== '' && !r.Description.toLowerCase().includes(search.toLowerCase()) &&
          !r.Name.toLowerCase().includes(search.toLowerCase()) &&
          !r.Category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rawRecords, selMonths, selTypes, selAccounts, selCategories, search, dateFrom, dateTo, MONTH_NUM]);

  const kpis = useMemo(() => {
    const income = filtered.filter(r => r['Transaction Type'] === 'Credit').reduce((s, r) => s + r.Amount, 0);
    const expense = filtered.filter(r => r['Transaction Type'] === 'Debit').reduce((s, r) => s + r.Amount, 0);
    const transfers = filtered.filter(r => r['Transaction Type'] === 'Transferd').reduce((s, r) => s + r.Amount, 0);
    
    // Calculate total net owed from friends
    const friendsNet = rawFriends.reduce((acc, f) => {
      const status = (f.Status || '').toLowerCase().trim();
      if (status === 'owes') return acc - Math.abs(f.Amount);
      if (status === 'owed' || !status) return acc + Math.abs(f.Amount);
      return acc;
    }, 0);

    const net = income - expense + friendsNet;
    const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;
    return { income, expense, net, transfers, savingsRate, txnCount: filtered.length, friendsNet };
  }, [filtered, rawFriends]);

  const monthlyData = useMemo(() => {
    return allMonths.filter(m => selMonths.includes(m)).map(m => {
      const rows = filtered.filter(r => r.Month === m);
      const income = rows.filter(r => r['Transaction Type'] === 'Credit').reduce((s,r)=>s+r.Amount,0);
      const expense = rows.filter(r => r['Transaction Type'] === 'Debit').reduce((s,r)=>s+r.Amount,0);
      return { month: m, Income: income, Expense: expense, Net: income - expense };
    });
  }, [filtered, selMonths, allMonths]);

  const categoryData = useMemo(() => {
    const map = {};
    filtered.filter(r => r['Transaction Type'] === 'Debit' && r.Category).forEach(r => {
      map[r.Category] = (map[r.Category] || 0) + r.Amount;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([name, value]) => ({ name: name.split(' ').slice(0,2).join(' '), full: name, value }));
  }, [filtered]);

  const accountData = useMemo(() => {
    const map = {};
    filtered.filter(r => r['Transaction Type'] === 'Debit').forEach(r => {
      if (r['Account Name']) map[r['Account Name']] = (map[r['Account Name']] || 0) + r.Amount;
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const friendsSummary = useMemo(() => {
    const map = {};
    rawFriends.forEach(f => {
      const status = (f.Status || '').toLowerCase().trim();
      let val = f.Amount;
      if (status === 'owes') val = -Math.abs(val);
      else if (status === 'settled') val = 0;
      else val = Math.abs(val);
      
      if (!map[f.Name]) {
        map[f.Name] = { balance: val, origAmount: f.Amount, isSettled: status === 'settled' };
      } else {
        map[f.Name].balance += val;
        map[f.Name].origAmount = f.Amount;
        map[f.Name].isSettled = status === 'settled';
      }
    });
    return Object.entries(map).map(([name, data]) => ({ 
      name, 
      balance: data.balance,
      displayAmount: data.balance !== 0 ? Math.abs(data.balance) : data.origAmount,
      status: data.balance > 0 ? 'owed' : data.balance < 0 ? 'owes' : 'settled'
    }));
  }, [rawFriends]);

  const totalOwed = useMemo(() => friendsSummary.reduce((s, f) => s + f.balance, 0), [friendsSummary]);

  const topTxns = useMemo(() =>
    [...filtered].filter(r => r['Transaction Type'] === 'Debit' && r.Description)
      .sort((a,b) => b.Amount - a.Amount).slice(0, 8),
  [filtered]);

  const currentBalances = useMemo(() => {
    const balances = {};
    rawRecords.forEach(r => {
      if (r['Account Name'] && r['Account Balance'] !== null) balances[r['Account Name']] = r['Account Balance'];
      if (r['To Account'] && r['To Account Balance'] !== null) balances[r['To Account']] = r['To Account Balance'];
    });
    return Object.entries(balances)
      .map(([name, balance]) => ({ name, balance }))
      .sort((a,b) => b.balance - a.balance);
  }, [rawRecords]);

  // ── RECURRING EXPENSES ──────────────────────────────────────────────────────
  const recurringExpenses = useMemo(() => {
    const debitRows = filtered.filter(r => r['Transaction Type'] === 'Debit' && r.Description);
    const descMonths = {};
    debitRows.forEach(r => {
      const key = r.Description.toLowerCase().trim();
      if (!descMonths[key]) descMonths[key] = { desc: r.Description, months: new Set(), total: 0, category: r.Category };
      descMonths[key].months.add(r.Month);
      descMonths[key].total += r.Amount;
    });
    return Object.values(descMonths)
      .filter(d => d.months.size >= 2)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map(d => ({ description: d.desc, monthCount: d.months.size, total: d.total, category: d.category }));
  }, [filtered]);

  // ── SPENDING TREND ────────────────────────────────────────────────────────
  const spendingTrend = useMemo(() => {
    if (monthlyData.length < 2) return null;
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    if (!prev || prev.Expense === 0) return null;
    const pctChange = ((last.Expense - prev.Expense) / prev.Expense * 100).toFixed(1);
    return { pctChange: parseFloat(pctChange), lastMonth: last.month, prevMonth: prev.month };
  }, [monthlyData]);

  // ── RENDER ──────────────────────────────────────────────────────────────────
  if (!sheetUrl) return <SetupUrl onSave={handleSaveUrl} />;

  return (
    <div style={{ background: PALETTE.bg, minHeight: '100vh', fontFamily: "'Outfit', 'Segoe UI', sans-serif", color: PALETTE.text }}>
      <Header
        tabs={['overview','transactions','friends']}
        activeTab={activeTab} setActiveTab={setActiveTab}
        filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}
        lastUpdated={lastUpdated} loading={loading}
        fetchData={fetchData} sheetUrl={sheetUrl}
        onChangeUrl={handleChangeUrl}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        monthlyBudget={monthlyBudget}
        onSaveBudget={handleSaveBudget}
      />

      <div className="app-container" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {loading && rawRecords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 16, color: PALETTE.text, fontWeight: 700 }}>Fetching your data...</div>
          </div>
        )}

        {error && rawRecords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 16, color: PALETTE.red, fontWeight: 700 }}>Could not load data</div>
            <div style={{ fontSize: 12, color: PALETTE.muted, marginTop: 8, marginBottom: 20 }}>{error}</div>
            <button onClick={() => fetchData(sheetUrl)} style={{ padding: '10px 24px', borderRadius: 8, background: PALETTE.accent, color: '#fff', border: 'none', cursor: 'pointer' }}>Try Again</button>
          </div>
        )}

        {rawRecords.length > 0 && (
          <>
            {filtersOpen && (
              <FilterPanel
                allMonths={allMonths} selMonths={selMonths} setSelMonths={setSelMonths}
                selTypes={selTypes} setSelTypes={setSelTypes}
                allBanks={allBanks} selAccounts={selAccounts} setSelAccounts={setSelAccounts}
                allCategories={allCategories} selCategories={selCategories} setSelCategories={setSelCategories}
                dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
                search={search} setSearch={setSearch} filteredCount={filtered.length}
                activePreset={activePreset} onPresetChange={applyPreset} onResetAll={resetAllFilters}
              />
            )}

            {activeTab === 'overview' && (
              <OverviewTab kpis={kpis} totalOwed={totalOwed} friendsSummary={friendsSummary} monthlyData={monthlyData} accountData={accountData} categoryData={categoryData} topTxns={topTxns} currentBalances={currentBalances} monthlyBudget={monthlyBudget} recurringExpenses={recurringExpenses} spendingTrend={spendingTrend} />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTab filtered={filtered} />
            )}

            {activeTab === 'friends' && (
              <FriendsTab friendsSummary={friendsSummary} rawRecords={rawRecords} selMonths={selMonths} totalOwed={totalOwed} />
            )}
          </>
        )}
      </div>
    </div>
  );
}