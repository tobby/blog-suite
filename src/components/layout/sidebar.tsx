"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  blogId: string;
  userRole: string;
}

const navItems = [
  {
    label: "Dashboard",
    href: "",
    icon: LayoutDashboard,
    roles: ["Analyst", "ContentManager", "Admin"],
  },
  {
    label: "Posts",
    href: "/posts",
    icon: FileText,
    roles: ["Analyst", "ContentManager", "Admin"],
  },
  {
    label: "Categories",
    href: "/categories",
    icon: FolderOpen,
    roles: ["Analyst", "ContentManager", "Admin"],
  },
  {
    label: "Authors",
    href: "/authors",
    icon: Users,
    roles: ["ContentManager", "Admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["Admin"],
  },
];

export function Sidebar({ blogId, userRole }: SidebarProps) {
  const pathname = usePathname();

  const basePath = `/studio/${blogId}`;

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="flex h-full w-60 flex-col border-r border-navy-700 bg-navy-950">
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map((item) => {
          const fullHref = `${basePath}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(fullHref);

          return (
            <Link
              key={item.label}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-neon bg-navy-900 text-neon"
                  : "border-l-2 border-transparent text-slate-400 hover:bg-navy-900 hover:text-slate-300"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
