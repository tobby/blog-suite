import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, readingTime } from "@/lib/utils";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { TldrBox } from "@/components/blog/tldr-box";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { AuthorBio } from "@/components/blog/author-bio";
import { RelatedPosts } from "@/components/blog/related-posts";
import { CtaBlock } from "@/components/blog/cta-block";
import { PostBodyClient } from "./post-body-client";
import { AnalyticsTracker } from "./analytics-tracker";

interface PostPageProps {
  params: Promise<{ blogSlug: string; postSlug: string }>;
}

async function getPost(blogSlug: string, postSlug: string) {
  const blog = await prisma.blog.findUnique({
    where: { slug: blogSlug },
  });

  if (!blog) return null;

  const post = await prisma.post.findUnique({
    where: {
      blogId_slug: {
        blogId: blog.id,
        slug: postSlug,
      },
    },
    include: {
      author: true,
      category: true,
      blog: true,
    },
  });

  if (!post || post.status !== "Published") return null;

  return post;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { blogSlug, postSlug } = await params;
  const post = await getPost(blogSlug, postSlug);

  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.tldr || `Read ${post.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      ...(post.ogImage ? { images: [{ url: post.ogImage }] } : {}),
    },
  };
}

function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([2-4])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h[2-4]>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, "");
    headings.push({ id, text, level });
  }

  // If no IDs found, try to extract headings and generate IDs
  if (headings.length === 0) {
    const fallbackRegex = /<h([2-4])[^>]*>(.*?)<\/h[2-4]>/gi;
    while ((match = fallbackRegex.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      const text = match[2].replace(/<[^>]*>/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export default async function PostPage({ params }: PostPageProps) {
  const { blogSlug, postSlug } = await params;
  const post = await getPost(blogSlug, postSlug);

  if (!post) notFound();

  // Fetch related posts
  const relatedPostIds = (post.relatedPostIds as string[] | null) ?? [];
  let relatedPosts = relatedPostIds.length > 0
    ? await prisma.post.findMany({
        where: {
          id: { in: relatedPostIds },
          status: "Published",
        },
        include: { category: true, blog: true },
        take: 3,
      })
    : [];

  // Backfill from same category if not enough related posts
  if (relatedPosts.length < 3 && post.categoryId) {
    const existingIds = new Set([post.id, ...relatedPosts.map((p: { id: string }) => p.id)]);
    const backfill = await prisma.post.findMany({
      where: {
        blogId: post.blogId,
        categoryId: post.categoryId,
        status: "Published",
        id: { notIn: Array.from(existingIds) },
      },
      include: { category: true, blog: true },
      take: 3 - relatedPosts.length,
      orderBy: { publishedAt: "desc" },
    });
    relatedPosts = [...relatedPosts, ...backfill];
  }

  const headings = extractHeadings(post.body);

  // Check if updated after publish (more than 1 day)
  const showUpdatedBadge =
    post.publishedAt &&
    post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000;

  // Build JSON-LD
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const postUrl = `${baseUrl}/blog/${blogSlug}/${postSlug}`;

  const articleJsonLd = generateArticleJsonLd(post, postUrl);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: post.blog.name, href: `/blog/${blogSlug}` },
    ...(post.category
      ? [
          {
            label: post.category.name,
            href: `/blog/${blogSlug}/category/${post.category.slug}`,
          },
        ]
      : []),
    { label: post.title, href: postUrl },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    breadcrumbItems.map((item) => ({
      name: item.label,
      url: `${baseUrl}${item.href}`,
    }))
  );

  const faqSchema = post.faqSchema as
    | { question: string; answer: string }[]
    | null;
  const faqJsonLd = faqSchema ? generateFaqJsonLd(faqSchema) : null;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      )}

      <div className="min-h-screen bg-navy-950">
        <ReadingProgress />

        {/* Analytics tracker */}
        <AnalyticsTracker
          blogId={post.blogId}
          postId={post.id}
          path={`/blog/${blogSlug}/${postSlug}`}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Article Header */}
          <header className="mb-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <Badge variant="success" size="sm">
                  {post.category.name}
                </Badge>
              )}
              <Badge variant="default" size="sm">
                Level {post.contentLevel}
              </Badge>
              {showUpdatedBadge && (
                <Badge variant="info" size="sm">
                  Updated {formatDate(post.updatedAt)}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              {post.author.headshot ? (
                <img
                  src={post.author.headshot}
                  alt={post.author.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-neon">
                  {post.author.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div>
                <p className="text-slate-300 font-medium">
                  {post.author.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt.toISOString()}>
                      {formatDate(post.publishedAt)}
                    </time>
                  )}
                  <span>&middot;</span>
                  <span>{readingTime(post.body)} min read</span>
                </div>
              </div>
            </div>
          </header>

          {/* TL;DR */}
          {post.tldr && <TldrBox content={post.tldr} />}

          {/* Mobile ToC */}
          <div className="lg:hidden">
            <TableOfContents headings={headings} />
          </div>

          {/* Two-column layout */}
          <div className="flex gap-10">
            {/* Article body */}
            <article className="min-w-0 flex-1 max-w-3xl">
              <PostBodyClient html={post.body} />
            </article>

            {/* Desktop ToC sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents headings={headings} />
            </aside>
          </div>

          {/* Author Bio */}
          <AuthorBio author={post.author} />

          {/* Related Posts */}
          <RelatedPosts
            posts={relatedPosts.map((p: { title: string; slug: string; ogImage: string | null; category: { name: string } | null; blog: { slug: string } }) => ({
              title: p.title,
              slug: p.slug,
              ogImage: p.ogImage,
              category: p.category,
              blogSlug: p.blog.slug,
            }))}
          />

          {/* CTA Block */}
          <CtaBlock
            contentLevel={post.contentLevel}
            category={post.category?.name ?? "General"}
          />
        </main>
      </div>
    </>
  );
}
