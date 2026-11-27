"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Image as ImageIcon, Plus, RotateCcw, Save, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Input, Loading, Pick, Pill, Section } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { collections } from "@/components/static/collection-data";
import { Button, ButtonLink } from "@/components/ui/Button";
import { db, type Json } from "@/lib/backend/admin";
import { categories as builtinCategories, products as builtinProducts } from "@/lib/catalog";
import { classNames } from "@/lib/format";
import { makeNavId } from "@/lib/header-nav";
import {
  buildDefaultHeroConfig,
  HERO_PROMPT_TEMPLATES,
  HERO_RESOLUTION_PRESETS,
  normalizeHeroConfig,
  type HeroOverlayMode,
  type HeroRatioKey,
  type HeroSectionConfig,
  type HeroSlideConfig
} from "@/lib/hero-content";
import { imageUrl } from "@/lib/media";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/state/toast";

const RATIO_SLOTS: { key: HeroRatioKey; label: string; ratioHint: string; boxAspect: string }[] = [
  { key: "desktop", label: "Desktop image (required)", ratioHint: "16:7 or 16:9 · e.g. 1600×700 or 1920×1080", boxAspect: "aspect-[16/7]" },
  { key: "tablet", label: "Tablet override (optional)", ratioHint: "4:3 · e.g. 1200×900", boxAspect: "aspect-[4/3]" },
  { key: "mobile", label: "Mobile override (optional)", ratioHint: "4:5 or 1:1 · e.g. 1080×1350", boxAspect: "aspect-[4/5]" }
];

async function renderExactResolutionBlob(
  source: Blob | string,
  targetWidth: number | null,
  targetHeight: number | null,
  mimeType = "image/webp"
): Promise<Blob> {
  const srcUrl = typeof source === "string" ? source : URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image."));
      el.src = srcUrl;
    });

    const w = targetWidth ?? img.naturalWidth;
    const h = targetHeight ?? img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");

    // Center-cover crop to target aspect ratio without stretching
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (w - drawW) / 2;
    const dy = (h - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.9));
    if (!blob) throw new Error("Failed to encode image.");
    return blob;
  } finally {
    if (typeof source !== "string") URL.revokeObjectURL(srcUrl);
  }
}

async function uploadHeroBlob(blob: Blob, slideId: string, slot: HeroRatioKey, ext = "webp"): Promise<string> {
  const filename = `${makeNavId(slideId)}-${slot}-${Date.now()}.${ext}`;
  const path = `hero/${filename}`;
  const { error } = await db()
    .storage
    .from("product-media")
    .upload(path, blob, { contentType: blob.type || "image/webp", upsert: false });
  if (error) throw new Error(error.message);
  return db().storage.from("product-media").getPublicUrl(path).data.publicUrl;
}

