"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { buildShopCategoryItems, type ShopCategorySummary } from "@/lib/category-cards";
import { classNames, formatCount, formatInr } from "@/lib/format";
import { cloudinaryLoader, imageUrl, isCloudinaryPublicId } from "@/lib/media";

function deliveryProps(publicId: string) {
  return isCloudinaryPublicId(publicId) ? { loader: cloudinaryLoader } : { unoptimized: true as const };
}

/** Up to 18 categories stay directly visible without hiding rows behind a toggle. */
const COLLAPSE_THRESHOLD = 18;

function CategoryGlyph() {
  return (
    <svg viewBox="0 0 64 44" className="h-8 w-11 text-muted/65" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="6" y="5" width="52" height="32" rx="2" />
      <rect x="11" y="10" width="42" height="22" className="opacity-50" />
    </svg>
  );
}

export function ShopByCategory({
  items,
  totalProducts
}: {
  items?: ShopCategorySummary[];
  totalProducts?: number;
}) {
  const resolvedItems = items ?? buildShopCategoryItems(categories, products);
  const resolvedTotal = totalProducts ?? products.length;

  const [expanded, setExpanded] = useState(false);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const shouldCollapse = resolvedItems.length > COLLAPSE_THRESHOLD;
  const visible = shouldCollapse && !expanded ? resolvedItems.slice(0, COLLAPSE_THRESHOLD) : resolvedItems;

  return (
    <section className="border-b border-line bg-page py-7 sm:py-9 lg:py-10" aria-labelledby="categories-heading">
      <div className="pm-shell">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div className="min-w-0">
            <h2
              id="categories-heading"
              className="font-display text-[1.25rem] font-extrabold leading-tight tracking-[-0.015em] text-ink sm:text-[1.4375rem]"
            >
              Shop by category
            </h2>
            <p className="mt-0.5 text-caption text-muted">
              {resolvedItems.length} product {resolvedItems.length === 1 ? "range" : "ranges"} across boards, displays &amp; institutional furniture
            </p>
          </div>
          <Link
            href="/shop"
            className="-my-1.5 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-ink underline-offset-4 hover:underline lg:my-0 lg:min-h-0"
          >
            View all {resolvedTotal} products
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-3.5">
          {visible.map((category) => {
            const image = category.image;
            const showPhoto = Boolean(image && !failedIds[image]);
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-ink/40"
              >
                <div
                  className={classNames(
                    "relative h-[5.5rem] w-full overflow-hidden border-b border-line sm:h-[6.25rem]",
                    showPhoto ? "bg-white p-2" : "bg-subtle"
                  )}
                >
                  {showPhoto && image ? (
                    <Image
                      src={imageUrl(image, { fit: "scale", width: 640 })}
                      alt=""
                      fill
                      {...deliveryProps(image)}
                      sizes="(max-width: 639px) 46vw, (max-width: 1023px) 25vw, 20vw"
                      onError={() => setFailedIds((prev) => ({ ...prev, [image]: true }))}
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <CategoryGlyph />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
                  <h3
                    title={category.name}
                    className="line-clamp-2 font-display text-[0.8125rem] font-semibold leading-snug tracking-[-0.01em] text-ink underline-offset-4 group-hover:underline sm:text-[0.875rem]"
                  >
                    {category.name}
                  </h3>
                  <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 pt-0.5 text-[0.75rem] leading-snug tabular-nums">
                    <span className="font-medium text-ink">
                      {category.minPriceInr !== null ? `From ${formatInr(category.minPriceInr)}` : "On request"}
                    </span>
                    <span className="text-muted">
                      {category.productCount > 0
                        ? formatCount("models", category.productCount, "model")
                        : "Made to order"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {shouldCollapse && (
          <div className="mt-5 flex justify-center border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-4 text-caption font-medium text-ink transition-colors hover:border-ink/45 hover:bg-subtle"
            >
              {expanded ? "Show fewer categories" : `Show all ${resolvedItems.length} categories`}
              <ChevronDown className={classNames("size-4 transition-transform", expanded && "rotate-180")} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
