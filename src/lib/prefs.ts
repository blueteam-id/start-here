// Small per-browser preferences (currently: which OS tab to show in code
// blocks). Same rules as progress.ts: a minimal key/value store so it can be
// tested without a browser, and it never throws when storage is unavailable
// (private mode, disabled storage, quota).

export type OsId = 'macos' | 'linux' | 'windows';

export interface PrefStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const OS_KEY = 'fbt:os';
const OS_IDS: readonly OsId[] = ['macos', 'linux', 'windows'];

function isOsId(value: unknown): value is OsId {
  return typeof value === 'string' && (OS_IDS as readonly string[]).includes(value);
}

function browserStore(): PrefStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function resolve(store: PrefStore | null | undefined): PrefStore | null {
  return store === undefined ? browserStore() : store;
}

export function getPreferredOS(store?: PrefStore | null): OsId | null {
  try {
    const value = resolve(store)?.getItem(OS_KEY);
    return isOsId(value) ? value : null;
  } catch {
    return null;
  }
}

export function setPreferredOS(os: OsId, store?: PrefStore | null): void {
  try {
    resolve(store)?.setItem(OS_KEY, os);
  } catch {
    // Ignore: the choice simply is not remembered.
  }
}

/**
 * Best guess at the visitor's desktop OS from the user agent string. Phones
 * and tablets return null: someone reading on a phone will run the commands
 * on a different machine, so no tab should be forced.
 */
export function detectOS(userAgent: string): OsId | null {
  const ua = userAgent || '';
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return null;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Linux|X11|CrOS/i.test(ua)) return 'linux';
  return null;
}
