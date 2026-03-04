import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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

    const categories = await prisma.category.findMany({
      where: { blogId },
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/blogs/[blogId]/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
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
    const { name, slug: providedSlug, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const slug = providedSlug?.trim() || slugify(name);

    // Check for slug uniqueness within blog
    const existing = await prisma.category.findUnique({
      where: { blogId_slug: { blogId, slug } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists in this blog." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        blogId,
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blogs/[blogId]/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
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
    const { id, name, slug: providedSlug, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    // Verify category belongs to this blog
    const existing = await prisma.category.findFirst({
      where: { id, blogId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    const slug = providedSlug?.trim() || slugify(name);

    // Check slug uniqueness (exclude current category)
    const slugConflict = await prisma.category.findFirst({
      where: { blogId, slug, id: { not: id } },
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: "A category with this slug already exists in this blog." },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("PUT /api/blogs/[blogId]/categories error:", error);
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ContentManager and Admin can delete categories
    const userRole = session.user.role ?? "Analyst";
    if (userRole === "Analyst") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { blogId } = await context.params;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    // Verify category belongs to this blog
    const existing = await prisma.category.findFirst({
      where: { id, blogId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    // Unlink posts from this category before deleting
    await prisma.post.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/blogs/[blogId]/categories error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
