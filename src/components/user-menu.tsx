import {
  CheckIcon,
  EllipsisVerticalIcon,
  LanguagesIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { signOut } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { localeNames } from '@/config/locale';
import { m } from '@/paraglide/messages.js';
import {
  getLocale,
  locales,
  localizeHref,
  setLocale,
} from '@/paraglide/runtime.js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItemClassName =
  'rounded-[4px] px-2.5 py-2 text-[#26352d] transition-colors focus:bg-[#e7dcc9] focus:text-[#26352d] dark:text-[#f4eee4] dark:focus:bg-[#33433a] dark:focus:text-[#fff7eb]';

const menuSubTriggerClassName =
  'gap-2 rounded-[4px] px-2.5 py-2 text-[#26352d] transition-colors focus:bg-[#e7dcc9] focus:text-[#26352d] data-popup-open:bg-[#e7dcc9] data-popup-open:text-[#26352d] dark:text-[#f4eee4] dark:focus:bg-[#33433a] dark:focus:text-[#fff7eb] dark:data-popup-open:bg-[#33433a] dark:data-popup-open:text-[#fff7eb]';

const menuSubContentClassName =
  'rounded-[6px] border border-[#c6b299] bg-[#fffaf1] p-1 text-[#26352d] shadow-[0_5px_14px_rgba(57,48,36,0.14)] dark:border-[#46534b] dark:bg-[#26322c] dark:text-[#f4eee4] dark:shadow-[0_5px_16px_rgba(0,0,0,0.24)]';

export function UserMenu({
  name,
  email,
  image,
  profileHref,
}: {
  name: string;
  email: string;
  image?: string | null;
  profileHref?: string;
}) {
  const router = useRouter();
  const locale = getLocale();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useSidebar();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  function handleLocaleSwitch(newLocale: string) {
    // Writes the locale cookie and reloads on the localized URL.
    setLocale(newLocale as typeof locale);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#d87850] [&>div]:w-full">
            <SidebarMenuButton
              size="lg"
              render={<div />}
              className="rounded-md border border-transparent px-2.5 text-[#f4eee4] transition-[background-color,border-color,color] hover:border-[#635849] hover:bg-[#33433a] hover:text-[#fff7eb] data-[state=open]:border-[#d87850] data-[state=open]:bg-[#33433a] data-[state=open]:text-[#fff7eb]"
            >
              <Avatar className="size-8 rounded-[5px] border border-[#635849]">
                <AvatarImage src={image || undefined} alt={name} />
                <AvatarFallback className="rounded-[4px] bg-[#b95c33] text-xs font-semibold text-[#fff7eb]">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight text-[#f4eee4]">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-[#b9b8ab]">{email}</span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4 text-[#c8bba7]" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-[6px] border border-[#c6b299] bg-[#fffaf1] p-1.5 text-[#26352d] shadow-[0_6px_18px_rgba(57,48,36,0.16)] dark:border-[#46534b] dark:bg-[#26322c] dark:text-[#f4eee4] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal text-[#26352d] dark:text-[#f4eee4]">
                <div className="flex items-center gap-2.5 px-1.5 py-2 text-left text-sm">
                  <Avatar className="size-8 rounded-[5px] border border-[#c6b299] dark:border-[#526057]">
                    <AvatarImage src={image || undefined} alt={name} />
                    <AvatarFallback className="rounded-[4px] bg-[#b95c33] text-xs font-semibold text-[#fff7eb]">
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-[#786b5b] dark:text-[#c8c1b5]">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#c6b299] dark:bg-[#46534b]" />
            {profileHref && (
              <DropdownMenuItem
                className={menuItemClassName}
                onClick={() => {
                  window.open(localizeHref(profileHref), '_blank');
                }}
              >
                <UserIcon className="size-4" />
                {m['common.nav.profile']()}
              </DropdownMenuItem>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className={menuSubTriggerClassName}>
                <LanguagesIcon className="size-4 text-[#a14d2e] dark:text-[#d87850]" />
                <span className="flex-1">{localeNames[locale] || locale}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={menuSubContentClassName}>
                {locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    className={menuItemClassName}
                    onClick={() => handleLocaleSwitch(loc)}
                  >
                    <span className="flex-1">{localeNames[loc] || loc}</span>
                    {loc === locale && (
                      <CheckIcon className="size-3.5 text-[#a14d2e] dark:text-[#d87850]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className={menuSubTriggerClassName}>
                <PaletteIcon className="size-4 text-[#a14d2e] dark:text-[#d87850]" />
                <span className="flex-1">
                  {theme === 'dark'
                    ? m['common.nav.theme_dark']()
                    : theme === 'light'
                      ? m['common.nav.theme_light']()
                      : m['common.nav.theme_system']()}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={menuSubContentClassName}>
                <DropdownMenuItem
                  className={menuItemClassName}
                  onClick={() => setTheme('light')}
                >
                  <SunIcon className="size-4 text-[#a14d2e] dark:text-[#d87850]" />
                  <span className="flex-1">
                    {m['common.nav.theme_light']()}
                  </span>
                  {theme === 'light' && (
                    <CheckIcon className="size-3.5 text-[#a14d2e] dark:text-[#d87850]" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItemClassName}
                  onClick={() => setTheme('dark')}
                >
                  <MoonIcon className="size-4 text-[#a14d2e] dark:text-[#d87850]" />
                  <span className="flex-1">{m['common.nav.theme_dark']()}</span>
                  {theme === 'dark' && (
                    <CheckIcon className="size-3.5 text-[#a14d2e] dark:text-[#d87850]" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={menuItemClassName}
                  onClick={() => setTheme('system')}
                >
                  <MonitorIcon className="size-4 text-[#a14d2e] dark:text-[#d87850]" />
                  <span className="flex-1">
                    {m['common.nav.theme_system']()}
                  </span>
                  {theme === 'system' && (
                    <CheckIcon className="size-3.5 text-[#a14d2e] dark:text-[#d87850]" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="bg-[#c6b299] dark:bg-[#46534b]" />
            <DropdownMenuItem
              className="rounded-[4px] px-2.5 py-2 text-[#914128] transition-colors focus:bg-[#f2d8cc] focus:text-[#7d3520] dark:text-[#e58d68] dark:focus:bg-[#4a2d25] dark:focus:text-[#ffc6ad]"
              onClick={handleSignOut}
            >
              <LogOutIcon className="size-4" />
              {m['common.sign.sign_out_title']()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
