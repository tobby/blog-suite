import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime, truncate } from "@/lib/utils";
import type { PostCardProps } from "./index";

export function PostCardHorizontal({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.blog.slug}/${post.slug}`} className="group block">
      <div className="flex gap-5 rounded-lg border border-border bg-navy-900 p-4 transition-all duration-200 group-hover:border-neon/30 group-hover:shadow-md group-hover:shadow-neon/5">
        {/* Image */}
        {post.ogImage && (
          <div className="hidden sm:block w-48 shrink-0 overflow-hidden rounded-md">
            <img
              src={post.ogImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {post.category && (
              <Badge variant="success" size="sm">
                {post.category.name}
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-semibold text-white group-hover:text-neon transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.metaDescription && (
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
              {truncate(post.metaDescription, 160)}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{post.author.name}</span>
            <span>&middot;</span>
            <span>{readingTime(post.body)} min</span>
            {post.publishedAt && (
              <>
                <span>&middot;</span>
                <span>{formatDate(post.publishedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