export function HeroManager() {
  const toast = useToast();
  const q = useAdminQuery(async () => {
    const { data, error } = await db()
      .from("site_content")
      .select("value")
      .eq("key", "hero_config")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value ? normalizeHeroConfig(data.value) : null;
  });

  const [draft, setDraft] = useState<HeroSectionConfig>(() => buildDefaultHeroConfig());
  const [selectedId, setSelectedId] = useState<string>(() => buildDefaultHeroConfig().slides[0]?.id ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<HeroRatioKey | null>(null);

  // AI Image Generator state
  const [aiSlot, setAiSlot] = useState<HeroRatioKey>("desktop");
  const [resPresetId, setResPresetId] = useState<string>("desktop-wide");
  const [customWidth, setCustomWidth] = useState<string>("1600");
  const [customHeight, setCustomHeight] = useState<string>("700");
  const [aiPrompt, setAiPrompt] = useState<string>(HERO_PROMPT_TEMPLATES[0].prompt);
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "openai">("auto");
  const [aiApiKey, setAiApiKey] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (q.data === undefined) return;
    const loaded = q.data ?? buildDefaultHeroConfig();
    setDraft(loaded);
    setSelectedId((cur) => (loaded.slides.some((s) => s.id === cur) ? cur : loaded.slides[0]?.id ?? ""));
    setDirty(false);
  }, [q.data]);

  const selectedSlide = draft.slides.find((s) => s.id === selectedId) ?? draft.slides[0] ?? null;

  const mutate = (updater: (cur: HeroSectionConfig) => HeroSectionConfig) => {
    setDraft((cur) => updater(cur));
    setDirty(true);
  };

  const patchSlide = (patch: Partial<HeroSlideConfig>) => {
    if (!selectedSlide) return;
    mutate((cur) => ({
      ...cur,
      slides: cur.slides.map((s) => (s.id === selectedSlide.id ? { ...s, ...patch } : s))
    }));
  };

  const patchSlideImage = (slot: HeroRatioKey, url: string | null) => {
    if (!selectedSlide) return;
    patchSlide({
      images: {
        ...selectedSlide.images,
        desktop: slot === "desktop" ? url || "" : selectedSlide.images.desktop,
        tablet: slot === "tablet" ? url : selectedSlide.images.tablet,
        mobile: slot === "mobile" ? url : selectedSlide.images.mobile
      }
    });
  };

  const addSlide = () => {
    const id = `slide-${Date.now().toString(36).slice(-4)}`;
    const newSlide: HeroSlideConfig = {
      id,
      active: true,
      href: "/shop",
      alt: "New Plusmark hero banner",
      overlayMode: "editorial-bottom",
      eyebrow: "Plusmark Boards",
      headline: "New Banner Slide",
      subtitle: "Built to size across all board ranges",
      ctaLabel: "Shop now",
      images: {
        desktop: "/images/plusmark/hero/hero-whiteboard-desktop.jpg",
        tablet: null,
        mobile: "/images/plusmark/hero/hero-whiteboard-mobile.jpg"
      }
    };
    mutate((cur) => ({ ...cur, slides: [...cur.slides, newSlide] }));
    setSelectedId(id);
  };

  const moveSlide = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= draft.slides.length) return;
    mutate((cur) => {
      const next = [...cur.slides];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...cur, slides: next };
    });
  };

  const removeSlide = (id: string) => {
    if (draft.slides.length <= 1) {
      toast.push("Keep at least one active hero slide.", "error");
      return;
    }
    mutate((cur) => {
      const next = cur.slides.filter((s) => s.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? "");
      return { ...cur, slides: next };
    });
  };

  const handleUploadForSlot = async (slot: HeroRatioKey, files: FileList | null) => {
    const file = files?.[0];
    if (!file || !selectedSlide) return;
    setUploadingSlot(slot);
    try {
      let uploadBlob: Blob = file;
      const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
      let uploadExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) ? ext : "webp";

      // Ensure uploads stay safely within Supabase product-media 5MB limit while preserving crisp resolution
      if (file.size > 4_500_000) {
        uploadBlob = await renderExactResolutionBlob(file, null, null, "image/webp");
        uploadExt = "webp";
      }

      const publicUrl = await uploadHeroBlob(uploadBlob, selectedSlide.id, slot, uploadExt);
      patchSlideImage(slot, publicUrl);
      toast.push(`Uploaded ${slot} banner image.`, "success");
    } catch (err) {
      toast.push((err as Error).message, "error");
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleResPresetChange = (id: string) => {
    setResPresetId(id);
    if (id === "custom") return;
    const preset = HERO_RESOLUTION_PRESETS.find((p) => p.id === id);
    if (preset) {
      setAiSlot(preset.ratioSlot);
      setCustomWidth(String(preset.width));
      setCustomHeight(String(preset.height));
    }
  };

  const handleGenerateAiImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlide) return;
    setAiError(null);

    const width = Math.max(320, Math.min(2400, Number(customWidth) || 1600));
    const height = Math.max(320, Math.min(2400, Number(customHeight) || 700));
    const preset = HERO_RESOLUTION_PRESETS.find((p) => p.id === resPresetId);

    setGenerating(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Sign in as an administrator first.");

      const response = await fetch("/api/admin/hero/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          width,
          height,
          openAiSize: preset?.openAiSize,
          geminiAspect: preset?.geminiAspect,
          provider: aiProvider,
          ...(aiApiKey.trim() ? { apiKey: aiApiKey.trim() } : {})
        })
      });

      const payload = (await response.json().catch(() => null)) as {
        base64?: string;
        mimeType?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.base64) {
        throw new Error(payload?.error || "Could not generate image.");
      }

      const dataUrl = `data:${payload.mimeType || "image/png"};base64,${payload.base64}`;
      const exactBlob = await renderExactResolutionBlob(dataUrl, width, height, "image/webp");
      const uploadedUrl = await uploadHeroBlob(exactBlob, selectedSlide.id, aiSlot, "webp");

      patchSlideImage(aiSlot, uploadedUrl);
      toast.push(`Generated ${width}×${height} image & applied to ${aiSlot} slot.`, "success");
    } catch (err) {
      const message = (err as Error).message;
      setAiError(message);
      toast.push(message, "error");
    } finally {
      setGenerating(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const normalized = normalizeHeroConfig(draft);
      const { error } = await db()
        .from("site_content")
        .upsert({ key: "hero_config", value: normalized as unknown as Json });
      if (error) throw new Error(error.message);
      setDraft(normalized);
      setDirty(false);
      toast.push("Hero banners saved & published.", "success");
      q.reload();
    } catch (err) {
      toast.push((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!window.confirm("Reset all hero banners back to default architectural board photographs?")) return;
    const def = buildDefaultHeroConfig();
    setDraft(def);
    setSelectedId(def.slides[0]?.id ?? "");
    setDirty(true);
  };

  if (q.error) return <ErrorLine message={q.error} onRetry={q.reload} />;
  if (q.loading && q.data === undefined) return <Loading what="Loading hero banner settings" />;

  return (
    <>
      <AdminPageHeader
        title="Hero banners"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Hero banners" }]}
        lede="Manage homepage banner slides, destination links, multi-ratio images (desktop, tablet, mobile), and AI-prompted banner generation."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && <Pill tone="amber">Unsaved changes</Pill>}
            <ButtonLink href="/" size="sm" variant="secondary" target="_blank">
              View storefront
            </ButtonLink>
            <Button type="button" size="sm" variant="secondary" onClick={resetToDefault}>
              <RotateCcw className="size-3.5" aria-hidden />
              Reset default
            </Button>
            <Button type="button" size="sm" loading={saving} disabled={saving} onClick={() => void saveAll()}>
              <Save className="size-3.5" aria-hidden />
              Save &amp; publish
            </Button>
          </div>
        }
      />

      {/* Global Hero Banner Controls */}
      <Section title="Hero layout & carousel behavior">
        <div className="grid gap-4 sm:grid-cols-2">
          <Pick
            label="Desktop banner ratio"
            value={draft.aspectDesktop}
            onChange={(v) => mutate((cur) => ({ ...cur, aspectDesktop: v as HeroSectionConfig["aspectDesktop"] }))}
            options={[
              ["16/7", "Wide e-commerce banner (16:7 · balanced height)"],
              ["21/8", "Ultra-wide panoramic (21:8 · compact)"],
              ["16/9", "Tall showcase (16:9 · full cinema)"]
            ]}
          />
          <Input
            label="Auto-rotate interval (seconds, 0 = manual only)"
            type="number"
            min={0}
            max={30}
            value={String(draft.autoPlaySeconds)}
            onChange={(e) =>
              mutate((cur) => ({ ...cur, autoPlaySeconds: Math.max(0, Math.min(30, Number(e.target.value) || 0)) }))
            }
          />
        </div>
      </Section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[20rem_1fr]">
        {/* Left Sidebar: Slides List */}
        <Section
          title="Slides"
          aside={
            <Button type="button" size="sm" variant="secondary" onClick={addSlide}>
              <Plus className="size-3.5" aria-hidden />
              Add slide
            </Button>
          }
        >
          <div className="flex flex-col gap-2">
            {draft.slides.map((slide, index) => (
              <div
                key={slide.id}
                className={classNames(
                  "flex items-center gap-2 rounded-md border p-2",
                  selectedSlide?.id === slide.id ? "border-primary bg-primary/5" : "border-line bg-surface"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(slide.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <span className="size-12 shrink-0 overflow-hidden rounded-xs border border-line bg-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl(slide.images.desktop, { fit: "fill", width: 120 })}
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={classNames(
                        "block truncate text-body-sm font-medium",
                        slide.active ? "text-ink" : "text-muted line-through"
                      )}
                    >
                      {slide.headline || slide.alt || `Slide ${index + 1}`}
                    </span>
                    <span className="block truncate text-caption text-muted">{slide.href}</span>
                  </span>
                </button>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <div className="flex items-center">
                    <button
                      type="button"
                      aria-label="Move slide up"
                      disabled={index === 0}
                      onClick={() => moveSlide(index, -1)}
                      className="flex size-6 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Move slide down"
                      disabled={index === draft.slides.length - 1}
                      onClick={() => moveSlide(index, 1)}
                      className="flex size-6 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      aria-label={slide.active ? "Hide slide" : "Show slide"}
                      onClick={() =>
                        mutate((cur) => ({
                          ...cur,
                          slides: cur.slides.map((s) => (s.id === slide.id ? { ...s, active: !s.active } : s))
                        }))
                      }
                      className="flex size-6 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink"
                    >
                      {slide.active ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    </button>
                    <button
                      type="button"
                      aria-label="Delete slide"
                      onClick={() => removeSlide(slide.id)}
                      className="flex size-6 items-center justify-center rounded-xs text-muted hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Right Panel: Selected Slide Editor */}
        {selectedSlide && (
          <div className="flex flex-col gap-4">
            <Section title="Destination link & banner text">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Go-to path or URL (on click)"
                  value={selectedSlide.href}
                  onChange={(e) => patchSlide({ href: e.target.value })}
                  placeholder="/shop/white-boards"
                  required
                />
                <Pick
                  label="Quick pick destination"
                  value=""
                  onChange={(href) => href && patchSlide({ href })}
                  options={[
                    ["", "Pick category, collection or product…"],
                    ...builtinCategories.map((c) => [`/shop/${c.slug}`, `Category: ${c.name}`] as [string, string]),
                    ...collections.map((c) => [`/collections/${c.slug}`, `Collection: ${c.name}`] as [string, string]),
                    ...builtinProducts.slice(0, 60).map((p) => [`/product/${p.slug}`, `Product: ${p.name}`] as [string, string])
                  ]}
                />

                <Pick
                  label="Overlay text style"
                  value={selectedSlide.overlayMode}
                  onChange={(v) => patchSlide({ overlayMode: v as HeroOverlayMode })}
                  options={[
                    ["editorial-bottom", "Clean bottom caption + CTA button"],
                    ["image-only", "Pure banner image only (best if image already has text)"]
                  ]}
                />
                <div className="flex items-end pb-1">
                  <Check
                    label="Slide active on storefront"
                    checked={selectedSlide.active}
                    onChange={(active) => patchSlide({ active })}
                  />
                </div>

                <Input
                  label="Accessible image alt description"
                  value={selectedSlide.alt}
                  onChange={(e) => patchSlide({ alt: e.target.value })}
                  className="sm:col-span-2"
                />

                {selectedSlide.overlayMode === "editorial-bottom" && (
                  <>
                    <Input
                      label="Eyebrow (small uppercase line)"
                      value={selectedSlide.eyebrow}
                      onChange={(e) => patchSlide({ eyebrow: e.target.value })}
                    />
                    <Input
                      label="Button text"
                      value={selectedSlide.ctaLabel}
                      onChange={(e) => patchSlide({ ctaLabel: e.target.value })}
                      placeholder="Shop White Boards"
                    />
                    <Input
                      label="Headline"
                      value={selectedSlide.headline}
                      onChange={(e) => patchSlide({ headline: e.target.value })}
                    />
                    <Input
                      label="Subtitle"
                      value={selectedSlide.subtitle}
                      onChange={(e) => patchSlide({ subtitle: e.target.value })}
                    />
                  </>
                )}
              </div>
            </Section>

            {/* Multi-Ratio Image Upload */}
            <Section title="Responsive images by screen ratio">
              <div className="grid gap-4 md:grid-cols-3">
                {RATIO_SLOTS.map((slot) => {
                  const val = selectedSlide.images[slot.key];
                  const isUploading = uploadingSlot === slot.key;
                  return (
                    <div key={slot.key} className="flex flex-col gap-2.5 rounded-md border border-line bg-page p-3">
                      <div>
                        <p className="text-body-sm font-semibold text-ink">{slot.label}</p>
                        <p className="text-[0.6875rem] text-muted">{slot.ratioHint}</p>
                      </div>

                      <div className={classNames("relative w-full overflow-hidden rounded-sm border border-line bg-surface", slot.boxAspect)}>
                        {val ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl(val, { fit: "fill", width: 640 })}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-caption text-muted">
                            <ImageIcon className="size-5 opacity-60" aria-hidden />
                            <span>Uses Desktop image</span>
                          </div>
                        )}
                      </div>

                      <Input
                        label="Image path / URL"
                        aria-label={`${slot.label} URL`}
                        value={val ?? ""}
                        onChange={(e) =>
                          patchSlideImage(slot.key, e.target.value || (slot.key === "desktop" ? "" : null))
                        }
                        placeholder={slot.key === "desktop" ? "/images/..." : "Optional override"}
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-caption font-medium text-ink transition-colors hover:bg-subtle">
                          <UploadCloud className="size-3.5" aria-hidden />
                          <span>{isUploading ? "Uploading…" : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={isUploading}
                            className="sr-only"
                            onChange={(e) => void handleUploadForSlot(slot.key, e.target.files)}
                          />
                        </label>
                        {slot.key !== "desktop" && val && (
                          <Button type="button" size="sm" variant="quiet" onClick={() => patchSlideImage(slot.key, null)}>
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* AI Prompt Banner Image Generator */}
            <Section title="AI prompt image generator (by target resolution)">
              <form onSubmit={(e) => void handleGenerateAiImage(e)} className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Pick
                    label="Target slide ratio slot"
                    value={aiSlot}
                    onChange={(v) => {
                      const slot = v as HeroRatioKey;
                      setAiSlot(slot);
                      const matching = HERO_RESOLUTION_PRESETS.find((p) => p.ratioSlot === slot);
                      if (matching) {
                        setResPresetId(matching.id);
                        setCustomWidth(String(matching.width));
                        setCustomHeight(String(matching.height));
                      }
                    }}
                    options={[
                      ["desktop", "Desktop banner"],
                      ["tablet", "Tablet banner"],
                      ["mobile", "Mobile banner"]
                    ]}
                  />
                  <Pick
                    label="Resolution preset"
                    value={resPresetId}
                    onChange={handleResPresetChange}
                    options={[
                      ...HERO_RESOLUTION_PRESETS.map((p) => [p.id, p.label] as [string, string]),
                      ["custom", "Custom pixel dimensions"]
                    ]}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Width (px)"
                      type="number"
                      min={320}
                      max={2400}
                      value={customWidth}
                      onChange={(e) => {
                        setCustomWidth(e.target.value);
                        setResPresetId("custom");
                      }}
                    />
                    <Input
                      label="Height (px)"
                      type="number"
                      min={320}
                      max={2400}
                      value={customHeight}
                      onChange={(e) => {
                        setCustomHeight(e.target.value);
                        setResPresetId("custom");
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-caption font-medium text-ink">AI image prompt</span>
                    <div className="flex flex-wrap gap-1.5">
                      {HERO_PROMPT_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          onClick={() => setAiPrompt(tpl.prompt)}
                          className="rounded-sm border border-line bg-page px-2 py-0.5 text-[0.6875rem] font-medium text-muted hover:border-line-strong hover:text-ink"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe the scene, board model, wall material, lighting and composition…"
                    required
                    className="w-full rounded-md border border-line-strong bg-surface p-3 text-body-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid gap-3 rounded-md border border-line bg-subtle/40 p-3 sm:grid-cols-[12rem_1fr_auto]">
                  <Pick
                    label="AI provider"
                    value={aiProvider}
                    onChange={(v) => setAiProvider(v as "auto" | "gemini" | "openai")}
                    options={[
                      ["auto", "Auto (.env key)"],
                      ["gemini", "Google Gemini / Imagen"],
                      ["openai", "OpenAI (gpt-image-1)"]
                    ]}
                  />
                  <Input
                    label="Optional API key (when not set in .env.local)"
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="Optional GEMINI_API_KEY or OPENAI_API_KEY"
                  />
                  <div className="flex items-end">
                    <Button type="submit" loading={generating} disabled={generating}>
                      <Sparkles className="size-4" aria-hidden />
                      {generating ? "Generating…" : `Generate ${customWidth}×${customHeight}`}
                    </Button>
                  </div>
                </div>

                {aiError && (
                  <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-caption text-amber-900">
                    {aiError}
                  </p>
                )}
              </form>
            </Section>
          </div>
        )}
      </div>
    </>
  );
}
