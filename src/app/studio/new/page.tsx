"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn, slugify } from "@/lib/utils";
import { BLOG_TEMPLATES, type TemplateKey } from "@/lib/constants";

const templateKeys = Object.keys(BLOG_TEMPLATES) as TemplateKey[];

export default function CreateBlogPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("blank");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Blog name is required");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), description: description.trim(), template }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create blog");
      }

      const blog = await res.json();
      router.push(`/studio/${blog.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-950">
      <Header />

      <main className="flex-1 px-6 pb-10 pt-20">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/studio"
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Link>

          <h1 className="mb-8 text-2xl font-bold text-slate-300">
            Create New Blog
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <Input
              label="Blog Name"
              placeholder="e.g., Fraud Intelligence Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Slug"
              placeholder="fraud-intelligence-hub"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              helperText="URL-friendly identifier. Auto-generated from the name."
              required
            />

            <Textarea
              label="Description"
              placeholder="Briefly describe what this blog is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxCharacters={300}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                Template
              </label>
              <p className="text-xs text-slate-500">
                Templates pre-configure categories and tags. You can customize
                them later.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {templateKeys.map((key) => {
                  const tmpl = BLOG_TEMPLATES[key];
                  const isSelected = template === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTemplate(key)}
                      className="text-left"
                    >
                      <Card
                        className={cn(
                          "cursor-pointer p-4 transition-colors",
                          isSelected
                            ? "border-neon bg-neon/5 shadow-sm shadow-neon/10"
                            : "hover:border-navy-600"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-3 w-3 rounded-full border-2",
                              isSelected
                                ? "border-neon bg-neon"
                                : "border-slate-600 bg-transparent"
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-neon" : "text-slate-300"
                            )}
                          >
                            {tmpl.label}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {tmpl.description}
                        </p>
                        {tmpl.categories.length > 0 && (
                          <p className="mt-2 text-xs text-slate-600">
                            {tmpl.categories.length} categories &middot;{" "}
                            {tmpl.tags.length} tags
                          </p>
                        )}
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-navy-700 pt-6">
              <Link href="/studio">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={loading}>
                Create Blog
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
