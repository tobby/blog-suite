import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Eye,
  FilePen,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardPageProps {
  params: Promise<{ blogId: string }>;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "Published":
      return "success";
    case "Draft":
      return "warning";
    case "Unpublished":
      return "danger";
    default:
      return "default";
  }
};

export default async function BlogDashboardPage({ params }: DashboardPageProps) {
  const session = await auth();
  if (!session?.user) notFound();

  const { blogId } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: {
      _count: {
        select: {
          posts: true,
          pageViews: true,
        },
      },
    },
  });

  if (!blog) notFound();

  const [publishedCount, draftCount, recentPosts] = await Promise.all([
    prisma.post.count({
      where: { blogId, status: "Published" },
    }),
    prisma.post.count({
      where: { blogId, status: "Draft" },
    }),
    prisma.post.findMany({
      where: { blogId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: "Total Posts",
      value: blog._count.posts,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: CheckCircle2,
      color: "text-neon",
      bgColor: "bg-neon/10",
      borderColor: "border-neon/30",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: FilePen,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/30",
    },
    {
      label: "Page Views",
      value: blog._count.pageViews,
      icon: Eye,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {blog.name} Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview and recent activity for your blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} hoverGlow>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-slate-400">
                {stat.label}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-md ${stat.bgColor} border ${stat.borderColor}`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {stat.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Posts</h2>
            <p className="text-sm text-slate-400">
              Last {recentPosts.length} updated posts
            </p>
          </div>
          <Link
            href={`/studio/${blogId}/posts`}
            className="flex items-center gap-1 text-sm font-medium text-neon transition-colors hover:text-neon-bright"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">
                No posts yet. Create your first post to get started.
              </p>
              <Link
                href={`/studio/${blogId}/posts/new`}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-neon px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-neon-dim"
              >
                Create Post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/studio/${blogId}/posts/${post.id}/edit`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-navy-800/50 -mx-2 px-2 rounded-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{post.author.name}</span>
                      {post.category && (
                        <>
                          <span className="text-slate-700">/</span>
                          <span>{post.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={statusBadgeVariant(post.status)}
                      size="sm"
                    >
                      {post.status}
                    </Badge>
                    <span className="hidden whitespace-nowrap text-xs text-slate-500 sm:inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
