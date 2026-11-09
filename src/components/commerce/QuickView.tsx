"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { SizeSelector } from "@/components/commerce/SizeSelector";
import { ColourSelector } from "@/components/commerce/ColourSelector";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { PriceRange } from "@/components/ui/Price";
import { productColours } from "@/lib/product-colours";
import { useCart } from "@/state/cart";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import { getSeries } from "@/lib/catalog";
import { classNames } from "@/lib/format";
import type { Product, Variant } from "@/types";

export function QuickView({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) {
  const [choice, setChoice] = useState<{ slug: string; variantId: string | null; colour: string | null; quantity: number } | null>(null);
  const cart = useCart();
  const toast = useToast();
  const wishlist = useWishlist();

  if (!product) return null;

  const colours = productColours(product.slug);
  const current =
    choice && choice.slug === product.slug
      ? choice
      : {
          slug: product.slug,
          variantId: product.variants.find((v) => v.available)?.id ?? null,
          colour: colours[0] ?? null,
          quantity: product.minimumOrderQuantity > 1 ? product.minimumOrderQuantity : 1
        };
  const selected: Variant | null = product.variants.find((v) => v.id === current.variantId) ?? null;
  const series = getSeries(product.seriesId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      description={series ? `${series.name} · ${series.surface}` : product.usage}
      size="lg"
      hideScrollbars
    >
      <div className="grid min-w-0 gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface">
          <ProductImage
            asset={selected?.imageOverride ?? product.media[0] ?? null}
            name={product.name}
            categoryId={product.categoryId}
            sizes="(max-width: 639px) 90vw, 30vw"
            className="aspect-square w-full object-contain sm:aspect-[4/5]"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <p className="line-clamp-2 text-body-sm leading-relaxed text-muted">{product.blurb}</p>

          <PriceRange product={product} variant={selected} size="lg" />

          <SizeSelector layout="select" showPrice={false} showHelper={false} product={product} selectedId={selected?.id ?? null} onSelect={(v) => setChoice({ ...current, variantId: v.id })} />

          <ColourSelector colours={colours} value={current.colour ?? ""} onChange={(colour) => setChoice({ ...current, colour })} />

          <div className="flex items-center gap-3">
            <QuantityStepper value={current.quantity} onChange={(q) => setChoice({ ...current, quantity: q })} min={product.minimumOrderQuantity} />
            <span className="text-caption text-muted">Order a single board or as many as you need.</span>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-line bg-surface pb-1 pt-3 sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:p-0">
            <Button
              className="w-full sm:flex-1"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                const result = cart.add({ productId: product.slug, variantId: selected.id, colour: current.colour, quantity: current.quantity });
                if (!result.ok) toast.push(result.message, "error");
                if (result.ok) {
                  onClose();
                  cart.openDrawer();
                }
              }}
            >
              {selected ? "Add to cart" : "Made to order"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const result = wishlist.toggle(product.slug);
                toast.push(result.message, result.saved ? "success" : "info");
              }}
              aria-pressed={wishlist.has(product.slug)}
            >
              {wishlist.has(product.slug) ? "Saved" : "Save"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-line pt-3 text-caption">
            <Link href={`/product/${product.slug}`} className={classNames("pm-link")} onClick={onClose}>
              Full specifications
            </Link>
            <Link href="/contact" className="pm-link" onClick={onClose}>
              Ask about a custom size
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
