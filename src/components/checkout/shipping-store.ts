"use client";

import { useEffect, useState } from "react";
import { fetchShippingMethods } from "@/lib/backend/storefront";
import type { ShippingMethod } from "@/types";

/**
 * Client cache of the dispatch methods the admin maintains. The database is
 * the authority; this store only keeps one request per page session.
 */
let methods: ShippingMethod[] = [];
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
    methods = await fetchShippingMethods();
    state = "ready";
  } catch {
    methods = [];
    state = "error";
  }
  emit();
}

export function liveShipping(): ShippingMethod[] {
  return methods;
}

export function shippingState(): "idle" | "loading" | "ready" | "error" {
  return state;
}

export function useLiveShipping(): { methods: ShippingMethod[]; state: "idle" | "loading" | "ready" | "error" } {
  const [, bump] = useState(0);
  useEffect(() => {
    const listener = () => bump((value) => value + 1);
    listeners.add(listener);
    void load();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return { methods, state };
}
