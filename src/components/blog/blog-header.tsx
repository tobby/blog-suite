"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function BlogHeader({ blogName }: { blogName: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border bg-navy-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-white">{blogName}</h1>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
