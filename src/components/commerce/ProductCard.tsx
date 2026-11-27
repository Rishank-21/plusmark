"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { getSeries } from "@/lib/catalog";
import { classNames, variantLabel } from "@/lib/format";
import { GOOGLE_REVIEW_SUMMARY } from "@/lib/reviews";
import { useCart } from "@/state/cart";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import type { Product } from "@/types";

const CARD_SIZES = "(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 24vw";

function compactSizeChip(label: string): string {
  return label
    .replace(/\s*x\s*/gi, "×")
    .replace(/\s*ft$/i, "")
    .trim();
}

function cardSeriesEyebrow(product: Product): string {
  const seriesName = getSeries(product.seriesId)?.name ?? null;
  const trait =
    product.boardType === "ceramic"
      ? "Ceramic Steel"
      : product.magnetic
        ? "Magnetic"
        : product.doubleSided
          ? "Double-Sided"
          : null;

  if (seriesName && trait) return `${seriesName} · ${trait}`;
  if (seriesName) return seriesName;
  if (trait) return trait;
  if (product.surface) {
    const clean = product.surface.split("(")[0].trim();
    if (clean.length <= 28) return clean;
  }
  return product.enquiryOnly ? "Made to order" : "Standard spec";
}

export function ProductCard({
  product,
  priority = false
}: {
  product: Product;
  priority?: boolean;
  onQuickView?: (product: Product) => void;
}) {
  const router = useRouter();
  const wishlist = useWishlist();
  const cart = useCart();
  const toast = useToast();

  const primary = product.media[0] ?? null;
  const saved = wishlist.hydrated && wishlist.has(product.slug);
  const madeToOrder = !product.variants.some((v) => v.available);

  const singleVariants = product.variants.filter((v) => (v.packQty ?? 1) === 1);
  const dimensionalVariants = singleVariants.filter((v) => /\d/.test(v.size.label));
  const quickSizes = dimensionalVariants.slice(0, 3);
  const overflowSizeCount = Math.max(0, dimensionalVariants.length - quickSizes.length);

  const defaultVariant =
    quickSizes.find((v) => v.available) ??
    singleVariants.find((v) => v.available) ??
    product.variants.find((v) => v.available) ??
    null;

  const [chosenVariantId, setChosenVariantId] = useState<string | null>(defaultVariant?.id ?? null);
  const activeVariant =
    product.variants.find((v) => v.id === chosenVariantId && v.available) ?? defaultVariant;

  const eyebrow = cardSeriesEyebrow(product);

  const handleAction = (mode: "drawer" | "checkout") => {
    if (!activeVariant) return;
    const result = cart.add({ productId: product.slug, variantId: activeVariant.id });
    if (!result.ok) {
      toast.push(result.message, "error");
      return;
    }
    if (mode === "checkout") {
      router.push("/checkout");
      return;
    }
    toast.push(result.message, "success");
  };

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-ink/40">
      <div
        className={classNames(
          "relative aspect-[4/3] overflow-hidden border-b border-line",
          primary ? "bg-white p-3 sm:p-4" : "bg-subtle"
        )}
      >
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-10"
          tabIndex={-1}
          aria-hidden
        />
        <ProductImage
          asset={primary}
          name={product.name}
          categoryId={product.categoryId}
          sizes={CARD_SIZES}
          priority={priority}
          className="h-full w-full object-contain"
        />

        <button
          type="button"
          onClick={() => {
            const result = wishlist.toggle(product.slug);
            toast.push(result.message, result.saved ? "success" : "info");
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={classNames(
            "absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-full border-0 bg-transparent transition-colors hover:bg-subtle sm:right-2.5 sm:top-2.5",
            saved ? "text-danger" : "text-muted hover:text-ink"
          )}
        >
          <Heart className={classNames("size-4", saved && "fill-current")} aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3.5 pt-2.5 sm:px-3.5 sm:pb-4 sm:pt-3">
        <div className="min-w-0">
          <p className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted">
            {eyebrow}
          </p>
          <h3 className="mt-0.5 font-display text-[0.875rem] font-bold leading-snug text-ink sm:text-[0.9375rem]">
            <Link
              href={`/product/${product.slug}`}
              className="rounded-xs underline-offset-4 hover:underline"
              title={product.name}
            >
              <span className="line-clamp-2">{product.name}</span>
            </Link>
          </h3>
        </div>

        <div
          className="flex items-center gap-1.5 text-[0.75rem] leading-none"
          aria-label={`Rated ${GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)} out of 5 across ${GOOGLE_REVIEW_SUMMARY.count} Google reviews`}
        >
          <span className="inline-flex items-center gap-0.5 text-rating" aria-hidden>
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="size-3 fill-current" strokeWidth={0} />
            ))}
          </span>
          <span className="font-semibold tabular-nums text-ink">{GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)}</span>
          <span className="tabular-nums text-muted">({GOOGLE_REVIEW_SUMMARY.count})</span>
        </div>

        {quickSizes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label={`Sizes for ${product.name}`}>
            {quickSizes.map((variant) => {
              const selected = activeVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!variant.available}
                  aria-pressed={selected}
                  onClick={() => setChosenVariantId(variant.id)}
                  className={classNames(
                    "rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium leading-4 tabular-nums transition-colors",
                    selected
                      ? "border-primary bg-primary text-onprimary"
                      : "border-line-strong bg-page text-ink hover:border-ink/45",
                    !variant.available && "cursor-not-allowed opacity-45"
                  )}
                >
                  {compactSizeChip(variant.size.label)} ft
                </button>
              );
            })}
            {overflowSizeCount > 0 && (
              <Link
                href={`/product/${product.slug}`}
                className="rounded-full border border-line bg-subtle px-2 py-0.5 text-[0.6875rem] font-medium leading-4 tabular-nums text-muted transition-colors hover:border-ink/35 hover:text-ink"
                aria-label={`${overflowSizeCount} more sizes for ${product.name}`}
              >
                +{overflowSizeCount}
              </Link>
            )}
          </div>
        ) : (
          <p className="text-caption leading-snug text-muted">
            {product.enquiryOnly ? "Built to dimension on request" : "Standard factory dimension"}
          </p>
        )}

        <div className="mt-auto space-y-2.5 pt-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <PriceRange size="lg" product={product} variant={activeVariant} />
            {madeToOrder && <span className="text-caption text-muted">Made to order</span>}
          </div>

          <div className="flex items-center gap-2">
            {product.enquiryOnly || !activeVariant ? (
              <Link
                href={`/product/${product.slug}`}
                className="z-20 flex h-9 flex-1 min-w-0 items-center justify-center rounded-full border border-line-strong bg-surface px-3 text-caption font-semibold text-ink transition-colors hover:border-ink/45 hover:bg-subtle sm:h-10"
              >
                {product.enquiryOnly ? "Request quote" : "Select size"}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleAction("checkout")}
                  aria-label={`Buy now: ${product.name}, ${variantLabel(activeVariant)}`}
                  className="z-20 flex h-9 flex-1 min-w-0 items-center justify-center rounded-full bg-primary px-3 text-caption font-semibold text-onprimary transition-colors hover:bg-primary-strong sm:h-10"
                >
                  <span className="truncate">Buy Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("drawer")}
                  aria-label={`Add to cart: ${product.name}, ${variantLabel(activeVariant)}`}
                  title="Add to cart"
                  className="z-20 flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-page text-ink transition-colors hover:border-ink/45 hover:bg-subtle sm:size-10"
                >
                  <ShoppingCart className="size-4" aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
