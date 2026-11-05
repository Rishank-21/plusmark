"use client";

import dynamic from "next/dynamic";

/**
 * Client-review tooling. The dynamic import sits behind a statically evaluated
 * environment check so production builds drop the switcher chunk entirely.
 */
const Switcher =
  process.env.NODE_ENV === "production"
    ? null
    : dynamic(() => import("./ThemeSwitcher").then((mod) => mod.ThemeSwitcher), { ssr: false });

export function DevThemeSwitcher() {
  if (!Switcher) return null;
  return <Switcher />;
}
