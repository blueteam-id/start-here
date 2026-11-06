// Lesson completion tracking. Pure logic over a minimal key/value store so it
// can be tested without a browser and never throws when storage is unavailable.

export interface ProgressStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function storageKey(trackId: string): string {
  return `fbt:progress:${trackId}`;
}

// Wraps the real localStorage. Any error (missing global, disabled storage,
// quota exceeded, private mode) is swallowed so callers degrade gracefully.
function defaultStore(): ProgressStore | null {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    return {
      getItem: (key) => {
        try {
          return ls.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          ls.setItem(key, value);
        } catch {
          // Ignore: progress simply is not persisted.
        }
      },
    };
  } catch {
    return null;
  }
}

function resolveStore(store: ProgressStore | null | undefined): ProgressStore | null {
  return store === undefined ? defaultStore() : store;
}

export function getProgress(
  trackId: string,
  store?: ProgressStore | null,
): Record<string, boolean> {
  const s = resolveStore(store);
  if (!s) return {};
  let raw: string | null;
  try {
    raw = s.getItem(storageKey(trackId));
  } catch {
    return {};
  }
  if (raw === null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, boolean> = {};
    for (const [lessonId, value] of Object.entries(parsed)) {
      if (typeof value === 'boolean') result[lessonId] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function setLessonComplete(
  trackId: string,
  lessonId: string,
  complete: boolean,
  store?: ProgressStore | null,
): Record<string, boolean> {
  const next = { ...getProgress(trackId, store), [lessonId]: complete };
  const s = resolveStore(store);
  if (s) {
    try {
      s.setItem(storageKey(trackId), JSON.stringify(next));
    } catch {
      // Ignore: the in-memory result is still returned.
    }
  }
  return next;
}

export function getPercentComplete(
  progress: Record<string, boolean>,
  totalLessons: number,
): number {
  if (totalLessons <= 0) return 0;
  const done = Object.values(progress).filter((v) => v === true).length;
  const percent = Math.round((done / totalLessons) * 100);
  return Math.min(100, Math.max(0, percent));
}
