"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildDefaultStorefrontTheme,
  buildStorefrontThemeCss,
  findThemePreset,
  isDarkColor,
  normalizeStorefrontTheme,
  resolveActivePalette,
  STOREFRONT_THEME_STORAGE_MODE,
  STOREFRONT_THEME_STORAGE_PRESET,
  type StorefrontThemeConfig,
  type ThemeMode,
  type ThemePalette
} from "@/lib/storefront-theme";

interface StorefrontThemeContextValue {
  config: StorefrontThemeConfig;
  mode: ThemeMode;
  presetId: string;
  previewPresetId: string | null;
  palette: ThemePalette;
  surfaceIsDark: boolean;
  shellIsDark: boolean;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setPreviewPreset: (presetId: string | null) => void;
  resetPreview: () => void;
}

const DEFAULT_CONFIG = buildDefaultStorefrontTheme();

const StorefrontThemeContext = createContext<StorefrontThemeContextValue>({
  config: DEFAULT_CONFIG,
  mode: "light",
  presetId: DEFAULT_CONFIG.presetId,
  previewPresetId: null,
  palette: DEFAULT_CONFIG.light,
  surfaceIsDark: false,
  shellIsDark: true,
  toggleMode: () => {},
  setMode: () => {},
  setPreviewPreset: () => {},
  resetPreview: () => {}
});

export function StorefrontThemeProvider({
  initialTheme = null,
  children
}: {
  initialTheme?: StorefrontThemeConfig | null;
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<StorefrontThemeConfig>(() => initialTheme ?? DEFAULT_CONFIG);
  const [modeOverride, setModeOverride] = useState<ThemeMode | null>(null);
  const [previewPresetId, setPreviewPresetId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTheme) setConfig(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    try {
      const savedMode = window.localStorage.getItem(STOREFRONT_THEME_STORAGE_MODE);
      if (savedMode === "light" || savedMode === "dark") {
        setModeOverride(savedMode);
      }
      const savedPreset = window.localStorage.getItem(STOREFRONT_THEME_STORAGE_PRESET);
      if (savedPreset && findThemePreset(savedPreset)) {
        setPreviewPresetId(savedPreset);
      }
    } catch {
      /* ignore localStorage failures */
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let alive = true;
    void supabase
      .from("site_content")
      .select("value")
      .eq("key", "storefront_theme")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error || !data?.value) return;
        setConfig(normalizeStorefrontTheme(data.value));
      });
    return () => {
      alive = false;
    };
  }, []);

  const resolved = useMemo(
    () => resolveActivePalette(config, modeOverride, previewPresetId),
    [config, modeOverride, previewPresetId]
  );

  const cssText = useMemo(() => buildStorefrontThemeCss(resolved.palette), [resolved.palette]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeOverride(next);
    try {
      window.localStorage.setItem(STOREFRONT_THEME_STORAGE_MODE, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(resolved.mode === "dark" ? "light" : "dark");
  }, [resolved.mode, setMode]);

  const setPreviewPreset = useCallback((presetId: string | null) => {
    const valid = presetId && findThemePreset(presetId) ? presetId : null;
    setPreviewPresetId(valid);
    try {
      if (valid) window.localStorage.setItem(STOREFRONT_THEME_STORAGE_PRESET, valid);
      else window.localStorage.removeItem(STOREFRONT_THEME_STORAGE_PRESET);
    } catch {
      /* ignore */
    }
  }, []);

  const resetPreview = useCallback(() => {
    setModeOverride(null);
    setPreviewPresetId(null);
    try {
      window.localStorage.removeItem(STOREFRONT_THEME_STORAGE_MODE);
      window.localStorage.removeItem(STOREFRONT_THEME_STORAGE_PRESET);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<StorefrontThemeContextValue>(
    () => ({
      config,
      mode: resolved.mode,
      presetId: resolved.presetId,
      previewPresetId,
      palette: resolved.palette,
      surfaceIsDark: isDarkColor(resolved.palette.surface),
      shellIsDark: isDarkColor(resolved.palette.shell),
      toggleMode,
      setMode,
      setPreviewPreset,
      resetPreview
    }),
    [config, resolved, previewPresetId, toggleMode, setMode, setPreviewPreset, resetPreview]
  );

  return (
    <StorefrontThemeContext.Provider value={value}>
      {/* Scoped storefront theme variables: only mounts inside (storefront)/layout so /admin keeps its own tokens */}
      {/* eslint-disable-next-line react/no-danger */}
      <style id="pm-storefront-theme" dangerouslySetInnerHTML={{ __html: cssText }} />
      {children}
    </StorefrontThemeContext.Provider>
  );
}

export function useStorefrontTheme(): StorefrontThemeContextValue {
  return useContext(StorefrontThemeContext);
}
