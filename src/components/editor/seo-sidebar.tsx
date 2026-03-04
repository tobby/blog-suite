"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { SEO_LIMITS, CONTENT_LEVELS, POST_STATUSES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SerpPreview } from "./serp-preview";

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

interface SeoSidebarProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  tags: Tag[];
  categoryId: string;
  contentLevel: number;
  status: string;
  relatedPostIds: string[];
  tldr: string;
  onUpdate: (field: string, value: unknown) => void;
  categories: Category[];
  availableTags: Tag[];
  blogId: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
      {children}
    </p>
  );
}

function SectionDivider() {
  return <div className="border-b border-border" />;
}

function CharacterCounter({
  count,
  amberAt,
  redAt,
}: {
  count: number;
  amberAt: number;
  redAt: number;
}) {
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        count < amberAt && "text-slate-400",
        count >= amberAt && count < redAt && "text-amber-400",
        count >= redAt && "text-red-500"
      )}
    >
      {count}/{redAt}
    </span>
  );
}

export function SeoSidebar({
  title,
  metaTitle,
  metaDescription,
  slug: postSlug,
  tags,
  categoryId,
  contentLevel,
  status,
  relatedPostIds,
  tldr,
  onUpdate,
  categories,
  availableTags,
  blogId,
}: SeoSidebarProps) {
  const [tagInput, setTagInput] = useState("");

  const handleSlugChange = (value: string) => {
    onUpdate("slug", slugify(value));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    // Check if tag already exists in available tags
    const existingTag = availableTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (existingTag) {
      // Don't add duplicates
      if (tags.some((t) => t.id === existingTag.id)) {
        setTagInput("");
        return;
      }
      onUpdate("tags", [...tags, existingTag]);
    } else {
      // Create a temporary tag with a generated slug
      const newTag: Tag = {
        id: `new-${slugify(trimmed)}`,
        name: trimmed,
        slug: slugify(trimmed),
      };
      if (tags.some((t) => t.slug === newTag.slug)) {
        setTagInput("");
        return;
      }
      onUpdate("tags", [...tags, newTag]);
    }

    setTagInput("");
  };

  const handleRemoveTag = (tagId: string) => {
    onUpdate(
      "tags",
      tags.filter((t) => t.id !== tagId)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const blogSlug = "blog"; // Placeholder -- resolved from blog data at runtime
  const previewUrl = `/${blogSlug}/${postSlug || "post-slug"}`;

  return (
    <aside className="w-[360px] shrink-0 overflow-y-auto border-l border-border bg-navy-900 p-4 space-y-5">
      {/* Status */}
      <div>
        <SectionLabel>Status</SectionLabel>
        <div className="flex items-center gap-3">
          {POST_STATUSES.map((s) => (
            <label
              key={s}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => onUpdate("status", s)}
                className="accent-neon h-3.5 w-3.5"
              />
              <span
                className={cn(
                  "text-sm",
                  status === s ? "text-white font-medium" : "text-slate-400"
                )}
              >
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Slug */}
      <div>
        <SectionLabel>Slug</SectionLabel>
        <Input
          value={postSlug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="post-slug"
        />
        <p className="mt-1.5 text-xs text-slate-500 font-mono truncate">
          /blog/{blogId.slice(0, 8)}/{postSlug || "..."}
        </p>
      </div>

      <SectionDivider />

      {/* Meta Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Meta Title</SectionLabel>
          <CharacterCounter
            count={metaTitle.length}
            amberAt={SEO_LIMITS.title.amber}
            redAt={SEO_LIMITS.title.red}
          />
        </div>
        <Input
          value={metaTitle}
          onChange={(e) => onUpdate("metaTitle", e.target.value)}
          placeholder={title || "Enter meta title..."}
        />
      </div>

      <SectionDivider />

      {/* Meta Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Meta Description</SectionLabel>
          <CharacterCounter
            count={metaDescription.length}
            amberAt={SEO_LIMITS.metaDescription.amber}
            redAt={SEO_LIMITS.metaDescription.red}
          />
        </div>
        <Textarea
          value={metaDescription}
          onChange={(e) => onUpdate("metaDescription", e.target.value)}
          placeholder="Write a compelling meta description..."
          rows={3}
        />
      </div>

      <SectionDivider />

      {/* SERP Preview */}
      <div>
        <SerpPreview
          title={metaTitle || title}
          url={previewUrl}
          description={metaDescription}
        />
      </div>

      <SectionDivider />

      {/* Content Level */}
      <div>
        <SectionLabel>Content Level</SectionLabel>
        <div className="space-y-2">
          {Object.entries(CONTENT_LEVELS).map(([key, level]) => {
            const numKey = Number(key);
            return (
              <label
                key={key}
                className="flex items-start gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="contentLevel"
                  value={key}
                  checked={contentLevel === numKey}
                  onChange={() => onUpdate("contentLevel", numKey)}
                  className="accent-neon mt-0.5 h-3.5 w-3.5"
                />
                <div>
                  <span
                    className={cn(
                      "text-sm",
                      contentLevel === numKey
                        ? "text-white font-medium"
                        : "text-slate-400"
                    )}
                  >
                    {level.label}
                  </span>
                  <p className="text-xs text-slate-500">{level.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* Category */}
      <div>
        <SectionLabel>Category</SectionLabel>
        <Select
          value={categoryId}
          onChange={(e) => onUpdate("categoryId", e.target.value)}
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <SectionDivider />

      {/* Tags */}
      <div>
        <SectionLabel>Tags</SectionLabel>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="default" size="sm">
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 inline-flex items-center hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {availableTags.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 mb-1">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {availableTags
                .filter((at) => !tags.some((t) => t.id === at.id))
                .slice(0, 8)
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onUpdate("tags", [...tags, tag])}
                    className="rounded-full border border-border px-2 py-0.5 text-xs text-slate-500 hover:border-neon/30 hover:text-slate-300 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* TL;DR */}
      <div>
        <SectionLabel>TL;DR</SectionLabel>
        <Textarea
          value={tldr}
          onChange={(e) => onUpdate("tldr", e.target.value)}
          placeholder="Brief summary of this post..."
          rows={3}
        />
      </div>

      <SectionDivider />

      {/* Related Posts */}
      <div>
        <SectionLabel>Related Posts</SectionLabel>
        <p className="text-xs text-slate-500">
          Select up to 3 related posts{" "}
          {relatedPostIds.length > 0 && (
            <span className="text-slate-400">
              ({relatedPostIds.length} selected)
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-600 italic">
          Enhanced selection coming soon.
        </p>
      </div>
    </aside>
  );
}
