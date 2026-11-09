"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuickView } from "@/components/commerce/QuickView";
import { classNames } from "@/lib/format";
import type { Product } from "@/types";

export function Selection({
  products,
  heading,
  lead,
  id,
  tone = "canvas",
  showCustomSizeNote = true
}: {
  products: Product[];
  heading: string;
  lead: string;
  id: string;
  tone?: "canvas" | "surface";
  showCustomSizeNote?: boolean;
}) {
  const [quick, setQuick] = useState<Product | null>(null);
  const headingId = `selection-${id}`;

  return (
    <section
      className={classNames("py-10 lg:py-24", tone === "surface" ? "bg-surface" : "bg-page")}
      aria-labelledby={headingId}
    >
      <div className="pm-shell">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <h2 id={headingId} className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">{heading}</h2>
            {lead && <p className="line-clamp-2 max-w-[58ch] text-body-sm leading-relaxed text-muted sm:line-clamp-none">{lead}</p>}
          </div>
          <Link href="/shop" className="group -my-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-medium text-primary hover:text-primary-strong lg:my-0 lg:min-h-0">
            View all products
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 2xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 3} onQuickView={setQuick} />
          ))}
        </div>

        {showCustomSizeNote && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 sm:mt-8 sm:gap-4 sm:pt-6">
            <p className="text-caption text-muted sm:text-body-sm">Looking for a size that is not listed? Boards are cut to order.</p>
            <Link href="/contact" className="inline-flex h-11 items-center rounded-md border border-primary/25 bg-surface px-5 text-body-sm font-medium text-brand transition-colors hover:border-primary hover:bg-primary-soft">
              Ask about a custom size
            </Link>
          </div>
        )}
      </div>

      <QuickView product={quick} open={Boolean(quick)} onClose={() => setQuick(null)} />
    </section>
  );
}
