# Finance Dashboard

A personal finance dashboard for a Google Sheet. Add entries from your iPhone with an Apple Shortcut, see where your money goes on any screen. No server, no database, no sign-up: the sheet is the database, a small Apps Script is the API, and the dashboard is a static page that talks only to Google.

```
 iPhone Shortcut ──POST (WRITE_KEY)──┐
                                     ▼
                     Apps Script web app  ◄──►  Google Sheet
                                     ▲        (Records, Dropdowns, Instalments)
 Dashboard (browser) ──GET (READ_KEY)─┘
```

**What it shows:** this month's spending, daily average and projection against a budget; net worth with credit card dues and friends' balances; spending by category, account and month; transfers between your own accounts; fixed commitments; what each friend owes. Works on phones, follows the system light/dark setting.

## Setup roadmap

About 20 minutes. Steps 1–3 are all you need; step 4 is optional.

| Step | What you do | Time | Guide |
|---|---|---|---|
| 1. Sheet | Create a spreadsheet and import the three template tabs | 5 min | [docs/sheet.md](docs/sheet.md) |
| 2. Apps Script | Paste two files, set `READ_KEY` and `WRITE_KEY`, deploy as a web app | 7 min | [docs/apps-script.md](docs/apps-script.md) |
| 3. Dashboard | Run it (Docker, Node or any static host) and paste `<web app URL>?key=<READ_KEY>` | 5 min | [docs/dashboard.md](docs/dashboard.md) |
| 4. Shortcut *(optional)* | Fill in your URL and `WRITE_KEY`, sign on a Mac, AirDrop to the iPhone | 5 min | [docs/shortcut.md](docs/shortcut.md) |

The shortest path, if you have Docker:

```bash
# 1. sheets.new → File → Import → docs/templates/Records.csv, Dropdowns.csv, Instalments.csv
# 2. Extensions → Apps Script → paste apps-script/Code.gs and apps-script/appsscript.json
openssl rand -hex 24   # READ_KEY  → Project Settings → Script properties
openssl rand -hex 24   # WRITE_KEY → Project Settings → Script properties
#    Deploy → New deployment → Web app (Execute as: Me, Access: Anyone) → copy the URL
# 3.
docker compose up -d --build     # open http://localhost:8080, paste <URL>?key=<READ_KEY>
```

## Documentation

| Guide | For |
|---|---|
| [Sheet](docs/sheet.md) | tabs, columns, dropdowns, starting balances |
| [Apps Script](docs/apps-script.md) | installing, keys, deploying, updating |
| [Dashboard](docs/dashboard.md) | running, hosting, connecting, settings, what each part means |
| [Shortcut](docs/shortcut.md) | building, signing, installing, editing |
| [Recording money](docs/usage.md) | which transaction type to use, categories, a simple routine |
| [API reference](docs/api.md) | endpoints, fields, replies |
| [Security](docs/security.md) | how data is protected, limits, what to do if a key leaks, checklist before going public |
| [Troubleshooting](docs/troubleshooting.md) | common errors and fixes |

## Repository

```
apps-script/   Code.gs (the API) and appsscript.json (manifest: this sheet only, web app settings)
shortcut/      add-expense.plist (the Shortcut, key-less) and make_shortcut.py (fills in URL + key)
docs/          the guides above and templates/ (CSV tabs to import)
src/           the React dashboard (calculations in src/utils/insights.js)
Dockerfile, docker-compose.yml, nginx.conf, security-headers.inc   container and page security headers
```

## Development

```bash
npm ci
npm start                          # dev server on http://localhost:3000
npm test -- --watchAll=false       # dashboard calculations, rendering, and Code.gs against a fake sheet
npm run build                      # static site in build/
```

`src/sheetApi.test.js` runs `apps-script/Code.gs` against an in-memory sheet (keys, validation, duplicate IDs, lists), so the API is tested without Google.

The `feat/supa-support` branch is an unmerged experiment with a Supabase backend and sign-in; it is a different architecture from this one.
