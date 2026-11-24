// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { renderCardProgress, renderRoadmapProgress, renderTrackLanding } from './trackProgress.client';

function storeWith(trackSlug: string, progress: Record<string, boolean>) {
  const data: Record<string, string> = { [`fbt:progress:${trackSlug}`]: JSON.stringify(progress) };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

function card(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `<span data-track-progress="git-fundamentals" data-lesson-count="5" hidden></span>`;
  return root;
}

function landing(): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-track-slug', 'git-fundamentals');
  root.innerHTML = `
    <p data-track-summary hidden></p>
    <a data-track-start href="/tracks/git-fundamentals/01-a/">Start track</a>
    <ol>
      <li data-lesson-row="01-a"><a href="/tracks/git-fundamentals/01-a/"><span data-lesson-checkmark></span><span data-lesson-title>Lesson A</span></a></li>
      <li data-lesson-row="02-b"><a href="/tracks/git-fundamentals/02-b/"><span data-lesson-checkmark></span><span data-lesson-title>Lesson B</span></a></li>
      <li data-lesson-row="03-c"><a href="/tracks/git-fundamentals/03-c/"><span data-lesson-checkmark></span><span data-lesson-title>Lesson C</span></a></li>
    </ol>
  `;
  return root;
}

test('card badge stays hidden with no progress', () => {
  const root = card();
  renderCardProgress(root, storeWith('git-fundamentals', {}));
  expect(root.querySelector<HTMLElement>('[data-track-progress]')!.hidden).toBe(true);
});

test('card badge shows done out of total, and completed at the end', () => {
  const root = card();
  renderCardProgress(root, storeWith('git-fundamentals', { a: true, b: true, c: false }));
  const badge = root.querySelector<HTMLElement>('[data-track-progress]')!;
  expect(badge.hidden).toBe(false);
  expect(badge.textContent).toBe('2 of 5 done');

  renderCardProgress(root, storeWith('git-fundamentals', { a: true, b: true, c: true, d: true, e: true }));
  expect(badge.textContent).toBe('Completed ✓');
});

test('landing page marks done lessons and continues at the first unfinished one', () => {
  const root = landing();
  renderTrackLanding(root, storeWith('git-fundamentals', { '01-a': true, '03-c': true }));
  const marks = [...root.querySelectorAll('[data-lesson-checkmark]')].map((m) => m.textContent);
  expect(marks).toEqual(['✓', '', '✓']);
  const start = root.querySelector<HTMLAnchorElement>('[data-track-start]')!;
  expect(start.textContent).toBe('Continue: Lesson B');
  expect(start.getAttribute('href')).toContain('/02-b/');
  expect(root.querySelector<HTMLElement>('[data-track-summary]')!.textContent).toBe('2 of 3 lessons done.');
});

test('landing page leaves the start button alone with no progress', () => {
  const root = landing();
  renderTrackLanding(root, storeWith('git-fundamentals', {}));
  expect(root.querySelector('[data-track-start]')!.textContent).toBe('Start track');
  expect(root.querySelector<HTMLElement>('[data-track-summary]')!.hidden).toBe(true);
});

test('landing page offers a review once every lesson is done', () => {
  const root = landing();
  renderTrackLanding(root, storeWith('git-fundamentals', { '01-a': true, '02-b': true, '03-c': true }));
  expect(root.querySelector('[data-track-start]')!.textContent).toBe('Review from the start');
  expect(root.querySelector('[data-track-summary]')!.textContent).toBe('You completed all 3 lessons.');
});

function roadmap(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <a data-roadmap-node="computing-basics" data-lesson-count="2" data-main-path><span data-track-progress="computing-basics" data-lesson-count="2" hidden></span></a>
    <a data-roadmap-node="linux-essentials" data-lesson-count="3" data-main-path><span data-track-progress="linux-essentials" data-lesson-count="3" hidden></span></a>
    <a data-roadmap-node="ai-fundamentals" data-lesson-count="2"><span data-track-progress="ai-fundamentals" data-lesson-count="2" hidden></span></a>
  `;
  return root;
}

function multiStore(data: Record<string, Record<string, boolean>>) {
  const raw: Record<string, string> = {};
  for (const [track, progress] of Object.entries(data)) raw[`fbt:progress:${track}`] = JSON.stringify(progress);
  return { getItem: (k: string) => raw[k] ?? null, setItem: (k: string, v: string) => { raw[k] = v; } };
}

const node = (root: HTMLElement, slug: string) => root.querySelector<HTMLElement>(`[data-roadmap-node="${slug}"]`)!;

test('roadmap: a first-time visitor gets no states and no "next" marker', () => {
  const root = roadmap();
  renderRoadmapProgress(root, multiStore({}));
  expect(root.querySelector('[data-state]')).toBeNull();
  expect(root.querySelector('[data-next]')).toBeNull();
});

test('roadmap: finished tracks are done, and the next main-path track is marked', () => {
  const root = roadmap();
  renderRoadmapProgress(root, multiStore({ 'computing-basics': { a: true, b: true }, 'linux-essentials': { a: true } }));
  expect(node(root, 'computing-basics').getAttribute('data-state')).toBe('done');
  expect(node(root, 'linux-essentials').getAttribute('data-state')).toBe('progress');
  expect(node(root, 'linux-essentials').hasAttribute('data-next')).toBe(true);
  expect(node(root, 'computing-basics').hasAttribute('data-next')).toBe(false);
});

test('roadmap: the AI lane is never marked as "next"', () => {
  const root = roadmap();
  renderRoadmapProgress(root, multiStore({ 'ai-fundamentals': { a: true } }));
  expect(node(root, 'ai-fundamentals').getAttribute('data-state')).toBe('progress');
  expect(node(root, 'ai-fundamentals').hasAttribute('data-next')).toBe(false);
  expect(node(root, 'computing-basics').hasAttribute('data-next')).toBe(true);
});
