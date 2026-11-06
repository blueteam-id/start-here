// Client-side wiring for LessonView.astro's mark-complete button. Plain
// vanilla DOM APIs only, no framework runtime. Reads/writes progress through
// src/lib/progress.ts (never reimplemented here) so completion state is
// consistent with whatever else on the site reads it.
import { getProgress, setLessonComplete } from '../lib/progress';

/**
 * Wires the mark-complete button inside `root` (the lesson page's top-level
 * element) for the given track/lesson slugs. On load, reflects whatever
 * progress is already stored for this lesson. On click, toggles completion
 * and persists it via `setLessonComplete`.
 */
export function wireMarkComplete(root: HTMLElement, trackSlug: string, lessonSlug: string): void {
  const button = root.querySelector<HTMLButtonElement>('[data-mark-complete]');
  if (!button) return;

  function render(complete: boolean): void {
    button!.setAttribute('aria-pressed', String(complete));
    button!.textContent = complete ? 'Completed' : 'Mark complete';
  }

  const initialProgress = getProgress(trackSlug);
  render(initialProgress[lessonSlug] === true);

  button.addEventListener('click', () => {
    const currentlyComplete = button.getAttribute('aria-pressed') === 'true';
    const updated = setLessonComplete(trackSlug, lessonSlug, !currentlyComplete);
    render(updated[lessonSlug] === true);
  });
}
