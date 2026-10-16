// Lightdle — mannequins, fixtures and environments. Everything here is dumb geometry; lights live in app.js.
import * as THREE from 'three';

const PI = Math.PI;
export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });
export function mesh(geo, m, x = 0, y = 0, z = 0, shadow = true) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; return o; }
const emis = (color, intensity = 1) => new THREE.MeshStandardMaterial({ color: 0x111111, emissive: color, emissiveIntensity: intensity, roughness: 0.6 });
const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const sph = (r, s = 16) => new THREE.SphereGeometry(r, s, Math.max(8, s / 2));
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 12);

/* ───────────── mannequin ───────────── */
// head: a Mesh template (the scanned bust, already scaled so its height is ~0.42 m)
export function mannequin({ head, normalMap, tint, pose, yaw, HY }) {
  const g = new THREE.Group(); g.rotation.y = yaw * PI / 180;
  const clay = mat(tint, { roughness: 0.55 });
  const headMat = mat(tint, { roughness: 0.52, normalMap, normalScale: new THREE.Vector2(0.55, 0.55) });
  const joint = mat(new THREE.Color(tint).multiplyScalar(0.8), { roughness: 0.45 });
  // bust: top of bust ≈ HY + 0.14 (head centre sits a little above the bust's centre)
  const bust = head.clone(); bust.material = headMat; bust.castShadow = bust.receiveShadow = true;
  const bb = new THREE.Box3().setFromObject(bust); bust.position.y = HY + 0.14 - bb.max.y; bust.position.x = -(bb.min.x + bb.max.x) / 2; bust.position.z = -(bb.min.z + bb.max.z) / 2 - 0.02;
  g.add(bust);
  const bustBottom = HY + 0.14 - (bb.max.y - bb.min.y);
  const seated = pose !== 'standing';
  const hip = seated ? 0.72 : 0.86;
  // torso (dress-form) from just inside the bust down to the hips
  const torsoH = bustBottom + 0.06 - hip;
  const torso = mesh(cyl(0.165, 0.135, torsoH, 20), clay, 0, hip + torsoH / 2, 0); torso.scale.z = 0.68; g.add(torso);
  const pelvis = mesh(sph(0.15, 20), clay, 0, hip, 0); pelvis.scale.set(1.05, 0.55, 0.7); g.add(pelvis);
  // arms
  for (const sx of [-1, 1]) {
    const sy = bustBottom + 0.1, sxp = sx * 0.21;
    g.add(mesh(sph(0.052), joint, sxp, sy, 0));
    const ua = mesh(cap(0.045, 0.24), clay, sxp + sx * 0.03, sy - 0.16, 0.01); ua.rotation.z = sx * -0.1; g.add(ua);
    const ey = sy - 0.32; g.add(mesh(sph(0.042), joint, sxp + sx * 0.05, ey, 0.01));
    if (seated) { const fa = mesh(cap(0.038, 0.22), clay, sxp + sx * 0.03, ey - 0.07, 0.15); fa.rotation.x = PI / 2 - 0.35; g.add(fa); g.add(mesh(sph(0.04), joint, sxp + sx * 0.02, ey - 0.13, 0.3)); }
    else { const fa = mesh(cap(0.038, 0.22), clay, sxp + sx * 0.055, ey - 0.16, 0.02); g.add(fa); g.add(mesh(sph(0.04), joint, sxp + sx * 0.055, ey - 0.33, 0.03)); }
  }
  // legs
  for (const sx of [-1, 1]) {
    const hx = sx * 0.1;
    if (seated) {
      const th = mesh(cap(0.07, 0.3), clay, hx, hip - 0.02, 0.2); th.rotation.x = PI / 2; g.add(th);
      g.add(mesh(sph(0.065), joint, hx, hip - 0.04, 0.4));
      g.add(mesh(cap(0.055, 0.32), clay, hx, hip - 0.28, 0.44));
      const ft = mesh(box(0.09, 0.05, 0.22), clay, hx, 0.03, 0.5); g.add(ft);
    } else {
      g.add(mesh(cap(0.07, 0.32), clay, hx, hip - 0.24, 0));
      g.add(mesh(sph(0.065), joint, hx, hip - 0.46, 0));
      g.add(mesh(cap(0.055, 0.32), clay, hx, hip - 0.68, 0));
      g.add(mesh(box(0.09, 0.05, 0.24), clay, hx, 0.03, 0.05));
    }
  }
  return g;
}

