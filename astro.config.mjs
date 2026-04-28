// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

// Production origin — drives canonical URLs in <head> and every <loc> in
// the generated sitemap. If you ever switch domains, change this single line
// and re-build; nothing else hard-codes the host.
export default defineConfig({
  site: 'https://digital-rulebook.eu',
  trailingSlash: 'always',

  build: {
    format: 'directory',
  },

  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-CN',
        },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare()
});