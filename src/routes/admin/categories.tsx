import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  pageQuery,
  type PageResult,
} from '@/lib/api-client';
import { formatDateTime } from '@/lib/time';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { TextField } from '@/components/form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

const categorySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
});
type CategoryForm = z.infer<typeof categorySchema>;
const emptyForm: CategoryForm = { slug: '', title: '', description: '' };

function CategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const listQuery = useQuery({
    queryKey: ['admin-categories', page, debouncedSearch],
    queryFn: () =>
      apiGet<PageResult<Category>>(
        pageQuery('/api/admin/categories', {
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch,
        })
      ),
    placeholderData: keepPreviousData,
  });

  const createForm = useForm({
    defaultValues: emptyForm,
    validators: { onSubmit: categorySchema },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
    },
  });

  const editForm = useForm({
    defaultValues: emptyForm,
    validators: { onSubmit: categorySchema },
    onSubmit: async ({ value }) => {
      if (!editingCat) return;
      await editMutation.mutateAsync({ id: editingCat.id, ...value });
    },
  });

  function openEdit(c: Category) {
    editForm.reset({
      slug: c.slug,
      title: c.title,
      description: c.description || '',
    });
    setEditingCat(c);
  }

  const createMutation = useMutation({
    mutationFn: (value: CategoryForm) =>
      apiPost('/api/admin/categories', value),
    onSuccess: () => {
      toast.success(m['admin.categories.created']());
      setCreateOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMutation = useMutation({
    mutationFn: (value: CategoryForm & { id: string }) =>
      apiPut('/api/admin/categories', value),
    onSuccess: () => {
      toast.success(m['admin.categories.updated']());
      setEditingCat(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/categories?id=${id}`),
    onSuccess: () => {
      toast.success(m['admin.categories.deleted']());
      setDeletingCat(null);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: Column<Category>[] = [
    {
      header: m['admin.categories.slug_col'](),
      cell: (c) => <span className="font-mono text-sm">{c.slug}</span>,
    },
    {
      header: m['admin.categories.title_col'](),
      cell: (c) => <span className="font-medium">{c.title}</span>,
    },
    {
      header: m['admin.categories.description_col'](),
      cell: (c) => (
        <span className="text-muted-foreground block max-w-[200px] truncate text-sm">
          {c.description || '—'}
        </span>
      ),
    },
    {
      header: m['admin.categories.status_col'](),
      cell: (c) => (
        <Badge variant={c.status === 'published' ? 'default' : 'secondary'}>
          {c.status}
        </Badge>
      ),
    },
    {
      header: m['admin.categories.created_at'](),
      cell: (c) => (
        <span className="text-muted-foreground text-sm">
          {formatDateTime(c.createdAt)}
        </span>
      ),
    },
    {
      header: m['admin.categories.actions_col'](),
      className: 'w-[80px]',
      cell: (c) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => openEdit(c)}
            aria-label={m['admin.categories.edit_title']()}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setDeletingCat(c)}
            aria-label={m['admin.categories.delete_title']()}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-7 bg-[#f4efe5] p-5 text-[#26352d] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#b99f80] pb-5">
        <div>
          <h1 className="font-serif text-3xl leading-tight font-normal text-[#1d2a24]">
            {m['admin.categories.title']()}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#615c51]">
            {m['admin.categories.description']()}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#b95c33] px-3.5 text-sm font-semibold text-[#fff7eb] shadow-[0_3px_10px_rgba(57,48,36,0.14)] transition-colors hover:bg-[#9d4928] focus-visible:ring-2 focus-visible:ring-[#b95c33]/35 focus-visible:outline-none">
            <Plus className="size-4" />
            {m['admin.categories.create']()}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{m['admin.categories.create_title']()}</DialogTitle>
              <DialogDescription>
                {m['admin.categories.create_description']()}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                createForm.handleSubmit();
              }}
            >
              <div className="space-y-4 py-4">
                <createForm.Field name="slug">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['admin.categories.slug_field']()}
                      placeholder={m['admin.categories.slug_placeholder']()}
                    />
                  )}
                </createForm.Field>
                <createForm.Field name="title">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['admin.categories.title_field']()}
                      placeholder={m['admin.categories.title_placeholder']()}
                    />
                  )}
                </createForm.Field>
                <createForm.Field name="description">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['admin.categories.description_field']()}
                      placeholder={m[
                        'admin.categories.description_placeholder'
                      ]()}
                    />
                  )}
                </createForm.Field>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  {m['admin.categories.cancel']()}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {m['admin.categories.save']()}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[8px] border-[#c6b299] bg-[#fffaf1] shadow-[0_8px_20px_rgba(57,48,36,0.08)]">
        <CardContent className="p-4 sm:p-5">
          <DataTable
            columns={columns}
            data={listQuery.data?.items ?? []}
            total={listQuery.data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(c) => c.id}
            emptyText={m['admin.categories.no_data']()}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => listQuery.refetch()}
            loading={listQuery.isFetching}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!editingCat}
        onOpenChange={(v) => !v && setEditingCat(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['admin.categories.edit_title']()}</DialogTitle>
            <DialogDescription>
              {m['admin.categories.edit_description']()}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editForm.handleSubmit();
            }}
          >
            <div className="space-y-4 py-4">
              <editForm.Field name="slug">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.categories.slug_field']()}
                    placeholder={m['admin.categories.slug_placeholder']()}
                  />
                )}
              </editForm.Field>
              <editForm.Field name="title">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.categories.title_field']()}
                    placeholder={m['admin.categories.title_placeholder']()}
                  />
                )}
              </editForm.Field>
              <editForm.Field name="description">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.categories.description_field']()}
                    placeholder={m[
                      'admin.categories.description_placeholder'
                    ]()}
                  />
                )}
              </editForm.Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCat(null)}
              >
                {m['admin.categories.cancel']()}
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {m['admin.categories.save']()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingCat}
        onOpenChange={(v) => !v && setDeletingCat(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['admin.categories.delete_title']()}</DialogTitle>
            <DialogDescription>
              {m['admin.categories.delete_confirm']()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCat(null)}>
              {m['admin.categories.cancel']()}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deletingCat && deleteMutation.mutate(deletingCat.id)
              }
            >
              {m['admin.categories.confirm_delete']()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/categories')({
  component: CategoriesPage,
});
