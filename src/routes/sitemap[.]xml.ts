import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const PUBLIC_PATHS = [
  '/',
  '/how-it-works',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
] as const;

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const entries = PUBLIC_PATHS.map(
          (path) =>
            `  <url>\n    <loc>${new URL(path, envConfigs.app_url).href}</loc>\n    <changefreq>${path === '/' ? 'weekly' : path === '/how-it-works' ? 'monthly' : 'yearly'}</changefreq>\n    <priority>${path === '/' ? '1.0' : path === '/how-it-works' ? '0.8' : '0.5'}</priority>\n  </url>`
        );
        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries,
          '</urlset>',
          '',
        ].join('\n');
        return new Response(body, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
      },
    },
  },
});
