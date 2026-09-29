import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://radarrt.com',
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
