import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wiki-reforma-tributaria.pages.dev',
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
