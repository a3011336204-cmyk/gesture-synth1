import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft } from 'lucide-react';

import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="min-h-screen bg-[#f4f8f7]">
      <div className="mx-auto max-w-3xl px-5 pt-8 sm:px-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#137b75] hover:text-[#0b5550]"
        >
          <ArrowLeft className="size-4" />
          Back to Gesture Synth
        </a>
      </div>
      <div className="mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
        <MDXProvider components={mdxComponents}>
          <Outlet />
        </MDXProvider>
      </div>
    </div>
  );
}
