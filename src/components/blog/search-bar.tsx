"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { truncate } from "@/lib/utils";

interface SearchResult {
  title: string;
  slug: string;
  metaDescription: string | null;
  category: { name: string } | null;
}

interface SearchBarProps {
  blogSlug: string;
  blogId: string;
}

export function SearchBar({ blogSlug, blogId }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    async function search() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/blogs/${blogId}/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [debouncedQuery, blogId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="h-10 w-full rounded-md border border-border bg-navy-900 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-lg border border-border bg-navy-900 shadow-xl shadow-navy-950/50">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-2">
              {results.map((result) => (
                <li key={result.slug}>
                  <Link
                    href={`/blog/${blogSlug}/${result.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="block px-4 py-3 hover:bg-navy-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-white">
                        {result.title}
                      </span>
                      {result.category && (
                        <span className="shrink-0 rounded-full bg-neon/10 px-2 py-0.5 text-xs text-neon">
                          {result.category.name}
                        </span>
                      )}
                    </div>
                    {result.metaDescription && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                        {truncate(result.metaDescription, 100)}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
