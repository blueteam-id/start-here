// Shows lesson progress outside the lesson pages: a "2 of 5 done" badge on
// track cards (homepage and catalog), and checkmarks plus a "Continue" button
// on a track's landing page. Plain vanilla DOM APIs only. Progress is read
// through src/lib/progress.ts, the same store the lesson pages write to.
//
// The site is static, so the server-rendered markup never shows progress;
// these functions are a progressive enhancement that only add to the page.
import { getProgress, type ProgressStore } from '../lib/progress';

function doneCount(progress: Record<string, boolean>, slugs?: string[]): number {
  const keys = slugs ?? Object.keys(progress);
  return keys.filter((slug) => progress[slug] === true).length;
}

/** Fills each `[data-track-progress]` card badge inside `root`. */
export function renderCardProgress(root: ParentNode, store?: ProgressStore | null): void {
  root.querySelectorAll<HTMLElement>('[data-track-progress]').forEach((badge) => {
    const slug = badge.getAttribute('data-track-progress') ?? '';
    const total = Number(badge.getAttribute('data-lesson-count') ?? '0');
    const done = Math.min(doneCount(getProgress(slug, store)), total);
    if (done === 0 || total <= 0) {
      badge.hidden = true;
      return;
    }
    badge.textContent = done >= total ? 'Completed ✓' : `${done} of ${total} done`;
    badge.hidden = false;
  });
}

/**
 * On a track landing page: checkmarks next to completed lessons, a short
 * summary line, and the start button pointing at the first unfinished lesson.
 */
export function renderTrackLanding(root: HTMLElement, store?: ProgressStore | null): void {
  const trackSlug = root.getAttribute('data-track-slug');
  if (!trackSlug) return;
  const progress = getProgress(trackSlug, store);

  const rows = [...root.querySelectorAll<HTMLElement>('[data-lesson-row]')];
  const slugs = rows.map((row) => row.getAttribute('data-lesson-row') ?? '');
  rows.forEach((row, i) => {
    const mark = row.querySelector<HTMLElement>('[data-lesson-checkmark]');
    const complete = progress[slugs[i]] === true;
    if (mark) mark.textContent = complete ? '✓' : '';
    row.toggleAttribute('data-complete', complete);
  });

  const done = doneCount(progress, slugs);
  const summary = root.querySelector<HTMLElement>('[data-track-summary]');
  if (summary) {
    summary.hidden = done === 0;
    summary.textContent =
      done >= rows.length ? `You completed all ${rows.length} lessons.` : `${done} of ${rows.length} lessons done.`;
  }

  const start = root.querySelector<HTMLAnchorElement>('[data-track-start]');
  if (!start || done === 0) return;
  const nextIndex = slugs.findIndex((slug) => progress[slug] !== true);
  if (nextIndex === -1) {
    start.textContent = 'Review from the start';
    return;
  }
  const nextLink = rows[nextIndex].querySelector<HTMLAnchorElement>('a');
  const nextTitle = rows[nextIndex].querySelector('[data-lesson-title]')?.textContent?.trim();
  if (nextLink) start.href = nextLink.href;
  if (nextTitle) start.textContent = `Continue: ${nextTitle}`;
}

/**
 * On the homepage roadmap: marks each track node as done or in progress,
 * and, once the learner has started anything, highlights the first
 * unfinished track on the main path as "Next". First-time visitors see the
 * map unchanged, with "Start here" on the first track.
 */
export function renderRoadmapProgress(root: ParentNode, store?: ProgressStore | null): void {
  renderCardProgress(root, store);

  const nodes = [...root.querySelectorAll<HTMLElement>('[data-roadmap-node]')];
  let anyStarted = false;
  for (const node of nodes) {
    const slug = node.getAttribute('data-roadmap-node') ?? '';
    const total = Number(node.getAttribute('data-lesson-count') ?? '0');
    const done = Math.min(doneCount(getProgress(slug, store)), total);
    node.removeAttribute('data-state');
    node.removeAttribute('data-next');
    if (done > 0) anyStarted = true;
    if (total > 0 && done >= total) node.setAttribute('data-state', 'done');
    else if (done > 0) node.setAttribute('data-state', 'progress');
  }

  if (!anyStarted) return;
  const next = nodes.find(
    (node) => node.hasAttribute('data-main-path') && node.getAttribute('data-state') !== 'done',
  );
  next?.setAttribute('data-next', '');
}
