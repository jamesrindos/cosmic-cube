// GET /api/until-suggest?q=<what someone typed>  ->  {"suggestions":[...]}
// Works out what a vague search means ("nathan fielders new movie") from free public data, with no API key:
//   1. Wikipedia search finds the likely pages.
//   2. Wikidata gives each page's type and its official dates (release, start, point in time).
//   3. If the best match is a person or a studio, their upcoming works are looked up in Wikidata.
// Only upcoming things with a date (or an announced year) are suggested, most relevant first.

const UA = 'UntilCountdown/1.0 (https://www.jamesrindos.com/until)';
const cache = new Map(), hits = new Map();
const DROP = new Set('the a an my new next upcoming latest when is does do it its come comes coming out release released date dates countdown create make start for to till until how long days of what whats'.split(' '));
const HINTS = [[/\b(movie|film|documentary|flick)s?\b/, 'Movie'], [/\b(game|games|videogame)\b/, 'Game'], [/\b(album|tour|concert|show|festival|season|series|episode|premiere)\b/, 'Event']];

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(url.split('?')[0] + ' ' + r.status);
  return r.json();
}
const wp = params => get('https://en.wikipedia.org/w/api.php?' + new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params }));
const wd = params => get('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params }));

function cleanQuery(q) {
  const s = q.toLowerCase().replace(/[’']s\b/g, '').replace(/[^a-z0-9 ]+/g, ' ');
  let hint = null; for (const [re, c] of HINTS) if (re.test(s)) { hint = c; break; }
  const words = s.split(/\s+/).filter(w => w && !DROP.has(w));
  return { text: words.join(' '), hint };
}
function categoryOf(desc, p31) {
  const d = (desc || '').toLowerCase();
  if (/video game/.test(d)) return 'Game';
  if (/\bfilm\b|documentary|animated feature/.test(d)) return 'Movie';
  if (/season|championship|tournament|\bcup\b|bowl|grand prix|olympic|world series|playoffs?|marathon|\bmatch\b/.test(d)) return 'Sports';
  if (/holiday|observance/.test(d)) return 'Holiday';
  if (/album|single|song|tour|concert|festival|ceremony|awards|television|tv series|miniseries|streaming|broadcast|parade|eclipse|convention|expo|launch/.test(d)) return 'Event';
  if (p31.includes('Q11424')) return 'Movie';
  if (p31.includes('Q7889')) return 'Game';
  return null;
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dateOf(claims, today) {
  // publication date (P577) first, preferring a US date; then start time (P580), then point in time (P585)
  for (const p of ['P577', 'P580', 'P585']) {
    const vals = (claims[p] || []).map(s => {
      const v = s.mainsnak && s.mainsnak.datavalue && s.mainsnak.datavalue.value; if (!v || !v.time) return null;
      const m = /^\+(\d{4})-(\d{2})-(\d{2})/.exec(v.time); if (!m) return null;
      const place = ((s.qualifiers || {}).P291 || []).map(x => x.datavalue && x.datavalue.value && x.datavalue.value.id);
      return { y: +m[1], m: +m[2], d: +m[3], prec: v.precision, us: place.includes('Q30'), iso: `${m[1]}-${m[2]}-${m[3]}` };
    }).filter(Boolean);
    if (!vals.length) continue;
    const upcoming = vals.filter(v => v.prec >= 11 ? v.iso >= today : v.y >= +today.slice(0, 4));
    if (!upcoming.length) return { past: true };
    upcoming.sort((a, b) => (b.us - a.us) || a.iso.localeCompare(b.iso));
    const v = upcoming[0];
    if (v.prec >= 11) return { date: v.iso };
    return { expected: v.prec === 10 ? `expected ${MON[v.m - 1]} ${v.y}` : `expected ${v.y}` };
  }
  return null;
}
// Wikipedia's infobox is usually updated before Wikidata (a date moved last week shows there first), so it wins when it has a date.
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MRE = MONTHS.join('|');
const HOME = /united states|\bu\.?s\.?\b|\bna\b|\bww\b|worldwide|north america/i;
function infoboxWhen(wt, today) {
  if (!wt) return null;
  const txt = wt.replace(/<!--[\s\S]*?-->/g, '').replace(/<ref[^>]*\/>/g, '').replace(/<ref[\s\S]*?<\/ref>/g, '');
  const f = /^\|\s*(?:released|release_date|release|date|dates|start_date|first_aired|premiere)\s*=([\s\S]*?)(?=\n\s*\||\n\}\})/mi.exec(txt);
  if (!f) return null;
  let v = f[1];
  const c = [];
  const add = (y, m, d, loc) => c.push({ y: +y, m: m ? +m : 0, d: d ? +d : 0, home: HOME.test(loc || '') });
  // {{Film date|2026|09|06|Telluride|2026|10|16|United States}}, {{Start date|2027|2|14}}
  v = v.replace(/\{\{\s*(?:film date|start date(?: and age)?|release date(?: and age)?|dts)\s*\|([^{}]*)\}\}/gi, (_, a) => {
    const args = a.split('|').map(x => x.trim()).filter(x => x && !x.includes('='));
    for (let i = 0; i < args.length; i++) {
      if (!/^\d{4}$/.test(args[i])) continue;
      const y = args[i], m = /^\d{1,2}$/.test(args[i + 1] || '') ? args[++i] : 0, d = m && /^\d{1,2}$/.test(args[i + 1] || '') ? args[++i] : 0;
      const loc = args[i + 1] && !/^\d/.test(args[i + 1]) ? args[++i] : '';
      add(y, m, d, loc);
    }
    return ' ';
  });
  // plain text: "November 19, 2026", "19 November 2026", "{{Video game release|WW|November 19, 2026}}", then "March 2027", then "2027"
  const ctx = i => v.slice(Math.max(0, i - 50), i);
  v = v.replace(new RegExp(`\\b(${MRE})\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'gi'), (all, mo, d, y, i) => { add(y, MONTHS.indexOf(mo.toLowerCase()) + 1, d, ctx(i)); return ' '.repeat(all.length); });
  v = v.replace(new RegExp(`\\b(\\d{1,2})\\s+(${MRE})\\s+(\\d{4})`, 'gi'), (all, d, mo, y, i) => { add(y, MONTHS.indexOf(mo.toLowerCase()) + 1, d, ctx(i)); return ' '.repeat(all.length); });
  v = v.replace(new RegExp(`\\b(${MRE})\\s+(\\d{4})`, 'gi'), (all, mo, y, i) => { add(y, MONTHS.indexOf(mo.toLowerCase()) + 1, 0, ctx(i)); return ' '.repeat(all.length); });
  if (!c.length) for (const m of v.matchAll(/\b(20\d{2})\b/g)) add(m[1], 0, 0, ctx(m.index));
  if (!c.length) return null;
  const ty = +today.slice(0, 4), tm = +today.slice(5, 7);
  const iso = x => `${x.y}-${String(x.m).padStart(2, '0')}-${String(x.d).padStart(2, '0')}`;
  const up = c.filter(x => x.d ? iso(x) >= today : x.m ? x.y * 12 + x.m >= ty * 12 + tm : x.y >= ty);
  if (!up.length) return { past: true };
  up.sort((a, b) => (b.home - a.home) || (!!b.d - !!a.d) || iso(a).localeCompare(iso(b)));
  const x = up[0];
  if (x.d) return { date: iso(x) };
  return { expected: x.m ? `expected ${MON[x.m - 1]} ${x.y}` : `expected ${x.y}` };
}
async function wikitexts(titles) {
  if (!titles.length) return {};
  const d = await wp({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', rvsection: '0', titles: titles.join('|'), redirects: '1' });
  const out = {};
  for (const p of (d.query && d.query.pages) || []) out[p.title] = p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main.content;
  return out;
}
const ids = (claims, p) => (claims[p] || []).map(s => s.mainsnak && s.mainsnak.datavalue && s.mainsnak.datavalue.value && s.mainsnak.datavalue.value.id).filter(Boolean);
const bare = t => t.replace(/\s*\((?:\d{4} )?(?:film|video game|album|tv series|miniseries|documentary)\)$/i, '');

async function worksOf(qid, today) {
  // upcoming works this person or company directed, starred in, made, performed or published
  const sparql = `SELECT ?w ?wLabel ?date ?desc ?article WHERE {
    VALUES ?rel { wdt:P57 wdt:P161 wdt:P58 wdt:P162 wdt:P175 wdt:P170 wdt:P50 wdt:P178 wdt:P123 wdt:P272 wdt:P86 }
    ?w ?rel wd:${qid} . ?w wdt:P577 ?date . FILTER(?date >= "${today}T00:00:00Z"^^xsd:dateTime)
    OPTIONAL { ?w schema:description ?desc FILTER(lang(?desc) = "en") }
    OPTIONAL { ?article schema:about ?w ; schema:isPartOf <https://en.wikipedia.org/> }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } ORDER BY ?date LIMIT 6`;
  const d = await get('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql));
  const seen = new Set(), out = [];
  for (const b of d.results.bindings) {
    const title = b.wLabel && b.wLabel.value; if (!title || seen.has(title) || /^Q\d+$/.test(title)) continue; seen.add(title);
    const iso = b.date.value.slice(0, 10);
    out.push({ title, date: iso >= today ? iso : null, desc: b.desc ? b.desc.value : '', url: b.article ? b.article.value : `https://www.wikidata.org/wiki/${b.w.value.split('/').pop()}` });
  }
  return out;
}

async function suggest(q) {
  const today = new Date().toISOString().slice(0, 10);
  const { text, hint } = cleanQuery(q);
  if (!text) return [];
  const words = text.split(' ').filter(w => w.length > 2 && !/^(movie|film|game|album|show|tour|season|series)s?$/.test(w));
  const search = await wp({ action: 'query', generator: 'search', gsrsearch: text, gsrlimit: '8', gsrnamespace: '0', prop: 'pageprops|description|pageimages|revisions', ppprop: 'wikibase_item', piprop: 'thumbnail', pithumbsize: '240', rvprop: 'content', rvslots: 'main', rvsection: '0', redirects: '1' });
  const pages = ((search.query && search.query.pages) || []).filter(p => p.pageprops && p.pageprops.wikibase_item).sort((a, b) => a.index - b.index);
  if (!pages.length) return [];
  const ent = await wd({ action: 'wbgetentities', ids: pages.map(p => p.pageprops.wikibase_item).join('|'), props: 'claims' });
  const out = [], people = [];
  for (const p of pages) {
    const e = ent.entities[p.pageprops.wikibase_item]; if (!e) continue;
    const claims = e.claims || {}, p31 = ids(claims, 'P31');
    const wt = p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main.content;
    // a person, band or company (they have an occupation, a label, a headquarters or an industry, and no release date of their own)
    const who = p31.includes('Q5') || p31.some(x => ['Q4830453', 'Q210167', 'Q1137109', 'Q1320047', 'Q1762059', 'Q215380', 'Q2088357', 'Q18127', 'Q5398426'].includes(x)) || (!claims.P577 && ['P106', 'P264', 'P159', 'P452', 'P112'].some(k => claims[k]));
    if (who) { people.push({ qid: e.id, page: p }); continue; }
    const cat = categoryOf(p.description, p31); if (!cat) continue;
    const when = infoboxWhen(wt, today) || dateOf(claims, today); if (!when || when.past) continue;
    // further down the results, keep it only if its page mentions what they typed (a lookalike otherwise)
    const hay = (p.title + ' ' + (p.description || '') + ' ' + (wt || '')).toLowerCase();
    if (p.index > 6 || (p.index > 3 && !words.some(w => hay.includes(w) || (w.length > 4 && w.endsWith('s') && hay.includes(w.slice(0, -1)))))) continue;
    out.push({ idx: p.index, title: bare(p.title), category: cat, date: when.date || null, status: when.date ? 'confirmed' : 'unknown', why: [p.description, when.expected].filter(Boolean).join(', '), thumb: p.thumbnail ? p.thumbnail.source : null, credit: ids(claims, 'P57').concat(ids(claims, 'P178')).slice(0, 2), source: { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')) } });
  }
  // a person or studio near the top of the results: add their upcoming works
  const lead = people.find(x => x.page.index <= 2);
  if (lead) {
    try {
      const works = (await worksOf(lead.qid, today)).filter(w => !out.some(o => o.title === bare(w.title)));
      const art = w => w.url.startsWith('https://en.wikipedia.org/wiki/') ? decodeURIComponent(w.url.slice(30)).replace(/_/g, ' ') : null;
      const wts = await wikitexts(works.map(art).filter(Boolean).slice(0, 6)).catch(() => ({}));
      for (const w of works) {
        const when = infoboxWhen(wts[art(w)], today) || (w.date ? { date: w.date } : null); if (!when || when.past) continue;
        const cat = categoryOf(w.desc, []) || hint || 'Event';
        if (hint && cat !== hint) continue;
        out.push({ idx: lead.page.index + 0.5, title: bare(w.title), category: cat, date: when.date || null, status: when.date ? 'confirmed' : 'unknown', why: [w.desc, when.expected].filter(Boolean).join(', '), thumb: null, credit: [], source: { name: 'Wikipedia', url: w.url } });
      }
    } catch (e) { console.error('until-suggest works', e.message); }
  }
  // prefer what the search words point at (a movie for "movie"), then keep search order
  const ranked = out.map((o, i) => ({ o, i })).sort((a, b) => ((b.o.category === hint) - (a.o.category === hint)) || (a.o.idx - b.o.idx) || a.i - b.i).map(x => x.o).slice(0, 3);
  // name the people behind films and games ("by Nathan Fielder and Lance Oppenheim")
  const cids = [...new Set(ranked.flatMap(o => o.credit))];
  if (cids.length) {
    try {
      const L = await wd({ action: 'wbgetentities', ids: cids.join('|'), props: 'labels', languages: 'en' });
      for (const o of ranked) { const names = o.credit.map(id => L.entities[id] && L.entities[id].labels.en && L.entities[id].labels.en.value).filter(n => n && !o.why.includes(n)); if (names.length) o.why = `${o.why} by ${names.join(' and ')}`; }
    } catch (e) { /* names are a nicety */ }
  }
  return ranked.map(({ credit, idx, ...o }) => ({ ...o, why: o.why ? o.why.charAt(0).toUpperCase() + o.why.slice(1) : '' }));
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = String((req.query && req.query.q) || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (q.length < 3) { res.statusCode = 400; return res.end('{"error":"too_short"}'); }
  const ck = q.toLowerCase(), hit = cache.get(ck);
  if (hit && Date.now() - hit.t < 6 * 36e5) { res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400'); return res.end(JSON.stringify({ suggestions: hit.s })); }
  const ip = String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim() || 'anon', now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 6e5); h.push(now); hits.set(ip, h);
  if (h.length > 30) { res.statusCode = 429; return res.end('{"error":"rate_limited"}'); }
  try {
    const s = await suggest(q);
    cache.set(ck, { t: now, s }); if (cache.size > 500) cache.delete(cache.keys().next().value);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400');
    res.end(JSON.stringify({ suggestions: s }));
  } catch (e) {
    console.error('until-suggest', e.message);
    res.statusCode = 502; res.end('{"error":"search_failed"}');
  }
}
