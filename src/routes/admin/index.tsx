import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpRight, Shield, Users } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

function AdminPage() {
  const usersQuery = useQuery({
    queryKey: ['admin-users-total'],
    queryFn: () => apiGet<{ total: number }>('/api/admin/users'),
  });
  const rolesQuery = useQuery({
    queryKey: ['admin-roles-total'],
    queryFn: () => apiGet<{ total: number }>('/api/admin/roles'),
  });

  const overviewGroups = [
    {
      title: m['admin.overview.people'](),
      description: m['admin.overview.people_description'](),
      links: [
        { href: '/admin/users', label: m['admin.overview.manage_users']() },
        {
          href: '/admin/invite-codes',
          label: m['admin.overview.manage_invites'](),
        },
        { href: '/admin/roles', label: m['admin.overview.manage_roles']() },
      ],
    },
    {
      title: m['admin.overview.content'](),
      description: m['admin.overview.content_description'](),
      links: [
        {
          href: '/admin/categories',
          label: m['admin.overview.manage_categories'](),
        },
        { href: '/admin/posts', label: m['admin.overview.manage_posts']() },
        {
          href: '/admin/tickets',
          label: m['admin.overview.manage_tickets'](),
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-5 sm:p-7 lg:p-9">
      <header className="max-w-2xl border-b border-[#c6b299] pb-7">
        <h1 className="font-serif text-3xl leading-tight text-[#26352d] sm:text-4xl">
          {m['admin.title']()}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#615c51]">
          {m['admin.description']()}
        </p>
      </header>

      <section
        aria-label={m['admin.title']()}
        className="grid max-w-2xl gap-px overflow-hidden border border-[#c6b299] bg-[#c6b299] sm:grid-cols-2"
      >
        <div className="bg-[#fbf7ef] p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold text-[#26352d]">
              {m['admin.stats.total_users']()}
            </p>
            <Users
              className="size-4 shrink-0 text-[#9a4f2e]"
              aria-hidden="true"
            />
          </div>
          <p className="mt-6 font-serif text-4xl leading-none text-[#26352d] tabular-nums">
            {usersQuery.isPending ? '—' : (usersQuery.data?.total ?? 0)}
          </p>
        </div>
        <div className="bg-[#fbf7ef] p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold text-[#26352d]">
              {m['admin.stats.roles']()}
            </p>
            <Shield
              className="size-4 shrink-0 text-[#9a4f2e]"
              aria-hidden="true"
            />
          </div>
          <p className="mt-6 font-serif text-4xl leading-none text-[#26352d] tabular-nums">
            {rolesQuery.isPending ? '—' : (rolesQuery.data?.total ?? 0)}
          </p>
        </div>
      </section>

      <section className="max-w-4xl border-t border-[#9b6a42] pt-7">
        <h2 className="font-serif text-2xl text-[#26352d]">
          {m['admin.overview.next_steps']()}
        </h2>
        <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {overviewGroups.map((group) => (
            <section
              key={group.title}
              className="border-t border-[#c6b299] pt-5"
            >
              <h3 className="text-base font-semibold text-[#26352d]">
                {group.title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#615c51]">
                {group.description}
              </p>
              <nav className="mt-5 flex flex-col border-t border-[#d9cbb8]">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex min-h-11 items-center justify-between gap-3 border-b border-[#d9cbb8] py-2 text-sm font-medium text-[#6d3824] transition-colors hover:text-[#9d4928] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
});
