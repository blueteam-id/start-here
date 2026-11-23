// Prefilled "report a problem with this lesson" links: a new GitHub issue, or
// an email for people without a GitHub account. Only the lesson's own
// identity (track, title, page URL) goes into the link; anything personal is
// left for the reporter to add themselves.
import { CONTRIBUTION_EMAIL, CONTRIBUTION_REPO_URL } from './site';

export interface ReportContext {
  trackTitle: string;
  lessonTitle: string;
  pageUrl: string;
}

function title(ctx: ReportContext): string {
  return `Lesson problem: ${ctx.trackTitle} / ${ctx.lessonTitle}`;
}

function body(ctx: ReportContext): string {
  return [
    `Lesson: ${ctx.trackTitle} / ${ctx.lessonTitle}`,
    `Page: ${ctx.pageUrl}`,
    '',
    'What went wrong (a command that failed, something unclear or out of date):',
    '',
    '',
    'What you expected instead:',
    '',
    '',
    'Your OS (macOS / Linux / Windows, and version if you know it):',
    '',
  ].join('\n');
}

export function reportIssueUrl(ctx: ReportContext): string {
  const params = new URLSearchParams({ title: title(ctx), body: body(ctx) });
  return `${CONTRIBUTION_REPO_URL}/issues/new?${params.toString()}`;
}

export function reportEmailUrl(ctx: ReportContext): string {
  // mailto needs %20 for spaces; URLSearchParams would use "+".
  const subject = encodeURIComponent(title(ctx));
  const text = encodeURIComponent(body(ctx));
  return `mailto:${CONTRIBUTION_EMAIL}?subject=${subject}&body=${text}`;
}
