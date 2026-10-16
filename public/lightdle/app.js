import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { PUZZLES, FIXTURES, GELS, EPOCH } from './puzzles.js';

/* ───────────────────────── utils ───────────────────────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const HY = 1.42; // head height (seated)
const MODES = ['easy', 'medium', 'expert'];
const MODE_LABEL = { easy: 'Easy', medium: 'Medium', expert: 'Expert' };
const TOL_MULT = { easy: 1.7, medium: 1.0, expert: 0.62 };
const OUTPUT_K = 4.2; // candela scale for the renderer

function kelvinRGB(k) {
  // Tanner Helland approximation, normalised so the brightest channel is 1.
  const t = clamp(k, 1000, 12000) / 100;
  let r, g, b;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); b = 255; }
  const v = [r, g, b].map(c => clamp(c, 0, 255) / 255);
  const m = Math.max(...v);
  return v.map(c => c / m);
}
function lightRGB(l) { const k = kelvinRGB(l.k), g = GELS[l.gel]?.rgb || [1, 1, 1]; return [k[0] * g[0], k[1] * g[1], k[2] * g[2]]; }
function cssRGB(c) { return `rgb(${c.map(x => Math.round(clamp(x, 0, 1) * 255)).join(',')})`; }
function chroma(c) { const s = c[0] + c[1] + c[2] || 1; return [c[0] / s, c[2] / s]; }

function localDateStr(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function dayNumber(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number), [ey, em, ed] = EPOCH.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / 864e5) + 1;
}
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function puzzleForDay(n) {
  const N = PUZZLES.length, cycle = Math.floor((n - 1) / N), i = (n - 1) % N;
  if (cycle === 0) return PUZZLES[((i % N) + N) % N];
  const idx = PUZZLES.map((_, j) => j), rnd = mulberry(1337 + cycle * 7919);
  for (let j = N - 1; j > 0; j--) { const r = Math.floor(rnd() * (j + 1)); [idx[j], idx[r]] = [idx[r], idx[j]]; }
  return PUZZLES[idx[i]];
}
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800); }

/* ───────────────────────── geometry of a rig ───────────────────────── */
function subjectHead(p, i) { return [p.subjects[i].x, HY, 0]; }
function groupCenter(p) { return [0, HY, 0]; }
function targetPoint(p, l) { return l.t >= 0 && l.t < p.subjects.length ? subjectHead(p, l.t) : groupCenter(p); }
function lightPos(p, l) {
  const c = targetPoint(p, l), ce = Math.cos(l.el * D2R);
  return [c[0] - l.d * Math.sin(l.az * D2R) * ce, HY + l.d * Math.sin(l.el * D2R), l.d * Math.cos(l.az * D2R) * ce];
}
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vlen = a => Math.hypot(a[0], a[1], a[2]);
const vnorm = a => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const rotY = (v, deg) => { const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R); return [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c]; };
function faceNormal(sub) { const t = 10 * D2R; return [-Math.sin(sub.yaw * D2R) * Math.cos(t), Math.sin(t), Math.cos(sub.yaw * D2R) * Math.cos(t)]; }
const CAM = { single: { pos: [0, 1.46, 2.2], fov: 27, look: 1.3 }, two: { pos: [0, 1.5, 3.4], fov: 31, look: 1.22 }, three: { pos: [0, 1.55, 4.4], fov: 36, look: 1.15 } };

/* ───────────────────────── illumination model + scoring ───────────────────────── */
const AMB = 0.015;
function analyse(p, rig) {
  const lights = rig.filter(l => l.on && l.p > 0);
  const cam = CAM[p.shot].pos;
  const subs = p.subjects.map((sub, j) => {
    const head = subjectHead(p, j), f = faceNormal(sub), nL = rotY(f, 60), nR = rotY(f, -60);
    const tiltF = deg => vnorm([f[0] * Math.cos(deg * D2R), f[1] * Math.cos(deg * D2R) + Math.sin(deg * D2R), f[2] * Math.cos(deg * D2R)]);
    const nUp = tiltF(50), nDn = tiltF(-45);
    const camDir = vnorm(vsub(cam, head));
    let front = AMB, cheekL = AMB, cheekR = AMB, brow = AMB, chin = AMB, rim = 0, key = null, keyE = 0;
    const contrib = lights.map(l => {
      const fx = FIXTURES[l.fx], pos = lightPos(p, l), tgt = targetPoint(p, l);
      const toHead = vsub(head, pos), dist = vlen(toHead), dir = vnorm(toHead);
      const aim = vnorm(vsub(tgt, pos));
      const ang = Math.acos(clamp(vdot(aim, dir), -1, 1));
      const inner = fx.angle * (1 - fx.pen);
      let att = 1;
      if (ang > inner) { const u = clamp((ang - inner) / Math.max(fx.angle - inner, 1e-3), 0, 1); att = 1 - u * u * (3 - 2 * u); }
      const E = (l.p / 100) * 9 * fx.eff / (dist * dist) * att;
      const Lhat = [-dir[0], -dir[1], -dir[2]];
      const behind = vdot(Lhat, camDir) <= -0.35;
      const fE = E * Math.max(0, vdot(Lhat, f));
      const kE = E * (0.35 + 0.65 * Math.max(0, vdot(Lhat, f)));
      if (behind) rim += E; else { front += fE; cheekL += E * Math.max(0, vdot(Lhat, nL)); cheekR += E * Math.max(0, vdot(Lhat, nR)); brow += E * Math.max(0, vdot(Lhat, nUp)); chin += E * Math.max(0, vdot(Lhat, nDn)); if (kE > keyE) { keyE = kE; key = l; } }
      return { l, E, Lhat, behind, fE };
    });
    const patches = [cheekL, cheekR, brow, chin];
    const ratio = Math.min(32, Math.max(...patches) / Math.min(...patches));
    const expo = Math.max(...patches);
    const rims = contrib.filter(c => c.behind && c.E > 0).sort((a, b) => b.E - a.E);
    return { front, expo, cheekL, cheekR, ratio, rim, rimStops: Math.log2((rim + 0.004) / expo), key, keyE, rimTop: rims[0] || null, contrib, bright: cheekL >= cheekR ? 'L' : 'R' };
  });
  const hero = subs[Math.floor(p.subjects.length / 2)];
  const fronts = subs.map(s => s.expo);
  const coverage = Math.min(...fronts) / Math.max(...fronts);
  return { subs, hero, coverage };
}
function keyDirOf(p, a) { if (!a.hero.key) return null; const c = a.hero.contrib.find(c => c.l === a.hero.key); return c.Lhat; }
function azEl(Lhat) { return { az: Math.atan2(-Lhat[0], Lhat[2]) * R2D, el: Math.asin(clamp(Lhat[1], -1, 1)) * R2D }; }
const sc = (err, tol, fail, m) => { tol *= m; fail *= m; return err <= tol ? 1 : err >= fail ? 0 : 1 - (err - tol) / (fail - tol); };
const fmtRatio = r => r >= 32 ? '32:1+' : r < 3 ? `${r.toFixed(1)}:1` : `${Math.round(r)}:1`;
const fmtAz = az => { const a = Math.round(az); if (Math.abs(a) < 8) return 'front'; if (Math.abs(a) > 172) return 'behind'; return `${Math.abs(a)}° ${a > 0 ? 'camera-left' : 'camera-right'}`; };

