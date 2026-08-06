import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import type { MDXComponents } from 'mdx/types';

import { cn } from '@/lib/utils';

export const mdxComponents: MDXComponents = {
  h1: ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'mt-8 mb-3 font-serif text-2xl font-bold text-[#26352d] md:text-3xl dark:text-[#f4eee4]',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'mt-8 mb-3 border-l border-[#b95c33] pl-3 font-serif text-xl font-bold text-[#26352d] md:text-2xl dark:text-[#f4eee4]',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'mt-6 mb-2 font-serif text-lg font-bold text-[#26352d] dark:text-[#f4eee4]',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        'mt-2 leading-7 text-[#393b32] dark:text-[#e7dcc9]',
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn(
        'font-medium text-[#8d4327] underline-offset-4 hover:text-[#6e321e] hover:underline dark:text-[#d87850] dark:hover:text-[#f0a27d]',
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        'mt-2 ml-6 list-disc space-y-1 marker:text-[#b95c33]',
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        'mt-2 ml-6 list-decimal space-y-1 marker:text-[#b95c33]',
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li
      className={cn('leading-7 text-[#393b32] dark:text-[#e7dcc9]', className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
    <strong
      className={cn(
        'font-semibold text-[#26352d] dark:text-[#f4eee4]',
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'my-5 border-l border-[#b95c33] pl-4 font-serif text-[#615c51] italic dark:text-[#c8c1b5]',
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'rounded-none bg-[#e7dcc9] px-[0.4rem] py-[0.2rem] font-mono text-sm text-[#523e2e] dark:bg-[#33433a] dark:text-[#e7dcc9]',
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: HTMLAttributes<HTMLHRElement>) => (
    <hr className={cn('my-8 border-[#cdb895]', className)} {...props} />
  ),
};
