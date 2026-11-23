// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { wireCodeTabGroups, wireCodeTabs } from './codeTabs.client';
import { detectOS, getPreferredOS } from '../lib/prefs';

function buildFixture(oses: string[] = ['macos', 'linux']): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <div class="tabs">
      ${oses.map((os, i) => `<button data-tab="${os}" aria-selected="${i === 0}"></button>`).join('')}
    </div>
    ${oses.map((os, i) => `<div data-panel="${os}"${i === 0 ? '' : ' hidden'}></div>`).join('')}
  `;
  return root;
}

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

function visible(root: HTMLElement): string | null {
  return root.querySelector('[data-panel]:not([hidden])')?.getAttribute('data-panel') ?? null;
}

function click(root: HTMLElement, os: string): void {
  root.querySelector(`[data-tab="${os}"]`)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

test('clicking a tab shows its panel and hides the others', () => {
  const root = buildFixture();
  wireCodeTabs(root);
  click(root, 'linux');
  expect(root.querySelector('[data-panel="linux"]')!.hasAttribute('hidden')).toBe(false);
  expect(root.querySelector('[data-panel="macos"]')!.hasAttribute('hidden')).toBe(true);
});

test('arrow keys move to the next tab and select it', () => {
  const root = buildFixture(['macos', 'linux', 'windows']);
  document.body.appendChild(root);
  wireCodeTabs(root);
  const macos = root.querySelector<HTMLElement>('[data-tab="macos"]')!;
  macos.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  expect(visible(root)).toBe('windows');
  expect(document.activeElement?.getAttribute('data-tab')).toBe('windows');
  root.remove();
});

test('picking an OS in one group switches every group and remembers it', () => {
  const store = memoryStore();
  const a = buildFixture(['macos', 'linux', 'windows']);
  const b = buildFixture(['macos', 'linux', 'windows']);
  wireCodeTabGroups([a, b], { store, userAgent: '' });
  click(a, 'windows');
  expect(visible(a)).toBe('windows');
  expect(visible(b)).toBe('windows');
  expect(getPreferredOS(store)).toBe('windows');
});

test('a group without the chosen OS keeps its current tab', () => {
  const a = buildFixture(['macos', 'linux', 'windows']);
  const b = buildFixture(['macos', 'linux']);
  wireCodeTabGroups([a, b], { store: memoryStore(), userAgent: '' });
  click(a, 'windows');
  expect(visible(b)).toBe('macos');
});

test('on load, the remembered OS wins over the detected one', () => {
  const store = memoryStore({ 'fbt:os': 'linux' });
  const a = buildFixture(['macos', 'linux', 'windows']);
  wireCodeTabGroups([a], { store, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
  expect(visible(a)).toBe('linux');
});

test('on a first visit, the detected OS is shown', () => {
  const a = buildFixture(['macos', 'linux', 'windows']);
  wireCodeTabGroups([a], { store: memoryStore(), userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
  expect(visible(a)).toBe('windows');
});

test('detectOS recognises desktops and ignores phones', () => {
  expect(detectOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macos');
  expect(detectOS('Mozilla/5.0 (X11; Linux x86_64)')).toBe('linux');
  expect(detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows');
  expect(detectOS('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBeNull();
  expect(detectOS('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBeNull();
});

test('a broken store never throws', () => {
  const broken = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('denied');
    },
  };
  const a = buildFixture(['macos', 'linux']);
  expect(() => wireCodeTabGroups([a], { store: broken, userAgent: '' })).not.toThrow();
  expect(() => click(a, 'linux')).not.toThrow();
});
