import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { HeroProps } from "./index";

export function HeroMinimal({ post }: HeroProps) {
  return (
    <section className="w-full border-b border-border pb-8">
      <div className="max-w-3xl space-y-3">
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

        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          <Link
            href={`/blog/${post.blog.slug}/${post.slug}`}
            className="hover:text-neon transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {post.tldr && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
            {post.tldr}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="text-slate-300">{post.author.name}</span>
          {post.publishedAt && (
            <>
              <span>&middot;</span>
              <span>{formatDate(post.publishedAt)}</span>
            </>
          )}
          <span>&middot;</span>
          <span>{readingTime(post.body)} min read</span>
        </div>
      </div>
    </section>
  );
}
