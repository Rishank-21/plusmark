"use client";

import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useMobileChrome } from "@/components/layout/MobileChrome";
import { classNames, formatInr } from "@/lib/format";
import { useCart } from "@/state/cart";

export function FloatingCartFab() {
  const pathname = usePathname();
  const cart = useCart();
  const mobile = useMobileChrome();

  if (!cart.hydrated || cart.count === 0 || cart.drawerOpen) return null;
  if (mobile.menuOpen || mobile.categoriesOpen || mobile.searchOpen) return null;
  if (pathname.startsWith("/checkout") || pathname.startsWith("/cart")) return null;

  const isProductPage = pathname.startsWith("/product/");
  const subtotal = cart.totals.subtotalInr;

  return (
    <button
      type="button"
      onClick={cart.openDrawer}
      aria-label={`Open cart (${cart.count} ${cart.count === 1 ? "item" : "items"})`}
      className={classNames(
        "fixed right-4 z-[220] inline-flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-onprimary shadow-lift transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:px-5 sm:py-3.5 lg:bottom-6 lg:right-6",
        isProductPage
          ? "bottom-[calc(var(--pm-nav-h)+4.75rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(var(--pm-nav-h)+0.75rem+env(safe-area-inset-bottom))]"
      )}
    >
      <ShoppingCart className="size-4 shrink-0 sm:size-[18px]" aria-hidden />
      <span className="text-caption font-semibold tabular-nums sm:text-body-sm">
        Cart ({cart.count})
      </span>
      {subtotal !== null && (
        <>
          <span className="h-3.5 w-px bg-onprimary/30" aria-hidden />
          <span className="text-caption font-bold tabular-nums sm:text-body-sm">
            {formatInr(subtotal)}
          </span>
        </>
      )}
    </button>
  );
}
