import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Fetch global settings for blocked AI bots
  let blockedBots: string[] = [];

  try {
    const settings = await prisma.globalSettings.findUnique({
      where: { id: "global" },
    });

    if (settings?.llmTags && Array.isArray(settings.llmTags)) {
      blockedBots = settings.llmTags as string[];
    }
  } catch {
    // Settings may not exist yet
  }

  // Fetch all blogs for per-blog sitemap references
  let blogs: { slug: string }[] = [];
  try {
    blogs = await prisma.blog.findMany({
      select: { slug: true },
    });
  } catch {
    // Proceed with empty blogs list
  }

  const rules: MetadataRoute.Robots["rules"] = [
    // Default: allow all, disallow admin/studio/api
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/admin", "/api/"],
    },
    // Disallow rules for each blocked AI bot
    ...blockedBots.map((bot) => ({
      userAgent: bot,
      disallow: ["/"],
    })),
  ];

  // Build sitemap URLs: one per blog
  const sitemapUrls = blogs.map(
    (blog) => `${BASE_URL}/blog/${blog.slug}/sitemap.xml`
  );

  return {
    rules,
    sitemap:
      sitemapUrls.length > 0 ? sitemapUrls : `${BASE_URL}/sitemap.xml`,
  };
}
