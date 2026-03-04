import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface RelatedPost {
  title: string;
  slug: string;
  ogImage?: string | null;
  category: { name: string } | null;
  blogSlug: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="mb-6 text-xl font-bold text-white">Related Posts</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.blogSlug}/${post.slug}`}
            className="group block rounded-lg border border-border bg-navy-900 overflow-hidden transition-all hover:border-neon/30 hover:shadow-md hover:shadow-neon/5"
          >
            {post.ogImage && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.ogImage}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              {post.category && (
                <Badge variant="success" size="sm">
                  {post.category.name}
                </Badge>
              )}
              <h3 className="text-sm font-semibold text-white group-hover:text-neon transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
