import type { ReactNode } from "react";

interface PostSidebarProps {
  header: ReactNode;
  tldr: ReactNode;
  toc: ReactNode;
  body: ReactNode;
  footer: ReactNode;
}

export function PostSidebar({ header, tldr, toc, body, footer }: PostSidebarProps) {
  return (
    <>
      {header}
      {tldr}

      {/* Mobile ToC */}
      <div className="lg:hidden">{toc}</div>

      {/* Two-column layout */}
      <div className="flex gap-10">
        <article className="min-w-0 flex-1 max-w-3xl">
          {body}
        </article>

        {/* Desktop ToC sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          {toc}
        </aside>
      </div>

      {footer}
    </>
  );
}
