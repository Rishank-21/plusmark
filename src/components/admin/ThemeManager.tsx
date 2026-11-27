"use client";

import { useEffect, useState } from "react";
import { Check as CheckIcon, Moon, RotateCcw, Save, Sparkles, Sun } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { Check, ErrorLine, Loading, Pick, Pill, Section } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button, ButtonLink } from "@/components/ui/Button";
import { db, type Json } from "@/lib/backend/admin";
import { classNames } from "@/lib/format";
import {
  bestContrastInk,
  buildDefaultStorefrontTheme,
  contrastRatio,
  derivePaletteTokens,
  isDarkColor,
  normalizeHex,
  normalizeStorefrontTheme,
  THEME_PRESETS,
  type StorefrontThemeConfig,
  type ThemeMode,
  type ThemePalette
} from "@/lib/storefront-theme";
import { useToast } from "@/state/toast";

interface ColorFieldSpec {
  key: keyof ThemePalette;
  label: string;
  hint: string;
}

const COLOR_GROUPS: { title: string; fields: ColorFieldSpec[] }[] = [
  {
    title: "Surfaces & hero canvas",
    fields: [
      { key: "bg", label: "Page background", hint: "Main storefront canvas" },
      { key: "surface", label: "Card & top header", hint: "Cards, search bar and dropdown panels" },
      { key: "surfaceMuted", label: "Subtle / section tint", hint: "Light bands & hover fills" }
    ]
  },
  {
    title: "Typography & borders",
    fields: [
      { key: "text", label: "Primary text", hint: "Headings, body copy & links" },
      { key: "textMuted", label: "Muted text", hint: "Captions & product specs" },
      { key: "border", label: "Borders & dividers", hint: "Card outlines and section lines" }
    ]
  },
  {
    title: "Buttons, accents & header strip",
    fields: [
      { key: "primary", label: "Primary button / accent", hint: "Add to cart, Checkout CTA & active tabs" },
      { key: "onPrimary", label: "Text on primary button", hint: "Button label & icon contrast" },
      { key: "shell", label: "Category strip & footer", hint: "Row 2 nav bar and footer background" },
      { key: "onShell", label: "Text on strip & footer", hint: "Nav labels and footer links" },
      { key: "rating", label: "Rating & star accent", hint: "Review stars" }
    ]
  }
];

function ColorField({
  label,
  hint,
  value,
  onChange
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (nextHex: string) => void;
}) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-page p-2.5">
      <label className="relative block size-10 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-line-strong">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={normalizeHex(value, "#141413")}
          onChange={(e) => {
            const hex = e.target.value.toUpperCase();
            setText(hex);
            onChange(hex);
          }}
          className="absolute -inset-2 size-14 cursor-pointer border-0 bg-transparent p-0"
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="truncate text-caption font-semibold text-ink">{label}</p>
        <p className="truncate text-[0.6875rem] text-muted">{hint}</p>
      </div>
      <input
        type="text"
        aria-label={`${label} hex value`}
        value={text}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);
          if (/^#?[0-9a-f]{6}$/i.test(val.trim())) {
            onChange(normalizeHex(val, value));
          }
        }}
        onBlur={() => setText(value)}
        maxLength={7}
        className="h-9 w-24 rounded-sm border border-line-strong bg-surface px-2 font-mono text-caption uppercase text-ink focus:border-primary focus:outline-none"
      />
    </div>
  );
}

