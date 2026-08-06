import { Heart } from 'lucide-react';

import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function BuiltWithShipAny({ className }: { className?: string }) {
  const utm = encodeURIComponent(getHostname(envConfigs.app_url));
  const href = `https://shipany.ai/?utm_source=${utm}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 rounded-[4px] border border-[#526057] bg-[#26352d] px-3.5 py-1.5 text-sm font-medium text-[#e7dcc9] transition-colors hover:border-[#9b6a42] hover:bg-[#33433a] hover:text-[#f4efe5]',
        className
      )}
    >
      <span>Built with</span>
      <Heart aria-hidden className="size-3.5 fill-[#b95c33] text-[#b95c33]" />
      <span>ShipAny</span>
    </a>
  );
}
