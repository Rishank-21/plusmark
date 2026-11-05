"use client";

import { ArrowUpRight, Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuickView } from "@/components/commerce/QuickView";
import { PriceRange } from "@/components/ui/Price";
import { Breadcrumbs } from "@/components/ui/Nav";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { EmptyState, GridSkeleton, Notice, Skeleton } from "@/components/ui/States";
import { getProduct } from "@/lib/catalog";
import { useSession } from "@/state/session";
import { useWishlist } from "@/state/wishlist";
import { useState } from "react";
import type { Product } from "@/types";

const CARD = "rounded-[12px] border border-hair bg-surface shadow-card";

export function WishlistView({ inAccount = false }: { inAccount?: boolean }) {
  const wishlist = useWishlist();
  const session = useSession();
  const signedIn = Boolean(session.user);
  const [quick, setQuick] = useState<Product | null>(null);
  const products = wishlist.slugs.flatMap((slug) => {
    const product = getProduct(slug);
    return product ? [product] : [];
  });

  if (inAccount) {
    return (
      <div className="flex flex-col gap-4 [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[1.25rem] font-semibold leading-tight text-ink">Saved boards</h2>
            <p className="mt-1 text-caption leading-relaxed text-graphite">
              {signedIn
                ? "Saved to your account, so the same list opens on any device you sign in from."
                : "Saved in this browser until you sign in."}
            </p>
          </div>
          {wishlist.hydrated && <p className="tabular text-caption text-graphite">{products.length} saved</p>}
        </header>

        {!wishlist.hydrated ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">
            <span className="sr-only">Loading saved boards</span>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`${CARD} overflow-hidden p-4`}>
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-hair-strong bg-surface px-6 py-10 text-center sm:py-12">
            <span className="grid size-12 place-items-center rounded-full bg-brand-wash text-brand">
              <Heart className="size-5" aria-hidden />
            </span>
            <h3 className="text-h4 font-semibold text-ink">Nothing saved yet</h3>
            <p className="max-w-[38ch] text-body-sm leading-relaxed text-graphite">
              Use the heart on any product to keep it here. Saving a board does not reserve stock or send anything to Plusmark.
            </p>
            <ButtonLink href="/shop" size="sm" className="mt-1 h-11 rounded-lg px-4">Browse the catalogue</ButtonLink>
          </div>
        ) : (
          <>
            {!signedIn && (
              <div className="rounded-[12px] border border-brand/10 bg-brand-wash/70 px-4 py-3 text-caption leading-relaxed text-graphite">
                Saved in this browser only. Sign in and these boards move onto your account.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product.slug} className={`${CARD} group flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lift`}>
                  <LinkCardImage product={product} />
                  <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-3">
                    <LinkCardName product={product} />
                    <PriceRange product={product} className="mt-1" />
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-hair px-3 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-lg px-3 text-caption text-graphite hover:text-danger"
                      onClick={() => wishlist.toggle(product.slug)}
                      aria-label={`Remove ${product.name} from saved boards`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Remove
                    </Button>
                    <ButtonLink href={`/product/${product.slug}`} variant="secondary" size="sm" className="h-10 rounded-lg">
                      View product <ArrowUpRight className="size-4" aria-hidden />
                    </ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        <QuickView product={quick} open={quick !== null} onClose={() => setQuick(null)} />
      </div>
    );
  }

  return (
    <div className="pm-shell py-2xl lg:py-3xl [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hair pb-lg">
        <div>
          <h1 className="font-sans text-h1 text-navy">Saved boards</h1>
          <p className="mt-2 max-w-reading text-body-sm text-graphite">
            {signedIn
              ? "Saved to your account so you can compare sizes and series before you order."
              : "Saved in this browser so you can compare sizes and series before you order."}
          </p>
        </div>
        {wishlist.hydrated && <p className="tabular text-caption text-graphite">{products.length} saved</p>}
      </header>

      {!wishlist.hydrated ? (
        <GridSkeleton count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Use the heart on any product to keep it here. Saving a board does not reserve stock or send anything to Plusmark."
          action={{ label: "Browse the catalogue", href: "/shop" }}
          icon={<Heart className="size-6" aria-hidden />}
        />
      ) : (
        <>
          {!signedIn && (
            <Notice tone="info" title="Saved in this browser only">
              Sign in to keep this list on your account and open it on another device.{" "}
              <Link href="/login?next=/account/wishlist" className="underline decoration-hair-strong underline-offset-4 hover:text-ink">
                Sign in
              </Link>
            </Notice>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} onQuickView={setQuick} />
            ))}
          </div>
        </>
      )}
      <QuickView product={quick} open={quick !== null} onClose={() => setQuick(null)} />
    </div>
  );
}

function LinkCardImage({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset" aria-label={`${product.name} — view product`}>
      <ProductImage
        asset={product.media[0] ?? null}
        name={product.name}
        categoryId={product.categoryId}
        sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </Link>
  );
}

function LinkCardName({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="line-clamp-2 text-body-sm font-semibold text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
      {product.name}
    </Link>
  );
}
