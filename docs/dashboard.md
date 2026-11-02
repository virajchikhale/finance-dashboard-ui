# 3. Dashboard

A static React site. It has no server or database of its own: your browser calls the Apps Script URL directly, and nothing is sent anywhere else.

## Run it

Pick one.

**Docker (recommended for keeping it running):**
```bash
docker compose up -d --build     # http://localhost:8080, reachable from this machine only
```
The container is unprivileged nginx with a read-only filesystem, no Linux capabilities and a strict Content-Security-Policy that only allows connections to Google's script hosts.

**Node (for development):** Node 20+.
```bash
npm ci
npm start                        # http://localhost:3000, reloads on save
```

**Any static host** (GitHub Pages, Netlify, Cloudflare Pages, your own nginx):
```bash
npm ci && npm run build          # upload the build/ folder
```
Copy the headers from [`security-headers.inc`](../security-headers.inc) into your host's settings if it supports custom headers, so the page keeps the same protections as the Docker image.

To open it on your phone, use a hosted copy over HTTPS, or the Docker one through a tunnel you control. On iPhone, **Share → Add to Home Screen** makes it open like an app.

## Connect your sheet

On first open, paste:

```
https://script.google.com/macros/s/<id>/exec?key=<READ_KEY>
```

Use the **READ_KEY**, not the WRITE_KEY. The URL is stored only in this browser (local storage) and sent only to Google. Each browser or device is connected separately.

## Settings (gear icon)

- **Monthly spending budget:** drives *Budget left* and the month-end projection. 0 hides them.
- **Credit cards and pay-later accounts:** ticked accounts are shown as money owed and subtracted from net worth. By default, names ending in `CC` or `PL` are ticked.
- **Disconnect sheet:** removes the saved URL and key from this browser.

## What you see

**Overview**
- **This month** (always the current month, ignores filters): spent so far, average per day, projection for the month (from day 7, once a single big purchase no longer dominates), budget left, and fixed monthly commitments from `Instalments`.
- **Net worth** (all entries, ignores filters): bank and cash − card and pay-later dues ± friends. Each account shows its last entry date and is flagged after 7 days without one, so you notice accounts you forgot to update.
- **Selected period** (follows the filters): income, spending, net and savings rate; a monthly income vs spending chart; spending by category with a warning when over 20% is `Other` or uncategorised; largest expenses; spending by account; money moved between accounts; fixed commitments; expenses that repeat across months.

**Transactions:** sortable table (a simple list on phones) of the filtered rows, with CSV export.

**Friends:** what each person owes you or you owe them, and recent friend entries.

Opening balances and transfers never count as income or spending. Months are grouped by year and month, so the same month in two years stays separate.

## Filters

The period buttons (This month, 3 months, 6 months, This year, All time) are always visible. **Filters** in the top bar opens month, type, account, category, date range and search. Filters affect the *Selected period* section, Transactions and Friends' recent entries; balances and net worth always use every entry.

Next (optional): [4. Apple Shortcut](shortcut.md)
