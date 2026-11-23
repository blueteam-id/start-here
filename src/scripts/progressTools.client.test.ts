// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { wireProgressTools } from './progressTools.client';

const TRACKS = ['computing-basics'];

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

function fixture(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <textarea data-progress-export></textarea>
    <button data-progress-copy></button>
    <textarea data-progress-import></textarea>
    <button data-progress-load></button>
    <button data-progress-reset></button>
    <p data-progress-status></p>
  `;
  return root;
}

const status = (root: HTMLElement) => root.querySelector('[data-progress-status]')!.textContent;

test('shows the current progress code on load and copies it', async () => {
  const root = fixture();
  const store = memoryStore({ 'fbt:progress:computing-basics': JSON.stringify({ '01-a': true }) });
  const copied: string[] = [];
  wireProgressTools(root, TRACKS, store, async (t) => {
    copied.push(t);
  });
  const code = root.querySelector<HTMLTextAreaElement>('[data-progress-export]')!.value;
  expect(JSON.parse(code).progress).toEqual({ 'computing-basics': { '01-a': true } });
  root.querySelector<HTMLButtonElement>('[data-progress-copy]')!.click();
  await Promise.resolve();
  expect(copied).toEqual([code]);
  expect(status(root)).toMatch(/copied/);
});

test('loading a pasted code reports how many lessons were added', () => {
  const root = fixture();
  const store = memoryStore();
  wireProgressTools(root, TRACKS, store, async () => {});
  root.querySelector<HTMLTextAreaElement>('[data-progress-import]')!.value = JSON.stringify({
    app: 'start.blueteam.id',
    version: 1,
    progress: { 'computing-basics': { '01-a': true, '02-b': true } },
  });
  root.querySelector<HTMLButtonElement>('[data-progress-load]')!.click();
  expect(status(root)).toBe('2 lessons marked as done.');
});

test('a bad code shows a readable message instead of throwing', () => {
  const root = fixture();
  wireProgressTools(root, TRACKS, memoryStore(), async () => {});
  root.querySelector<HTMLTextAreaElement>('[data-progress-import]')!.value = 'nope';
  expect(() => root.querySelector<HTMLButtonElement>('[data-progress-load]')!.click()).not.toThrow();
  expect(status(root)).toMatch(/does not look like a progress code/);
});

test('reset only happens after confirmation', () => {
  const root = fixture();
  const store = memoryStore({ 'fbt:progress:computing-basics': JSON.stringify({ '01-a': true }) });
  let answer = false;
  wireProgressTools(root, TRACKS, store, async () => {}, () => answer);
  root.querySelector<HTMLButtonElement>('[data-progress-reset]')!.click();
  expect(store.data['fbt:progress:computing-basics']).toBeDefined();
  answer = true;
  root.querySelector<HTMLButtonElement>('[data-progress-reset]')!.click();
  expect(store.data['fbt:progress:computing-basics']).toBeUndefined();
});

test('without storage, the buttons are disabled and the page explains why', () => {
  const root = fixture();
  wireProgressTools(root, TRACKS, null);
  expect(root.querySelector<HTMLButtonElement>('[data-progress-load]')!.disabled).toBe(true);
  expect(status(root)).toMatch(/not allowing/);
});
