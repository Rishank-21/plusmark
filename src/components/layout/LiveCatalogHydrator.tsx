"use client";

import { useRef } from "react";
import { applyLiveCatalog, type LiveCatalog } from "@/lib/catalog";

/**
 * Gives the browser the same admin-published prices, visibility and new products the server just used,
 * before anything below it reads the catalogue.
 */
export function LiveCatalogHydrator({ live }: { live: LiveCatalog | null }) {
  const applied = useRef<LiveCatalog | null>(null);
  if (live && applied.current !== live) {
    applyLiveCatalog(live);
    applied.current = live;
  }
  return null;
}
