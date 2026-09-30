// Sands share previews: data lookup, countdown math and the 1200x630 preview image.
// The sand geometry and camera below are ported from the site's hourglass renderer so the
// drawn sand lines up with the pre-rendered glass (glass/<metal>.png, 440x610, pad 0.04).
import { EVENTS } from './events.js';

export const SITE = 'https://www.jamesrindos.com';
export const APP_PATH = '/sands/';
const METALS = ['oak', 'steel', 'brass', 'chrome', 'silver', 'bronze', 'gunmetal', 'ebony', 'lacquer', 'patina'];
const CATS = ['Movie', 'Game', 'Sports', 'Event', 'Trip', 'Holiday'];
const CAT_SAND = { Trip: '#f2a65a,#f7d9a8,#2f8f9d', Holiday: '#e0652a,#f2b233,#2a211d', Sports: '#4e7f3a,#c8d6a0,#6b4a2e', Game: '#8fd3ff,#e8f4fb,#3a7bd5', Movie: '#2c2b40,#7c3aed,#ffd36b', Event: '#dcc9a4,#bda57b,#efe5d0' };

/* ---------- time (date-only targets count to midnight US Eastern) ---------- */
function etOffsetMin(ms) {
  const s = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' }).formatToParts(new Date(ms)).find(p => p.type === 'timeZoneName').value;
  const m = s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); if (!m) return 0;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
}
function etMs(y, mo, d, hh = 0, mi = 0) {
  const guess = Date.UTC(y, mo - 1, d, hh, mi);
  return guess - etOffsetMin(guess - 5 * 3600e3) * 60e3;
}
function parseDay(s, h) {
  const [y, m, d] = s.split('-').map(Number);
  if (h) { const [hh, mi] = h.split(':').map(Number); return etMs(y, m, d, hh, mi); }
  return etMs(y, m, d);
}
const clean = (v, n) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '';

