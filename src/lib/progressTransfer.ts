// Export, import, and reset of lesson progress, so a learner can move it to
// another browser or back it up. There is no account and no server: the
// "progress code" is plain JSON the learner copies and pastes themselves.
// Everything goes through getProgress / setLessonComplete-compatible keys
// (fbt:progress:<track>) and the OS preference key (fbt:os).
import { getProgress } from './progress';
import { getPreferredOS, setPreferredOS, type OsId } from './prefs';

export interface TransferStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface ProgressCode {
  app: 'start.blueteam.id';
  version: 1;
  progress: Record<string, Record<string, boolean>>;
  os?: OsId;
}

const progressKey = (track: string) => `fbt:progress:${track}`;
const SLUG = /^[a-z0-9-]+$/;

/** A JSON progress code for every track that has any progress. */
export function exportProgress(trackSlugs: string[], store: TransferStore): string {
  const progress: ProgressCode['progress'] = {};
  for (const slug of trackSlugs) {
    const entries = Object.entries(getProgress(slug, store)).filter(([, done]) => done === true);
    if (entries.length > 0) progress[slug] = Object.fromEntries(entries);
  }
  const code: ProgressCode = { app: 'start.blueteam.id', version: 1, progress };
  const os = getPreferredOS(store);
  if (os) code.os = os;
  return JSON.stringify(code);
}

/**
 * Reads a progress code and merges it into this browser: lessons marked done
 * in the code become done here; nothing already done here is undone.
 * Returns the number of lessons marked done. Throws with a readable message
 * when the code is not one this site produced.
 */
export function importProgress(text: string, trackSlugs: string[], store: TransferStore): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error('That does not look like a progress code. Copy the whole code and try again.');
  }
  const code = parsed as Partial<ProgressCode> | null;
  if (!code || code.app !== 'start.blueteam.id' || code.version !== 1 || typeof code.progress !== 'object' || code.progress === null) {
    throw new Error('That does not look like a progress code from this site.');
  }

  let imported = 0;
  for (const [track, lessons] of Object.entries(code.progress)) {
    if (!trackSlugs.includes(track) || typeof lessons !== 'object' || lessons === null) continue;
    const merged = { ...getProgress(track, store) };
    for (const [lesson, done] of Object.entries(lessons)) {
      if (done === true && SLUG.test(lesson) && merged[lesson] !== true) {
        merged[lesson] = true;
        imported += 1;
      }
    }
    store.setItem(progressKey(track), JSON.stringify(merged));
  }
  if (code.os === 'macos' || code.os === 'linux' || code.os === 'windows') setPreferredOS(code.os, store);
  return imported;
}

/** Removes all progress and the OS preference from this browser. */
export function resetProgress(trackSlugs: string[], store: TransferStore): void {
  for (const slug of trackSlugs) store.removeItem(progressKey(slug));
  store.removeItem('fbt:os');
}
