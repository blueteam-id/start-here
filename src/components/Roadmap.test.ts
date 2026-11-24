import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Roadmap from './Roadmap.astro';
import { CATALOG_TRACKS } from '../data/catalog';

test('links every track exactly once, in numbered steps, with an AI lane beside it', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Roadmap, {});
  for (const t of CATALOG_TRACKS) {
    expect((html.match(new RegExp(`data-roadmap-node="${t.slug}"`, 'g')) ?? []).length, t.slug).toBe(1);
  }
  expect(html).toContain('Step 1: </span>Start here');
  expect(html).toContain('Anytime: AI');
  expect(html).toContain('href="/tracks/"');
});

test('"Start here" sits on Computing Basics, and only main-path tracks can become "Next"', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Roadmap, {});
  const start = html.indexOf('roadmap__tag--start');
  const computing = html.indexOf('data-roadmap-node="computing-basics"');
  const linux = html.indexOf('data-roadmap-node="linux-essentials"');
  expect(start).toBeGreaterThan(computing);
  expect(start).toBeLessThan(linux);
  expect(html).not.toMatch(/data-roadmap-node="ai-fundamentals"[^>]*data-main-path/);
});
