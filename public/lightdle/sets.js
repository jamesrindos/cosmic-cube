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

/* ───────────── NPCs ───────────── */
// Kenney "Animated Characters" (CC0): one rigged body, many painted skins. Posed by bone at runtime.
import { clone as skelClone } from 'three/addons/utils/SkeletonUtils.js';
const D = PI / 180;
const NPC_SCALE = 0.45; // the FBX is ~3.77 units tall; this makes a ~1.7 m character
export let SEAT = 0.5;  // seat height, measured from the posed model's hips (set by prepareNpc)
export function npc({ body, skin, pose, yaw }) {
  const rig = skelClone(body); rig.scale.setScalar(NPC_SCALE);
  const m = new THREE.MeshStandardMaterial({ map: skin, roughness: 0.82, metalness: 0 });
  rig.traverse(o => { if (o.isMesh || o.isSkinnedMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; o.material = m; } });
  const B = {}; rig.traverse(o => { if (o.isBone) B[o.name] = o; });
  const P = (b, x, y, z) => { if (B[b]) B[b].rotation.set(x * D, y * D, z * D); };
  const seated = pose !== 'standing';
  const bodyYaw = yaw * 0.5, neckYaw = yaw - bodyYaw;
  // this rig's bone axes differ per side: right arm drops about z, left arm about x
  P('Neck', 2, neckYaw, 0);
  if (seated) {
    P('RightArm', 0, 0, -68); P('LeftArm', -68, 0, 0);
    P('RightForeArm', 0, -55, 0); P('LeftForeArm', 0, 0, 55);
    P('RightUpLeg', 84, 0, -4); P('LeftUpLeg', 84, 0, 4);
    P('RightLeg', 84, 0, 0); P('LeftLeg', 84, 0, 0);
    P('Spine', 3, 0, 0);
  } else {
    P('RightArm', 0, 0, -78); P('LeftArm', -78, 0, 0);
    P('RightForeArm', 0, -8, 0); P('LeftForeArm', 0, 0, 8);
  }
  rig.updateMatrixWorld(true);
  // ground the figure on the lowest foot bone
  const v = new THREE.Vector3(); let minY = 9;
  for (const n of ['LeftFoot', 'RightFoot', 'LeftToes', 'RightToes']) if (B[n]) { B[n].getWorldPosition(v); minY = Math.min(minY, v.y); }
  const sole = 0.05 * NPC_SCALE / 0.45;
  const g = new THREE.Group(); g.add(rig); rig.position.y = -(minY - sole); g.rotation.y = bodyYaw * D; g.updateMatrixWorld(true);
  B.Head.getWorldPosition(v); const headY = v.y; B.Hips.getWorldPosition(v); const hipY = v.y;
  return { group: g, eyeY: headY + 0.17, hipY };
}
export function prepareNpc(body, pose) {
  const m = npc({ body, skin: null, pose, yaw: 0 });
  SEAT = m.hipY - 0.04;
  return { HY: m.eyeY, hipY: m.hipY };
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

/* ───────────── props (Kenney kits, CC0) ───────────── */
// Models are loaded by app.js into PROPS (name → gltf scene). Each set lists the names it needs.
export const PROPS = {};
const _pcache = {};
function propInfo(name) {
  if (_pcache[name]) return _pcache[name];
  const src = PROPS[name]; if (!src) return null;
  const bb = new THREE.Box3().setFromObject(src);
  return (_pcache[name] = { cx: (bb.min.x + bb.max.x) / 2, cz: (bb.min.z + bb.max.z) / 2, minY: bb.min.y, h: bb.max.y - bb.min.y });
}
// place a prop with its footprint centred on (x, z), standing on y. rot in degrees. Returns the group (or null if the model is missing).
function prop(g, name, x, z, { rot = 0, s = 1, y = 0, shadow = true } = {}) {
  const src = PROPS[name], info = propInfo(name); if (!src) return null;
  const o = src.clone(true);
  o.traverse(m => { if (m.isMesh) { m.castShadow = shadow; m.receiveShadow = true; if (m.material) { m.material = m.material.clone(); m.material.roughness = Math.max(0.6, m.material.roughness ?? 0.8); m.material.metalness = 0; } } });
  const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = rot * PI / 180; w.scale.setScalar(s);
  o.position.set(-info.cx, -info.minY, -info.cz); w.add(o); g.add(w); return w;
}
const propH = (name, s = 1) => (propInfo(name)?.h || 0) * s;

/* ───────────── environment pieces ───────────── */
function room(g, { w = 9, d = 7, h = 3.2, wall, floor, ceiling = null, back = -3.2 }) {
  const fl = mesh(new THREE.PlaneGeometry(w, d + 6), mat(floor, { roughness: 0.92 }), 0, 0, (back + 3) / 2); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl);
  g.add(mesh(box(w, h, 0.2), mat(wall, { roughness: 0.95 }), 0, h / 2, back - 0.1, false));
  g.add(mesh(box(0.2, h, d + 6), mat(wall, { roughness: 0.95 }), -w / 2, h / 2, (back + 3) / 2, false));
  g.add(mesh(box(0.2, h, d + 6), mat(wall, { roughness: 0.95 }), w / 2, h / 2, (back + 3) / 2, false));
  if (ceiling) { const c = mesh(box(w, 0.2, d + 6), mat(ceiling, { roughness: 1 }), 0, h + 0.1, (back + 3) / 2, false); g.add(c); }
}
// a seat for every seated subject, from a Kenney chair model (its seat sits at about half its height)
function seatsFor(g, p, name, { s = 1, dz = 0.03 } = {}) {
  if (p.pose === 'standing') return;
  p.subjects.forEach(sub => prop(g, name, sub.x, dz, { rot: sub.yaw * 0.5, s }));
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
function neon(g, x, y, z, color) {
  const m = emis(color, 2.2); const n = new THREE.Group(); n.position.set(x, y, z);
  const pts = [new THREE.Vector3(-0.5, 0.15, 0), new THREE.Vector3(-0.2, -0.15, 0), new THREE.Vector3(0.1, 0.15, 0), new THREE.Vector3(0.4, -0.15, 0), new THREE.Vector3(0.6, 0.1, 0)];
  const curve = new THREE.CatmullRomCurve3(pts); n.add(mesh(new THREE.TubeGeometry(curve, 40, 0.018, 8), m, 0, 0, 0, false));
  n.add(mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 32), m, 0.95, 0, 0, false));
  g.add(n);
}
function candle(g, x, z, h) {
  g.add(mesh(cyl(0.012, 0.014, 0.12, 8), mat('#f2e8d0', { roughness: 0.8 }), x, h + 0.06, z));
  g.add(mesh(sph(0.018, 8).scale(0.6, 1.4, 0.6), emis('#ffb347', 3), x, h + 0.15, z, false));
}
function screenGlow(g, x, y, z, w, h, color, yaw = 0) { const s = mesh(box(w, h, 0.01), emis(color, 1.2), x, y, z, false); s.rotation.y = yaw; g.add(s); }
function hangingBulb(g, x, z, y = 1.9, ceil = 2.8) {
  g.add(mesh(cyl(0.004, 0.004, ceil - y, 6), mat('#222'), x, (ceil + y) / 2, z, false));
  prop(g, 'lampSquareCeiling', x, z, { y: y - 0.23, s: 1.2, shadow: false });
}
function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function outdoors(g, color, size = 40) { const fl = mesh(new THREE.PlaneGeometry(size, size), mat(color, { roughness: 1 })); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl); }

