export type ThemeMode = "light" | "dark";

export interface ThemePalette {
  colorScheme: ThemeMode;
  bg: string;
  surface: string;
  surfaceMuted: string;
  sunken: string;
  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  onPrimary: string;
  shell: string;
  onShell: string;
  rating: string;
}

export interface StorefrontThemeConfig {
  version: 1;
  presetId: string;
  defaultMode: ThemeMode;
  showFrontendToggle: boolean;
  showPresetTester: boolean;
  light: ThemePalette;
  dark: ThemePalette;
}

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  light: ThemePalette;
  dark: ThemePalette;
}

export const STOREFRONT_THEME_STORAGE_MODE = "plusmark.storefront.theme-mode.v1";
export const STOREFRONT_THEME_STORAGE_PRESET = "plusmark.storefront.theme-preset.v1";

export function normalizeHex(input: unknown, fallback: string): string {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim();
  const full = trimmed.match(/^#?([0-9a-f]{6})$/i);
  if (full) return `#${full[1].toUpperCase()}`;
  const short = trimmed.match(/^#?([0-9a-f]{3})$/i);
  if (short) {
    const [r, g, b] = short[1].toUpperCase().split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = normalizeHex(hex, "#000000").slice(1);
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

export function hexToRgbTriplet(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  const mix = (a: number, b: number) => Math.round(a * (1 - w) + b * w).toString(16).padStart(2, "0");
  return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`.toUpperCase();
}

export function relativeLuminance(hex: string): number {
  const channels = hexToRgb(hex).map((value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function isDarkColor(hex: string): boolean {
  return relativeLuminance(hex) < 0.22;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function bestContrastInk(bgHex: string, lightInk = "#FFFFFF", darkInk = "#141413"): string {
  return contrastRatio(lightInk, bgHex) >= contrastRatio(darkInk, bgHex) ? lightInk : darkInk;
}

/** Recomputes derived hover/soft/borderStrong tokens smoothly when an admin edits main palette colors. */
export function derivePaletteTokens(partial: ThemePalette, changedKey?: keyof ThemePalette): ThemePalette {
  const darkSurface = isDarkColor(partial.bg);
  const scheme = partial.colorScheme;
  return {
    ...partial,
    colorScheme: scheme,
    sunken:
      !partial.sunken || changedKey === "surfaceMuted" || changedKey === "bg"
        ? mixHex(partial.surfaceMuted, darkSurface ? "#FFFFFF" : "#000000", 0.08)
        : partial.sunken,
    borderStrong:
      !partial.borderStrong || changedKey === "border" || changedKey === "text"
        ? mixHex(partial.border, partial.text, darkSurface ? 0.28 : 0.22)
        : partial.borderStrong,
    primaryStrong:
      !partial.primaryStrong || changedKey === "primary"
        ? mixHex(partial.primary, darkSurface ? "#FFFFFF" : "#000000", 0.16)
        : partial.primaryStrong,
    primarySoft:
      !partial.primarySoft || changedKey === "primary" || changedKey === "surface"
        ? mixHex(partial.surface, partial.primary, darkSurface ? 0.22 : 0.1)
        : partial.primarySoft
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "plusmark-editorial",
    name: "Plusmark Editorial",
    tagline: "Warm off-white canvas & ink black · Charcoal category bar",
    light: {
      colorScheme: "light",
      bg: "#FAF9F6",
      surface: "#FFFFFF",
      surfaceMuted: "#F4F2EE",
      sunken: "#EBE8E2",
      text: "#141413",
      textMuted: "#57544E",
      border: "#E4E1DB",
      borderStrong: "#C4BFB6",
      primary: "#141413",
      primaryStrong: "#2E2D2A",
      primarySoft: "#F2F0EB",
      onPrimary: "#FFFFFF",
      shell: "#181816",
      onShell: "#FAF9F6",
      rating: "#B4780F"
    },
    dark: {
      colorScheme: "dark",
      bg: "#111110",
      surface: "#191917",
      surfaceMuted: "#232220",
      sunken: "#2E2D29",
      text: "#FAF9F6",
      textMuted: "#B8B3A8",
      border: "#2E2D29",
      borderStrong: "#4A4842",
      primary: "#FAF9F6",
      primaryStrong: "#E6E3DB",
      primarySoft: "#2A2926",
      onPrimary: "#141413",
      shell: "#0B0B0A",
      onShell: "#FAF9F6",
      rating: "#EAB308"
    }
  },
  {
    id: "gajjar-luxury",
    name: "Gajjar Warm Cream & Gold",
    tagline: "Gajjar Furnitures palette — warm ivory, soft black & brushed gold",
    light: {
      colorScheme: "light",
      bg: "#FDFBF7",
      surface: "#FFFFFF",
      surfaceMuted: "#F4F0E8",
      sunken: "#EAE3D5",
      text: "#121316",
      textMuted: "#6B6861",
      border: "#E8E2D7",
      borderStrong: "#D1C7B7",
      primary: "#C5A059",
      primaryStrong: "#A9843E",
      primarySoft: "#FBF6EC",
      onPrimary: "#FFFFFF",
      shell: "#26282E",
      onShell: "#FDFBF7",
      rating: "#C5A059"
    },
    dark: {
      colorScheme: "dark",
      bg: "#0E0F12",
      surface: "#16181D",
      surfaceMuted: "#1F222A",
      sunken: "#2A2E38",
      text: "#F5F3EF",
      textMuted: "#9EA3B0",
      border: "#2A2E38",
      borderStrong: "#404656",
      primary: "#D4AF37",
      primaryStrong: "#E0C058",
      primarySoft: "#272318",
      onPrimary: "#0E0F12",
      shell: "#090A0C",
      onShell: "#F5F3EF",
      rating: "#D4AF37"
    }
  },
  {
    id: "aurora-indigo",
    name: "Aurora Indigo",
    tagline: "Cool slate neutral with deep indigo primary CTAs",
    light: {
      colorScheme: "light",
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#F1F5F9",
      sunken: "#E2E8F0",
      text: "#0F172A",
      textMuted: "#64748B",
      border: "#E2E8F0",
      borderStrong: "#CBD5E1",
      primary: "#4F46E5",
      primaryStrong: "#3730A3",
      primarySoft: "#EEF2FF",
      onPrimary: "#FFFFFF",
      shell: "#1E1B4B",
      onShell: "#F8FAFC",
      rating: "#F59E0B"
    },
    dark: {
      colorScheme: "dark",
      bg: "#0B1020",
      surface: "#131A2E",
      surfaceMuted: "#1B2540",
      sunken: "#2D3A5D",
      text: "#F8FAFC",
      textMuted: "#AAB6D1",
      border: "#2D3A5D",
      borderStrong: "#475886",
      primary: "#A78BFA",
      primaryStrong: "#C4B5FD",
      primarySoft: "#2E2351",
      onPrimary: "#0B1020",
      shell: "#070B18",
      onShell: "#F8FAFC",
      rating: "#FBBF24"
    }
  },
  {
    id: "mint-signal",
    name: "Mint Signal",
    tagline: "Crisp botanical light & deep pine dark",
    light: {
      colorScheme: "light",
      bg: "#F7FCF9",
      surface: "#FFFFFF",
      surfaceMuted: "#ECFDF5",
      sunken: "#D1FAE5",
      text: "#062B21",
      textMuted: "#527067",
      border: "#CDE9DD",
      borderStrong: "#A8D4C2",
      primary: "#047857",
      primaryStrong: "#065F46",
      primarySoft: "#D1FAE5",
      onPrimary: "#FFFFFF",
      shell: "#042F24",
      onShell: "#ECFDF5",
      rating: "#D97706"
    },
    dark: {
      colorScheme: "dark",
      bg: "#061813",
      surface: "#0D241D",
      surfaceMuted: "#153229",
      sunken: "#1E4438",
      text: "#ECFDF5",
      textMuted: "#9AC2B5",
      border: "#1F4237",
      borderStrong: "#2E6050",
      primary: "#34D399",
      primaryStrong: "#6EE7B7",
      primarySoft: "#0E3328",
      onPrimary: "#061813",
      shell: "#03100C",
      onShell: "#ECFDF5",
      rating: "#FBBF24"
    }
  },
  {
    id: "solar-ember",
    name: "Solar Ember",
    tagline: "Warm paper & terracotta orange accent",
    light: {
      colorScheme: "light",
      bg: "#FFFBF7",
      surface: "#FFFFFF",
      surfaceMuted: "#FFEDD5",
      sunken: "#FED7AA",
      text: "#2D1A12",
      textMuted: "#7C6258",
      border: "#F3D4C2",
      borderStrong: "#E5B396",
      primary: "#C2410C",
      primaryStrong: "#9A3412",
      primarySoft: "#FFEDD5",
      onPrimary: "#FFFFFF",
      shell: "#431407",
      onShell: "#FFF7ED",
      rating: "#EA580C"
    },
    dark: {
      colorScheme: "dark",
      bg: "#170E0A",
      surface: "#231610",
      surfaceMuted: "#2F1E16",
      sunken: "#422B20",
      text: "#FFF7ED",
      textMuted: "#D0B4A6",
      border: "#3D271E",
      borderStrong: "#5D3D30",
      primary: "#FB923C",
      primaryStrong: "#FDBA74",
      primarySoft: "#381F12",
      onPrimary: "#170E0A",
      shell: "#0F0805",
      onShell: "#FFF7ED",
      rating: "#FDBA74"
    }
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    tagline: "Calm architectural slate teal",
    light: {
      colorScheme: "light",
      bg: "#F5FBFB",
      surface: "#FFFFFF",
      surfaceMuted: "#E7F6F5",
      sunken: "#CCFBF1",
      text: "#12302F",
      textMuted: "#557574",
      border: "#C8E3E1",
      borderStrong: "#A0CDC9",
      primary: "#0F766E",
      primaryStrong: "#115E59",
      primarySoft: "#CCFBF1",
      onPrimary: "#FFFFFF",
      shell: "#042F2E",
      onShell: "#F0FDFA",
      rating: "#D97706"
    },
    dark: {
      colorScheme: "dark",
      bg: "#061717",
      surface: "#0D2424",
      surfaceMuted: "#143333",
      sunken: "#1E4747",
      text: "#F0FDFA",
      textMuted: "#98C4C2",
      border: "#1C4040",
      borderStrong: "#2E6060",
      primary: "#2DD4BF",
      primaryStrong: "#5EEAD4",
      primarySoft: "#103534",
      onPrimary: "#061717",
      shell: "#030E0E",
      onShell: "#F0FDFA",
      rating: "#FBBF24"
    }
  },
  {
    id: "obsidian-aurora",
    name: "Midnight Violet",
    tagline: "High-contrast dark violet & cool daylight",
    light: {
      colorScheme: "light",
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#F1F5F9",
      sunken: "#E2E8F0",
      text: "#0F172A",
      textMuted: "#475569",
      border: "#CBD5E1",
      borderStrong: "#94A3B8",
      primary: "#6D28D9",
      primaryStrong: "#5B21B6",
      primarySoft: "#F3E8FF",
      onPrimary: "#FFFFFF",
      shell: "#1E1B4B",
      onShell: "#F8FAFC",
      rating: "#D97706"
    },
    dark: {
      colorScheme: "dark",
      bg: "#0B1020",
      surface: "#121A2A",
      surfaceMuted: "#1B2540",
      sunken: "#2D3A5D",
      text: "#F8FAFC",
      textMuted: "#C1CBDD",
      border: "#475569",
      borderStrong: "#64748B",
      primary: "#C4B5FD",
      primaryStrong: "#DDD6FE",
      primarySoft: "#29214A",
      onPrimary: "#0B1020",
      shell: "#060A16",
      onShell: "#F8FAFC",
      rating: "#FCD34D"
    }
  }
];

export function findThemePreset(id: string | null | undefined): ThemePreset | undefined {
  return id ? THEME_PRESETS.find((preset) => preset.id === id) : undefined;
}

export function buildDefaultStorefrontTheme(): StorefrontThemeConfig {
  const base = THEME_PRESETS[0];
  return {
    version: 1,
    presetId: base.id,
    defaultMode: "light",
    showFrontendToggle: true,
    showPresetTester: true,
    light: { ...base.light },
    dark: { ...base.dark }
  };
}

function normalizePalette(raw: unknown, fallback: ThemePalette, forcedScheme: ThemeMode): ThemePalette {
  if (!raw || typeof raw !== "object") return { ...fallback, colorScheme: forcedScheme };
  const r = raw as Record<string, unknown>;
  const bg = normalizeHex(r.bg, fallback.bg);
  const surface = normalizeHex(r.surface, fallback.surface);
  const surfaceMuted = normalizeHex(r.surfaceMuted, fallback.surfaceMuted);
  const border = normalizeHex(r.border, fallback.border);
  const text = normalizeHex(r.text, fallback.text);
  const primary = normalizeHex(r.primary, fallback.primary);
  const shell = normalizeHex(r.shell, fallback.shell);
  const isDark = forcedScheme === "dark";

  return {
    colorScheme: forcedScheme,
    bg,
    surface,
    surfaceMuted,
    sunken: normalizeHex(r.sunken, mixHex(surfaceMuted, isDark ? "#FFFFFF" : "#000000", 0.08)),
    text,
    textMuted: normalizeHex(r.textMuted, fallback.textMuted),
    border,
    borderStrong: normalizeHex(r.borderStrong, mixHex(border, text, isDark ? 0.28 : 0.22)),
    primary,
    primaryStrong: normalizeHex(r.primaryStrong, mixHex(primary, isDark ? "#FFFFFF" : "#000000", 0.16)),
    primarySoft: normalizeHex(r.primarySoft, mixHex(surface, primary, isDark ? 0.22 : 0.1)),
    onPrimary: normalizeHex(r.onPrimary, fallback.onPrimary),
    shell,
    onShell: normalizeHex(r.onShell, fallback.onShell),
    rating: normalizeHex(r.rating, fallback.rating)
  };
}

export function normalizeStorefrontTheme(raw: unknown): StorefrontThemeConfig {
  const def = buildDefaultStorefrontTheme();
  if (!raw || typeof raw !== "object") return def;
  const r = raw as Record<string, unknown>;
  const preset = findThemePreset(typeof r.presetId === "string" ? r.presetId : null) ?? THEME_PRESETS[0];

  return {
    version: 1,
    presetId: typeof r.presetId === "string" && r.presetId.trim() ? r.presetId.trim() : preset.id,
    defaultMode: r.defaultMode === "dark" ? "dark" : "light",
    showFrontendToggle: r.showFrontendToggle !== false,
    showPresetTester: r.showPresetTester !== false,
    light: normalizePalette(r.light, preset.light, "light"),
    dark: normalizePalette(r.dark, preset.dark, "dark")
  };
}

/** Resolves the active CSS palette given Admin config plus optional frontend preview overrides. */
export function resolveActivePalette(
  config: StorefrontThemeConfig,
  modeOverride?: ThemeMode | null,
  previewPresetId?: string | null
): { mode: ThemeMode; palette: ThemePalette; presetId: string } {
  const mode = modeOverride ?? config.defaultMode;
  const preview = findThemePreset(previewPresetId);
  if (preview) {
    return {
      mode,
      palette: mode === "dark" ? preview.dark : preview.light,
      presetId: preview.id
    };
  }
  return {
    mode,
    palette: mode === "dark" ? config.dark : config.light,
    presetId: config.presetId
  };
}

/** Generates CSS custom properties scoped strictly to the storefront subtree. */
export function buildStorefrontThemeCss(palette: ThemePalette): string {
  const isDark = palette.colorScheme === "dark";
  const heroBg = `rgb(${hexToRgbTriplet(palette.surfaceMuted)})`;
  return `:root:has([data-surface="storefront"]) {
  color-scheme: ${palette.colorScheme};
  --c-bg: ${hexToRgbTriplet(palette.bg)};
  --c-surface: ${hexToRgbTriplet(palette.surface)};
  --c-surface-muted: ${hexToRgbTriplet(palette.surfaceMuted)};
  --c-sunken: ${hexToRgbTriplet(palette.sunken)};
  --c-text: ${hexToRgbTriplet(palette.text)};
  --c-text-muted: ${hexToRgbTriplet(palette.textMuted)};
  --c-border: ${hexToRgbTriplet(palette.border)};
  --c-border-strong: ${hexToRgbTriplet(palette.borderStrong)};
  --c-primary: ${hexToRgbTriplet(palette.primary)};
  --c-primary-strong: ${hexToRgbTriplet(palette.primaryStrong)};
  --c-primary-soft: ${hexToRgbTriplet(palette.primarySoft)};
  --c-on-primary: ${hexToRgbTriplet(palette.onPrimary)};
  --c-shell: ${hexToRgbTriplet(palette.shell)};
  --c-on-shell: ${hexToRgbTriplet(palette.onShell)};
  --c-scrim: ${isDark ? "2 6 12" : "15 15 14"};
  --c-success: ${isDark ? "52 211 153" : "21 128 61"};
  --c-success-soft: ${isDark ? "6 78 59" : "240 253 244"};
  --c-warning: ${isDark ? "251 191 36" : "161 98 7"};
  --c-warning-soft: ${isDark ? "69 26 3" : "254 249 195"};
  --c-danger: ${isDark ? "251 113 133" : "185 28 28"};
  --c-danger-soft: ${isDark ? "76 5 25" : "254 242 242"};
  --c-rating: ${hexToRgbTriplet(palette.rating)};
  --c-shadow: ${isDark ? "0 0 0" : hexToRgbTriplet(palette.text)};
  --pm-hero-bg: ${heroBg};
  --pm-hero-cta-bg: ${hexToRgbTriplet(palette.primary)};
  --pm-hero-cta-fg: ${hexToRgbTriplet(palette.onPrimary)};
  --pm-hero-focus-offset: ${hexToRgbTriplet(palette.surfaceMuted)};
}`;
}
