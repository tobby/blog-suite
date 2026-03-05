import type { ReactNode } from "react";
import type { PostCardData } from "@/components/blog/variants/post-card";

interface HomeStandardProps {
  hero: ReactNode;
  posts: PostCardData[];
  renderCard: (post: PostCardData) => ReactNode;
}

export function HomeStandard({ hero, posts, renderCard }: HomeStandardProps) {
  return (
    <>
      {hero}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
          {posts.map((post) => (
            <div key={post.id}>{renderCard(post)}</div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No posts found.</p>
        </div>
      )}
    </>
  );
}
