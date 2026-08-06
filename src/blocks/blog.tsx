import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { BlogCard } from '@/components/blog-card';
import { formatPostDate, type BlogPost } from '@/content/posts';

// Latest-posts landing section. Posts arrive via props (fetched in the
// landing route's loader through the blog server functions) so this block
// stays free of database imports.
export function Blog({ posts }: { posts: BlogPost[] }) {
  const locale = getLocale();

  if (posts.length === 0) return null;

  return (
    <section
      id="blog"
      className="border-t border-[#c6b299] bg-[#e7dcc9] px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 max-w-2xl border-b border-[#9b6a42] pb-6 sm:mb-16">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-[#8d4327] uppercase">
            Practice notes
          </p>
          <h2 className="font-serif text-4xl leading-tight font-normal text-[#26352d] sm:text-5xl">
            {m['landing.blog.title']()}
          </h2>
          <p className="mt-5 max-w-lg text-[#615c51]">
            {m['landing.blog.description']()}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              href={`/blog/${post.slug}`}
              title={post.title}
              description={post.description}
              image={post.image}
              date={formatPostDate(post.createdAt, locale)}
              authorName={post.authorName}
              authorImage={post.authorImage}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8d4327] transition-colors hover:text-[#6e321e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33]"
          >
            {m['landing.blog.view_all']()}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
