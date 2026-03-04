import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const { blogId } = await params;

  try {
    const body = await request.json();
    const { postId, path, referrer, userAgent } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    await prisma.pageView.create({
      data: {
        blogId,
        postId: postId || null,
        path,
        referrer: referrer || null,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to record page view" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const { blogId } = await params;

  try {
    // Total views
    const totalViews = await prisma.pageView.count({
      where: { blogId },
    });

    // Views by day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentViews = await prisma.pageView.findMany({
      where: {
        blogId,
        timestamp: { gte: thirtyDaysAgo },
      },
      select: {
        timestamp: true,
      },
      orderBy: { timestamp: "asc" },
    });

    // Group by day
    const viewsByDay: Record<string, number> = {};
    for (const view of recentViews) {
      const day = view.timestamp.toISOString().split("T")[0];
      viewsByDay[day] = (viewsByDay[day] ?? 0) + 1;
    }

    // Top posts by views
    const topPostViews = await prisma.pageView.groupBy({
      by: ["postId"],
      where: {
        blogId,
        postId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // Fetch post details for the top posts
    const postIds = topPostViews
      .map((v: { postId: string | null }) => v.postId)
      .filter((id: string | null): id is string => id !== null);

    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    const postMap = new Map(
      posts.map((p: { id: string; title: string; slug: string }) => [p.id, p])
    );

    const topPosts = topPostViews
      .filter((v: { postId: string | null }) => v.postId && postMap.has(v.postId))
      .map((v: { postId: string | null; _count: { id: number } }) => ({
        post: postMap.get(v.postId!)!,
        views: v._count.id,
      }));

    return NextResponse.json({
      totalViews,
      viewsByDay,
      topPosts,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
