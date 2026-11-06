// tests/no-em-dash.test.ts
import { expect, test } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const EM_DASH = '—';
const SCAN_ROOT = join(__dirname, '..', 'src');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro']);

function listTextFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (SKIP_DIRS.has(name)) return [];
    const stats = statSync(full);
    if (stats.isDirectory()) return listTextFiles(full);
    if (/\.(astro|mdx|md|ts|tsx)$/.test(name)) return [full];
    return [];
  });
}

test('no committed source file contains an em dash', () => {
  const offenders = listTextFiles(SCAN_ROOT)
    .filter((file) => readFileSync(file, 'utf-8').includes(EM_DASH));
  expect(offenders).toEqual([]);
});
