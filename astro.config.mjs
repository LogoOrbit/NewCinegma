// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cinegmafilms.com',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false }, // we use Plausible instead
    imageService: true,
    isr: { expiration: 60 * 60 * 24 }, // 24h ISR for content pages
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/studio'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'cinegmafilms.com' },
      { protocol: 'https', hostname: 'CinegmaFilms.b-cdn.net' },
    ],
  },
  vite: {
    ssr: {
      noExternal: ['gsap', 'lenis'],
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
