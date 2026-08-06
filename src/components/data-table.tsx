import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  emptyText?: string;
  rowKey: (row: T) => string;
  onRefresh?: () => void | Promise<unknown>;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder,
  toolbar,
  emptyText,
  rowKey,
  onRefresh,
  loading,
}: DataTableProps<T>) {
  const [refreshing, setRefreshing] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Adapt the simple Column<T> shape to react-table column defs. Server-side
  // pagination stays fully controlled by the page/total props.
  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col, i) => ({
        id: String(i),
        header: () => col.header,
        cell: ({ row }) => col.cell(row.original),
        meta: { className: col.className },
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    getRowId: (row) => rowKey(row),
  });

  async function handleRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  const showHeader = onSearchChange || toolbar || onRefresh;
  const busy = refreshing || loading;

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex flex-wrap items-center gap-2">
          {onSearchChange && (
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#786b5b] dark:text-[#c8c1b5]" />
              <Input
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={
                  searchPlaceholder || m['common.search.placeholder']()
                }
                placeholder={
                  searchPlaceholder || m['common.search.placeholder']()
                }
                className="h-9 rounded-[6px] border-[#c6b299] bg-[#fffaf1] pl-9 text-[#26352d] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] placeholder:text-[#827564] hover:border-[#a99176] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 disabled:bg-[#eee4d7] dark:border-[#46534b] dark:bg-[#202b25] dark:text-[#f4eee4] dark:placeholder:text-[#a9a59a] dark:hover:border-[#617168] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:bg-[#26322c]"
              />
            </div>
          )}
          {toolbar}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              className="ml-auto size-9 rounded-[6px] border-[#c6b299] bg-[#f8f2e9] text-[#5e493b] shadow-[0_1px_2px_rgba(57,48,36,0.08)] hover:-translate-y-px hover:border-[#a99176] hover:bg-[#e7dcc9] hover:text-[#26352d] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 active:translate-y-0 disabled:bg-[#eee4d7] disabled:text-[#9a8d7c] dark:border-[#46534b] dark:bg-[#26322c] dark:text-[#d6cbbd] dark:hover:border-[#617168] dark:hover:bg-[#33433a] dark:hover:text-[#fff7eb] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:bg-[#202b25] dark:disabled:text-[#787d75]"
              onClick={handleRefresh}
              disabled={busy}
              aria-label={m['common.table.refresh']()}
            >
              <RefreshCw className={cn('size-4', busy && 'animate-spin')} />
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-[6px] border border-[#c6b299] bg-[#fffaf1] shadow-[0_2px_7px_rgba(57,48,36,0.07)] dark:border-[#46534b] dark:bg-[#202b25] dark:shadow-[0_2px_8px_rgba(0,0,0,0.16)]">
        <Table className="min-w-full text-[#26352d] dark:text-[#f4eee4]">
          <TableHeader className="bg-[#e9ddca] dark:bg-[#2b3831]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-[#c6b299] hover:bg-[#e9ddca] dark:border-[#46534b] dark:hover:bg-[#2b3831]"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-10 px-4 text-xs font-semibold text-[#5e493b] dark:text-[#d6cbbd]',
                      (header.column.columnDef.meta as { className?: string })
                        ?.className
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow className="border-[#c6b299] hover:bg-transparent dark:border-[#46534b]">
                <TableCell
                  colSpan={columns.length}
                  className="py-9 text-center text-sm text-[#786b5b] dark:text-[#c8c1b5]"
                >
                  {emptyText || m['common.table.no_data']()}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-[#d8cab6] text-[#26352d] hover:bg-[#f4ecdf] dark:border-[#3d4942] dark:text-[#f4eee4] dark:hover:bg-[#29362f]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'px-4 py-3',
                        (cell.column.columnDef.meta as { className?: string })
                          ?.className
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#c6b299] px-1 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-[#46534b]">
        <p className="text-xs font-medium text-[#786b5b] dark:text-[#c8c1b5]">
          {m['common.table.total']({ count: total })}
        </p>
        {total > pageSize && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[6px] border-[#c6b299] bg-[#f8f2e9] text-[#5e493b] hover:border-[#a99176] hover:bg-[#e7dcc9] hover:text-[#26352d] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 disabled:bg-[#eee4d7] disabled:text-[#9a8d7c] dark:border-[#46534b] dark:bg-[#26322c] dark:text-[#d6cbbd] dark:hover:border-[#617168] dark:hover:bg-[#33433a] dark:hover:text-[#fff7eb] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:bg-[#202b25] dark:disabled:text-[#787d75]"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              {m['common.table.previous']()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-[6px] border-[#c6b299] bg-[#f8f2e9] text-[#5e493b] hover:border-[#a99176] hover:bg-[#e7dcc9] hover:text-[#26352d] focus-visible:border-[#b95c33] focus-visible:ring-[#b95c33]/25 disabled:bg-[#eee4d7] disabled:text-[#9a8d7c] dark:border-[#46534b] dark:bg-[#26322c] dark:text-[#d6cbbd] dark:hover:border-[#617168] dark:hover:bg-[#33433a] dark:hover:text-[#fff7eb] dark:focus-visible:border-[#d87850] dark:focus-visible:ring-[#d87850]/25 dark:disabled:bg-[#202b25] dark:disabled:text-[#787d75]"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              {m['common.table.next']()}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
