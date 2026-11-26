"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { classNames, productCardMeta } from "@/lib/format";
import type { Product } from "@/types";

interface HeroSlide {
  product: Product;
  label: string;
  href: string;
}

export function HeroCarousel({
  products
}: {
  products: { main: Product; chalk: Product; notice: Product; ceramic: Product };
}) {
  const slides: HeroSlide[] = [
    { product: products.main, label: "White Boards", href: "/shop/white-boards" },
    { product: products.ceramic, label: "Ceramic Boards", href: "/collections/ceramic-boards" },
    { product: products.chalk, label: "Chalk Boards", href: "/shop/chalk-boards" },
    { product: products.notice, label: "Notice Boards", href: "/shop/notice-boards" }
  ];

  const [selected, setSelected] = useState(0);
  const current = slides[selected];

  return (
    <section className="border-b border-line bg-surface" aria-labelledby="hero-heading">
      <div className="pm-shell py-6 sm:py-10 lg:py-14">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div className="flex min-w-0 flex-col items-start">
            <h1
              id="hero-heading"
              className="max-w-[16ch] font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[clamp(2.25rem,3.6vw,3.25rem)]"
            >
              Writing and display boards built in Ahmedabad
            </h1>
            <p className="mt-3 max-w-[46ch] text-body-sm leading-relaxed text-muted sm:mt-4 sm:text-body">
              Single boards in sizes from 1 × 1 ft to 8 × 4 ft, or cut to order. GST invoice included and dispatched across India.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-12 sm:px-6"
              >
                Shop all boards
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={current.href}
                className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-4 text-body-sm font-medium text-ink transition-colors hover:border-ink/45 hover:bg-subtle sm:h-12 sm:px-5"
              >
                Browse {current.label}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4 sm:mt-8" role="tablist" aria-label="Board types">
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
                      "rounded-md border px-3 py-1.5 text-caption font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-onprimary"
                        : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
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
            className="group flex flex-col overflow-hidden rounded-md border border-line bg-page p-4 transition-colors hover:border-line-strong sm:p-6"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-surface p-4">
              <ProductImage
                asset={current.product.media[0] ?? null}
                name={current.product.name}
                categoryId={current.product.categoryId}
                sizes="(max-width: 1023px) 92vw, 48vw"
                priority
                className="size-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <div>
                <p className="font-display text-body font-bold text-ink underline-offset-4 group-hover:underline">
                  {current.product.name}
                </p>
                <p className="text-caption text-muted">{productCardMeta(current.product)}</p>
              </div>
              <span className="text-caption font-medium text-ink">View sizes →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
