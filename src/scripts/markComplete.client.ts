// Client-side wiring for LessonView.astro's mark-complete button and
// LessonSidebar.astro's progress bar / lesson checkmarks. Plain vanilla DOM
// APIs only, no framework runtime. Reads/writes progress through
// src/lib/progress.ts (never reimplemented here) so completion state is
// consistent with whatever else on the site reads it.
//
// This is a fully static site (no server output), so the progress baked
// into the server-rendered sidebar markup is always empty -- there is no
// localStorage at build time. Real progress only exists in the visitor's
// browser, so it has to be read and applied here, on load, in addition to
// reacting to the mark-complete button's clicks.
import { getPercentComplete, getProgress, setLessonComplete } from '../lib/progress';

/**
 * Wires the mark-complete button and the lesson sidebar inside `root` (the
 * lesson page's top-level element) for the given track/lesson slugs.
 *
 * On load: reflects whatever progress is already stored for this track,
 * both on the mark-complete button and on the sidebar's checkmarks and
 * progress bar.
 *
 * On click: toggles this lesson's completion, persists it via
 * `setLessonComplete`, and re-renders the button and the sidebar from the
 * result.
 */
export function wireMarkComplete(root: HTMLElement, trackSlug: string, lessonSlug: string): void {
  const button = root.querySelector<HTMLButtonElement>('[data-mark-complete]');

  function renderButton(complete: boolean): void {
    if (!button) return;
    button.setAttribute('aria-pressed', String(complete));
    button.textContent = complete ? 'Completed' : 'Mark complete';
  }

  function renderSidebar(progress: Record<string, boolean>): void {
    const rows = root.querySelectorAll<HTMLElement>('[data-lesson-row]');
    rows.forEach((row) => {
      const slug = row.getAttribute('data-lesson-row');
      const checkmark = row.querySelector<HTMLElement>('[data-lesson-checkmark]');
      if (!checkmark || !slug) return;
      checkmark.textContent = progress[slug] === true ? '✓' : '';
    });

    const percent = getPercentComplete(progress, rows.length);
    const progressBar = root.querySelector<HTMLElement>('[data-progress-bar]');
    const progressFill = root.querySelector<HTMLElement>('[data-progress-fill]');
    const progressLabel = root.querySelector<HTMLElement>('[data-progress-label]');
    progressBar?.setAttribute('aria-valuenow', String(percent));
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}% complete`;
  }

  const initialProgress = getProgress(trackSlug);
  renderButton(initialProgress[lessonSlug] === true);
  renderSidebar(initialProgress);

  button?.addEventListener('click', () => {
    const currentlyComplete = button.getAttribute('aria-pressed') === 'true';
    const updated = setLessonComplete(trackSlug, lessonSlug, !currentlyComplete);
    renderButton(updated[lessonSlug] === true);
    renderSidebar(updated);
  });
}
