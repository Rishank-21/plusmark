"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, Plus } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/state/cart";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import { classNames, variantLabel } from "@/lib/format";
import type { Product } from "@/types";

const CARD_SIZES = "(max-width: 639px) 46vw, (max-width: 1439px) 31vw, 430px";

export function ProductCard({
  product,
  priority = false,
  onQuickView
}: {
  product: Product;
  priority?: boolean;
  onQuickView?: (product: Product) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const wishlist = useWishlist();
  const cart = useCart();
  const toast = useToast();
  const primary = product.media[0] ?? null;
  const secondary = product.media[1] ?? null;
  const quickAdd = product.variants.find((v) => v.available) ?? null;
  const saved = wishlist.hydrated && wishlist.has(product.slug);
  const madeToOrder = !product.variants.some((v) => v.available);
  const multiSize = product.variants.length > 1;
  const cardTag = product.featured ? "Featured" : null;

  const addToCart = () => {
    if (!quickAdd) return;
    const result = cart.add({ productId: product.slug, variantId: quickAdd.id });
    if (!result.ok) toast.push(result.message, "error");
    else cart.openDrawer();
  };

  return (
    <article
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow duration-200 hover:shadow-lift"
      onMouseEnter={() => secondary && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-surface p-2.5 sm:p-3">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-10"
          tabIndex={-1}
          aria-hidden
        />
        <ProductImage
          asset={hovered && secondary ? secondary : primary}
          name={product.name}
          categoryId={product.categoryId}
          sizes={CARD_SIZES}
          priority={priority}
          className="h-full w-full object-contain"
        />

        {cardTag && (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-primary-soft px-2.5 py-1 text-[0.625rem] font-semibold text-primary-strong md:text-caption">
            {cardTag}
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            const result = wishlist.toggle(product.slug);
            toast.push(result.message, result.saved ? "success" : "info");
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={classNames(
            "absolute right-2.5 top-2.5 z-20 flex size-11 items-center justify-center rounded-full border transition-colors sm:right-3 sm:top-3 sm:size-9",
            saved
              ? "border-primary bg-primary text-onprimary"
              : "border-line bg-surface/95 text-muted hover:border-primary/50 hover:text-primary"
          )}
        >
          <Heart className={classNames("size-4", saved && "fill-current")} aria-hidden />
        </button>

        {onQuickView && (
          <QuickViewTrigger product={product} onClick={() => onQuickView(product)} />
        )}

        {madeToOrder && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
            <span className="rounded-full border border-line bg-surface/95 px-3 py-1 text-[0.6875rem] font-medium text-muted">
              Made to order
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5 sm:gap-1.5 sm:px-4 sm:pb-4 sm:pt-3">
        <h3 className="font-display text-[0.875rem] font-semibold leading-snug text-ink sm:text-[0.9375rem]">
          <Link href={`/product/${product.slug}`} className="rounded-xs transition-colors hover:text-primary">
            <span className="line-clamp-2 md:line-clamp-3">{product.name}</span>
          </Link>
        </h3>
        <div className="mt-auto space-y-2 pt-2 sm:space-y-2.5 sm:pt-3">
          <PriceRange size="lg" product={product} />
          {multiSize ? (
            <Link
              href={`/product/${product.slug}`}
              className="z-20 flex h-11 w-full min-w-0 items-center justify-center rounded-md border border-primary/30 bg-primary-soft px-3 text-caption font-semibold text-primary-strong transition-colors hover:border-primary/60 sm:hidden"
            >
              Select size
            </Link>
          ) : (
            quickAdd && (
              <button
                type="button"
                onClick={addToCart}
                aria-label={`Add to cart: ${product.name}, ${variantLabel(quickAdd)}`}
                className="z-20 flex h-11 w-full min-w-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-caption font-semibold text-onprimary transition-colors hover:bg-primary-strong sm:hidden"
              >
                <Plus className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="truncate">Add to cart</span>
              </button>
            )
          )}
          {quickAdd && (
            <button
              type="button"
              onClick={addToCart}
              aria-label={`Add to cart: ${product.name}, ${variantLabel(quickAdd)}`}
              className="z-20 hidden h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-caption font-semibold text-onprimary transition-colors hover:bg-primary-strong sm:flex"
            >
              <Plus className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="truncate">Add to cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function QuickViewTrigger({ product, onClick }: { product: Product; onClick: () => void }) {
  const madeToOrder = !product.variants.some((v) => v.available);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Quick view of ${product.name}`}
      className={classNames(
        "absolute left-3 top-3 z-20 hidden size-9 items-center justify-center rounded-full border border-line bg-surface/95 text-muted shadow-card transition-[opacity,color,border-color] duration-200 md:flex",
        "hover:border-primary/50 hover:text-primary",
        "md:inset-x-3 md:top-auto md:h-10 md:w-auto md:rounded-md md:bg-surface/95 md:gap-1.5 md:px-3 md:text-caption md:font-medium md:text-ink",
        madeToOrder ? "md:bottom-14" : "md:bottom-3",
        "md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100",
        "md:[@media(hover:none)]:pointer-events-auto md:[@media(hover:none)]:opacity-100"
      )}
    >
      <Eye className="size-4 md:size-3.5" aria-hidden />
      <span className="hidden md:inline">Quick view</span>
    </button>
  );
}
