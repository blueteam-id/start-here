// src/content/trackOne.test.ts
import { expect, test } from 'vitest';
import { getCollection, getEntry } from 'astro:content';

test('the computing-basics track and its 5 lessons satisfy the schema and spec', async () => {
  const track = await getEntry('tracks', 'computing-basics');
  expect(track?.data.status).toBe('live');
  expect(track?.data.author).toBe('Wahyu N');
  expect(track?.data.reviewer).toBe('Wahyu N');

  const lessons = (await getCollection('lessons')).filter((l) => l.data.track === 'computing-basics');
  expect(lessons).toHaveLength(5);
  const orders = lessons.map((l) => l.data.order).sort((a, b) => a - b);
  expect(orders).toEqual([1, 2, 3, 4, 5]);
  for (const lesson of lessons) {
    expect(lesson.data.reflectQuestions.length).toBeGreaterThanOrEqual(2);
    expect(lesson.data.resources.length).toBeGreaterThanOrEqual(1);
  }
});
