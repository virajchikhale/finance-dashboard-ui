#!/usr/bin/env python3
"""Builds the importable "Add Expense" shortcut from add-expense.plist with your web app URL and WRITE_KEY.

    python3 shortcut/make_shortcut.py
        asks for the URL and the key (the key is not echoed and not saved in shell history)
    python3 shortcut/make_shortcut.py --url https://script.google.com/macros/s/<id>/exec

Writes "shortcut/Add Expense (unsigned).shortcut" (git-ignored: it contains the key).
Sign it on a Mac before importing it on the iPhone; see docs/shortcut.md.
"""
import argparse
import getpass
import plistlib
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'add-expense.plist'
OUTPUT = HERE / 'Add Expense (unsigned).shortcut'
PLACEHOLDER = 'YOUR_WEB_APP_URL?key=YOUR_WRITE_KEY'
URL_RE = re.compile(r'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--url', help='Apps Script web app URL, ending in /exec')
    args = ap.parse_args()

    url = (args.url or input('Web app URL (ends in /exec): ')).strip()
    if not URL_RE.fullmatch(url):
        sys.exit('The URL must look like https://script.google.com/macros/s/<id>/exec (no ?key=…).')
    key = getpass.getpass('WRITE_KEY (the Apps Script property, not the READ_KEY): ').strip()
    if len(key) < 32 or not re.fullmatch(r'[A-Za-z0-9_-]+', key):
        sys.exit('The key must be 32+ characters of letters, digits, "-" or "_" (e.g. from `openssl rand -hex 24`).')

    shortcut = plistlib.loads(SOURCE.read_bytes())
    step = shortcut['WFWorkflowActions'][0]['WFWorkflowActionParameters']  # the first Text step holds URL + key
    if step['WFTextActionText'] != PLACEHOLDER:
        sys.exit(f'{SOURCE.name} should hold "{PLACEHOLDER}" in its first step; found something else.')
    step['WFTextActionText'] = f'{url}?key={key}'

    OUTPUT.write_bytes(plistlib.dumps(shortcut, fmt=plistlib.FMT_BINARY))
    print(f'Wrote {OUTPUT}')
    print(f'Next, on a Mac:  cd shortcut && shortcuts sign --mode anyone -i "{OUTPUT.name}" -o "Add Expense.shortcut"')


if __name__ == '__main__':
    main()
