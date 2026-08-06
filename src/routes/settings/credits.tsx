import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { tDynamic } from '@/core/i18n/dynamic';
import { apiGet, type PageResult } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CreditRow = {
  id: string;
  transactionNo: string;
  transactionType: string;
  transactionScene?: string | null;
  credits: number;
  remainingCredits: number;
  description?: string | null;
  status: string;
  expiresAt?: string | null;
  createdAt: string;
};

const TABS = ['all', 'grant', 'consume'] as const;
type Tab = (typeof TABS)[number];

const PAGE_SIZE = 20;

function CreditsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const balanceQuery = useQuery({
    queryKey: ['user-credits', 'balance'],
    queryFn: () => apiGet<{ balance: number }>('/api/credits'),
  });
  const balance = balanceQuery.data?.balance ?? null;
  const balanceLoaded = !balanceQuery.isPending;

  const query = useQuery({
    queryKey: ['user-credits', page, tab, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (tab !== 'all') params.set('transactionType', tab);
      if (debouncedSearch) params.set('search', debouncedSearch);
      return apiGet<PageResult<CreditRow>>(`/api/user/credits?${params}`);
    },
    placeholderData: keepPreviousData,
  });
  const rows = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const columns: Column<CreditRow>[] = [
    {
      header: m['settings.credits.transaction_no'](),
      cell: (r) => <span className="font-mono text-xs">{r.transactionNo}</span>,
    },
    {
      header: m['settings.credits.description_col'](),
      cell: (r) => <span>{r.description || '—'}</span>,
    },
    {
      header: m['settings.credits.type'](),
      cell: (r) => (
        <Badge
          variant={r.transactionType === 'consume' ? 'secondary' : 'default'}
        >
          {r.transactionType}
        </Badge>
      ),
    },
    {
      header: m['settings.credits.scene'](),
      cell: (r) => r.transactionScene || '—',
    },
    {
      header: m['settings.credits.credits'](),
      className: 'text-right',
      cell: (r) => (
        <span
          className={cn(
            'font-medium tabular-nums',
            r.transactionType === 'consume' && 'text-muted-foreground'
          )}
        >
          {r.credits > 0 ? `+${r.credits}` : r.credits}
        </span>
      ),
    },
    {
      header: m['settings.credits.remaining'](),
      className: 'text-right',
      cell: (r) => (
        <span className="text-muted-foreground text-sm tabular-nums">
          {r.remainingCredits}
        </span>
      ),
    },
    {
      header: m['settings.credits.expires_at'](),
      cell: (r) => (
        <span className="text-muted-foreground text-sm">
          {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: m['settings.credits.date'](),
      cell: (r) => (
        <span className="text-muted-foreground text-sm">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="studio-page">
      <div className="studio-page-header">
        <div>
          <h1 className="studio-page-title">{m['settings.credits.title']()}</h1>
          <p className="studio-page-description">
            {m['settings.credits.description']()}
          </p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{m['settings.credits.balance']()}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {balanceLoaded ? (balance ?? 0) : '…'}
          </p>
        </CardContent>
      </Card>

      <div className="studio-page-tabs">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            aria-pressed={tab === tb}
            data-active={tab === tb}
            onClick={() => setTab(tb)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              tab === tb
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {tDynamic(`settings.credits.tab_${tb}`)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        emptyText={m['settings.credits.no_records']()}
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => query.refetch()}
        loading={query.isFetching}
      />
    </div>
  );
}

export const Route = createFileRoute('/settings/credits')({
  component: CreditsPage,
});
