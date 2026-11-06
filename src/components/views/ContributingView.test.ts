import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ContributingView, { CONTRIBUTION_REPO_URL, CONTRIBUTION_EMAIL } from './ContributingView.astro';

test('placeholder contribution contacts are marked, not real-looking', () => {
  expect(CONTRIBUTION_REPO_URL).toContain('REPLACE_ME');
  expect(CONTRIBUTION_EMAIL).toContain('REPLACE_ME');
});

test('mentions GitHub, email, and Discord as contribution paths', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ContributingView, {});
  expect(html.toLowerCase()).toContain('github');
  expect(html.toLowerCase()).toContain('discord');
  expect(html).toContain(CONTRIBUTION_EMAIL);
});
