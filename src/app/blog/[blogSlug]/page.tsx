import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/blog/hero";
import { PostCard } from "@/components/blog/post-card";
import { CategoryPills } from "@/components/blog/category-pills";
import { SearchBar } from "@/components/blog/search-bar";

interface BlogHomeProps {
  params: Promise<{ blogSlug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({
  params,
}: BlogHomeProps): Promise<Metadata> {
  const { blogSlug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
  });

  if (!blog) return {};

  return {
    title: blog.name,
    description: blog.description ?? `Read the latest posts on ${blog.name}`,
    openGraph: {
      title: blog.name,
      description: blog.description ?? undefined,
      type: "website",
    },
  };
}

export default async function BlogHomePage({
  params,
  searchParams,
}: BlogHomeProps) {
  const { blogSlug } = await params;
  const { category: categorySlug } = await searchParams;

  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
  });

  if (!blog) notFound();

  const [featuredPost, categories, posts] = await Promise.all([
    // Featured post for hero
    prisma.post.findFirst({
      where: {
        blogId: blog.id,
        status: "Published",
        featured: true,
      },
      include: {
        author: true,
        category: true,
        blog: true,
      },
      orderBy: { publishedAt: "desc" },
    }),

    // All categories for pills
    prisma.category.findMany({
      where: { blogId: blog.id },
      orderBy: { name: "asc" },
    }),

    // Published posts (filtered by category if param present)
    prisma.post.findMany({
      where: {
        blogId: blog.id,
        status: "Published",
        ...(categorySlug
          ? { category: { slug: categorySlug } }
          : {}),
      },
      include: {
        author: true,
        category: true,
        blog: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Blog Header */}
      <header className="border-b border-border bg-navy-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">{blog.name}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero (featured post) */}
        {featuredPost && !categorySlug && <Hero post={featuredPost} />}

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CategoryPills
            categories={categories}
            activeSlug={categorySlug ?? null}
            blogSlug={blogSlug}
          />
          <SearchBar blogSlug={blogSlug} blogId={blog.id} />
        </div>

        {/* Post grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: (typeof posts)[number]) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No posts found.</p>
            {categorySlug && (
              <p className="text-slate-600 mt-2 text-sm">
                Try selecting a different category or clearing the filter.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