function score(p, rig, mode) {
  const m = TOL_MULT[mode];
  const A = analyse(p, rig), S = analyse(p, p.solution);
  const out = [];
  const push = (id, label, w, s, note, val) => out.push({ id, label, w, s: clamp(s, 0, 1), note, val });

  // 1. key direction
  const kd = keyDirOf(p, A), sd = keyDirOf(p, S);
  if (!kd) push('key', 'Key angle', 25, 0, 'No light is hitting the face from the front. The director needs a key.', '—');
  else {
    const err = Math.acos(clamp(vdot(kd, sd), -1, 1)) * R2D;
    const a = azEl(kd), b = azEl(sd), s = sc(err, 12, 48, m);
    let note = '';
    if (s >= 1) note = 'Key is right where the director wanted it.';
    else {
      const parts = [];
      const dAz = Math.abs(a.az) - Math.abs(b.az), side = Math.sign(a.az) !== Math.sign(b.az) && Math.abs(b.az) > 12 && Math.abs(a.az) > 12;
      if (side) parts.push(`key is on the wrong side — it should come from ${fmtAz(b.az)}`);
      else if (dAz < -12) parts.push('key is too frontal; swing it further around');
      else if (dAz > 12) parts.push('key is too far around to the side');
      const dEl = a.el - b.el;
      if (dEl > 12) parts.push('too high'); else if (dEl < -12) parts.push('too low');
      note = (parts.length ? parts.join(', ') : `off by ${Math.round(err)}°`) + `. Target: ${fmtAz(b.az)}, ${Math.round(b.el)}° ${b.el < 0 ? 'below' : 'above'} eyeline.`;
      note = note[0].toUpperCase() + note.slice(1);
    }
    push('key', 'Key angle', 25, s, note, `${Math.round(err)}°`);
  }

  // 2. contrast ratio
  {
    const err = Math.abs(Math.log2(A.hero.ratio) - Math.log2(S.hero.ratio));
    const s = sc(err, 0.5, 2.6, m);
    let note = s >= 1 ? `Contrast is on the money (${fmtRatio(A.hero.ratio)}).` :
      A.hero.ratio < S.hero.ratio ? `Too flat — yours is about ${fmtRatio(A.hero.ratio)}, the director wanted around ${fmtRatio(S.hero.ratio)}. Pull the fill down or move the key around.` :
        `Too contrasty — yours is about ${fmtRatio(A.hero.ratio)}, the director wanted around ${fmtRatio(S.hero.ratio)}. Add some fill.`;
    if (S.hero.bright !== A.hero.bright && Math.abs(Math.log2(A.hero.ratio)) > 0.6 && Math.abs(Math.log2(S.hero.ratio)) > 0.6) note += ' Also: the bright side of the face is the wrong side.';
    push('ratio', 'Contrast', 22, s, note, fmtRatio(A.hero.ratio));
  }

  // 3. separation (rim)
  {
    const wantsRim = S.hero.rimStops > -3.5;
    let s, note;
    if (!wantsRim) {
      s = sc(Math.max(0, A.hero.rimStops + 3.5), 0, 3.5, 1);
      note = s >= 1 ? 'No backlight, as asked.' : 'The director didn\'t want a backlight here — there\'s nothing in the scene to motivate it.';
      push('rim', 'Separation', 6, s, note, A.hero.rim > 0.01 ? 'rim on' : 'none');
    } else {
      const strength = sc(Math.abs(A.hero.rimStops - S.hero.rimStops), 0.6, 3, m);
      let dir = 1, col = 1;
      const at = A.hero.rimTop, st = S.hero.rimTop;
      if (at && st) {
        dir = sc(Math.acos(clamp(vdot(at.Lhat, st.Lhat), -1, 1)) * R2D, 20, 75, m);
        const ca = chroma(lightRGB(at.l)), cb = chroma(lightRGB(st.l));
        col = sc(Math.hypot(ca[0] - cb[0], ca[1] - cb[1]), 0.05, 0.3, m);
      }
      s = A.hero.rim <= 0.004 ? 0 : 0.5 * strength + 0.3 * dir + 0.2 * col;
      if (A.hero.rim <= 0.004) note = 'No backlight. The director wanted an edge from behind to separate the subject from the background.';
      else if (s >= 0.95) note = 'Nice separation.';
      else {
        const parts = [];
        if (A.hero.rimStops < S.hero.rimStops - 0.6) parts.push('rim is too weak');
        if (A.hero.rimStops > S.hero.rimStops + 0.6) parts.push('rim is too hot');
        if (dir < 0.7) parts.push(`rim angle is off (target ${fmtAz(azEl(st.Lhat).az)}, ${Math.round(azEl(st.Lhat).el)}° up)`);
        if (col < 0.7) parts.push(st.l.gel !== 'none' ? `rim wanted a ${GELS[st.l.gel].label.toLowerCase()} gel` : (st.l.k > at.l.k ? 'rim should be cooler' : 'rim should be warmer'));
        note = (parts.join(', ') || 'close, not quite') + '.';
        note = note[0].toUpperCase() + note.slice(1);
      }
      push('rim', 'Separation', 14, s, note, `${A.hero.rimStops >= 0 ? '+' : ''}${A.hero.rimStops.toFixed(1)} st`);
    }
  }

  // 4. key colour
  if (A.hero.key && S.hero.key) {
    const ca = chroma(lightRGB(A.hero.key)), cb = chroma(lightRGB(S.hero.key));
    const err = Math.hypot(ca[0] - cb[0], ca[1] - cb[1]);
    const s = sc(err, 0.04, 0.28, m);
    let note;
    const ag = A.hero.key.gel, sg = S.hero.key.gel;
    if (s >= 1) note = 'Colour matches the director\'s intent.';
    else if (sg !== 'none' && ag !== sg) note = `The key wanted a ${GELS[sg].label.toLowerCase()} gel.`;
    else if (sg === 'none' && ag !== 'none') note = 'Lose the gel on the key — the director wanted white light.';
    else note = A.hero.key.k < S.hero.key.k ? `Key is too warm (${A.hero.key.k}K). Director wanted around ${S.hero.key.k}K.` : `Key is too cool (${A.hero.key.k}K). Director wanted around ${S.hero.key.k}K.`;
    push('color', 'Key colour', 14, s, note, ag !== 'none' ? GELS[ag].label : `${A.hero.key.k}K`);
  } else push('color', 'Key colour', 14, 0, 'No key to judge.', '—');

  // 5. quality
  if (A.hero.key && S.hero.key) {
    const a = FIXTURES[A.hero.key.fx].soft, b = FIXTURES[S.hero.key.fx].soft, err = Math.abs(a - b);
    const s = sc(err, 0.2, 0.75, m);
    const note = s >= 1 ? 'Right quality of light.' : a < b ? `Key is too hard — the director wanted something softer (${FIXTURES[S.hero.key.fx].label.toLowerCase()}).` : `Key is too soft — the director wanted a harder source (${FIXTURES[S.hero.key.fx].label.toLowerCase()}).`;
    push('soft', 'Quality', 8, s, note, FIXTURES[A.hero.key.fx].label);
  } else push('soft', 'Quality', 8, 0, 'No key to judge.', '—');

  // 6. exposure
  {
    const stops = Math.log2(A.hero.expo / S.hero.expo), err = Math.abs(stops);
    const s = sc(err, 0.45, 2.2, m);
    const note = s >= 1 ? 'Exposure sits right.' : stops < 0 ? `Underexposed by about ${err.toFixed(1)} stops. Bring the key up or in.` : `Overexposed by about ${err.toFixed(1)} stops. Back the key off.`;
    push('exp', 'Exposure', 10, s, note, `${stops >= 0 ? '+' : ''}${stops.toFixed(1)} st`);
  }

  // 7. coverage (groups)
  if (p.subjects.length > 1) {
    const err = Math.abs(Math.log2(Math.max(A.coverage, 0.02)) - Math.log2(Math.max(S.coverage, 0.02)));
    const s = sc(err, 0.5, 2.5, m);
    const note = s >= 1 ? 'Everyone in the shot is covered.' : A.coverage < S.coverage ? 'Uneven — someone in the frame is falling into the dark. Aim at the group, or use a wider source.' : 'More even than the director wanted; this shot has a hero.';
    push('cov', 'Coverage', 10, s, note, `${Math.round(A.coverage * 100)}%`);
  }

  const W = out.reduce((a, b) => a + b.w, 0);
  const total = Math.round(out.reduce((a, b) => a + b.w * b.s, 0) / W * 100);
  return { total, metrics: out, A, S };
}

