import type { Post, Author, Category, Blog } from "@/generated/prisma/client";
import type { HeroVariant } from "@/lib/constants";
import { HeroDefault } from "./hero-default";
import { HeroMagazine } from "./hero-magazine";
import { HeroMinimal } from "./hero-minimal";

export type HeroPost = Post & {
  author: Author;
  category: Category | null;
  blog: Blog;
};

export interface HeroProps {
  post: HeroPost;
}

type HeroComponent = (props: HeroProps) => React.ReactNode;

export const HeroVariantMap: Record<HeroVariant, HeroComponent> = {
  default: HeroDefault,
  magazine: HeroMagazine,
  minimal: HeroMinimal,
};
