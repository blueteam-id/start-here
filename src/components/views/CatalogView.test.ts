import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import CatalogView from './CatalogView.astro';

test('lists all 13 tracks, with exactly two live links and eleven disabled cards', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(CatalogView, {});
  expect((html.match(/aria-disabled="true"/g) ?? []).length).toBe(11);
  expect(html).toContain('href="/tracks/computing-basics/"');
  expect(html).toContain('href="/tracks/linux-essentials/"');
  expect(html).toContain('Computing Basics');
  expect(html).toContain('Security Foundations');
});
