"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { Monitor, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DESKTOP_MIN_WIDTH = 1024;

export function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < DESKTOP_MIN_WIDTH);
      setChecked(true);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Avoid flash of content before checking
  if (!checked) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950 px-6 text-center">
        <Monitor className="mb-6 h-16 w-16 text-neon/60" />
        <h1 className="text-xl font-bold text-white mb-2">
          The editor requires a desktop viewport (1024px+)
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          You can view blog content on mobile, but editing is desktop-only.
        </p>
        <NextLink href="/studio">
          <Button variant="ghost" size="md">
            <ArrowLeft className="h-4 w-4" />
            Back to Studio
          </Button>
        </NextLink>
      </div>
    );
  }

  return <>{children}</>;
}
