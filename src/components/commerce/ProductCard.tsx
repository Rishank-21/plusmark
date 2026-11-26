"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, Plus } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/state/cart";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import { classNames, productCardMeta, variantLabel } from "@/lib/format";
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
  const cardMeta = productCardMeta(product);

  const addToCart = () => {
    if (!quickAdd) return;
    const result = cart.add({ productId: product.slug, variantId: quickAdd.id });
    if (!result.ok) toast.push(result.message, "error");
    else cart.openDrawer();
  };

  return (
    <article
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-line-strong"
      onMouseEnter={() => secondary && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden border-b border-line bg-surface p-2.5 sm:p-3">
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

        <button
          type="button"
          onClick={() => {
            const result = wishlist.toggle(product.slug);
            toast.push(result.message, result.saved ? "success" : "info");
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={classNames(
            "absolute right-2.5 top-2.5 z-20 flex size-11 items-center justify-center rounded-md border transition-colors sm:right-3 sm:top-3 sm:size-9",
            saved
              ? "border-primary bg-primary text-onprimary"
              : "border-line bg-surface text-muted hover:border-ink/40 hover:text-ink"
          )}
        >
          <Heart className={classNames("size-4", saved && "fill-current")} aria-hidden />
        </button>

        {onQuickView && (
          <QuickViewTrigger product={product} onClick={() => onQuickView(product)} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
        <h3 className="font-display text-[0.875rem] font-semibold leading-snug text-ink sm:text-[0.9375rem]">
          <Link href={`/product/${product.slug}`} className="rounded-xs underline-offset-4 hover:underline">
            <span className="line-clamp-2">{product.name}</span>
          </Link>
        </h3>
        {cardMeta && <p className="text-caption leading-snug text-muted">{cardMeta}</p>}
        <div className="mt-auto space-y-2.5 pt-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <PriceRange size="lg" product={product} />
            {madeToOrder && <span className="text-caption text-muted">Made to order</span>}
          </div>
          {product.enquiryOnly ? (
            <Link
              href={`/product/${product.slug}`}
              className="z-20 flex h-10 w-full min-w-0 items-center justify-center rounded-md border border-line-strong bg-surface px-3 text-caption font-semibold text-ink transition-colors hover:border-ink/45 hover:bg-subtle sm:h-10"
            >
              Request quote
            </Link>
          ) : multiSize ? (
            <Link
              href={`/product/${product.slug}`}
              className="z-20 flex h-10 w-full min-w-0 items-center justify-center rounded-md border border-line-strong bg-surface px-3 text-caption font-semibold text-ink transition-colors hover:border-ink/45 hover:bg-subtle"
            >
              Select size
            </Link>
          ) : (
            quickAdd && (
              <button
                type="button"
                onClick={addToCart}
                aria-label={`Add to cart: ${product.name}, ${variantLabel(quickAdd)}`}
                className="z-20 flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-caption font-semibold text-onprimary transition-colors hover:bg-primary-strong"
              >
                <Plus className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="truncate">Add to cart</span>
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export function QuickViewTrigger({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Quick view of ${product.name}`}
      className={classNames(
        "absolute inset-x-3 bottom-3 z-20 hidden h-9 items-center justify-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-caption font-medium text-ink transition-opacity duration-150 md:flex",
        "hover:border-ink/45 hover:bg-subtle",
        "md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100",
        "md:[@media(hover:none)]:pointer-events-auto md:[@media(hover:none)]:opacity-100"
      )}
    >
      <Eye className="size-3.5" aria-hidden />
      <span>Quick view</span>
    </button>
  );
}
