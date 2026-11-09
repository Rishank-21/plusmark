"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProduct, variantOf } from "@/lib/catalog";
import { DEMO_PRICING_ENABLED, STORAGE_KEYS } from "@/lib/config";
import { variantLabel } from "@/lib/format";
import { computeTotals, defaultShippingMethod, findCoupon, SHIPPING_METHODS } from "@/lib/pricing";
import { useLiveShipping } from "@/components/checkout/shipping-store";
import { readJson, writeJson } from "@/lib/storage";
import type { CartLine, CartLineView, Coupon, ShippingMethod } from "@/types";

interface CartContextValue {
  lines: CartLine[];
  views: CartLineView[];
  count: number;
  hydrated: boolean;
  drawerOpen: boolean;
  add: (input: { productId: string; variantId: string; colour?: string | null; quantity?: number }) => { ok: boolean; message: string };
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  couponCode: string | null;
  applyCoupon: (code: string, coupons: Coupon[]) => { ok: boolean; message: string };
  clearCoupon: () => void;
  shippingMethod: ShippingMethod;
  setShippingMethod: (method: ShippingMethod) => void;
  totals: ReturnType<typeof computeTotals>;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Used only when the live table has no method to offer. */
const UNSET_SHIPPING: ShippingMethod = {
  id: "unset",
  name: "Shipping to be confirmed",
  description: "No dispatch method is currently available. Plusmark will confirm freight with the order.",
  priceInr: null,
  etaMinDays: null,
  etaMaxDays: null,
  available: false,
  configured: false
};

type StoredCartShape = { lines: CartLine[]; couponCode: string | null; shippingMethodId: string };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState<string>(defaultShippingMethod().id);
  const shippingFeed = useLiveShipping();
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stored = readJson<StoredCartShape | null>(STORAGE_KEYS.cart, null);
    if (stored?.lines) {
      setLines(stored.lines.filter((l) => getProduct(l.productId)));
      setCouponCode(stored.couponCode ?? null);
      if (stored.shippingMethodId) setShippingMethodId(stored.shippingMethodId);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEYS.cart, { lines, couponCode, shippingMethodId } satisfies StoredCartShape);
  }, [lines, couponCode, shippingMethodId, hydrated]);

  useEffect(() => {
    if (!drawerOpen) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [drawerOpen]);

  const add = useCallback<CartContextValue["add"]>(({ productId, variantId, colour = null, quantity = 1 }) => {
    const product = getProduct(productId);
    if (!product) return { ok: false, message: "That product is no longer listed." };
    const variant = variantOf(product, variantId);
    if (!variant) return { ok: false, message: "Choose an available size before adding to the cart." };
    if (!variant.available) return { ok: false, message: `${variantLabel(variant)} is not available right now.` };
    if (variant.priceMode === "on_request" && !DEMO_PRICING_ENABLED) {
      return { ok: false, message: "This size is quoted on request. Use Request a Bulk Quote instead." };
    }

    const colourSuffix = colour ? ` · ${colour}` : "";
    let message = `Added ${product.name} — ${variantLabel(variant)}${colourSuffix} to your cart.`;
    setLines((current) => {
      const matchIndex = current.findIndex((l) => l.variantId === variantId && (l.colour ?? null) === (colour ?? null));
      if (matchIndex >= 0) {
        const next = [...current];
        const existing = next[matchIndex];
        next[matchIndex] = { ...existing, quantity: Math.min(existing.quantity + quantity, 999) };
        message = `Updated ${product.name} — ${variantLabel(variant)}${colourSuffix} to ${next[matchIndex].quantity}.`;
        return next;
      }
      return [
        ...current,
        {
          id: `${variantId}-${colour ? colour.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "default"}-${Date.now().toString(36)}`,
          productId,
          variantId,
          colour: colour ?? null,
          quantity: Math.max(product.minimumOrderQuantity, quantity),
          addedAt: new Date().toISOString()
        }
      ];
    });
    return { ok: true, message };
  }, []);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((current) =>
      current.flatMap((l) => (l.id === lineId ? (quantity < 1 ? [] : [{ ...l, quantity: Math.min(quantity, 999) }]) : [l]))
    );
  }, []);

  const remove = useCallback((lineId: string) => {
    setLines((current) => current.filter((l) => l.id !== lineId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCode(null);
  }, []);

  const views = useMemo<CartLineView[]>(() => {
    return lines.flatMap<CartLineView>((line) => {
      const product = getProduct(line.productId);
      if (!product) return [];
      const variant = variantOf(product, line.variantId);
      if (!variant) {
        return [{ ...line, product, variant: null, lineTotalInr: null, problem: "unknown_variant" as const }];
      }
      return [
        {
          ...line,
          product,
          variant,
          lineTotalInr: variant.priceInr === null ? null : variant.priceInr * line.quantity,
          problem: !variant.available ? ("unavailable" as const) : null
        }
      ];
    });
  }, [lines]);

  const shippingMethod = useMemo<ShippingMethod>(() => {
    const list = shippingFeed.state === "loading" || shippingFeed.state === "idle" ? SHIPPING_METHODS : shippingFeed.methods;
    return list.find((m) => m.id === shippingMethodId) ?? list.find((m) => m.available) ?? list[0] ?? UNSET_SHIPPING;
  }, [shippingMethodId, shippingFeed.state, shippingFeed.methods]);

  const totals = useMemo(
    () => computeTotals({ lines: views, shippingMethod, coupon: null }),
    [views, shippingMethod]
  );

  const applyCoupon = useCallback<CartContextValue["applyCoupon"]>((code, coupons) => {
    const match = findCoupon(code, coupons);
    if (!match) return { ok: false, message: "That code is not valid or has expired." };
    setCouponCode(match.code);
    return { ok: true, message: `${match.code} applied.` };
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      views,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      hydrated,
      drawerOpen,
      add,
      setQuantity,
      remove,
      clear,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      couponCode,
      applyCoupon,
      clearCoupon: () => setCouponCode(null),
      shippingMethod,
      setShippingMethod: (m) => setShippingMethodId(m.id),
      totals
    }),
    [lines, views, hydrated, drawerOpen, add, setQuantity, remove, clear, couponCode, applyCoupon, shippingMethod, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