function roles(p, rig) {
  // key / fill / back label per light, judged on the hero
  const A = analyse(p, rig), out = rig.map(() => '');
  rig.forEach((l, i) => {
    if (!l.on) return;
    const c = A.hero.contrib.find(c => c.l === l); if (!c) return;
    out[i] = c.behind ? 'Back' : c.l === A.hero.key ? 'Key' : 'Fill';
  });
  return out;
}

function specSheet(p) {
  const r = roles(p, p.solution), A = analyse(p, p.solution);
  const lines = p.solution.map((l, i) => {
    const el = Math.round(l.el);
    return `<div><b>${r[i] || 'Light'} ${p.solution.length > 1 ? i + 1 : ''}</b> — ${FIXTURES[l.fx].label}${l.gel !== 'none' ? ' + ' + GELS[l.gel].label + ' gel' : ''}, ${fmtAz(l.az)}, ${Math.abs(el)}° ${el < 0 ? 'below' : 'above'} eyeline, ${l.d.toFixed(1)} m, ${l.p}%, ${l.k}K${p.subjects.length > 1 ? (l.t < 0 ? ', aimed at the group' : ', aimed at ' + subjectName(p, l.t)) : ''}</div>`;
  });
  lines.push(`<div><b>Ratio</b> ≈ ${fmtRatio(A.hero.ratio)}</div>`);
  return lines.join('');
}
function subjectName(p, i) { const n = p.subjects.length; return n === 2 ? ['left', 'right'][i] : n === 3 ? ['left', 'centre', 'right'][i] : 'subject'; }

/* ───────────────────────── three.js set ───────────────────────── */
const vp = $('#vp');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
vp.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 40);
const setGroup = new THREE.Group(); scene.add(setGroup);
const hemi = new THREE.HemisphereLight(0x8899aa, 0x221a14, 0.16); scene.add(hemi);
const spots = [0, 1, 2].map(() => {
  const s = new THREE.SpotLight(0xffffff, 0, 0, 0.5, 0.5, 2);
  s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.camera.near = 0.3; s.shadow.camera.far = 14; s.shadow.bias = -0.0004; s.shadow.normalBias = 0.01;
  s.visible = false; scene.add(s); scene.add(s.target); return s;
});
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...o });
function mesh(geo, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; }

