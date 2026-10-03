# Finance Dashboard

A personal-finance dashboard (React) that reads your own Google Sheet through a small Google Apps Script web app. Overview KPIs and charts, transactions with filters, friends' owes / owed balances, instalments and a monthly budget bar. There is no backend server of its own: the browser talks directly to your Apps Script URL.

## How it works

```
Google Sheet  ->  Apps Script web app (Code.gs, protected by an API key)  ->  this React app (static site)
 (Records, Instalments, Dropdowns)                        JSON over HTTPS            charts, filters, budget
```

## Setup

1. **Sheet:** create tabs named `Records`, `Instalments` and `Dropdowns` with the column headers the app reads (see `src/hooks/useSheetData.js`).
2. **Apps Script:** Extensions > Apps Script, paste `Code.gs`. Then **Project Settings > Script properties > Add `API_KEY`** with a long random value (`openssl rand -hex 24`). The key lives only in your script settings, never in this repo. Without it the endpoint refuses every request.
3. **Deploy** the script as a Web app (Execute as *Me*, access *Anyone*). Your data is protected by the API key, not by the URL being secret.
4. **Open the dashboard** and paste `https://script.google.com/macros/s/<id>/exec?key=<API_KEY>`. The URL is kept only in your browser's local storage and is sent only to Google.

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

Covers the setup screen, URL validation (including look-alike hosts such as `evilscript.google.com`) and how API errors such as *Unauthorized* are surfaced.

## Security notes

- **Rotate the old key.** An earlier version of `Code.gs` shipped a hard-coded key (`mypf2025`) and had the check commented out. Anyone who had the deployment URL could read the sheet. Redeploy with the new `Code.gs` and a fresh `API_KEY`, and treat any data that was reachable before as exposed.
- The API key is part of the URL you paste, so anyone who can read your browser profile can read your data; do not use shared computers.
- `react-scripts` (Create React App) is a build-time tool only and has known advisories in its toolchain; the shipped bundle depends only on React, Recharts and web-vitals (`npm audit --omit=dev` is clean). Migrating to Vite would remove the toolchain findings.

## Branches

`feat/supa-support` (6 commits ahead of `main`) is an unmerged experiment that adds a Supabase-backed version with sign-in and a sensitive-value masking context. It is a different architecture from this branch; merge or retire it deliberately.
