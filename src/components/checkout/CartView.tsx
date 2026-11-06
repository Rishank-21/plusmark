"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Info, Trash2 } from "lucide-react";
import { CouponControl } from "@/components/checkout/CouponControl";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { allLinesPriced, checkCoupon, firstUnpricedLine } from "@/components/checkout/cart-support";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { Breadcrumbs } from "@/components/ui/Nav";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { getSeries } from "@/lib/catalog";
import { useLiveCoupons } from "@/components/checkout/coupon-store";
import { computeTotals, gstBreakdownByRate } from "@/lib/pricing";
import { classNames, formatInr, variantLabel } from "@/lib/format";
import { useCart } from "@/state/cart";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import type { CartLineView } from "@/types";

/**
 * Full cart page. Totals are recomputed here with the coupon applied, because
 * the cart store keeps the code only and prices lines without discounts.
 */
export function CartView() {
  const cart = useCart();
  const wishlist = useWishlist();
  const session = useSession();
  const toast = useToast();
  const couponFeed = useLiveCoupons();

  const coupon = useMemo(() => {
    if (!cart.couponCode) return null;
    const check = checkCoupon(cart.couponCode);
    return check.kind === "valid" ? check.coupon : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.couponCode, couponFeed.coupons]);

  const totals = useMemo(
    () => computeTotals({ lines: cart.views, coupon, shippingMethod: cart.shippingMethod }),
    [cart.views, coupon, cart.shippingMethod]
  );

  const gstRows = useMemo(
    () => gstBreakdownByRate({ lines: cart.views, discountInr: totals.discountInr }),
    [cart.views, totals.discountInr]
  );

  const priced = allLinesPriced(cart.views);
  const blockedLine = firstUnpricedLine(cart.views);

  if (!cart.hydrated) return <CartSkeleton />;

  return (
    <div className="pm-shell py-2xl lg:py-3xl">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <header className="mt-md flex flex-wrap items-end justify-between gap-4 border-b border-hair pb-lg">
        <div className="flex flex-col gap-2">
          <p className="pm-eyebrow">Step 1 of 3 · Review</p>
          <h1 className="font-display text-display-sm">Your cart</h1>
          <p className="max-w-reading text-body-sm text-graphite">
            Sizes and quantities are as you left them. Nothing here reserves stock — Plusmark confirms availability and
            the final figure on the invoice.
          </p>
        </div>
        <p className="tabular text-caption text-graphite">
          {cart.count} {cart.count === 1 ? "unit" : "units"} across {cart.views.length}{" "}
          {cart.views.length === 1 ? "line" : "lines"}
        </p>
      </header>

      {cart.views.length === 0 ? (
        <div className="mt-2xl">
          <EmptyState
            title="Your cart is empty"
            body="Boards are made to order in Ahmedabad and dispatched across India. Choose a series and size in the catalogue, or ask Plusmark if the size you need is not listed."
            action={{ label: "Browse the catalogue", href: "/shop" }}
            icon={<Info className="size-6" aria-hidden />}
          />
          <div className="mt-md flex flex-wrap gap-2">
            <ButtonLink href="/contact" variant="secondary" size="sm">
              Ask Plusmark about a custom size
            </ButtonLink>
            {wishlist.slugs.length > 0 && (
              <ButtonLink href="/account/wishlist" variant="quiet" size="sm">
                {wishlist.slugs.length} item{wishlist.slugs.length === 1 ? "" : "s"} saved for later
              </ButtonLink>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2xl grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="flex flex-col gap-lg">
            {!priced && blockedLine && (
              <div role="alert" className="flex items-start gap-3 rounded-sm border border-warning/30 bg-warning-wash p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm font-medium text-ink">Checkout is blocked while a price is missing</p>
                  <p className="text-caption leading-relaxed text-graphite">
                    {blockedLine.product.name} —{" "}
                    {blockedLine.variant ? variantLabel(blockedLine.variant) : "size unavailable"} has no price in
                    this prototype, so a total cannot be built. Ask Plusmark for a firm figure, or remove the
                    line.
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <ButtonLink href={`/product/${blockedLine.product.slug}`} size="sm" variant="secondary">
                      Change the size
                    </ButtonLink>
                    <ButtonLink href="/contact" size="sm" variant="quiet">
                      Ask about this size
                    </ButtonLink>
                  </div>
                </div>
              </div>
            )}

            <ul className="flex flex-col divide-y divide-hair border-y border-hair">
              {cart.views.map((line) => (
                <CartRow
                  key={line.id}
                  line={line}
                  onQuantity={(quantity) => cart.setQuantity(line.id, quantity)}
                  onRemove={() => {
                    cart.remove(line.id);
                    toast.push(`${line.product.name} removed from your cart.`, "info");
                  }}
                  onSaveForLater={() => {
                    if (!wishlist.has(line.product.slug)) wishlist.toggle(line.product.slug);
                    cart.remove(line.id);
                    toast.push(`${line.product.name} moved to your saved list.`, "info");
                  }}
                />
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <ButtonLink href="/shop" variant="quiet" size="sm">
                Continue shopping
              </ButtonLink>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  cart.clear();
                  toast.push("Cart cleared.", "info");
                }}
              >
                Clear the cart
              </Button>
            </div>

            <section aria-labelledby="cart-coupon" className="flex flex-col gap-3 border-t border-hair pt-lg">
              <h2 id="cart-coupon" className="font-display text-h4">
                Discount code
              </h2>
              <CouponControl
                appliedCode={cart.couponCode}
                totals={totals}
                onApply={(code) => {
                  if (couponFeed.state === "error") {
                    toast.push("Coupons could not be checked right now. Try again shortly.", "error");
                    return;
                  }
                  const result = cart.applyCoupon(code, couponFeed.coupons);
                  toast.push(result.message, result.ok ? "success" : "error");
                }}
                onClear={() => {
                  cart.clearCoupon();
                  toast.push("Coupon removed.", "info");
                }}
              />
            </section>
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <OrderSummary
              lines={cart.views}
              totals={totals}
              shippingMethod={cart.shippingMethod}
              coupon={coupon}
              gstRows={gstRows}
            >
              <ButtonLink href="/checkout" fullWidth disabled={!priced}>
                Continue to checkout
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <p className="text-caption leading-relaxed text-graphite">
                {priced
                  ? "You can check out as a guest. Signing in only lets Plusmark attach the order to a history you can revisit."
                  : "Checkout stays unavailable until every line carries a price."}
              </p>
              {!session.account && priced && (
                <ButtonLink href="/login?next=/checkout" variant="secondary" fullWidth>
                  Sign in first
                </ButtonLink>
              )}
              <p className="text-caption leading-relaxed text-graphite">
                Freight depends on the board size and your pincode, so the charge is confirmed when the invoice is raised.
              </p>
              <ButtonLink href="/policies/shipping" variant="quiet" size="sm" fullWidth className="justify-start">
                Read the shipping policy
              </ButtonLink>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}

function CartRow({
  line,
  onQuantity,
  onRemove,
  onSaveForLater
}: {
  line: CartLineView;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}) {
  const series = getSeries(line.product.seriesId);
  const unit = line.variant?.priceInr ?? null;
  const sizeLabel = line.variant ? variantLabel(line.variant) : "Size no longer offered";
  const dimension = line.variant?.size.widthCm
    ? `${line.variant.size.widthCm} × ${line.variant.size.heightCm} cm`
    : null;

  return (
    <li className={classNames("flex gap-4 py-lg", line.problem && "bg-warning-wash/40")}>
      <Link
        href={`/product/${line.product.slug}`}
        className="size-24 shrink-0 overflow-hidden rounded-xs border border-hair bg-surface"
        aria-label={`${line.product.name} — open product page`}
      >
        <ProductImage
          asset={line.product.media[0] ?? line.variant?.imageOverride ?? null}
          name={line.product.name}
          categoryId={line.product.categoryId}
          preset="thumb"
          sizes="96px"
          className="size-full object-contain"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-display text-h4 leading-snug">
              <Link href={`/product/${line.product.slug}`} className="rounded-xs transition-colors hover:text-navy-deep">
                {line.product.name}
              </Link>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {series && <Badge tone="navy">{series.name}</Badge>}
              <p className="text-caption text-graphite">{sizeLabel}</p>
              {dimension && <p className="tabular text-caption text-graphite-light">{dimension}</p>}
            </div>
          </div>
          <p className="tabular shrink-0 text-body-sm font-medium text-ink">
            {line.lineTotalInr === null ? "Price on request" : formatInr(line.lineTotalInr)}
          </p>
        </div>

        <p className="tabular text-caption text-graphite-light">SKU {line.variant?.sku ?? "—"}</p>

        {line.problem && (
          <p role="alert" className="text-caption font-medium text-danger">
            {line.problem === "unavailable"
              ? "This size is no longer available for order. Pick another size on the product page."
              : "This size has been removed from the catalogue. The line is excluded from the totals."}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <QuantityStepper
              value={line.quantity}
              onChange={onQuantity}
              min={line.product.minimumOrderQuantity}
              disabled={Boolean(line.problem)}
              label={`Quantity of ${line.product.name}`}
            />
            <p className="tabular text-caption text-graphite">
              {unit === null ? "Unit price on request" : `${formatInr(unit)} each`}
              {unit !== null && <DemoBadge label="Demo" className="ml-1.5 align-middle" />}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSaveForLater}
              className="inline-flex h-10 items-center gap-1.5 rounded-xs px-2.5 text-caption text-graphite transition-colors hover:bg-sand hover:text-ink lg:h-9"
            >
              <Heart className="size-3.5" aria-hidden />
              Save for later
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${line.product.name} — ${sizeLabel} from cart`}
              className="inline-flex h-10 items-center gap-1.5 rounded-xs px-2.5 text-caption text-graphite transition-colors hover:bg-sand hover:text-danger lg:h-9"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div className="pm-shell py-2xl lg:py-3xl" role="status" aria-live="polite">
      <span className="sr-only">Loading your cart</span>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-md h-12 w-64" />
      <div className="mt-2xl grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="flex flex-col divide-y divide-hair border-y border-hair">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4 py-lg">
              <Skeleton className="size-24 shrink-0" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="mt-2 h-11 w-32" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
