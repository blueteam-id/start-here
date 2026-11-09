// src/content/trackThree.test.ts
import { expect, test } from 'vitest';
import { getCollection, getEntry } from 'astro:content';

test('the windows-foundations track and its 6 lessons satisfy the schema and spec', async () => {
  const track = await getEntry('tracks', 'windows-foundations');
  expect(track?.data.status).toBe('live');
  expect(track?.data.author).toBe('Wahyu N');
  expect(track?.data.reviewer).toBe('Wahyu N');
  expect(track?.data.version).toBe('1.0');

  const lessons = (await getCollection('lessons')).filter(
    (l) => l.data.track === 'windows-foundations',
  );
  expect(lessons).toHaveLength(7);
  const orders = lessons.map((l) => l.data.order).sort((a, b) => a - b);
  expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
  for (const lesson of lessons) {
    expect(lesson.data.reflectQuestions.length).toBeGreaterThanOrEqual(2);
    expect(lesson.data.resources.length).toBeGreaterThanOrEqual(1);
  }

  const wrapUp = lessons.find((l) => l.data.order === 7);
  expect(wrapUp?.data.phase).toBe('Wrap-up');

  const activeDirectory = lessons.find((l) => l.data.order === 4);
  expect(activeDirectory?.data.title).toContain('Active Directory');
});
