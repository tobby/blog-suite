import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://blogsuite.com";

export default async function sitemap({
  params,
}: {
  params: Promise<{ blogSlug: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { blogSlug } = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
    select: { id: true, slug: true, updatedAt: true },
  });

  if (!blog) {
    return [];
  }

  // Fetch global sitemap config for defaults
  const globalSettings = await prisma.globalSettings.findUnique({
    where: { id: "global" },
  });

  const sitemapConfig = (globalSettings?.sitemapConfig as {
    changeFrequency?: string;
    defaultPriority?: number;
  }) ?? {};

  const changeFrequency =
    (sitemapConfig.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"]) ??
    "weekly";
  const defaultPriority = sitemapConfig.defaultPriority ?? 0.7;

  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: {
      blogId: blog.id,
      status: "Published",
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  // Fetch all categories
  const categories = await prisma.category.findMany({
    where: { blogId: blog.id },
    select: {
      slug: true,
    },
  });

  const entries: MetadataRoute.Sitemap = [];

  // Blog index page
  entries.push({
    url: `${BASE_URL}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency,
    priority: 1.0,
  });

  // Category pages
  for (const category of categories) {
    entries.push({
      url: `${BASE_URL}/blog/${blog.slug}/category/${category.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency,
      priority: 0.8,
    });
  }

  // Post pages
  for (const post of posts) {
    entries.push({
      url: `${BASE_URL}/blog/${blog.slug}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency,
      priority: defaultPriority,
    });
  }

  return entries;
}
