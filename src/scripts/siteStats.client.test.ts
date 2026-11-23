// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { formatStats, renderSiteStats } from './siteStats.client';

test('formats counts with separators and the starting month', () => {
  expect(formatStats({ views: 12340, visits: 3100, since: '2026-11-22' })).toBe(
    '12,340 page views · 3,100 visits since Nov 2026',
  );
});

test('uses singular words for one', () => {
  expect(formatStats({ views: 1, visits: 1, since: null })).toBe('1 page view · 1 visit');
});

test('hides on missing, zero, or malformed data', () => {
  expect(formatStats(null)).toBeNull();
  expect(formatStats({ views: 0, visits: 0, since: null })).toBeNull();
  expect(formatStats({ views: '12', visits: 3 })).toBeNull();
  expect(formatStats({ views: -5, visits: 3 })).toBeNull();
});

function footerLine(): HTMLElement {
  const el = document.createElement('p');
  el.hidden = true;
  el.innerHTML = '<span data-site-stats-text></span>';
  return el;
}

test('shows the line once the stats file loads', async () => {
  const el = footerLine();
  await renderSiteStats(el, async () => ({ views: 10, visits: 4, since: '2026-11-22' }));
  expect(el.hidden).toBe(false);
  expect(el.textContent).toBe('10 page views · 4 visits since Nov 2026');
});

test('stays hidden when the stats file is missing', async () => {
  const el = footerLine();
  await renderSiteStats(el, async () => {
    throw new Error('404');
  });
  expect(el.hidden).toBe(true);
});
