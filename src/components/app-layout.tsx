'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/core/auth/client';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { useUserPermissions } from '@/hooks/use-user-permissions';
import { AppSidebar, type NavItem } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserMenu } from '@/components/user-menu';

const studioWorkspaceClassName =
  '!bg-[#e7dcc9] [--radius:0.5rem] [--background:#f4efe5] [--foreground:#26352d] [--card:#fbf7ef] [--card-foreground:#26352d] [--popover:#fbf7ef] [--popover-foreground:#26352d] [--primary:#a95230] [--primary-foreground:#fff7eb] [--secondary:#e7dcc9] [--secondary-foreground:#26352d] [--muted:#ebe2d4] [--muted-foreground:#615c51] [--accent:#e3d3be] [--accent-foreground:#26352d] [--border:#c6b299] [--input:#c6b299] [--ring:#a95230] [--sidebar:#1d2a24] [--sidebar-foreground:#f4eee4] [--sidebar-primary:#a95230] [--sidebar-primary-foreground:#fff7eb] [--sidebar-accent:#33433a] [--sidebar-accent-foreground:#fff7eb] [--sidebar-border:#526057] [--sidebar-ring:#d87850] dark:!bg-[#151d19] dark:[--background:#18211d] dark:[--foreground:#f4eee4] dark:[--card:#202b25] dark:[--card-foreground:#f4eee4] dark:[--popover:#26322c] dark:[--popover-foreground:#f4eee4] dark:[--primary:#d87850] dark:[--primary-foreground:#1d2a24] dark:[--secondary:#2b3831] dark:[--secondary-foreground:#f4eee4] dark:[--muted:#26322c] dark:[--muted-foreground:#c8c1b5] dark:[--accent:#33433a] dark:[--accent-foreground:#f4eee4] dark:[--border:#46534b] dark:[--input:#46534b] dark:[--ring:#d87850]';

export function AppLayout({
  children,
  navItems,
  footerNavItems,
  brand,
  brandHref = '/',
  mobileBrand,
  headerExtra,
  profileHref,
  requirePermission,
  unauthorizedRedirect = '/settings',
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  footerNavItems?: NavItem[];
  brand: React.ReactNode;
  brandHref?: string;
  mobileBrand?: React.ReactNode;
  headerExtra?: React.ReactNode;
  profileHref?: string;
  requirePermission?: string;
  unauthorizedRedirect?: string;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  // Guard against a double redirect: useLocation() flips to "/sign-in" the moment
  // we navigate (while this layout is still mounted), which would otherwise re-fire
  // the effect and overwrite callbackUrl with the sign-in path itself.
  const redirectingRef = useRef(false);

  // Invite-only gate: needs the user's membership status (also covers social
  // logins). `needsInvite` is computed server-side in /api/user/info.
  const userInfoQuery = useQuery({
    queryKey: ['user-info'],
    queryFn: () => apiGet<{ needsInvite?: boolean }>('/api/user/info'),
    staleTime: 60_000,
    enabled: !!session?.user,
  });
  const needsInvite = userInfoQuery.data?.needsInvite === true;
  const membershipResolved = !session?.user || userInfoQuery.isSuccess;

  // Only query permissions once we have a session and a permission gate.
  const permissionsEnabled = !!session?.user && !!requirePermission;
  const permissionsQuery = useUserPermissions(permissionsEnabled);
  const isAdmin = permissionsQuery.data?.isAdmin === true;

  // Authorization resolution mirrors the original imperative flow:
  // - no permission gate → authorized once a session exists + membership ok
  // - permission gate → authorized only when the query resolves with isAdmin
  const authorized =
    !!session?.user &&
    membershipResolved &&
    !needsInvite &&
    (!requirePermission || isAdmin);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      // Remember where the user was headed so sign-in can send them back.
      // pathname is already locale-free; append the live query string.
      const search =
        typeof window !== 'undefined' ? window.location.search : '';
      const callbackUrl = `${pathname}${search}`;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    // Invite-only gate: wait for membership status, then bounce unredeemed
    // (incl. social) users to the redeem page. Admins are exempt server-side.
    if (userInfoQuery.isPending) return;
    if (needsInvite) {
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.push('/redeem-invite');
      }
      return;
    }

    if (!requirePermission) return;

    // Wait for the permissions query to resolve before deciding.
    if (permissionsQuery.isPending) return;

    if (permissionsQuery.isError || !isAdmin) {
      router.push(unauthorizedRedirect);
    }
  }, [
    isPending,
    session,
    router,
    pathname,
    requirePermission,
    unauthorizedRedirect,
    userInfoQuery.isPending,
    needsInvite,
    permissionsQuery.isPending,
    permissionsQuery.isError,
    isAdmin,
  ]);

  if (userInfoQuery.isError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4efe5] px-5 text-[#26352d] dark:bg-[#18211d] dark:text-[#f4eee4]">
        <div
          className="flex max-w-md flex-col items-center gap-4 text-center"
          role="alert"
        >
          <p className="font-serif text-xl">{m['common.error.title']()}</p>
          <p className="text-sm leading-6 text-[#615c51] dark:text-[#c8c1b5]">
            {m['common.error.message']()}
          </p>
          <button
            type="button"
            onClick={() => void userInfoQuery.refetch()}
            className="min-h-11 rounded-md bg-[#a95230] px-5 py-2.5 text-sm font-semibold text-[#fff7eb] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#913f24] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] active:translate-y-0"
          >
            {m['common.error.retry']()}
          </button>
        </div>
      </div>
    );
  }

  if (isPending || !authorized || !session?.user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4efe5] text-[#26352d] dark:bg-[#18211d] dark:text-[#f4eee4]">
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="size-6 animate-spin rounded-full border-2 border-[#a95230] border-t-transparent" />
          <span className="text-sm text-[#615c51] dark:text-[#c8c1b5]">
            {m['admin.loading']()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      className={`${studioWorkspaceClassName} music-room-workspace`}
    >
      <AppSidebar
        brand={brand}
        brandHref={brandHref}
        navItems={navItems}
        footerNavItems={footerNavItems}
        footer={
          <UserMenu
            name={session.user.name || 'User'}
            email={session.user.email}
            image={session.user.image}
            profileHref={profileHref}
          />
        }
      />
      {/* min-w-0: let the inset shrink below its content's min-content width —
          otherwise wide tables stretch the page and force horizontal scroll
          instead of scrolling inside their own overflow-x-auto wrappers */}
      <SidebarInset className="min-w-0 border-[#c6b299] bg-[#f4efe5] shadow-[0_12px_30px_rgba(57,48,36,0.12)] md:rounded-[8px] md:border dark:border-[#3d4942] dark:bg-[#18211d] dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#c6b299] bg-[#f8f2e9] px-3 sm:px-4 dark:border-[#3d4942] dark:bg-[#1f2924]">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="size-9 rounded-md border border-[#c6b299] bg-[#e7dcc9] text-[#26352d] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#ddceb9] hover:text-[#26352d] focus-visible:ring-[#a95230] active:translate-y-0 dark:border-[#526057] dark:bg-[#2b3831] dark:text-[#f4eee4] dark:hover:bg-[#38483f] dark:hover:text-[#fff7eb]" />
            {mobileBrand && (
              <div className="min-w-0 md:hidden">{mobileBrand}</div>
            )}
          </div>
          <div className="flex-1" />
          {headerExtra && (
            <div className="flex items-center gap-1">{headerExtra}</div>
          )}
        </header>
        <div className="flex-1 overflow-auto bg-[#f4efe5] dark:bg-[#18211d]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
