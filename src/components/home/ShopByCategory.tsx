"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { classNames } from "@/lib/format";
import { cloudinaryLoader, imageUrl, isCloudinaryPublicId } from "@/lib/media";

function deliveryProps(publicId: string) {
  return isCloudinaryPublicId(publicId) ? { loader: cloudinaryLoader } : { unoptimized: true as const };
}

/** The catalogue's canonical order; the first six tiles stay above the fold. */
const PRIMARY_COUNT = 6;

export function ShopByCategory() {
  const [expanded, setExpanded] = useState(false);
  const primary = categories.slice(0, PRIMARY_COUNT);
  const rest = categories.slice(PRIMARY_COUNT);
  const tiles = expanded ? [...primary, ...rest] : primary;

  return (
    <section className="bg-surface py-10 lg:py-20" aria-labelledby="categories-heading">
      <div className="pm-shell">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 pb-4 sm:mb-7 sm:pb-5">
          <div className="flex flex-col gap-2">
            <h2 id="categories-heading" className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">Find the right board for your space</h2>
          </div>
          <Link href="/shop" className="group -my-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-medium text-primary hover:text-primary-strong lg:my-0 lg:min-h-0">
            View all {products.length} products
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-2 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-6 lg:gap-x-6 lg:gap-y-12">
          {tiles.map((category) => {
            const image = category.image;
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group flex min-w-0 flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  {image && (
                    <Image
                      src={imageUrl(image, { fit: "scale", width: 900 })}
                      alt=""
                      fill
                      {...deliveryProps(image)}
                      sizes="(max-width: 1023px) 46vw, 24vw"
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-col pt-3 sm:pt-4">
                  <div className="flex justify-center gap-3 pt-1.5 text-center">
                    <h3 className="font-display text-[1.125rem] font-bold leading-6 tracking-[-0.01em] text-ink transition-colors group-hover:text-primary-strong sm:text-[1.5rem] sm:leading-[1.15]">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-line pt-5 sm:mt-8 sm:gap-x-6 sm:gap-y-3 sm:pt-6">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line px-4 text-[0.8125rem] font-medium text-ink transition-colors hover:border-line-strong hover:text-primary-strong sm:min-h-11 sm:rounded-none sm:border-0 sm:px-0 sm:text-body-sm"
          >
            {expanded ? "Show fewer categories" : `More categories (${rest.length})`}
            <ChevronDown className={classNames("size-4 transition-transform", expanded && "rotate-180")} aria-hidden />
          </button>
          <Link
            href="/collections/ceramic-boards"
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line px-4 text-[0.8125rem] font-medium text-primary transition-colors hover:border-line-strong hover:text-primary-strong sm:min-h-11 sm:rounded-none sm:border-0 sm:px-0 sm:text-body-sm"
          >
            Ceramic Boards
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
