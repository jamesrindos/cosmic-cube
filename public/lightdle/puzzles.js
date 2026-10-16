// Lightdle puzzles.
// Conventions (all relative to the camera's point of view):
//   az  : azimuth in degrees. 0 = at the camera, +90 = camera-LEFT of subject, -90 = camera-RIGHT, ±180 = directly behind.
//   el  : elevation in degrees above the subject's eyeline. Negative = underlight.
//   d   : distance from the subject's head in metres.
//   p   : output 0–100.
//   k   : colour temperature in Kelvin.
//   fx  : fixture — fresnel | open | bulb | tube | softbox | booklight
//   gel : none | cto | ctb | magenta | cyan | red | green | amber
//   t   : target subject index, -1 = the whole group.
// Subject yaw: degrees the subject has turned their head. + = turned toward camera-left.

export const FIXTURES = {
  fresnel:   { label: 'Fresnel',     desc: 'Hard, focused, crisp shadows',     soft: 0.0,  angle: 0.46, pen: 0.3,  blur: 1,  eff: 1.0 },
  open:      { label: 'Open face',   desc: 'Hard, wide, a little raw',         soft: 0.15, angle: 0.85, pen: 0.4,  blur: 2,  eff: 1.0 },
  bulb:      { label: 'Bare bulb',   desc: 'Practical. Hard, spills everywhere', soft: 0.1, angle: 1.3, pen: 0.5,  blur: 2,  eff: 0.9 },
  tube:      { label: 'LED tube',    desc: 'Soft-ish edge, slim source',       soft: 0.6,  angle: 1.0,  pen: 0.8,  blur: 6,  eff: 0.85 },
  softbox:   { label: 'Softbox',     desc: 'Soft, wrapping, flattering',       soft: 0.8,  angle: 1.0,  pen: 0.7,  blur: 8,  eff: 0.8 },
  booklight: { label: 'Book light',  desc: 'Very soft, bounced then diffused', soft: 1.0,  angle: 1.2,  pen: 0.8,  blur: 12, eff: 0.6 },
};

export const GELS = {
  none:    { label: 'No gel',   rgb: [1, 1, 1] },
  cto:     { label: 'CTO',      rgb: [1.0, 0.72, 0.42] },
  ctb:     { label: 'CTB',      rgb: [0.55, 0.72, 1.0] },
  amber:   { label: 'Amber',    rgb: [1.0, 0.6, 0.18] },
  red:     { label: 'Red',      rgb: [1.0, 0.18, 0.12] },
  magenta: { label: 'Magenta',  rgb: [1.0, 0.2, 0.75] },
  cyan:    { label: 'Cyan',     rgb: [0.15, 0.85, 1.0] },
  green:   { label: 'Green',    rgb: [0.3, 1.0, 0.35] },
};

const L = (az, el, d, p, k, fx = 'softbox', opts = {}) => ({ on: true, az, el, d, p, k, fx, gel: 'none', t: -1, ...opts });

