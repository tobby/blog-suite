import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import type { PostHeaderProps } from "./index";

export function PostHeaderBanner({ post, showUpdatedBadge }: PostHeaderProps) {
  return (
    <header className="mb-10 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="relative min-h-[280px] md:min-h-[360px] flex items-end overflow-hidden rounded-xl mx-4 sm:mx-6 lg:mx-8">
        {/* Background */}
        {post.ogImage ? (
          <>
            <img
              src={post.ogImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 to-navy-800" />
        )}

        {/* Content overlay */}
        <div className="relative z-10 w-full p-6 md:p-10 space-y-4">
          <div className="flex items-center gap-3">
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

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-4xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-300">
            {post.author.headshot ? (
              <img
                src={post.author.headshot}
                alt={post.author.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-neon ring-2 ring-white/20">
                {post.author.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-medium text-white">{post.author.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
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
        </div>
      </div>
    </header>
  );
}
