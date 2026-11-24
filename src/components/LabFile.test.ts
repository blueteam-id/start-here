import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import LabFile from './LabFile.astro';

test('renders a download link with the real size and SHA-256 of the file', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(LabFile, {
    props: { path: 'labs/sql-basics/company.db', label: 'Practice database' },
  });
  const expected = createHash('sha256').update(readFileSync('public/labs/sql-basics/company.db')).digest('hex');
  expect(html).toContain('href="/labs/sql-basics/company.db"');
  expect(html).toContain('download="company.db"');
  expect(html).toContain('Practice database');
  expect(html).toContain(expected);
  expect(html).toMatch(/\d+ KB/);
});

test('a missing file fails the build', async () => {
  const container = await AstroContainer.create();
  await expect(container.renderToString(LabFile, { props: { path: 'labs/nope.txt' } })).rejects.toThrow(/not found/);
});

test('paths cannot climb out of public/', async () => {
  const container = await AstroContainer.create();
  await expect(container.renderToString(LabFile, { props: { path: '../package.json' } })).rejects.toThrow(/relative/);
});
