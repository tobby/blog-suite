"use client";

import { truncate } from "@/lib/utils";

interface SerpPreviewProps {
  title: string;
  url: string;
  description: string;
}

export function SerpPreview({ title, url, description }: SerpPreviewProps) {
  const displayTitle = title
    ? truncate(title, 60)
    : "Page Title";
  const displayDescription = description
    ? truncate(description, 160)
    : "Add a meta description to see how this post will appear in search results.";

  return (
    <div className="rounded-lg bg-navy-800 p-4 space-y-1.5">
      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
        SERP Preview
      </p>
      <p className="text-sm text-neon-dim truncate">
        {url || "https://example.com/blog/..."}
      </p>
      <p className="text-base font-medium text-neon leading-snug">
        {displayTitle}
      </p>
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
        {displayDescription}
      </p>
    </div>
  );
}
