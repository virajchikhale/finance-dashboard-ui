#!/usr/bin/env python3
"""Builds the importable "Add Expense" shortcut from add-expense.plist with your API key filled in.

    python3 shortcut/make_shortcut.py                  # asks for the key (not echoed, not saved in shell history)
    python3 shortcut/make_shortcut.py --url <web app URL ending in /exec>   # if the deployment URL changed

Writes "shortcut/Add Expense (unsigned).shortcut" (git-ignored, it contains the key). Sign it on a Mac before
importing it on the iPhone: see shortcut/README.md.
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
PLACEHOLDER = 'YOUR_API_KEY'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--url', help='Apps Script web app URL (…/exec). Default: the one already in the shortcut')
    args = ap.parse_args()

    key = getpass.getpass('API_KEY (same value as the Apps Script property): ').strip()
    if len(key) < 16 or not re.fullmatch(r'[A-Za-z0-9_-]+', key):
        sys.exit('The key must be 16+ characters of letters, digits, "-" or "_" (e.g. from `openssl rand -hex 24`).')

    shortcut = plistlib.loads(SOURCE.read_bytes())
    step = shortcut['WFWorkflowActions'][0]['WFWorkflowActionParameters']  # the first Text step holds the URL
    url, _, old_key = step['WFTextActionText'].partition('?key=')
    if old_key != PLACEHOLDER:
        sys.exit(f'{SOURCE.name} should hold "{PLACEHOLDER}" in its first step; found something else.')
    if args.url:
        if not re.fullmatch(r'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec', args.url):
            sys.exit('--url must look like https://script.google.com/macros/s/<id>/exec')
        url = args.url
    step['WFTextActionText'] = f'{url}?key={key}'

    OUTPUT.write_bytes(plistlib.dumps(shortcut, fmt=plistlib.FMT_BINARY))
    print(f'Wrote {OUTPUT}\nNext, on a Mac:  shortcuts sign --mode anyone -i "{OUTPUT.name}" -o "Add Expense.shortcut"')


if __name__ == '__main__':
    main()
