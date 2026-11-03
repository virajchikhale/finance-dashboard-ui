# API reference

The web app URL from [apps-script.md](apps-script.md) is the base. Every call carries `key` as a query parameter.

| Call | Key | Returns |
|---|---|---|
| `GET ?key=…` | `READ_KEY` | `{ Records: [...], Instalments: [...], Dropdowns: [...] }`, one object per non-empty row, keyed by header. Dates are ISO strings. |
| `GET ?key=…&action=lists` | `READ_KEY` or `WRITE_KEY` | `{ categories: [], categoriesByType: { Debit: [], Credit: [], Owes: [], Owed: [] }, accounts: [], friends: [], types: [] }` from `Dropdowns` (blank cells skipped, most recently used first). `categories` is the Debit list, kept for older Shortcuts |
| `POST ?key=…` | `WRITE_KEY` | adds one row to `Records` |

A wrong or missing key returns `{ "error": "Unauthorized" }` (GET) or `{ "success": false, "error": "Unauthorized" }` (POST), with HTTP 200, as Apps Script cannot set status codes.

## POST fields

Send them as form fields (`application/x-www-form-urlencoded`) or as a JSON body (`Content-Type: application/json`).

| Field | Rule |
|---|---|
| `date` | `YYYY-MM-DD` (other formats `Date()` understands also work); empty means today |
| `description` | required |
| `amount` | required, positive; `1,250` is accepted |
| `transactionType` | `Credit`, `Debit`, `Transfer`, `Owes`, `Owed` or `Settled`. Old spellings `Transferd` / `Setteled` are saved under the new names |
| `category` | from the list for the type, or `Opening Balance`: `Debit` → `Category`, `Credit` → `Credit Category`, `Owes` / `Owed` → `Friend Category`. Required for `Debit`. Ignored (saved empty) for `Transfer` and `Settled` |
| `accountName` | from `Dropdowns > Bank Accounts`; required, except for `Owes`, `Settled` and a friend's opening balance |
| `toAccount` | `Transfer` only; a different account from the list |
| `name` | required for `Owes` / `Owed` / `Settled`; from `Dropdowns > Friends`. Kept but not checked for other types |
| `id` | optional, recommended. A repeated `id` is not saved again; the reply then has `duplicate: true` and the original row |

Replies:

```json
{ "success": true, "row": 42 }
{ "success": true, "duplicate": true, "row": 42 }
{ "success": false, "error": "Unknown account \"Wallet\". Add it to Dropdowns first" }
```

## What the script does on each POST

1. Checks the key, then every field against the rules above.
2. Takes a lock, so two submissions at the same moment cannot land on the same row.
3. Adds `ID` and `Entered At` headers if the sheet does not have them yet.
4. Writes the row by header name (column order does not matter), with a real date and number.
5. Copies the dropdown rules and formats of the row above.

There is deliberately no balance check: the sheet works balances out itself, and credit card accounts go below zero by design.
