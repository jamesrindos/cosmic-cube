#!/usr/bin/env python3
"""Add new cards to the ad format swipe file.

usage: formats_add.py <index.html> <new.json> <through-utc-iso> <updated-display-date>
new.json is a list of records, newest first. Only the two JSON blocks in the page are changed.
"""
import json, re, sys

page, new_path, through, updated = sys.argv[1:5]
src = open(page, encoding='utf-8').read()

def block(name, text):
    m = re.search(r'<script id="%s" type="application/json">(.*?)</script>' % name, text, re.S)
    if not m:
        sys.exit('block not found: ' + name)
    return m

def dump(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')

m = block('data', src)
data = json.loads(m.group(1))
new = json.load(open(new_path, encoding='utf-8'))
seen = {r['u'] for r in data}
for r in new:
    missing = [k for k in ('s', 'n', 'd', 'h', 'u', 'by', 'on', 'e') if not r.get(k)]
    if missing:
        sys.exit('record %s is missing %s' % (r.get('u'), missing))
    if r['s'] not in ('tof', 'mof', 'bof') or r['e'] not in ('v', 'i', 'w', 'x') or r['by'] not in ('James', 'Nate'):
        sys.exit('bad value in record ' + r['u'])
    if not re.fullmatch(r'/(p|reel)/[A-Za-z0-9_-]+/', r['u']):
        sys.exit('bad url path ' + r['u'])
    if 't' in r:
        sys.exit('new records must not carry a t field: ' + r['u'])
    if r['u'] in seen:
        sys.exit('already on the page: ' + r['u'])
    seen.add(r['u'])
before = len(data)
data = new + data
src = src[:m.start(1)] + dump(data) + src[m.end(1):]

m = block('sync', src)
sync = json.loads(m.group(1))
sync['through'] = through
sync['updated'] = updated
src = src[:m.start(1)] + dump(sync) + src[m.end(1):]

# Round-trip check before writing.
check = json.loads(block('data', src).group(1))
assert len(check) == before + len(new) and len({r['u'] for r in check}) == len(check)
json.loads(block('sync', src).group(1))
open(page, 'w', encoding='utf-8').write(src)
print('records: %d -> %d, through %s' % (before, len(check), through))
