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

export function staticPageRouteOptions(slug: string) {
  return {
    loader: (): LoaderData => {
      const page = loadPage(slug);
      if (!page) throw notFound();
      return { meta: page.meta, slug };
    },
    head: ({ loaderData }: { loaderData?: LoaderData }) => {
      if (!loaderData) return {};
      return {
        meta: [
          { title: `${loaderData.meta.title} | ${envConfigs.app_name}` },
          { name: 'description', content: loaderData.meta.description },
        ],
        links: [
          {
            rel: 'canonical',
            href: new URL(`/${slug}`, envConfigs.app_url).href,
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

  return (
    <article>
      <header className="mb-8 border-b border-[#c7d5d3] pb-6">
        <p className="font-mono text-xs font-semibold text-[#137b75] uppercase">
          Gesture Synth
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#17292c] md:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-3 text-sm text-[#5b7073]">{meta.description}</p>
        <p className="mt-3 text-xs text-[#75878a]">
          Last updated: {meta.updated_at}
        </p>
      </header>
      <div className="text-[15px] leading-7 text-[#344c50]">
        <Content />
      </div>
    </article>
  );
}
