import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { inr, inrSigned, inrShort } from '../../utils/helpers';
import { monthLabel, formatDay, daysSince } from '../../utils/insights';
import { useChartColors } from '../../theme';
import ChartTip from '../ChartTip';
import Icon from '../Icon';

const STALE_DAYS = 7;
const MIN_DAYS_FOR_PROJECTION = 7; // one large purchase early in the month makes the projection meaningless

const Stat = ({ label, value, note, tone, children }) => (
  <div className="card stat">
    <span className="stat-label">{label}</span>
    <span className={`stat-value${tone ? ` ${tone}` : ''}`}>{value}</span>
    {children}
    {note && <span className="stat-note">{note}</span>}
  </div>
);

const Meter = ({ value, over }) => (
  <div className={`meter${over ? ' over' : ''}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
    <span style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
  </div>
);

const Card = ({ title, sub, children, className = '' }) => (
  <div className={`card ${className}`}>
    <div className="card-head">
      <h3 className="card-title">{title}</h3>
      {sub && <span className="card-sub">{sub}</span>}
    </div>
    {children}
  </div>
);

// Ranked horizontal bars in plain HTML: readable on a phone, no hover needed
const RankedBars = ({ items, empty }) => {
  if (!items.length) return <p className="muted small">{empty}</p>;
  const max = Math.max(...items.map(i => i.value));
  return (
    <ul className="rows">
      {items.map(i => (
        <li key={i.name} className="row" style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span className="row-title">{i.name}</span>
            <span className="row-value num">{inr(i.value)}</span>
          </div>
          <div className="meter" style={{ marginTop: 6 }}><span style={{ width: `${(i.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
};

const AccountRow = ({ account, today, credit }) => {
  const idle = daysSince(account.lastDate, today);
  const owed = credit && account.balance < 0;
  return (
    <li className="row">
      <div className="row-main">
        <div className="row-title">{account.name}</div>
        <div className="row-sub">
          {idle !== null && idle > STALE_DAYS
            ? <span className="badge badge-warn">No entries for {idle} days</span>
            : account.lastDate ? `Last entry ${formatDay(account.lastDate)}` : 'No entries yet'}
        </div>
      </div>
      <div className={`row-value num${account.balance < 0 && !credit ? ' neg' : ''}`}>
        {credit ? (owed ? `${inr(account.balance)} due` : account.balance > 0 ? `${inr(account.balance)} credit` : 'Nothing due') : inrSigned(account.balance).replace('+', '')}
      </div>
    </li>
  );
};

const MonthlyChart = ({ data }) => {
  const c = useChartColors();
  return (
    <>
      <div className="legend" aria-hidden="true" style={{ marginBottom: 8 }}>
        <span><i style={{ background: c.series1 }} />Income</span>
        <span><i style={{ background: c.series2 }} />Spending</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="label" tick={{ fill: c.axisText, fontSize: 12 }} axisLine={{ stroke: c.axis }} tickLine={false} />
          <YAxis tickFormatter={inrShort} tick={{ fill: c.axisText, fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<ChartTip />} cursor={{ fill: c.grid, opacity: 0.5 }} />
          <Bar dataKey="Income" fill={c.series1} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="Spending" fill={c.series2} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>Income and spending by month</caption>
        <thead><tr><th>Month</th><th>Income</th><th>Spending</th></tr></thead>
        <tbody>{data.map(d => <tr key={d.key}><td>{d.label}</td><td>{inr(d.Income)}</td><td>{inr(d.Spending)}</td></tr>)}</tbody>
      </table>
    </>
  );
};

const OverviewTab = ({ today, month, worth, periodLabel, totals, monthly, categories, unclassified, byAccount, topSpending, transfers, instalments, recurring }) => {
  const fixedMonthly = instalments.reduce((s, i) => s + i.monthly, 0);

  return (
    <>
      {/* 1. This month at a glance (not affected by filters) */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">{monthLabel(month.key)}</h2>
          <span className="card-sub">Day {month.day} of {month.daysInMonth}</span>
        </div>
        <div className="grid grid-4">
          <Stat label="Spent so far" value={inr(month.spent)} note={`${month.count} expenses`} />
          <Stat label="Average per day" value={inr(month.dailyAvg)} note="Spending ÷ days so far" />
          {month.day < MIN_DAYS_FOR_PROJECTION ? (
            <Stat label="Projected for the month" value="—" note={`Shown from day ${MIN_DAYS_FOR_PROJECTION}, when the daily average settles`} />
          ) : (
            <Stat label="Projected for the month" value={inr(month.projected)}
              note={month.budget > 0 ? (month.projectedOver ? `${inr(month.projected - month.budget)} over budget at this pace` : 'Within budget at this pace') : 'At the current daily average'}
              tone={month.projectedOver ? 'neg' : ''} />
          )}
          {month.budget > 0 ? (
            <Stat label="Budget left" value={month.budgetLeft < 0 ? `−${inr(month.budgetLeft)}` : inr(month.budgetLeft)}
              note={`${Math.round(month.budgetUsed * 100)}% of ${inr(month.budget)} used`} tone={month.budgetLeft < 0 ? 'neg' : ''}>
              <Meter value={month.budgetUsed} over={month.budgetLeft < 0} />
            </Stat>
          ) : (
            <Stat label="Budget left" value="—" note="Set a monthly budget in Settings" />
          )}
        </div>
        {fixedMonthly > 0 && (
          <p className="small muted" style={{ margin: '10px 2px 0' }}>
            Plus <strong className="num" style={{ color: 'var(--text)' }}>{inr(fixedMonthly)}</strong> a month in fixed commitments (insurance, LIC, subscriptions), listed under Fixed commitments below.
          </p>
        )}
      </section>

      {/* 2. Net worth: what you hold, minus what you owe, plus friends' balance */}
      <section className="section">
        <div className="grid grid-wide align-start">
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Net worth</h3>
              <span className="card-sub">All entries, ignores filters</span>
            </div>
            <div className={`hero-value num${worth.total < 0 ? ' neg' : ''}`}>{worth.total < 0 ? `−${inr(worth.total)}` : inr(worth.total)}</div>
            <ul className="rows" style={{ marginTop: 14 }}>
              <li className="row"><span className="row-main">Bank and cash</span><span className="row-value num">{inr(worth.cash)}</span></li>
              <li className="row"><span className="row-main">Card and pay-later dues</span><span className="row-value num neg">{worth.dues > 0 ? `−${inr(worth.dues)}` : inr(0)}</span></li>
              <li className="row">
                <span className="row-main">Friends {worth.friendsNet > 0 ? '(owe you)' : worth.friendsNet < 0 ? '(you owe)' : ''}</span>
                <span className={`row-value num${worth.friendsNet < 0 ? ' neg' : ''}`}>{inrSigned(worth.friendsNet)}</span>
              </li>
            </ul>
          </div>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Accounts</h3></div>
            <div className="group-label" style={{ marginTop: 0 }}>Bank and cash</div>
            <ul className="rows">{worth.bank.map(a => <AccountRow key={a.name} account={a} today={today} />)}</ul>
            {worth.credit.length > 0 && <>
              <div className="group-label">Credit cards and pay later</div>
              <ul className="rows">{worth.credit.map(a => <AccountRow key={a.name} account={a} today={today} credit />)}</ul>
            </>}
          </div>
        </div>
      </section>

      {/* 3. The filtered period */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">{periodLabel}</h2>
          <span className="card-sub">Follows the filters · opening balances and transfers excluded</span>
        </div>
        <div className="grid grid-4">
          <Stat label="Income" value={inr(totals.income)} />
          <Stat label="Spending" value={inr(totals.spending)} />
          <Stat label="Net" value={inrSigned(totals.net)} tone={totals.net < 0 ? 'neg' : ''} />
          <Stat label="Savings rate"
            value={totals.savingsRate === null || totals.savingsRate < -100 ? '—' : `${Math.round(totals.savingsRate)}%`}
            note={totals.savingsRate === null ? 'No income in this period'
              : totals.savingsRate < -100 ? `Spending is ${(totals.spending / totals.income).toFixed(0)}× income` : 'Net ÷ income'} />
        </div>

        <div className="grid grid-wide" style={{ marginTop: 14 }}>
          <Card title="Income and spending by month">
            {monthly.length ? <MonthlyChart data={monthly} /> : <p className="muted small">No months selected.</p>}
          </Card>
          <Card title="Spending by category">
            {unclassified.share > 0.2 && (
              <div className="notice" style={{ marginBottom: 12 }}>
                <Icon name="alert" />
                <span>{Math.round(unclassified.share * 100)}% of spending ({inr(unclassified.amount)}, {unclassified.count} entries) is under “Other” or has no category. Specific categories make this chart more useful.</span>
              </div>
            )}
            <RankedBars items={categories} empty="No spending in this period." />
          </Card>
        </div>

        <div className="grid grid-3" style={{ marginTop: 14 }}>
          <Card title="Largest expenses">
            {topSpending.length ? (
              <ul className="rows">
                {topSpending.map((t, i) => (
                  <li key={i} className="row">
                    <div className="row-main">
                      <div className="row-title">{t.Description}</div>
                      <div className="row-sub">{[formatDay(t.DateISO), t['Account Name'], t.Category].filter(Boolean).join(' · ')}</div>
                    </div>
                    <span className="row-value num">{inr(t.Amount)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted small">No spending in this period.</p>}
          </Card>
          <Card title="Spending by account">
            <RankedBars items={byAccount} empty="No spending in this period." />
          </Card>
          <Card title="Moved between accounts" sub={transfers.count ? `${transfers.count} transfers` : ''}>
            {transfers.count ? (
              <>
                <div className="stat-value num" style={{ marginBottom: 10 }}>{inr(transfers.total)}</div>
                <ul className="rows">
                  {transfers.routes.map(r => (
                    <li key={`${r.from}-${r.to}`} className="row">
                      <div className="row-main">
                        <div className="row-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{r.from}<Icon name="arrow" className="icon muted" />{r.to}</div>
                        <div className="row-sub">{r.count} {r.count === 1 ? 'transfer' : 'transfers'}</div>
                      </div>
                      <span className="row-value num">{inr(r.amount)}</span>
                    </li>
                  ))}
                </ul>
                <p className="hint" style={{ margin: '10px 0 0' }}>Not counted as income or spending.</p>
              </>
            ) : <p className="muted small">No transfers in this period.</p>}
          </Card>
        </div>

        <div className="grid grid-2" style={{ marginTop: 14 }}>
          {instalments.length > 0 && (
            <Card title="Fixed commitments" sub={`${inr(fixedMonthly)} / month`}>
              <ul className="rows">
                {instalments.map((x, i) => (
                  <li key={i} className="row">
                    <div className="row-main">
                      <div className="row-title">{x.category}</div>
                      <div className="row-sub">{inr(x.annually)} a year</div>
                    </div>
                    <span className="row-value num">{inr(x.monthly)}<span className="muted small"> /mo</span></span>
                  </li>
                ))}
                <li className="row row-total">
                  <span className="row-main">Total</span>
                  <span className="row-value num">{inr(instalments.reduce((s, x) => s + x.annually, 0))}<span className="muted small"> /yr</span></span>
                </li>
              </ul>
            </Card>
          )}
          {recurring.length > 0 && (
            <Card title="Repeating expenses" sub="Same description in 2+ months">
              <ul className="rows">
                {recurring.map(r => (
                  <li key={r.description} className="row">
                    <div className="row-main">
                      <div className="row-title">{r.description}</div>
                      <div className="row-sub">{r.monthCount} months</div>
                    </div>
                    <span className="row-value num">{inr(r.total)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </section>
    </>
  );
};

export default OverviewTab;
