import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BLOG_TEMPLATES } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ blogId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blogId } = await context.params;

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        template: true,
        customDomain: true,
        searchDocsSurface: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("GET /api/blogs/[blogId]/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog settings." },
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

    // Only Admin can update blog settings
    const userRole = session.user.role ?? "Analyst";
    if (userRole !== "Admin") {
      return NextResponse.json(
        { error: "Only admins can update blog settings." },
        { status: 403 }
      );
    }

    const { blogId } = await context.params;
    const body = await request.json();
    const { name, slug, description, template, customDomain, searchDocsSurface } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Blog name is required." },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "Blog slug is required." },
        { status: 400 }
      );
    }

    // Verify blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    // Check slug uniqueness (exclude current blog)
    if (slug !== existingBlog.slug) {
      const slugConflict = await prisma.blog.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: "A blog with this slug already exists." },
          { status: 409 }
        );
      }
    }

    const validTemplate = template && template in BLOG_TEMPLATES ? template : undefined;

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        ...(validTemplate !== undefined && { template: validTemplate }),
        customDomain: customDomain?.trim() || null,
        searchDocsSurface: searchDocsSurface ?? existingBlog.searchDocsSurface,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        template: true,
        customDomain: true,
        searchDocsSurface: true,
      },
    });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("PUT /api/blogs/[blogId]/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update blog settings." },
      { status: 500 }
    );
  }
}
