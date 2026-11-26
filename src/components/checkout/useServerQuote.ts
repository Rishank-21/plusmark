"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { quoteCart, quoteLinesFrom, type ServerQuote } from "@/lib/backend/storefront";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CartLineView } from "@/types";

/**
 * The server's own price for this cart: item prices, GST split, delivery charge for the state and the
 * coupon. Returns null until it has an answer (or when no backend is configured), so callers can fall
 * back to the quick estimate. Re-asks whenever the cart, code, state or payment method changes.
 */
export function useServerQuote(input: {
  views: CartLineView[];
  couponCode: string | null;
  state: string | null;
  email?: string | null;
  paymentMethod?: "razorpay" | "cod";
}): { quote: ServerQuote | null; loading: boolean } {
  const [quote, setQuote] = useState<ServerQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const counter = useRef(0);

  const lines = useMemo(() => quoteLinesFrom(input.views), [input.views]);
  const key = JSON.stringify([lines, input.couponCode, input.state, input.email ?? null, input.paymentMethod ?? "razorpay"]);

  useEffect(() => {
    if (!isSupabaseConfigured || lines.length === 0) {
      setQuote(null);
      return;
    }
    const mine = ++counter.current;
    setLoading(true);
    const timer = setTimeout(() => {
      quoteCart({
        lines,
        couponCode: input.couponCode,
        state: input.state,
        email: input.email,
        paymentMethod: input.paymentMethod
      })
        .then((result) => {
          if (mine === counter.current) setQuote(result.error ? null : result);
        })
        .catch(() => {
          if (mine === counter.current) setQuote(null);
        })
        .finally(() => {
          if (mine === counter.current) setLoading(false);
        });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, loading };
}
