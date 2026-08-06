'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import { localizeHref } from '@/paraglide/runtime.js';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export interface NavSubItem {
  href: string;
  label: string;
  newTab?: boolean;
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
  newTab?: boolean;
  /** Sub-items render as a collapsible group under this item. */
  items?: NavSubItem[];
}

const sidebarMenuButtonClassName =
  'rounded-md border border-transparent px-2.5 text-[#d5d5ca] transition-[background-color,border-color,color,transform] hover:bg-[#33433a] hover:text-[#fff7eb] focus-visible:ring-[#d87850] data-active:border-[#d87850] data-active:bg-[#a95230] data-active:text-[#fff7eb] data-active:shadow-[inset_0_1px_0_rgba(255,247,235,0.18)] active:translate-y-px';

const sidebarSubMenuButtonClassName =
  'rounded-md border border-transparent px-2 text-[#c8c8bd] hover:bg-[#33433a] hover:text-[#fff7eb] focus-visible:ring-[#d87850] data-active:border-[#d87850] data-active:bg-[#3d5045] data-active:text-[#fff7eb]';

function readSidebarOpenItems(storageKey: string): string[] | null {
  try {
    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) return null;

    const parsedValue: unknown = JSON.parse(storedValue);
    if (
      !Array.isArray(parsedValue) ||
      parsedValue.some((item) => typeof item !== 'string')
    ) {
      throw new TypeError(
        `Expected an array of sidebar paths, received ${JSON.stringify(parsedValue)}`
      );
    }
    return parsedValue;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`Could not read sidebar state "${storageKey}": ${reason}`);
    return null;
  }
}

function writeSidebarOpenItems(storageKey: string, openItems: Set<string>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...openItems]));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`Could not persist sidebar state "${storageKey}": ${reason}`);
  }
}

export function AppSidebar({
  brand,
  brandHref = '/',
  navItems,
  footerNavItems,
  footer,
}: {
  brand: React.ReactNode;
  brandHref?: string;
  navItems: NavItem[];
  footerNavItems?: NavItem[];
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();

  // Group nav items by their (static) group label.
  const groups: { label?: string; items: NavItem[] }[] = [];
  let currentGroup: string | undefined = '__initial__';
  for (const item of navItems) {
    if (item.group !== currentGroup) {
      groups.push({ label: item.group, items: [item] });
      currentGroup = item.group;
    } else {
      groups[groups.length - 1].items.push(item);
    }
  }

  // The first nav item (dashboard root, e.g. /admin) matches exactly; everything
  // else matches by path prefix so sub-routes light up their entry.
  const isActiveHref = (href: string) =>
    href === navItems[0]?.href
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  // Hrefs of parent items whose sub-items contain the current route.
  const activeParents = () => {
    const set = new Set<string>();
    for (const item of navItems) {
      if (item.items?.some((sub) => isActiveHref(sub.href))) set.add(item.href);
    }
    return set;
  };

  // Which collapsible parents are open. Seeded with the active parent (SSR-safe,
  // derived from the path), then merged with the persisted set after mount.
  const storageKey = `sidebar-open:${brandHref}`;
  const [openItems, setOpenItems] = useState<Set<string>>(activeParents);

  useEffect(() => {
    const saved = readSidebarOpenItems(storageKey);
    setOpenItems(() => {
      const next = saved ? new Set(saved) : new Set<string>();
      for (const href of activeParents()) next.add(href);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Keep the active parent open as the route changes, without touching others.
  useEffect(() => {
    setOpenItems((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const href of activeParents()) {
        if (!next.has(href)) {
          next.add(href);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleItem(href: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      writeSidebarOpenItems(storageKey, next);
      return next;
    });
  }

  return (
    <Sidebar variant="inset">
      <div className="flex size-full min-h-0 flex-col bg-[#1d2a24] [--foreground:#f4eee4] [--muted-foreground:#b9b8ab] [--sidebar-accent-foreground:#fff7eb] [--sidebar-accent:#33433a] [--sidebar-border:#526057] [--sidebar-foreground:#f4eee4] [--sidebar-primary-foreground:#fff7eb] [--sidebar-primary:#a95230] [--sidebar-ring:#d87850] [--sidebar:#1d2a24]">
        <SidebarHeader className="border-b border-[#526057] px-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href={brandHref}
                className="group flex w-full items-center gap-3 rounded-md border border-transparent px-2.5 py-2 text-left transition-[background-color,border-color] hover:border-[#635849] hover:bg-[#27352f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d87850]"
              >
                <span className="min-w-0 flex-1">{brand}</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-1 py-2">
          {groups.map((group, gi) => (
            <SidebarGroup key={gi} className="px-2 py-1.5">
              {group.label && (
                <SidebarGroupLabel className="h-7 px-2.5 text-[11px] font-semibold text-[#b9b8ab]">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent className="flex flex-col gap-1">
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    // Collapsible parent with sub-items.
                    if (item.items?.length) {
                      const open = openItems.has(item.href);
                      const childActive = item.items.some((sub) =>
                        isActiveHref(sub.href)
                      );
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={childActive}
                            aria-expanded={open}
                            className={sidebarMenuButtonClassName}
                            onClick={() => toggleItem(item.href)}
                          >
                            <Icon className="text-[#c8bba7]" />
                            <span>{item.label}</span>
                            <ChevronRight
                              className={`ml-auto size-4 shrink-0 text-[#b9b8ab] transition-transform ${
                                open ? 'rotate-90' : ''
                              }`}
                            />
                          </SidebarMenuButton>
                          {open && (
                            <SidebarMenuSub className="mx-4 border-[#526057] px-2 py-1">
                              {item.items.map((sub) => (
                                <SidebarMenuSubItem key={sub.href}>
                                  <SidebarMenuSubButton
                                    render={<Link href={sub.href} />}
                                    isActive={isActiveHref(sub.href)}
                                    className={sidebarSubMenuButtonClassName}
                                  >
                                    <span>{sub.label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      );
                    }

                    // Plain link.
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          tooltip={item.label}
                          isActive={isActiveHref(item.href)}
                          className={sidebarMenuButtonClassName}
                        >
                          <Icon className="text-[#c8bba7]" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-[#526057] px-3 py-3">
          {footerNavItems && footerNavItems.length > 0 && (
            <SidebarMenu className="gap-1">
              {footerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.newTab
                  ? false
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={
                        item.newTab ? (
                          <a
                            href={localizeHref(item.href)}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ) : (
                          <Link href={item.href} />
                        )
                      }
                      tooltip={item.label}
                      isActive={isActive}
                      className={sidebarMenuButtonClassName}
                    >
                      <Icon className="text-[#c8bba7]" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          )}
          {footer}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
