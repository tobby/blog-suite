import type { ReactNode } from "react";
import type { Category } from "@/generated/prisma/client";
import Link from "next/link";

interface PostDocsProps {
  header: ReactNode;
  tldr: ReactNode;
  toc: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  blogSlug: string;
  categories: Category[];
  activeCategory: string | null;
}

export function PostDocs({
  header,
  tldr,
  toc,
  body,
  footer,
  blogSlug,
  categories,
  activeCategory,
}: PostDocsProps) {
  return (
    <>
      {header}

      <div className="flex gap-10">
        {/* Category sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-20 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/${blogSlug}/category/${cat.slug}`}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-neon/10 text-neon font-medium"
                    : "text-slate-400 hover:text-white hover:bg-navy-800"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 max-w-3xl">
          {tldr}

          {/* Mobile ToC */}
          <div className="lg:hidden mb-6">{toc}</div>

          <article>{body}</article>
        </div>

        {/* Desktop ToC */}
        <aside className="hidden xl:block w-56 shrink-0">
          {toc}
        </aside>
      </div>

      {footer}
    </>
  );
}
