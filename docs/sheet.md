# 1. Google Sheet

The sheet is the database. The dashboard reads three tabs; any other tabs (your own reports, formulas) are ignored and keep working.

| Tab | Required | What it holds |
|---|---|---|
| `Records` | yes | one row per transaction |
| `Dropdowns` | yes | the allowed categories, accounts and friends |
| `Instalments` | no | fixed yearly costs (insurance, subscriptions) |

Tab names and column headers must match exactly (case and spaces included). Columns are found by header, so their order does not matter, and extra columns are ignored.

## Fastest way: import the templates

The files in [`templates/`](templates/) are ready-made tabs with headers and a few example rows.

1. Create a new spreadsheet at [sheets.new](https://sheets.new).
2. **File → Import → Upload** [`Records.csv`](templates/Records.csv), choose **Insert new sheet(s)**, and turn off **Convert text to numbers, dates and formulas** only if your dates come out wrong.
3. Repeat for [`Dropdowns.csv`](templates/Dropdowns.csv) and [`Instalments.csv`](templates/Instalments.csv).
4. Rename the new tabs to exactly `Records`, `Dropdowns` and `Instalments` if Sheets named them differently, and delete the empty `Sheet1`.
5. Replace the example rows with your own (keep the header row).

## Records

| Column | Content |
|---|---|
| `Date` | a real date (the script writes dates, not text) |
| `Description` | what it was |
| `Name` | the friend, for `Owes` / `Owed` / `Settled`; otherwise empty |
| `Amount` | always positive; the type gives the direction |
| `Transaction Type` | `Credit`, `Debit`, `Transfer`, `Owes`, `Owed` or `Settled` (see [usage.md](usage.md)) |
| `Category` | from `Dropdowns > Category`, or `Opening Balance` |
| `Account Name` | from `Dropdowns > Bank Accounts` |
| `To Account` | the receiving account, for `Transfer` only |
| `ID` | filled by the script; stops a retried Shortcut entry being saved twice |
| `Entered At` | filled by the script: when the row was added |

`ID` and `Entered At` are added automatically on the first entry if they are missing.

### Optional: dropdowns in the sheet itself

So rows typed by hand use the same names as the Shortcut:

1. Select the `Category` column in `Records` (from row 2 down).
2. **Data → Data validation → Add rule → Dropdown (from a range)**, range `Dropdowns!A2:A`.
3. Do the same for `Account Name` and `To Account` (`Dropdowns!B2:B`), `Name` (`Dropdowns!C2:C`), and `Transaction Type` with the six fixed values.

The script copies these rules to each new row it adds.

## Dropdowns

Three columns with the headers `Category`, `Bank Accounts` and `Friends`. Blank cells are ignored, and the columns can have different lengths. The Shortcut shows exactly these lists, and the script rejects anything not in them, so adding a friend or account here is all it takes.

Keep `Other` in the category list if you want a catch-all (the dashboard warns when it grows past 20% of spending), and add `Opening Balance` so hand-typed opening rows pass the sheet's own validation.

## Instalments

| Column | Content |
|---|---|
| `Category` | name of the commitment |
| `Annually` | yearly amount |
| `Monthly`, `Daily` | usually formulas: `=F2/12`, `=F2/365` |
| `Quarterly`, `Half annually` | optional, not used by the dashboard |

Rows without a name or with a zero yearly amount are skipped. The total appears on the dashboard as fixed monthly commitments.

## Starting fresh (for example on the 1st of a month)

Enter where you stand on day one, all with category `Opening Balance`:

- **Each bank account and cash:** a `Credit` row with the current balance.
- **Each credit card or pay-later account:** a `Debit` row with the amount currently owed.
- **Each friend with an open balance:** an `Owed` row if they owe you, or an `Owes` row if you owe them, with **Account Name left empty** so no account changes.

These rows set balances and net worth but never count as income or spending.

Next: [2. Apps Script](apps-script.md)
