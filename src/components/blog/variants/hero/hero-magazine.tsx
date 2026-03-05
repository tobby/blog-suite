import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { HeroProps } from "./index";

export function HeroMagazine({ post }: HeroProps) {
  return (
    <section className="w-full overflow-hidden rounded-xl border border-border bg-navy-900">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
        {/* Image side */}
        <div className="relative min-h-[240px] md:min-h-full">
          {post.ogImage ? (
            <img
              src={post.ogImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-neon/10" />
          )}
        </div>

        {/* Text side */}
        <div className="flex flex-col justify-center p-8 md:p-10 space-y-4">
          <div className="flex items-center gap-2">
            {post.category && (
              <Badge variant="success" size="sm">
                {post.category.name}
              </Badge>
            )}
            <Badge variant="default" size="sm">
              Featured
            </Badge>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h2>

          {post.tldr && (
            <p className="text-sm md:text-base text-slate-400 leading-relaxed line-clamp-3">
              {post.tldr}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="text-slate-300 font-medium">{post.author.name}</span>
            {post.publishedAt && (
              <>
                <span>&middot;</span>
                <span>{formatDate(post.publishedAt)}</span>
              </>
            )}
            <span>&middot;</span>
            <span>{readingTime(post.body)} min read</span>
          </div>

          <Link
            href={`/blog/${post.blog.slug}/${post.slug}`}
            className="inline-flex items-center gap-2 text-neon font-medium hover:text-neon-bright transition-colors w-fit"
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
    </section>
  );
}
