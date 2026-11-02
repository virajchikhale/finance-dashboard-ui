# Add Expense (Apple Shortcut)

`add-expense.plist` is the iPhone Shortcut that adds a row to the sheet through `apps-script/Code.gs`. It is kept as readable XML with `YOUR_API_KEY` in place of the key, so it can be reviewed and diffed. The key itself is never committed.

## What it does

1. Loads friends, categories and accounts from the sheet (`GET …&action=lists`). If that fails (for example a wrong key) it shows the reason and stops.
2. Asks for amount and description. The date is today (`yyyy-MM-dd`).
3. Asks for the type: Credit, Debit, Transfer, Owes, Owed or Settled.
   - Owes, Owed and Settled also ask for the friend.
   - Transfer also asks for the target account.
4. Asks for the category and the account, then shows a summary.
5. Sends the entry with a unique `id` (time plus a random number), so a retry is never saved twice.
6. Shows "Added Successfully", or the script's error message.

## Install on the iPhone

iOS imports only shortcuts signed by Apple, and signing needs a Mac.

```bash
python3 shortcut/make_shortcut.py          # asks for the API_KEY; writes "Add Expense (unsigned).shortcut"
# on a Mac:
shortcuts sign --mode anyone -i "Add Expense (unsigned).shortcut" -o "Add Expense.shortcut"
```

AirDrop `Add Expense.shortcut` to the phone and open it. Delete both `.shortcut` files afterwards, since they contain the key (`*.shortcut` is git-ignored).

Without a Mac, make the same changes by hand in the Shortcuts app on the old shortcut. The list above is the target.

## Changing it

Edit the shortcut on the phone, share it as an iCloud link, and decode it to XML again:

```bash
curl -s https://www.icloud.com/shortcuts/api/records/<id>   # fields.shortcut.value.downloadURL is the plist
python3 -c "import plistlib,sys; d=plistlib.load(open(sys.argv[1],'rb')); plistlib.dump(d, open('shortcut/add-expense.plist','wb'), sort_keys=True)" downloaded.plist
```

Replace the key in the first step with `YOUR_API_KEY` before committing.
