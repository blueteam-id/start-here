import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TrackLink from './TrackLink.astro';

test('a live track renders as a link to its landing page', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackLink, { props: { slug: 'linux-essentials' } });
  expect(html).toContain('href="/tracks/linux-essentials/"');
  expect(html).toContain('Linux Essentials');
  expect(html).not.toContain('coming soon');
});

test('a coming-soon track renders its name without a link', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackLink, { props: { slug: 'networking-fundamentals' } });
  expect(html).toContain('Networking Fundamentals');
  expect(html).toContain('(coming soon)');
  expect(html).not.toContain('href=');
});

test('an unknown slug fails loudly', async () => {
  const container = await AstroContainer.create();
  await expect(container.renderToString(TrackLink, { props: { slug: 'no-such-track' } })).rejects.toThrow(
    /unknown track slug/,
  );
});
