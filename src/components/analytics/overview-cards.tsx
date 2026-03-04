import { Eye, TrendingUp, FileText, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OverviewCardsProps {
  totalViews: number;
  viewsThisWeek: number;
  totalPosts: number;
  topReferrer: string;
  previousWeekViews?: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function OverviewCards({
  totalViews,
  viewsThisWeek,
  totalPosts,
  topReferrer,
  previousWeekViews,
}: OverviewCardsProps) {
  const weekChange =
    previousWeekViews && previousWeekViews > 0
      ? ((viewsThisWeek - previousWeekViews) / previousWeekViews) * 100
      : null;

  const stats = [
    {
      label: "Total Views",
      value: formatNumber(totalViews),
      icon: Eye,
      change: null,
    },
    {
      label: "Views This Week",
      value: formatNumber(viewsThisWeek),
      icon: TrendingUp,
      change: weekChange,
    },
    {
      label: "Total Posts",
      value: formatNumber(totalPosts),
      icon: FileText,
      change: null,
    },
    {
      label: "Top Referrer",
      value: topReferrer || "Direct",
      icon: Globe,
      change: null,
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span
                  className={cn(
                    "font-bold tracking-tight",
                    stat.isText ? "text-lg text-slate-300" : "text-2xl text-white"
                  )}
                >
                  {stat.value}
                </span>
                <span className="text-sm text-slate-400">{stat.label}</span>
              </div>
              <div className="rounded-md bg-navy-800 p-2">
                <Icon className="h-5 w-5 text-neon" />
              </div>
            </div>
            {stat.change !== null && (
              <div className="mt-3 flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    stat.change >= 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {stat.change >= 0 ? "\u2191" : "\u2193"}{" "}
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">vs last week</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
