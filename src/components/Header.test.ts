import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header, { DISCORD_INVITE_URL } from './Header.astro';

test('nav includes Tracks, FAQ, and Contributing links', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header, {});
  expect(html).toContain('href="/tracks/"');
  expect(html).toContain('href="/faq/"');
  expect(html).toContain('href="/contributing/"');
});

test('the only call-to-action button is Join Discord, no donate or paid CTA', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header, {});
  expect(html).toContain(DISCORD_INVITE_URL);
  expect(html.toLowerCase()).not.toContain('donat');
  expect(html.toLowerCase()).not.toContain('upgrade');
  expect(html.toLowerCase()).not.toContain('pricing');
});
