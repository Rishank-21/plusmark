"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, ReceiptText, Truck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroLoader, imageUrl } from "@/lib/media";
import type { Product } from "@/types";

type HeroProduct = { product: Product; label: string; image: string };

export function HeroCarousel({
  products
}: {
  products: { main: Product; chalk: Product; notice: Product; ceramic: Product };
}) {
  const slides: HeroProduct[] = [
    { product: products.main, label: "White Boards", image: "plusmark/banners/metallic-premium-white-board" },
    { product: products.chalk, label: "Chalk Boards", image: "plusmark/banners/metallic-premium-chalk-board" },
    { product: products.notice, label: "Notice Boards", image: "plusmark/banners/metallic-premium-notice-board" },
    { product: products.ceramic, label: "Ceramic Boards", image: "plusmark/banners/metallic-premium-ceramic-board" }
  ];
  const copy = [
    ["PREMIUM WRITING COLLECTION", "Make Every Idea Visible.", "Discover quality whiteboards designed for everyday learning, planning and creativity.", "/shop/white-boards"],
    ["CLASSIC WRITING COLLECTION", "Ideas Begin Here.", "Explore quality chalkboards made for classrooms and creative spaces.", "/shop/chalk-boards"],
    ["ORGANIZE YOUR SPACE", "Keep What Matters in Sight.", "Discover practical notice boards for displaying ideas, updates and inspiration.", "/shop/notice-boards"],
    ["PREMIUM COLLECTION", "Built for Everyday Excellence.", "Explore premium ceramic writing surfaces designed for everyday performance.", "/collections/ceramic-boards"]
  ] as const;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const transitionLock = useRef(false);
  const transitionTimer = useRef<number | null>(null);
  const [outgoing, setOutgoing] = useState<number | null>(null);

  const move = useCallback((direction: 1 | -1) => {
    if (transitionLock.current) return;
    transitionLock.current = true;
    setOutgoing(active);
    setActive((current) => (current + direction + slides.length) % slides.length);
    transitionTimer.current = window.setTimeout(() => {
      transitionLock.current = false;
      setOutgoing(null);
    }, 950);
  }, [active, slides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => move(1), 3500);
    return () => window.clearInterval(timer);
  }, [move, paused]);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  const renderSlide = (index: number, role: "incoming" | "outgoing") => {
    const [, title, description, href] = copy[index];
    const slide = slides[index];
    const Heading = role === "incoming" ? "h1" : "p";
    return (
      <div key={`${slide.label}-${role}`} className={`pm-hero-slide pm-hero-slide-${role}`}>
        <div className="pm-hero-slide-copy relative z-10 flex flex-col justify-center bg-surface px-4 sm:px-6 lg:px-0 lg:pr-12 xl:pr-20">
          <Heading id={role === "incoming" ? "hero-heading" : undefined} className="pm-hero-heading mt-0 max-w-[13ch] font-display text-[clamp(2.75rem,4.6vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">{title}</Heading>
          <p className="pm-hero-description mt-6 max-w-[34rem] text-[1.0625rem] leading-7 text-muted">{description}</p>
          <Link href={href} className="pm-hero-cta mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-md bg-primary px-6 text-body-sm font-semibold text-onprimary shadow-card transition-colors hover:bg-primary-strong">
            Shop {slide.label} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="pm-hero-slide-product relative min-h-[12rem] bg-surface sm:min-h-[17rem] md:min-h-[26rem] lg:min-h-[30rem]">
          <Link href={`/product/${slide.product.slug}`} className="absolute inset-[2%_4%] block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label={`View ${slide.product.name}`}>
            <Image
              src={imageUrl(slide.image, { fit: "limit", width: 1600 })}
              loader={heroLoader}
              alt={`${slide.product.name} — Plusmark ${slide.label.slice(0, -1)}`}
              width={1600}
              height={1600}
              sizes="(max-width: 639px) 80vw, 48vw"
              priority={index === 0}
              className="pm-hero-product-image h-full w-full object-contain transition-transform duration-500 hover:scale-[1.025]"
            />
          </Link>
        </div>
      </div>
    );
  };

  const renderMedia = (index: number, role: "in" | "out") => {
    const slide = slides[index];
    const picture = (
      <Image
        src={imageUrl(slide.image, { fit: "limit", width: 1600 })}
        loader={heroLoader}
        alt={`${slide.product.name} — Plusmark ${slide.label.slice(0, -1)}`}
        width={1600}
        height={1600}
        sizes="(max-width: 639px) 92vw, 55vw"
        priority={role === "in" && index === 0}
        className="relative z-10 h-full w-full object-contain"
      />
    );
    return (
      <div
        key={`${role}-${index}`}
        className={`absolute inset-0 flex items-center justify-center px-[5%] pb-[6%] pt-[3%] ${role === "in" ? "pm-hero-media-in" : "pm-hero-media-out pointer-events-none"}`}
        aria-hidden={role === "out" ? true : undefined}
      >
        <span className="absolute bottom-[7%] left-1/2 z-0 h-[9%] w-[64%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(var(--c-primary)/0.12),rgb(var(--c-primary)/0)_70%)]" aria-hidden />
        {role === "in" ? (
          <Link href={`/product/${slide.product.slug}`} className="relative z-10 h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" aria-label={`View ${slide.product.name}`}>
            {picture}
          </Link>
        ) : (
          picture
        )}
      </div>
    );
  };

  const [, title, description, href] = copy[active];

  return (
    <>
      <PhoneHero slides={slides} copy={copy} />

      <section
        className="relative hidden overflow-hidden bg-[linear-gradient(180deg,rgb(var(--c-primary)/0.07)_0%,rgb(var(--c-bg))_100%)] md:block lg:hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
          setPaused(true);
        }}
        onTouchEnd={(event) => {
          if (touchStart.current !== null) {
            const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
            if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
          }
          touchStart.current = null;
        }}
      >
        <div className="px-5 pb-8 pt-6 sm:grid sm:min-h-[70vh] sm:grid-cols-[45%_55%] sm:items-center sm:gap-8 sm:px-8 sm:py-12">
          <div key={active} className="pm-hero-copy-in flex min-w-0 flex-col items-start">
            <h1 id="hero-heading-mobile" className="min-h-[2.2em] max-w-[14ch] font-display text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:max-w-none sm:text-[clamp(2.75rem,5.5vw,3.75rem)]">
              {title}
            </h1>
            <p className="mt-3 min-h-[3.4rem] max-w-[34ch] text-[0.9375rem] leading-[1.45] text-muted sm:mt-5 sm:min-h-[3.25rem] sm:max-w-[40ch] sm:text-base">
              {description}
            </p>
            <Link
              href={href}
              className="mt-5 inline-flex h-12 w-full items-center justify-between gap-3 rounded-md bg-primary px-5 text-body-sm font-semibold text-onprimary shadow-card transition-colors hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:mt-7 sm:w-auto sm:justify-center sm:px-6"
            >
              Shop {slides[active].label} <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>

          <div className="mt-6 min-w-0 sm:mt-0">
            <div className="relative aspect-[16/10] w-full touch-pan-y sm:aspect-auto sm:h-[clamp(23.75rem,42vh,30rem)]">
              {outgoing !== null && renderMedia(outgoing, "out")}
              {renderMedia(active, "in")}
            </div>

            <div className="mt-3 flex items-center justify-end sm:mt-6">
              <div className="flex items-center gap-3 text-caption font-semibold tabular tracking-[0.1em] text-ink">
                <span aria-live="polite">{String(active + 1).padStart(2, "0")} / 04</span>
                <span className="h-0.5 w-16 rounded-full bg-line-strong sm:w-24">
                  <span className="block h-0.5 rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((active + 1) / 4) * 100}%` }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="hero-heading"
        className="relative hidden overflow-hidden bg-surface lg:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
          setPaused(true);
        }}
        onTouchEnd={(event) => {
          if (touchStart.current !== null) {
            const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
            if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
          }
          touchStart.current = null;
        }}
      >
        <div className="pm-shell relative min-h-[32rem] bg-surface sm:min-h-[36rem] md:min-h-[30rem]">
          <div className="pm-hero-slide-stage absolute inset-0">
            {outgoing !== null && renderSlide(outgoing, "outgoing")}
            {renderSlide(active, "incoming")}
          </div>

          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-end px-md sm:px-lg lg:bottom-7 xl:px-0">
            <div className="flex items-center gap-3 text-caption font-semibold tabular tracking-[0.1em] text-ink">
              <span aria-live="polite">{String(active + 1).padStart(2, "0")} / 04</span>
              <span className="h-0.5 w-20 rounded-full bg-line-strong"><span className="block h-0.5 rounded-full bg-primary transition-[width]" style={{ width: `${((active + 1) / 4) * 100}%` }} /></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type HeroSlideCopy = readonly (readonly [string, string, string, string])[];

