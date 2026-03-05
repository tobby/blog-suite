import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { PostCardProps } from "./index";

export function PostCardOverlay({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.blog.slug}/${post.slug}`} className="group block">
      <div className="relative h-full min-h-[320px] overflow-hidden rounded-lg border border-border transition-all duration-200 group-hover:border-neon/30">
        {/* Background */}
        {post.ogImage ? (
          <img
            src={post.ogImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />

        {/* Content at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-5 space-y-2">
          {post.category && (
            <Badge variant="success" size="sm">
              {post.category.name}
            </Badge>
          )}

          <h3 className="text-lg font-semibold text-white group-hover:text-neon transition-colors line-clamp-2">
            {post.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-400">
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
