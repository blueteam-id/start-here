// tests/setup/sync-content.ts
//
// Vitest global setup: populate the content data store before any test runs.
//
// Under Vitest, `getViteConfig` runs Astro in dev ("serve") mode, where
// `astro:content` reads the data store from `<root>/.astro/data-store.json`.
// Nothing writes that file during a plain `vitest run` (only `astro dev`
// does), so `getCollection`/`getEntry` would see empty collections. A
// programmatic `sync` normally writes the store to `cacheDir`
// (node_modules/.astro), so point `cacheDir` at `.astro/` for this one sync
// to land the store exactly where dev mode looks for it.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

export default async function setup() {
  const root = fileURLToPath(new URL('../..', import.meta.url));
  // Load Astro's Node entry directly: inside Vitest's module runner the bare
  // `astro` specifier does not resolve to the Node API that exports `sync`.
  const astroEntry = createRequire(import.meta.url).resolve('astro');
  const { sync } = await import(/* @vite-ignore */ pathToFileURL(astroEntry).href);
  await sync({ root, cacheDir: './.astro/', logLevel: 'error' });
}
