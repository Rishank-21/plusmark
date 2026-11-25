"use client";

import { useEffect, useState } from "react";

/** Reads a query parameter after paint, so the page itself can stay statically exported. */
export function useUrlParam(name: string, fallback = ""): string {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get(name);
    if (next !== null) setValue(next);
  }, [name]);
  return value;
}
