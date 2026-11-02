# Finance Dashboard

A personal-finance dashboard (React) that reads your own Google Sheet through a small Google Apps Script web app. The same script also takes new entries from an Apple Shortcut. Overview KPIs and charts, transactions with filters, friends' owes / owed balances, instalments and a monthly budget bar. There is no backend server of its own: the browser talks directly to your Apps Script URL.

## How it works

```
Google Sheet  ->  Apps Script web app (apps-script/Code.gs, protected by an API key)  ->  this React app (static site)
 (Records, Instalments, Dropdowns)                        JSON over HTTPS            charts, filters, budget
```

## Setup

1. **Sheet:** create tabs named `Records`, `Instalments` and `Dropdowns` with the column headers the app reads (see `src/hooks/useSheetData.js`).
2. **Apps Script:** Extensions > Apps Script, paste `apps-script/Code.gs`. Then **Project Settings > Script properties > Add `API_KEY`** with a long random value (`openssl rand -hex 24`). The key lives only in your script settings, never in this repo. Without it the endpoint refuses every request.
3. **Deploy** the script as a Web app (Execute as *Me*, access *Anyone*). Your data is protected by the API key, not by the URL being secret.
4. **Open the dashboard** and paste `https://script.google.com/macros/s/<id>/exec?key=<API_KEY>`. The URL is kept only in your browser's local storage and is sent only to Google.

## Adding entries (Apple Shortcut)

`apps-script/Code.gs` has two calls for the Shortcut (the Shortcut itself is in [`shortcut/`](shortcut/README.md)), both with `?key=<API_KEY>` on the URL:

- `GET <web app URL>?key=…&action=lists` returns `{ categories, accounts, friends, types }` from the `Dropdowns` tab. Use it for the Shortcut's "Choose from List" steps, so a new friend or account only has to be added in the sheet.
- `POST <web app URL>?key=…` with form fields (or a JSON body) adds one row to `Records`. It replies with `{ success: true, row }`, or `{ success: false, error }` saying what is wrong.

| Field | Rule |
|---|---|
| `date` | `YYYY-MM-DD`; empty means today |
| `description` | required |
| `amount` | positive number; `1,250` is fine |
| `transactionType` | `Credit`, `Debit`, `Transfer`, `Owes`, `Owed` or `Settled` (old `Transferd` / `Setteled` are saved under the new names) |
| `category` | from `Dropdowns > Category`, or `Opening Balance`; required for `Debit` |
| `accountName` | from `Dropdowns > Bank Accounts` |
| `toAccount` | `Transfer` only; a different bank account |
| `name` | `Owes` / `Owed` / `Settled` only; from `Dropdowns > Friends` |
| `id` | a UUID from the Shortcut's "Get UUID" step. The same id is never saved twice, so retries are safe |

The script fills `ID` and `Entered At` columns itself (and adds the headers if missing), takes a lock so two quick submissions don't collide, and copies the dropdowns and formats of the row above. There is no balance check: the sheet already works out balances, and credit card accounts go below zero by design.

**Opening balances** (when starting a fresh sheet): one `Credit` row per account (`Debit` if the balance is negative) and one `Owes` / `Owed` row per friend, all with category `Opening Balance`. Leave the account empty on the friend rows so no account moves. The dashboard counts these toward balances but not toward income, spending or charts.

## Run

```bash
docker compose up -d --build       # http://localhost:8080 (bound to 127.0.0.1)
# or for development
npm ci && npm start
```

Container: unprivileged nginx, read-only filesystem, all capabilities dropped, strict Content-Security-Policy (connects only to `script.google.com` / `script.googleusercontent.com`), health check.

## Tests

```bash
npm test -- --watchAll=false
```

Covers the setup screen, URL validation (including look-alike hosts such as `evilscript.google.com`), how API errors such as *Unauthorized* are surfaced, and `apps-script/Code.gs` itself (validation, duplicate ids, opening balances, dropdown lists), which `src/sheetApi.test.js` runs against an in-memory fake sheet.

## Security notes

- **Rotate the old key.** An earlier version of `Code.gs` shipped a hard-coded key (`mypf2025`) and had the check commented out. Anyone who had the deployment URL could read the sheet. Redeploy with the new `Code.gs` and a fresh `API_KEY`, and treat any data that was reachable before as exposed.
- The API key is part of the URL you paste, so anyone who can read your browser profile can read your data; do not use shared computers.
- `react-scripts` (Create React App) is a build-time tool only and has known advisories in its toolchain; the shipped bundle depends only on React, Recharts and web-vitals (`npm audit --omit=dev` is clean). Migrating to Vite would remove the toolchain findings.

## Branches

`feat/supa-support` (6 commits ahead of `main`) is an unmerged experiment that adds a Supabase-backed version with sign-in and a sensitive-value masking context. It is a different architecture from this branch; merge or retire it deliberately.
