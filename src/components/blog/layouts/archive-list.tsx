import type { ReactNode } from "react";
import type { PostCardData } from "@/components/blog/variants/post-card";

interface ArchiveListProps {
  posts: PostCardData[];
  renderCard: (post: PostCardData) => ReactNode;
  emptyMessage?: string;
}

export function ArchiveList({ posts, renderCard, emptyMessage }: ArchiveListProps) {
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
    <div className="flex flex-col gap-4 mt-8 max-w-3xl">
      {posts.map((post) => (
        <div key={post.id}>{renderCard(post)}</div>
      ))}
    </div>
  );
}
