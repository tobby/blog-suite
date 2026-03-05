import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { PostHeaderProps } from "./index";

export function PostHeaderDefault({ post, showUpdatedBadge }: PostHeaderProps) {
  return (
    <header className="mb-10 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        {post.category && (
          <Badge variant="success" size="sm">
            {post.category.name}
          </Badge>
        )}
        <Badge variant="default" size="sm">
          Level {post.contentLevel}
        </Badge>
        {showUpdatedBadge && (
          <Badge variant="info" size="sm">
            Updated {formatDate(post.updatedAt)}
          </Badge>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        {post.author.headshot ? (
          <img
            src={post.author.headshot}
            alt={post.author.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-neon">
            {post.author.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
        <div>
          <p className="text-slate-300 font-medium">
            {post.author.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            <span>&middot;</span>
            <span>{readingTime(post.body)} min read</span>
          </div>
        </div>
      </div>
    </header>
  );
}