export const PUZZLES = [
  {
    id: 'doc-interview',
    title: 'The Documentary Interview',
    shot: 'single',
    subjects: [{ x: 0, yaw: 22, skin: '#c99a7a', hair: '#2a1d16', shirt: '#2f3a4a' }],
    set: { wall: '#3a3f47', floor: '#2a2b2e' },
    lights: 3,
    brief: {
      expert: 'A seated interview for a prestige streaming documentary. The subject is talking to an off-camera producer sitting just camera-left. Honest, natural, daylight-motivated. It should look like a window did most of the work.',
      medium: 'Short-side key: she\'s turned to camera-left, so the key comes from camera-right and lights the side of her face that\'s turned away from us. Big and soft, daylight. About 3:1 — shape, not drama. A little hair light from behind so she separates from the wall.',
    },
    lesson: 'Short-side lighting means the key hits the side of the face turned away from camera. The shadow side faces us, which makes the face look slimmer and more dimensional. Broad-side lighting (key on the side facing camera) is flatter and reads as "corporate". A 3:1 key-to-fill ratio is the sweet spot for interviews: enough contrast to see the nose and cheekbone, not enough to feel like a thriller.',
    solution: [
      L(-45, 30, 2.2, 70, 5600, 'softbox'),
      L(55, 12, 3.2, 28, 5600, 'booklight'),
      L(150, 45, 2.8, 45, 5600, 'fresnel'),
    ],
  },
  {
    id: 'interrogation',
    title: 'Interrogation Room',
    shot: 'single',
    subjects: [{ x: 0, yaw: 0, skin: '#d9b494', hair: '#1a1410', shirt: '#dcdcd4' }],
    set: { wall: '#23262a', floor: '#1a1b1d' },
    lights: 2,
    brief: {
      expert: 'Film noir, 1947. A suspect sweats under the lamp in a windowless room at 2 a.m. The detective hasn\'t said a word in four minutes. Only one thing in this room is switched on.',
      medium: 'One hard source, high and nearly straight down — the hanging bulb is the only motivation. No fill at all; I want the eye sockets to go black. Tungsten. If you use a second light, I shouldn\'t be able to tell.',
    },
    lesson: 'Top light is one of the most unflattering angles there is, which is exactly why noir and horror use it: brows shadow the eyes, the nose casts straight down, the cheekbones hollow out. With no fill the ratio runs past 16:1 and the shadows go to pure black. Direction, not just contrast, is what makes it feel oppressive.',
    solution: [
      L(15, 72, 1.7, 85, 3000, 'open'),
    ],
  },
  {
    id: 'morning-show',
    title: 'Morning Show Two-Shot',
    shot: 'two',
    subjects: [
      { x: -0.72, yaw: -14, skin: '#8d5a3b', hair: '#140e0a', shirt: '#b84a5a' },
      { x: 0.72, yaw: 14, skin: '#e6c1a3', hair: '#5a3b24', shirt: '#4a6fb8' },
    ],
    set: { wall: '#2a3d6b', floor: '#30343c', props: ['desk'] },
    lights: 3,
    brief: {
      expert: 'Live morning television. Two hosts at the desk, 7:05 a.m., a segment about air fryers. It needs to be bright, friendly and flawless. Nobody on this show has ever had a shadow on their face.',
      medium: 'Broadcast flat. Two big soft sources crossing from either side so both hosts are evenly clean — keep the ratio under 2:1. A hot backlight from straight behind so they pop off the blue. Warm-neutral white around 4300K; nobody looks sick, nobody looks orange.',
    },
    lesson: 'Broadcast lighting is engineered so talent can turn to any camera and look the same. Two soft keys crossing at roughly equal power give a ratio close to 1.5:1 — almost no modelling, which is the point. The backlight does the work of creating depth instead. Note the "coverage" score: in a two-shot the lights have to cover both people, so aim them at the group, not at one host.',
    solution: [
      L(-40, 28, 2.8, 78, 4300, 'softbox'),
      L(40, 28, 2.8, 70, 4300, 'softbox'),
      L(180, 50, 3.2, 55, 4300, 'fresnel'),
    ],
  },
  {
    id: 'basement',
    title: 'The Basement',
    shot: 'three',
    subjects: [
      { x: -1.05, yaw: 18, skin: '#e8c2a4', hair: '#7a4b2a', shirt: '#3b3b3b' },
      { x: 0, yaw: 0, skin: '#c99a7a', hair: '#1c1613', shirt: '#5a4a3a' },
      { x: 1.05, yaw: -18, skin: '#7a4a30', hair: '#0f0b09', shirt: '#2a4a3a' },
    ],
    set: { wall: '#1d1f1c', floor: '#141514' },
    lights: 2,
    brief: {
      expert: 'Three friends have just heard the basement door lock behind them. One bare bulb on a chain above them. Something, somewhere, is dripping.',
      medium: 'A single bare bulb overhead — warm, hard, unflattering, aimed at the whole group so it spills on everyone. Let the eyes go dark. Whatever else you add should be cold and barely there: moonlight leaking in from behind, camera-right, two or three stops under.',
    },
    lesson: 'Horror borrows the noir top light and adds colour contrast: a warm practical overhead against a cold, faint source from behind. The eye goes to the warm light, and the cold edge tells you there\'s an outside you can\'t get to. In a three-shot, a bare bulb with a wide spill is the only way one light covers everyone — a focused fresnel would leave two of them in the dark.',
    solution: [
      L(5, 78, 1.9, 65, 2900, 'bulb'),
      L(-135, 25, 4.0, 18, 7500, 'fresnel'),
    ],
  },
  {
    id: 'rembrandt',
    title: 'The Old Master',
    shot: 'single',
    subjects: [{ x: 0, yaw: -14, skin: '#d4a789', hair: '#4a3222', shirt: '#2a1f1a' }],
    set: { wall: '#2b2219', floor: '#1e1812' },
    lights: 2,
    brief: {
      expert: 'A painter\'s studio in Amsterdam, 1640. North light through one high window. Paint the face with shadow, not with light.',
      medium: 'Rembrandt lighting: key high and about 45° to camera-left so the nose shadow meets the cheek shadow and leaves a small triangle of light under the far eye. Around 6:1 with only a whisper of fill. Warm. No backlight — this is a painting, not a music video.',
    },
    lesson: 'Rembrandt lighting is defined by the triangle of light on the shadow-side cheek, formed when the nose shadow connects with the cheek shadow. It needs the key around 45° off-axis and 45° up — lower and the triangle opens into loop lighting, higher and the eye loses its catchlight. The 6:1 ratio keeps the shadow side readable but clearly subordinate.',
    solution: [
      L(48, 44, 1.9, 80, 3200, 'softbox'),
      L(-40, 10, 3.6, 14, 3200, 'booklight'),
    ],
  },
  {
    id: 'late-night',
    title: 'Late Night Desk',
    shot: 'single',
    subjects: [{ x: 0, yaw: 6, skin: '#e2b995', hair: '#2b2420', shirt: '#1f1f28' }],
    set: { wall: '#1a2440', floor: '#26272c' },
    lights: 3,
    brief: {
      expert: 'Late-night talk show, the monologue. The host hits his mark in a suit with a city skyline behind him. Glossy, network, expensive. A thousand people have lit this exact spot before you.',
      medium: 'Network glam. Soft key slightly camera-right and high, generous soft fill from the other side, around 2.5:1. A strong hair light from behind so he pops off the skyline. 4000K — warm enough to flatter, cool enough to look modern.',
    },
    lesson: 'Talk-show lighting is three-point lighting at its most literal. The hair light is often as bright as the key — on a dark skyline set it\'s what makes the host look three-dimensional. Keeping the ratio around 2.5:1 flatters a face that will be on screen for an hour without making it flat.',
    solution: [
      L(-32, 36, 2.3, 80, 4000, 'softbox'),
      L(42, 18, 3.0, 42, 4000, 'softbox'),
      L(165, 50, 2.6, 70, 4000, 'fresnel'),
    ],
  },
  {
    id: 'replicant',
    title: 'Replicant',
    shot: 'single',
    subjects: [{ x: 0, yaw: 0, skin: '#e9c7ad', hair: '#d8c9b0', shirt: '#2a2a2a' }],
    set: { wall: '#191b1f', floor: '#131416' },
    lights: 2,
    brief: {
      expert: '2049. An interrogation that pretends it isn\'t one. Orange haze on one side of the room, a cold wall of blue on the other. Nobody blinks.',
      medium: 'Split the face. Hard amber key dead side-on from camera-left, nothing filling the other side. A cold blue rim from behind camera-right so the edge of the face glows. Ratio well past 8:1.',
    },
    lesson: 'Colour contrast does the work that fill would normally do: the blue rim gives the shadow side an edge so the face doesn\'t vanish, without lifting the shadows. Keeping both sources hard makes the split razor-sharp. The complementary pair — orange around 2200K against a 9000K-plus blue — is the most reliable two-colour scheme in cinema.',
    solution: [
      L(88, 18, 2.4, 72, 2200, 'fresnel'),
      L(-148, 32, 2.0, 62, 9000, 'tube'),
    ],
  },
  {
    id: 'candlelight',
    title: 'Candlelight',
    shot: 'two',
    subjects: [
      { x: -0.62, yaw: -32, skin: '#d9b494', hair: '#3a2a1e', shirt: '#4a3a2a' },
      { x: 0.62, yaw: 32, skin: '#9a6a48', hair: '#0f0b09', shirt: '#2f2a2a' },
    ],
    set: { wall: '#1a1612', floor: '#15110e', props: ['table'] },
    lights: 2,
    brief: {
      expert: 'Barry Lyndon, but you only get two lights. Two people at a dinner table, lit by the candles between them. Nothing else in the house is on.',
      medium: 'Underexpose it. One very warm source low on the table between them — it\'s candles, so it comes from below the chin, aimed at both of them. Hard-ish but not harsh. Almost no fill. No rim; there\'s nothing behind them to motivate one.',
    },
    lesson: 'Motivated lighting means every source has an excuse in the frame. Candles are below face height, so the shadows go up — a look that\'s only acceptable because the warmth and low exposure sell it. Overlighting is the most common mistake here: a candlelit scene should sit a stop or two under a normal interview.',
    solution: [
      L(0, -14, 1.2, 36, 2000, 'bulb'),
      L(35, 30, 4.2, 9, 3200, 'booklight'),
    ],
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour',
    shot: 'single',
    subjects: [{ x: 0, yaw: -8, skin: '#c48a6a', hair: '#1f1612', shirt: '#e8dcc0' }],
    set: { wall: '#4a5a3a', floor: '#4e4a32' },
    lights: 2,
    brief: {
      expert: 'Exterior, a field, twenty minutes before sunset. She talks to camera. We can\'t move the sun — we can only move her and the bounce board.',
      medium: 'Put the sun behind her, camera-left, low and hot, as a warm edge. Bring her face up with a big soft bounce from the front, slightly camera-right. The rim should be brighter than the face. Skin stays natural, not orange — the bounce is cooler than the sun.',
    },
    lesson: 'Backlit golden hour is the standard for flattering exterior interviews: the sun becomes a rim, and a big bounce from the front becomes the key. Because the bounce is soft and frontal the ratio stays gentle, and because the sun is so much hotter the edge glows. Many first attempts put the sun on her face instead — squinting, hard, and orange.',
    solution: [
      L(150, 24, 4.0, 95, 2800, 'fresnel'),
      L(-22, 10, 2.4, 48, 4800, 'booklight'),
    ],
  },
  {
    id: 'headshot',
    title: 'The Headshot',
    shot: 'single',
    subjects: [{ x: 0, yaw: 0, skin: '#8d5a3b', hair: '#0f0b09', shirt: '#dcdcd4' }],
    set: { wall: '#5a5e66', floor: '#3a3c40' },
    lights: 3,
    brief: {
      expert: 'Corporate headshot, LinkedIn-grade. Clean, symmetrical, flattering. She\'s a VP and the photo will be on the website for six years.',
      medium: 'Butterfly / clamshell: key straight on and high so the shadow sits directly under the nose, a soft fill straight on from below to open it up. Around 2:1. Hair light from behind for separation. Neutral daylight, around 5200K.',
    },
    lesson: 'Butterfly (or "paramount") lighting puts the key on the camera axis and above, giving a symmetrical butterfly-shaped shadow under the nose. The clamshell variant adds a soft fill from below on the same axis, which erases under-eye shadows — it\'s the beauty and headshot standard. Symmetry is the whole point: any sideways offset turns it into loop lighting.',
    solution: [
      L(0, 45, 1.8, 75, 5200, 'softbox'),
      L(0, -28, 1.5, 32, 5200, 'booklight'),
      L(-160, 48, 2.5, 40, 5200, 'fresnel'),
    ],
  },
  {
    id: 'lineup',
    title: 'The Lineup',
    shot: 'single',
    subjects: [{ x: 0, yaw: 0, skin: '#e2b995', hair: '#2b2420', shirt: '#4a4a4a' }],
    set: { wall: '#3a3a3a', floor: '#222222', props: ['chart'] },
    lights: 1,
    brief: {
      expert: 'A two-way mirror. A man stands against the height chart. Half of his face, and half of his story.',
      medium: 'Split lighting: one hard source at 90° to camera-right, right at eye level. One half of the face lit, one half black. Nothing else.',
    },
    lesson: 'Split lighting divides the face down the centre line — one source exactly side-on, at eye level. Any elevation starts to bleed light across the nose onto the far side, so keep it low. It\'s a go-to for "duality" shots for the obvious reason, and it only really works with a hard source.',
    solution: [
      L(-90, 8, 2.4, 80, 4500, 'fresnel'),
    ],
  },
  {
    id: 'music-video',
    title: 'Music Video',
    shot: 'single',
    subjects: [{ x: 0, yaw: 10, skin: '#7a4a30', hair: '#0f0b09', shirt: '#111111' }],
    set: { wall: '#101012', floor: '#0c0c0e' },
    lights: 2,
    brief: {
      expert: 'Rapper, warehouse, 2 a.m. Pink and teal. The budget is two lights and a fog machine.',
      medium: 'Hard magenta key from camera-right, hard cyan backlight from behind camera-left. No white light anywhere, no fill, let it crush. Contrast all the way up.',
    },
    lesson: 'The pink/teal (or magenta/cyan) two-light look is pure colour contrast: complementary hues on opposite sides, no fill, so the face is carved in two colours and everything else goes black. Gels replace temperature as the colour tool here — kelvin only moves you along the orange–blue line, gels can go anywhere.',
    solution: [
      L(-60, 30, 2.2, 80, 5000, 'fresnel', { gel: 'magenta' }),
      L(140, 35, 2.2, 80, 5000, 'fresnel', { gel: 'cyan' }),
    ],
  },
  {
    id: 'the-bar',
    title: 'The Bar',
    shot: 'two',
    subjects: [
      { x: -0.68, yaw: -22, skin: '#e8c2a4', hair: '#8a5a30', shirt: '#2a2a3a' },
      { x: 0.68, yaw: 20, skin: '#c48a6a', hair: '#1f1612', shirt: '#5a2a2a' },
    ],
    set: { wall: '#1f1a18', floor: '#17130f', props: ['table'] },
    lights: 3,
    brief: {
      expert: 'Two people at a bar after midnight, in a film critics will call "quietly devastating". Neon outside the window. Lamps inside.',
      medium: 'Mixed colour. Warm tungsten key motivated by the bar lamps, from camera-left and above, covering both of them. A cooler blue fill from the window on the other side — keep it about two stops under the key. A warm edge light from behind.',
    },
    lesson: 'Mixed colour temperature is how a scene feels like a real place: tungsten practicals inside, something cooler leaking in from outside. The trick is the ratio — the cool fill must stay well under the key or the scene turns muddy and grey. Warm against cool, warm winning.',
    solution: [
      L(52, 32, 2.2, 60, 2700, 'open'),
      L(-70, 18, 3.8, 20, 6500, 'softbox'),
      L(172, 42, 3.0, 38, 2700, 'fresnel'),
    ],
  },
  {
    id: 'streamer',
    title: 'The Streamer',
    shot: 'single',
    subjects: [{ x: 0, yaw: -4, skin: '#d4a789', hair: '#3a2a1e', shirt: '#1e2a24' }],
    set: { wall: '#262a33', floor: '#1e1f24' },
    lights: 3,
    brief: {
      expert: 'A YouTuber\'s bedroom setup for a forty-minute video essay. It needs to look like money without looking lit.',
      medium: 'Classic creator setup: soft key at about 30° camera-left, close and a little high. Soft fill from the other side, roughly 2.5:1. A slightly cool rim from behind camera-right off a tube light. Daylight balance to match the monitor glow.',
    },
    lesson: 'The creator look is three-point lighting with everything soft and close: a big source near the face wraps around it and keeps the ratio gentle. The cool-ish rim is a modern tell — a tube light behind the shoulder, a few hundred kelvin cooler than the key, reads as "expensive" without reading as "lit".',
    solution: [
      L(32, 26, 1.5, 68, 5600, 'softbox'),
      L(-50, 10, 2.6, 30, 5600, 'tube'),
      L(-150, 40, 2.0, 40, 7500, 'tube'),
    ],
  },
  {
    id: 'villain',
    title: 'The Villain',
    shot: 'single',
    subjects: [{ x: 0, yaw: 0, skin: '#e6c1a3', hair: '#1a1410', shirt: '#1a1a1a' }],
    set: { wall: '#15171a', floor: '#111214' },
    lights: 2,
    brief: {
      expert: 'The campfire story. The reveal that the nice neighbour was the villain the whole time. Flashlight-under-the-chin energy, but shot like a film.',
      medium: 'Light from below: a hard key under the face, slightly camera-right, so every shadow flips upward. No fill. A cold, high backlight from behind so the hair edges out of the black.',
    },
    lesson: 'We almost never see faces lit from below in nature — the sun is up, lamps are up — so underlighting reads as wrong on an instinctive level. Shadows go up the nose and brow, the eye sockets light from beneath. The cold backlight keeps it from being a joke: separation makes it feel deliberate instead of cheap.',
    solution: [
      L(-20, -36, 1.6, 70, 3800, 'open'),
      L(160, 52, 2.5, 50, 7000, 'fresnel'),
    ],
  },
  {
    id: 'verdict',
    title: 'The Verdict',
    shot: 'three',
    subjects: [
      { x: -1.05, yaw: 6, skin: '#9a6a48', hair: '#1c1613', shirt: '#2a3a4a' },
      { x: 0, yaw: 0, skin: '#e8c2a4', hair: '#8a8a88', shirt: '#3a3a3a' },
      { x: 1.05, yaw: -6, skin: '#c99a7a', hair: '#4a3222', shirt: '#4a3a3a' },
    ],
    set: { wall: '#3b2f24', floor: '#2a221a' },
    lights: 3,
    brief: {
      expert: 'Courtroom drama. The three jurors in the front row hear the verdict read. Everyone in this frame matters exactly as much as everyone else.',
      medium: 'Even coverage across all three — nobody drops out. One big soft source high and frontal aimed at the group, a soft fill from camera-right to keep it near 2:1, a subtle backlight. Neutral white around 4500K. Dignified, not flashy.',
    },
    lesson: 'Group shots are a coverage problem before they\'re a style problem. Big soft sources high and frontal are the only way to light three faces evenly with one light; aim at the group, not at anyone in particular. The ratio is kept low on purpose — this is about the ensemble, so nobody gets the dramatic key.',
    solution: [
      L(8, 62, 2.6, 78, 4500, 'softbox'),
      L(-35, 16, 3.6, 40, 4500, 'booklight'),
      L(180, 48, 3.2, 36, 4500, 'fresnel'),
    ],
  },
];

export const EPOCH = '2026-10-16'; // Lightdle #1
