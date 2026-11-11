// @ts-check
import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.config.mjs
export default defineConfig({
  site: 'https://www.jsone.com.my',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/ms/') && !page.includes('/zh/'),
    }),
  ],
  image: {
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
  },
  vite: {
    plugins: [tailwindcss()],
    // Local: Astro on :4321, Node API on :8787 (`npm run dev:server`)
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
  },
});