/* ───────────── light fixtures (visual only) ───────────── */
export function fixtureGizmo(fx) {
  const g = new THREE.Group();
  const metal = mat('#222226', { roughness: 0.5, metalness: 0.6 });
  const face = emis('#ffffff', 1);
  g.userData.face = face;
  const head = new THREE.Group(); g.add(head); g.userData.head = head;
  if (fx === 'softbox' || fx === 'booklight') {
    const s = fx === 'booklight' ? 1.1 : 0.7;
    head.add(mesh(box(s, s, 0.05), face, 0, 0, 0.03, false));
    head.add(mesh(box(s + 0.06, s + 0.06, 0.3), mat('#151518', { roughness: 0.9 }), 0, 0, -0.15, false));
  } else if (fx === 'tube') {
    const t = mesh(cyl(0.025, 0.025, 1.1, 12), face, 0, 0, 0, false); head.add(t);
  } else if (fx === 'bulb') {
    head.add(mesh(sph(0.06, 16), face, 0, 0, 0, false));
    head.add(mesh(cyl(0.02, 0.025, 0.06, 8), metal, 0, 0.08, 0, false));
  } else { // fresnel / open face
    head.add(mesh(cyl(0.13, 0.12, 0.3, 20).rotateX(PI / 2), metal, 0, 0, -0.1, false));
    head.add(mesh(cyl(fx === 'open' ? 0.1 : 0.09, 0.09, 0.02, 20).rotateX(PI / 2), face, 0, 0, 0.06, false));
    for (const a of [0, PI / 2, PI, -PI / 2]) { const flap = mesh(box(0.26, 0.02, 0.18), metal, 0, 0, 0.1, false); flap.position.set(Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0.12); flap.rotation.z = a; flap.rotation.x = 0.5; head.add(flap); }
  }
  const stand = mesh(cyl(0.012, 0.012, 1, 8), metal, 0, 0, 0, false); g.add(stand); g.userData.stand = stand;
  const base = new THREE.Group(); g.add(base); g.userData.base = base;
  for (let i = 0; i < 3; i++) { const leg = mesh(box(0.4, 0.02, 0.03), metal, 0, 0.01, 0, false); leg.rotation.y = i * PI * 2 / 3; leg.position.set(Math.cos(i * PI * 2 / 3) * 0.2, 0.01, -Math.sin(i * PI * 2 / 3) * 0.2); base.add(leg); }
  const cord = mesh(cyl(0.006, 0.006, 1, 6), metal, 0, 0, 0, false); g.add(cord); g.userData.cord = cord; cord.visible = false;
  return g;
}
// place a gizmo for a light at world pos, aiming at target. Hanging fixtures (bulb) drop from the ceiling.
export function placeGizmo(g, pos, tgt, fx, ceiling = 3) {
  g.position.set(0, 0, 0);
  const h = g.userData.head; h.position.set(...pos); h.lookAt(...tgt);
  const stand = g.userData.stand, base = g.userData.base, cord = g.userData.cord;
  // in a studio, anything behind the subject or near the camera axis is rigged from the grid, not a stand
  const hanging = fx === 'bulb' || (pos[1] > 1.8 && (pos[2] < -0.3 || Math.abs(pos[0]) < 1.2 || pos[1] > ceiling - 0.6));
  stand.visible = base.visible = !hanging && pos[1] > 0.25;
  cord.visible = hanging;
  if (hanging) { const len = Math.max(0.05, ceiling - pos[1]); cord.scale.y = len; cord.position.set(pos[0], pos[1] + len / 2, pos[2]); }
  else { const len = Math.max(0.05, pos[1]); stand.scale.y = len; stand.position.set(pos[0], len / 2, pos[2]); base.position.set(pos[0], 0, pos[2]); }
}

