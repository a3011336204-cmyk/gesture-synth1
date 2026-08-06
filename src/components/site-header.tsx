'use client';

import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  /** Open in a new tab. Off-site (http) hrefs always open in a new tab. */
  external?: boolean;
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export function SiteHeader({ navLinks }: { navLinks?: NavLink[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-t-2 border-b border-t-[#b95c33] border-b-[#9b6a42] bg-[#f4efe5] text-[#26352d]">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
        >
          <span className="grid size-10 place-items-center border border-[#9b6a42] bg-[#e7dcc9] p-1 shadow-[0_10px_22px_rgba(71,48,31,0.16)] transition-transform duration-200 group-hover:-translate-y-0.5 sm:size-11">
            <img
              src="/images/gesture-synth-logo.png"
              alt={`${envConfigs.app_name} logo`}
              width={512}
              height={512}
              className="size-full object-contain"
            />
          </span>
          <span className="font-serif text-lg font-bold sm:text-xl">
            {envConfigs.app_name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden h-full items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          {navLinks?.map((link) =>
            isExternalHref(link.href) ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex h-full items-center text-sm font-medium text-[#6f675d] transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#b95c33] after:transition-transform after:duration-200 hover:text-[#b95c33] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className="relative inline-flex h-full items-center text-sm font-medium text-[#6f675d] transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#b95c33] after:transition-transform after:duration-200 hover:text-[#b95c33] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSelector />
          <ThemeToggle />
          {user ? (
            <SiteUserMenu
              name={user.name || 'User'}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link
              href="/settings"
              className={cn(
                buttonVariants(),
                'gap-1.5 rounded-[4px] border border-[#9b6a42] bg-[#a8502f] text-[#fff7eb] shadow-[0_8px_18px_rgba(71,48,31,0.14)] hover:bg-[#913f24]'
              )}
            >
              {m['common.nav.get_started']()}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="grid size-11 place-items-center rounded-sm border border-[#9b6a42] bg-[#e7dcc9] text-[#26352d] transition-colors hover:bg-[#d9c9af] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-4 border border-t-2 border-[#9b6a42] border-t-[#b95c33] bg-[#f4efe5] p-2 text-[#26352d] shadow-[0_18px_36px_rgba(29,42,36,0.18)] md:hidden">
          <nav className="flex flex-col gap-0" aria-label="Mobile navigation">
            {navLinks?.map((link) =>
              isExternalHref(link.href) ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm px-3 py-3 text-sm font-medium text-[#6f675d] transition-colors hover:bg-[#e7dcc9] hover:text-[#b95c33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95c33]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  className="rounded-sm px-3 py-3 text-sm font-medium text-[#6f675d] transition-colors hover:bg-[#e7dcc9] hover:text-[#b95c33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95c33]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-[#c6b299] pt-3">
            <LocaleSelector />
            <ThemeToggle />
            <div className="flex-1" />
            {user ? (
              <SiteUserMenu
                name={user.name || 'User'}
                email={user.email}
                image={user.image}
              />
            ) : (
              <Link
                href="/settings"
                className={cn(
                  buttonVariants(),
                  'gap-1.5 rounded-[4px] border border-[#9b6a42] bg-[#a8502f] text-[#fff7eb] hover:bg-[#913f24]'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {m['common.nav.get_started']()}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
