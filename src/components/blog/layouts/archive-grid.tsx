import type { ReactNode } from "react";
import type { PostCardData } from "@/components/blog/variants/post-card";

interface ArchiveGridProps {
  posts: PostCardData[];
  renderCard: (post: PostCardData) => ReactNode;
  emptyMessage?: string;
}

export function ArchiveGrid({ posts, renderCard, emptyMessage }: ArchiveGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 text-lg">
          {emptyMessage ?? "No published posts in this category yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr] mt-8">
      {posts.map((post) => (
        <div key={post.id}>{renderCard(post)}</div>
      ))}
    </div>
  );
}
