// One-shot static audit of the built site.
// Walks dist/**/*.html and fails if any page lacks a viewport meta tag
// or contains an em dash character.

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const EM_DASH = '—';
const VIEWPORT_MARKER = 'name="viewport"';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

let htmlFiles;
try {
  htmlFiles = await walk(DIST);
} catch (err) {
  console.error(`audit-dist: cannot read ${DIST}: ${err.message}`);
  console.error('Run `npm run build` first.');
  process.exit(1);
}

if (htmlFiles.length === 0) {
  console.error(`audit-dist: no HTML files found under ${DIST}`);
  process.exit(1);
}

const problems = [];
for (const file of htmlFiles.sort()) {
  const rel = relative(DIST, file);
  const html = await readFile(file, 'utf8');
  if (!html.includes(VIEWPORT_MARKER)) {
    problems.push(`${rel}: missing viewport meta tag`);
  }
  if (html.includes(EM_DASH)) {
    problems.push(`${rel}: contains em dash (U+2014)`);
  }
}

if (problems.length > 0) {
  console.error(`Audit failed: ${problems.length} problem(s) across ${htmlFiles.length} HTML files:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`Audited ${htmlFiles.length} HTML files, 0 problems.`);
