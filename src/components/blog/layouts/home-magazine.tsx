import type { ReactNode } from "react";
import type { PostCardData } from "@/components/blog/variants/post-card";

interface HomeMagazineProps {
  hero: ReactNode;
  posts: PostCardData[];
  renderCard: (post: PostCardData) => ReactNode;
}

export function HomeMagazine({ hero, posts, renderCard }: HomeMagazineProps) {
  return (
    <>
      {hero}

      {posts.length > 0 ? (
        <div className="space-y-8">
          {/* Top row: large featured + small stack */}
          {posts.length >= 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderCard(posts[0])}
              </div>
              <div className="flex flex-col gap-6">
                {posts.slice(1, 3).map((post) => (
                  <div key={post.id}>{renderCard(post)}</div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining in standard grid */}
          {posts.length > 3 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
              {posts.slice(3).map((post) => (
                <div key={post.id}>{renderCard(post)}</div>
              ))}
            </div>
          )}

          {/* Fallback for <3 posts */}
          {posts.length < 3 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
              {posts.map((post) => (
                <div key={post.id}>{renderCard(post)}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No posts found.</p>
        </div>
      )}
    </>
  );
}
