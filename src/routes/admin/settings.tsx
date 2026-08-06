import { useEffect, useState, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, FlaskConical, Minus, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

import { tDynamic } from '@/core/i18n/dynamic';
import {
  getSettingGroups,
  getSettings,
  getSettingTabs,
  type Setting,
} from '@/modules/config/settings';
import { getTestSpec } from '@/modules/config/settings-test-specs';
import { apiGet, apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { SettingsTestDialog } from '@/components/admin/settings-test-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

function AdminSettingsPage() {
  const placeholders: Record<string, string> = {
    creem_test_amount: m['admin.settings.placeholders.creem_test_amount'](),
    paypal_test_amount: m['admin.settings.placeholders.paypal_test_amount'](),
    alipay_test_amount: m['admin.settings.placeholders.alipay_test_amount'](),
    wechat_test_amount: m['admin.settings.placeholders.wechat_test_amount'](),
  };
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [testingGroup, setTestingGroup] = useState<string | null>(null);
  const [customRows, setCustomRows] = useState<
    { key: string; value: string }[]
  >([]);

  function toggleCollapse(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const tabs = getSettingTabs();
  const groups = getSettingGroups();
  const settings = getSettings();

  const { data: loadedConfigs, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => apiGet<Record<string, string>>('/api/admin/config'),
  });

  useEffect(() => {
    if (loadedConfigs) setConfigs(loadedConfigs);
  }, [loadedConfigs]);

  const { data: loadedCustom } = useQuery({
    queryKey: ['admin-config-custom'],
    queryFn: () =>
      apiGet<{ key: string; value: string }[]>('/api/admin/config/custom'),
  });

  useEffect(() => {
    if (loadedCustom) setCustomRows(loadedCustom);
  }, [loadedCustom]);

  function handleChange(name: string, value: string) {
    setConfigs((prev) => ({ ...prev, [name]: value }));
  }

  function addCustomRow() {
    setCustomRows((prev) => [...prev, { key: '', value: '' }]);
  }

  function removeCustomRow(index: number) {
    setCustomRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCustomRow(
    index: number,
    field: 'key' | 'value',
    value: string
  ) {
    setCustomRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  const saveMutation = useMutation({
    mutationFn: (toSave: Record<string, string>) =>
      apiPost('/api/admin/config', toSave),
    onSuccess: () => {
      toast.success(m['admin.settings.save_success']());
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      queryClient.invalidateQueries({ queryKey: ['public-config'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || m['admin.settings.save_error']());
    },
  });

  const customSaveMutation = useMutation({
    mutationFn: (rows: { key: string; value: string }[]) =>
      apiPost('/api/admin/config/custom', { configs: rows }),
    onSuccess: () => {
      toast.success(m['admin.settings.save_success']());
      queryClient.invalidateQueries({ queryKey: ['admin-config-custom'] });
      queryClient.invalidateQueries({ queryKey: ['public-config'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || m['admin.settings.save_error']());
    },
  });

  const saving = saveMutation.isPending || customSaveMutation.isPending;

  function handleSave() {
    if (activeTab === 'custom') {
      const rows = customRows
        .map((r) => ({ key: r.key.trim(), value: r.value }))
        .filter((r) => r.key);
      customSaveMutation.mutate(rows);
      return;
    }
    const tabSettings = settings.filter((s) => s.tab === activeTab);
    const toSave: Record<string, string> = {};
    for (const s of tabSettings) {
      if (configs[s.name] !== undefined) {
        toSave[s.name] = configs[s.name];
      }
    }
    saveMutation.mutate(toSave);
  }

  const tabGroups = groups.filter((g) => g.tab === activeTab);
  const tabSettings = settings.filter((s) => s.tab === activeTab);

  function selectTabWithKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: string
  ) {
    const currentIndex = tabs.findIndex((tab) => tab.name === currentTab);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    setActiveTab(nextTab.name);
    document.getElementById(`admin-settings-tab-${nextTab.name}`)?.focus();
  }

  return (
    <div className="space-y-7 bg-[#f4efe5] p-5 text-[#26352d] sm:p-6 md:max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#b99f80] pb-5">
        <div>
          <h1 className="font-serif text-3xl leading-tight font-normal text-[#1d2a24]">
            {m['admin.settings.title']()}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#615c51]">
            {m['admin.settings.description']()}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 rounded-[6px] bg-[#b95c33] text-[#fff7eb] shadow-[0_3px_10px_rgba(57,48,36,0.14)] hover:bg-[#9d4928] focus-visible:ring-[#b95c33]/35"
        >
          <Save className="size-4" />
          {saving ? m['admin.settings.saving']() : m['admin.settings.save']()}
        </Button>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label={m['admin.settings.title']()}
        className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#b99f80]"
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            type="button"
            id={`admin-settings-tab-${tab.name}`}
            role="tab"
            aria-selected={activeTab === tab.name}
            aria-controls="admin-settings-panel"
            tabIndex={activeTab === tab.name ? 0 : -1}
            onClick={() => setActiveTab(tab.name)}
            onKeyDown={(event) => selectTabWithKeyboard(event, tab.name)}
            className={cn(
              '-mb-px border-b px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.name
                ? 'border-[#b95c33] text-[#1d2a24]'
                : 'border-transparent text-[#615c51] hover:text-[#8c4529]'
            )}
          >
            {tDynamic(`admin.settings.tabs.${tab.name}`)}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div
        id="admin-settings-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`admin-settings-tab-${activeTab}`}
      >
        {isLoading ? (
          <div className="text-muted-foreground">{m['admin.loading']()}</div>
        ) : activeTab === 'custom' ? (
          <Card className="rounded-[8px] border-[#c6b299] bg-[#fffaf1] shadow-[0_8px_20px_rgba(57,48,36,0.08)]">
            <CardHeader>
              <CardTitle>{m['admin.settings.custom.title']()}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {m['admin.settings.custom.description']()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {customRows.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  {m['admin.settings.custom.empty']()}
                </p>
              )}
              {customRows.map((row, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input
                    value={row.key}
                    onChange={(e) => updateCustomRow(i, 'key', e.target.value)}
                    placeholder={m['admin.settings.custom.key_placeholder']()}
                    aria-label={m['admin.settings.custom.key_placeholder']()}
                    className="w-1/3 shrink-0 font-mono"
                  />
                  <textarea
                    value={row.value}
                    onChange={(e) =>
                      updateCustomRow(i, 'value', e.target.value)
                    }
                    placeholder={m['admin.settings.custom.value_placeholder']()}
                    aria-label={m['admin.settings.custom.value_placeholder']()}
                    rows={1}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 max-h-48 min-h-8 flex-1 resize-y rounded-lg border bg-transparent px-2.5 py-1 text-base leading-6 transition-colors outline-none focus-visible:ring-3 md:text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeCustomRow(i)}
                    aria-label={m['admin.settings.custom.remove']()}
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCustomRow}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                {m['admin.settings.custom.add']()}
              </Button>
            </CardContent>
          </Card>
        ) : (
          tabGroups.map((group) => {
            const groupSettings = tabSettings.filter(
              (s) => s.group === group.name
            );
            if (groupSettings.length === 0) return null;

            const testSpec = getTestSpec(group.name);
            const groupPanelId = `admin-settings-group-${group.name}`;
            const groupCollapsed = collapsed.has(group.name);
            return (
              <Card
                key={group.name}
                className="rounded-[8px] border-[#c6b299] bg-[#fffaf1] shadow-[0_8px_20px_rgba(57,48,36,0.08)]"
              >
                <CardHeader className="select-none">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-md text-left focus-visible:ring-2 focus-visible:ring-[#b95c33]/35 focus-visible:outline-none"
                      aria-expanded={!groupCollapsed}
                      aria-controls={groupPanelId}
                      onClick={() => toggleCollapse(group.name)}
                    >
                      <span className="text-base leading-snug font-medium">
                        {tDynamic(`admin.settings.groups.${group.name}.title`)}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`text-muted-foreground size-5 shrink-0 transition-transform ${
                          groupCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </button>
                    {testSpec && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setTestingGroup(group.name)}
                      >
                        <FlaskConical className="size-3.5" />
                        {m['admin.settings.test.button']()}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent
                  id={groupPanelId}
                  hidden={groupCollapsed}
                  className="space-y-4"
                >
                  {groupSettings.map((setting) => (
                    <SettingField
                      key={setting.name}
                      setting={setting}
                      label={tDynamic(`admin.settings.fields.${setting.name}`)}
                      placeholder={
                        placeholders[setting.name] ?? setting.placeholder
                      }
                      value={
                        configs[setting.name] ?? setting.defaultValue ?? ''
                      }
                      onChange={(v) => handleChange(setting.name, v)}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {testingGroup && getTestSpec(testingGroup) && (
        <SettingsTestDialog
          open={!!testingGroup}
          onOpenChange={(open) => !open && setTestingGroup(null)}
          group={testingGroup}
          spec={getTestSpec(testingGroup)!}
          groupTitle={tDynamic(`admin.settings.groups.${testingGroup}.title`)}
          configOverrides={Object.fromEntries(
            settings
              .filter(
                (s) => s.group === testingGroup && configs[s.name] !== undefined
              )
              .map((s) => [s.name, configs[s.name]])
          )}
        />
      )}
    </div>
  );
}

function SettingField({
  setting,
  label,
  placeholder,
  value,
  onChange,
}: {
  setting: Setting;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (setting.type === 'switch') {
    return (
      <div className="space-y-2">
        <Label htmlFor={setting.name}>{label}</Label>
        <div>
          <Switch
            id={setting.name}
            checked={value === 'true'}
            onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
          />
        </div>
      </div>
    );
  }

  if (setting.type === 'select' && setting.options) {
    return (
      <div className="space-y-2">
        <Label htmlFor={setting.name}>{label}</Label>
        <Select value={value} onValueChange={(v) => onChange(v || '')}>
          <SelectTrigger id={setting.name}>
            <SelectValue placeholder={placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {setting.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (setting.type === 'textarea') {
    return (
      <div className="space-y-2">
        <Label htmlFor={setting.name}>{label}</Label>
        <textarea
          id={setting.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={setting.name}>{label}</Label>
      <Input
        id={setting.name}
        type={
          setting.type === 'password'
            ? 'password'
            : setting.type === 'number'
              ? 'number'
              : 'text'
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettingsPage,
});
