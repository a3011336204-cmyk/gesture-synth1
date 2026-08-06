import { Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export type BlogCardProps = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  date?: string;
  authorName?: string;
  authorImage?: string;
};

export function BlogCard({
  href,
  title,
  description,
  image,
  date,
  authorName,
  authorImage,
}: BlogCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-[4px] border border-[#c6b299] bg-[#fbf7ef] transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[#9b6a42] hover:shadow-[0_10px_24px_rgba(71,48,31,0.12)]"
    >
      {image && (
        <img
          src={image}
          alt={title}
          width={640}
          height={360}
          loading="lazy"
          className="aspect-video w-full border-b border-[#c6b299] object-cover object-center"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-serif leading-snug font-bold text-[#26352d] group-hover:text-[#8d4327]">
          {title}
        </h3>
        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-[#615c51]">
            {description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 border-t border-[#e0d4c3] pt-3 text-xs text-[#796850]">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {date}
            </span>
          )}
          <span className="flex-1" />
          {(authorName || authorImage) && (
            <span className="inline-flex items-center gap-2">
              {authorImage && (
                <img
                  src={authorImage}
                  alt={authorName || ''}
                  width={20}
                  height={20}
                  loading="lazy"
                  className="size-5 rounded-sm border border-[#c6b299] object-cover"
                />
              )}
              {authorName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
