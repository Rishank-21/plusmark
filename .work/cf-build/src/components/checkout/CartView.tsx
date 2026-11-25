"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Heart, Info, Trash2 } from "lucide-react";
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

  const [couponOpen, setCouponOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (media.matches) setCouponOpen(true);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!cart.hydrated) return <CartSkeleton />;

  return (
    <div className="pm-shell pb-[calc(var(--pm-nav-h)+env(safe-area-inset-bottom)+4.5rem)] pt-5 lg:py-20">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3 lg:mt-xl lg:gap-4">
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <h1 className="font-display text-[1.75rem] font-extrabold leading-[1.2] tracking-[-0.015em] text-ink lg:text-h1">
            Your cart
          </h1>
          <p className="max-w-reading text-body-sm text-muted">
            Sizes and quantities are as you left them. Nothing here reserves stock — Plusmark confirms availability and
            the final figure on the invoice.
          </p>
        </div>
        <p className="tabular text-caption text-muted">
          {cart.count} {cart.count === 1 ? "unit" : "units"} across {cart.views.length}{" "}
          {cart.views.length === 1 ? "line" : "lines"}
        </p>
      </header>

      {cart.views.length === 0 ? (
        <div className="mt-8 lg:mt-2xl">
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
        <div className="mt-6 grid items-start gap-6 lg:mt-2xl lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-xl">
          <div className="flex flex-col gap-lg">
            {!priced && blockedLine && (
              <div role="alert" className="flex items-start gap-3 rounded-sm border border-warning/30 bg-warning-wash p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm font-medium text-ink">Checkout is blocked while a price is missing</p>
                  <p className="text-caption leading-relaxed text-muted">
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

            <ul className="flex flex-col gap-3">
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
              <ButtonLink href="/shop" variant="quiet" size="sm" className="text-[0.875rem] lg:text-caption">
                Continue shopping
              </ButtonLink>
              <Button
                variant="quiet"
                size="sm"
                className="text-[0.875rem] lg:text-caption"
                onClick={() => {
                  cart.clear();
                  toast.push("Cart cleared.", "info");
                }}
              >
                Clear the cart
              </Button>
            </div>

            <section aria-labelledby="cart-coupon" className="pt-2">
              <button
                type="button"
                onClick={() => setCouponOpen((open) => !open)}
                aria-expanded={couponOpen || Boolean(cart.couponCode)}
                aria-controls="cart-coupon-body"
                className="flex min-h-12 w-full items-center justify-between gap-3 text-left lg:pointer-events-none lg:min-h-0"
              >
                <h2 id="cart-coupon" className="font-display text-[1.0625rem] font-bold text-ink lg:text-h4">
                  Discount code
                </h2>
                <ChevronDown
                  className={classNames("size-5 shrink-0 text-muted transition-transform lg:hidden", (couponOpen || Boolean(cart.couponCode)) && "rotate-180")}
                  aria-hidden
                />
              </button>
              {(couponOpen || Boolean(cart.couponCode)) && (
                <div id="cart-coupon-body" className="pt-3">
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
                </div>
              )}
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
              <p className="text-caption leading-relaxed text-muted">
                {priced
                  ? "You can check out as a guest. Signing in only lets Plusmark attach the order to a history you can revisit."
                  : "Checkout stays unavailable until every line carries a price."}
              </p>
              {!session.account && priced && (
                <ButtonLink href="/login?next=/checkout" variant="secondary" fullWidth>
                  Sign in first
                </ButtonLink>
              )}
              <p className="text-caption leading-relaxed text-muted">
                Freight depends on the board size and your pincode, so the charge is confirmed when the invoice is raised.
              </p>
              <ButtonLink href="/policies/shipping" variant="quiet" size="sm" fullWidth className="justify-start">
                Read the shipping policy
              </ButtonLink>
            </OrderSummary>
          </div>
        </div>
      )}

      {cart.views.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(var(--pm-nav-h)+env(safe-area-inset-bottom))] z-[210] border-t border-line bg-surface px-4 pb-2 pt-2 shadow-card lg:hidden">
          <div className="mx-auto flex max-w-page items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.75rem] leading-4 text-muted">Total</p>
              <p className="truncate text-[1.125rem] font-semibold leading-6 text-ink">
                {totals.totalInr !== null
                  ? formatInr(totals.totalInr)
                  : blockedLine
                    ? "Price on request"
                    : totals.shippingInr === null && !totals.pricingIncomplete
                      ? "Confirmed with freight"
                      : "To be confirmed"}
              </p>
            </div>
            <ButtonLink href="/checkout" disabled={!priced} className="h-11 shrink-0 px-6">
              Checkout
            </ButtonLink>
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
  const sizeLabel = (line.variant ? variantLabel(line.variant) : "Size no longer offered") + (line.colour ? ` · ${line.colour}` : "");
  const dimension = line.variant?.size.widthCm
    ? `${line.variant.size.widthCm} × ${line.variant.size.heightCm} cm`
    : null;

  return (
    <li className={classNames("flex gap-3 rounded-lg border border-line bg-surface p-3 shadow-card lg:gap-4 lg:rounded-xl lg:p-4", line.problem && "border-warning/40 bg-warning-wash/40")}>
      <Link
        href={`/product/${line.product.slug}`}
        className="size-[4.5rem] shrink-0 overflow-hidden rounded-md border border-line bg-surface lg:size-24 lg:rounded-lg"
        aria-label={`${line.product.name} — open product page`}
      >
        <ProductImage
          asset={line.product.media[0] ?? line.variant?.imageOverride ?? null}
          name={line.product.name}
          categoryId={line.product.categoryId}
          preset="thumb"
          sizes="(min-width: 1024px) 96px, 72px"
          className="size-full object-contain"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-1.5">
        <div className="flex items-start justify-between gap-2 lg:gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-[0.9375rem] font-semibold leading-5 text-ink lg:font-display lg:text-h4 lg:font-bold lg:leading-snug">
              <Link
                href={`/product/${line.product.slug}`}
                className="line-clamp-2 rounded-xs transition-colors hover:text-primary"
              >
                {line.product.name}
              </Link>
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
              {series && (
                <Badge tone="navy" className="hidden lg:inline-flex">
                  {series.name}
                </Badge>
              )}
              <p className="inline-flex items-center rounded-full bg-subtle px-2 py-0.5 text-[0.75rem] leading-4 text-muted lg:bg-transparent lg:p-0 lg:text-caption">
                {sizeLabel}
              </p>
              {dimension && <p className="tabular text-[0.75rem] text-muted lg:text-caption">{dimension}</p>}
            </div>
          </div>
          <p className="tabular shrink-0 text-[0.9375rem] font-semibold text-ink lg:text-body-sm lg:font-medium">
            {line.lineTotalInr === null ? "Price on request" : formatInr(line.lineTotalInr)}
          </p>
        </div>

        <p className="tabular text-[0.75rem] text-muted lg:text-caption">SKU {line.variant?.sku ?? "—"}</p>

        {line.problem && (
          <p role="alert" className="text-caption font-medium text-danger">
            {line.problem === "unavailable"
              ? "This size is no longer available for order. Pick another size on the product page."
              : "This size has been removed from the catalogue. The line is excluded from the totals."}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 lg:gap-3">
          <div className="flex items-center gap-2 lg:gap-3">
            <QuantityStepper
              value={line.quantity}
              onChange={onQuantity}
              min={line.product.minimumOrderQuantity}
              disabled={Boolean(line.problem)}
              label={`Quantity of ${line.product.name}`}
            />
            <p className="tabular text-[0.75rem] text-muted lg:text-caption">
              {unit === null ? "Unit price on request" : `${formatInr(unit)} each`}
              {unit !== null && <DemoBadge label="Demo" className="ml-1.5 align-middle max-lg:hidden" />}
            </p>
          </div>
          <div className="flex items-center gap-0.5 lg:gap-1">
            <button
              type="button"
              onClick={onSaveForLater}
              className="inline-flex h-11 items-center gap-1.5 rounded-xs px-2 text-[0.8125rem] text-muted transition-colors hover:bg-subtle hover:text-ink lg:h-9 lg:px-2.5 lg:text-caption"
            >
              <Heart className="size-3.5" aria-hidden />
              <span className="lg:hidden">Save</span>
              <span className="hidden lg:inline">Save for later</span>
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${line.product.name} — ${sizeLabel} from cart`}
              className="inline-flex h-11 items-center gap-1.5 rounded-xs px-2 text-[0.8125rem] text-muted transition-colors hover:bg-subtle hover:text-danger lg:h-9 lg:px-2.5 lg:text-caption"
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
    <div className="pm-shell py-16 lg:py-20" role="status" aria-live="polite">
      <span className="sr-only">Loading your cart</span>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-md h-12 w-64" />
      <div className="mt-2xl grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="flex flex-col divide-y divide-line border-y border-line">
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
