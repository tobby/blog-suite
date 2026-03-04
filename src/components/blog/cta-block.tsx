import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CtaBlockProps {
  contentLevel: number;
  category: string;
}

const CTA_CONFIG: Record<
  number,
  { heading: string; description: string; label: string; href: string }
> = {
  1: {
    heading: "Ready to see it in action?",
    description:
      "Schedule a personalized demo with our team and discover how ProfiledRisk can transform your security posture.",
    label: "Schedule a demo",
    href: "/demo",
  },
  2: {
    heading: "Need expert guidance?",
    description:
      "Connect directly with our threat intelligence analysts to discuss your unique security challenges.",
    label: "Talk to our analysts",
    href: "/contact",
  },
  3: {
    heading: "Build on our platform",
    description:
      "Integrate ProfiledRisk into your existing workflows with our comprehensive API documentation.",
    label: "Explore our API docs",
    href: "/docs/api",
  },
};

export function CtaBlock({ contentLevel, category }: CtaBlockProps) {
  const config = CTA_CONFIG[contentLevel] ?? CTA_CONFIG[1]!;

  return (
    <div className="rounded-lg border border-neon/20 bg-navy-800 p-8 my-10 text-center">
      <h3 className="text-xl font-bold text-white mb-2">{config.heading}</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        {config.description}
      </p>
      <Link
        href={config.href}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
          "bg-neon text-navy-950 hover:bg-neon-dim shadow-sm shadow-neon/20",
          "h-12 px-6 text-base"
        )}
      >
        {config.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="text-xs text-slate-600 mt-4">Related to: {category}</p>
    </div>
  );
}
