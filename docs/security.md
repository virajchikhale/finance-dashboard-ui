# Security

## How your data is protected

- **The dashboard stores no data.** It is a static page; each visitor connects their own sheet, and their browser talks only to Google. Hosting it publicly shares nobody's finances.
- **The script answers only with a key.** Anyone can reach the web app URL, but without a valid key every request gets `Unauthorized`. Keys are 32+ random characters, far beyond guessing.
- **Two keys with separate powers.** `READ_KEY` (dashboard) can read but not write. `WRITE_KEY` (Shortcut) can add rows and read the dropdown lists, but cannot read your records.
- **The script can only touch this spreadsheet.** The manifest asks for `spreadsheets.currentonly`, so even a mistaken edit to the code cannot reach your other Drive files.
- **The page is locked down.** Strict Content-Security-Policy (no outside scripts, connections only to Google's script hosts), `no-referrer`, no framing, no camera/microphone/location. React escapes everything shown from the sheet.

## Limits to know

- **The key is part of a URL.** It is stored in the browser that connects to the dashboard (scrambled, not encrypted) and appears in Google's own request logs. Anyone with access to that browser profile can recover it. Do not connect the dashboard on shared computers.
- **The Shortcut contains the WRITE_KEY.** Sharing the shortcut or its iCloud link shares the key.
- **Apps Script quotas are per Google account.** A stranger who knows the URL cannot get data, but could make many requests and use up your daily quota. Keep the URL private; it is not a secret, but there is no reason to publish it.
- **Public tunnels and demos** (for example Cloudflare quick tunnels) make a page reachable by anyone with the link. Only demo with sample data.

## If a key leaks

Change it in **Apps Script → Project Settings → Script properties** (effective immediately), then reconnect the dashboard (`READ_KEY`) or rebuild the Shortcut (`WRITE_KEY`). Check `Records` for rows you did not add; the `Entered At` column shows when each row arrived.

## Before making the repository public

- [ ] No key in any file: `git grep -nE '[0-9a-f]{40,}' $(git rev-list --all)` finds nothing that is yours.
- [ ] `shortcut/add-expense.plist` holds `YOUR_WEB_APP_URL?key=YOUR_WRITE_KEY`, not your URL.
- [ ] Any key that ever appeared in the history no longer works. The old hard-coded `mypf2025` from early commits is refused by the current script.
- [ ] No exported transactions (`.csv`, `.xlsx`) or `.env` files in any commit: `git log --all --name-only --format= | sort -u`.
- [ ] The deployed script is the current `Code.gs` with `READ_KEY` and `WRITE_KEY` set.

## Build tooling

`react-scripts` (Create React App) has known advisories in its build toolchain. It is not part of the page that runs in the browser, which depends only on React and Recharts (`npm audit --omit=dev` is clean). Moving to Vite would remove those findings.
