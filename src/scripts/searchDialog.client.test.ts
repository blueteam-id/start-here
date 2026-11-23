// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { isSearchShortcut } from './searchDialog.client';

function key(init: KeyboardEventInit, target?: HTMLElement): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, ...init });
  if (target) Object.defineProperty(event, 'target', { value: target });
  return event;
}

test('"/" opens search, but not while typing in a field', () => {
  expect(isSearchShortcut(key({ key: '/' }, document.body))).toBe(true);
  expect(isSearchShortcut(key({ key: '/' }, document.createElement('input')))).toBe(false);
  expect(isSearchShortcut(key({ key: '/' }, document.createElement('textarea')))).toBe(false);
});

test('Ctrl+K and Cmd+K open search, even from a field', () => {
  expect(isSearchShortcut(key({ key: 'k', ctrlKey: true }, document.body))).toBe(true);
  expect(isSearchShortcut(key({ key: 'k', metaKey: true }, document.createElement('input')))).toBe(true);
});

test('other keys do nothing', () => {
  expect(isSearchShortcut(key({ key: 'k' }, document.body))).toBe(false);
  expect(isSearchShortcut(key({ key: 's' }, document.body))).toBe(false);
});
