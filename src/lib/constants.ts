export const CONTENT_LEVELS = {
  1: { label: "Level 1 — Manager", description: "Trends & strategic overview" },
  2: { label: "Level 2 — Analyst", description: "Forensic deep-dive" },
  3: { label: "Level 3 — Engineer", description: "Code-heavy implementation" },
} as const;

export type HomeLayout = "standard" | "magazine";
export type PostLayout = "sidebar" | "docs";
export type ArchiveLayout = "grid" | "list";
export type HeroVariant = "default" | "magazine" | "minimal";
export type PostCardVariant = "default" | "overlay" | "horizontal";
export type PostHeaderVariant = "default" | "docs" | "banner";

export interface TemplateConfig {
  label: string;
  description: string;
  layout: {
    home: HomeLayout;
    post: PostLayout;
    archive: ArchiveLayout;
  };
  components: {
    hero: HeroVariant;
    postCard: PostCardVariant;
    postHeader: PostHeaderVariant;
  };
}

export const BLOG_TEMPLATES: Record<string, TemplateConfig> = {
  clean: {
    label: "Clean",
    description: "Balanced and versatile — works for any content",
    layout: { home: "standard", post: "sidebar", archive: "grid" },
    components: { hero: "default", postCard: "default", postHeader: "default" },
  },
  bold: {
    label: "Bold",
    description: "High-impact and visual — ideal for news and features",
    layout: { home: "magazine", post: "sidebar", archive: "grid" },
    components: { hero: "magazine", postCard: "overlay", postHeader: "default" },
  },
  minimal: {
    label: "Minimal",
    description: "Stripped-back and focused — great for technical writing",
    layout: { home: "standard", post: "docs", archive: "list" },
    components: { hero: "minimal", postCard: "horizontal", postHeader: "docs" },
  },
  formal: {
    label: "Formal",
    description: "Structured and professional — suited for corporate content",
    layout: { home: "standard", post: "sidebar", archive: "grid" },
    components: { hero: "default", postCard: "default", postHeader: "banner" },
  },
};

export type TemplateKey = keyof typeof BLOG_TEMPLATES;

export const POST_STATUSES = ["Draft", "Published", "Unpublished"] as const;

export const SEO_LIMITS = {
  title: { amber: 50, red: 60 },
  metaDescription: { amber: 150, red: 160 },
} as const;
