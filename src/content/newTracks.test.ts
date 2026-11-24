// The seven tracks written on 2026-11-24, checked the same way as the
// earlier per-track tests: live, attributed, the expected number of lessons
// in order, reflect questions and resources on every lesson, and exactly one
// wrap-up lesson at the end.
import { expect, test } from 'vitest';
import { getCollection, getEntry } from 'astro:content';

const NEW_TRACKS: Array<[slug: string, lessons: number]> = [
  ['security-concepts', 5],
  ['how-the-web-really-works', 5],
  ['programming-basics-python', 6],
  ['sql-basics', 5],
  ['servers-and-services', 6],
  ['ai-fundamentals', 5],
  ['how-llms-actually-work', 5],
];

for (const [slug, count] of NEW_TRACKS) {
  test(`the ${slug} track and its ${count} lessons satisfy the schema and spec`, async () => {
    const track = await getEntry('tracks', slug);
    expect(track?.data.status).toBe('live');
    expect(track?.data.author).toBe('Wahyu N');
    expect(track?.data.reviewer).toBe('Wahyu N');
    expect(track?.data.version).toBe('1.0');

    const lessons = (await getCollection('lessons')).filter((l) => l.data.track === slug);
    expect(lessons).toHaveLength(count);
    const orders = lessons.map((l) => l.data.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: count }, (_, i) => i + 1));
    for (const lesson of lessons) {
      expect(lesson.data.reflectQuestions.length).toBeGreaterThanOrEqual(2);
      expect(lesson.data.resources.length).toBeGreaterThanOrEqual(1);
    }
    const phases = lessons.filter((l) => l.data.phase === 'Wrap-up');
    expect(phases).toHaveLength(1);
    expect(phases[0].data.order).toBe(count);
  });
}

test('every Servers & Services lesson is marked as needing a VM', async () => {
  const lessons = (await getCollection('lessons')).filter((l) => l.data.track === 'servers-and-services');
  for (const lesson of lessons) expect(lesson.data.needsVM, lesson.id).toBe(true);
});
