import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HomeView from './HomeView.astro';

test('the tracks teaser only links to live tracks, never a coming-soon one', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(HomeView, {});
  expect(html).toContain('href="/tracks/computing-basics/"');
  expect(html).toContain('href="/tracks/linux-essentials/"');
  expect(html).not.toContain('href="/tracks/windows-foundations/"');
  expect(html).toContain('/tracks/');
});

test('renders exactly four pillar cards', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(HomeView, {});
  expect((html.match(/class="pillar(?=["\s])/g) ?? []).length).toBe(4);
});
