// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  // Keeps the legacy content collections format (src/content/config.ts,
  // type: 'content' without a loader) that this project's content plan relies on.
  legacy: {
    collectionsBackwardsCompat: true,
  },
});
