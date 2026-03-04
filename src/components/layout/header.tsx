"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-navy-700 bg-navy-950">
      <div className="flex h-full items-center justify-between px-6">
        <Link href="/studio" className="flex items-center gap-2">
          <span className="text-lg font-bold text-neon">ProfiledRisk</span>
          <span className="text-sm font-medium text-slate-400">Studio</span>
        </Link>

        <div className="flex items-center gap-4">
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
