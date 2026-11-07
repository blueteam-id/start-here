import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Footer from './Footer.astro';
import { DISCORD_INVITE_URL, SOCIAL_LINKS } from '../lib/site';

test('links to tracks, faq, and contributing, plus a prominent Discord CTA', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Footer, {});
  expect(html).toContain('href="/tracks/"');
  expect(html).toContain('href="/faq/"');
  expect(html).toContain('href="/contributing/"');
  expect(html).toContain(`href="${DISCORD_INVITE_URL}"`);
  expect(html).toContain('site-footer__discord');
});

test('links out to all three blueteam.id social profiles with an icon each', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Footer, {});
  for (const social of SOCIAL_LINKS) {
    expect(html).toContain(`href="${social.url}"`);
  }
  expect((html.match(/class="site-footer__social"/g) ?? []).length).toBe(SOCIAL_LINKS.length);
  expect((html.match(/<svg/g) ?? []).length).toBe(SOCIAL_LINKS.length);
});
