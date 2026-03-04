"use client";

import { useRef, useEffect } from "react";
import { CodeBlock } from "@/components/blog/code-block";
import { createPortal } from "react-dom";
import { useState } from "react";

interface PostBodyClientProps {
  html: string;
}

/**
 * Client-side post body renderer.
 * Renders HTML content with prose styling and wraps `pre` blocks
 * with CodeBlock components for copy functionality.
 */
export function PostBodyClient({ html }: PostBodyClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [preElements, setPreElements] = useState<HTMLPreElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all <pre> elements and wrap them with CodeBlock portals
    const pres = Array.from(containerRef.current.querySelectorAll("pre"));
    setPreElements(pres);

    // Add IDs to headings that don't have them (for ToC linking)
    const headings = containerRef.current.querySelectorAll("h2, h3, h4");
    headings.forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent ?? "";
        heading.id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
    });
  }, [html]);

  return (
    <>
      <div
        ref={containerRef}
        className="prose prose-invert max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-neon prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-code:text-neon prose-code:bg-navy-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-navy-900 prose-pre:border prose-pre:border-border prose-pre:rounded-lg
          prose-blockquote:border-neon prose-blockquote:text-slate-400
          prose-li:text-slate-300
          prose-img:rounded-lg
          prose-hr:border-border"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Wrap pre elements with CodeBlock portals */}
      {preElements.map((pre, index) => {
        // Create a wrapper div around the pre element
        if (!pre.parentElement?.classList.contains("code-block-wrapper")) {
          const wrapper = document.createElement("div");
          wrapper.className = "code-block-wrapper";
          pre.parentNode?.insertBefore(wrapper, pre);
          wrapper.appendChild(pre);
        }
        const wrapper = pre.parentElement;
        if (!wrapper) return null;

        return createPortal(
          <CodeBlock key={index}>
            <pre
              className={pre.className}
              dangerouslySetInnerHTML={{ __html: pre.innerHTML }}
            />
          </CodeBlock>,
          wrapper
        );
      })}
    </>
  );
}
