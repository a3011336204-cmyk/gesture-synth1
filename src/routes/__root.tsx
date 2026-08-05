/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  type ErrorComponentProps,
} from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getQueryClient } from '@/lib/query-client';
import { Plausible } from '@/components/analytics/plausible';
import { SandboxPreviewBridge } from '@/components/sandbox-preview-bridge';
import { Toaster } from '@/components/ui/sonner';

import '@fontsource-variable/inter';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/libre-baskerville/400-italic.css';
import '@/styles/globals.css';

export const Route = createRootRoute({
  head: () => ({
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
  }),
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
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" translate="no" className="notranslate">
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f8f7] px-5 text-[#17292c]">
      <p className="font-mono text-xs text-[#137b75]">404</p>
      <h1 className="text-4xl font-bold">Page not found</h1>
      <a href="/" className="text-sm font-semibold text-[#137b75] underline">
        Back to Gesture Synth
      </a>
    </div>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f8f7] px-5 text-center text-[#17292c]">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-sm text-[#5b7073]">
        The page could not finish loading. Try again.
      </p>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-2 max-w-lg overflow-auto rounded bg-white p-4 text-left text-xs">
          {error.message}
        </pre>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-md bg-[#137b75] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
