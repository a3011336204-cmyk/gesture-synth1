import type { ComponentType } from 'react';
import { notFound, useLoaderData } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { CANONICAL_SITE_URL, envConfigs } from '@/config';

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
  return new URL(`/${slug}`, CANONICAL_SITE_URL).href;
}

function getSocialImageUrl() {
  return new URL('/images/gesture-synth-hand-tracking.jpg', CANONICAL_SITE_URL)
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
      url: new URL('/', CANONICAL_SITE_URL).href,
    },
  }).replace(/</g, '\\u003c');

  return (
    <article className="relative py-12 sm:py-16 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJsonLd }}
      />
      <div>
        <header className="max-w-4xl border-b-2 border-[#1d2a24] pb-9 sm:pb-11">
          <Link
            href="/#gesture-synth-stage"
            className="group inline-flex w-fit items-center gap-2 rounded-sm border border-[#9b6a42] bg-[#e7dcc9] px-3 py-2 text-sm font-semibold text-[#1d2a24] shadow-[0_8px_18px_rgba(71,48,31,0.14)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Open {envConfigs.app_name}
          </Link>
          <h1 className="mt-10 max-w-3xl font-serif text-4xl leading-[1.13] font-bold text-[#1d2a24] sm:mt-12 sm:text-5xl lg:text-[3.5rem]">
            {meta.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e594f] sm:text-[17px] sm:leading-8">
            {meta.description}
          </p>
          <time
            dateTime={meta.updated_at}
            className="mt-7 inline-flex border-l border-[#b95c33] pl-3 text-sm text-[#796850]"
          >
            Last updated: {meta.updated_at}
          </time>
        </header>
        <div className="static-page-copy mt-11 max-w-2xl text-[16px] leading-8 text-[#393b32] sm:mt-14 sm:text-[17px] [&_a]:font-semibold [&_a]:text-[#8d4327] [&_a]:decoration-[#b95c33] [&_a]:decoration-1 [&_a]:underline-offset-[6px] [&_a:hover]:text-[#6e321e] [&_blockquote]:my-8 [&_blockquote]:border-l [&_blockquote]:border-[#b95c33] [&_blockquote]:pl-5 [&_blockquote]:font-serif [&_blockquote]:text-lg [&_blockquote]:leading-8 [&_blockquote]:text-[#5e594f] [&_code]:rounded-none [&_code]:bg-[#e7dcc9] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[#523e2e] [&_h1]:mt-12 [&_h1]:mb-5 [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:text-[#1d2a24] [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:border-l [&_h2]:border-[#b95c33] [&_h2]:pl-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:text-[#1d2a24] sm:[&_h2]:text-3xl [&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:text-[#1d2a24] [&_hr]:my-10 [&_hr]:border-[#cdb895] [&_li]:pl-1 [&_li]:leading-8 [&_li]:text-[#393b32] [&_ol]:mt-0 [&_ol]:mb-7 [&_ol]:ml-6 [&_ol]:space-y-2 [&_ol]:marker:text-[#b95c33] [&_p]:mt-0 [&_p]:mb-7 [&_p]:leading-8 [&_p]:text-[#393b32] [&_strong]:font-semibold [&_strong]:text-[#1d2a24] [&_ul]:mt-0 [&_ul]:mb-7 [&_ul]:ml-6 [&_ul]:space-y-2 [&_ul]:marker:text-[#b95c33]">
          <Content />
        </div>
      </div>
    </article>
  );
}
