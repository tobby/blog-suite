import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getTemplateConfig } from "@/lib/template";
import { HeroVariantMap } from "@/components/blog/variants/hero";
import { PostCardVariantMap } from "@/components/blog/variants/post-card";
import { HomeStandard } from "@/components/blog/layouts/home-standard";
import { HomeMagazine } from "@/components/blog/layouts/home-magazine";
import { CategoryPills } from "@/components/blog/category-pills";
import { SearchBar } from "@/components/blog/search-bar";
import { BlogHeader } from "@/components/blog/blog-header";

interface BlogHomeProps {
  params: Promise<{ blogSlug: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
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
  const { category: categorySlug, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const pageSize = 12;

  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
  });

  if (!blog) notFound();

  const templateConfig = getTemplateConfig(blog.template);
  const HeroComponent = HeroVariantMap[templateConfig.components.hero];
  const CardComponent = PostCardVariantMap[templateConfig.components.postCard];

  const postWhere = {
    blogId: blog.id,
    status: "Published" as const,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [featuredPost, categories, posts, totalPosts] = await Promise.all([
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

    prisma.category.findMany({
      where: { blogId: blog.id },
      orderBy: { name: "asc" },
    }),

    prisma.post.findMany({
      where: postWhere,
      include: {
        author: true,
        category: true,
        blog: true,
      },
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),

    prisma.post.count({ where: postWhere }),
  ]);

  const totalPages = Math.ceil(totalPosts / pageSize);

  const showHero = featuredPost && !categorySlug && currentPage === 1;
  const heroElement = showHero ? <HeroComponent post={featuredPost} /> : null;
  const renderCard = (post: (typeof posts)[number]) => (
    <CardComponent key={post.id} post={post} />
  );

  const HomeLayout = templateConfig.layout.home === "magazine" ? HomeMagazine : HomeStandard;

  return (
    <div className="min-h-screen bg-navy-950">
      <BlogHeader blogName={blog.name} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <HomeLayout hero={heroElement} posts={posts} renderCard={renderCard} />

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CategoryPills
            categories={categories}
            activeSlug={categorySlug ?? null}
            blogSlug={blogSlug}
          />
          <SearchBar blogSlug={blogSlug} blogId={blog.id} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            {currentPage > 1 && (
              <Link
                href={`/blog/${blogSlug}?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                className="rounded-md border border-border bg-navy-900 px-4 py-2 text-sm text-slate-300 hover:bg-navy-800 transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/blog/${blogSlug}?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                className="rounded-md border border-border bg-navy-900 px-4 py-2 text-sm text-slate-300 hover:bg-navy-800 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
