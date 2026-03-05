import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getTemplateConfig } from "@/lib/template";
import { PostCardVariantMap } from "@/components/blog/variants/post-card";
import { ArchiveGrid } from "@/components/blog/layouts/archive-grid";
import { ArchiveList } from "@/components/blog/layouts/archive-list";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";

interface CategoryPageProps {
  params: Promise<{ blogSlug: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { blogSlug, slug } = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
  });

  if (!blog) return {};

  const category = await prisma.category.findUnique({
    where: { blogId_slug: { blogId: blog.id, slug } },
  });

  if (!category) return {};

  return {
    title: `${category.name} — ${blog.name}`,
    description:
      category.description ??
      `Browse all ${category.name} posts on ${blog.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { blogSlug, slug } = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
  });

  if (!blog) notFound();

  const templateConfig = getTemplateConfig(blog.template);
  const CardComponent = PostCardVariantMap[templateConfig.components.postCard];
  const ArchiveLayout = templateConfig.layout.archive === "list" ? ArchiveList : ArchiveGrid;

  const category = await prisma.category.findUnique({
    where: { blogId_slug: { blogId: blog.id, slug } },
  });

  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: {
      blogId: blog.id,
      categoryId: category.id,
      status: "Published",
    },
    include: {
      author: true,
      category: true,
      blog: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: blog.name, href: `/blog/${blogSlug}` },
    { label: category.name, href: `/blog/${blogSlug}/category/${slug}` },
  ];

  const renderCard = (post: (typeof posts)[number]) => (
    <CardComponent key={post.id} post={post} />
  );

  return (
    <div className="min-h-screen bg-navy-950">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-slate-400 mb-8 max-w-2xl">
            {category.description}
          </p>
        )}

        <ArchiveLayout posts={posts} renderCard={renderCard} />
      </main>
    </div>
  );
}
