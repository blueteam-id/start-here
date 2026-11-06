import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Writes the content data store so `astro:content` queries see real
    // entries under test. See tests/setup/sync-content.ts.
    globalSetup: ['./tests/setup/sync-content.ts'],
  },
});
