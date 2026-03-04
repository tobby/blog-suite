import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { formatDate, readingTime, truncate } from "@/lib/utils";
import type { Post, Author, Category, Blog } from "@/generated/prisma/client";

type PostCardData = Post & {
  author: Author;
  category: Category | null;
  blog: Blog;
};

interface PostCardProps {
  post: PostCardData;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.blog.slug}/${post.slug}`} className="group block">
      <Card
        hoverGlow
        className="h-full flex flex-col transition-all duration-200 group-hover:border-neon/30"
      >
        <CardHeader>
          {post.category && (
            <Badge variant="success" size="sm" className="w-fit">
              {post.category.name}
            </Badge>
          )}
          <h3 className="text-lg font-semibold text-white group-hover:text-neon transition-colors line-clamp-2">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1">
          {post.metaDescription && (
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
              {truncate(post.metaDescription, 160)}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-slate-500">
          <span>{post.author.name}</span>
          <div className="flex items-center gap-2">
            <span>{readingTime(post.body)} min</span>
            {post.publishedAt && (
              <>
                <span className="text-slate-600">&middot;</span>
                <span>{formatDate(post.publishedAt)}</span>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
