import { makeNavId, sanitizeNavHref } from "@/lib/header-nav";

export type HeroRatioKey = "desktop" | "tablet" | "mobile";
export type HeroOverlayMode = "image-only" | "editorial-bottom";

export interface HeroSlideConfig {
  id: string;
  active: boolean;
  /** Target path or URL when clicking the banner or CTA. */
  href: string;
  alt: string;
  overlayMode: HeroOverlayMode;
  eyebrow: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  /** Multi-ratio image assets (Cloudinary publicId, `/images/...` path, or URL). */
  images: {
    desktop: string;
    tablet: string | null;
    mobile: string | null;
  };
}

export interface HeroSectionConfig {
  version: 1;
  autoPlaySeconds: number;
  aspectDesktop: "21/8" | "16/7" | "16/9";
  slides: HeroSlideConfig[];
}

export interface HeroResolutionPreset {
  id: string;
  ratioSlot: HeroRatioKey;
  label: string;
  width: number;
  height: number;
  openAiSize: "1536x1024" | "1024x1024" | "1024x1536";
  geminiAspect: "16:9" | "4:3" | "3:4" | "1:1";
}

export const HERO_RESOLUTION_PRESETS: HeroResolutionPreset[] = [
  {
    id: "desktop-wide",
    ratioSlot: "desktop",
    label: "Desktop Wide Banner (1600×700 · 16:7)",
    width: 1600,
    height: 700,
    openAiSize: "1536x1024",
    geminiAspect: "16:9"
  },
  {
    id: "desktop-16x9",
    ratioSlot: "desktop",
    label: "Desktop 16:9 Full HD (1920×1080)",
    width: 1920,
    height: 1080,
    openAiSize: "1536x1024",
    geminiAspect: "16:9"
  },
  {
    id: "tablet-4x3",
    ratioSlot: "tablet",
    label: "Tablet Landscape (1200×900 · 4:3)",
    width: 1200,
    height: 900,
    openAiSize: "1536x1024",
    geminiAspect: "4:3"
  },
  {
    id: "mobile-4x5",
    ratioSlot: "mobile",
    label: "Mobile Portrait (1080×1350 · 4:5)",
    width: 1080,
    height: 1350,
    openAiSize: "1024x1536",
    geminiAspect: "3:4"
  },
  {
    id: "mobile-square",
    ratioSlot: "mobile",
    label: "Mobile Square (1080×1080 · 1:1)",
    width: 1080,
    height: 1080,
    openAiSize: "1024x1024",
    geminiAspect: "1:1"
  }
];

export const HERO_PROMPT_TEMPLATES = [
  {
    label: "Architectural Conference Room Whiteboard",
    prompt:
      "Minimalist modern sunlit architectural boardroom with a large brushed anodized aluminium magnetic porcelain white board mounted cleanly on a warm off-white plaster wall, solid oak table foreground, soft crisp daylight shadows, editorial architectural interior photography, no text, no logos."
  },
  {
    label: "Modern Studio Green Chalkboard",
    prompt:
      "Serene architectural classroom and design studio in warm morning light, featuring a wide glare-free dark matte green ceramic chalkboard in a heavy anodized aluminium frame on a clean textured off-white wall, oak furniture, realistic studio photography, no text."
  },
  {
    label: "Office Corridor Lockable Notice Board",
    prompt:
      "Modern school and university hallway with a clean glass-front anodized aluminium pin-up cork and fabric notice board cabinet mounted neatly on an architectural concrete and timber wall, natural daylight, commercial interior photography, no text."
  }
] as const;

export function buildDefaultHeroConfig(): HeroSectionConfig {
  return {
    version: 1,
    autoPlaySeconds: 6,
    aspectDesktop: "16/7",
    slides: [
      {
        id: "architectural-white-boards",
        active: true,
        href: "/shop/white-boards",
        alt: "Plusmark anodized aluminium magnetic white board in a modern studio boardroom",
        overlayMode: "editorial-bottom",
        eyebrow: "Plusmark · Made in Ahmedabad",
        headline: "Architectural Writing Boards",
        subtitle: "Porcelain ceramic, HPL marker & custom wall sizes from 1 × 1 ft to 8 × 4 ft",
        ctaLabel: "Shop White Boards",
        images: {
          desktop: "/images/plusmark/hero/hero-whiteboard-desktop.jpg",
          tablet: null,
          mobile: "/images/plusmark/hero/hero-whiteboard-mobile.jpg"
        }
      },
      {
        id: "glare-free-chalk-boards",
        active: true,
        href: "/shop/chalk-boards",
        alt: "Plusmark heavy anodized aluminium matte green chalk board for classrooms and studios",
        overlayMode: "editorial-bottom",
        eyebrow: "Non-Reflective Surfaces",
        headline: "Ceramic & Matte Chalk Boards",
        subtitle: "Built for daily classroom clarity across Metallic, Eco & Deluxe series",
        ctaLabel: "Shop Chalk Boards",
        images: {
          desktop: "/images/plusmark/hero/hero-chalkboard-desktop.jpg",
          tablet: null,
          mobile: "/images/plusmark/hero/hero-chalkboard-mobile.jpg"
        }
      }
    ]
  };
}

function normalizeSlide(raw: unknown, index: number): HeroSlideConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const imgs = (r.images && typeof r.images === "object" ? r.images : {}) as Record<string, unknown>;
  const desktop = typeof imgs.desktop === "string" ? imgs.desktop.trim() : "";
  if (!desktop) return null;

  const tablet = typeof imgs.tablet === "string" && imgs.tablet.trim() ? imgs.tablet.trim() : null;
  const mobile = typeof imgs.mobile === "string" && imgs.mobile.trim() ? imgs.mobile.trim() : null;
  const headline = typeof r.headline === "string" ? r.headline.trim() : "";
  const idSeed = typeof r.id === "string" && r.id.trim() ? r.id.trim() : headline || `slide-${index + 1}`;

  return {
    id: makeNavId(idSeed),
    active: r.active !== false,
    href: sanitizeNavHref(r.href, "/shop"),
    alt: typeof r.alt === "string" && r.alt.trim() ? r.alt.trim() : headline || "Plusmark writing boards",
    overlayMode: r.overlayMode === "image-only" ? "image-only" : "editorial-bottom",
    eyebrow: typeof r.eyebrow === "string" ? r.eyebrow.trim() : "",
    headline,
    subtitle: typeof r.subtitle === "string" ? r.subtitle.trim() : "",
    ctaLabel: typeof r.ctaLabel === "string" ? r.ctaLabel.trim() : "",
    images: { desktop, tablet, mobile }
  };
}

export function normalizeHeroConfig(raw: unknown): HeroSectionConfig {
  const def = buildDefaultHeroConfig();
  if (!raw || typeof raw !== "object") return def;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.slides)) return def;

  const slides = r.slides
    .map((entry, idx) => normalizeSlide(entry, idx))
    .filter((x): x is HeroSlideConfig => Boolean(x));

  const aspectDesktop =
    r.aspectDesktop === "21/8" || r.aspectDesktop === "16/9" || r.aspectDesktop === "16/7"
      ? r.aspectDesktop
      : def.aspectDesktop;

  const secs = Number(r.autoPlaySeconds);
  const autoPlaySeconds = Number.isFinite(secs) && secs >= 0 && secs <= 30 ? Math.round(secs) : def.autoPlaySeconds;

  return {
    version: 1,
    autoPlaySeconds,
    aspectDesktop,
    slides: slides.length > 0 ? slides : def.slides
  };
}
