import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wiki-reforma-tributaria.pages.dev',
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
