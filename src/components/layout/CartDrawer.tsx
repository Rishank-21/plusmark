"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductImage } from "@/components/ui/ProductImage";
import { allLinesPriced } from "@/components/checkout/cart-support";
import { EmptyState } from "@/components/ui/States";
import { formatInr, variantLabel } from "@/lib/format";
import { useCart } from "@/state/cart";

export function CartDrawer() {
  const cart = useCart();
  const panelRef = useRef<HTMLElement | null>(null);
  const open = cart.drawerOpen;
  const closeDrawer = cart.closeDrawer;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, closeDrawer]);

  if (!cart.drawerOpen) return null;

  const showSubtotal = cart.totals.subtotalInr !== null;

  return (
    <div className="fixed inset-0 z-[700]">
      <div className="absolute inset-0 bg-navy-deep/50" onClick={cart.closeDrawer} aria-hidden />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-[min(26rem,92vw)] flex-col bg-canvas shadow-drawer animate-slide-in-right"
      >
        <header className="flex items-center justify-between border-b border-hair px-5 py-4">
          <h2 className="font-display text-h3">
            Your cart{cart.count > 0 && <span className="ml-2 tabular text-body-sm text-graphite">({cart.count})</span>}
          </h2>
          <button
            type="button"
            onClick={cart.closeDrawer}
            aria-label="Close cart"
            className="-mr-2 flex size-10 items-center justify-center rounded-xs text-graphite transition-colors hover:bg-sand hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!cart.hydrated ? (
            <div className="flex flex-col gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="pm-skeleton size-20 shrink-0 rounded-xs" />
                  <div className="flex flex-1 flex-col gap-2 py-1">
                    <div className="pm-skeleton h-4 w-3/4 rounded-xs" />
                    <div className="pm-skeleton h-3 w-1/3 rounded-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : cart.views.length === 0 ? (
            <EmptyState
              compact
              title="Nothing in your cart yet"
              body="Boards are made to order in Ahmedabad and dispatched across India. Add a size to your cart to order online."
              action={{ label: "Browse the catalogue", href: "/shop" }}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-hair">
              {cart.views.map((line) => (
                <li key={line.id} className="flex gap-3.5 py-4">
                  <Link href={`/product/${line.product.slug}`} onClick={cart.closeDrawer} className="size-20 shrink-0 overflow-hidden rounded-xs border border-hair bg-surface">
                    <ProductImage
                      asset={line.product.media[0] ?? null}
                      name={line.product.name}
                      categoryId={line.product.categoryId}
                      sizes="80px"
                      className="size-full object-contain"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${line.product.slug}`}
                        onClick={cart.closeDrawer}
                        className="text-body-sm font-medium leading-snug text-ink hover:text-navy-deep"
                      >
                        {line.product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => cart.remove(line.id)}
                        aria-label={`Remove ${line.product.name} from cart`}
                        className="-mr-1 flex size-10 shrink-0 items-center justify-center rounded-xs text-graphite transition-colors hover:bg-sand hover:text-danger"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                    <p className="text-caption text-graphite">
                      {line.variant ? variantLabel(line.variant) : "Size no longer offered"}
                      <span className="tabular ml-2 text-graphite-light">{line.variant?.sku}</span>
                    </p>
                    {line.problem && (
                      <p className="text-caption font-medium text-danger">
                        {line.problem === "unavailable"
                          ? "This size is not available. Choose another size on the product page."
                          : "This size was removed from the catalogue."}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(q) => cart.setQuantity(line.id, q)}
                        size="sm"
                        min={line.product.minimumOrderQuantity}
                        disabled={Boolean(line.problem)}
                      />
                      <span className="tabular text-body-sm font-medium text-ink">
                        {line.lineTotalInr === null ? "On request" : formatInr(line.lineTotalInr)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.views.length > 0 && (
          <footer className="border-t border-hair bg-canvas px-5 py-4">
            <div className="flex items-baseline justify-between">
              <p className="text-body-sm text-graphite">Subtotal</p>
              <p className="tabular text-price font-medium text-ink">
                {showSubtotal ? formatInr(cart.totals.subtotalInr ?? 0) : "Price on request"}
              </p>
            </div>
            <p className="mt-1 text-caption text-graphite">
              {showSubtotal
                ? "GST and freight are confirmed at checkout. Shipping rules are still being configured by Plusmark."
                : "Plusmark confirms the price for made-to-order sizes."}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <ButtonLink href="/checkout" onClick={cart.closeDrawer} fullWidth disabled={!allLinesPriced(cart.views)}>
                Proceed to checkout
              </ButtonLink>
              <ButtonLink href="/cart" variant="secondary" onClick={cart.closeDrawer} fullWidth>
                View full cart
              </ButtonLink>
              <button
                type="button"
                onClick={cart.closeDrawer}
                className="mt-1 text-caption text-graphite underline decoration-hair-strong underline-offset-4 hover:text-ink"
              >
                Continue shopping
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
