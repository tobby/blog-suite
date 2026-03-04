import { notFound, redirect } from "next/navigation";
import { Plus, UserCircle, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthorCreateButton } from "./author-create-button";

interface AuthorsPageProps {
  params: Promise<{ blogId: string }>;
}

export default async function AuthorsPage({ params }: AuthorsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role ?? "Analyst";

  // Only ContentManager and Admin can access this page
  if (userRole === "Analyst") {
    redirect(`/studio/${(await params).blogId}`);
  }

  const { blogId } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, name: true },
  });

  if (!blog) notFound();

  const authors = await prisma.author.findMany({
    where: { blogId },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });

  // Fetch users that can be linked to new authors
  const existingUserIds = authors
    .filter((a: { userId: string | null }) => a.userId)
    .map((a: { userId: string | null }) => a.userId as string);

  const availableUsers = await prisma.user.findMany({
    where: {
      id: { notIn: existingUserIds.length > 0 ? existingUserIds : undefined },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Authors
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage author profiles for {blog.name}.
          </p>
        </div>
        <AuthorCreateButton blogId={blogId} availableUsers={availableUsers} />
      </div>

      {/* Authors Grid */}
      {authors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-400">
              No authors yet. Add an author to start assigning posts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author: { id: string; name: string; headshot: string | null; jobTitle: string | null; bio: string | null; user: { id: string; email: string } | null; _count: { posts: number } }) => (
            <Card key={author.id} hoverGlow>
              <CardHeader className="flex-row items-start gap-4 pb-2">
                {author.headshot ? (
                  <img
                    src={author.headshot}
                    alt={author.name}
                    className="h-12 w-12 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-navy-800">
                    <UserCircle className="h-7 w-7 text-slate-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate">
                    {author.name}
                  </h3>
                  {author.jobTitle && (
                    <p className="mt-0.5 text-xs text-slate-400 truncate">
                      {author.jobTitle}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {author.bio && (
                  <p className="mb-3 text-sm text-slate-400 line-clamp-2">
                    {author.bio}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">
                    {author._count.posts}{" "}
                    {author._count.posts === 1 ? "post" : "posts"}
                  </Badge>
                  {author.user && (
                    <span className="text-xs text-slate-500 truncate max-w-[140px]">
                      {author.user.email}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
