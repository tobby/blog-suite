import type { Post, Author, Category, Blog } from "@/generated/prisma/client";
import type { PostHeaderVariant } from "@/lib/constants";
import { PostHeaderDefault } from "./post-header-default";
import { PostHeaderDocs } from "./post-header-docs";
import { PostHeaderBanner } from "./post-header-banner";

export type PostWithRelations = Post & {
  author: Author;
  category: Category | null;
  blog: Blog;
};

export interface PostHeaderProps {
  post: PostWithRelations;
  showUpdatedBadge: boolean;
}

type PostHeaderComponent = (props: PostHeaderProps) => React.ReactNode;

export const PostHeaderVariantMap: Record<PostHeaderVariant, PostHeaderComponent> = {
  default: PostHeaderDefault,
  docs: PostHeaderDocs,
  banner: PostHeaderBanner,
};
