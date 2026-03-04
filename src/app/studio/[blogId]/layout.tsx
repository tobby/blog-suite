import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

interface BlogLayoutProps {
  children: React.ReactNode;
  params: Promise<{ blogId: string }>;
}

export default async function BlogLayout({ children, params }: BlogLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { blogId } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, name: true, slug: true },
  });

  if (!blog) {
    notFound();
  }

  const userRole = session.user.role ?? "Analyst";

  return (
    <div className="flex min-h-screen flex-col bg-navy-950">
      <Header />

      <div className="flex flex-1 pt-14">
        <Sidebar blogId={blog.id} userRole={userRole} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
