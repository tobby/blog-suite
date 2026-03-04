"use client";

import { useEffect } from "react";

interface AnalyticsTrackerProps {
  blogId: string;
  postId: string;
  path: string;
}

export function AnalyticsTracker({ blogId, postId, path }: AnalyticsTrackerProps) {
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/blogs/${blogId}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        path,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
      signal: controller.signal,
    }).catch(() => {
      // Silently fail - analytics should not block UX
    });

    return () => controller.abort();
  }, [blogId, postId, path]);

  return null;
}
