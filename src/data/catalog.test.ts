import { expect, test } from 'vitest';
import { CATALOG_TRACKS, groupByCategory } from './catalog';

test('there are exactly 9 v1 tracks', () => {
  expect(CATALOG_TRACKS).toHaveLength(9);
});

test('exactly two tracks are live, the rest are coming-soon', () => {
  const live = CATALOG_TRACKS.filter((t) => t.status === 'live');
  expect(live.map((t) => t.slug)).toEqual(['computing-basics', 'linux-essentials']);
});

test('groupByCategory preserves the 5-category spec order', () => {
  const groups = groupByCategory(CATALOG_TRACKS);
  expect(groups.map((g) => g.category)).toEqual([
    'Computing Basics',
    'OS & Linux/Windows',
    'Networking & Web',
    'Programming & Data',
    'Security Foundations',
  ]);
});

test('every track slug is unique', () => {
  const slugs = CATALOG_TRACKS.map((t) => t.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});
