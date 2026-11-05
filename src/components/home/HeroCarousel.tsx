"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cloudinaryLoader, imageUrl } from "@/lib/media";
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
    return (
      <div key={`${slide.label}-${role}`} className={`pm-hero-slide pm-hero-slide-${role}`}>
        <div className="pm-hero-slide-copy relative z-10 flex flex-col justify-center bg-white px-4 sm:px-6 lg:px-0 lg:pr-12 xl:pr-20">
          <h1 id={role === "incoming" ? "hero-heading" : undefined} className="pm-hero-heading mt-4 max-w-[12ch] font-sans text-[clamp(2.7rem,5vw,5rem)] font-normal leading-[0.98] tracking-[-0.04em] text-[#142D49]">{title}</h1>
          <p className="pm-hero-description mt-5 max-w-[32rem] text-[1rem] leading-7 text-[#66768A] sm:text-[1.05rem]">{description}</p>
          <Link href={href} className="pm-hero-cta mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-brand-deep">
            Shop {slide.label} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="pm-hero-slide-product relative min-h-[12rem] bg-white sm:min-h-[17rem] md:min-h-[26rem] lg:min-h-[29rem]">
          <Link href={`/product/${slide.product.slug}`} className="absolute inset-[5%_12%_5%_12%] block focus-visible:outline-2 focus-visible:outline-[#F28C28]" aria-label={`View ${slide.product.name}`}>
            <Image
              src={imageUrl(slide.image, { fit: "scale", width: 1400 })}
              loader={cloudinaryLoader}
              alt={`${slide.product.name} — Plusmark ${slide.label.slice(0, -1)}`}
              width={1400}
              height={1400}
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
        src={imageUrl(slide.image, { fit: "scale", width: 1400 })}
        loader={cloudinaryLoader}
        alt={`${slide.product.name} — Plusmark ${slide.label.slice(0, -1)}`}
        width={1400}
        height={1400}
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
        <span className="absolute bottom-[7%] left-1/2 z-0 h-[9%] w-[64%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(20,45,73,0.18),rgba(20,45,73,0)_70%)]" aria-hidden />
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
      <section
        aria-labelledby="hero-heading-mobile"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#F7F5F0_0%,#FFFFFF_100%)] lg:hidden"
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
        <div className="px-5 pb-12 pt-10 sm:grid sm:min-h-[70vh] sm:grid-cols-[45%_55%] sm:items-center sm:gap-8 sm:px-8 sm:py-12">
          <div key={active} className="pm-hero-copy-in flex min-w-0 flex-col items-start">
            <h1 id="hero-heading-mobile" className="min-h-[2.2em] max-w-[14ch] font-sans text-[clamp(2.25rem,9vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[#142D49] sm:max-w-none sm:text-[clamp(2.75rem,5.5vw,3.75rem)]">
              {title}
            </h1>
            <p className="mt-4 min-h-[4.5rem] max-w-[32ch] text-[0.9375rem] leading-relaxed text-[#66768A] sm:mt-5 sm:min-h-[3.25rem] sm:max-w-[40ch] sm:text-base">
              {description}
            </p>
            <Link
              href={href}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-brand px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:mt-7 sm:w-auto sm:justify-center sm:px-6"
            >
              Shop {slides[active].label} <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 min-w-0 sm:mt-0">
            <div className="relative aspect-[4/3] w-full touch-pan-y sm:aspect-auto sm:h-[clamp(23.75rem,42vh,30rem)]">
              {outgoing !== null && renderMedia(outgoing, "out")}
              {renderMedia(active, "in")}
            </div>

            <div className="mt-5 flex items-center justify-between sm:mt-6">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(-1)} aria-label="Previous slide" className="flex size-11 items-center justify-center rounded-full border border-hair bg-white text-brand transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                  <ArrowLeft className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => move(1)} aria-label="Next slide" className="flex size-11 items-center justify-center rounded-full border border-hair bg-white text-brand transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.1em] text-[#12345A]">
                <span aria-live="polite">{String(active + 1).padStart(2, "0")} / 04</span>
                <span className="h-px w-16 bg-[#E6EBF1] sm:w-24">
                  <span className="block h-px bg-[#F28C28] transition-[width] duration-300" style={{ width: `${((active + 1) / 4) * 100}%` }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="hero-heading"
        className="relative hidden overflow-hidden bg-white lg:block"
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
        <div className="pm-shell relative min-h-[39rem] max-w-[90rem] bg-white sm:min-h-[44rem] md:min-h-[29rem]">
          <div className="pm-hero-slide-stage absolute inset-0">
            {outgoing !== null && renderSlide(outgoing, "outgoing")}
            {renderSlide(active, "incoming")}
          </div>

          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-between px-md sm:px-lg lg:bottom-7 xl:px-0">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Previous slide" className="flex size-11 items-center justify-center rounded-full border border-hair bg-white text-brand transition-colors hover:border-brand lg:size-9"><ArrowLeft className="size-4" /></button>
              <button type="button" onClick={() => move(1)} aria-label="Next slide" className="flex size-11 items-center justify-center rounded-full border border-hair bg-white text-brand transition-colors hover:border-brand lg:size-9"><ArrowRight className="size-4" /></button>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.1em] text-[#12345A]">
              <span aria-live="polite">{String(active + 1).padStart(2, "0")} / 04</span>
              <span className="h-px w-20 bg-[#E6EBF1]"><span className="block h-px bg-[#F28C28] transition-[width]" style={{ width: `${((active + 1) / 4) * 100}%` }} /></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
