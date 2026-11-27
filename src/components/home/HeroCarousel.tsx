"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { classNames } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildDefaultHeroConfig,
  normalizeHeroConfig,
  type HeroSectionConfig,
  type HeroSlideConfig
} from "@/lib/hero-content";
import { imageUrl } from "@/lib/media";

const ASPECT_CLASSES: Record<HeroSectionConfig["aspectDesktop"], string> = {
  "21/8": "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/8]",
  "16/7": "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/7]",
  "16/9": "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]"
};

function slideSrc(asset: string, width: number, height?: number): string {
  return imageUrl(asset, {
    fit: "fill",
    gravity: "auto",
    width,
    ...(height ? { height } : {})
  });
}

export function HeroCarousel({ initialConfig = null }: { initialConfig?: HeroSectionConfig | null }) {
  const [config, setConfig] = useState<HeroSectionConfig>(() => initialConfig ?? buildDefaultHeroConfig());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (initialConfig) setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let alive = true;
    void supabase
      .from("site_content")
      .select("value")
      .eq("key", "hero_config")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error || !data?.value) return;
        setConfig(normalizeHeroConfig(data.value));
      });
    return () => {
      alive = false;
    };
  }, []);

  const slides: HeroSlideConfig[] = config.slides.filter((s) => s.active);
  const activeSlides = slides.length > 0 ? slides : buildDefaultHeroConfig().slides;
  const safeIndex = index % activeSlides.length;
  const current = activeSlides[safeIndex];

  useEffect(() => {
    if (paused || activeSlides.length <= 1 || config.autoPlaySeconds <= 0) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((cur) => (cur + 1) % activeSlides.length);
    }, config.autoPlaySeconds * 1000);
    return () => window.clearInterval(timer);
  }, [paused, activeSlides.length, config.autoPlaySeconds]);

  const step = (delta: -1 | 1) => {
    setIndex((cur) => (cur + delta + activeSlides.length) % activeSlides.length);
  };

  const desktopUrl = slideSrc(current.images.desktop, 1920);
  const tabletUrl = slideSrc(current.images.tablet || current.images.desktop, 1280);
  const mobileUrl = slideSrc(current.images.mobile || current.images.desktop, 1080);

  return (
    <section
      aria-label="Featured storefront banner"
      className="relative w-full overflow-hidden border-b border-line bg-subtle"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className={classNames("relative w-full max-h-[38rem]", ASPECT_CLASSES[config.aspectDesktop])}>
        <Link href={current.href} className="block size-full" aria-label={current.headline || current.alt}>
          <picture className="block size-full">
            <source media="(max-width: 639px)" srcSet={mobileUrl} />
            <source media="(max-width: 1023px)" srcSet={tabletUrl} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={desktopUrl}
              alt={current.alt}
              className="size-full object-cover object-center"
              fetchPriority="high"
            />
          </picture>
        </Link>

        {current.overlayMode === "editorial-bottom" && (current.headline || current.ctaLabel) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pb-10 pt-20 sm:pb-12 sm:pt-28">
            <div className="pm-shell flex flex-col items-start gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="max-w-xl text-white">
                {current.eyebrow && (
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/80">
                    {current.eyebrow}
                  </p>
                )}
                {current.headline && (
                  <h1 className="mt-1 font-display text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.375rem] lg:text-[2.75rem]">
                    {current.headline}
                  </h1>
                )}
                {current.subtitle && (
                  <p className="mt-1.5 text-caption leading-relaxed text-white/85 sm:text-body-sm">
                    {current.subtitle}
                  </p>
                )}
              </div>

              {current.ctaLabel && (
                <Link
                  href={current.href}
                  className="pointer-events-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-white px-5 text-body-sm font-semibold text-[#141413] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {current.ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          </div>
        )}

        {activeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-2.5 py-1.5 sm:bottom-4">
              {activeSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  className={classNames(
                    "h-2 rounded-full transition-all",
                    i === safeIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
