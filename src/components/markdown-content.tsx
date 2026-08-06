// Server-side markdown renderer for database-backed posts.
// Local MDX posts render through mdx-components.tsx instead — the
// wrapper classes below mirror those styles so both sources look alike.
import MarkdownIt from 'markdown-it';

import { cn } from '@/lib/utils';

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
});

// Headings get stable IDs so in-content anchors work
md.renderer.rules.heading_open = function (tokens, idx) {
  const token = tokens[idx];
  const level = token.markup.length;
  const nextToken = tokens[idx + 1];

  if (nextToken && nextToken.type === 'inline') {
    return `<h${level} id="${generateHeadingId(nextToken.content)}">`;
  }
  return `<h${level}>`;
};

// External links open in a new tab with nofollow
md.renderer.rules.link_open = function (tokens, idx, options, _env, renderer) {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    token.attrSet('rel', 'nofollow noopener');
    token.attrSet('target', '_blank');
  }
  return renderer.renderToken(tokens, idx, options);
};

// Shared typography for rendered markdown — also used by the admin rich-text
// editor so what you edit matches what the public pages render.
export const markdownStyles = cn(
  'text-[15px] leading-7 text-[#393b32] dark:text-[#e7dcc9]',
  '[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#26352d] dark:[&_h1]:text-[#f4eee4] md:[&_h1]:text-3xl',
  '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-l [&_h2]:border-[#b95c33] [&_h2]:pl-3 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#26352d] dark:[&_h2]:text-[#f4eee4] md:[&_h2]:text-2xl',
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#26352d] dark:[&_h3]:text-[#f4eee4]',
  '[&_p]:mt-2 [&_p]:leading-7',
  '[&_a]:font-medium [&_a]:text-[#8d4327] [&_a]:underline-offset-4 hover:[&_a]:text-[#6e321e] hover:[&_a]:underline',
  '[&_ul]:mt-2 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:marker:text-[#b95c33]',
  '[&_ol]:mt-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:marker:text-[#b95c33]',
  '[&_li]:leading-7',
  '[&_strong]:font-semibold [&_strong]:text-[#26352d] dark:[&_strong]:text-[#f4eee4]',
  '[&_blockquote]:my-5 [&_blockquote]:border-l [&_blockquote]:border-[#b95c33] [&_blockquote]:pl-4 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-[#615c51] dark:[&_blockquote]:text-[#c8c1b5]',
  '[&_code]:rounded-none [&_code]:bg-[#e7dcc9] [&_code]:px-[0.4rem] [&_code]:py-[0.2rem] [&_code]:font-mono [&_code]:text-sm [&_code]:text-[#523e2e] dark:[&_code]:bg-[#33433a] dark:[&_code]:text-[#e7dcc9]',
  '[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[4px] [&_pre]:border [&_pre]:border-[#c6b299] [&_pre]:bg-[#e7dcc9] [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_hr]:my-8 [&_hr]:border-[#cdb895]',
  '[&_img]:my-4 [&_img]:border [&_img]:border-[#c6b299]',
  '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#c6b299] [&_th]:bg-[#e7dcc9] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-[#c6b299] [&_td]:px-3 [&_td]:py-2'
);

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const html = content ? md.render(content) : '';

  return (
    <div
      className={cn(markdownStyles, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
