// GET /api/until-suggest?q=<what someone typed>  ->  {"suggestions":[...]}
// Works out what a vague search most likely means ("nathan fielders new movie") using Claude with
// web search, so the page can ask "Did you mean ...?" and pre-fill the countdown for approval.
// Needs ANTHROPIC_API_KEY in the Vercel project's environment variables; without it this returns
// 503 and the page falls back to library matches plus "create it yourself".

const MODEL = 'claude-haiku-4-5-20251001';
const CATS = ['Movie', 'Game', 'Sports', 'Event', 'Trip', 'Holiday'];
const cache = new Map(), hits = new Map();

const SYSTEM = `You help people find the exact upcoming thing they want to count down to on a countdown website.
People often misremember names or describe things vaguely ("nathan fielders new movie", "the next gta", "that new zelda remake").
Search the web to work out what they most likely mean, then reply with only one JSON object and no other text:
{"suggestions": [ ... ]}
Give 1 to 3 candidates, most likely first. Each candidate:
{"title": the official name,
 "category": one of Movie, Game, Sports, Event, Trip, Holiday,
 "date": "YYYY-MM-DD" or null,
 "time": "HH:MM" 24-hour start time or null (only when a start time matters, like a kickoff),
 "utc_offset": "+HH:MM" for that time at the event's location, or null,
 "status": "confirmed" if the date is officially announced, "estimated" if it is reported but not official, "unknown" if there is no date,
 "why": what it is in plain words, under 14 words (for example "Nathan Fielder's Elizabeth Holmes documentary, from A24"),
 "tagline": an original line of at most 9 words,
 "sand": three hex colors for hourglass sand that evoke its world, main color first,
 "source": {"name": the publication or official site, "url": the page that confirms the date}}
Rules: prefer upcoming things; include something recent only if nothing upcoming fits. Use official announcements for dates. Never invent a date; use null and "unknown" instead.
If the request is personal (a birthday, a trip, a wedding) or you can't identify anything real, reply {"suggestions": []}.`;

const clean = (v, n) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '';
function valid(s) {
  if (!s || typeof s !== 'object') return null;
  const title = clean(s.title, 80); if (!title) return null;
  const date = typeof s.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? s.date : null;
  const time = date && typeof s.time === 'string' && /^\d{2}:\d{2}$/.test(s.time) ? s.time : null;
  const off = time && typeof s.utc_offset === 'string' && /^[+-]\d{2}:\d{2}$/.test(s.utc_offset) ? s.utc_offset : null;
  let status = ['confirmed', 'estimated', 'unknown'].includes(s.status) ? s.status : (date ? 'estimated' : 'unknown'); if (!date) status = 'unknown';
  const sand = Array.isArray(s.sand) && s.sand.length >= 3 && s.sand.slice(0, 3).every(c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)) ? s.sand.slice(0, 3).join(',').toLowerCase() : null;
  const src = s.source && typeof s.source === 'object' && typeof s.source.url === 'string' && /^https:\/\//.test(s.source.url) ? { name: clean(s.source.name, 60) || new URL(s.source.url).hostname.replace(/^www\./, ''), url: s.source.url.slice(0, 500) } : null;
  return { title, category: CATS.includes(s.category) ? s.category : 'Event', date, time, utc_offset: off, status, why: clean(s.why, 120), tagline: clean(s.tagline, 100), sand, source: src };
}
function parse(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b <= a) return [];
  try { const o = JSON.parse(text.slice(a, b + 1)); return (Array.isArray(o.suggestions) ? o.suggestions : []).map(valid).filter(Boolean).slice(0, 3); } catch (e) { return []; }
}

async function ask(q, key) {
  const today = new Date().toISOString().slice(0, 10);
  const messages = [{ role: 'user', content: `Today is ${today}. Someone typed this into the countdown site's search box: ${JSON.stringify(q)}` }];
  for (let turn = 0; turn < 3; turn++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: AbortSignal.timeout(25000),
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: SYSTEM, messages, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }] })
    });
    if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const m = await r.json();
    if (m.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: m.content }); continue; }
    return parse((m.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n'));
  }
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const q = String((req.query && req.query.q) || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (q.length < 3) { res.statusCode = 400; return res.end('{"error":"too_short"}'); }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.statusCode = 503; return res.end('{"error":"not_configured"}'); }
  const ck = q.toLowerCase();
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.t < 6 * 36e5) { res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400'); return res.end(JSON.stringify({ suggestions: hit.s })); }
  // light guard for a public endpoint: at most 12 fresh searches per visitor per 10 minutes on this instance
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon', now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 6e5); h.push(now); hits.set(ip, h);
  if (h.length > 12) { res.statusCode = 429; return res.end('{"error":"rate_limited"}'); }
  try {
    const s = await ask(q, key);
    cache.set(ck, { t: now, s }); if (cache.size > 500) cache.delete(cache.keys().next().value);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400');
    res.end(JSON.stringify({ suggestions: s }));
  } catch (e) {
    console.error('until-suggest', e);
    res.statusCode = 502; res.end('{"error":"search_failed"}');
  }
}
