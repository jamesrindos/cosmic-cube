// GET /api/until-video?k=<key>  ->  a short MP4 loop of that hourglass with sand falling at its
// real level right now. Messages plays og:video files inline (muted, autoplay).
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { initWasm, Resvg } from './_until/resvg/index.mjs';
import { resolve, videoBaseSVG, streamGeom, sandColor, glassMaskSVG, VW, VH } from './_until/lib.js';

const require = createRequire(import.meta.url);
const HME = require('./_until/h264/h264-mp4-encoder.node.cjs');
const dir = new URL('./_until/', import.meta.url);
let ready = null;
const init = () => ready ||= readFile(new URL('resvg/index_bg.wasm', dir)).then(initWasm);

const FPS = 24, FRAMES = 72, GRAINS = 34;
// Tiny pseudo-random so every render of the same hourglass looks the same.
const rand = seed => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) ^ Math.imul(seed ^ (seed >>> 13), 3266489909)) >>> 0) / 4294967296;
const blend = (px, i, c, a) => { px[i] += (c[0] - px[i]) * a; px[i + 1] += (c[1] - px[i + 1]) * a; px[i + 2] += (c[2] - px[i + 2]) * a; };

function drawGrain(px, x, y, len, r, col, alpha) {
  // a soft vertical streak: a motion-blurred grain
  for (let yy = Math.floor(y - len - 1); yy <= Math.ceil(y + r + 1); yy++) {
    if (yy < 0 || yy >= VH) continue;
    for (let xx = Math.floor(x - r - 1); xx <= Math.ceil(x + r + 1); xx++) {
      if (xx < 0 || xx >= VW) continue;
      const cy = Math.min(y, Math.max(y - len, yy + 0.5)), d = Math.hypot(xx + 0.5 - x, yy + 0.5 - cy);
      let a = Math.max(0, Math.min(1, r + 0.5 - d)); if (!a) continue;
      a *= alpha * (0.45 + 0.55 * Math.min(1, (yy + 0.5 - (y - len)) / (len + 0.01)));
      blend(px, (yy * VW + xx) * 4, col, a);
    }
  }
}
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export async function renderVideo(cd, glassPng, now = Date.now()) {
  await init();
  const { f, svg } = videoBaseSVG(cd, 'data:image/png;base64,' + glassPng.toString('base64'), now);
  const base = new Resvg(svg, { fitTo: { mode: 'original' } }).render().pixels;
  const mask = new Resvg(glassMaskSVG(), { fitTo: { mode: 'original' } }).render().pixels;
  const g = streamGeom(f), c0 = sandColor(cd.sand), dark = c0.map(v => v * 0.62), white = [255, 255, 255];
  const enc = await HME.createH264MP4Encoder();
  enc.width = VW; enc.height = VH; enc.frameRate = FPS; enc.quantizationParameter = 23; enc.groupOfPictures = 24; enc.initialize();
  const px = new Uint8Array(base.length), rnd = rand([...cd.key].reduce((h, ch) => h * 31 + ch.charCodeAt(0) | 0, 7));
  const grains = Array.from({ length: GRAINS }, () => ({ p: rnd(), dx: (rnd() - 0.5) * 3.2, r: 1.1 + rnd() * 0.8, k: rnd() < 0.5 ? dark : c0 }));
  const sparks = Array.from({ length: 14 }, () => ({ p: rnd(), vx: (rnd() - 0.5) * 26, vy: -6 - rnd() * 10 }));
  for (let fr = 0; fr < FRAMES; fr++) {
    px.set(base);
    const t = fr / FRAMES;
    // glint: one soft highlight sweeping across the glass per loop
    const gt = (t - 0.15) / 0.55;
    if (gt > 0 && gt < 1) {
      const c = -0.25 + 1.5 * ease(gt);
      for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
        const i = (y * VW + x) * 4, m = mask[i]; if (!m) continue;
        const u = x / VW * 0.75 + y / VH * 0.55 - 0.3, d = (u - c) / 0.075, a = Math.exp(-d * d) * 0.34 * (m / 255);
        if (a > 0.004) blend(px, i, white, a);
      }
    }
    if (g) {
      const span = g.y1 - g.y0, cycles = Math.max(3, Math.round(span / 42));
      for (const gr of grains) {
        const u = (gr.p + t * cycles) % 1, y = g.y0 + u * span;
        drawGrain(px, g.x + gr.dx * (0.25 + 0.75 * u), y, 4 + 10 * u, gr.r, gr.k, 0.95);
      }
      for (const s of sparks) {
        const u = (s.p + t * 4) % 1; if (u > 0.35) continue;
        const k = u / 0.35, x = g.x + s.vx * k, y = g.y1 + s.vy * k + 34 * k * k;
        drawGrain(px, x, y, 1, 0.9, dark, 0.8 * (1 - k));
      }
    }
    enc.addFrameRgba(px);
  }
  enc.finalize();
  const out = enc.FS.readFile(enc.outputFilename); enc.delete();
  return Buffer.from(out);
}

export default async function handler(req, res) {
  const cd = resolve(String((req.query && req.query.k) || ''));
  if (!cd) { res.statusCode = 404; return res.end(); }
  try {
    const mp4 = await renderVideo(cd, await readFile(new URL(`glass/${cd.metal}.png`, dir)));
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers && req.headers.range || '');
    if (m) {
      let a = m[1] === '' ? mp4.length - Number(m[2]) : Number(m[1]), b = m[1] !== '' && m[2] !== '' ? Number(m[2]) : mp4.length - 1;
      a = Math.max(0, a); b = Math.min(mp4.length - 1, b);
      if (a > b) { res.statusCode = 416; res.setHeader('Content-Range', `bytes */${mp4.length}`); return res.end(); }
      res.statusCode = 206; res.setHeader('Content-Range', `bytes ${a}-${b}/${mp4.length}`); res.setHeader('Content-Length', String(b - a + 1));
      return res.end(mp4.subarray(a, b + 1));
    }
    res.setHeader('Content-Length', String(mp4.length));
    res.end(mp4);
  } catch (e) {
    console.error('until-video', e);
    res.statusCode = 500; res.end();
  }
}
