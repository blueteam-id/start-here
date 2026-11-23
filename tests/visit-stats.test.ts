import { expect, test } from 'vitest';
// @ts-expect-error plain .mjs module without type declarations
import { countDays, isBot, isPageView, mergeDays, parseLine, summarize } from '../scripts/visit-stats-lib.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150.0 Safari/537.36';
const line = (ip: string, day: string, path: string, status = 200, ua = UA, method = 'GET') =>
  `${ip} - - [${day}/Nov/2026:10:00:00 +0700] "${method} ${path} HTTP/1.1" ${status} 5120 "-" "${ua}"`;

test('parses a combined-format line', () => {
  expect(parseLine(line('203.0.113.9', '23', '/tracks/?q=x'))).toEqual({
    ip: '203.0.113.9',
    day: '2026-11-23',
    method: 'GET',
    path: '/tracks/',
    status: 200,
    ua: UA,
  });
  expect(parseLine('not a log line')).toBeNull();
});

test('only successful HTML page requests count as page views', () => {
  const req = (path: string, status = 200, method = 'GET') => ({ path, status, method });
  expect(isPageView(req('/'))).toBe(true);
  expect(isPageView(req('/tracks/linux-essentials/'))).toBe(true);
  expect(isPageView(req('/tracks/', 304))).toBe(true);
  expect(isPageView(req('/missing/', 404))).toBe(false);
  expect(isPageView(req('/_astro/index.css'))).toBe(false);
  expect(isPageView(req('/pagefind/pagefind-ui.js'))).toBe(false);
  expect(isPageView(req('/stats.json'))).toBe(false);
  expect(isPageView(req('/favicon.svg'))).toBe(false);
  expect(isPageView(req('/', 200, 'HEAD'))).toBe(false);
});

test('bots and empty user agents are skipped', () => {
  expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
  expect(isBot('curl/8.7.1')).toBe(true);
  expect(isBot('-')).toBe(true);
  expect(isBot(UA)).toBe(false);
});

test('counts page views and one visit per browser per day', () => {
  const days = countDays([
    line('203.0.113.9', '23', '/'),
    line('203.0.113.9', '23', '/tracks/'),
    line('198.51.100.7', '23', '/'),
    line('203.0.113.9', '24', '/'),
    line('203.0.113.9', '24', '/_astro/x.js'),
    line('192.0.2.1', '24', '/', 200, 'Googlebot/2.1'),
  ]);
  expect(days).toEqual({
    '2026-11-23': { views: 3, visits: 2 },
    '2026-11-24': { views: 1, visits: 1 },
  });
});

test('merging keeps rotated-out days and never lowers a day', () => {
  const saved = { '2026-11-20': { views: 50, visits: 10 }, '2026-11-23': { views: 9, visits: 4 } };
  const fresh = { '2026-11-23': { views: 5, visits: 2 }, '2026-11-24': { views: 3, visits: 1 } };
  expect(mergeDays(saved, fresh)).toEqual({
    '2026-11-20': { views: 50, visits: 10 },
    '2026-11-23': { views: 9, visits: 4 },
    '2026-11-24': { views: 3, visits: 1 },
  });
});

test('the summary adds up all days and keeps no personal data', () => {
  const summary = summarize(
    { '2026-11-24': { views: 3, visits: 1 }, '2026-11-20': { views: 50, visits: 10 } },
    new Date('2026-11-25T00:00:00Z'),
  );
  expect(summary).toEqual({ views: 53, visits: 11, since: '2026-11-20', updated: '2026-11-25T00:00:00.000Z' });
});
