// src/content/config.ts
import { defineCollection, z } from 'astro:content';

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

const tracks = defineCollection({
  type: 'content',
  schema: trackSchema,
});

const lessons = defineCollection({
  type: 'content',
  schema: lessonSchema,
});

export const collections = { tracks, lessons };
