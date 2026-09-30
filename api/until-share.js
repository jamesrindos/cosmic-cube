// GET /sands/<key> (rewritten here; old /until links redirect there)  ->  a tiny page whose link-preview tags describe that one
// countdown right now. Link previewers (iMessage, WhatsApp, X, Slack) read the tags; people are
// sent straight on to the countdown in the app.
import { resolve, status, landsText, SITE, APP_PATH } from './_until/lib.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function handler(req, res) {
  const key = String((req.query && req.query.k) || '');
  const cd = resolve(key);
  if (!cd) { res.statusCode = 302; res.setHeader('Location', APP_PATH); return res.end(); }
  const st = status(cd);
  const url = SITE + APP_PATH + encodeURIComponent(key);
  const hour = Math.floor(Date.now() / 36e5);
  const img = `${SITE}/api/until-og?k=${encodeURIComponent(key)}&t=${hour}`;
  const vid = `${SITE}/api/until-video?k=${encodeURIComponent(key)}&t=${hour}`;
  const title = st.done ? `${cd.short} is here` : cd.tba ? `Waiting on ${cd.short}` : `${cd.short}: ${st.label}`;
  const desc = cd.tba ? 'Date TBA. Watch the glass on Sands.'
    : st.done ? `The sand ran out. ${landsText(cd)}.`
    : `Sand left ${(st.f * 100).toFixed(1)}%. Lands ${landsText(cd)}.`;
  const app = APP_PATH + '#' + key;
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · sands.</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="${APP_PATH}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${APP_PATH}apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sands">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(cd.short)} glass, ${esc(st.label.toLowerCase())}">
<meta property="og:video" content="${esc(vid)}">
<meta property="og:video:secure_url" content="${esc(vid)}">
<meta property="og:video:type" content="video/mp4">
<meta property="og:video:width" content="540">
<meta property="og:video:height" content="640">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script>location.replace(${JSON.stringify(app)})</script>
</head><body style="font-family:system-ui,sans-serif;padding:24px"><a href="${esc(app)}">Open the ${esc(cd.short)} countdown</a></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
  res.end(html);
}
