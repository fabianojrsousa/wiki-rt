import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://radarrt.com',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
