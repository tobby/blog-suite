"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-navy-700 bg-navy-950">
      <div className="flex h-full items-center justify-between px-6">
        <Link href="/studio" className="flex items-center gap-2">
          <span className="text-lg font-bold text-neon">BlogSuite</span>
          <span className="text-sm font-medium text-slate-400">Studio</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          {session?.user && (
            <>
              <span className="text-sm text-slate-400">
                {session.user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
