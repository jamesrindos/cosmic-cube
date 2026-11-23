#!/usr/bin/env python3
"""Add new cards to the ad format swipe file (public/formats/index.html).

usage: formats_add.py <index.html> <new.json> <through-utc-iso> <updated-display-date> [skipped-path ...]

new.json     a JSON list of card records, newest first (may be []). They go at the start of the
             page's data array, so they show first in their stage.
through      UTC time of the newest DM message that has now been processed.
updated      display date for the footer, like "Nov 24, 2026". Only used when cards are added.
skipped-path post paths ("/reel/CODE/" or "/p/CODE/") that were looked at and deliberately not added.
             They are remembered in the sync block so later runs don't reconsider them.

Only the two JSON blocks in the page are changed.
"""
import json, re, sys

if len(sys.argv) < 5:
    sys.exit(__doc__)
page, new_path, through, updated = sys.argv[1:5]
skipped = sys.argv[5:]
src = open(page, encoding='utf-8').read()
PATH = r'/(p|reel)/[A-Za-z0-9_-]+/'


def block(name, text):
    m = re.search(r'<script id="%s" type="application/json">(.*?)</script>' % name, text, re.S)
    if not m:
        sys.exit('block not found: ' + name)
    return m


def dump(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')


if not re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z', through):
    sys.exit('through must be a UTC ISO time like 2026-11-24T19:30:00Z')

m = block('data', src)
data = json.loads(m.group(1))
sync = json.loads(block('sync', src).group(1))
new = json.load(open(new_path, encoding='utf-8'))
if not new and not skipped:
    sys.exit('nothing to add or skip')

seen = {r['u'] for r in data} | set(sync.get('skipped', []))
for r in new:
    missing = [k for k in ('s', 'n', 'd', 'h', 'u', 'by', 'on', 'e') if not r.get(k)]
    if missing:
        sys.exit('record %s is missing %s' % (r.get('u'), missing))
    if r['s'] not in ('tof', 'mof', 'bof') or r['e'] not in ('v', 'i', 'w', 'x') or r['by'] not in ('James', 'Nate'):
        sys.exit('bad value in record ' + r['u'])
    if not re.fullmatch(PATH, r['u']):
        sys.exit('bad url path ' + r['u'])
    if set(r) - {'s', 'n', 'd', 'h', 'u', 'by', 'on', 'e'}:
        sys.exit('unexpected field in new record %s (new cards never carry t)' % r['u'])
    if r['u'] in seen:
        sys.exit('already on the page or skipped: ' + r['u'])
    seen.add(r['u'])
for p in skipped:
    if not re.fullmatch(PATH, p):
        sys.exit('bad skipped path ' + p)
    if p in seen:
        sys.exit('already on the page or skipped: ' + p)
    seen.add(p)

before = len(data)
data = new + data
src = src[:m.start(1)] + dump(data) + src[m.end(1):]

sync['through'] = through
if new:
    sync['updated'] = updated
if skipped:
    sync['skipped'] = sync.get('skipped', []) + skipped
m = block('sync', src)
src = src[:m.start(1)] + dump(sync) + src[m.end(1):]

# Round-trip check before writing.
check = json.loads(block('data', src).group(1))
assert len(check) == before + len(new) and len({r['u'] for r in check}) == len(check)
json.loads(block('sync', src).group(1))
open(page, 'w', encoding='utf-8').write(src)
print('cards: %d -> %d, skipped total %d, through %s' % (before, len(check), len(sync.get('skipped', [])), through))
