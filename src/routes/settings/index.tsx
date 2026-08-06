import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpRight, CircleUserRound, LifeBuoy, Music2 } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

function SettingsOverviewPage() {
  const { data: session } = useSession();
  const accountName = session?.user?.name || session?.user?.email || '';

  const accountLinks = [
    {
      href: '/settings/profile',
      icon: CircleUserRound,
      title: m['settings.overview.account'](),
      description: m['settings.overview.account_description'](),
      action: m['settings.overview.open_profile'](),
    },
    {
      href: '/settings/tickets',
      icon: LifeBuoy,
      title: m['settings.overview.support'](),
      description: m['settings.overview.support_description'](),
      action: m['settings.overview.open_support'](),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-5 sm:p-7 lg:p-9">
      <header className="max-w-2xl border-b border-[#c6b299] pb-7">
        <h1 className="font-serif text-3xl leading-tight text-[#26352d] sm:text-4xl">
          {m['settings.overview.practice_space']()}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#615c51]">
          {m['settings.welcome']({ name: accountName })}
        </p>
      </header>

      <section className="max-w-3xl border-y border-[#c6b299] py-6 sm:py-7">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center border border-[#9b6a42] bg-[#e7dcc9] text-[#9a4f2e]">
            <Music2 className="size-5" aria-hidden="true" />
          </span>
          <p className="max-w-2xl text-base leading-7 text-[#3b453d]">
            {m['settings.overview.practice_note']()}
          </p>
        </div>
      </section>

      <section className="max-w-3xl" aria-label={m['settings.title']()}>
        <div className="border-t border-[#9b6a42]">
          {accountLinks.map(
            ({ href, icon: Icon, title, description, action }) => (
              <Link
                key={href}
                href={href}
                className="group grid gap-4 border-b border-[#c6b299] py-5 text-[#26352d] transition-colors hover:bg-[#eee4d4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="grid size-9 place-items-center border border-[#b99f80] bg-[#fbf7ef] text-[#9a4f2e]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block max-w-md text-sm leading-6 text-[#615c51]">
                    {description}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#7c4028] group-hover:text-[#9d4928]">
                  {action}
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            )
          )}
        </div>
      </section>

      <Link
        href="/#gesture-synth-stage"
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#a8502f] px-4 py-2 text-sm font-semibold text-[#fff7eb] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#913f24] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] active:translate-y-0"
      >
        {m['settings.overview.return_to_instrument']()}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: SettingsOverviewPage,
});
