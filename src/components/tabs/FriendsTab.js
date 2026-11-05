import React from 'react';
import { inr, FRIEND_TYPES } from '../../utils/helpers';
import { formatDay } from '../../utils/insights';

const STATUS = { 'owes-you': 'owes you', 'you-owe': 'you owe', settled: 'settled' };

const FriendsTab = ({ friends, rows, person, onPickPerson, onViewAll }) => {
  const owedToYou = friends.filter(f => f.balance > 0).reduce((s, f) => s + f.balance, 0);
  const youOwe = friends.filter(f => f.balance < 0).reduce((s, f) => s - f.balance, 0);
  const net = owedToYou - youOwe;
  // One person picked: every entry with them. Otherwise: the latest friend entries.
  const history = (person ? rows.filter(r => r.Name === person) : rows.filter(r => FRIEND_TYPES.has(r['Transaction Type']) && r.Name))
    .sort((a, b) => (a.DateISO < b.DateISO ? 1 : -1));
  const shown = person ? history : history.slice(0, 30);
  const picked = person && friends.find(f => f.name === person);

  return (
    <>
      <div className="grid grid-4">
        <div className="card stat"><span className="stat-label">Owed to you</span><span className="stat-value num">{inr(owedToYou)}</span></div>
        <div className="card stat"><span className="stat-label">You owe</span><span className="stat-value num">{inr(youOwe)}</span></div>
        <div className="card stat">
          <span className="stat-label">Net</span>
          <span className={`stat-value num${net < 0 ? ' neg' : ''}`}>{net < 0 ? `−${inr(net)}` : inr(net)}</span>
          <span className="stat-note">{net > 0 ? 'In your favour' : net < 0 ? 'You owe overall' : 'All square'}</span>
        </div>
        <div className="card stat"><span className="stat-label">People with a balance</span><span className="stat-value num">{friends.filter(f => f.balance !== 0).length}</span></div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head"><h2 className="card-title">Balances</h2><span className="card-sub">Pick a name to see their entries</span></div>
          {friends.length ? (
            <ul className="rows">
              {friends.map(f => (
                <li key={f.name}>
                  <button type="button" className="row row-btn" aria-pressed={person === f.name}
                    onClick={() => onPickPerson(person === f.name ? null : f.name)}>
                    <div className="row-main">
                      <div className="row-title">{f.name}</div>
                      <div className="row-sub">{STATUS[f.status]}</div>
                    </div>
                    <span className={`row-value num${f.balance < 0 ? ' neg' : ''}`}>{inr(f.balance)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="muted small">No Owes, Owed or Settled entries yet.</p>}
        </div>

        <div className="card">
          {person ? (
            <div className="card-head">
              <div>
                <h2 className="card-title">Entries with {person} <span className="muted num" style={{ fontWeight: 400 }}>{history.length}</span></h2>
                {picked && <span className="card-sub">{STATUS[picked.status]} {picked.balance !== 0 && inr(picked.balance)}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="btn" onClick={onViewAll}>Open in Transactions</button>
                <button type="button" className="btn btn-ghost" onClick={() => onPickPerson(null)}>Show everyone</button>
              </div>
            </div>
          ) : (
            <div className="card-head"><h2 className="card-title">Recent entries</h2><span className="card-sub">Follows the filters</span></div>
          )}
          {shown.length ? (
            <ul className="rows">
              {shown.map((r, i) => (
                <li key={i} className="row">
                  <div className="row-main">
                    <div className="row-title">{person ? r.Description || '—' : `${r.Name} · ${r.Description}`}</div>
                    <div className="row-sub">{[formatDay(r.DateISO), r['Transaction Type'], r['Account Name']].filter(Boolean).join(' · ')}</div>
                  </div>
                  <span className="row-value num">{inr(r.Amount)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted small">{person ? `No entries with ${person} match the filters.` : 'No friend entries in this period.'}</p>}
        </div>
      </div>
    </>
  );
};

export default FriendsTab;
