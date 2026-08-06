import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Home, LayoutDashboard, LifeBuoy, User } from 'lucide-react';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { SupportWidget } from '@/blocks/support-widget';
import { AppLayout } from '@/components/app-layout';

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex,follow' }],
  }),
  component: SettingsLayout,
});

function SettingsLayout() {
  const group = m['common.systems.settings']();
  const brand = (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-sm border border-[#9b6a42] bg-[#e7dcc9] p-1">
        <img
          src="/images/gesture-synth-logo.png"
          alt=""
          width={512}
          height={512}
          className="size-full object-contain"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-serif text-[15px] leading-tight font-bold text-[#fff7eb]">
          {envConfigs.app_name}
        </span>
        <span className="block truncate text-[11px] font-semibold text-[#c8bba7]">
          {group}
        </span>
      </span>
    </span>
  );
  const navItems = [
    {
      href: '/settings',
      label: m['settings.nav.overview'](),
      icon: LayoutDashboard,
      group,
    },
    {
      href: '/settings/tickets',
      label: m['settings.nav.tickets'](),
      icon: LifeBuoy,
      group,
    },
  ];

  const footerNavItems = [
    {
      href: '/settings/profile',
      label: m['settings.nav.profile'](),
      icon: User,
    },
    { href: '/', label: m['common.systems.home'](), icon: Home, newTab: true },
  ];

  return (
    <AppLayout
      navItems={navItems}
      footerNavItems={footerNavItems}
      brand={brand}
      brandHref="/settings"
      mobileBrand={
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-sm border border-[#9b6a42] bg-[#e7dcc9] p-1">
            <img
              src="/images/gesture-synth-logo.png"
              alt=""
              width={512}
              height={512}
              className="size-full object-contain"
            />
          </span>
          <span className="truncate font-serif text-sm font-bold text-[#26352d] dark:text-[#f4eee4]">
            {envConfigs.app_name}
          </span>
        </span>
      }
    >
      <Outlet />
      <SupportWidget />
    </AppLayout>
  );
}
