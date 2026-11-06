// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  // Required only because the content config lives at the legacy path
  // `src/content/config.ts` (imported by src/content/config.test.ts) rather
  // than `src/content.config.ts`. Without this flag Astro refuses to load it
  // (LegacyContentConfigError). Both collections already use explicit glob
  // loaders, so no other legacy behavior is relied on.
  legacy: {
    collectionsBackwardsCompat: true,
  },
});
