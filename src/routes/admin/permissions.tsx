import { useEffect, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  apiDelete,
  ApiError,
  apiGet,
  apiPost,
  apiPut,
  type PageResult,
} from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Permission {
  id: string;
  code: string;
  resource: string;
  action: string;
  title: string;
}

const PAGE_SIZE = 20;

const emptyForm = { code: '', resource: '', action: '', title: '' };

function PermissionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Edit
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  // Delete
  const [deletingPerm, setDeletingPerm] = useState<Permission | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    queryKey: ['admin-permissions', page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      return apiGet<PageResult<Permission>>(`/api/admin/permissions?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const permissions = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });

  const createMutation = useMutation({
    mutationFn: (values: typeof emptyForm) =>
      apiPost('/api/admin/permissions', values),
    onSuccess: () => {
      toast.success(m['admin.permissions.created']());
      setCreateOpen(false);
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed');
    },
  });

  const editMutation = useMutation({
    mutationFn: (payload: { id: string } & typeof emptyForm) =>
      apiPut('/api/admin/permissions', payload),
    onSuccess: () => {
      toast.success(m['admin.permissions.updated']());
      setEditingPerm(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/permissions?id=${id}`),
    onSuccess: () => {
      toast.success(m['admin.permissions.deleted']());
      setDeletingPerm(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed');
    },
  });

  const saving = createMutation.isPending || editMutation.isPending;

  function handleCreate() {
    if (
      !form.code.trim() ||
      !form.resource.trim() ||
      !form.action.trim() ||
      !form.title.trim()
    )
      return;
    createMutation.mutate(form);
  }

  function openEdit(p: Permission) {
    setEditForm({
      code: p.code,
      resource: p.resource,
      action: p.action,
      title: p.title,
    });
    setEditingPerm(p);
  }

  function handleEdit() {
    if (!editingPerm || !editForm.code.trim() || !editForm.title.trim()) return;
    editMutation.mutate({ id: editingPerm.id, ...editForm });
  }

  function handleDelete() {
    if (!deletingPerm) return;
    deleteMutation.mutate(deletingPerm.id);
  }

  const columns: Column<Permission>[] = [
    {
      header: m['admin.permissions.code_col'](),
      cell: (p) => <span className="font-mono text-sm">{p.code}</span>,
    },
    {
      header: m['admin.permissions.resource_col'](),
      cell: (p) => <span className="font-medium">{p.resource}</span>,
    },
    {
      header: m['admin.permissions.action_col'](),
      cell: (p) => p.action,
    },
    {
      header: m['admin.permissions.title_col'](),
      cell: (p) => <span className="text-muted-foreground">{p.title}</span>,
    },
    {
      header: m['admin.permissions.actions_col'](),
      className: 'w-[80px]',
      cell: (p) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => openEdit(p)}
            aria-label={m['admin.permissions.edit_title']()}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setDeletingPerm(p)}
            aria-label={m['admin.permissions.delete_title']()}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  function renderFormFields(
    values: typeof emptyForm,
    onChange: (v: typeof emptyForm) => void
  ) {
    return (
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="permission-code">
            {m['admin.permissions.code_field']()}
          </Label>
          <Input
            id="permission-code"
            value={values.code}
            onChange={(e) => onChange({ ...values, code: e.target.value })}
            placeholder={m['admin.permissions.code_placeholder']()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="permission-resource">
            {m['admin.permissions.resource_field']()}
          </Label>
          <Input
            id="permission-resource"
            value={values.resource}
            onChange={(e) => onChange({ ...values, resource: e.target.value })}
            placeholder={m['admin.permissions.resource_placeholder']()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="permission-action">
            {m['admin.permissions.action_field']()}
          </Label>
          <Input
            id="permission-action"
            value={values.action}
            onChange={(e) => onChange({ ...values, action: e.target.value })}
            placeholder={m['admin.permissions.action_placeholder']()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="permission-title">
            {m['admin.permissions.title_field']()}
          </Label>
          <Input
            id="permission-title"
            value={values.title}
            onChange={(e) => onChange({ ...values, title: e.target.value })}
            placeholder={m['admin.permissions.title_placeholder']()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 bg-[#f4efe5] p-5 text-[#26352d] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#b99f80] pb-5">
        <div>
          <h1 className="font-serif text-3xl leading-tight font-normal text-[#1d2a24]">
            {m['admin.permissions.title']()}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#615c51]">
            {m['admin.permissions.description']()}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#b95c33] px-3.5 text-sm font-semibold text-[#fff7eb] shadow-[0_3px_10px_rgba(57,48,36,0.14)] transition-colors hover:bg-[#9d4928] focus-visible:ring-2 focus-visible:ring-[#b95c33]/35 focus-visible:outline-none">
            <Plus className="size-4" />
            {m['admin.permissions.create_permission']()}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{m['admin.permissions.create_title']()}</DialogTitle>
              <DialogDescription>
                {m['admin.permissions.create_description']()}
              </DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              {renderFormFields(form, setForm)}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  {m['admin.permissions.cancel']()}
                </Button>
                <Button type="submit" disabled={saving}>
                  {m['admin.permissions.save']()}
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
            data={permissions}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(p) => p.id}
            emptyText={m['admin.permissions.no_permissions']()}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => query.refetch()}
            loading={query.isFetching}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPerm}
        onOpenChange={(v) => !v && setEditingPerm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['admin.permissions.edit_title']()}</DialogTitle>
            <DialogDescription>
              {m['admin.permissions.edit_description']()}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
          >
            {renderFormFields(editForm, setEditForm)}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPerm(null)}
              >
                {m['admin.permissions.cancel']()}
              </Button>
              <Button type="submit" disabled={saving}>
                {m['admin.permissions.save']()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deletingPerm}
        onOpenChange={(v) => !v && setDeletingPerm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['admin.permissions.delete_title']()}</DialogTitle>
            <DialogDescription>
              {m['admin.permissions.delete_confirm']()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPerm(null)}>
              {m['admin.permissions.cancel']()}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {m['admin.permissions.confirm_delete']()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/permissions')({
  component: PermissionsPage,
});
