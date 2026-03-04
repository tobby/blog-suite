import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, LayoutGrid, Clock, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function StudioHomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const blogs = await prisma.blog.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-navy-950">
      <Header />

      <main className="flex-1 px-6 pb-10 pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-300">Your Blogs</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your content platforms
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LayoutGrid className="h-4 w-4" />
              {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-navy-700 bg-navy-900/50 px-6 py-20">
              <FileText className="mb-4 h-12 w-12 text-slate-600" />
              <h2 className="text-lg font-medium text-slate-300">
                No blogs yet
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create your first blog to get started
              </p>
              <Link
                href="/studio/new"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-neon px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-neon-dim"
              >
                <Plus className="h-4 w-4" />
                Create New Blog
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/studio/${blog.id}`}>
                  <Card hoverGlow className="flex h-full flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-300">
                          {blog.name}
                        </h3>
                        <Badge size="sm">{blog.template}</Badge>
                      </div>
                      {blog.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {blog.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardFooter className="mt-auto border-t border-navy-700 pt-4">
                      <div className="flex w-full items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {blog._count.posts}{" "}
                          {blog._count.posts === 1 ? "post" : "posts"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(blog.updatedAt)}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}

              <Link href="/studio/new">
                <Card className="flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center border-dashed border-navy-700 transition-colors hover:border-neon/30 hover:bg-navy-900/80">
                  <Plus className="mb-2 h-8 w-8 text-slate-600" />
                  <span className="text-sm font-medium text-slate-500">
                    Create New Blog
                  </span>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
