// GET /api/sands-feed  ->  the library as JSON, for the iPhone app and its widgets.
// Times are milliseconds since 1970 (UTC). Date-only events count down to midnight US Eastern.
import { EVENTS } from './_until/events.js';

export default function handler(req, res) {
  const now = Date.now();
  const events = Object.entries(EVENTS)
    .map(([key, e]) => ({ key, short: e[0], title: e[1], category: e[2], target: e[3], allDay: !!e[4], start: e[5], sand: e[6].split(','), metal: e[7], tagline: e[8] || '', hype: e[9] || 40 }))
    .filter(e => e.target > now - 2 * 864e5)
    .sort((a, b) => b.hype - a.hype || a.target - b.target);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
  res.end(JSON.stringify({ updated: new Date(now).toISOString(), events }));
}
