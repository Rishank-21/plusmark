"use client";

import { useEffect, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { classNames } from "@/lib/format";

const THEMES = [
  {
    id: "clean-retail",
    label: "Clean Retail",
    note: "White page · navy · action blue",
    swatches: ["#FFFFFF", "#0F2A4A", "#0870A5", "#F58220"]
  },
  {
    id: "premium-corporate",
    label: "Premium Corporate",
    note: "Cool grey · deep navy · copper",
    swatches: ["#F0F4F9", "#0F2B47", "#A6642E"]
  },
  {
    id: "warm-modern",
    label: "Warm Modern",
    note: "Ivory page · white wells · orange",
    swatches: ["#FAF6EE", "#17324F", "#F58220"]
  }
] as const;

const ACCENTS = [
  { id: "brand", label: "Brand navy", color: "#17324F", note: "Theme default" },
  { id: "ocean", label: "Ocean", color: "#0B6E99", note: "Action blue" },
  { id: "forest", label: "Forest", color: "#1F6B4F", note: "Deep green" },
  { id: "plum", label: "Plum", color: "#6D3B6E", note: "Muted purple" },
  { id: "amber", label: "Amber", color: "#9A5B00", note: "Warm gold" },
  { id: "graphite", label: "Graphite", color: "#374151", note: "Neutral slate" }
] as const;

const STORAGE_KEY = "plusmark-theme";
const ACCENT_KEY = "plusmark-accent";

/**
 * Development-only palette switcher for client review. Themes are pure CSS
 * variable swaps, so the current page, its data and cart state stay as they
 * are. Not rendered in production builds.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>("warm-modern");
  const [accent, setAccent] = useState<string>("brand");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.some((entry) => entry.id === stored)) {
        setTheme(stored);
        document.documentElement.dataset.theme = stored;
      }
      const storedAccent = window.localStorage.getItem(ACCENT_KEY);
      if (storedAccent && ACCENTS.some((entry) => entry.id === storedAccent)) {
        setAccent(storedAccent);
        if (storedAccent !== "brand") document.documentElement.dataset.accent = storedAccent;
      }
    } catch {
      /* storage can be blocked; the default theme still applies */
    }
  }, []);

  const apply = (id: string) => {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const applyAccent = (id: string) => {
    setAccent(id);
    if (id === "brand") delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = id;
    try {
      window.localStorage.setItem(ACCENT_KEY, id);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] left-1 z-[200] print:hidden lg:bottom-4">
      {open ? (
        <div className="ml-2 w-[17rem] rounded-xl border border-hair bg-surface p-3 shadow-lift">
          <div className="flex items-center justify-between gap-3 pb-2">
            <p className="flex items-center gap-1.5 text-caption font-medium text-ink">
              <Palette className="size-3.5 text-graphite" aria-hidden />
              Theme preview
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close theme preview"
              className="-mr-1 flex size-7 items-center justify-center rounded-xs text-graphite transition-colors hover:bg-sand hover:text-ink"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {THEMES.map((entry) => {
              const active = theme === entry.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => apply(entry.id)}
                    aria-pressed={active}
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors",
                      active ? "border-navy bg-navy-wash" : "border-transparent hover:bg-sand/70"
                    )}
                  >
                    <span className="flex shrink-0 overflow-hidden rounded-xs border border-black/10">
                      {entry.swatches.map((swatch) => (
                        <span key={swatch} className="size-3.5" style={{ backgroundColor: swatch }} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-caption font-medium leading-tight text-ink">{entry.label}</span>
                      <span className="block text-[0.6875rem] leading-tight text-graphite">{entry.note}</span>
                    </span>
                    {active && <Check className="size-3.5 shrink-0 text-navy" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 border-t border-hair pt-2.5">
            <div className="flex items-baseline justify-between pb-2">
              <p className="text-caption font-medium text-ink">Accent</p>
              <p className="text-[0.6875rem] text-graphite">{ACCENTS.find((entry) => entry.id === accent)?.label}</p>
            </div>
            <div className="flex items-center gap-2">
              {ACCENTS.map((entry) => {
                const active = accent === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => applyAccent(entry.id)}
                    aria-pressed={active}
                    aria-label={`${entry.label} accent`}
                    title={`${entry.label} — ${entry.note}`}
                    className={classNames(
                      "flex size-7 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue",
                      active ? "border-navy" : "border-transparent hover:border-hair-strong"
                    )}
                  >
                    <span
                      className="flex size-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: entry.color }}
                    >
                      {active && <Check className="size-3 text-white" aria-hidden />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-[0.625rem] leading-relaxed text-graphite-light">
            Recolours the top strip, footer, promo panel and every button.
          </p>
          <p className="mt-1 border-t border-hair pt-2 text-[0.625rem] leading-relaxed text-graphite-light">
            Preview tool — set NEXT_PUBLIC_THEME_PREVIEW=off to hide.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Theme preview"
          title="Theme preview"
          className="flex h-10 w-6 items-center justify-center rounded-r-full border border-l-0 border-hair bg-surface text-ink shadow-lift transition-colors hover:bg-sand"
        >
          <Palette className="size-3.5 text-navy" aria-hidden />
        </button>
      )}
    </div>
  );
}
