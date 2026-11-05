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
  const cardTag =
    product.slug === "metallic-premium-white-board" || product.slug === "eco-premium-white-board"
      ? "Best seller"
      : product.slug === "metallic-premium-chalk-board"
        ? "Popular choice"
        : product.featured
          ? "Featured"
          : null;

  return (
    <article
      className="group relative flex h-full min-w-0 flex-col bg-transparent p-2.5 sm:p-3"
      onMouseEnter={() => secondary && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`${product.name} — view product`}
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
          <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-brand px-2 py-1 text-[0.625rem] font-semibold text-white shadow-sm md:left-2.5 md:top-2.5 md:px-3 md:py-1.5 md:text-caption">
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
            "absolute right-2.5 top-2.5 z-20 flex size-11 items-center justify-center rounded-full border transition-colors lg:size-9",
            saved
              ? "border-blue bg-blue text-white"
              : "border-hair bg-surface/95 text-graphite hover:border-blue hover:text-blue"
          )}
        >
          <Heart className={classNames("size-4", saved && "fill-current")} aria-hidden />
        </button>

        {onQuickView && (
          <QuickViewTrigger product={product} onClick={() => onQuickView(product)} />
        )}

        {madeToOrder && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center">
            <span className="rounded-full bg-canvas/90 px-3 py-1 text-caption font-medium uppercase tracking-[0.1em] text-graphite">
              Made to order
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 bg-transparent px-0.5 pb-0.5 pt-3.5">
        <h3 className="font-sans text-[0.9375rem] font-semibold leading-snug text-navy">
          <Link href={`/product/${product.slug}`} className="rounded-xs transition-colors hover:text-blue">
            <span className="line-clamp-3">{product.name}</span>
          </Link>
        </h3>
        <div className="mt-auto space-y-2.5 pt-3">
          <PriceRange size="lg" product={product} showDiscount />
          {quickAdd && (
            <button
              type="button"
              onClick={() => {
                const result = cart.add({ productId: product.slug, variantId: quickAdd.id });
                if (!result.ok) toast.push(result.message, "error");
                else cart.openDrawer();
              }}
              aria-label={`Add ${product.name}, ${variantLabel(quickAdd)}, to cart`}
              className="z-20 flex h-11 w-full min-w-0 items-center justify-center gap-1.5 rounded-md bg-blue px-3 text-caption font-semibold text-white shadow-sm transition-colors hover:bg-blue-deep lg:h-10"
            >
              <Plus className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="truncate lg:hidden">Add to cart</span>
              <span className="hidden truncate lg:inline">Add {product.name}</span>
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
        "absolute left-2.5 top-2.5 z-20 hidden size-9 items-center justify-center rounded-full border border-hair bg-surface/95 text-graphite shadow-card transition-[opacity,color,border-color] duration-200 md:flex",
        "hover:border-blue hover:text-blue",
        "md:inset-x-4 md:top-auto md:h-11 md:w-auto md:rounded-md md:bg-surface/95 md:gap-1.5 md:px-3 md:text-caption md:font-medium md:text-navy lg:h-10",
        madeToOrder ? "md:bottom-12" : "md:bottom-4",
        "md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100",
        "md:[@media(hover:none)]:pointer-events-auto md:[@media(hover:none)]:opacity-100"
      )}
    >
      <Eye className="size-4 md:size-3.5" aria-hidden />
      <span className="hidden md:inline">Quick view</span>
    </button>
  );
}
