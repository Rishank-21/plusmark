"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { classNames } from "@/lib/format";
import { THEME_PRESETS } from "@/lib/storefront-theme";
import { useStorefrontTheme } from "@/components/layout/StorefrontThemeProvider";

export function StorefrontThemeToggle() {
  const { config, mode, presetId, previewPresetId, toggleMode, setMode, setPreviewPreset, resetPreview } =
    useStorefrontTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!config.showFrontendToggle && !config.showPresetTester) return null;

  return (
    <div ref={wrapRef} className="relative flex items-center gap-0.5">
      {config.showFrontendToggle && (
        <button
          type="button"
          onClick={toggleMode}
          aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-subtle sm:size-10 lg:size-9"
        >
          {mode === "dark" ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
        </button>
      )}

      {config.showPresetTester && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="pm-theme-popover"
            aria-label="Test storefront color themes"
            title="Test storefront themes"
            className={classNames(
              "hidden h-9 items-center gap-1.5 rounded-md px-2 text-caption font-medium text-ink transition-colors hover:bg-subtle sm:flex",
              open && "bg-subtle"
            )}
          >
            <Palette className="size-4" aria-hidden />
            <span className="hidden 2xl:inline">Theme</span>
          </button>

          {open && (
            <div
              id="pm-theme-popover"
              role="dialog"
              aria-label="Theme switcher"
              className="absolute right-0 top-full z-[100] mt-2 w-[min(19rem,92vw)] rounded-md border border-line bg-surface p-3 text-ink shadow-lift"
            >
              <div className="mb-2 flex items-center justify-between gap-2 border-b border-line pb-2">
                <span className="text-caption font-semibold uppercase tracking-[0.08em] text-muted">
                  Theme preview
                </span>
                <div className="inline-flex rounded-sm border border-line bg-page p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode("light")}
                    className={classNames(
                      "inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[0.6875rem] font-medium transition-colors",
                      mode === "light" ? "bg-primary text-onprimary" : "text-muted hover:text-ink"
                    )}
                  >
                    <Sun className="size-3" aria-hidden />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("dark")}
                    className={classNames(
                      "inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[0.6875rem] font-medium transition-colors",
                      mode === "dark" ? "bg-primary text-onprimary" : "text-muted hover:text-ink"
                    )}
                  >
                    <Moon className="size-3" aria-hidden />
                    Dark
                  </button>
                </div>
              </div>

              <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewPreset(null);
                      setOpen(false);
                    }}
                    className={classNames(
                      "flex w-full items-center gap-2.5 rounded-xs border px-2 py-1.5 text-left transition-colors",
                      !previewPresetId ? "border-primary/40 bg-primary-soft" : "border-transparent hover:bg-subtle"
                    )}
                  >
                    <span className="flex shrink-0 overflow-hidden rounded-xs border border-line">
                      <span className="size-3.5" style={{ backgroundColor: config[mode].bg }} />
                      <span className="size-3.5" style={{ backgroundColor: config[mode].primary }} />
                      <span className="size-3.5" style={{ backgroundColor: config[mode].shell }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption font-semibold text-ink">Admin Saved Theme</span>
                      <span className="block truncate text-[0.6875rem] text-muted">Live store setting</span>
                    </span>
                    {!previewPresetId && <Check className="size-3.5 shrink-0 text-primary" aria-hidden />}
                  </button>
                </li>

                {THEME_PRESETS.map((preset) => {
                  const p = mode === "dark" ? preset.dark : preset.light;
                  const active = previewPresetId === preset.id || (!previewPresetId && presetId === preset.id);
                  return (
                    <li key={preset.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPreset(preset.id);
                        }}
                        className={classNames(
                          "flex w-full items-center gap-2.5 rounded-xs border px-2 py-1.5 text-left transition-colors",
                          previewPresetId === preset.id
                            ? "border-primary/40 bg-primary-soft"
                            : "border-transparent hover:bg-subtle"
                        )}
                      >
                        <span className="flex shrink-0 overflow-hidden rounded-xs border border-line">
                          <span className="size-3.5" style={{ backgroundColor: p.bg }} />
                          <span className="size-3.5" style={{ backgroundColor: p.primary }} />
                          <span className="size-3.5" style={{ backgroundColor: p.shell }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-caption font-medium text-ink">{preset.name}</span>
                        </span>
                        {active && <Check className="size-3.5 shrink-0 text-primary" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {(previewPresetId !== null || mode !== config.defaultMode) && (
                <button
                  type="button"
                  onClick={() => {
                    resetPreview();
                    setOpen(false);
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xs border border-line px-2 py-1.5 text-[0.6875rem] font-medium text-muted hover:bg-subtle hover:text-ink"
                >
                  <RotateCcw className="size-3" aria-hidden />
                  Reset to admin default
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function MobileThemeRow() {
  const { config, mode, toggleMode } = useStorefrontTheme();
  if (!config.showFrontendToggle) return null;
  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="mb-2 flex h-10 w-full items-center justify-between rounded-md border border-line px-3 text-caption font-medium text-ink transition-colors hover:bg-subtle"
    >
      <span>{mode === "dark" ? "Dark mode" : "Light mode"}</span>
      {mode === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
