import { expect, test } from 'vitest';
import { reportEmailUrl, reportIssueUrl } from './report';
import { CONTRIBUTION_EMAIL, CONTRIBUTION_REPO_URL } from './site';

const ctx = {
  trackTitle: 'Linux Essentials',
  lessonTitle: 'Reading & Searching Files',
  pageUrl: 'https://start.blueteam.id/tracks/linux-essentials/04-reading-and-searching-files/',
};

test('issue link opens a new issue on the contribution repo with the lesson filled in', () => {
  const url = new URL(reportIssueUrl(ctx));
  expect(`${url.origin}${url.pathname}`).toBe(`${CONTRIBUTION_REPO_URL}/issues/new`);
  expect(url.searchParams.get('title')).toBe('Lesson problem: Linux Essentials / Reading & Searching Files');
  expect(url.searchParams.get('body')).toContain(`Page: ${ctx.pageUrl}`);
});

test('email link goes to the contribution inbox with spaces encoded as %20', () => {
  const href = reportEmailUrl(ctx);
  expect(href.startsWith(`mailto:${CONTRIBUTION_EMAIL}?subject=`)).toBe(true);
  expect(href).not.toContain('+');
  expect(decodeURIComponent(href)).toContain('Reading & Searching Files');
});
