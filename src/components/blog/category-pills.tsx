"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: { name: string; slug: string }[];
  activeSlug: string | null;
  blogSlug: string;
}

export function CategoryPills({
  categories,
  activeSlug,
  blogSlug,
}: CategoryPillsProps) {
  const router = useRouter();

  function navigate(slug: string | null) {
    if (slug) {
      router.push(`/blog/${blogSlug}?category=${slug}`);
    } else {
      router.push(`/blog/${blogSlug}`);
    }
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => navigate(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          activeSlug === null
            ? "bg-neon text-navy-950"
            : "bg-navy-800 text-slate-400 hover:bg-navy-700"
        )}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => navigate(category.slug)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            activeSlug === category.slug
              ? "bg-neon text-navy-950"
              : "bg-navy-800 text-slate-400 hover:bg-navy-700"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
