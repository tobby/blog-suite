import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { PostCard } from "@/components/blog/post-card";

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

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {posts.map((post: (typeof posts)[number]) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">
              No published posts in this category yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
