import { expect, test } from 'vitest';
import { exportProgress, importProgress, resetProgress } from './progressTransfer';
import { getProgress } from './progress';

const TRACKS = ['computing-basics', 'linux-essentials'];

function memoryStore(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    removeItem: (key: string) => {
      delete data[key];
    },
  };
}

test('export then import moves progress and the OS choice to another browser', () => {
  const from = memoryStore({
    'fbt:progress:computing-basics': JSON.stringify({ '01-a': true, '02-b': false }),
    'fbt:os': 'windows',
  });
  const code = exportProgress(TRACKS, from);
  const to = memoryStore();
  expect(importProgress(code, TRACKS, to)).toBe(1);
  expect(getProgress('computing-basics', to)).toEqual({ '01-a': true });
  expect(to.data['fbt:os']).toBe('windows');
});

test('import merges and never undoes progress already in this browser', () => {
  const to = memoryStore({ 'fbt:progress:linux-essentials': JSON.stringify({ '01-x': true }) });
  const code = JSON.stringify({ app: 'start.blueteam.id', version: 1, progress: { 'linux-essentials': { '02-y': true } } });
  expect(importProgress(code, TRACKS, to)).toBe(1);
  expect(getProgress('linux-essentials', to)).toEqual({ '01-x': true, '02-y': true });
});

test('import ignores unknown tracks and odd lesson names', () => {
  const to = memoryStore();
  const code = JSON.stringify({
    app: 'start.blueteam.id',
    version: 1,
    progress: { 'not-a-track': { '01-a': true }, 'computing-basics': { '<script>': true, '01-a': 'yes' } },
  });
  expect(importProgress(code, TRACKS, to)).toBe(0);
  expect(to.data['fbt:progress:not-a-track']).toBeUndefined();
});

test('import rejects text that is not a progress code', () => {
  const to = memoryStore();
  expect(() => importProgress('hello', TRACKS, to)).toThrow(/progress code/);
  expect(() => importProgress('{"progress":{}}', TRACKS, to)).toThrow(/progress code/);
});

test('reset removes progress and the OS choice', () => {
  const store = memoryStore({
    'fbt:progress:computing-basics': JSON.stringify({ '01-a': true }),
    'fbt:os': 'linux',
    'unrelated': 'keep me',
  });
  resetProgress(TRACKS, store);
  expect(store.data).toEqual({ unrelated: 'keep me' });
});
