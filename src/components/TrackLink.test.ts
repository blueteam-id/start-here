import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import TrackLink from './TrackLink.astro';

// Every real track is live now, so the coming-soon case uses a made-up
// track added to the catalog for this test only.
vi.mock('../data/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/catalog')>();
  return {
    ...actual,
    CATALOG_TRACKS: [
      ...actual.CATALOG_TRACKS,
      {
        slug: 'future-track',
        title: 'Future Track',
        category: 'AI Fundamentals',
        status: 'coming-soon' as const,
        summary: 'Not written yet.',
        estimatedMinutes: 60,
        lessonCount: 3,
        icon: '🔮',
      },
    ],
  };
});

test('a live track renders as a link to its landing page', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackLink, { props: { slug: 'linux-essentials' } });
  expect(html).toContain('href="/tracks/linux-essentials/"');
  expect(html).toContain('Linux Essentials');
  expect(html).not.toContain('coming soon');
});

test('a coming-soon track renders its name without a link', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackLink, { props: { slug: 'future-track' } });
  expect(html).toContain('Future Track');
  expect(html).toContain('(coming soon)');
  expect(html).not.toContain('href=');
});

test('an unknown slug fails loudly', async () => {
  const container = await AstroContainer.create();
  await expect(container.renderToString(TrackLink, { props: { slug: 'no-such-track' } })).rejects.toThrow(
    /unknown track slug/,
  );
});
