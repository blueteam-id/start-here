// src/content/trackTwo.test.ts
import { expect, test } from 'vitest';
import { getCollection, getEntry } from 'astro:content';

test('the linux-essentials track and its 7 lessons satisfy the schema and spec', async () => {
  const track = await getEntry('tracks', 'linux-essentials');
  expect(track?.data.status).toBe('live');
  expect(track?.data.author).toBe('Wahyu N');
  expect(track?.data.reviewer).toBe('Wahyu N');
  expect(track?.data.version).toBe('1.0');

  const lessons = (await getCollection('lessons')).filter((l) => l.data.track === 'linux-essentials');
  expect(lessons).toHaveLength(7);
  const orders = lessons.map((l) => l.data.order).sort((a, b) => a - b);
  expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
  for (const lesson of lessons) {
    expect(lesson.data.reflectQuestions.length).toBeGreaterThanOrEqual(2);
    expect(lesson.data.resources.length).toBeGreaterThanOrEqual(1);
  }
});