const TRUST_ITEMS = [
  { Icon: ReceiptText, label: "GST invoice" },
  { Icon: Truck, label: "Pan-India dispatch" },
  { Icon: CalendarDays, label: "Since 2015" }
] as const;

const PHONE_GAP = 12;

function PhoneHero({ slides, copy }: { slides: HeroProduct[]; copy: HeroSlideCopy }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<number[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const scrollToSlide = useCallback(
    (target: number) => {
      const rail = railRef.current;
      const card = rail?.children[target] as HTMLElement | undefined;
      if (!rail || !card) return;
      const pad = Number.parseFloat(window.getComputedStyle(rail).paddingLeft) || 0;
      rail.scrollTo({ left: card.offsetLeft - pad, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion]
  );

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      scrollToSlide((indexRef.current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, scrollToSlide, slides.length]);

  const handleScroll = () => {
    const rail = railRef.current;
    const first = rail?.children[0] as HTMLElement | undefined;
    if (!rail || !first) return;
    const step = first.offsetWidth + PHONE_GAP;
    const next = Math.max(0, Math.min(slides.length - 1, Math.round(rail.scrollLeft / step)));
    setIndex((current) => (current === next ? current : next));
  };

  const markLoaded = (position: number) =>
    setLoaded((current) => (current.includes(position) ? current : [...current, position]));

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured board collections"
      className="mt-3 md:hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="relative">
        <div
          ref={railRef}
          onScroll={handleScroll}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          className="no-scrollbar relative flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4"
        >
          {slides.map((slide, position) => {
            const [, title, description, href] = copy[position];
            const Heading = position === 0 ? "h1" : "h2";
            return (
              <article
                key={slide.label}
                role="group"
                aria-roledescription="slide"
                aria-label={`${position + 1} of ${slides.length}`}
                className="pm-hero-phone-card relative h-[clamp(380px,52vh,420px)] w-[calc(100vw-2.75rem)] shrink-0 snap-start overflow-hidden rounded-2xl"
              >
                <div className="pointer-events-none relative z-10 flex h-full flex-col p-5">
                  <Heading className="font-display text-[1.75rem] font-extrabold leading-[1.214] text-white">{title}</Heading>
                  <p className="mt-2 line-clamp-2 text-[0.875rem] leading-[1.375rem] text-white/80">{description}</p>
                  <Link
                    href={href}
                    className="pointer-events-auto relative z-20 mt-3 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[rgb(var(--pm-hero-cta-bg))] px-6 text-[0.9375rem] font-semibold text-[rgb(var(--pm-hero-cta-fg))] transition-colors hover:bg-[rgb(var(--pm-hero-cta-bg)_/_0.9)] focus-visible:ring-white focus-visible:ring-offset-[rgb(var(--pm-hero-focus-offset))]"
                  >
                    Shop {slide.label} <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>

                <Link
                  href={`/product/${slide.product.slug}`}
                  aria-label={`View ${slide.product.name}`}
                  className="absolute bottom-1 right-1 z-0 block aspect-square w-[min(54%,216px)] -rotate-2 focus-visible:ring-white focus-visible:ring-offset-[rgb(var(--pm-hero-focus-offset))]"
                >
                  {!loaded.includes(position) && <span className="pm-hero-phone-skeleton absolute inset-0 rounded-2xl" aria-hidden />}
                  <Image
                    src={imageUrl(slide.image, { fit: "limit", width: 1600 })}
                    loader={heroLoader}
                    alt={`${slide.product.name} — Plusmark ${slide.label.slice(0, -1)}`}
                    width={1600}
                    height={1600}
                    sizes="(max-width: 767px) 58vw, 320px"
                    loading={position === 0 ? "eager" : "lazy"}
                    fetchPriority={position === 0 ? "high" : "auto"}
                    onLoad={() => markLoaded(position)}
                    ref={(node) => {
                      if (node?.complete && node.naturalWidth > 0) markLoaded(position);
                    }}
                    className="relative h-full w-full object-contain"
                  />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 pl-4">
          <div className="pointer-events-auto flex w-fit items-center">
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.label}
                type="button"
                onClick={() => scrollToSlide(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-current={dotIndex === index ? "true" : undefined}
                className="flex size-11 items-center justify-center rounded-full focus-visible:ring-white focus-visible:ring-offset-[rgb(var(--pm-hero-focus-offset))]"
              >
                <span
                  aria-hidden
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2 px-4 text-center">
        {TRUST_ITEMS.map(({ Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-1 text-[0.75rem] font-medium leading-4 text-muted">
            <Icon className="size-4" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
