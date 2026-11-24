import { expect, test } from 'vitest';
import { ANYTIME_LANE, ROADMAP, TRACK_WHY, roadmapSlugs } from './roadmap';
import { CATALOG_TRACKS } from './catalog';

test('every live track appears on the roadmap exactly once', () => {
  const live = CATALOG_TRACKS.filter((t) => t.status === 'live').map((t) => t.slug).sort();
  const onMap = roadmapSlugs();
  expect(new Set(onMap).size).toBe(onMap.length);
  expect([...onMap].sort()).toEqual(live);
});

test('the roadmap starts with Computing Basics and ends with Servers & Services', () => {
  expect(ROADMAP[0].slugs).toEqual(['computing-basics']);
  expect(ROADMAP[ROADMAP.length - 1].slugs).toEqual(['servers-and-services']);
});

test('single-track stages hold one track, and multi-track stages more than one', () => {
  for (const stage of [...ROADMAP, ANYTIME_LANE]) {
    if (stage.order === 'one') expect(stage.slugs, stage.title).toHaveLength(1);
    else expect(stage.slugs.length, stage.title).toBeGreaterThan(1);
  }
});

test('every roadmap track has a "why" line for the Start here page', () => {
  for (const slug of roadmapSlugs()) expect(TRACK_WHY[slug], slug).toBeTruthy();
  expect(Object.keys(TRACK_WHY).sort()).toEqual([...roadmapSlugs()].sort());
});
