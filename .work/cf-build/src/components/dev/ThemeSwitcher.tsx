"use client";

import { useEffect, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { classNames } from "@/lib/format";

const THEMES = [
  {
    id: "aurora-indigo",
    label: "Aurora Indigo",
    note: "Cool neutral · indigo action",
    swatches: ["#F8FAFC", "#4F46E5", "#0F172A"]
  },
  {
    id: "mint-signal",
    label: "Mint Signal",
    note: "Fresh green · emerald action",
    swatches: ["#F7FCF9", "#047857", "#062B21"]
  },
  {
    id: "solar-ember",
    label: "Solar Ember",
    note: "Warm canvas · ember action",
    swatches: ["#FFFBF7", "#C2410C", "#2D1A12"]
  },
  {
    id: "ocean-teal",
    label: "Ocean Teal",
    note: "Calm teal · precise action",
    swatches: ["#F5FBFB", "#0F766E", "#12302F"]
  },
  {
    id: "midnight-violet",
    label: "Midnight Violet",
    note: "Deep navy · soft violet",
    swatches: ["#0B1020", "#A78BFA", "#F8FAFC"]
  },
  {
    id: "obsidian-aurora",
    label: "Obsidian Aurora",
    note: "Dark-first · high contrast",
    swatches: ["#0B1020", "#C4B5FD", "#C1CBDD"]
  }
] as const;

const STORAGE_KEY = "plusmark-theme";
const DEFAULT_THEME = "aurora-indigo";

/**
 * Development-only theme switcher for client review. Themes are pure CSS
 * variable swaps, so the current page, its data and cart state stay as they
 * are. Not rendered in production builds.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.some((entry) => entry.id === stored)) {
        setTheme(stored);
        document.documentElement.dataset.theme = stored;
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

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+var(--pm-nav-h)+1rem)] right-3 z-[200] print:hidden lg:bottom-4 lg:left-1 lg:right-auto">
      {open ? (
        <div className="w-[min(17.5rem,calc(100vw-1.5rem))] rounded-xl border border-line bg-surface p-3 shadow-lift lg:ml-2">
          <div className="flex items-center justify-between gap-3 pb-2">
            <p className="flex items-center gap-1.5 text-caption font-semibold text-ink">
              <Palette className="size-3.5 text-muted" aria-hidden />
              Theme preview
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close theme preview"
              className="-mr-1 flex size-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          <ul className="flex flex-col gap-0.5">
            {THEMES.map((entry) => {
              const active = theme === entry.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => apply(entry.id)}
                    aria-pressed={active}
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-sm border px-2.5 py-2 text-left transition-colors",
                      active ? "border-primary/30 bg-primary-soft" : "border-transparent hover:bg-subtle"
                    )}
                  >
                    <span className="flex shrink-0 overflow-hidden rounded-xs border border-black/10">
                      {entry.swatches.map((swatch) => (
                        <span key={swatch} className="size-3.5" style={{ backgroundColor: swatch }} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-caption font-semibold leading-tight text-ink">{entry.label}</span>
                      <span className="block text-[0.6875rem] leading-tight text-muted">{entry.note}</span>
                    </span>
                    {active && <Check className="size-3.5 shrink-0 text-primary" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 border-t border-line pt-2 text-[0.625rem] leading-relaxed text-muted">
            Preview tool — set NEXT_PUBLIC_THEME_PREVIEW=off to hide.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Theme preview"
          title="Theme preview"
          className="flex size-12 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lift transition-colors hover:bg-subtle lg:h-10 lg:w-6 lg:rounded-l-none lg:rounded-r-full lg:border-l-0"
        >
          <Palette className="size-3.5 text-primary" aria-hidden />
        </button>
      )}
    </div>
  );
}
