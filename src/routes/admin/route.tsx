import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  CreditCard,
  FolderOpen,
  Home,
  LayoutDashboard,
  Settings,
  Shield,
} from 'lucide-react';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { AppLayout } from '@/components/app-layout';

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex,follow' }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const group = m['common.systems.admin']();
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
      href: '/admin',
      label: m['admin.nav.overview'](),
      icon: LayoutDashboard,
      group,
    },
    {
      href: '/admin/users',
      label: m['admin.nav.rbac'](),
      icon: Shield,
      group,
      items: [
        { href: '/admin/users', label: m['admin.nav.users']() },
        { href: '/admin/invite-codes', label: m['admin.nav.invite_codes']() },
        { href: '/admin/roles', label: m['admin.nav.roles']() },
        { href: '/admin/permissions', label: m['admin.nav.permissions']() },
      ],
    },
    {
      href: '/admin/payments',
      label: m['admin.nav.billing'](),
      icon: CreditCard,
      group,
      items: [
        { href: '/admin/payments', label: m['admin.nav.payments']() },
        { href: '/admin/subscriptions', label: m['admin.nav.subscriptions']() },
        { href: '/admin/credits', label: m['admin.nav.credits']() },
      ],
    },
    {
      href: '/admin/categories',
      label: m['admin.nav.content'](),
      icon: FolderOpen,
      group,
      items: [
        { href: '/admin/categories', label: m['admin.nav.categories']() },
        { href: '/admin/posts', label: m['admin.nav.posts']() },
        { href: '/admin/tickets', label: m['admin.nav.tickets']() },
      ],
    },
  ];

  const footerNavItems = [
    {
      href: '/admin/settings',
      label: m['admin.nav.settings'](),
      icon: Settings,
    },
    { href: '/', label: m['common.systems.home'](), icon: Home, newTab: true },
  ];

  return (
    <AppLayout
      navItems={navItems}
      footerNavItems={footerNavItems}
      brand={brand}
      brandHref="/admin"
      profileHref="/settings/profile"
      requirePermission="admin.*"
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
    </AppLayout>
  );
}
