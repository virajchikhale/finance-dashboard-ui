# Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Dashboard: *Could not load data: Unauthorized* | The key in the URL is wrong, or is the `WRITE_KEY`. Settings → Disconnect, then connect with `?key=<READ_KEY>`. |
| *Server not configured: set the READ_KEY and WRITE_KEY…* | One or both script properties are missing or shorter than 32 characters. See [apps-script.md](apps-script.md#create-the-two-keys). |
| *READ_KEY and WRITE_KEY must be different* | You used the same value for both. Generate a second key. |
| Dashboard loads but is empty | The tab is not named exactly `Records`, or the `Date` column has no real dates. |
| Changes to `Code.gs` have no effect | The deployment still runs the old version. Deploy → Manage deployments → Edit → **New version**. |
| The URL changed after redeploying | You used *New deployment* instead of editing the existing one. Update the dashboard and Shortcut, or delete the new deployment and edit the old one. |
| Shortcut: *Could not load lists: Unauthorized* | The Shortcut has an old or wrong key. Rebuild it with the current `WRITE_KEY` ([shortcut.md](shortcut.md)). |
| Shortcut: *Unknown category / account / friend* | The value is not in `Dropdowns`, or the category is in the list for another type (Debit uses `Category`, Credit `Credit Category`, Owes / Owed `Friend Category`). Add it there; the Shortcut shows it next time. |
| Shortcut asks no category for Credit / Owes / Owed | `Credit Category` or `Friend Category` is missing from `Dropdowns` (check the header spelling) or is empty. |
| Shortcut: *category is required for Debit* | You picked no category for a Debit. Choose one (or `Other`). |
| `shortcuts sign`: *isn't in the correct format* | Run it inside the `shortcut/` folder, where `make_shortcut.py` wrote the file. |
| Opening balances show up as income | Their category is not exactly `Opening Balance`. |
| A credit card shows as a bank balance | Tick it under Settings → Credit cards and pay-later accounts. |
| An account says *No entries for N days* | Nothing was recorded on it for over a week; compare it with the bank app. |
| Dates are a day off | `timeZone` in `appsscript.json` does not match where you live. |
