// src/lib/progress.test.ts
import { expect, test } from 'vitest';
import { getProgress, setLessonComplete, getPercentComplete } from './progress';

function fakeStore(): ProgressStore {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v); },
  };
}

test('getProgress returns empty object for a track with no saved state', () => {
  expect(getProgress('computing-basics', fakeStore())).toEqual({});
});

test('setLessonComplete persists and getProgress reads it back', () => {
  const store = fakeStore();
  setLessonComplete('computing-basics', 'lesson-1', true, store);
  expect(getProgress('computing-basics', store)).toEqual({ 'lesson-1': true });
});

test('setLessonComplete can unset a lesson', () => {
  const store = fakeStore();
  setLessonComplete('computing-basics', 'lesson-1', true, store);
  setLessonComplete('computing-basics', 'lesson-1', false, store);
  expect(getProgress('computing-basics', store)).toEqual({ 'lesson-1': false });
});

test('a throwing store degrades to empty progress instead of throwing', () => {
  const throwingStore = {
    getItem: () => { throw new Error('storage disabled'); },
    setItem: () => { throw new Error('storage disabled'); },
  };
  expect(() => getProgress('computing-basics', throwingStore)).not.toThrow();
  expect(getProgress('computing-basics', throwingStore)).toEqual({});
  expect(() => setLessonComplete('computing-basics', 'lesson-1', true, throwingStore)).not.toThrow();
});

test('getPercentComplete is 0 when there are zero total lessons', () => {
  expect(getPercentComplete({}, 0)).toBe(0);
});

test('getPercentComplete is 0 when nothing is complete', () => {
  expect(getPercentComplete({}, 5)).toBe(0);
});

test('getPercentComplete rounds to an integer percent', () => {
  expect(getPercentComplete({ a: true, b: true }, 3)).toBe(67);
});

test('getPercentComplete caps at 100 even with stale extra entries', () => {
  expect(getPercentComplete({ a: true, b: true, c: true, d: true }, 3)).toBe(100);
});
