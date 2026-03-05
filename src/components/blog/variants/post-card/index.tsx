import type { Post, Author, Category, Blog } from "@/generated/prisma/client";
import type { PostCardVariant } from "@/lib/constants";
import { PostCardDefault } from "./post-card-default";
import { PostCardOverlay } from "./post-card-overlay";
import { PostCardHorizontal } from "./post-card-horizontal";

export type PostCardData = Post & {
  author: Author;
  category: Category | null;
  blog: Blog;
};

export interface PostCardProps {
  post: PostCardData;
}

type PostCardComponent = (props: PostCardProps) => React.ReactNode;

export const PostCardVariantMap: Record<PostCardVariant, PostCardComponent> = {
  default: PostCardDefault,
  overlay: PostCardOverlay,
  horizontal: PostCardHorizontal,
};
