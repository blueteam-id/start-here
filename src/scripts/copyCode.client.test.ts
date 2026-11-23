// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { codeText, wireCopyButtons } from './copyCode.client';

function buildFixture(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <pre data-language="bash"><code><span>cd ~/linux-essentials</span>\n<span>ls -la</span>\n</code></pre>
    <pre data-language="powershell"><code>Get-Process</code></pre>
    <pre data-language="plaintext"><code>-rw-r--r-- 1 you you 0 notes.txt</code></pre>
  `;
  return root;
}

test('adds a copy button only to shell command blocks', () => {
  const root = buildFixture();
  wireCopyButtons(root, async () => {});
  expect(root.querySelectorAll('.code-block__copy')).toHaveLength(2);
  expect(root.querySelector('pre[data-language="plaintext"]')!.parentElement).toBe(root);
});

test('wiring twice does not add a second button', () => {
  const root = buildFixture();
  wireCopyButtons(root, async () => {});
  wireCopyButtons(root, async () => {});
  expect(root.querySelectorAll('.code-block__copy')).toHaveLength(2);
});

test('clicking copies the block text without the trailing newline', async () => {
  const root = buildFixture();
  const copied: string[] = [];
  wireCopyButtons(root, async (text) => {
    copied.push(text);
  });
  const button = root.querySelector<HTMLButtonElement>('.code-block__copy')!;
  button.click();
  await Promise.resolve();
  expect(copied).toEqual(['cd ~/linux-essentials\nls -la']);
  expect(button.textContent).toBe('Copied');
});

test('a failed copy tells the learner to copy by keyboard', async () => {
  const root = buildFixture();
  wireCopyButtons(root, async () => {
    throw new Error('blocked');
  });
  const button = root.querySelector<HTMLButtonElement>('.code-block__copy')!;
  button.click();
  await Promise.resolve();
  await Promise.resolve();
  expect(button.textContent).toBe('Press Ctrl+C');
});

test('codeText trims only trailing newlines', () => {
  const pre = document.createElement('pre');
  pre.textContent = '  indented\nline\n\n';
  expect(codeText(pre)).toBe('  indented\nline');
});
