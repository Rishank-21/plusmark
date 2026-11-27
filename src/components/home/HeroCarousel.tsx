"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { classNames, productCardMeta } from "@/lib/format";
import type { Product } from "@/types";

interface HeroSlide {
  product: Product;
  label: string;
  href: string;
  specNote: string;
}

const CATEGORY_INDEX = [
  { label: "White & Magnetic Boards", meta: "1 × 1 ft to 8 × 4 ft", href: "/shop/white-boards" },
  { label: "Ceramic Steel Boards", meta: "P3 enamel surface", href: "/collections/ceramic-boards" },
  { label: "Chalk & Green Boards", meta: "Matte & ceramic", href: "/shop/chalk-boards" },
  { label: "Notice & Display Systems", meta: "Cork, felt & covered", href: "/shop/notice-boards" }
] as const;

export function HeroCarousel({
  products
}: {
  products: { main: Product; chalk: Product; notice: Product; ceramic: Product };
}) {
  const slides: HeroSlide[] = [
    {
      product: products.main,
      label: "White Boards",
      href: "/shop/white-boards",
      specNote: "Anodized aluminium frame · Marker-grade HPL or melamine writing surface"
    },
    {
      product: products.ceramic,
      label: "Ceramic Boards",
      href: "/collections/ceramic-boards",
      specNote: "Porcelain enamel steel face · Accepts magnets · Daily intensive classroom & office use"
    },
    {
      product: products.chalk,
      label: "Chalk Boards",
      href: "/shop/chalk-boards",
      specNote: "Low-glare green & black writing surface · Simple damp-cloth cleaning"
    },
    {
      product: products.notice,
      label: "Notice Boards",
      href: "/shop/notice-boards",
      specNote: "Pinnable cork & felt panels or lockable acrylic-door display cabinets"
    }
  ];

  const [selected, setSelected] = useState(0);
  const current = slides[selected];

  return (
    <section className="border-b border-line bg-page text-ink" aria-labelledby="hero-heading">
      <div className="pm-shell pb-7 pt-5 sm:pb-10 sm:pt-7 lg:pb-12 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5 text-[0.75rem] uppercase tracking-[0.14em] text-muted">
          <span>Plusmark · Narolgam, Ahmedabad</span>
          <span className="hidden sm:inline">Single boards &amp; custom sizes · GST invoice included</span>
        </div>

        <div className="grid items-center gap-8 pt-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-12 lg:pt-9">
          <div className="flex min-w-0 flex-col items-start">
            <h1
              id="hero-heading"
              className="max-w-[15ch] font-display text-[2rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-ink sm:text-[2.75rem] lg:text-[3.375rem]"
            >
              Writing and display boards built to size
            </h1>
            <p className="mt-4 max-w-[46ch] text-body-sm leading-relaxed text-muted sm:text-body">
              {current.specNote}. Published wall sizes from 1 × 1 ft to 8 × 4 ft, or custom cut to specification.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:h-12 sm:px-6"
              >
                Explore all boards
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={current.href}
                className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-4 text-body-sm font-medium text-ink transition-colors hover:border-ink/45 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:h-12 sm:px-5"
              >
                Shop {current.label}
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center px-2 text-body-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Custom size quote →
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 sm:mt-7" role="tablist" aria-label="Featured board surfaces">
              {slides.map((slide, index) => {
                const active = index === selected;
                return (
                  <button
                    key={slide.label}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelected(index)}
                    className={classNames(
                      "rounded-md border px-3 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
                      active
                        ? "border-primary bg-primary text-onprimary"
                        : "border-line-strong bg-surface text-ink hover:border-ink/45 hover:bg-subtle"
                    )}
                  >
                    {slide.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            href={`/product/${current.product.slug}`}
            className="group flex flex-col overflow-hidden rounded-md border border-line bg-surface p-4 text-ink transition-colors hover:border-line-strong sm:p-5"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-surface p-3">
              <ProductImage
                asset={current.product.media[0] ?? null}
                name={current.product.name}
                categoryId={current.product.categoryId}
                sizes="(max-width: 1023px) 92vw, 45vw"
                priority
                className="size-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3.5">
              <div className="min-w-0">
                <p className="font-display text-body font-bold text-ink underline-offset-4 group-hover:underline">
                  {current.product.name}
                </p>
                <p className="mt-0.5 text-caption text-muted">{productCardMeta(current.product)}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <PriceRange size="md" product={current.product} />
                <span className="text-caption font-medium text-ink">View sizes →</span>
              </div>
            </div>
          </Link>
        </div>

        <nav
          aria-label="Board categories"
          className="mt-8 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-6"
        >
          {CATEGORY_INDEX.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-0.5 border-b border-line pb-2 text-ink transition-colors hover:border-ink/40 lg:border-b-0 lg:pb-0"
            >
              <span className="text-body-sm font-semibold underline-offset-4 group-hover:underline">{item.label}</span>
              <span className="text-caption text-muted">{item.meta}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