export function ThemeManager() {
  const toast = useToast();
  const q = useAdminQuery(async () => {
    const { data, error } = await db()
      .from("site_content")
      .select("value")
      .eq("key", "storefront_theme")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value ? normalizeStorefrontTheme(data.value) : null;
  });

  const [draft, setDraft] = useState<StorefrontThemeConfig>(() => buildDefaultStorefrontTheme());
  const [editingMode, setEditingMode] = useState<ThemeMode>("light");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (q.data === undefined) return;
    const loaded = q.data ?? buildDefaultStorefrontTheme();
    setDraft(loaded);
    setEditingMode(loaded.defaultMode);
    setDirty(false);
  }, [q.data]);

  const activePalette = editingMode === "dark" ? draft.dark : draft.light;

  const updateDraft = (updater: (cur: StorefrontThemeConfig) => StorefrontThemeConfig) => {
    setDraft((cur) => updater(cur));
    setDirty(true);
  };

  const patchPaletteColor = (key: keyof ThemePalette, hex: string) => {
    updateDraft((cur) => {
      const updated = derivePaletteTokens(
        {
          ...cur[editingMode],
          [key]: hex
        },
        key
      );
      return {
        ...cur,
        presetId: "custom",
        [editingMode]: updated
      };
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    updateDraft((cur) => ({
      ...cur,
      presetId: preset.id,
      light: { ...preset.light },
      dark: { ...preset.dark }
    }));
  };

  const fixContrastForEditingMode = () => {
    updateDraft((cur) => {
      const p = cur[editingMode];
      const darkCanvas = isDarkColor(p.bg);
      const next: ThemePalette = derivePaletteTokens({
        ...p,
        text: bestContrastInk(p.bg, "#FAF9F6", "#141413"),
        textMuted: darkCanvas ? "#B4B7C0" : "#57544E",
        onPrimary: bestContrastInk(p.primary, "#FFFFFF", "#111110"),
        onShell: bestContrastInk(p.shell, "#FAF9F6", "#141413")
      });
      return { ...cur, presetId: "custom", [editingMode]: next };
    });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const normalized = normalizeStorefrontTheme(draft);
      const { error } = await db()
        .from("site_content")
        .upsert({ key: "storefront_theme", value: normalized as unknown as Json });
      if (error) throw new Error(error.message);
      setDraft(normalized);
      setDirty(false);
      toast.push("Storefront theme saved & published.", "success");
      q.reload();
    } catch (err) {
      toast.push((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!window.confirm("Reset all storefront Light and Dark colors back to Plusmark Editorial default?")) return;
    setDraft(buildDefaultStorefrontTheme());
    setEditingMode("light");
    setDirty(true);
  };

  if (q.error) return <ErrorLine message={q.error} onRetry={q.reload} />;
  if (q.loading && q.data === undefined) return <Loading what="Loading storefront theme" />;

  const textContrast = contrastRatio(activePalette.text, activePalette.bg);
  const ctaContrast = contrastRatio(activePalette.onPrimary, activePalette.primary);
  const shellContrast = contrastRatio(activePalette.onShell, activePalette.shell);

  return (
    <>
      <AdminPageHeader
        title="Storefront theme"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Storefront theme" }]}
        lede="Customize Light & Dark storefront color palettes, switch presets, and enable or hide the frontend testing theme toggle button."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && <Pill tone="amber">Unsaved changes</Pill>}
            <ButtonLink href="/" size="sm" variant="secondary" target="_blank">
              Preview storefront
            </ButtonLink>
            <Button type="button" size="sm" variant="secondary" onClick={resetToDefault}>
              <RotateCcw className="size-3.5" aria-hidden />
              Reset default
            </Button>
            <Button type="button" size="sm" loading={saving} disabled={saving} onClick={() => void saveAll()}>
              <Save className="size-3.5" aria-hidden />
              Save &amp; publish theme
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-5">
        {/* Preset Library */}
        <Section title="Theme presets (Light + Dark pairs)">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {THEME_PRESETS.map((preset) => {
              const active = draft.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={classNames(
                    "flex flex-col justify-between gap-3 rounded-md border p-3 text-left transition-colors",
                    active ? "border-primary bg-primary/5" : "border-line bg-surface hover:border-line-strong"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body-sm font-semibold text-ink">{preset.name}</p>
                      <p className="mt-0.5 text-caption text-muted">{preset.tagline}</p>
                    </div>
                    {active && <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden />}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                    <div className="flex items-center gap-1" title="Light palette swatches">
                      <span className="text-[0.6875rem] text-muted">L</span>
                      {[preset.light.bg, preset.light.primary, preset.light.shell].map((c, idx) => (
                        <span key={idx} className="size-4 rounded-xs border border-black/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1" title="Dark palette swatches">
                      <span className="text-[0.6875rem] text-muted">D</span>
                      {[preset.dark.bg, preset.dark.primary, preset.dark.shell].map((c, idx) => (
                        <span key={idx} className="size-4 rounded-xs border border-black/20" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Storefront Toggle & Default Mode */}
        <Section title="Default appearance & frontend testing toggle">
          <div className="grid gap-4 sm:grid-cols-3">
            <Pick
              label="Default storefront mode"
              value={draft.defaultMode}
              onChange={(v) => updateDraft((cur) => ({ ...cur, defaultMode: v === "dark" ? "dark" : "light" }))}
              options={[
                ["light", "Light mode (default for visitors)"],
                ["dark", "Dark mode (default for visitors)"]
              ]}
            />
            <div className="flex items-end pb-1">
              <Check
                label="Show Light / Dark toggle button in storefront header"
                hint="Like Gajjar Furnitures Sun/Moon icon toggle"
                checked={draft.showFrontendToggle}
                onChange={(showFrontendToggle) => updateDraft((cur) => ({ ...cur, showFrontendToggle }))}
              />
            </div>
            <div className="flex items-end pb-1">
              <Check
                label="Show preset quick-tester button in header"
                hint="Lets you preview every theme preset live on the storefront"
                checked={draft.showPresetTester}
                onChange={(showPresetTester) => updateDraft((cur) => ({ ...cur, showPresetTester }))}
              />
            </div>
          </div>
        </Section>

        {/* Custom Color Pickers + Live Mini-Preview */}
        <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
          <Section
            title="Custom color palette editor"
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-sm border border-line bg-page p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditingMode("light")}
                    className={classNames(
                      "inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-caption font-medium transition-colors",
                      editingMode === "light" ? "bg-primary text-onprimary" : "text-muted hover:text-ink"
                    )}
                  >
                    <Sun className="size-3.5" aria-hidden />
                    Light colors
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMode("dark")}
                    className={classNames(
                      "inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-caption font-medium transition-colors",
                      editingMode === "dark" ? "bg-primary text-onprimary" : "text-muted hover:text-ink"
                    )}
                  >
                    <Moon className="size-3.5" aria-hidden />
                    Dark colors
                  </button>
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={fixContrastForEditingMode}>
                  <Sparkles className="size-3.5" aria-hidden />
                  Auto-contrast text
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-5">
              {COLOR_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-2.5 text-caption font-semibold uppercase tracking-[0.08em] text-muted">
                    {group.title}
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <ColorField
                        key={`${editingMode}-${field.key}`}
                        label={field.label}
                        hint={field.hint}
                        value={String(activePalette[field.key])}
                        onChange={(hex) => patchPaletteColor(field.key, hex)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex flex-col gap-4">
            <Section title={`Live preview (${editingMode} mode)`}>
              {/* Live Storefront Mini Preview using exact inline palette values */}
              <div
                className="overflow-hidden rounded-md border"
                style={{
                  backgroundColor: activePalette.bg,
                  color: activePalette.text,
                  borderColor: activePalette.border
                }}
              >
                {/* Row 1 Search Header */}
                <div
                  className="flex items-center justify-between gap-2 border-b px-3 py-2.5"
                  style={{
                    backgroundColor: activePalette.surface,
                    borderColor: activePalette.border
                  }}
                >
                  <span className="font-display text-body-sm font-extrabold tracking-tight" style={{ color: activePalette.text }}>
                    plusmark
                  </span>
                  <span
                    className="flex-1 rounded-full border px-2.5 py-1 text-[0.6875rem]"
                    style={{
                      backgroundColor: activePalette.bg,
                      borderColor: activePalette.borderStrong,
                      color: activePalette.textMuted
                    }}
                  >
                    Search boards…
                  </span>
                  <span className="text-[0.6875rem] font-medium" style={{ color: activePalette.text }}>
                    Cart
                  </span>
                </div>

                {/* Row 2 Category Strip */}
                <div
                  className="flex flex-wrap items-center gap-3 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    backgroundColor: activePalette.shell,
                    color: activePalette.onShell
                  }}
                >
                  <span>All Boards</span>
                  <span className="opacity-80">White Boards</span>
                  <span className="opacity-80">Ceramic</span>
                </div>

                {/* Hero & Sample Card */}
                <div className="space-y-3 p-4">
                  <div className="space-y-1.5">
                    <p className="text-[0.625rem] uppercase tracking-[0.12em]" style={{ color: activePalette.textMuted }}>
                      Plusmark · Ahmedabad
                    </p>
                    <p className="font-display text-h4 font-extrabold leading-tight" style={{ color: activePalette.text }}>
                      Writing &amp; display boards built to size
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex h-8 items-center rounded-md px-3 text-caption font-semibold"
                      style={{
                        backgroundColor: activePalette.primary,
                        color: activePalette.onPrimary
                      }}
                    >
                      Explore boards
                    </span>
                    <span
                      className="inline-flex h-8 items-center rounded-md border px-3 text-caption font-medium"
                      style={{
                        backgroundColor: activePalette.surface,
                        borderColor: activePalette.borderStrong,
                        color: activePalette.text
                      }}
                    >
                      Custom quote
                    </span>
                  </div>

                  <div
                    className="rounded-md border p-3"
                    style={{
                      backgroundColor: activePalette.surface,
                      borderColor: activePalette.border
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-body-sm font-semibold" style={{ color: activePalette.text }}>
                          Metallic Premium White Board
                        </p>
                        <p className="text-caption" style={{ color: activePalette.textMuted }}>
                          3×4 – 8×4 ft · ★ 4.9
                        </p>
                      </div>
                      <span className="text-body-sm font-bold" style={{ color: activePalette.text }}>
                        ₹4,020
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WCAG Readability Checks */}
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-caption font-semibold uppercase tracking-[0.06em] text-muted">
                  Readability checks
                </p>
                {[
                  { label: "Text on page background", ratio: textContrast },
                  { label: "CTA text on primary button", ratio: ctaContrast },
                  { label: "Nav label on category strip", ratio: shellContrast }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2 text-caption">
                    <span className="text-muted">{item.label}</span>
                    <Pill tone={item.ratio >= 4.5 ? "green" : "amber"}>
                      {item.ratio.toFixed(1)}:1 {item.ratio >= 4.5 ? "Clear" : "Low contrast"}
                    </Pill>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
