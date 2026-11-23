// Keeps src/data/catalog.ts and the content collection from drifting apart.
// Both carry a track's title, summary, time and lesson count; the catalog
// feeds the homepage and catalog cards, the content entry feeds the track
// page. When they disagree, learners see two different stories.
import { expect, test } from 'vitest';
import { getCollection } from 'astro:content';
import { CATALOG_TRACKS } from '../data/catalog';

test('every live catalog track has a content entry, and every content entry is in the catalog', async () => {
  const tracks = await getCollection('tracks');
  const contentSlugs = tracks.map((t) => t.id).sort();
  const liveCatalogSlugs = CATALOG_TRACKS.filter((t) => t.status === 'live').map((t) => t.slug).sort();
  expect(contentSlugs).toEqual(liveCatalogSlugs);
});

test('catalog fields match each track\'s own index.md', async () => {
  const tracks = await getCollection('tracks');
  for (const track of tracks) {
    const entry = CATALOG_TRACKS.find((t) => t.slug === track.id)!;
    const { title, category, status, summary, estimatedMinutes, lessonCount, icon } = track.data;
    expect({ slug: track.id, title, category, status, summary, estimatedMinutes, lessonCount, icon }).toEqual({
      slug: entry.slug,
      title: entry.title,
      category: entry.category,
      status: entry.status,
      summary: entry.summary,
      estimatedMinutes: entry.estimatedMinutes,
      lessonCount: entry.lessonCount,
      icon: entry.icon,
    });
  }
});

test('a track\'s lesson count and total time match its actual lessons', async () => {
  const tracks = await getCollection('tracks');
  const lessons = await getCollection('lessons');
  for (const track of tracks) {
    const own = lessons.filter((l) => l.data.track === track.id);
    const minutes = own.reduce((sum, l) => sum + l.data.estimatedMinutes, 0);
    expect({ slug: track.id, lessons: own.length, minutes }).toEqual({
      slug: track.id,
      lessons: track.data.lessonCount,
      minutes: track.data.estimatedMinutes,
    });
  }
});
