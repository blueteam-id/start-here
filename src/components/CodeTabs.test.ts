import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import CodeTabs from './CodeTabs.astro';

test('renders three OS tabs with the first panel visible by default', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(CodeTabs, {
    slots: { macos: '<pre>mac cmd</pre>', linux: '<pre>linux cmd</pre>', windows: '<pre>win cmd</pre>' },
  });
  expect(html).toMatch(/macOS/);
  expect(html).toMatch(/Linux/);
  expect(html).toMatch(/Windows/);
  const macPanelIndex = html.indexOf('mac cmd');
  const linuxPanelIndex = html.indexOf('linux cmd');
  expect(html.slice(Math.max(0, macPanelIndex - 200), macPanelIndex)).not.toContain('hidden');
  expect(html.slice(Math.max(0, linuxPanelIndex - 200), linuxPanelIndex)).toContain('hidden');
});
