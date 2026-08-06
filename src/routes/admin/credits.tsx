import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { tDynamic } from '@/core/i18n/dynamic';
import { apiGet, type PageResult } from '@/lib/api-client';
import { formatDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { Card, CardContent } from '@/components/ui/card';

interface Credit {
  id: string;
  userId: string;
  userEmail: string | null;
  transactionNo: string;
  transactionType: string;
  transactionScene: string | null;
  credits: number;
  remainingCredits: number;
  description: string | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

const TABS = ['all', 'grant', 'consume'] as const;
type Tab = (typeof TABS)[number];

function CreditsPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const query = useQuery({
    queryKey: ['admin-credits', page, tab, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (tab !== 'all') params.set('transactionType', tab);
      if (debouncedSearch) params.set('search', debouncedSearch);
      return apiGet<PageResult<Credit>>(`/api/admin/credits?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const credits = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const columns: Column<Credit>[] = [
    {
      header: m['admin.credits.transaction_no'](),
      cell: (c) => <span className="font-mono text-xs">{c.transactionNo}</span>,
    },
    {
      header: m['admin.credits.user'](),
      cell: (c) => <span className="text-sm">{c.userEmail || c.userId}</span>,
    },
    {
      header: m['admin.credits.amount'](),
      cell: (c) => (
        <span
          className={cn(
            'font-medium',
            c.credits > 0 ? 'text-green-600' : 'text-red-500'
          )}
        >
          {c.credits > 0 ? `+${c.credits}` : c.credits}
        </span>
      ),
    },
    {
      header: m['admin.credits.remaining'](),
      cell: (c) => c.remainingCredits,
    },
    {
      header: m['admin.credits.type'](),
      cell: (c) => c.transactionType,
    },
    {
      header: m['admin.credits.scene'](),
      cell: (c) => c.transactionScene || '—',
    },
    {
      header: m['admin.credits.description'](),
      cell: (c) => (
        <span className="text-muted-foreground block max-w-[200px] truncate text-sm">
          {c.description || '—'}
        </span>
      ),
    },
    {
      header: m['admin.credits.expires_at'](),
      cell: (c) => (
        <span className="text-muted-foreground text-sm">
          {c.expiresAt ? formatDateTime(c.expiresAt) : '—'}
        </span>
      ),
    },
    {
      header: m['admin.credits.created_at'](),
      cell: (c) => (
        <span className="text-muted-foreground text-sm">
          {formatDateTime(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-7 bg-[#f4efe5] p-5 text-[#26352d] sm:p-6">
      <div className="border-b border-[#b99f80] pb-5">
        <h1 className="font-serif text-3xl leading-tight font-normal text-[#1d2a24]">
          {m['admin.credits.title']()}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#615c51]">
          {m['admin.credits.description']()}
        </p>
      </div>

      <div
        role="group"
        aria-label={m['admin.credits.title']()}
        className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#b99f80]"
      >
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            aria-pressed={tab === tb}
            onClick={() => setTab(tb)}
            className={cn(
              '-mb-px border-b px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              tab === tb
                ? 'border-[#b95c33] text-[#1d2a24]'
                : 'border-transparent text-[#615c51] hover:text-[#8c4529]'
            )}
          >
            {tDynamic(`admin.credits.tab_${tb}`)}
          </button>
        ))}
      </div>

      <Card className="rounded-[8px] border-[#c6b299] bg-[#fffaf1] shadow-[0_8px_20px_rgba(57,48,36,0.08)]">
        <CardContent className="p-4 sm:p-5">
          <DataTable
            columns={columns}
            data={credits}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(c) => c.id}
            emptyText={m['admin.credits.no_credits']()}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => query.refetch()}
            loading={query.isFetching}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/admin/credits')({
  component: CreditsPage,
});
