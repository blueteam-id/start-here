// Pure logic for scripts/visit-stats.mjs: turn web server access log lines
// into daily page-view and visit counts. No I/O here, so it can be tested.
//
// Privacy rules this file follows:
// - It reads the server's existing access log; nothing new is collected.
// - A "visit" is one browser (address + user agent) on one day. The pair is
//   hashed in memory only to count distinct values and is never stored.
// - Only per-day totals leave this file.

import { createHash } from 'node:crypto';

// nginx/Apache "combined" format:
// 203.0.113.9 - - [23/Nov/2026:10:00:00 +0700] "GET /tracks/ HTTP/1.1" 200 5120 "-" "Mozilla/5.0 ..."
const COMBINED =
  /^(\S+) \S+ \S+ \[(\d{2})\/(\w{3})\/(\d{4}):[^\]]*\] "(\S+) (\S+)[^"]*" (\d{3}) \S+ "[^"]*" "([^"]*)"/;

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

const BOT_UA =
  /bot|crawl|spider|slurp|scrape|curl|wget|python|httpx|go-http|java\/|okhttp|libwww|headless|lighthouse|monitor|uptime|pingdom|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|axios|node-fetch/i;

/** Parses one combined-format log line, or returns null if it is not one. */
export function parseLine(line) {
  const m = COMBINED.exec(line);
  if (!m) return null;
  const [, ip, dd, mon, yyyy, method, target, status, ua] = m;
  const month = MONTHS[mon];
  if (!month) return null;
  return { ip, day: `${yyyy}-${month}-${dd}`, method, path: target.split('?')[0], status: Number(status), ua };
}

export function isBot(ua) {
  return !ua || ua === '-' || BOT_UA.test(ua);
}

/** A successful request for an HTML page (not an asset, search file, or the stats file). */
export function isPageView(req) {
  if (req.method !== 'GET' || (req.status !== 200 && req.status !== 304)) return false;
  if (req.path.startsWith('/_astro/') || req.path.startsWith('/pagefind/')) return false;
  return req.path.endsWith('/') || req.path.endsWith('.html');
}

/** Counts page views and visits per day from raw log lines. */
export function countDays(lines) {
  const days = new Map();
  for (const line of lines) {
    const req = parseLine(line);
    if (!req || isBot(req.ua) || !isPageView(req)) continue;
    let day = days.get(req.day);
    if (!day) {
      day = { views: 0, visitors: new Set() };
      days.set(req.day, day);
    }
    day.views += 1;
    day.visitors.add(createHash('sha256').update(`${req.day}|${req.ip}|${req.ua}`).digest('hex'));
  }
  const result = {};
  for (const [key, value] of days) result[key] = { views: value.views, visits: value.visitors.size };
  return result;
}

/**
 * Merges this run's counts into the saved per-day totals. Old days that
 * rotated out of the logs keep their saved totals. For a day present in both,
 * the larger count wins: a day's log only ever grows, so a smaller number
 * means part of that day already rotated away.
 */
export function mergeDays(saved, fresh) {
  const merged = { ...saved };
  for (const [day, counts] of Object.entries(fresh)) {
    const old = merged[day] ?? { views: 0, visits: 0 };
    merged[day] = { views: Math.max(old.views, counts.views), visits: Math.max(old.visits, counts.visits) };
  }
  return merged;
}

/** The small public file the footer reads. */
export function summarize(days, now = new Date()) {
  const keys = Object.keys(days).sort();
  let views = 0;
  let visits = 0;
  for (const key of keys) {
    views += days[key].views;
    visits += days[key].visits;
  }
  return { views, visits, since: keys[0] ?? null, updated: now.toISOString() };
}
