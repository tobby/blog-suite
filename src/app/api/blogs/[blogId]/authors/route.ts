import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    const authors = await prisma.author.findMany({
      where: { blogId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ authors });
  } catch (error) {
    console.error("GET /api/blogs/[blogId]/authors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors." },
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

    // Only ContentManager and Admin can create authors
    const userRole = session.user.role ?? "Analyst";
    if (userRole === "Analyst") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { blogId } = await context.params;
    const body = await request.json();
    const { name, jobTitle, bio, userId, headshot } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Author name is required." },
        { status: 400 }
      );
    }

    // Verify blog exists
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    // If userId is provided, check for duplicates in this blog
    if (userId) {
      const existingAuthor = await prisma.author.findUnique({
        where: { blogId_userId: { blogId, userId } },
      });

      if (existingAuthor) {
        return NextResponse.json(
          { error: "This user already has an author profile in this blog." },
          { status: 409 }
        );
      }

      // Verify user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json(
          { error: "Linked user not found." },
          { status: 404 }
        );
      }
    }

    const author = await prisma.author.create({
      data: {
        blogId,
        name: name.trim(),
        jobTitle: jobTitle?.trim() || null,
        bio: bio?.trim() || null,
        userId: userId || null,
        headshot: headshot?.trim() || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ author }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blogs/[blogId]/authors error:", error);
    return NextResponse.json(
      { error: "Failed to create author." },
      { status: 500 }
    );
  }
}
