// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { wireCodeTabs } from './codeTabs.client';

function buildFixture(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="tabs">
      <button data-tab="macos" aria-selected="true"></button>
      <button data-tab="linux" aria-selected="false"></button>
    </div>
    <div data-panel="macos"></div>
    <div data-panel="linux" hidden></div>
  `;
  return root;
}

test('clicking a tab shows its panel and hides the others', () => {
  const root = buildFixture();
  wireCodeTabs(root);
  root.querySelector('[data-tab="linux"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(root.querySelector('[data-panel="linux"]')!.hasAttribute('hidden')).toBe(false);
  expect(root.querySelector('[data-panel="macos"]')!.hasAttribute('hidden')).toBe(true);
});
