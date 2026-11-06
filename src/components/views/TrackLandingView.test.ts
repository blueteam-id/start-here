import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TrackLandingView from './TrackLandingView.astro';

const fixtureTrack = { slug: 'computing-basics', data: {
  title: 'How a Computer Actually Works', category: 'Computing Basics', order: 1, status: 'live',
  summary: 'Hardware, storage, OS, virtualization, at a glance.', estimatedMinutes: 180, lessonCount: 2,
  author: 'Wahyu N', reviewer: 'Wahyu N', updatedAt: new Date('2026-11-06'), icon: '🖥️',
} } as any;

const fixtureLessons = [
  { slug: 'computing-basics/02-storage', data: { title: 'Storage and Data', track: 'computing-basics', phase: 'Core Concepts', order: 2, estimatedMinutes: 20, needsVM: false } },
  { slug: 'computing-basics/01-what-is-a-computer', data: { title: 'What Is a Computer', track: 'computing-basics', phase: 'Orientation', order: 1, estimatedMinutes: 15, needsVM: false } },
] as any[];

test('shows the attribution strip and an ordered lesson list with a start link to lesson 1', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(TrackLandingView, { props: { track: fixtureTrack, lessons: fixtureLessons } });
  expect(html).toContain('Wahyu N');
  const firstIndex = html.indexOf('What Is a Computer');
  const secondIndex = html.indexOf('Storage and Data');
  expect(firstIndex).toBeGreaterThan(-1);
  expect(firstIndex).toBeLessThan(secondIndex);
  expect(html).toContain('href="/tracks/computing-basics/01-what-is-a-computer/"');
});
