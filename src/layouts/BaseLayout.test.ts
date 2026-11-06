import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BaseLayout from './BaseLayout.astro';

test('renders viewport meta, lang, and title', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: 'Test Page' },
    slots: { default: '<p>hello</p>' },
  });
  expect(html).toContain('<html lang="en"');
  expect(html).toContain('name="viewport"');
  expect(html).toContain('width=device-width, initial-scale=1');
  expect(html).toContain('<title>Test Page</title>');
  expect(html).toContain('<p>hello</p>');
});
