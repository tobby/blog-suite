import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BLOG_TEMPLATES } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blogs = await prisma.blog.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return NextResponse.json(blogs);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; slug?: string; description?: string; template?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, slug, description, template } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!slug?.trim()) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json(
      { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A blog with this slug already exists" },
      { status: 409 }
    );
  }

  const templateKey = template && template in BLOG_TEMPLATES
    ? template
    : "clean";

  const blog = await prisma.blog.create({
    data: {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      template: templateKey,
      settings: {
        create: {},
      },
    },
    include: {
      settings: true,
      _count: {
        select: { posts: true },
      },
    },
  });

  return NextResponse.json(blog, { status: 201 });
}