/* ---------- resolve a share key: a library id or a custom "c." key ---------- */
export function resolve(key) {
  if (typeof key !== 'string') return null;
  const e = EVENTS[key];
  if (e) return { key, short: e[0], title: e[1], cat: e[2], target: e[3], allDay: !!e[4], start: e[5], sand: e[6], metal: e[7], tba: false };
  if (!/^c\.[A-Za-z0-9_-]{8,}$/.test(key)) return null;
  let o; try { o = JSON.parse(Buffer.from(key.slice(2).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch (e) { return null; }
  if (!o || typeof o !== 'object') return null;
  const title = clean(o.t, 80); if (!title) return null;
  const cat = CATS.includes(o.c) ? o.c : 'Event', tba = o.u === 1;
  let target = NaN, allDay = true;
  if (!tba && typeof o.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.d)) {
    if (typeof o.h === 'string' && /^\d{2}:\d{2}$/.test(o.h)) { allDay = false; target = /^[+-]\d{2}:\d{2}$/.test(o.z || '') ? Date.parse(`${o.d}T${o.h}:00${o.z}`) : parseDay(o.d, o.h); }
    else target = parseDay(o.d);
  }
  const a = typeof o.a === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.a) ? o.a : null;
  const sand = typeof o.sd === 'string' && /^(#[0-9a-f]{6},){2}#[0-9a-f]{6}$/i.test(o.sd) ? o.sd : (CAT_SAND[cat] || CAT_SAND.Event);
  const metal = METALS.includes(o.mt) ? o.mt : 'oak';
  return { key, short: title, title, cat, target, allDay, start: a ? parseDay(a) : Date.now(), sand, metal, tba: tba || !isFinite(target) };
}

export function status(cd, now = Date.now()) {
  if (cd.tba || !isFinite(cd.target)) return { f: 1, label: 'Date TBA', big: 'TBA', unit: 'DATE TO BE ANNOUNCED', done: false };
  const left = cd.target - now;
  const f = cd.target > cd.start ? Math.min(1, Math.max(0, left / (cd.target - cd.start))) : 0;
  if (left <= 0) return { f: 0, label: 'It’s here', big: 'NOW', unit: 'IT’S HERE', done: true };
  const days = Math.floor(left / 864e5), hours = Math.floor(left / 36e5), mins = Math.max(1, Math.floor(left / 6e4));
  if (days >= 1) return { f, label: `${days} ${days === 1 ? 'day' : 'days'} to go`, big: String(days), unit: days === 1 ? 'DAY TO GO' : 'DAYS TO GO', done: false };
  if (hours >= 1) return { f, label: `${hours} ${hours === 1 ? 'hour' : 'hours'} to go`, big: String(hours), unit: hours === 1 ? 'HOUR TO GO' : 'HOURS TO GO', done: false };
  return { f, label: `${mins} min to go`, big: String(mins), unit: 'MIN TO GO', done: false };
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function landsText(cd) {
  if (cd.tba || !isFinite(cd.target)) return 'Date TBA';
  const shifted = new Date(cd.target + etOffsetMin(cd.target) * 60e3);
  const base = `${DOW[shifted.getUTCDay()]}, ${MON[shifted.getUTCMonth()]} ${shifted.getUTCDate()}, ${shifted.getUTCFullYear()}`;
  if (cd.allDay) return base;
  let h = shifted.getUTCHours(); const m = shifted.getUTCMinutes(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${base} · ${h}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap} ET`;
}

/* ---------- sand geometry (ported from the renderer) ---------- */
const NECK = 0.058, RB = 0.6, GT = 0.02;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const P = (x, y) => ({ x, y });
function rOut(t) { t = clamp(t, 0, 1); if (t < 0.6) { const u = t / 0.6, s = u * u * (3 - 2 * u); return NECK + (RB - NECK) * Math.sin(s * Math.PI / 2); } const v = (t - 0.6) / 0.4; return RB * (1 - 0.2 * v * v); }
const rIn = t => Math.max(0.008, rOut(t) - GT);
const NT = 400, CUM = new Float64Array(NT + 1);
for (let i = 1; i <= NT; i++) { const r = rIn((i - 0.5) / NT); CUM[i] = CUM[i - 1] + Math.PI * r * r / NT; }
const VB = CUM[NT], SAND = 0.5 * VB;
function tForVol(v) { if (v <= 0) return 0; if (v >= VB) return 1; let lo = 0, hi = NT; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CUM[m] < v) lo = m; else hi = m; } return (lo + (v - CUM[lo]) / (CUM[hi] - CUM[lo] || 1)) / NT; }
const polyVol = p => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += (a.x * a.x + a.x * b.x + b.x * b.x) * (b.y - a.y); } return Math.abs(Math.PI * s / 3); };
function solve(v, lo, hi, make) { for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (polyVol(make(m)) < v) lo = m; else hi = m; } return make((lo + hi) / 2); }
function topShape(h) { const d = Math.min(0.09, h * 0.45), wall = Math.min(0.985, h + d / 2), rw = rIn(wall), p = []; for (let i = 0; i <= 36; i++) { const q = i / 36; p.push(P(rw * q, Math.max(0.004, wall - d * (1 - q * q)))); } for (let j = 1; j <= 40; j++) { const t = wall * (1 - j / 40); p.push(P(rIn(t), t)); } p.push(P(0, 0)); return p; }
function topProfile(v) { if (v < 1e-6) return null; const h0 = tForVol(v); return solve(v, h0 * 0.8, Math.min(1, h0 * 1.6 + 0.02), topShape); }
function bottomShape(zm) { const y0 = -1, k = 0.62, rf = rIn(1), p = []; const pk = Math.min(k * rIn(1 - zm), 3 * zm, 0.3), wall = Math.max(0, zm - pk / 3), rw = rIn(1 - wall); p.push(P(0, y0), P(rf, y0)); for (let j = 1; j <= 30; j++) { const z = wall * j / 30; p.push(P(rIn(1 - z), y0 + z)); } for (let i = 1; i <= 36; i++) { const q = i / 36; p.push(P(rw * (1 - q), y0 + wall + pk * q)); } return { pts: p, peak: y0 + wall + pk }; }
function bottomProfile(v) {
  const y0 = -1, k = 0.62, rf = rIn(1);
  if (v < 1e-6) return { pts: null, peak: y0 };
  const rc = Math.cbrt(3 * v / (Math.PI * k)), p = [];
  if (rc < rf * 0.97) { p.push(P(0, y0), P(rc, y0)); for (let i = 1; i <= 28; i++) { const q = i / 28; p.push(P(rc * (1 - q), y0 + k * rc * q)); } return { pts: p, peak: y0 + k * rc }; }
  const z0 = 1 - tForVol(VB - v); let lo = z0 * 0.7, hi = z0 * 1.4 + 0.02, s;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; s = bottomShape(m); if (polyVol(s.pts) < v) lo = m; else hi = m; }
  return bottomShape((lo + hi) / 2);
}

/* ---------- camera (same math as the renderer for a 440x610 view, pad 0.04) ---------- */
export const GW = 440, GH = 610;
const cam = (() => {
  const pad = 0.04, tn = Math.tan(10 * Math.PI / 180), a = GW / GH;
  const dist = Math.max(2.45 * (1 + pad) / 2 / tn, 1.75 * (1 + pad) / 2 / (tn * a));
  const pos = [0, dist * 0.1, dist], tgt = [0, -0.06, 0];
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const norm = p => { const l = Math.hypot(...p); return p.map(v => v / l); }, cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  const f = norm(sub(tgt, pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  return (x, y, z) => { const d = sub([x, y, z], pos), depth = dot(d, f); return [(dot(d, r) / (depth * tn * a) + 1) / 2 * GW, (1 - dot(d, u) / (depth * tn)) / 2 * GH]; };
})();
const pt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
// rev winds the ring the other way, so it joins the top pile's outline instead of cutting a hole where they overlap
function ring(r, y, n = 48, rev = false) { const pts = []; for (let i = 0; i < n; i++) { const th = (rev ? n - i : i) / n * Math.PI * 2; pts.push(cam(r * Math.cos(th), y, r * Math.sin(th))); } return 'M' + pts.map(pt).join('L') + 'Z'; }
function body(profile) { const L = profile.map(q => cam(-q.x, q.y, 0)), R = profile.map(q => cam(q.x, q.y, 0)); return 'M' + L.map(pt).join('L') + 'L' + R.reverse().map(pt).join('L') + 'Z'; }

const hex = h => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
// The site's tone mapping renders sand a little lighter and softer than its hex colour.
function lit(h, desat = 0.2, lift = 0.12) { const [r, g, b] = hex(h), L = 0.2126 * r + 0.7152 * g + 0.0722 * b; return toHex([r, g, b].map(v => { const d = v + (L - v) * desat; return d + (255 - d) * lift; })); }
function sandSVG(f, sand, opt = {}) {
  const [c0, c1, c2] = sand.split(',').map((c, i) => lit(c, i ? 0.05 : 0.08, i ? 0.04 : 0.08));
  const tp = topProfile(f * SAND), bp = bottomProfile((1 - f) * SAND);
  const defs = `<defs>
    <filter id="specA" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="1" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -1.75" result="a"/><feFlood flood-color="${c1}"/><feComposite in2="a" operator="in"/></filter>
    <filter id="specB" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="1" seed="23" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -1.85" result="a"/><feFlood flood-color="${c2}"/><feComposite in2="a" operator="in"/></filter>
    <filter id="grit" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.05"/></filter>
    <linearGradient id="shadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
    <linearGradient id="shadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
  </defs>`;
  const fillSand = (id, d, shade) => `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})"><path d="${d}" fill="${c0}"/><rect width="${GW}" height="${GH}" filter="url(#specA)" opacity=".38"/><rect width="${GW}" height="${GH}" filter="url(#specB)" opacity=".3"/><rect width="${GW}" height="${GH}" filter="url(#grit)" opacity=".07"/><path d="${d}" fill="url(#${shade})"/></g>`;
  let top = '', bot = '', stream = '', clip = '';
  if (tp) {
    const rim = tp[36], shapes = body(tp.slice(36)) + ' ' + ring(rim.x, rim.y, 48, true); clip += shapes + ' ';
    top = fillSand('clipTop', shapes, 'shadeV') + `<path d="${ring(rim.x * 0.985, rim.y)}" fill="#fff" fill-opacity=".08"/>`;
  }
  if (bp.pts) {
    const pts = bp.pts, first = pts[1], shapes = body(pts.slice(1)) + ' ' + ring(first.x, first.y); clip += shapes;
    bot = fillSand('clipBot', shapes, 'shadeH');
  }
  if (f > 0 && f < 1 && opt.stream !== false) { const [x0, y0] = cam(0, 0, 0), [, y1] = cam(0, bp.peak, 0); stream = `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x0.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${c0}" stroke-width="2.4"/>`; }
  return { defs, body: top + bot + stream, clip: clip.trim() };
}

/* ---------- text fitting (approximate advance widths, in em) ---------- */
const W_BARLOW = ch => /[MW]/.test(ch) ? 0.66 : /[IJ1]/.test(ch) ? 0.26 : ch === ' ' ? 0.2 : /[.,:;'’!]/.test(ch) ? 0.2 : /[0-9]/.test(ch) ? 0.47 : /[A-Z&?]/.test(ch) ? 0.5 : 0.45;
const widthOf = (s, size) => [...s].reduce((w, ch) => w + W_BARLOW(ch), 0) * size;
function wrap(text, size, maxW) { const words = text.split(/\s+/), lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (widthOf(t, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
function fitTitle(text) {
  for (let size = 112; size >= 56; size -= 4) { const lines = wrap(text, size, 600); if (lines.length <= 3 && lines.every(l => widthOf(l, size) <= 610) && size * 0.86 * (lines.length - 1) + size * 0.72 <= 250) return { size, lines }; }
  const size = 56; let lines = wrap(text, size, 600); if (lines.length > 3) { lines = lines.slice(0, 3); lines[2] = lines[2].replace(/\s*\S*$/, '') + '…'; } return { size, lines };
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function glassLayers(f, sand, uri, opt = {}) {
  const sd = sandSVG(f, sand, opt), img = extra => `<image href="${uri}" x="0" y="0" width="${GW}" height="${GH}"${extra}/>`;
  return `${img('')}${sd.defs}<defs>
    <filter id="soft" x="0" y="0" width="100%" height="100%"><feComponentTransfer><feFuncR type="linear" slope=".38" intercept=".62"/><feFuncG type="linear" slope=".38" intercept=".62"/><feFuncB type="linear" slope=".38" intercept=".62"/></feComponentTransfer></filter>
    <filter id="hl" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.3 3.3 3.3 0 -9.3"/></filter>
    ${sd.clip ? `<clipPath id="sandAll"><path d="${sd.clip}"/></clipPath>` : ''}</defs>
  ${sd.body}${sd.clip ? `<g style="mix-blend-mode:multiply">${img(' filter="url(#soft)" clip-path="url(#sandAll)"')}</g>${img(' filter="url(#hl)" clip-path="url(#sandAll)"')}` : ''}`;
}

/* ---------- video: the hourglass alone, plus where the stream falls ---------- */
export const VW = 540, VH = 640;
const VX = (VW - GW) / 2, VY = (VH - GH) / 2 + 6;
export function videoBaseSVG(cd, glassDataURI, now = Date.now()) {
  const st = status(cd, now);
  return { f: st.f, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${VW}" height="${VH}" viewBox="0 0 ${VW} ${VH}"><rect width="${VW}" height="${VH}" fill="#FFFFFF"/><g transform="translate(${VX},${VY})">${glassLayers(st.f, cd.sand, glassDataURI, { stream: false })}</g></svg>` };
}
// Neck and pile top in video pixels, for the falling grains. null when the sand isn't flowing.
export function streamGeom(f) {
  if (!(f > 0 && f < 1)) return null;
  const bp = bottomProfile((1 - f) * SAND), [x0, y0] = cam(0, 0, 0), [, y1] = cam(0, bp.peak, 0);
  return { x: x0 + VX, y0: y0 + VY + 3, y1: y1 + VY - 2 };
}
export function sandColor(sand) { return hex(lit(sand.split(',')[0], 0.08, 0.02)); }
// White glass silhouette on black, for masking the glint to the glass.
export function glassMaskSVG() {
  const L = [], R = [];
  for (let i = 0; i <= 80; i++) { const y = -1 + 2 * i / 80, r = rOut(Math.abs(y)) - 0.01; L.push(cam(-r, y, 0)); R.push(cam(r, y, 0)); }
  const d = 'M' + L.map(pt).join('L') + 'L' + R.reverse().map(pt).join('L') + 'Z';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VW}" height="${VH}"><rect width="${VW}" height="${VH}" fill="#000"/><g transform="translate(${VX},${VY})"><path d="${d}" fill="#fff"/></g></svg>`;
}

export function ogSVG(cd, glassDataURI, now = Date.now()) {
  const st = status(cd, now), ink = '#141414', muted = '#5C5C5C';
  const title = fitTitle(cd.short.toUpperCase());
  const ty = 158 + title.size * 0.72;
  const titleSVG = title.lines.map((l, i) => `<text x="64" y="${(ty + i * title.size * 0.86).toFixed(1)}" font-family="Barlow Condensed SemiBold" font-weight="600" font-size="${title.size}" fill="${ink}">${esc(l)}</text>`).join('');
  const bigSize = 118, bigW = widthOf(st.big, bigSize);
  const pct = st.done ? 'SAND LEFT 0%' : cd.tba ? 'SAND FULL' : `SAND LEFT ${(st.f * 100).toFixed(1)}%`;
  const meta = `${cd.cat.toUpperCase()} · ${landsText(cd).toUpperCase()}`;
  const gx = 1200 - GW - 36, gy = 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <g transform="translate(${gx},${gy})">${glassLayers(st.f, cd.sand, glassDataURI)}</g>
  <text x="64" y="84" font-family="Barlow Condensed SemiBold" font-weight="600" font-size="46" fill="${ink}">sands.</text>
  <text x="64" y="132" font-family="JetBrains Mono" font-weight="500" font-size="17" letter-spacing="1.4" fill="${muted}">${esc(meta)}</text>
  ${titleSVG}
  <line x1="64" y1="446" x2="664" y2="446" stroke="${ink}" stroke-width="2"/>
  <text x="64" y="552" font-family="Barlow Condensed SemiBold" font-weight="600" font-size="${bigSize}" fill="${ink}">${esc(st.big)}</text>
  <text x="${(64 + bigW + 20).toFixed(0)}" y="550" font-family="JetBrains Mono" font-weight="500" font-size="24" letter-spacing="1.5" fill="${ink}">${esc(st.unit)}</text>
  <line x1="64" y1="574" x2="664" y2="574" stroke="${ink}" stroke-opacity=".25" stroke-width="1.5"/>
  <text x="64" y="606" font-family="JetBrains Mono" font-weight="500" font-size="17" letter-spacing="1" fill="${muted}">jamesrindos.com/sands</text>
  <text x="664" y="606" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="17" letter-spacing="1" fill="${muted}">${esc(pct)}</text>
</svg>`;
}