/* ───────────── environments ───────────── */
// each entry: props to preload, and build(g, p) → { bg, sky, ground, amb, ... } for the renderer
export const SETS = {
  interview: {
    props: ['chairModernCushion', 'pottedPlant', 'cardboardBoxClosed'],
    build(g, p) {
      room(g, { wall: '#3d4249', floor: '#2a2b2e', back: -3.2 });
      g.add(mesh(cyl(0.05, 0.05, 5.4, 12).rotateZ(PI / 2), mat('#1a1a1c', { metalness: 0.6, roughness: 0.4 }), 0, 2.75, -2.6, false));
      g.add(mesh(box(5.2, 2.75, 0.04), mat('#4a4e55', { roughness: 0.98 }), 0, 1.375, -2.62, false));
      seatsFor(g, p, 'chairModernCushion');
      prop(g, 'chairModernCushion', -1.3, 0.6, { rot: 120 }); // the producer, camera-left
      prop(g, 'pottedPlant', 2.1, -1.9, { s: 1.6 }); prop(g, 'pottedPlant', -2.4, -2.1, { s: 1.3 });
      cstand(g, -2.4, -1.4, 2.3, true); cstand(g, 2.6, -1.9, 2.0);
      prop(g, 'cardboardBoxClosed', 2.5, -0.8, { s: 1.6, rot: 20 }); prop(g, 'cardboardBoxClosed', 2.7, -0.8, { s: 1.6, y: 0.45, rot: -10 });
      return { bg: '#111214', sky: '#aab4c4', ground: '#2a2420', amb: 0.16 };
    },
  },
  noir: {
    props: ['chair', 'table', 'lampSquareCeiling', 'radio'],
    build(g, p) {
      room(g, { w: 6, wall: '#2a2c2e', floor: '#1c1c1e', ceiling: '#1a1a1a', back: -2.4, h: 2.9 });
      windowFrame(g, -2.95, 1.7, -0.6, 1.4, 1.1, { blinds: true, yaw: PI / 2 });
      prop(g, 'table', 0, 1.05, { s: 1.15, rot: 90 });
      seatsFor(g, p, 'chair');
      prop(g, 'chair', -1.5, 1.1, { rot: 125 });
      hangingBulb(g, 0, 0.2, 1.85, 2.9);
      prop(g, 'radio', 2.6, -2.1, { s: 1.4, rot: -30 });
      return { bg: '#0a0a0b', sky: '#5a6070', ground: '#1a1512', amb: 0.1, ceil: 2.9 };
    },
  },
  tvstudio: {
    props: ['chairDesk', 'kitchenBar', 'kitchenBarEnd', 'televisionModern', 'computerScreen', 'pottedPlant'],
    build(g, p) {
      room(g, { wall: '#162445', floor: '#2a2d36', back: -3.2 });
      g.add(mesh(box(5.5, 2.4, 0.06), emis('#1e3a7a', 0.9), 0, 1.6, -3.0, false));
      g.add(mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 48), emis('#ff9a3c', 1.6), 0, 1.7, -2.9, false));
      // a curved news desk from kitchen-bar sections
      for (let i = -3; i <= 3; i++) prop(g, i === -3 ? 'kitchenBarEnd' : 'kitchenBar', i * 0.52, 0.62, { s: 1.25, rot: i === -3 ? 180 : 0 });
      g.add(mesh(box(3.9, 0.04, 0.05), emis('#5fb7ff', 1.5), 0, 0.2, 0.9, false));
      seatsFor(g, p, 'chairDesk', { s: 0.9 });
      for (const x of [-2.6, 2.6]) { prop(g, 'televisionModern', x, -2.0, { s: 1.6, y: 1.1, rot: x > 0 ? -30 : 30 }); screenGlow(g, x, 1.46, -2.0, 1.0, 0.6, '#2f6bff', (x > 0 ? -30 : 30) * PI / 180); cstand(g, x, -2.3, 2.6); }
      prop(g, 'pottedPlant', -3.4, -1.0, { s: 1.6 });
      return { bg: '#0b1020', sky: '#3f5a9a', ground: '#1a1a22', amb: 0.2 };
    },
  },
  basement: {
    props: ['chairRounded', 'cardboardBoxClosed', 'cardboardBoxOpen', 'washer', 'dryer', 'lampSquareCeiling', 'bookcaseOpen', 'barrel'],
    build(g, p) {
      room(g, { w: 6, wall: '#2a2a26', floor: '#1b1b19', ceiling: '#1c1c1a', back: -2.6, h: 2.8 });
      const pipe = mat('#4a4642', { roughness: 0.6, metalness: 0.5 });
      g.add(mesh(cyl(0.06, 0.06, 6, 10).rotateZ(PI / 2), pipe, 0, 2.3, -1.6, false)); g.add(mesh(cyl(0.04, 0.04, 6, 10).rotateZ(PI / 2), pipe, 0, 2.15, -2.3, false));
      hangingBulb(g, 0, 0.1, 2.0, 2.8);
      prop(g, 'washer', -2.3, -2.2, { s: 1.6 }); prop(g, 'dryer', -1.6, -2.2, { s: 1.6 });
      prop(g, 'cardboardBoxClosed', 2.2, -2.0, { s: 1.7 }); prop(g, 'cardboardBoxOpen', 2.4, -1.5, { s: 1.6, rot: 25 }); prop(g, 'cardboardBoxClosed', 2.2, -2.0, { s: 1.5, y: 0.48, rot: 15 });
      prop(g, 'barrel', -2.6, -1.3, { s: 1.5 }); prop(g, 'bookcaseOpen', 1.4, -2.35, { s: 1.6 });
      windowFrame(g, 2.0, 2.1, -2.55, 0.8, 0.45, { glow: '#2a3a5a' });
      seatsFor(g, p, 'chairRounded');
      return { bg: '#080807', sky: '#3a4050', ground: '#1a1512', amb: 0.1, ceil: 2.8 };
    },
  },
  atelier: {
    props: ['chair', 'sideTable', 'pottedPlant', 'bookcaseOpen', 'lampRoundFloor', 'books'],
    build(g, p) {
      room(g, { w: 7, wall: '#4a3b2c', floor: '#5a4330', back: -2.8, h: 3.4 });
      windowFrame(g, -2.3, 2.1, -2.72, 1.2, 1.9, { glow: '#9aa9b8' });
      const wood = mat('#6b4a2e', { roughness: 0.85 });
      g.add(mesh(box(0.05, 2.0, 0.05), wood, 1.9, 1.0, -0.9)); g.add(mesh(box(0.05, 2.0, 0.05), wood, 2.4, 1.0, -0.8)); g.add(mesh(box(0.05, 2.2, 0.05), wood, 2.15, 1.1, -1.4));
      const canvas = mesh(box(0.8, 1.0, 0.03), mat('#e8dcc4', { roughness: 0.95 }), 2.15, 1.3, -0.82); canvas.rotation.y = -0.1; g.add(canvas);
      prop(g, 'sideTable', -1.5, 0.3, { s: 1.4 }); prop(g, 'books', -1.5, 0.3, { s: 1.3, y: propH('sideTable', 1.4) });
      prop(g, 'bookcaseOpen', 0.8, -2.65, { s: 1.6 }); prop(g, 'pottedPlant', -2.8, -1.5, { s: 1.6 }); prop(g, 'lampRoundFloor', 2.9, -2.2, { s: 1.6 });
      seatsFor(g, p, 'chair');
      return { bg: '#1a140f', sky: '#8a8070', ground: '#3a2a1a', amb: 0.14 };
    },
  },
  latenight: {
    props: ['chairDesk', 'desk', 'pottedPlant', 'loungeChair'],
    build(g, p) {
      const fl = mesh(new THREE.PlaneGeometry(14, 14), mat('#1e1f26', { roughness: 0.3, metalness: 0.1 })); fl.rotation.x = -PI / 2; fl.castShadow = false; g.add(fl);
      cityWall(g, -3.3, 12, 3.2, seeded(7));
      prop(g, 'desk', 0.2, 0.7, { s: 1.5, rot: 0 });
      g.add(mesh(box(1.1, 0.05, 0.06), emis('#ff6a9a', 1.4), 0.2, propH('desk', 1.5), 1.0, false));
      seatsFor(g, p, 'chairDesk', { s: 0.9 });
      prop(g, 'loungeChair', -1.7, 0.4, { s: 1.5, rot: 110 }); prop(g, 'pottedPlant', 2.6, -1.2, { s: 1.8 });
      return { bg: '#070912', sky: '#4a4a7a', ground: '#15151a', amb: 0.16 };
    },
  },
  scifi: {
    props: ['chairModernCushion', 'tableCoffee', 'metal-panel'],
    build(g, p) {
      room(g, { w: 7, wall: '#16181c', floor: '#101114', ceiling: '#101114', back: -3.0, h: 3.0 });
      for (const x of [-3.4, 3.4]) for (let z = -2.5; z < 2.5; z += 1.2) g.add(mesh(box(0.04, 2.4, 0.08), emis(x < 0 ? '#ff8a2a' : '#3a8cff', 1.4), x, 1.5, z, false));
      for (let x = -2.5; x <= 2.5; x += 1.25) g.add(mesh(box(0.6, 0.02, 0.06), emis('#9ad0ff', 0.8), x, 2.95, -2.0, false));
      for (let x = -3; x <= 3; x += 1) prop(g, 'metal-panel', x, -2.88, { s: 2.0, rot: 0 });
      prop(g, 'tableCoffee', 0, 1.0, { s: 1.5, rot: 90 });
      seatsFor(g, p, 'chairModernCushion');
      return { bg: '#06070a', sky: '#2a3a5a', ground: '#101010', amb: 0.12 };
    },
  },
  dinner: {
    props: ['chair', 'tableCloth', 'bookcaseClosedWide', 'lampRoundTable', 'sideTable', 'bottle'],
    build(g, p) {
      room(g, { w: 7, wall: '#2a1f16', floor: '#1e1510', ceiling: '#1a120d', back: -2.8, h: 3.0 });
      prop(g, 'tableCloth', 0, 0.42, { s: 1.4, rot: 90 });
      const th = propH('tableCloth', 1.4);
      for (const [x, z] of [[-0.1, 0.35], [0.1, 0.5], [0.0, 0.25]]) candle(g, x, z, th);
      prop(g, 'bottle', 0.3, 0.3, { s: 1.4, y: th }); prop(g, 'bottle', -0.3, 0.55, { s: 1.4, y: th });
      prop(g, 'bookcaseClosedWide', -2.5, -2.5, { s: 1.6 }); prop(g, 'sideTable', 2.4, -2.4, { s: 1.5 }); prop(g, 'lampRoundTable', 2.4, -2.4, { s: 1.5, y: propH('sideTable', 1.5), shadow: false });
      windowFrame(g, 2.0, 1.8, -2.72, 1.1, 1.4, { glow: '#0f1a30' });
      seatsFor(g, p, 'chair');
      return { bg: '#0a0806', sky: '#3a2a20', ground: '#1a120c', amb: 0.08 };
    },
  },
  park: {
    props: ['bench', 'tree_default', 'tree_oak', 'tree_detailed', 'tree_fat', 'plant_bush', 'plant_bushLarge', 'flower_redA', 'flower_yellowA', 'flower_purpleA', 'grass_large', 'rock_smallA', 'path_stone'],
    build(g, p) {
      outdoors(g, '#4a6b35');
      for (let i = -6; i <= 6; i++) prop(g, 'path_stone', i * 0.5 + 0.1, 1.6 - i * 0.12, { s: 1.6, rot: i * 7, shadow: false });
      const trees = [['tree_default', -3.2, -3.5, 2.6], ['tree_oak', 2.8, -4.2, 3.0], ['tree_detailed', -6, -6, 3.2], ['tree_fat', 5.5, -7, 3.4], ['tree_default', 8, -3, 2.8], ['tree_oak', -8.5, -2, 3.0], ['tree_detailed', 0.5, -9, 3.6], ['tree_fat', -4, -9.5, 3.3], ['tree_default', 4.5, -9.5, 3.0], ['tree_oak', 9, -8, 3.4]];
      for (const [n, x, z, s] of trees) prop(g, n, x, z, { s, rot: (x * 37) % 360 });
      if (p.pose !== 'standing') prop(g, 'bench', 0, -0.1, { s: 2.2 });
      for (const [n, x, z] of [['plant_bush', -2.2, 1.5], ['plant_bushLarge', 2.6, -1.2], ['plant_bush', -1.5, -2.6], ['plant_bushLarge', 3.5, 0.8]]) prop(g, n, x, z, { s: 2.0 });
      for (const [n, x, z] of [['flower_redA', -1.6, 0.9], ['flower_yellowA', 1.9, 0.3], ['flower_purpleA', -2.6, -0.8], ['flower_redA', 2.2, -2.4], ['flower_yellowA', -3.0, 0.5]]) prop(g, n, x, z, { s: 1.8 });
      for (let i = 0; i < 14; i++) prop(g, 'grass_large', Math.sin(i * 2.4) * 3.5, -1.5 + Math.cos(i * 1.7) * 3, { s: 1.6, rot: i * 50, shadow: false });
      prop(g, 'rock_smallA', 3.2, -2.8, { s: 1.6 });
      return { bg: '#f3c99a', sky: '#ffd9b0', ground: '#4a6b35', amb: 0.55, outdoor: true, skyTop: '#6fa2d9', skyBottom: '#ffd0a0' };
    },
  },
  headshot: {
    props: ['stoolBar', 'lampSquareFloor', 'pottedPlant', 'cardboardBoxClosed'],
    build(g, p) {
      room(g, { wall: '#5c6068', floor: '#3a3c40', back: -3.2 });
      g.add(mesh(box(4, 3, 0.03), mat('#8a8e95', { roughness: 0.98 }), 0, 1.5, -2.4, false));
      g.add(mesh(cyl(0.04, 0.04, 4.2, 10).rotateZ(PI / 2), mat('#1a1a1c', { metalness: 0.6, roughness: 0.4 }), 0, 3.0, -2.4, false));
      cstand(g, -2.5, -0.5, 2.4); cstand(g, 2.6, -1.2, 2.1, true);
      g.add(mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 32), mat('#ddd', { roughness: 0.5 }), -2.5, 2.4, -0.5, false));
      prop(g, 'lampSquareFloor', 2.9, 0.4, { s: 1.6 }); prop(g, 'pottedPlant', -3.0, -1.8, { s: 1.6 });
      seatsFor(g, p, 'stoolBar', { s: 1.15 });
      return { bg: '#1a1b1e', sky: '#c0c4cc', ground: '#2a2a2a', amb: 0.2 };
    },
  },
  lineup: {
    props: [],
    build(g, p) {
      room(g, { w: 7, wall: '#3a3b3a', floor: '#232323', ceiling: '#202020', back: -1.0, h: 2.8 });
      const m = mat('#9a9a9a', { roughness: 0.9 });
      for (let y = 0.4; y <= 2.0; y += 0.2) g.add(mesh(box(y % 0.4 < 0.01 ? 5.5 : 4.5, 0.02, 0.01), m, 0, y, -0.89, false));
      for (let x = -2.5; x <= 2.5; x += 1.0) g.add(mesh(box(0.02, 1.8, 0.01), mat('#5a5a5a'), x, 1.3, -0.89, false));
      g.add(mesh(box(0.04, 2.8, 8), mat('#101010', { roughness: 0.1, metalness: 0.9 }), 3.45, 1.4, 0, false));
      return { bg: '#0d0d0d', sky: '#404040', ground: '#1a1a1a', amb: 0.14 };
    },
  },
  warehouse: {
    props: ['cardboardBoxClosed', 'box-large', 'box', 'barrel', 'metal-panel', 'workbench', 'chest'],
    build(g, p) {
      room(g, { w: 12, d: 10, wall: '#17171a', floor: '#121214', ceiling: '#0e0e10', back: -5.0, h: 4.5 });
      const pm = mat('#2a2a2e', { roughness: 0.9 });
      for (const x of [-3.5, 3.5]) for (const z of [-4, -1.5, 1.5]) g.add(mesh(box(0.4, 4.5, 0.4), pm, x, 2.25, z));
      for (let x = -3; x <= 3; x += 1) prop(g, 'metal-panel', x, -4.9, { s: 2.2 });
      for (let i = 0; i < 6; i++) prop(g, 'box-large', -4.5 + (i % 3) * 0.6, -3.8, { s: 2.2, y: Math.floor(i / 3) * 0.55, rot: 90 });
      for (const [x, z] of [[4.2, -3.5], [4.6, -3.0], [4.0, -2.9]]) prop(g, 'barrel', x, z, { s: 2.0 });
      prop(g, 'cardboardBoxClosed', 2.5, -4.0, { s: 2.2 }); prop(g, 'box', -2.0, -4.2, { s: 2.2, rot: 30 }); prop(g, 'workbench', 1.0, -4.3, { s: 2.0 }); prop(g, 'chest', -4.6, -1.8, { s: 2.0, rot: 60 });
      return { bg: '#050506', sky: '#2a2a3a', ground: '#101010', amb: 0.1, fog: 0.06 };
    },
  },
  bar: {
    props: ['stoolBar', 'tableRound', 'kitchenBar', 'kitchenBarEnd', 'bookcaseOpen', 'bottle', 'bottle-large', 'lampSquareCeiling'],
    build(g, p) {
      room(g, { w: 7, wall: '#241c18', floor: '#1a130f', ceiling: '#15100c', back: -2.8, h: 3.0 });
      for (let i = -3; i <= 1; i++) prop(g, i === -3 ? 'kitchenBarEnd' : 'kitchenBar', i * 0.52 - 0.6, -2.0, { s: 1.4, rot: i === -3 ? 180 : 0 });
      for (const x of [-2.4, -1.75, -1.1, -0.45]) { prop(g, 'bookcaseOpen', x, -2.65, { s: 1.6 }); for (let k = 0; k < 3; k++) prop(g, k === 1 ? 'bottle-large' : 'bottle', x - 0.2 + k * 0.2, -2.65, { s: 1.5, y: 0.5 }); for (let k = 0; k < 3; k++) prop(g, k === 0 ? 'bottle-large' : 'bottle', x - 0.2 + k * 0.2, -2.65, { s: 1.5, y: 0.98 }); }
      g.add(mesh(box(3.0, 0.03, 0.03), emis('#ffb060', 2), -1.4, 2.45, -2.62, false));
      hangingBulb(g, 0, 0.5, 2.1, 3.0);
      prop(g, 'tableRound', 0, 0.55, { s: 1.0 });
      windowFrame(g, 2.0, 1.75, -2.72, 1.3, 1.3, { glow: '#120a1e' }); neon(g, 1.75, 1.95, -2.6, '#ff2a8a');
      seatsFor(g, p, 'stoolBar', { s: 1.15 });
      return { bg: '#0a0705', sky: '#3a2a30', ground: '#1a120c', amb: 0.1 };
    },
  },
  bedroom: {
    props: ['chairDesk', 'desk', 'computerScreen', 'computerKeyboard', 'bedSingle', 'bookcaseOpen', 'lampSquareTable', 'pottedPlant', 'rugRound', 'speakerSmall', 'pillow', 'books'],
    build(g, p) {
      room(g, { w: 6, wall: '#2a2e3a', floor: '#2a2420', ceiling: '#22242c', back: -2.6, h: 2.7 });
      prop(g, 'rugRound', 0, 0.3, { s: 2.6 });
      prop(g, 'desk', 0, 0.85, { s: 1.5, rot: 180 }); const dh = propH('desk', 1.5);
      prop(g, 'computerScreen', 0.55, 0.7, { s: 1.4, y: dh, rot: 150 }); screenGlow(g, 0.5, dh + 0.2, 0.74, 0.46, 0.3, '#7fb0ff', 150 * PI / 180);
      prop(g, 'computerKeyboard', -0.25, 0.75, { s: 1.4, y: dh, rot: 180 }); prop(g, 'speakerSmall', -1.75, 0.3, { s: 1.0, rot: 30 });
      prop(g, 'bedSingle', 2.2, -1.6, { s: 1.6, rot: 90 }); prop(g, 'pillow', 2.2, -2.2, { s: 1.5, y: 0.5, rot: 90 });
      prop(g, 'bookcaseOpen', -1.9, -2.45, { s: 1.6 }); prop(g, 'books', -1.9, -2.45, { s: 1.4, y: 0.52 }); prop(g, 'books', -1.9, -2.45, { s: 1.4, y: 1.0 });
      g.add(mesh(box(2.2, 0.02, 0.02), emis('#6a3aff', 2), -1.9, 2.08, -2.3, false));
      prop(g, 'lampSquareTable', -2.6, -1.0, { s: 1.5, shadow: false }); prop(g, 'pottedPlant', 2.7, 0.2, { s: 1.4 });
      seatsFor(g, p, 'chairDesk', { s: 0.9 });
      return { bg: '#0b0c12', sky: '#4a5a8a', ground: '#1a1a20', amb: 0.16 };
    },
  },
  campfire: {
    props: ['campfire_logs', 'campfire_stones', 'log_large', 'log', 'log_stack', 'tree_pineTallA', 'tree_pineTallB', 'tree_pineRoundA', 'rock_largeA', 'rock_largeC', 'tent', 'grass_large'],
    build(g, p) {
      outdoors(g, '#2a3020');
      for (const [n, x, z, s] of [['tree_pineTallA', -3.5, -3.5, 2.8], ['tree_pineTallB', 3.2, -4.0, 3.2], ['tree_pineRoundA', -6.5, -5.5, 3.4], ['tree_pineTallA', 6, -6.5, 3.0], ['tree_pineTallB', 0.5, -8, 3.6], ['tree_pineRoundA', -9, -2, 2.8], ['tree_pineTallA', 9, -2.5, 2.6], ['tree_pineTallB', -5, -8.5, 3.3]]) prop(g, n, x, z, { s, rot: (x * 53) % 360 });
      prop(g, 'campfire_stones', 0, 1.7, { s: 1.6 }); prop(g, 'campfire_logs', 0, 1.7, { s: 1.6 });
      g.add(mesh(sph(0.1, 10).scale(1, 1.8, 1), emis('#ff7a1a', 2.5), 0, 0.22, 1.7, false));
      prop(g, 'tent', -2.6, -2.2, { s: 3.0, rot: 35 }); prop(g, 'log_stack', 2.4, -1.6, { s: 2.0, rot: -20 });
      prop(g, 'rock_largeA', 3.0, 0.6, { s: 1.6 }); prop(g, 'rock_largeC', -2.8, 0.9, { s: 1.6, rot: 40 });
      for (let i = 0; i < 10; i++) prop(g, 'grass_large', Math.sin(i * 2.1) * 3.2, -1 + Math.cos(i * 1.3) * 2.5, { s: 1.6, rot: i * 40, shadow: false });
      if (p.pose !== 'standing') p.subjects.forEach(s => prop(g, 'log_large', s.x, -0.12, { s: 1.0, rot: 90 }));
      return { bg: '#06070c', sky: '#1a2240', ground: '#1a1a14', amb: 0.1, outdoor: true, skyTop: '#05070f', skyBottom: '#1a2240', stars: true };
    },
  },
  courtroom: {
    props: ['benchCushion', 'paneling', 'tableCloth', 'coatRackStanding'],
    build(g, p) {
      room(g, { w: 9, wall: '#4a3826', floor: '#3a2e22', ceiling: '#3a3028', back: -3.0, h: 3.6 });
      for (let x = -4.2; x <= 4.2; x += 0.6) g.add(mesh(box(0.5, 2.2, 0.04), mat('#5a4530', { roughness: 0.8 }), x, 1.1, -2.95, false));
      g.add(mesh(box(9, 0.12, 0.08), mat('#2a1e14'), 0, 2.26, -2.93, false));
      // jury rail
      g.add(mesh(box(3.8, 0.08, 0.12), mat('#5a4530', { roughness: 0.6 }), 0, SEAT + 0.3, 0.65)); for (const x of [-1.8, -0.6, 0.6, 1.8]) g.add(mesh(box(0.08, SEAT + 0.28, 0.08), mat('#5a4530'), x, (SEAT + 0.28) / 2, 0.65));
      g.add(mesh(box(0.8, 1.6, 0.06), mat('#c0b090', { roughness: 0.9 }), -3.8, 1.5, -2.5, false)); g.add(mesh(cyl(0.02, 0.02, 2.4, 8), mat('#d4b060', { metalness: 0.7, roughness: 0.3 }), -4.2, 1.2, -2.4, false));
      prop(g, 'coatRackStanding', 3.8, -2.4, { s: 1.6 });
      seatsFor(g, p, 'benchCushion', { s: 1.0 });
      return { bg: '#120d08', sky: '#8a7a60', ground: '#3a2a1a', amb: 0.16 };
    },
  },
};
