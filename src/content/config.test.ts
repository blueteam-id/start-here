// src/content/config.test.ts
import { expect, test } from 'vitest';
import { z } from 'astro:content';
import { trackSchema, lessonSchema } from './config';

test('trackSchema accepts a fully-specified track', () => {
  expect(() => trackSchema.parse({
    title: 'How a Computer Actually Works',
    category: 'Computing Basics',
    order: 1,
    status: 'live',
    summary: 'Hardware, storage, OS, virtualization, at a glance.',
    estimatedMinutes: 180,
    lessonCount: 5,
    author: 'Wahyu N',
    reviewer: 'Wahyu N',
    updatedAt: new Date('2026-11-06'),
    icon: '🖥️',
    version: '1.0',
  })).not.toThrow();
});

test('trackSchema rejects a track missing a required field', () => {
  expect(() => trackSchema.parse({ title: 'Incomplete Track' })).toThrow();
});

test('lessonSchema defaults needsVM to false when omitted', () => {
  const parsed = lessonSchema.parse({
    title: 'What Is a Computer',
    track: 'computing-basics',
    phase: 'Orientation',
    order: 1,
    estimatedMinutes: 20,
  });
  expect(parsed.needsVM).toBe(false);
});

test('lessonSchema rejects a lesson missing a required field', () => {
  expect(() => lessonSchema.parse({ title: 'No Track Set' })).toThrow();
});