function buildSet(p) {
  while (setGroup.children.length) setGroup.remove(setGroup.children[0]);
  scene.background = new THREE.Color(p.set.wall).multiplyScalar(0.25); hemi.color.set(p.set.wall).lerp(new THREE.Color(0xffffff), 0.3);
  const floor = mesh(new THREE.PlaneGeometry(14, 14), mat(p.set.floor, { roughness: 0.92 })); floor.rotation.x = -Math.PI / 2; floor.castShadow = false; setGroup.add(floor);
  const wall = mesh(new THREE.BoxGeometry(14, 4.5, 0.2), mat(p.set.wall, { roughness: 0.95 }), 0, 2.25, -3.2); wall.castShadow = false; setGroup.add(wall);
  const props = p.set.props || [];
  if (props.includes('desk')) {
    const w = mat('#2b2b30', { roughness: 0.4 });
    setGroup.add(mesh(new THREE.BoxGeometry(2.6, 0.06, 0.7), w, 0, 0.98, 0.5));
    setGroup.add(mesh(new THREE.BoxGeometry(2.6, 0.96, 0.08), mat('#1f2a44', { roughness: 0.5 }), 0, 0.49, 0.84));
  }
  if (props.includes('table')) {
    const w = mat('#3a2a1e', { roughness: 0.5 });
    setGroup.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32), w, 0, 0.74, 0.25));
    setGroup.add(mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.72, 12), w, 0, 0.36, 0.25));
  }
  if (props.includes('chart')) {
    const m = mat('#9a9a9a', { roughness: 0.9 });
    for (let y = 0.6; y <= 2.2; y += 0.2) { const bar = mesh(new THREE.BoxGeometry(y % 0.4 < 0.01 ? 3.2 : 2.6, 0.02, 0.01), m, 0, y, -3.09); bar.castShadow = false; setGroup.add(bar); }
  }
  p.subjects.forEach(s => setGroup.add(figure(s)));
  const c = CAM[p.shot]; camera.position.set(...c.pos); camera.fov = c.fov; camera.updateProjectionMatrix(); camera.lookAt(0, c.look, 0);
}
function figure(s) {
  const g = new THREE.Group(); g.position.set(s.x, 0, 0); g.rotation.y = s.yaw * D2R;
  const skin = mat(s.skin, { roughness: 0.42 }), hair = mat(s.hair, { roughness: 0.5 }), cloth = mat(s.shirt, { roughness: 0.62 }), dark = mat('#101010', { roughness: 0.45 });
  const stool = mat('#2a2a2a', { roughness: 0.6, metalness: 0.3 });
  // stool
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24), stool, 0, 0.72, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), stool, 0, 0.36, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), stool, 0, 0.02, 0));
  // body
  const torso = mesh(new THREE.CapsuleGeometry(0.19, 0.3, 6, 16), cloth, 0, 0.98, 0); torso.scale.set(1.05, 1, 0.68); g.add(torso);
  const collar = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 16), cloth, 0, 1.24, 0); g.add(collar);
  g.add(mesh(new THREE.SphereGeometry(0.095, 20, 14), cloth, -0.215, 1.2, 0));
  g.add(mesh(new THREE.SphereGeometry(0.095, 20, 14), cloth, 0.215, 1.2, 0));
  for (const sx of [-1, 1]) {
    const ua = mesh(new THREE.CapsuleGeometry(0.052, 0.3, 4, 10), cloth, sx * 0.265, 1.03, 0.02); ua.rotation.z = sx * -0.12; g.add(ua);
    const fa = mesh(new THREE.CapsuleGeometry(0.045, 0.28, 4, 10), cloth, sx * 0.25, 0.86, 0.2); fa.rotation.x = Math.PI / 2 - 0.25; g.add(fa);
    g.add(mesh(new THREE.SphereGeometry(0.045, 14, 10), skin, sx * 0.24, 0.84, 0.37));
    g.add(mesh(new THREE.BoxGeometry(0.15, 0.13, 0.45), dark, sx * 0.1, 0.72, 0.25));
    g.add(mesh(new THREE.BoxGeometry(0.13, 0.46, 0.14), dark, sx * 0.1, 0.42, 0.44));
  }
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.16, 16), skin, 0, 1.3, 0.0));
  // head
  const head = mesh(new THREE.SphereGeometry(0.115, 40, 30), skin, 0, HY, 0); head.scale.set(0.9, 1.1, 0.98); g.add(head);
  const brow = mesh(new THREE.SphereGeometry(0.1, 20, 12), skin, 0, HY + 0.035, 0.028); brow.scale.set(0.86, 0.26, 0.9); g.add(brow);
  const nose = mesh(new THREE.ConeGeometry(0.02, 0.05, 12), skin, 0, HY - 0.012, 0.118); nose.rotation.x = Math.PI / 2; g.add(nose);
  const chin = mesh(new THREE.SphereGeometry(0.06, 16, 12), skin, 0, HY - 0.085, 0.035); chin.scale.set(1, 0.7, 0.9); g.add(chin);
  for (const sx of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.014, 12, 8), dark, sx * 0.04, HY + 0.012, 0.096); g.add(eye);
    g.add(mesh(new THREE.SphereGeometry(0.03, 12, 8), skin, sx * 0.1, HY - 0.005, -0.01));
  }
  const mouth = mesh(new THREE.BoxGeometry(0.045, 0.008, 0.01), mat('#6a3a3a'), 0, HY - 0.058, 0.108); g.add(mouth);
  const hairGeo = new THREE.SphereGeometry(0.122, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const hr = mesh(hairGeo, hair, 0, HY + 0.015, -0.015); hr.scale.set(0.92, 1.08, 1.0); g.add(hr);
  return g;
}

