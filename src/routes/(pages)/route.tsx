import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';

import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#d6bc95] text-[#1d2a24] [&>header]:!sticky">
      <Header />
      <main className="relative min-h-[calc(100vh-76px)] bg-[#d6bc95] pt-px">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#9b6a42]"
        />
        <div className="relative mx-auto min-h-[calc(100vh-77px)] max-w-[1440px] border-x border-[#9b6a42]/55 bg-[#f4efe5]">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
            <MDXProvider components={mdxComponents}>
              <Outlet />
            </MDXProvider>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
