import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TrackCard from './TrackCard.astro';

const liveTrack = { slug: 'computing-basics', title: 'How a Computer Actually Works', category: 'Computing Basics', status: 'live' as const, summary: 's', estimatedMinutes: 180, lessonCount: 5, icon: '🖥️' };
const comingSoonTrack = { ...liveTrack, slug: 'linux-essentials', title: 'Linux Essentials', status: 'coming-soon' as const };

test('a live track renders as a link to its landing page', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackCard, { props: { track: liveTrack } });
  expect(html).toContain('href="/tracks/computing-basics/"');
});

test('a coming-soon track renders with no link at all', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackCard, { props: { track: comingSoonTrack } });
  expect(html).not.toContain('<a ');
  expect(html).not.toContain('href=');
  expect(html).toContain('aria-disabled="true"');
  expect(html).toMatch(/coming soon/i);
});
