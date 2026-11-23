// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { renderCardProgress, renderTrackLanding } from './trackProgress.client';

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
