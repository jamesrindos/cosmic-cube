// GET /api/until-og?k=<key>  ->  1200x630 PNG preview with the live sand level and time left.
import { readFile } from 'node:fs/promises';
import { initWasm, Resvg } from './_until/resvg/index.mjs';
import { resolve, ogSVG } from './_until/lib.js';

const dir = new URL('./_until/', import.meta.url);
const FONTS = ['BarlowCondensed-SemiBold.ttf', 'JetBrainsMono-Medium.ttf', 'HankenGrotesk-Medium.ttf'];
let ready = null;
function init() {
  return ready ||= (async () => {
    await initWasm(await readFile(new URL('resvg/index_bg.wasm', dir)));
    return Promise.all(FONTS.map(f => readFile(new URL('fonts/' + f, dir))));
  })();
}

export default async function handler(req, res) {
  const cd = resolve(String((req.query && req.query.k) || ''));
  if (!cd) { res.statusCode = 302; res.setHeader('Location', '/sands/og.png'); return res.end(); }
  try {
    const fonts = await init();
    const glass = await readFile(new URL(`glass/${cd.metal}.png`, dir));
    const svg = ogSVG(cd, 'data:image/png;base64,' + glass.toString('base64'));
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { fontBuffers: fonts.map(b => new Uint8Array(b)), loadSystemFonts: false, defaultFontFamily: 'Hanken Grotesk' } }).render().asPng();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
    res.end(Buffer.from(png));
  } catch (e) {
    console.error('until-og', e);
    res.statusCode = 302; res.setHeader('Location', '/sands/og.png'); res.end();
  }
}
