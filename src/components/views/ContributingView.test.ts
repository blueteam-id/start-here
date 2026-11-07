import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ContributingView, { CONTRIBUTION_REPO_URL, CONTRIBUTION_EMAIL } from './ContributingView.astro';

test('contribution contacts point at the real repo and inbox', () => {
  expect(CONTRIBUTION_REPO_URL).toBe('https://github.com/blueteam-id/start-here');
  expect(CONTRIBUTION_EMAIL).toBe('info@blueteam.id');
});

test('mentions GitHub, email, and Discord as contribution paths', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ContributingView, {});
  expect(html.toLowerCase()).toContain('github');
  expect(html.toLowerCase()).toContain('discord');
  expect(html).toContain(CONTRIBUTION_EMAIL);
});
