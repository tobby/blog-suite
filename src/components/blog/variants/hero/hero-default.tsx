import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { HeroProps } from "./index";

export function HeroDefault({ post }: HeroProps) {
  const hasOgImage = !!post.ogImage;

  return (
    <section className="relative w-full overflow-hidden rounded-xl">
      <div className="relative min-h-[420px] md:min-h-[480px] flex items-end">
        {hasOgImage ? (
          <>
            <img
              src={post.ogImage!}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-neon/10" />
        )}

        <div className="relative z-10 w-full p-6 md:p-10 pb-8 md:pb-10">
          <div className="max-w-3xl space-y-4">
            {post.category && (
              <Badge variant="success" size="sm">
                {post.category.name}
              </Badge>
            )}

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {post.title}
            </h2>

            {post.tldr && (
              <p className="text-base md:text-lg text-slate-300 leading-relaxed line-clamp-2">
                {post.tldr}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{post.author.name}</span>
              <span className="text-slate-600">|</span>
              {post.publishedAt && (
                <span>{formatDate(post.publishedAt)}</span>
              )}
              <span className="text-slate-600">|</span>
              <span>{readingTime(post.body)} min read</span>
            </div>

            <Link
              href={`/blog/${post.blog.slug}/${post.slug}`}
              className="inline-flex items-center gap-2 text-neon font-medium hover:text-neon-bright transition-colors"
            >
              Read More
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
