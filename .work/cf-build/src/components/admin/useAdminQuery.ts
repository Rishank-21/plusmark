"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AdminQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Small loader for admin screens: one request on mount, an explicit reload for
 * retries and after mutations. Screens load their full dataset and filter
 * client-side, so the loader does not depend on filter state.
 */
export function useAdminQuery<T>(loader: () => Promise<T>): AdminQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loaderRef
      .current()
      .then((next) => {
        if (alive) setData(next);
      })
      .catch((reason: unknown) => {
        if (alive) setError(reason instanceof Error ? reason.message : "This screen could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data, loading, error, reload, setData };
}

export function errorMessage(reason: unknown, fallback = "That change could not be saved."): string {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}
