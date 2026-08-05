import type { ComponentType } from 'react';
import { notFound, useLoaderData } from '@tanstack/react-router';

import { envConfigs } from '@/config';

type PageMeta = {
  title: string;
  description: string;
  updated_at: string;
};

type PageModule = {
  default: ComponentType;
  meta: PageMeta;
};

const pages = import.meta.glob<PageModule>('/src/content/pages/*.en.mdx', {
  eager: true,
});

function loadPage(slug: string): PageModule | null {
  return pages[`/src/content/pages/${slug}.en.mdx`] ?? null;
}

type LoaderData = { meta: PageMeta; slug: string };

function getPageUrl(slug: string) {
  return new URL(`/${slug}`, envConfigs.app_url).href;
}

function getSocialImageUrl() {
  return new URL('/images/gesture-synth-hand-tracking.jpg', envConfigs.app_url)
    .href;
}

export function staticPageRouteOptions(slug: string) {
  return {
    loader: (): LoaderData => {
      const page = loadPage(slug);
      if (!page) throw notFound();
      return { meta: page.meta, slug };
    },
    head: ({ loaderData }: { loaderData?: LoaderData }) => {
      if (!loaderData) return {};
      const title = `${loaderData.meta.title} | ${envConfigs.app_name}`;
      const canonicalUrl = getPageUrl(slug);
      const socialImageUrl = getSocialImageUrl();
      return {
        meta: [
          { title },
          { name: 'description', content: loaderData.meta.description },
          { property: 'og:title', content: title },
          {
            property: 'og:description',
            content: loaderData.meta.description,
          },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: canonicalUrl },
          { property: 'og:image', content: socialImageUrl },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: title },
          {
            name: 'twitter:description',
            content: loaderData.meta.description,
          },
          { name: 'twitter:image', content: socialImageUrl },
        ],
        links: [
          {
            rel: 'canonical',
            href: canonicalUrl,
          },
        ],
      };
    },
    component: StaticPage,
  };
}

function StaticPage() {
  const { meta, slug } = useLoaderData({ strict: false }) as LoaderData;
  const page = loadPage(slug);
  if (!page) throw new Error(`English static page is missing: ${slug}`);
  const Content = page.default;
  const pageUrl = getPageUrl(slug);
  const structuredDataJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': slug === 'contact' ? 'ContactPage' : 'WebPage',
    '@id': `${pageUrl}#webpage`,
    name: meta.title,
    description: meta.description,
    url: pageUrl,
    inLanguage: 'en',
    dateModified: meta.updated_at,
    isPartOf: {
      '@type': 'WebSite',
      name: envConfigs.app_name,
      url: new URL('/', envConfigs.app_url).href,
    },
  }).replace(/</g, '\\u003c');

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJsonLd }}
      />
      <header className="mb-8 border-b border-[#c7d5d3] pb-6">
        <p className="font-mono text-xs font-semibold text-[#137b75] uppercase">
          Gesture Synth
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#17292c] md:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-3 text-sm text-[#5b7073]">{meta.description}</p>
        <time
          dateTime={meta.updated_at}
          className="mt-3 block text-xs text-[#75878a]"
        >
          Last updated: {meta.updated_at}
        </time>
      </header>
      <div className="text-[15px] leading-7 text-[#344c50]">
        <Content />
      </div>
    </article>
  );
}
