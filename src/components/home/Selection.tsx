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
  eyebrow,
  heading,
  lead,
  id,
  tone = "canvas",
  showCustomSizeNote = true,
  normalHeading = false
}: {
  products: Product[];
  eyebrow: string;
  heading: string;
  lead: string;
  id: string;
  tone?: "canvas" | "surface";
  showCustomSizeNote?: boolean;
  normalHeading?: boolean;
}) {
  const [quick, setQuick] = useState<Product | null>(null);
  const headingId = `selection-${id}`;

  return (
    <section
      className={classNames("py-14 lg:py-20", tone === "surface" ? "bg-surface" : "bg-canvas")}
      aria-labelledby={headingId}
    >
      <div className="pm-shell !max-w-[105rem]">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            {eyebrow && <p className="pm-eyebrow">{eyebrow}</p>}
            <h2 id={headingId} className={normalHeading ? "font-sans font-normal text-h1 text-navy" : "font-display text-h1 text-navy"}>{heading}</h2>
            {lead && <p className="max-w-[58ch] text-body-sm leading-relaxed text-graphite">{lead}</p>}
          </div>
          <Link href="/shop" className="group -my-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-medium text-blue hover:text-blue-deep lg:my-0 lg:min-h-0">
            View all products
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 2xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 3} onQuickView={setQuick} />
          ))}
        </div>

        {showCustomSizeNote && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6">
            <p className="text-body-sm text-graphite">Looking for a size that is not listed? Boards are cut to order.</p>
            <Link href="/contact" className="inline-flex h-11 items-center rounded-md border border-brand/25 bg-surface px-5 text-body-sm font-medium text-brand transition-colors hover:border-brand hover:bg-brand-wash">
              Ask about a custom size
            </Link>
          </div>
        )}
      </div>

      <QuickView product={quick} open={Boolean(quick)} onClose={() => setQuick(null)} />
    </section>
  );
}
