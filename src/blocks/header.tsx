'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { envConfigs } from '@/config';

const NAVIGATION = [
  { href: '#features', label: 'Features' },
  { href: '#tutorial', label: 'Tutorial' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '#technology', label: 'Technology' },
  { href: '#faq', label: 'FAQ' },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 text-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center">
          <img
            src="/images/gesture-synth-logo.png"
            alt={`${envConfigs.app_name} logo`}
            width={512}
            height={512}
            className="size-10 object-contain sm:size-11"
          />
        </a>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {NAVIGATION.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-full border border-white/30 bg-black/10 backdrop-blur md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="mx-4 rounded-md border border-white/20 bg-[#071725]/96 p-3 shadow-2xl backdrop-blur md:hidden"
          aria-label="Mobile navigation"
        >
          {NAVIGATION.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded px-3 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
