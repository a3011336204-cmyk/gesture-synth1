import type { ReactNode } from 'react';
import { AudioLines } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export const musicRoomAuthCardClass =
  'rounded-[4px] border border-[#b99f80] bg-[#fffaf1] py-0 text-[#1d2a24] shadow-[0_24px_56px_rgba(65,43,26,0.16)]';

export const musicRoomAuthCardHeaderClass =
  'border-b border-[#d0bda0] px-5 pt-6 pb-5 text-left sm:px-8 sm:pt-8';

export const musicRoomAuthCardContentClass =
  'px-5 py-6 sm:px-8 sm:py-8 [&_label]:font-semibold [&_label]:text-[#314035] [&_input]:h-10 [&_input]:rounded-[3px] [&_input]:border-[#bfa789] [&_input]:bg-[#fffcf7] [&_input]:px-3 [&_input]:text-[#1d2a24] [&_input]:placeholder:text-[#827465] [&_input:focus-visible]:border-[#9a4f2e] [&_input:focus-visible]:ring-[#c87950]/25';

export const musicRoomAuthCardFooterClass =
  'border-[#d0bda0] bg-[#f5eadb] px-5 py-4 sm:px-8';

export const musicRoomAuthPrimaryButtonClass =
  'h-10 w-full rounded-[3px] border border-[#9d4928] bg-[#b95c33] px-4 text-[#fffaf1] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#9d4928] hover:text-[#fffaf1] focus-visible:ring-[#b95c33] active:translate-y-0';

export const musicRoomAuthOutlineButtonClass =
  'h-10 w-full rounded-[3px] border-[#bfa789] bg-[#fffaf1] px-4 text-[#2d3a31] hover:bg-[#f2e6d6] hover:text-[#1d2a24]';

export const musicRoomAuthGhostButtonClass =
  'h-10 w-full rounded-[3px] px-4 text-[#5a6658] hover:bg-[#eadbc6] hover:text-[#1d2a24]';

export const musicRoomAuthLinkClass =
  'font-medium text-[#91472d] underline decoration-[#c78c70] underline-offset-4 transition-colors hover:text-[#6e2d1d] focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a4f2e]';

export const musicRoomAuthErrorClass =
  'rounded-[3px] border border-[#c9866a] bg-[#f9e1d8] px-3 py-2.5 text-sm text-[#83361f]';

export const musicRoomAuthNoticeClass =
  'rounded-[3px] border border-dashed border-[#b99f80] bg-[#f7eddf] p-5 text-center';

export function MusicRoomAuthShell({
  appName,
  children,
}: {
  appName: string;
  children: ReactNode;
}) {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[#eee7da] text-[#1d2a24] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,0.7fr)]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 overflow-hidden bg-[#1d2a24] lg:hidden"
      >
        <img
          src="/images/gesture-synth-hand-tracking.jpg"
          alt=""
          className="size-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-[#1d2a24]/55" />
      </div>

      <aside
        aria-hidden="true"
        className="relative hidden min-h-svh overflow-hidden border-r border-[#755939] bg-[#1d2a24] lg:block"
      >
        <img
          src="/images/gesture-synth-hand-tracking.jpg"
          alt=""
          className="size-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-[#17231d]/58" />
        <div className="absolute inset-y-0 left-0 w-3 bg-[#9b6a42]/85" />
        <div className="absolute inset-y-0 left-3 w-px bg-[#e5c090]/60" />
        <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 border-y border-[#f5dfbd]/45 py-6">
          <div className="h-px bg-[#f5dfbd]/35" />
          <div className="mt-3 h-px bg-[#f5dfbd]/35" />
          <div className="mt-3 h-px bg-[#f5dfbd]/35" />
          <div className="mt-3 h-px bg-[#f5dfbd]/35" />
          <div className="mt-3 h-px bg-[#f5dfbd]/35" />
        </div>
        <div className="absolute right-10 bottom-10 flex size-14 items-center justify-center border border-[#f5dfbd]/60 bg-[#9a4f2e]/90 text-[#fff1dc] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <AudioLines className="size-6" strokeWidth={1.5} />
        </div>
      </aside>

      <section className="relative flex min-h-svh items-center justify-center px-5 pt-30 pb-10 sm:px-8 sm:pt-32 sm:pb-12 lg:px-12 lg:py-12">
        <div className="absolute inset-x-0 top-0 h-2 bg-[#9b6a42] lg:hidden" />
        <div className="w-full max-w-md">
          <Link
            href="/"
            aria-label={appName}
            className="mb-8 inline-flex items-center gap-3 rounded-[3px] text-[#1d2a24] transition-colors hover:text-[#9a4f2e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a4f2e] lg:mb-10"
          >
            <span className="flex size-9 items-center justify-center border border-[#9b6a42] bg-[#1d2a24] text-[#f7e7d0] shadow-[0_8px_18px_rgba(76,48,28,0.2)]">
              <AudioLines className="size-4" strokeWidth={1.8} />
            </span>
            <span className="font-serif text-lg leading-none italic">
              {appName}
            </span>
          </Link>
          <div aria-hidden="true" className="mb-5 flex gap-1.5 lg:mb-6">
            <span className="h-1 w-11 bg-[#9a4f2e]" />
            <span className="h-1 w-5 bg-[#b89572]" />
            <span className="h-1 w-3 bg-[#d8b28b]" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
