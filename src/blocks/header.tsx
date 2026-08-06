'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';

const NAVIGATION = [
  { href: '/#features', label: 'Features' },
  { href: '/#tutorial', label: 'Tutorial' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/compatibility', label: 'Compatibility' },
  { href: '/#technology', label: 'Technology' },
  { href: '/#faq', label: 'FAQ' },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-t-2 border-b border-t-[#b95c33] border-b-[#9b6a42] bg-[#f4efe5] text-[#1d2a24]">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
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

        <nav
          className="hidden h-full items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          {NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative inline-flex h-full items-center text-sm font-medium text-[#6f675d] transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#b95c33] after:transition-transform after:duration-200 hover:text-[#b95c33] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-11 place-items-center rounded-sm border border-[#9b6a42] bg-[#e7dcc9] text-[#1d2a24] transition-colors hover:bg-[#d9c9af] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="mx-4 border border-t-2 border-[#9b6a42] border-t-[#b95c33] bg-[#f4efe5] p-2 text-[#1d2a24] shadow-[0_18px_36px_rgba(29,42,36,0.18)] md:hidden"
          aria-label="Mobile navigation"
        >
          {NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center rounded-sm px-3 py-3 text-sm font-medium text-[#6f675d] transition-colors hover:bg-[#e7dcc9] hover:text-[#b95c33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95c33]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
