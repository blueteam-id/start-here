import { expect, test } from 'vitest';
import { GLOSSARY, termId } from './glossary';
import { CATALOG_TRACKS } from './catalog';

test('terms are in alphabetical order, so the page reads like a glossary', () => {
  const terms = GLOSSARY.map((t) => t.term.toLowerCase());
  expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b)));
});

test('every term has a unique anchor id', () => {
  const ids = GLOSSARY.map((t) => termId(t.term));
  expect(new Set(ids).size).toBe(ids.length);
  expect(termId('Pull request (merge request)')).toBe('pull-request-merge-request');
});

test('every term points at a real track', () => {
  const slugs = new Set(CATALOG_TRACKS.map((t) => t.slug));
  for (const entry of GLOSSARY) expect(slugs.has(entry.track), entry.term).toBe(true);
});

test('definitions stay short', () => {
  for (const entry of GLOSSARY) expect(entry.definition.split(/\s+/).length, entry.term).toBeLessThanOrEqual(40);
});
