// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const trackSchema = z.object({
  title: z.string(),
  category: z.string(),
  order: z.number(),
  status: z.enum(['live', 'coming-soon']),
  summary: z.string(),
  estimatedMinutes: z.number(),
  lessonCount: z.number(),
  author: z.string(),
  reviewer: z.string(),
  updatedAt: z.date(),
  icon: z.string(),
  version: z.string(),
});

export const lessonSchema = z.object({
  title: z.string(),
  track: z.string(),
  phase: z.string(),
  order: z.number(),
  prerequisites: z.string().optional(),
  needsVM: z.boolean().default(false),
  estimatedMinutes: z.number(),
  reflectQuestions: z.array(z.string()).default([]),
  resources: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
});

// Explicit glob loaders (rather than the legacy `type: 'content'` shorthand).
// Under this Astro version's legacy backwards-compat mode, `type: 'content'`
// produces entry ids that keep the file extension and `/index` segment
// (e.g. `computing-basics/index.md`) and no `slug` property at all. The
// default glob loader id is the slugified path instead (`computing-basics`,
// `computing-basics/01-what-is-a-computer`), which is what the routes use.
const tracks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tracks' }),
  schema: trackSchema,
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: lessonSchema,
});

export const collections = { tracks, lessons };