function applyRig(p, rig) {
  spots.forEach((s, i) => {
    const l = rig[i];
    if (!l || !l.on || l.p <= 0) { s.visible = false; return; }
    const fx = FIXTURES[l.fx], pos = lightPos(p, l), tgt = targetPoint(p, l), c = lightRGB(l);
    s.visible = true; s.position.set(...pos); s.target.position.set(...tgt); s.target.updateMatrixWorld();
    s.color.setRGB(c[0], c[1], c[2], THREE.LinearSRGBColorSpace);
    s.intensity = (l.p / 100) * 9 * fx.eff * OUTPUT_K;
    s.angle = fx.angle; s.penumbra = fx.pen; s.shadow.radius = fx.blur; s.shadow.blurSamples = 8 + fx.blur;
  });
}
function resize() {
  const w = vp.clientWidth, h = vp.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(vp);
let needsRender = true;
function render() { if (needsRender) { renderer.render(scene, camera); needsRender = false; } requestAnimationFrame(render); }
requestAnimationFrame(render);
const invalidate = () => { needsRender = true; };

/* ───────────────────────── state ───────────────────────── */
const params = new URLSearchParams(location.search);
const today = localDateStr();
let dayN = dayNumber(today);
let practice = false, puzzle;
if (params.get('p')) {
  const v = params.get('p'); puzzle = PUZZLES.find(x => x.id === v) || PUZZLES[(parseInt(v, 10) - 1 + PUZZLES.length) % PUZZLES.length] || puzzleForDay(dayN); practice = true;
} else if (params.get('day')) { dayN = parseInt(params.get('day'), 10) || dayN; puzzle = puzzleForDay(dayN); practice = dayN !== dayNumber(today); }
else puzzle = puzzleForDay(dayN);

const resultsKey = 'ld_results', results = store.get(resultsKey, {});
const dayKey = practice ? `practice_${puzzle.id}` : today;
const draftKey = m => `ld_draft_${dayKey}_${m}`;

let mode = (() => { const m = params.get('mode') || store.get('ld_mode', 'medium'); return MODES.includes(m) ? m : 'medium'; })();
let rigs = {}, view = 'mine', tweaking = false;
function freshRig(m) {
  return [0, 1, 2].slice(0, puzzle.lights).map((_, i) => ({
    on: i === 0, az: [0, -50, 50][i], el: 20, d: 2.5, p: 50, k: 4500,
    fx: m === 'easy' ? (puzzle.solution[i]?.fx || 'fresnel') : 'fresnel',
    gel: m === 'easy' ? (puzzle.solution[i]?.gel || 'none') : 'none', t: -1,
  }));
}
for (const m of MODES) {
  const done = results[dayKey]?.[m];
  rigs[m] = done ? done.rig : store.get(draftKey(m), null) || freshRig(m);
  if (rigs[m].length !== puzzle.lights) rigs[m] = freshRig(m);
}
const rig = () => rigs[mode];
const done = () => results[dayKey]?.[mode] || null;

/* ───────────────────────── floor plan ───────────────────────── */
const plan = $('#plan');
const PS = 38, PCX = 200, PCY = 226;
const toPlan = (x, z) => [PCX + x * PS, PCY + z * PS];
function drawPlan() {
  const p = puzzle, r = view === 'theirs' ? p.solution : rig(), locked = view === 'theirs' || (done() && !tweaking);
  const camPos = CAM[p.shot].pos, cp = toPlan(camPos[0], Math.min(camPos[2], 3.55));
  const rl = roles(p, r);
  let s = `<rect x="0" y="0" width="400" height="400" rx="10" fill="#111114"/>`;
  s += `<line x1="0" y1="${PCY - 3.2 * PS}" x2="400" y2="${PCY - 3.2 * PS}" stroke="#2a2a31" stroke-width="6"/>`;
  s += `<text x="200" y="${PCY - 3.2 * PS - 10}" fill="#4a4a55" font-size="10" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="1">BACK WALL</text>`;
  for (const rad of [1, 2, 3]) s += `<circle cx="${PCX}" cy="${PCY}" r="${rad * PS}" fill="none" stroke="#1e1e24" stroke-dasharray="3 5"/>`;
  s += `<text x="${PCX + 1 * PS + 3}" y="${PCY - 4}" fill="#3a3a44" font-size="9" font-family="JetBrains Mono,monospace">1m</text><text x="${PCX + 2 * PS + 3}" y="${PCY - 4}" fill="#3a3a44" font-size="9" font-family="JetBrains Mono,monospace">2m</text><text x="${PCX + 3 * PS + 3}" y="${PCY - 4}" fill="#3a3a44" font-size="9" font-family="JetBrains Mono,monospace">3m</text>`;
  // camera
  s += `<g transform="translate(${cp[0]},${cp[1]})"><path d="M-16,8 L-8,-8 L8,-8 L16,8 Z" fill="#2a2a31" stroke="#55555f"/><rect x="-5" y="-14" width="10" height="7" fill="#55555f"/><text y="22" fill="#6c6c78" font-size="10" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="1">CAMERA</text></g>`;
  // subjects
  p.subjects.forEach((sub, i) => {
    const [x, y] = toPlan(sub.x, 0), f = faceNormal(sub);
    s += `<g transform="translate(${x},${y})"><circle r="11" fill="#2e2e36" stroke="#8a8a96"/><line x1="0" y1="0" x2="${-f[0] * 0 + (-Math.sin(sub.yaw * D2R)) * 17}" y2="${Math.cos(sub.yaw * D2R) * 17}" stroke="#c9c9d4" stroke-width="2" stroke-linecap="round"/><text y="-16" fill="#8a8a96" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">${p.subjects.length > 1 ? subjectName(p, i).toUpperCase() : 'SUBJECT'}</text></g>`;
  });
  // lights
  r.forEach((l, i) => {
    const pos = lightPos(p, l), tgt = targetPoint(p, l), [x, y] = toPlan(pos[0], pos[2]), [tx, ty] = toPlan(tgt[0], tgt[2]);
    const col = cssRGB(lightRGB(l)), on = l.on && l.p > 0;
    const ang = Math.atan2(ty - y, tx - x), half = FIXTURES[l.fx].angle, len = Math.hypot(tx - x, ty - y);
    if (on) {
      const a1 = ang - half, a2 = ang + half;
      s += `<path d="M${x},${y} L${x + Math.cos(a1) * len},${y + Math.sin(a1) * len} A${len},${len} 0 0 1 ${x + Math.cos(a2) * len},${y + Math.sin(a2) * len} Z" fill="${col}" opacity="${0.05 + 0.12 * l.p / 100}"/>`;
      s += `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="1" opacity=".5" stroke-dasharray="2 3"/>`;
    }
    const rad = 10 + 6 * l.p / 100;
    s += `<g class="pl" data-i="${i}" style="cursor:${locked ? 'default' : 'grab'}" transform="translate(${x},${y})"><circle r="${rad + 8}" fill="transparent"/><circle r="${rad}" fill="${on ? col : '#2a2a31'}" stroke="${on ? '#fff' : '#55555f'}" stroke-width="${on ? 1.5 : 1}" opacity="${on ? 1 : 0.6}"/><text y="4" fill="${on ? '#000' : '#8a8a96'}" font-size="11" font-weight="700" font-family="Instrument Sans,sans-serif" text-anchor="middle">${i + 1}</text><text y="${rad + 13}" fill="${on ? '#c9c9d4' : '#55555f'}" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">${rl[i] ? rl[i].toUpperCase() + ' · ' : ''}${l.el >= 0 ? '+' : ''}${Math.round(l.el)}°</text></g>`;
  });
  plan.innerHTML = s;
}
let drag = null;
plan.addEventListener('pointerdown', e => {
  const g = e.target.closest('.pl'); if (!g) return;
  if (view === 'theirs' || (done() && !tweaking)) return;
  drag = { i: +g.dataset.i }; try { plan.setPointerCapture(e.pointerId); } catch { } e.preventDefault();
});
plan.addEventListener('pointermove', e => {
  if (!drag) return;
  const rect = plan.getBoundingClientRect(), px = (e.clientX - rect.left) / rect.width * 400, py = (e.clientY - rect.top) / rect.height * 400;
  const l = rig()[drag.i], tgt = targetPoint(puzzle, l), [tx, ty] = toPlan(tgt[0], tgt[2]);
  const dx = (px - tx) / PS, dz = (py - ty) / PS, dh = Math.hypot(dx, dz);
  l.az = Math.round(Math.atan2(-dx, dz) * R2D);
  l.d = clamp(Math.round(dh / Math.max(Math.cos(l.el * D2R), 0.2) * 10) / 10, 0.8, 5);
  if (!l.on) l.on = true;
  update({ cards: true });
});
const endDrag = () => { if (drag) { drag = null; saveDraft(); } };
plan.addEventListener('pointerup', endDrag); plan.addEventListener('pointercancel', endDrag);

/* ───────────────────────── light cards ───────────────────────── */
const lightsEl = $('#lights');
function buildCards() {
  lightsEl.innerHTML = '';
  rig().forEach((l, i) => {
    const el = document.createElement('div'); el.className = 'light'; el.dataset.i = i;
    const multi = puzzle.subjects.length > 1;
    const fxOpts = Object.entries(FIXTURES).map(([k, f]) => `<option value="${k}">${f.label}</option>`).join('');
    const gelOpts = Object.entries(GELS).map(([k, g]) => `<option value="${k}">${g.label}</option>`).join('');
    el.innerHTML = `
      <div class="lh"><span class="dot"></span><span class="nm">Light ${i + 1}<small class="role"></small></span><button class="sw" data-k="on" aria-label="Light ${i + 1} on/off"></button></div>
      <div class="lb">
        ${multi ? `<div class="row sel"><label>Aim at</label><div class="seg" data-k="t"><button data-v="-1">Group</button>${puzzle.subjects.map((_, j) => `<button data-v="${j}">${subjectName(puzzle, j)[0].toUpperCase() + subjectName(puzzle, j).slice(1)}</button>`).join('')}</div></div>` : ''}
        <div class="row sel"><label>Fixture</label>
          ${mode === 'easy' ? `<div class="fixed" style="color:var(--ink);font-size:13px"></div>` : mode === 'medium' ? `<div class="seg" data-k="fx"><button data-v="fresnel">Hard</button><button data-v="softbox">Soft</button></div>` : `<select data-k="fx">${fxOpts}</select>`}
        </div>
        ${mode !== 'easy' ? `<div class="fxdesc"></div>` : ''}
        <div class="row sel"><label>Gel</label>${mode === 'easy' ? `<div class="fixedgel" style="color:var(--ink);font-size:13px"></div>` : `<select data-k="gel">${gelOpts}</select>`}</div>
        <div class="row"><label>Angle</label><input type="range" data-k="az" min="-180" max="180" step="1"><output></output></div>
        <div class="row"><label>Height</label><input type="range" data-k="el" min="-45" max="85" step="1"><output></output></div>
        <div class="row"><label>Distance</label><input type="range" data-k="d" min="0.8" max="5" step="0.1"><output></output></div>
        <div class="row"><label>Output</label><input type="range" data-k="p" min="0" max="100" step="1"><output></output></div>
        <div class="row"><label>Kelvin</label><input type="range" class="kelvin" data-k="k" min="2000" max="9000" step="100"><output></output></div>
      </div>`;
    lightsEl.appendChild(el);
  });
  lightsEl.oninput = e => {
    const t = e.target; if (!t.dataset.k) return;
    const i = +t.closest('.light').dataset.i, l = rig()[i];
    l[t.dataset.k] = t.type === 'range' ? parseFloat(t.value) : t.value;
    update({ cards: true, keepFocus: t });
  };
  lightsEl.onchange = () => saveDraft();
  lightsEl.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const card = b.closest('.light'), i = +card.dataset.i, l = rig()[i];
    if (b.dataset.k === 'on') { l.on = !l.on; }
    else if (b.dataset.v !== undefined) { const k = b.parentElement.dataset.k; l[k] = k === 't' ? parseInt(b.dataset.v, 10) : b.dataset.v; }
    else return;
    update({ cards: true }); saveDraft();
  };
}
function fillCards() {
  const r = view === 'theirs' ? puzzle.solution : rig(), locked = view === 'theirs' || (done() && !tweaking), rl = roles(puzzle, r);
  $$('.light', lightsEl).forEach((card, i) => {
    const l = r[i];
    if (!l) { card.hidden = true; return; } card.hidden = false;
    card.classList.toggle('off', !l.on); card.classList.toggle('locked', locked);
    $('.dot', card).style.background = l.on ? cssRGB(lightRGB(l)) : '#333'; $('.dot', card).style.color = l.on ? cssRGB(lightRGB(l)) : 'transparent';
    $('.role', card).textContent = rl[i] || '';
    $('.sw', card).classList.toggle('on', l.on);
    $$('input[type=range]', card).forEach(inp => {
      const k = inp.dataset.k; if (document.activeElement !== inp) inp.value = l[k];
      const out = inp.nextElementSibling;
      out.textContent = k === 'az' ? (Math.abs(l.az) < 3 ? 'front' : Math.abs(l.az) > 177 ? 'behind' : `${Math.abs(Math.round(l.az))}° ${l.az > 0 ? 'L' : 'R'}`)
        : k === 'el' ? `${l.el >= 0 ? '+' : ''}${Math.round(l.el)}°` : k === 'd' ? `${l.d.toFixed(1)} m` : k === 'p' ? `${Math.round(l.p)}%` : `${l.k}K`;
    });
    $$('select', card).forEach(s => { s.value = l[s.dataset.k]; });
    $$('.seg', card).forEach(seg => { const k = seg.dataset.k; $$('button', seg).forEach(b => b.classList.toggle('on', String(l[k]) === b.dataset.v)); });
    const fixed = $('.fixed', card); if (fixed) fixed.textContent = FIXTURES[l.fx].label + ' — ' + FIXTURES[l.fx].desc.toLowerCase();
    const fg = $('.fixedgel', card); if (fg) fg.textContent = GELS[l.gel].label;
    const fd = $('.fxdesc', card); if (fd) fd.textContent = FIXTURES[l.fx].desc;
  });
}

