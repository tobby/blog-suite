import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { PostStatus } from "@/generated/prisma/client";

interface RouteContext {
  params: Promise<{ blogId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blogId } = await context.params;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const status = searchParams.get("status") as PostStatus | null;
    const search = searchParams.get("search");

    const postIncludes = {
      author: { select: { id: true, name: true, headshot: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
    };

    // If requesting a single post by ID, return it directly
    if (postId) {
      const post = await prisma.post.findFirst({
        where: { id: postId, blogId },
        include: postIncludes,
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      return NextResponse.json({ post });
    }

    // Build where clause for list queries
    const where: Record<string, unknown> = { blogId };

    if (status && Object.values(PostStatus).includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role-based filtering: Analyst can only see their own posts
    if (session.user.role === "Analyst") {
      const author = await prisma.author.findFirst({
        where: { blogId, userId: session.user.id },
      });

      if (!author) {
        return NextResponse.json({ posts: [] });
      }

      where.authorId = author.id;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: postIncludes,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/blogs/[blogId]/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blogId } = await context.params;
    const body = await request.json();

    const {
      title,
      slug: providedSlug,
      body: postBody,
      tldr,
      status,
      contentLevel,
      categoryId,
      tagIds,
      featured,
      metaTitle,
      metaDescription,
      ogImage,
      jsonLd,
      faqSchema,
      relatedPostIds,
    } = body;

    if (!title || !postBody) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 }
      );
    }

    // Verify blog exists
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    // Find or create author record for current user in this blog
    let author = await prisma.author.findFirst({
      where: { blogId, userId: session.user.id },
    });

    if (!author) {
      author = await prisma.author.create({
        data: {
          blogId,
          userId: session.user.id,
          name: session.user.name || session.user.email,
        },
      });
    }

    // Generate slug from title if not provided
    const slug = providedSlug || slugify(title);

    // Check for slug uniqueness within blog
    const existingSlug = await prisma.post.findUnique({
      where: { blogId_slug: { blogId, slug } },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A post with this slug already exists in this blog." },
        { status: 409 }
      );
    }

    // Determine publish date
    const postStatus = status || "Draft";
    const publishedAt =
      postStatus === "Published" ? new Date() : undefined;

    const post = await prisma.post.create({
      data: {
        blogId,
        title,
        slug,
        body: postBody,
        tldr: tldr || null,
        status: postStatus,
        contentLevel: contentLevel ?? 1,
        authorId: author.id,
        categoryId: categoryId || null,
        featured: featured ?? false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        jsonLd: jsonLd || undefined,
        faqSchema: faqSchema || undefined,
        relatedPostIds: relatedPostIds || undefined,
        publishedAt,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blogs/[blogId]/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blogId } = await context.params;
    const body = await request.json();

    const {
      id: postId,
      title,
      slug: providedSlug,
      body: postBody,
      tldr,
      status,
      contentLevel,
      categoryId,
      tagIds,
      featured,
      metaTitle,
      metaDescription,
      ogImage,
      jsonLd,
      faqSchema,
      relatedPostIds,
    } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required." },
        { status: 400 }
      );
    }

    if (!title || !postBody) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 }
      );
    }

    // Verify post exists and belongs to this blog
    const existingPost = await prisma.post.findFirst({
      where: { id: postId, blogId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Role-based access: Analysts can only edit their own posts
    if (session.user.role === "Analyst") {
      const author = await prisma.author.findFirst({
        where: { blogId, userId: session.user.id },
      });

      if (!author || existingPost.authorId !== author.id) {
        return NextResponse.json(
          { error: "You do not have permission to edit this post." },
          { status: 403 }
        );
      }
    }

    // Generate slug from title if not provided
    const slug = providedSlug || slugify(title);

    // Check for slug uniqueness within blog (excluding current post)
    if (slug !== existingPost.slug) {
      const slugConflict = await prisma.post.findUnique({
        where: { blogId_slug: { blogId, slug } },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: "A post with this slug already exists in this blog." },
          { status: 409 }
        );
      }
    }

    // Determine publish date
    const postStatus = status || existingPost.status;
    const publishedAt =
      postStatus === "Published" && !existingPost.publishedAt
        ? new Date()
        : existingPost.publishedAt;

    // Update tags: delete existing and re-create
    await prisma.postTag.deleteMany({ where: { postId } });

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        body: postBody,
        tldr: tldr || null,
        status: postStatus,
        contentLevel: contentLevel ?? existingPost.contentLevel,
        categoryId: categoryId || null,
        featured: featured ?? existingPost.featured,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        jsonLd: jsonLd || undefined,
        faqSchema: faqSchema || undefined,
        relatedPostIds: relatedPostIds || undefined,
        publishedAt,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("PUT /api/blogs/[blogId]/posts error:", error);
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 }
    );
  }
}
