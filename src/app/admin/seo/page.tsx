"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Shield,
  Image as ImageIcon,
  Map,
  Save,
  CheckCircle2,
  AlertCircle,
  Bot,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AI_BOTS = [
  { id: "GPTBot", label: "GPTBot", description: "OpenAI web crawler" },
  { id: "ChatGPT-User", label: "ChatGPT-User", description: "ChatGPT browsing" },
  { id: "ClaudeBot", label: "ClaudeBot", description: "Anthropic web crawler" },
  { id: "anthropic-ai", label: "Anthropic", description: "Anthropic training crawler" },
  { id: "Google-Extended", label: "Google-Extended", description: "Google AI training" },
  { id: "CCBot", label: "CCBot", description: "Common Crawl bot" },
  { id: "PerplexityBot", label: "PerplexityBot", description: "Perplexity AI crawler" },
] as const;

interface SitemapConfig {
  autoGenerate: boolean;
  changeFrequency: string;
  defaultPriority: number;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface GlobalSettingsData {
  llmTags: string[];
  sitemapConfig: SitemapConfig;
  ogDefaultImage?: string;
  faqSchema?: FaqItem[];
}

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function SEOSettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [blockedBots, setBlockedBots] = useState<string[]>([]);
  const [ogImage, setOgImage] = useState("");
  const [sitemapConfig, setSitemapConfig] = useState<SitemapConfig>({
    autoGenerate: true,
    changeFrequency: "weekly",
    defaultPriority: 0.7,
  });
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/global-settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data: GlobalSettingsData = await res.json();
        setBlockedBots(data.llmTags ?? []);
        if (data.sitemapConfig) {
          setSitemapConfig(data.sitemapConfig);
        }
        if (data.ogDefaultImage) {
          setOgImage(data.ogDefaultImage);
        }
        if (data.faqSchema && Array.isArray(data.faqSchema)) {
          setFaqItems(data.faqSchema);
        }
      } catch {
        setToast({ type: "error", message: "Failed to load settings." });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function toggleBot(botId: string) {
    setBlockedBots((prev) =>
      prev.includes(botId)
        ? prev.filter((b) => b !== botId)
        : [...prev, botId]
    );
  }

  function addFaqItem() {
    setFaqItems((prev) => [...prev, { question: "", answer: "" }]);
  }

  function updateFaqItem(index: number, field: "question" | "answer", value: string) {
    setFaqItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeFaqItem(index: number) {
    setFaqItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const validFaq = faqItems.filter(
        (item) => item.question.trim() && item.answer.trim()
      );
      const res = await fetch("/api/global-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmTags: blockedBots,
          sitemapConfig,
          ogDefaultImage: ogImage || null,
          faqSchema: validFaq.length > 0 ? validFaq : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setToast({ type: "success", message: "Settings saved successfully." });
    } catch {
      setToast({ type: "error", message: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-navy-950 pt-14">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (session?.user?.role !== "Admin") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-navy-950 pt-14">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <Card className="p-10 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h2 className="text-xl font-bold text-white">Access Denied</h2>
              <p className="mt-2 text-slate-400">
                You need Admin privileges to access global SEO settings.
              </p>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-navy-950 pt-14">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Global SEO Settings
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Configure platform-wide SEO, AI crawler access, and sitemap
              generation.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* LLM/AI Crawl Tagging */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-neon" />
                  <h2 className="text-lg font-semibold text-white">
                    LLM / AI Crawl Tagging
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Select AI bots to disallow in robots.txt. Checked bots will be
                  blocked from crawling your content.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {AI_BOTS.map((bot) => {
                    const isBlocked = blockedBots.includes(bot.id);
                    return (
                      <label
                        key={bot.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                          isBlocked
                            ? "border-neon/30 bg-neon/5"
                            : "border-navy-700 bg-navy-800/50 hover:border-navy-600"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isBlocked}
                          onChange={() => toggleBot(bot.id)}
                          className="mt-0.5 h-4 w-4 rounded border-navy-600 bg-navy-900 text-neon accent-[#00FF88] focus:ring-neon/50"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-300">
                            {bot.label}
                          </span>
                          <p className="text-xs text-slate-500">
                            {bot.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Default OG Image */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-neon" />
                  <h2 className="text-lg font-semibold text-white">
                    Default OG Image
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Fallback Open Graph image used when posts don&apos;t have a custom
                  OG image set.
                </p>
              </CardHeader>
              <CardContent>
                <Input
                  label="Image URL"
                  placeholder="https://example.com/og-default.png"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  helperText="Recommended size: 1200x630 pixels"
                />
                {ogImage && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-slate-400">
                      Preview
                    </p>
                    <div className="overflow-hidden rounded-md border border-navy-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ogImage}
                        alt="OG Image Preview"
                        className="h-auto max-h-48 w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FAQ Schema Builder */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-neon" />
                  <h2 className="text-lg font-semibold text-white">
                    FAQ Schema Builder
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Add Q&A pairs to generate FAQPage structured data (JSON-LD) for
                  rich search results.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-navy-700 bg-navy-800/50 p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="shrink-0 rounded-full bg-neon/10 px-2 py-0.5 text-xs text-neon">
                          Q{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        placeholder="Question..."
                        value={item.question}
                        onChange={(e) =>
                          updateFaqItem(index, "question", e.target.value)
                        }
                      />
                      <textarea
                        placeholder="Answer..."
                        value={item.answer}
                        onChange={(e) =>
                          updateFaqItem(index, "answer", e.target.value)
                        }
                        rows={2}
                        className="w-full rounded-md border border-border bg-navy-900 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon resize-none"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-navy-600 py-3 text-sm text-slate-400 hover:border-neon/30 hover:text-slate-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Q&A Pair
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Sitemap Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-neon" />
                  <h2 className="text-lg font-semibold text-white">
                    Sitemap Configuration
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Control automatic sitemap generation and default settings for
                  all blog entries.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-5">
                  {/* Auto-generate toggle */}
                  <label className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={sitemapConfig.autoGenerate}
                        onChange={(e) =>
                          setSitemapConfig((prev) => ({
                            ...prev,
                            autoGenerate: e.target.checked,
                          }))
                        }
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 cursor-pointer rounded-full bg-navy-700 transition-colors peer-checked:bg-neon/30 peer-focus:ring-2 peer-focus:ring-neon/50" />
                      <div className="absolute left-0.5 top-0.5 h-5 w-5 cursor-pointer rounded-full bg-slate-400 transition-all peer-checked:left-[22px] peer-checked:bg-neon" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                      Auto-generate sitemaps
                    </span>
                  </label>

                  {/* Change Frequency */}
                  <Select
                    label="Default Change Frequency"
                    value={sitemapConfig.changeFrequency}
                    onChange={(e) =>
                      setSitemapConfig((prev) => ({
                        ...prev,
                        changeFrequency: e.target.value,
                      }))
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>

                  {/* Default Priority */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Default Priority
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={sitemapConfig.defaultPriority}
                        onChange={(e) =>
                          setSitemapConfig((prev) => ({
                            ...prev,
                            defaultPriority: parseFloat(e.target.value),
                          }))
                        }
                        className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-navy-700 accent-[#00FF88] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon"
                      />
                      <span className="w-10 text-center text-sm font-mono font-semibold text-neon">
                        {sitemapConfig.defaultPriority.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Values range from 0.1 (lowest) to 1.0 (highest)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={cn(
              "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg transition-all",
              toast.type === "success"
                ? "border-neon/30 bg-navy-900 text-neon"
                : "border-red-500/30 bg-navy-900 text-red-400"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}
      </main>
    </>
  );
}
