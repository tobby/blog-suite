import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { PostHeaderProps } from "./index";

export function PostHeaderDocs({ post, showUpdatedBadge }: PostHeaderProps) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
        {post.category && (
          <span className="text-neon font-medium">{post.category.name}</span>
        )}
        {post.category && <span>/</span>}
        <span>Level {post.contentLevel}</span>
        {showUpdatedBadge && (
          <>
            <span>&middot;</span>
            <span>Updated {formatDate(post.updatedAt)}</span>
          </>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="text-slate-300">{post.author.name}</span>
        {post.publishedAt && (
          <>
            <span>&middot;</span>
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
          </>
        )}
        <span>&middot;</span>
        <span>{readingTime(post.body)} min read</span>
      </div>
    </header>
  );
}
