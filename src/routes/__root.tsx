/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ArrowLeft, RotateCcw } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { getQueryClient } from '@/lib/query-client';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { getGoogleAnalyticsTagConfig } from '@/components/analytics/google-analytics';
import { Plausible } from '@/components/analytics/plausible';
import { SandboxPreviewBridge } from '@/components/sandbox-preview-bridge';
import { Toaster } from '@/components/ui/sonner';

import '@fontsource-variable/inter';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/libre-baskerville/400-italic.css';
import '@/styles/globals.css';

// Read the merged env + database config on the server so the GA tags are
// present in the initial HTML and the admin setting can override the default.
const getAnalyticsConfig = createServerFn().handler(async () => {
  const { getAllConfigs } = await import('@/modules/config/service');
  const configs = await getAllConfigs();
  return { googleAnalyticsId: configs.google_analytics_id?.trim() || '' };
});

export const Route = createRootRoute({
  loader: () => getAnalyticsConfig(),
  head: ({ loaderData }) => {
    const googleAnalyticsTags = getGoogleAnalyticsTagConfig(
      loaderData?.googleAnalyticsId || ''
    );
    return {
      meta: [
        { charSet: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { title: envConfigs.app_name },
        { name: 'description', content: envConfigs.app_description },
        { name: 'google', content: 'notranslate' },
      ],
      links: [
        {
          rel: 'icon',
          href: '/images/gesture-synth-logo.png',
          type: 'image/png',
        },
        { rel: 'apple-touch-icon', href: '/images/gesture-synth-logo.png' },
      ],
      scripts: googleAnalyticsTags
        ? [
            {
              id: 'ga-loader',
              src: googleAnalyticsTags.loaderSrc,
              async: true,
            },
            {
              id: 'ga-init',
              children: googleAnalyticsTags.initScript,
            },
          ]
        : [],
    };
  },
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootComponent() {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <Outlet />
      <SandboxPreviewBridge />
      <Toaster position="top-center" richColors />
      {envConfigs.plausible_domain || envConfigs.plausible_src ? (
        <Plausible
          domain={envConfigs.plausible_domain || undefined}
          src={envConfigs.plausible_src || undefined}
        />
      ) : null}
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={getLocale()} translate="no" className="notranslate">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#f4eee4] text-[#26352d]">
      <div className="border-t-2 border-b border-t-[#b95c33] border-b-[#9b6a42] bg-[#f4efe5]">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-sm font-serif text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
          >
            <span className="grid size-10 place-items-center border border-[#9b6a42] bg-[#e7dcc9] p-1 shadow-[0_8px_18px_rgba(71,48,31,0.16)]">
              <img
                src="/images/gesture-synth-logo.png"
                alt=""
                width={512}
                height={512}
                className="size-full object-contain"
              />
            </span>
            {envConfigs.app_name}
          </Link>
        </div>
      </div>
      <main className="mx-auto grid min-h-[calc(100dvh-76px)] max-w-7xl place-items-center px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="w-full max-w-2xl border-y border-[#c6b299] py-10 sm:py-14">
          <h1 className="max-w-xl font-serif text-5xl leading-[0.96] text-[#26352d] sm:text-6xl">
            {m['common.not_found.message']()}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#615c51]">
            {m['common.pages.back_to_home']()} {envConfigs.app_name}.
          </p>
          <Link
            href="/#gesture-synth-stage"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#a8502f] px-5 py-3 text-sm font-semibold text-[#fff7eb] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#913f24] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] active:translate-y-0"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {m['common.not_found.back_home']()}
          </Link>
        </div>
      </main>
    </div>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="min-h-[100dvh] bg-[#f4eee4] px-5 py-5 text-[#26352d] sm:px-8 sm:py-8">
      <main className="mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-7xl place-items-center border border-[#c6b299] bg-[#e7dcc9] p-5 sm:min-h-[calc(100dvh-4rem)] sm:p-10">
        <div className="w-full max-w-2xl border-y border-[#bda78b] bg-[#f4eee4] px-1 py-10 sm:px-10 sm:py-14">
          <h1 className="font-serif text-4xl leading-[1] text-[#26352d] sm:text-5xl">
            {m['common.error.title']()}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#615c51]">
            {m['common.error.message']()}
          </p>
          {import.meta.env.DEV && error instanceof Error && (
            <pre className="mt-7 max-w-lg overflow-auto border border-[#c6b299] bg-[#eee5d7] p-4 text-left font-mono text-xs leading-5 text-[#5a4738]">
              {error.message}
            </pre>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#b95c33] px-5 py-3 text-sm font-semibold text-[#fff7eb] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#9d4928] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] active:translate-y-0"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {m['common.error.retry']()}
            </button>
            <Link
              href="/#gesture-synth-stage"
              className="inline-flex min-h-12 items-center gap-2 px-2 py-3 text-sm font-semibold text-[#8c4529] transition-colors hover:text-[#69301d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {m['common.pages.back_to_home']()}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
