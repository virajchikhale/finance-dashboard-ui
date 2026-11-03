# 4. Apple Shortcut (optional)

Adds an entry from your iPhone in a few taps. Without it you can type rows straight into the sheet.

Files: [`shortcut/add-expense.plist`](../shortcut/add-expense.plist) (the shortcut as readable XML, with placeholders instead of your URL and key) and [`shortcut/make_shortcut.py`](../shortcut/make_shortcut.py).

## What it does

1. Loads friends, categories and accounts from the sheet, most recently used first. If that fails (wrong key, wrong URL) it shows the reason and stops.
2. Asks for amount and description. The date is today.
3. Asks for the type. `Owes`, `Owed` and `Settled` also ask for the friend; `Transfer` also asks for the receiving account.
4. Asks for the category from the list for that type (none for `Transfer` and `Settled`), then the account, and shows a summary. The Name, Category and To Account lines appear only for the types that ask for them.
5. Sends the entry with a unique ID, so a retry after a timeout is never saved twice.
6. Shows **Added Successfully**, or the script's error message (for example *Unknown category "Food" for Debit. Add it to Dropdowns > Category first*).

## Install

You need a Mac to sign it: iPhones only import shortcuts signed by Apple, and only macOS can sign.

```bash
python3 shortcut/make_shortcut.py
#   Web app URL (ends in /exec): https://script.google.com/macros/s/<id>/exec
#   WRITE_KEY: <paste, not shown>
cd shortcut
shortcuts sign --mode anyone -i "Add Expense (unsigned).shortcut" -o "Add Expense.shortcut"
```

Run `shortcuts sign` **inside the `shortcut/` folder**; from elsewhere it fails with *the file couldn't be opened because it isn't in the correct format*. It also needs the Mac to be signed in to iCloud.

AirDrop `Add Expense.shortcut` to the iPhone, open it and tap **Add Shortcut**. Then delete both `.shortcut` files from the Mac: they contain your WRITE_KEY. (`*.shortcut` is git-ignored, so they cannot be committed by accident.)

Optional: on the iPhone, add it to the Home Screen or the Action Button, or say "Hey Siri, Add Expense".

## No Mac?

Build it by hand in the Shortcuts app. The steps, in order:

1. **Text**: `<web app URL>?key=<WRITE_KEY>` → *Set Variable* `url`.
2. **Get Contents of URL**: `url` + `&action=lists` → *Set Variable* `lists`. If **Get Dictionary Value** `error` from `lists` has any value: **Show Alert** with it and **Stop This Shortcut**.
3. **Ask for Input** (Number) "Amount" → `txAmount`; **Ask for Input** (Text) "Description" → `txDescription`.
4. **Current Date** → **Format Date** custom `yyyy-MM-dd` → `txDate`.
5. **List** `Credit, Debit, Transfer, Owes, Owed, Settled` → **Choose from List** → `txTransactionType`.
6. **If** type is `Owed`, `Owes` or `Settled`: **Get Dictionary Value** `friends` from `lists` → **Choose from List** → `txName`.
7. **Get Dictionary Value** `categoriesByType` from `lists` → **Get Dictionary Value** with the key `txTransactionType` → `category`. **If** `category` has any value: **Choose from List** → `txCategory`. Then **Get Dictionary Value** `accounts` → **Choose from List** → `txFromAccount`.
8. **If** type is `Transfer`: **Choose from List** (accounts) → `txToAccount`.
9. **Get Contents of URL**: `url`, Method **POST**, Request Body **Form**, fields `date`, `description`, `amount`, `transactionType`, `name`, `category`, `accountName`, `toAccount`, `id` (for `id` use **Current Date** formatted `yyyyMMddHHmmssSSS` plus a **Random Number**).
10. **Get Dictionary Value** `row` from the response. **If** it has any value: **Show Alert** "Added Successfully"; **Otherwise**: show **Get Dictionary Value** `error`.

## Changing the shortcut

Edit it on the phone, then turn your version back into the XML file so the repo stays current:

1. On the iPhone: **Share → Copy iCloud Link**.
2. Download and convert (replace `<id>` with the last part of the link):
   ```bash
   curl -s https://www.icloud.com/shortcuts/api/records/<id> \
     | python3 -c "import json,sys; print(json.load(sys.stdin)['fields']['shortcut']['value']['downloadURL'].replace('\${f}','x.shortcut'))" \
     | xargs curl -s -o downloaded.shortcut
   python3 -c "import plistlib,sys; d=plistlib.load(open('downloaded.shortcut','rb')); plistlib.dump(d, open('shortcut/add-expense.plist','wb'), sort_keys=True)"
   rm downloaded.shortcut
   ```
3. In `shortcut/add-expense.plist`, change the first Text step back to exactly `YOUR_WEB_APP_URL?key=YOUR_WRITE_KEY` before committing.

An iCloud link exposes everything inside the shortcut, including the key, to anyone who has the link. Change the `WRITE_KEY` afterwards if the link was shared beyond you.

Day-to-day use: [usage.md](usage.md)