/* ───────────────────────── brief, result, share ───────────────────────── */
function renderBrief() {
  $('#p-title').textContent = puzzle.title;
  $('#p-shot').textContent = { single: 'Single · talking head', two: 'Two-shot', three: 'Three-shot' }[puzzle.shot];
  $('#brief-mode').textContent = `${MODE_LABEL[mode]} · ${puzzle.lights} light${puzzle.lights > 1 ? 's' : ''}`;
  $('#p-brief').textContent = mode === 'expert' ? puzzle.brief.expert : puzzle.brief.medium;
  const spec = $('#p-spec'); spec.hidden = mode !== 'easy'; if (mode === 'easy') spec.innerHTML = `<div style="margin-bottom:4px;color:var(--ink-3)">SPEC SHEET</div>${specSheet(puzzle)}`;
  $('#shotinfo').textContent = `${puzzle.title} · ${practice ? 'practice' : '#' + dayN} · ${MODE_LABEL[mode]}`;
  $('#daynum').textContent = practice ? 'practice' : `#${dayN}`;
  $$('.modes button').forEach(b => { b.classList.toggle('on', b.dataset.mode === mode); const d = results[dayKey]?.[b.dataset.mode]; b.innerHTML = MODE_LABEL[b.dataset.mode] + (d ? '<span class="done"></span>' : ''); });
}
const VERDICTS = [[95, 'Print it.', 'That\'s the look. The director is already walking to the monitor to hug you.'], [85, 'Gaffer-approved.', 'One or two notes, but this is a professional rig.'], [70, 'Solid rig, notes to follow.', 'The idea is right; the execution needs a pass.'], [50, 'Getting there.', 'The director can see what you were going for. Mostly.'], [30, 'Back to the lighting cart.', 'Read the brief again and rebuild from the key.'], [0, 'The director has left the set.', 'Somebody turn the house lights back on.']];
function renderResult(res, animate) {
  const card = $('#result'); card.hidden = false;
  const v = VERDICTS.find(x => res.total >= x[0]);
  $('#verdict-h').textContent = v[1]; $('#verdict-p').textContent = v[2];
  const n = $('#score-n');
  if (animate) { const t0 = performance.now(); const step = t => { const u = clamp((t - t0) / 1100, 0, 1); n.textContent = Math.round(res.total * (1 - Math.pow(1 - u, 3))); if (u < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
  else n.textContent = res.total;
  $('#metrics').innerHTML = res.metrics.map(m => `<div class="met"><span class="lab">${m.label}</span><span class="bar"><i class="${m.s >= .8 ? '' : m.s >= .5 ? 'mid' : 'bad'}" style="width:${animate ? 0 : Math.round(m.s * 100)}%"></i></span><span class="val">${m.val}</span><span class="note">${m.note}</span></div>`).join('');
  if (animate) requestAnimationFrame(() => requestAnimationFrame(() => $$('#metrics .bar i').forEach((b, i) => b.style.width = Math.round(res.metrics[i].s * 100) + '%')));
  $('#lesson').innerHTML = `<b>What the director was going for</b>${puzzle.lesson}`;
  const next = MODES[MODES.indexOf(mode) + 1];
  const nb = $('#btn-next-mode'); nb.hidden = !next || !!results[dayKey]?.[next]; if (next) nb.textContent = `Try ${MODE_LABEL[next]} →`;
}
function shareText(res) {
  const sq = res.metrics.map(m => m.s >= .8 ? '🟩' : m.s >= .5 ? '🟨' : '🟥').join('');
  return `Lightdle ${practice ? '(practice)' : '#' + dayN} · ${MODE_LABEL[mode]}\n${puzzle.title} — ${res.total}/100\n${sq}\nhttps://www.jamesrindos.com/lightdle`;
}

/* ───────────────────────── update loop ───────────────────────── */
function update(o = {}) {
  const r = view === 'theirs' ? puzzle.solution : rig();
  applyRig(puzzle, r); invalidate(); drawPlan(); fillCards();
  const live = $('#plan-live');
  if (done() && view === 'mine') { const s = score(puzzle, rig(), mode).total; live.textContent = tweaking ? `Live ${s}` : `Take ${done().score}`; }
  else if (view === 'theirs') live.textContent = 'Director\'s rig'; else live.textContent = '';
  const roll = $('#btn-roll'), sub = $('#roll-sub');
  if (done()) { roll.disabled = true; roll.textContent = `Take scored ${done().score}/100`; sub.textContent = tweaking ? 'Tweak freely — the live score updates in the floor plan.' : 'That\'s your take for today. Scroll up for the notes.'; }
  else if (!rig().some(l => l.on && l.p > 0)) { roll.disabled = true; roll.textContent = 'Turn on a light first'; sub.textContent = practice ? 'Practice round — nothing is recorded.' : 'One take per mode per day. Make it count.'; }
  else { roll.disabled = false; roll.textContent = 'Roll camera'; sub.textContent = practice ? 'Practice round — nothing is recorded.' : 'One take per mode per day. Make it count.'; }
  $('#cmp').hidden = !done();
  $('.rollbar').classList.toggle('static', !!done() && !tweaking);
  $$('#cmp button').forEach(b => b.classList.toggle('on', b.dataset.view === view));
  $('#rec-label').textContent = done() ? (view === 'theirs' ? 'Director\'s take' : 'Take 1') : 'Rehearsal';
}
function saveDraft() { if (!done()) store.set(draftKey(mode), rig()); }

function switchMode(m) {
  mode = m; store.set('ld_mode', m); view = 'mine'; tweaking = false;
  renderBrief(); buildCards();
  const d = done(); $('#result').hidden = !d; if (d) renderResult(score(puzzle, d.rig, mode), false);
  update();
}
function roll() {
  if (done() || !rig().some(l => l.on && l.p > 0)) return;
  const res = score(puzzle, rig(), mode);
  results[dayKey] = results[dayKey] || {}; results[dayKey][mode] = { score: res.total, rig: JSON.parse(JSON.stringify(rig())), when: Date.now() };
  if (!practice) { store.set(resultsKey, results); bumpStats(res.total); }
  tweaking = false; view = 'mine';
  renderBrief(); renderResult(res, true); update();
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function bumpStats(total) {
  const st = store.get('ld_stats', { played: 0, streak: 0, maxStreak: 0, best: 0, lastDay: null, sum: 0, byMode: {} });
  const already = results[today] && Object.keys(results[today]).length > 1; // second mode today
  if (!already) {
    st.played++;
    const y = new Date(); y.setDate(y.getDate() - 1);
    st.streak = st.lastDay === localDateStr(y) ? st.streak + 1 : st.lastDay === today ? st.streak : 1;
    st.maxStreak = Math.max(st.maxStreak, st.streak); st.lastDay = today;
  }
  st.best = Math.max(st.best, total); st.sum = (st.sum || 0) + total; st.n = (st.n || 0) + 1;
  st.byMode[mode] = st.byMode[mode] || { n: 0, sum: 0, best: 0 }; st.byMode[mode].n++; st.byMode[mode].sum += total; st.byMode[mode].best = Math.max(st.byMode[mode].best, total);
  store.set('ld_stats', st);
}
function showStats() {
  const st = store.get('ld_stats', { played: 0, streak: 0, maxStreak: 0, best: 0, sum: 0, n: 0, byMode: {} });
  $('#stats-grid').innerHTML = [['Played', st.played], ['Streak', st.streak], ['Best', st.best], ['Average', st.n ? Math.round(st.sum / st.n) : '–']].map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('');
  $('#stats-hist').innerHTML = MODES.map(m => { const b = st.byMode?.[m]; const avg = b && b.n ? Math.round(b.sum / b.n) : 0; return `<div class="hr"><span>${MODE_LABEL[m]}</span><span style="display:flex;align-items:center;gap:8px"><i class="${m === mode ? 'me' : ''}" style="width:${avg}%"></i>${b && b.n ? `${avg} avg · best ${b.best} · ${b.n} take${b.n > 1 ? 's' : ''}` : 'not played'}</span></div>`; }).join('');
  $('#m-stats').hidden = false;
}

/* ───────────────────────── wiring ───────────────────────── */
$$('.modes button').forEach(b => b.onclick = () => switchMode(b.dataset.mode));
$('#btn-roll').onclick = roll;
$('#btn-tweak').onclick = () => { tweaking = true; view = 'mine'; update(); toast('Controls unlocked — live score in the floor plan'); $('#lights').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
$('#btn-next-mode').onclick = () => { const next = MODES[MODES.indexOf(mode) + 1]; if (next) { switchMode(next); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
$('#btn-share').onclick = async () => {
  const d = done(); if (!d) return; const txt = shareText(score(puzzle, d.rig, mode));
  try { if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { await navigator.share({ text: txt }); return; } } catch { }
  try { await navigator.clipboard.writeText(txt); toast('Copied to clipboard'); } catch { prompt('Copy your result', txt); }
};
$$('#cmp button').forEach(b => b.onclick = () => { view = b.dataset.view; update(); });
$('#btn-help').onclick = () => $('#m-help').hidden = false;
$('#btn-practice').onclick = () => { const others = PUZZLES.filter(p => p.id !== puzzle.id); const pick = others[Math.floor(Math.random() * others.length)]; location.href = `./?p=${pick.id}&mode=${mode}`; };
$('#btn-stats').onclick = showStats;
$$('.modal').forEach(m => { m.onclick = e => { if (e.target === m || e.target.closest('[data-close]')) m.hidden = true; }; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal').forEach(m => m.hidden = true); });
if (!store.get('ld_seen_help', false)) { $('#m-help').hidden = false; store.set('ld_seen_help', true); }

// timecode
const tcEl = $('#tc'), t0 = performance.now();
setInterval(() => { const f = Math.floor((performance.now() - t0) / 1000 * 24); const s = Math.floor(f / 24), m = Math.floor(s / 60), h = Math.floor(m / 60); tcEl.textContent = [h, m % 60, s % 60, f % 24].map(x => String(x).padStart(2, '0')).join(':'); }, 1000 / 24);

buildSet(puzzle);
switchMode(mode);
resize();
$('#loading').remove();

// debug hooks
window.__lightdle = { puzzle, score: (m = mode) => score(puzzle, rig(), m), solutionScore: (m = mode) => score(puzzle, puzzle.solution, m), rig, setRig: r => { rigs[mode] = r; update(); }, PUZZLES, FIXTURES, analyse: r => analyse(puzzle, r || rig()), scoreFor: (p, r, m) => score(p, r, m) };
