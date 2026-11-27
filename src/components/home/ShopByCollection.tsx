import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { products, seriesList } from "@/lib/catalog";
import { buildCollectionSeriesCards, type CollectionSeriesCard } from "@/lib/collection-cards";
import { collections } from "@/components/static/collection-data";
import { classNames, formatCount, formatInr } from "@/lib/format";

export function ShopByCollection({ items }: { items?: CollectionSeriesCard[] }) {
  const cards = items ?? buildCollectionSeriesCards(seriesList, products);

  return (
    <section className="border-b border-line bg-surface py-8 sm:py-10 lg:py-12" aria-labelledby="collections-heading">
      <div className="pm-shell">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <h2
              id="collections-heading"
              className="font-display text-[1.25rem] font-extrabold leading-tight tracking-[-0.015em] text-ink sm:text-[1.4375rem]"
            >
              Shop by Collection
            </h2>
            <p className="mt-0.5 text-caption text-muted">
              Compare all 4 Plusmark series by writing surface, frame strength, and size range
            </p>
          </div>
          <Link
            href="/collections"
            className="-my-1.5 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-medium text-ink underline-offset-4 hover:underline lg:my-0 lg:min-h-0"
          >
            View all {collections.length} collections
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => (
            <Link
              key={card.slug}
              href={`/collections/${card.slug}`}
              className={classNames(
                "group flex min-w-0 flex-col overflow-hidden rounded-md border bg-surface transition-colors hover:border-ink/45",
                card.anchorTier ? "border-line-strong border-t-2 border-t-ink" : "border-line"
              )}
            >
              <div className="relative h-32 w-full overflow-hidden border-b border-line bg-white p-3 sm:h-40">
                <ProductImage
                  asset={card.image}
                  name={card.imageProductName}
                  categoryId={card.imageCategoryId}
                  sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 23vw"
                  className="size-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted">
                  {card.fitRole}
                </p>

                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-[1rem] font-bold leading-snug tracking-[-0.01em] text-ink underline-offset-4 group-hover:underline sm:text-[1.0625rem]">
                    {card.name}
                  </h3>
                </div>

                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 tabular-nums">
                  <span className="font-display text-[0.9375rem] font-bold text-ink">
                    {card.minPriceInr !== null ? `From ${formatInr(card.minPriceInr)}` : "Price on request"}
                  </span>
                  <span className="text-caption text-muted">
                    {formatCount("models", card.productCount, "model")}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 border-t border-line pt-2.5 text-[0.75rem] leading-snug">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="shrink-0 text-muted">Surface</dt>
                    <dd className="text-right font-medium text-ink">{card.surfaceSummary}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="shrink-0 text-muted">Frame</dt>
                    <dd className="text-right font-medium text-ink">{card.frameSummary}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="shrink-0 text-muted">Sizes</dt>
                    <dd className="text-right font-medium text-ink tabular-nums">{card.sizeSummary}</dd>
                  </div>
                </dl>

                <div className="mt-auto pt-3">
                  <p className="pb-2.5 text-[0.75rem] leading-snug text-muted">
                    Includes: <span className="text-ink/85">{card.typesSummary}</span>
                  </p>
                  <span
                    className={classNames(
                      "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 text-caption font-semibold transition-colors",
                      card.anchorTier
                        ? "bg-primary text-onprimary group-hover:bg-primary-strong"
                        : "border border-line-strong bg-page text-ink group-hover:border-ink/45 group-hover:bg-subtle"
                    )}
                  >
                    <span>Shop {card.name}</span>
                    <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
