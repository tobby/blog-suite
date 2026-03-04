"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import NextLink from "next/link";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { SeoSidebar } from "@/components/editor/seo-sidebar";
import { MobileGate } from "@/components/editor/mobile-gate";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function NewPostPage() {
  const params = useParams<{ blogId: string }>();
  const router = useRouter();
  const blogId = params.blogId;

  // Post fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState("Draft");
  const [contentLevel, setContentLevel] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tldr, setTldr] = useState("");
  const [relatedPostIds, setRelatedPostIds] = useState<string[]>([]);

  // Blog metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  // Fetch categories and tags
  useEffect(() => {
    async function fetchMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch(`/api/blogs/${blogId}/categories`),
          fetch(`/api/blogs/${blogId}/posts?_tags=true`),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories ?? []);
        }

        // Tags may come from a dedicated endpoint or be embedded
        if (tagRes.ok) {
          const tagData = await tagRes.json();
          // Extract unique tags from posts if available
          if (tagData.tags) {
            setAvailableTags(tagData.tags);
          }
        }
      } catch {
        // Silently fail -- categories and tags are optional
      }
    }

    fetchMeta();
  }, [blogId]);

  const handleFieldUpdate = useCallback(
    (field: string, value: unknown) => {
      switch (field) {
        case "metaTitle":
          setMetaTitle(value as string);
          break;
        case "metaDescription":
          setMetaDescription(value as string);
          break;
        case "slug":
          setSlugManuallyEdited(true);
          setSlug(value as string);
          break;
        case "status":
          setStatus(value as string);
          break;
        case "contentLevel":
          setContentLevel(value as number);
          break;
        case "categoryId":
          setCategoryId(value as string);
          break;
        case "tags":
          setTags(value as Tag[]);
          break;
        case "tldr":
          setTldr(value as string);
          break;
        case "relatedPostIds":
          setRelatedPostIds(value as string[]);
          break;
      }
    },
    []
  );

  const handleSave = async (publishOverride?: string) => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!body.trim() || body === "<p></p>") {
      setError("Post body is required.");
      return;
    }

    setSaving(true);
    setError("");

    const finalStatus = publishOverride || status;

    try {
      const res = await fetch(`/api/blogs/${blogId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          body,
          tldr: tldr || undefined,
          status: finalStatus,
          contentLevel,
          categoryId: categoryId || undefined,
          tagIds: tags
            .filter((t) => !t.id.startsWith("new-"))
            .map((t) => t.id),
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          relatedPostIds:
            relatedPostIds.length > 0 ? relatedPostIds : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save post.");
        setSaving(false);
        return;
      }

      router.push(`/studio/${blogId}/posts`);
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <MobileGate>
      <div className="flex h-screen flex-col bg-navy-950">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-border bg-navy-900 px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <NextLink
              href={`/studio/${blogId}/posts`}
              className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </NextLink>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Post"
              className="flex-1 bg-transparent text-xl font-bold text-white placeholder:text-slate-600 border-none outline-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            {error && (
              <p className="text-sm text-red-500 mr-2 max-w-xs truncate">
                {error}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave("Published")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-y-auto p-6" style={{ flexBasis: "65%" }}>
            <TipTapEditor
              content={body}
              onChange={setBody}
              placeholder="Start writing your post..."
            />
          </div>

          {/* SEO Sidebar */}
          <SeoSidebar
            title={title}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            slug={slug}
            tags={tags}
            categoryId={categoryId}
            contentLevel={contentLevel}
            status={status}
            relatedPostIds={relatedPostIds}
            tldr={tldr}
            onUpdate={handleFieldUpdate}
            categories={categories}
            availableTags={availableTags}
            blogId={blogId}
          />
        </div>
      </div>
    </MobileGate>
  );
}
