"use client";

import { useEffect, useState } from "react";
import { listActiveCoupons } from "@/lib/supabase/admin";
import type { Coupon } from "@/types";

/**
 * Client cache of coupons that are live right now. The database is the
 * authority; this store only avoids refetching the same list on every render.
 */
let coupons: Coupon[] = [];
let state: "idle" | "loading" | "ready" | "error" = "idle";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function load() {
  if (state !== "idle") return;
  state = "loading";
  emit();
  try {
    coupons = await listActiveCoupons();
    state = "ready";
  } catch {
    coupons = [];
    state = "error";
  }
  emit();
}

export function liveCoupons(): Coupon[] {
  return coupons;
}

export function couponState(): "idle" | "loading" | "ready" | "error" {
  return state;
}

export function useLiveCoupons(): { coupons: Coupon[]; state: "idle" | "loading" | "ready" | "error" } {
  const [, bump] = useState(0);
  useEffect(() => {
    const listener = () => bump((value) => value + 1);
    listeners.add(listener);
    void load();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return { coupons, state };
}
