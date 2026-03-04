import type { ReactNode } from "react";

interface PullQuoteProps {
  children: ReactNode;
}

export function PullQuote({ children }: PullQuoteProps) {
  return (
    <blockquote className="relative rounded-lg bg-navy-800 px-10 py-8 my-10 text-center">
      <span
        className="absolute top-4 left-5 text-5xl leading-none text-neon/40 font-serif select-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p className="text-xl italic text-slate-300 leading-relaxed">
        {children}
      </p>
      <span
        className="absolute bottom-4 right-5 text-5xl leading-none text-neon/40 font-serif select-none"
        aria-hidden="true"
      >
        &rdquo;
      </span>
    </blockquote>
  );
}
