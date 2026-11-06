// src/lib/collections.ts
//
// Single place that reads the tracks and lessons collections for routing.
//
// With glob loaders, content entries only carry `id` (no `slug`). The glob
// loader's default `id` is the slugified path, e.g. `computing-basics` for a
// track and `computing-basics/01-what-is-a-computer` for a lesson, which is
// exactly the shape the views and URLs use. These helpers expose that id as
// `slug` so views can keep a stable, typed `slug` field.
import { getCollection, type CollectionEntry } from 'astro:content';

export type WithSlug<T extends { id: string }> = T & { slug: string };

export type TrackEntry = WithSlug<CollectionEntry<'tracks'>>;
export type LessonEntry = WithSlug<CollectionEntry<'lessons'>>;

function withSlug<T extends { id: string }>(entry: T): WithSlug<T> {
  return { ...entry, slug: entry.id };
}

export async function getTracks(): Promise<TrackEntry[]> {
  return (await getCollection('tracks')).map(withSlug);
}

export async function getLessons(): Promise<LessonEntry[]> {
  return (await getCollection('lessons')).map(withSlug);
}
