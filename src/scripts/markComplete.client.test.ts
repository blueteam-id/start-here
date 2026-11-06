// @vitest-environment jsdom
import { beforeEach, expect, test } from 'vitest';
import { wireMarkComplete } from './markComplete.client';

function buildFixture(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-progress-bar aria-valuenow="0">
      <div data-progress-fill style="width: 0%"></div>
      <span data-progress-label>0% complete</span>
    </div>
    <ul>
      <li data-lesson-row="01-what-is-a-computer"><span data-lesson-checkmark></span></li>
      <li data-lesson-row="02-storage"><span data-lesson-checkmark></span></li>
    </ul>
    <button type="button" data-mark-complete aria-pressed="false">Mark complete</button>
  `;
  return root;
}

beforeEach(() => {
  localStorage.clear();
});

test('on load, reflects stored progress on the button and the sidebar', () => {
  localStorage.setItem(
    'fbt:progress:computing-basics',
    JSON.stringify({ '01-what-is-a-computer': true }),
  );

  const root = buildFixture();
  wireMarkComplete(root, 'computing-basics', '01-what-is-a-computer');

  expect(root.querySelector('[data-mark-complete]')!.textContent).toBe('Completed');
  expect(root.querySelector('[data-mark-complete]')!.getAttribute('aria-pressed')).toBe('true');
  expect(root.querySelector('[data-lesson-row="01-what-is-a-computer"] [data-lesson-checkmark]')!.textContent).toBe('✓');
  expect(root.querySelector('[data-lesson-row="02-storage"] [data-lesson-checkmark]')!.textContent).toBe('');
  expect(root.querySelector('[data-progress-label]')!.textContent).toBe('50% complete');
  expect((root.querySelector('[data-progress-fill]') as HTMLElement).style.width).toBe('50%');
});

test('clicking mark complete persists progress and updates the button and the sidebar', () => {
  const root = buildFixture();
  wireMarkComplete(root, 'computing-basics', '02-storage');

  expect(root.querySelector('[data-lesson-row="02-storage"] [data-lesson-checkmark]')!.textContent).toBe('');

  root.querySelector<HTMLButtonElement>('[data-mark-complete]')!.click();

  expect(root.querySelector('[data-mark-complete]')!.textContent).toBe('Completed');
  expect(root.querySelector('[data-lesson-row="02-storage"] [data-lesson-checkmark]')!.textContent).toBe('✓');
  expect(root.querySelector('[data-progress-label]')!.textContent).toBe('50% complete');

  const stored = JSON.parse(localStorage.getItem('fbt:progress:computing-basics')!);
  expect(stored).toEqual({ '02-storage': true });
});
