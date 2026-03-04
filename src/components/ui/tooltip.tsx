import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

function Tooltip({
  content,
  position = "top",
  className,
  children,
  ...props
}: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={cn("group relative inline-flex", className)}
      data-tooltip={content}
      {...props}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-navy-800 px-2.5 py-1 text-xs text-slate-300 shadow-lg",
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          positionClasses[position]
        )}
      >
        {content}
      </span>
    </div>
  );
}

export { Tooltip };
