import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const { blogId } = await params;
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();

  if (!query || query.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { searchDocsSurface: true },
    });

    const posts = await prisma.post.findMany({
      where: {
        blogId,
        status: "Published",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { metaDescription: { contains: query, mode: "insensitive" } },
          { tldr: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        metaDescription: true,
        category: {
          select: { name: true },
        },
      },
      take: 10,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({
      posts,
      searchDocsSurface: blog?.searchDocsSurface ?? false,
    });
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
