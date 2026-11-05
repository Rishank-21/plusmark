"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { classNames } from "@/lib/format";
import type { MediaAsset } from "@/types";

export type BrowseCollection = {
  slug: string;
  name: string;
  kind: string;
  blurb: string;
  count: number;
  media: MediaAsset | null;
  productName: string;
  categoryId?: string;
};

const KINDS = ["All", "Series", "Board type", "Use", "Format"] as const;
type Kind = (typeof KINDS)[number];

export function CollectionBrowser({ items }: { items: BrowseCollection[] }) {
  const [kind, setKind] = useState<Kind>("All");

  const counts = useMemo(() => {
    const map = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>;
    map.All = items.length;
    for (const item of items) {
      if (item.kind in map) map[item.kind as Kind] += 1;
    }
    return map;
  }, [items]);

  const visible = kind === "All" ? items : items.filter((item) => item.kind === kind);

  return (
    <>
      <div className="bg-canvas">
        <div className="pm-shell">
          <div className="flex flex-wrap gap-x-4 text-[0.8125rem] sm:flex-nowrap sm:gap-x-6 sm:overflow-x-auto sm:text-body-sm" role="group" aria-label="Filter collections by kind">
            {KINDS.map((option) => {
              const active = option === kind;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  aria-pressed={active}
                  className={classNames(
                    "relative -mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue",
                    active ? "border-navy font-medium text-ink" : "border-transparent text-graphite hover:text-ink"
                  )}
                >
                  {option}
                  <span className="tabular text-caption text-graphite">{counts[option]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="bg-canvas py-12 lg:py-16" aria-labelledby="collections-list-heading">
        <div className="pm-shell">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="collections-list-heading" className="font-sans font-normal text-h2 text-navy">
              {kind === "All" ? "All collections" : `${kind} collections`}
            </h2>
            <p aria-live="polite" className="tabular text-caption text-graphite">
              {visible.length} of {items.length}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {visible.map((collection) => (
              <li key={collection.slug}>
                <Link href={`/collections/${collection.slug}`} className="group flex h-full flex-col">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-surface">
                    {collection.media && (
                      <ProductImage
                        asset={collection.media}
                        name={collection.productName}
                        categoryId={collection.categoryId}
                        sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 23vw"
                        className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-graphite">
                    {collection.kind}
                  </p>
                  <h3 className="mt-1 text-[1.0625rem] font-medium leading-snug text-navy group-hover:text-blue-deep">
                    {collection.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-graphite">{collection.blurb}</p>
                  <span className="mt-3 flex items-center gap-2 text-caption text-graphite">
                    <span className="tabular">{collection.count} items</span>
                    <ArrowRight
                      className="size-3.5 text-blue transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
