# Recording money

## Transaction types

Amounts are always positive. The type says which way the money moved.

| Type | Use it for | Account | Friend balance | Counts as |
|---|---|---|---|---|
| `Credit` | money coming in: salary, refunds, interest | + amount | — | income |
| `Debit` | money going out: purchases, bills, card spending | − amount | — | spending |
| `Transfer` | moving money between your own accounts, paying a card bill | − from `Account Name`, + to `To Account` | — | neither |
| `Owed` | you paid for a friend or lent them money (money is owed to you) | − amount | they owe you + amount | neither |
| `Owes` | a friend paid for you or lent you money (you owe them) | + amount if they gave you money; leave the account empty if they paid a shop for you (in the sheet: the Shortcut always asks for an account) | you owe them + amount | neither |
| `Settled` | a note that a debt was cleared | no change | no change | neither |

`Owed` and `Owes` move value between your accounts and your friends, so they never change net worth: paying ₹500 for a friend takes ₹500 out of your account and adds ₹500 that they owe you.

When a friend pays you back, record the opposite entry: they owed you ₹500 (`Owed`), so their repayment is an `Owes` of ₹500 into the account it arrived in. That brings their balance back to zero. `Settled` is only a note and does not change any balance.

Paying a credit card bill from your bank is a `Transfer` from the bank to the card, not a `Debit`: the spending was already recorded when you used the card.

## Categories

- Pick the closest specific category; use `Other` only when nothing fits. The dashboard warns when `Other` or blank categories exceed 20% of spending, because the category chart is not much use beyond that.
- Each type has its own list in `Dropdowns`: `Category` for Debit, `Credit Category` for Credit, `Friend Category` for Owes and Owed. Transfer and Settled have no category. The Shortcut picks up new entries on its next run.
- `Opening Balance` is reserved for starting balances (see [sheet.md](sheet.md#starting-fresh-for-example-on-the-1st-of-a-month)).

## Accounts

- Add accounts in `Dropdowns > Bank Accounts`.
- Mark credit cards and pay-later accounts in the dashboard's **Settings** so they count as money owed. Names ending in `CC` or `PL` are marked automatically.
- An account flagged *No entries for N days* is usually one you forgot to update. Compare it with the bank app and add what is missing.

## A simple routine

- **Daily or as it happens:** add entries with the Shortcut.
- **Weekly:** open the dashboard, check accounts flagged as stale and the *Other* warning.
- **Monthly:** compare each account with the bank app. If something does not match, add a correcting `Credit` or `Debit` with a clear description rather than editing old rows.