/* ───────────── environment pieces ───────────── */
function room(g, { w = 9, d = 7, h = 3.2, wall, floor, ceiling = null, back = -3.2 }) {
  const fl = mesh(new THREE.PlaneGeometry(w, d + 6), mat(floor, { roughness: 0.92 }), 0, 0, (back + 3) / 2); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl);
  g.add(mesh(box(w, h, 0.2), mat(wall, { roughness: 0.95 }), 0, h / 2, back - 0.1, false));
  g.add(mesh(box(0.2, h, d + 6), mat(wall, { roughness: 0.95 }), -w / 2, h / 2, (back + 3) / 2, false));
  g.add(mesh(box(0.2, h, d + 6), mat(wall, { roughness: 0.95 }), w / 2, h / 2, (back + 3) / 2, false));
  if (ceiling) { const c = mesh(box(w, 0.2, d + 6), mat(ceiling, { roughness: 1 }), 0, h + 0.1, (back + 3) / 2, false); g.add(c); }
}
function stool(g, x, z, yaw, color = '#2a2a2e') {
  const m = mat(color, { roughness: 0.5, metalness: 0.3 }); const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = yaw * PI / 180;
  s.add(mesh(cyl(0.19, 0.19, 0.04, 24), m, 0, 0.7, 0)); s.add(mesh(cyl(0.025, 0.025, 0.68, 8), m, 0, 0.35, 0)); s.add(mesh(cyl(0.22, 0.22, 0.02, 24), m, 0, 0.01, 0)); g.add(s);
}
function chair(g, x, z, yaw, { seat = '#3a3a3e', frame = '#1a1a1c', director = false } = {}) {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = yaw * PI / 180;
  const fm = mat(frame, { roughness: 0.5, metalness: 0.4 }), sm = mat(seat, { roughness: 0.85 });
  c.add(mesh(box(0.46, 0.05, 0.46), sm, 0, 0.7, 0));
  c.add(mesh(box(0.46, director ? 0.22 : 0.5, 0.04), sm, 0, director ? 1.08 : 0.96, -0.22));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.add(mesh(cyl(0.015, 0.015, 0.7, 8), fm, sx * 0.2, 0.35, sz * 0.2));
  for (const sx of [-1, 1]) c.add(mesh(cyl(0.015, 0.015, 0.52, 8), fm, sx * 0.2, 0.96, -0.22));
  if (director) for (const sx of [-1, 1]) c.add(mesh(box(0.04, 0.03, 0.4), fm, sx * 0.24, 0.92, 0.02));
  g.add(c);
}
function table(g, x, z, { r = 0.5, color = '#3a2a1e', h = 0.74 } = {}) {
  const m = mat(color, { roughness: 0.5 });
  g.add(mesh(cyl(r, r, 0.05, 32), m, x, h, z)); g.add(mesh(cyl(0.05, 0.1, h - 0.05, 12), m, x, (h - 0.05) / 2, z));
}
function desk(g, x, z, w = 2.6, color = '#2b2b30', front = '#1f2a44') {
  g.add(mesh(box(w, 0.06, 0.7), mat(color, { roughness: 0.35 }), x, 0.98, z));
  g.add(mesh(box(w, 0.96, 0.08), mat(front, { roughness: 0.5 }), x, 0.49, z + 0.34));
}
function cstand(g, x, z, h = 2.2, withFlag = false) {
  const m = mat('#1c1c20', { roughness: 0.5, metalness: 0.6 });
  g.add(mesh(cyl(0.012, 0.012, h, 8), m, x, h / 2, z));
  for (let i = 0; i < 3; i++) { const leg = mesh(box(0.5, 0.02, 0.03), m, 0, 0, 0); leg.rotation.y = i * 2.1; leg.position.set(x + Math.cos(i * 2.1) * 0.25, 0.02 + i * 0.03, z - Math.sin(i * 2.1) * 0.25); g.add(leg); }
  if (withFlag) { const f = mesh(box(0.6, 0.9, 0.02), mat('#0a0a0a', { roughness: 1 }), x + 0.35, h - 0.2, z); g.add(f); }
}
function windowFrame(g, x, y, z, w, h, { blinds = false, glow = null, yaw = 0 } = {}) {
  const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = yaw;
  const fm = mat('#2a2622', { roughness: 0.8 });
  f.add(mesh(box(w + 0.1, 0.06, 0.08), fm, 0, h / 2, 0, false)); f.add(mesh(box(w + 0.1, 0.06, 0.08), fm, 0, -h / 2, 0, false));
  f.add(mesh(box(0.06, h, 0.08), fm, -w / 2, 0, 0, false)); f.add(mesh(box(0.06, h, 0.08), fm, w / 2, 0, 0, false));
  if (glow) { f.add(mesh(box(w, h, 0.02), emis(glow, 0.6), 0, 0, -0.02, false)); f.add(mesh(box(0.04, h, 0.05), fm, 0, 0, 0.01, false)); f.add(mesh(box(w, 0.04, 0.05), fm, 0, 0, 0.01, false)); }
  if (blinds) for (let yy = -h / 2 + 0.05; yy < h / 2; yy += 0.09) { const s = mesh(box(w, 0.025, 0.04), mat('#8a8a86', { roughness: 0.7 }), 0, yy, 0.02); s.rotation.x = 0.35; f.add(s); }
  g.add(f);
}
function tree(g, x, z, { trunk = '#3b2a1a', leaves = '#3f6b32', h = 3.5, r = 1.2 } = {}) {
  g.add(mesh(cyl(0.08, 0.14, h * 0.45, 8), mat(trunk, { roughness: 0.9 }), x, h * 0.225, z));
  const lm = mat(leaves, { roughness: 0.9 });
  g.add(mesh(sph(r, 10), lm, x, h * 0.55, z)); g.add(mesh(sph(r * 0.8, 10), lm, x + r * 0.5, h * 0.7, z - r * 0.3)); g.add(mesh(sph(r * 0.75, 10), lm, x - r * 0.5, h * 0.72, z + r * 0.2));
}
function bench(g, x, z, yaw) {
  const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = yaw * PI / 180;
  const w = mat('#5a3f28', { roughness: 0.8 }), m = mat('#2a2a2a', { roughness: 0.6, metalness: 0.4 });
  for (let i = 0; i < 3; i++) b.add(mesh(box(1.6, 0.04, 0.12), w, 0, 0.7, -0.08 + i * 0.14));
  for (let i = 0; i < 2; i++) b.add(mesh(box(1.6, 0.12, 0.04), w, 0, 0.95 + i * 0.16, -0.24));
  for (const sx of [-1, 1]) { b.add(mesh(box(0.06, 0.7, 0.5), m, sx * 0.7, 0.35, 0.02)); b.add(mesh(box(0.06, 0.5, 0.04), m, sx * 0.7, 0.95, -0.24)); }
  g.add(b);
}
function cityWall(g, z, w = 10, h = 3.2, rnd) {
  g.add(mesh(box(w, h, 0.1), mat('#05070d', { roughness: 1 }), 0, h / 2, z, false));
  const wm = emis('#ffd9a0', 0.9), wm2 = emis('#9ec5ff', 0.7);
  let x = -w / 2 + 0.3;
  while (x < w / 2 - 0.6) {
    const bw = 0.4 + rnd() * 0.8, bh = 0.8 + rnd() * (h - 1.0);
    g.add(mesh(box(bw, bh, 0.06), mat('#0b0e16', { roughness: 1 }), x + bw / 2, bh / 2, z + 0.06, false));
    for (let yy = 0.15; yy < bh - 0.1; yy += 0.17) for (let xx = 0.07; xx < bw - 0.08; xx += 0.14) if (rnd() < 0.45) g.add(mesh(box(0.07, 0.09, 0.01), rnd() < 0.8 ? wm : wm2, x + xx + 0.035, yy, z + 0.1, false));
    x += bw + 0.08;
  }
}
function neon(g, x, y, z, color, text = 'zig') {
  const m = emis(color, 2.2); const n = new THREE.Group(); n.position.set(x, y, z);
  const pts = [new THREE.Vector3(-0.5, 0.15, 0), new THREE.Vector3(-0.2, -0.15, 0), new THREE.Vector3(0.1, 0.15, 0), new THREE.Vector3(0.4, -0.15, 0), new THREE.Vector3(0.6, 0.1, 0)];
  const curve = new THREE.CatmullRomCurve3(pts); n.add(mesh(new THREE.TubeGeometry(curve, 40, 0.018, 8), m, 0, 0, 0, false));
  n.add(mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 32), m, 0.95, 0, 0, false));
  g.add(n);
}
function candle(g, x, z, h = 0.78) {
  g.add(mesh(cyl(0.012, 0.014, 0.14, 8), mat('#f2e8d0', { roughness: 0.8 }), x, h + 0.07, z));
  g.add(mesh(sph(0.02, 8).scale(0.6, 1.4, 0.6), emis('#ffb347', 3), x, h + 0.17, z, false));
}
function monitor(g, x, y, z, w = 0.6, h = 0.36, color = '#8fb4ff', yaw = 0) {
  const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = yaw;
  s.add(mesh(box(w + 0.03, h + 0.03, 0.03), mat('#111114', { roughness: 0.6 }), 0, 0, 0, false));
  s.add(mesh(box(w, h, 0.01), emis(color, 1.2), 0, 0, 0.02, false));
  s.add(mesh(cyl(0.03, 0.08, 0.12, 8), mat('#111114'), 0, -h / 2 - 0.06, -0.02, false));
  g.add(s);
}
function seatsFor(g, p, HY, style) {
  // one seat per seated subject
  if (p.pose === 'standing') return;
  p.subjects.forEach(s => { if (style === 'chair') chair(g, s.x, 0, s.yaw, { seat: '#2e2e33', frame: '#1a1a1c' }); else if (style === 'director') chair(g, s.x, 0, s.yaw, { seat: '#141416', frame: '#6b5a44', director: true }); else if (style === 'wood') chair(g, s.x, 0, s.yaw, { seat: '#5a3f28', frame: '#3a2a1a' }); else stool(g, s.x, 0, s.yaw); });
}
function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ───────────── environments ───────────── */
// each returns { bg, sky, ground, ambient } for the renderer; g is the set group
export const SETS = {
  interview(g, p, HY) {
    room(g, { wall: '#3d4249', floor: '#2a2b2e', back: -3.2 });
    // seamless backdrop stand + roll
    g.add(mesh(cyl(0.05, 0.05, 5.4, 12).rotateZ(PI / 2), mat('#1a1a1c', { metalness: 0.6, roughness: 0.4 }), 0, 2.75, -2.6, false));
    g.add(mesh(box(5.2, 2.75, 0.04), mat('#4a4e55', { roughness: 0.98 }), 0, 1.375, -2.62, false));
    seatsFor(g, p, HY, 'director');
    chair(g, -1.35, 0.55, 118, { seat: '#141416', frame: '#6b5a44', director: true }); // the interviewer, camera-left
    cstand(g, -2.4, -1.4, 2.3, true); cstand(g, 2.6, -1.9, 2.0); g.add(mesh(box(0.5, 0.2, 0.3), mat('#8a6d4a', { roughness: 0.9 }), 2.2, 0.1, -1.2));
    return { bg: '#111214', sky: '#aab4c4', ground: '#2a2420', amb: 0.16 };
  },
  noir(g, p, HY) {
    room(g, { w: 6, wall: '#2a2c2e', floor: '#1c1c1e', ceiling: '#1a1a1a', back: -2.4, h: 2.9 });
    windowFrame(g, -2.95, 1.7, -0.6, 1.4, 1.1, { blinds: true, yaw: PI / 2 });
    table(g, 0, 0.55, { r: 0.55, color: '#3a3330', h: 0.76 });
    g.add(mesh(cyl(0.004, 0.004, 1.0, 6), mat('#222'), 0, 2.4, 0.2, false)); g.add(mesh(cyl(0.05, 0.035, 0.08, 10), mat('#222'), 0, 1.86, 0.2, false));
    seatsFor(g, p, HY, 'chair');
    chair(g, -1.6, 1.0, 120, { seat: '#2e2e33' });
    return { bg: '#0a0a0b', sky: '#5a6070', ground: '#1a1512', amb: 0.1, ceil: 2.9 };
  },
  tvstudio(g, p, HY) {
    room(g, { wall: '#162445', floor: '#2a2d36', back: -3.2 });
    g.add(mesh(box(5.5, 2.4, 0.06), emis('#1e3a7a', 0.9), 0, 1.6, -3.0, false));
    g.add(mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 48), emis('#ff9a3c', 1.6), 0, 1.7, -2.9, false));
    desk(g, 0, 0.5, 2.8, '#2b2b30', '#1f2a44');
    g.add(mesh(box(2.8, 0.04, 0.05), emis('#5fb7ff', 1.5), 0, 0.5, 0.86, false));
    for (const x of [-2.6, 2.6]) { monitor(g, x, 1.4, -2.0, 0.9, 0.5, '#2f6bff', x > 0 ? -0.5 : 0.5); cstand(g, x, -2.3, 2.6); }
    seatsFor(g, p, HY, 'chair');
    return { bg: '#0b1020', sky: '#3f5a9a', ground: '#1a1a22', amb: 0.2 };
  },
  basement(g, p, HY) {
    room(g, { w: 6, wall: '#2a2a26', floor: '#1b1b19', ceiling: '#1c1c1a', back: -2.6, h: 2.8 });
    const pipe = mat('#4a4642', { roughness: 0.6, metalness: 0.5 });
    g.add(mesh(cyl(0.06, 0.06, 6, 10).rotateZ(PI / 2), pipe, 0, 2.3, -1.6, false)); g.add(mesh(cyl(0.04, 0.04, 6, 10).rotateZ(PI / 2), pipe, 0, 2.15, -2.3, false));
    g.add(mesh(cyl(0.004, 0.004, 0.6, 6), mat('#111'), 0, 2.2, 0.1, false));
    for (const [x, z, s] of [[-2.2, -1.8, 0.6], [-1.7, -2.1, 0.5], [2.3, -1.5, 0.7], [2.0, -1.5, 0.45]]) g.add(mesh(box(s, s * 0.7, s), mat('#6b5a3e', { roughness: 0.95 }), x, s * 0.35, z));
    windowFrame(g, 2.0, 2.1, -2.55, 0.8, 0.45, { glow: '#2a3a5a' });
    seatsFor(g, p, HY, 'wood');
    return { bg: '#080807', sky: '#3a4050', ground: '#1a1512', amb: 0.1, ceil: 2.8 };
  },
  atelier(g, p, HY) {
    room(g, { w: 7, wall: '#4a3b2c', floor: '#5a4330', back: -2.8, h: 3.4 });
    windowFrame(g, -2.3, 2.1, -2.72, 1.2, 1.9, { glow: '#9aa9b8' });
    // easel + canvas, camera-right
    const wood = mat('#6b4a2e', { roughness: 0.85 });
    g.add(mesh(box(0.05, 2.0, 0.05), wood, 1.9, 1.0, -0.9)); g.add(mesh(box(0.05, 2.0, 0.05), wood, 2.4, 1.0, -0.8)); g.add(mesh(box(0.05, 2.2, 0.05), wood, 2.15, 1.1, -1.4));
    const canvas = mesh(box(0.8, 1.0, 0.03), mat('#e8dcc4', { roughness: 0.95 }), 2.15, 1.3, -0.82); canvas.rotation.y = -0.1; g.add(canvas);
    table(g, -1.6, 0.3, { r: 0.35, color: '#5a3f28', h: 0.8 });
    g.add(mesh(cyl(0.12, 0.14, 0.3, 10), mat('#8a6a48', { roughness: 0.9 }), -1.5, 0.95, 0.25));
    seatsFor(g, p, HY, 'wood');
    return { bg: '#1a140f', sky: '#8a8070', ground: '#3a2a1a', amb: 0.14 };
  },
  latenight(g, p, HY) {
    const fl = mesh(new THREE.PlaneGeometry(14, 14), mat('#1e1f26', { roughness: 0.3, metalness: 0.1 })); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl);
    cityWall(g, -3.3, 12, 3.2, seeded(7));
    desk(g, 0, 0.6, 2.4, '#2a2a30', '#2a1a38');
    g.add(mesh(box(2.4, 0.05, 0.06), emis('#ff6a9a', 1.4), 0, 0.98, 0.95, false));
    seatsFor(g, p, HY, 'chair');
    return { bg: '#070912', sky: '#4a4a7a', ground: '#15151a', amb: 0.16 };
  },
  scifi(g, p, HY) {
    room(g, { w: 7, wall: '#16181c', floor: '#101114', ceiling: '#101114', back: -3.0, h: 3.0 });
    for (const x of [-3.4, 3.4]) for (let z = -2.5; z < 2.5; z += 1.2) g.add(mesh(box(0.04, 2.4, 0.08), emis(x < 0 ? '#ff8a2a' : '#3a8cff', 1.4), x, 1.5, z, false));
    for (let x = -2.5; x <= 2.5; x += 1.25) g.add(mesh(box(0.6, 0.02, 0.06), emis('#9ad0ff', 0.8), x, 2.95, -2.0, false));
    table(g, 0, 0.6, { r: 0.6, color: '#1c1e22', h: 0.78 });
    seatsFor(g, p, HY, 'chair');
    return { bg: '#06070a', sky: '#2a3a5a', ground: '#101010', amb: 0.12 };
  },
  dinner(g, p, HY) {
    room(g, { w: 7, wall: '#2a1f16', floor: '#1e1510', ceiling: '#1a120d', back: -2.8, h: 3.0 });
    table(g, 0, 0.25, { r: 0.7, color: '#4a3220', h: 0.76 });
    g.add(mesh(box(1.5, 0.01, 1.5), mat('#e8e0cc', { roughness: 0.98 }), 0, 0.79, 0.25, false));
    for (const [x, z] of [[-0.12, 0.2], [0.1, 0.32], [0.0, 0.12]]) candle(g, x, z, 0.79);
    g.add(mesh(box(0.9, 1.6, 0.4), mat('#3a2818', { roughness: 0.8 }), -2.6, 0.8, -2.4));
    windowFrame(g, 2.0, 1.8, -2.72, 1.1, 1.4, { glow: '#0f1a30' });
    seatsFor(g, p, HY, 'wood');
    return { bg: '#0a0806', sky: '#3a2a20', ground: '#1a120c', amb: 0.08 };
  },
  park(g, p, HY) {
    const fl = mesh(new THREE.PlaneGeometry(40, 40), mat('#4a6b35', { roughness: 1 })); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl);
    const path = mesh(new THREE.PlaneGeometry(2.2, 40), mat('#8a8070', { roughness: 1 }), 0, 0.005, 0); path.rotation.x = -PI / 2; path.rotation.z = 0.25; path.castShadow = false; g.add(path);
    for (const [x, z, s] of [[-3.2, -3.5, 1.0], [2.8, -4.2, 1.2], [-6, -6, 1.4], [5.5, -7, 1.3], [8, -3, 1.0], [-8.5, -2, 1.1], [0.5, -9, 1.5], [-4, -9.5, 1.3], [4.5, -9.5, 1.2], [9, -8, 1.4]]) tree(g, x, z, { h: 3.5 * s, r: 1.2 * s, leaves: ['#3f6b32', '#4e7a3a', '#5a8a3e'][Math.floor((x * 7 + z * 3 + 100) % 3)] });
    if (p.pose !== 'standing') bench(g, 0, -0.22, 0);
    for (const [x, z] of [[-2.2, 1.5], [2.6, -1.2], [-1.5, -2.6]]) g.add(mesh(sph(0.3, 8).scale(1, 0.5, 1), mat('#3a5a2a', { roughness: 1 }), x, 0.1, z));
    return { bg: '#f3c99a', sky: '#ffd9b0', ground: '#4a6b35', amb: 0.55, outdoor: true, skyTop: '#6fa2d9', skyBottom: '#ffd0a0' };
  },
  headshot(g, p, HY) {
    room(g, { wall: '#5c6068', floor: '#3a3c40', back: -3.2 });
    g.add(mesh(box(4, 3, 0.03), mat('#8a8e95', { roughness: 0.98 }), 0, 1.5, -2.4, false));
    g.add(mesh(cyl(0.04, 0.04, 4.2, 10).rotateZ(PI / 2), mat('#1a1a1c', { metalness: 0.6, roughness: 0.4 }), 0, 3.0, -2.4, false));
    cstand(g, -2.5, -0.5, 2.4); cstand(g, 2.6, -1.2, 2.1, true);
    g.add(mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 32), mat('#ddd', { roughness: 0.5 }), -2.5, 2.4, -0.5, false));
    seatsFor(g, p, HY, 'stool');
    return { bg: '#1a1b1e', sky: '#c0c4cc', ground: '#2a2a2a', amb: 0.2 };
  },
  lineup(g, p, HY) {
    room(g, { w: 7, wall: '#3a3b3a', floor: '#232323', ceiling: '#202020', back: -1.0, h: 2.8 });
    const m = mat('#9a9a9a', { roughness: 0.9 });
    for (let y = 0.6; y <= 2.2; y += 0.2) g.add(mesh(box(y % 0.4 < 0.01 ? 5.5 : 4.5, 0.02, 0.01), m, 0, y, -0.89, false));
    for (let x = -2.5; x <= 2.5; x += 1.0) g.add(mesh(box(0.02, 2.0, 0.01), mat('#5a5a5a'), x, 1.5, -0.89, false));
    g.add(mesh(box(0.04, 2.8, 8), mat('#101010', { roughness: 0.1, metalness: 0.9 }), 3.45, 1.4, 0, false));
    return { bg: '#0d0d0d', sky: '#404040', ground: '#1a1a1a', amb: 0.14 };
  },
  warehouse(g, p, HY) {
    room(g, { w: 12, d: 10, wall: '#17171a', floor: '#121214', ceiling: '#0e0e10', back: -5.0, h: 4.5 });
    const pm = mat('#2a2a2e', { roughness: 0.9 });
    for (const x of [-3.5, 3.5]) for (const z of [-4, -1.5, 1.5]) g.add(mesh(box(0.4, 4.5, 0.4), pm, x, 2.25, z));
    g.add(mesh(box(3.2, 3.2, 0.1), mat('#202024', { roughness: 0.7, metalness: 0.3 }), 0, 1.6, -4.9, false));
    for (let y = 0.3; y < 3.2; y += 0.4) g.add(mesh(box(3.2, 0.02, 0.12), mat('#141416'), 0, y, -4.85, false));
    for (let i = 0; i < 6; i++) g.add(mesh(box(0.9, 0.9, 0.9), mat('#2a2622', { roughness: 0.95 }), -4.5 + (i % 3) * 0.95, 0.45 + Math.floor(i / 3) * 0.9, -3.8));
    return { bg: '#050506', sky: '#2a2a3a', ground: '#101010', amb: 0.1, fog: 0.06 };
  },
  bar(g, p, HY) {
    room(g, { w: 7, wall: '#241c18', floor: '#1a130f', ceiling: '#15100c', back: -2.8, h: 3.0 });
    g.add(mesh(box(3.2, 1.0, 0.6), mat('#3a2616', { roughness: 0.6 }), -1.2, 0.5, -2.1, false)); g.add(mesh(box(3.4, 0.06, 0.7), mat('#5a3a20', { roughness: 0.35 }), -1.2, 1.03, -2.1, false));
    for (let i = 0; i < 3; i++) g.add(mesh(box(3.0, 0.04, 0.25), mat('#4a3020', { roughness: 0.6 }), -1.2, 1.5 + i * 0.45, -2.7, false));
    for (let i = 0; i < 16; i++) g.add(mesh(cyl(0.035, 0.045, 0.3, 8), mat(['#7a3a1a', '#3a6a3a', '#2a3a7a', '#9a7a2a'][i % 4], { roughness: 0.2, metalness: 0.1 }), -2.6 + (i % 8) * 0.36, 1.67 + Math.floor(i / 8) * 0.45, -2.7, false));
    g.add(mesh(box(3.0, 0.03, 0.03), emis('#ffb060', 2), -1.2, 2.45, -2.62, false));
    table(g, 0, 0.3, { r: 0.45, color: '#2a1a10', h: 0.76 });
    windowFrame(g, 2.0, 1.75, -2.72, 1.3, 1.3, { glow: '#120a1e' }); neon(g, 1.75, 1.95, -2.6, '#ff2a8a');
    seatsFor(g, p, HY, 'stool');
    return { bg: '#0a0705', sky: '#3a2a30', ground: '#1a120c', amb: 0.1 };
  },
  bedroom(g, p, HY) {
    room(g, { w: 6, wall: '#2a2e3a', floor: '#2a2420', ceiling: '#22242c', back: -2.6, h: 2.7 });
    desk(g, 0, 0.75, 1.8, '#3a3a40', '#2a2a30'); monitor(g, 0.78, 1.28, 0.55, 0.6, 0.36, '#7fb0ff', PI - 0.6);
    g.add(mesh(box(0.3, 0.02, 0.1), mat('#111'), -0.4, 1.02, 0.6, false));
    g.add(mesh(box(1.2, 0.3, 0.3), mat('#3a3a44'), -1.9, 1.9, -2.45, false)); g.add(mesh(box(1.2, 0.3, 0.3), mat('#3a3a44'), -1.9, 1.3, -2.45, false));
    for (let i = 0; i < 9; i++) g.add(mesh(box(0.05, 0.22, 0.16), mat(['#b05030', '#3a6a9a', '#d0b060', '#3a8a5a'][i % 4]), -2.4 + i * 0.12, 2.17, -2.45, false));
    g.add(mesh(box(2.2, 0.02, 0.02), emis('#6a3aff', 2), -1.9, 2.08, -2.3, false));
    g.add(mesh(box(1.6, 0.5, 2.0), mat('#4a4a6a', { roughness: 0.95 }), 2.2, 0.25, -1.5)); g.add(mesh(box(1.6, 0.9, 0.1), mat('#3a3a50'), 2.2, 0.75, -2.5, false));
    seatsFor(g, p, HY, 'chair');
    return { bg: '#0b0c12', sky: '#4a5a8a', ground: '#1a1a20', amb: 0.16 };
  },
  campfire(g, p, HY) {
    const fl = mesh(new THREE.PlaneGeometry(40, 40), mat('#2a3020', { roughness: 1 })); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl);
    for (const [x, z, s] of [[-3.5, -3.5, 1.1], [3.2, -4.0, 1.3], [-6.5, -5.5, 1.4], [6, -6.5, 1.2], [0.5, -8, 1.5], [-9, -2, 1.1], [9, -2.5, 1.0]]) tree(g, x, z, { h: 4 * s, r: 1.1 * s, leaves: '#1e3a1e', trunk: '#2a1e14' });
    const logs = mat('#3a2a1a', { roughness: 0.9 });
    for (let i = 0; i < 4; i++) { const l = mesh(cyl(0.05, 0.05, 0.6, 8).rotateZ(PI / 2), logs, 0, 0.06, 1.1); l.rotation.y = i * 0.8; g.add(l); }
    g.add(mesh(sph(0.14, 10).scale(1, 1.6, 1), emis('#ff7a1a', 2.5), 0, 0.25, 1.1, false));
    for (const a of [0, 1, 2, 3, 4, 5]) g.add(mesh(sph(0.16, 8), mat('#4a4a48', { roughness: 1 }), Math.cos(a) * 0.5, 0.08, 1.1 + Math.sin(a) * 0.5));
    g.add(mesh(cyl(0.2, 0.22, 0.4, 10), mat('#3a2a1a'), -1.2, 0.2, 0.4)); g.add(mesh(cyl(0.2, 0.22, 0.4, 10), mat('#3a2a1a'), 1.3, 0.2, 0.5));
    if (p.pose !== 'standing') p.subjects.forEach(s => g.add(mesh(cyl(0.24, 0.26, 0.7, 12), mat('#3a2a1a', { roughness: 0.95 }), s.x, 0.35, 0)));
    return { bg: '#06070c', sky: '#1a2240', ground: '#1a1a14', amb: 0.1, outdoor: true, skyTop: '#05070f', skyBottom: '#1a2240', stars: true };
  },
  courtroom(g, p, HY) {
    room(g, { w: 9, wall: '#4a3826', floor: '#3a2e22', ceiling: '#3a3028', back: -3.0, h: 3.6 });
    for (let x = -4.2; x <= 4.2; x += 0.6) g.add(mesh(box(0.5, 2.2, 0.04), mat('#5a4530', { roughness: 0.8 }), x, 1.1, -2.95, false));
    g.add(mesh(box(9, 0.12, 0.08), mat('#2a1e14'), 0, 2.26, -2.93, false));
    g.add(mesh(box(3.8, 0.08, 0.12), mat('#5a4530', { roughness: 0.6 }), 0, 1.02, 0.65)); for (const x of [-1.8, -0.6, 0.6, 1.8]) g.add(mesh(box(0.08, 1.0, 0.08), mat('#5a4530'), x, 0.5, 0.65));
    g.add(mesh(box(0.8, 1.6, 0.06), mat('#c0b090', { roughness: 0.9 }), -3.8, 1.5, -2.5, false)); g.add(mesh(cyl(0.02, 0.02, 2.4, 8), mat('#d4b060', { metalness: 0.7, roughness: 0.3 }), -4.2, 1.2, -2.4, false));
    seatsFor(g, p, HY, 'wood');
    return { bg: '#120d08', sky: '#8a7a60', ground: '#3a2a1a', amb: 0.16 };
  },
};
