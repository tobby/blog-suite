"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Save, Settings, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

interface BlogSettings {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  customDomain: string | null;
  searchDocsSurface: boolean;
}

export default function SettingsPage() {
  const params = useParams<{ blogId: string }>();
  const blogId = params.blogId;

  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [searchDocsSurface, setSearchDocsSurface] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/settings`);
      if (!res.ok) throw new Error("Failed to fetch settings.");
      const data = await res.json();
      const blog = data.blog;

      setSettings(blog);
      setName(blog.name);
      setSlug(blog.slug);
      setDescription(blog.description ?? "");
      setCustomDomain(blog.customDomain ?? "");
      setSearchDocsSurface(blog.searchDocsSurface);
    } catch {
      setError("Failed to load blog settings.");
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Blog name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Blog slug is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/blogs/${blogId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          customDomain: customDomain.trim() || null,
          searchDocsSurface,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure blog properties and integrations.
        </p>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">
              General Settings
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 max-w-2xl">
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-neon/30 bg-neon/10 px-4 py-3 text-sm text-neon">
                Settings saved successfully.
              </div>
            )}

            <Input
              label="Blog Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Blog"
            />

            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="my-blog"
              helperText="URL-safe identifier used in the blog URL path."
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this blog..."
              rows={3}
            />

            <Input
              label="Custom Domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="blog.example.com"
              helperText="Optional custom domain for this blog."
            />

            {/* Search Docs Surface Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Search Docs Surface
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={searchDocsSurface}
                  onClick={() => setSearchDocsSurface(!searchDocsSurface)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
                    searchDocsSurface ? "bg-neon" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      searchDocsSurface ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-400">
                  {searchDocsSurface ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                When enabled, blog content will be surfaced in search
                documentation results.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
