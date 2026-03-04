import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Clock, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostStatus } from "@/generated/prisma/client";

interface PostsPageProps {
  params: Promise<{ blogId: string }>;
  searchParams: Promise<{ status?: string; search?: string }>;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "Published":
      return "success" as const;
    case "Draft":
      return "warning" as const;
    case "Unpublished":
      return "danger" as const;
    default:
      return "default" as const;
  }
};

export default async function PostsPage({
  params,
  searchParams,
}: PostsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { blogId } = await params;
  const { status, search } = await searchParams;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, name: true },
  });

  if (!blog) notFound();

  // Build where clause
  const where: Record<string, unknown> = { blogId };

  if (status && Object.values(PostStatus).includes(status as PostStatus)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
    ];
  }

  // Role-based filtering: Analyst can only see their own posts
  const userRole = session.user.role ?? "Analyst";

  if (userRole === "Analyst") {
    const author = await prisma.author.findFirst({
      where: { blogId, userId: session.user.id },
    });

    if (author) {
      where.authorId = author.id;
    } else {
      // Analyst with no author record sees no posts
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Posts
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                You do not have an author profile for this blog yet.
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">
                No posts to display. Contact an admin to create your author
                profile.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Posts
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage content for {blog.name}.
          </p>
        </div>
        <Link href={`/studio/${blogId}/posts/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form
            method="GET"
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="search"
                className="text-sm font-medium text-slate-300"
              >
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="search"
                  name="search"
                  type="text"
                  defaultValue={search ?? ""}
                  placeholder="Search posts..."
                  className="h-10 w-full rounded-md border border-border bg-navy-900 pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="status"
                className="text-sm font-medium text-slate-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={status ?? ""}
                className="h-10 appearance-none rounded-md border border-border bg-navy-900 px-3 py-2 pr-8 text-sm text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Unpublished">Unpublished</option>
              </select>
            </div>
            <Button type="submit" variant="secondary" size="md">
              <Search className="h-4 w-4" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">
                No posts found. Create your first post to get started.
              </p>
              <Link
                href={`/studio/${blogId}/posts/new`}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-neon px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-neon-dim"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="whitespace-nowrap px-6 py-3 font-medium text-slate-400">
                      Title
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium text-slate-400">
                      Status
                    </th>
                    <th className="hidden whitespace-nowrap px-6 py-3 font-medium text-slate-400 md:table-cell">
                      Author
                    </th>
                    <th className="hidden whitespace-nowrap px-6 py-3 font-medium text-slate-400 lg:table-cell">
                      Category
                    </th>
                    <th className="hidden whitespace-nowrap px-6 py-3 font-medium text-slate-400 sm:table-cell">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post: { id: string; title: string; status: string; updatedAt: Date; author: { id: string; name: string }; category: { id: string; name: string } | null }) => (
                    <tr
                      key={post.id}
                      className="transition-colors hover:bg-navy-800/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/studio/${blogId}/posts/${post.id}/edit`}
                          className="font-medium text-white hover:text-neon transition-colors"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={statusBadgeVariant(post.status)}
                          size="sm"
                        >
                          {post.status}
                        </Badge>
                      </td>
                      <td className="hidden px-6 py-4 text-slate-400 md:table-cell">
                        {post.author.name}
                      </td>
                      <td className="hidden px-6 py-4 text-slate-400 lg:table-cell">
                        {post.category?.name ?? "\u2014"}
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(post.updatedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
