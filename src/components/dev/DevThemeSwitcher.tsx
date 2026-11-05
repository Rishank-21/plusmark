"use client";

import dynamic from "next/dynamic";

/**
 * Client-review tooling. Always available in development; in production it stays
 * on unless NEXT_PUBLIC_THEME_PREVIEW=off, so a review deployment can show the
 * palette options while the live storefront can hide them with one env var.
 */
const ENABLED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_THEME_PREVIEW !== "off";

const Switcher = ENABLED
  ? dynamic(() => import("./ThemeSwitcher").then((mod) => mod.ThemeSwitcher), { ssr: false })
  : null;

export function DevThemeSwitcher() {
  if (!Switcher) return null;
  return <Switcher />;
}
