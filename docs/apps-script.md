# 2. Apps Script (the API)

A small script attached to your sheet turns it into a private JSON API. The dashboard reads through it and the Shortcut writes through it. Files: [`apps-script/Code.gs`](../apps-script/Code.gs) and [`apps-script/appsscript.json`](../apps-script/appsscript.json).

## Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with [`apps-script/Code.gs`](../apps-script/Code.gs).
3. **Project Settings** (gear icon) → tick **Show "appsscript.json" manifest file in editor**. Back in the editor, replace `appsscript.json` with [`apps-script/appsscript.json`](../apps-script/appsscript.json). Change `timeZone` if you are not in India; dates are read in this zone.
4. Save (Ctrl/Cmd + S).

The manifest limits the script to **this one spreadsheet** (`spreadsheets.currentonly`): it cannot open any other file in your Drive.

## Create the two keys

| Script property | Used by | Can do |
|---|---|---|
| `READ_KEY` | the dashboard | read `Records`, `Instalments`, `Dropdowns` |
| `WRITE_KEY` | the Shortcut | add rows, read the dropdown lists (no amounts) |

Keeping them separate means a leaked dashboard URL cannot add entries, and a leaked Shortcut cannot read your records.

1. Generate two different keys (32+ characters):
   ```bash
   openssl rand -hex 24   # run twice
   ```
   No terminal? Use a password manager's generator (letters and digits only, 40+ characters).
2. **Project Settings → Script properties → Add script property**: `READ_KEY` = first key, `WRITE_KEY` = second key. Save.

The keys live only in the script's settings, never in the code or in git. If either is missing, shorter than 32 characters, or both are the same, every request is refused.

## Deploy

1. **Deploy → New deployment → Select type: Web app**.
2. **Execute as: Me**, **Who has access: Anyone**. (Anyone can reach the URL; only requests with a key get an answer.)
3. **Deploy**, then authorise: Google lists one permission, *view and manage spreadsheets that this application has been installed in*. If it warns that the app isn't verified, choose **Advanced → Go to … (unsafe)**: it is your own script.
4. Copy the **Web app URL** (ends in `/exec`).

## Check it

Replace the URL and keys, then run:

```bash
URL='https://script.google.com/macros/s/<id>/exec'
curl -sL "$URL?key=<READ_KEY>" | head -c 300; echo            # {"Records":[...],"Dropdowns":[...],...}
curl -sL "$URL?key=<WRITE_KEY>&action=lists"; echo             # {"categories":[...],"categoriesByType":{...},"accounts":[...],...}
curl -sL "$URL?key=<WRITE_KEY>"; echo                          # {"error":"Unauthorized"}: the write key cannot read records
curl -sL "$URL?key=<WRITE_KEY>" -d description=Test -d amount=1 -d transactionType=Debit -d category=Other -d accountName=Cash; echo
#                                                                {"success":true,"row":N}; delete that test row afterwards
```

No terminal? Open the first URL in a browser; you should see JSON, not an error.

## Updating the script later

Paste the new code, then **Deploy → Manage deployments → (pencil) Edit → Version: New version → Deploy**. This keeps the same URL, so the dashboard and Shortcut keep working. A **New deployment** would create a different URL.

## Changing a key

Edit the property under **Project Settings → Script properties**; it applies immediately, no redeploy needed. Then update whatever used the old key:

- `READ_KEY` → in the dashboard, **Settings → Disconnect sheet** and connect again with the new URL.
- `WRITE_KEY` → rebuild and reinstall the Shortcut ([shortcut.md](shortcut.md)).

Endpoint and field details: [api.md](api.md).

Next: [3. Dashboard](dashboard.md)
