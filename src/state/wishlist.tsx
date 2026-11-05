"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProduct } from "@/lib/catalog";
import { STORAGE_KEYS } from "@/lib/config";
import { readJson, writeJson } from "@/lib/storage";
import { addSavedBoard, listSavedBoards, removeSavedBoard } from "@/lib/supabase/account";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";

interface WishlistContextValue {
  slugs: string[];
  hydrated: boolean;
  syncing: boolean;
  has: (slug: string) => boolean;
  toggle: (slug: string) => { saved: boolean; message: string };
  remove: (slug: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Saved boards. Signed-in visitors are backed by the saved_boards table; guests
 * keep the same list in localStorage until they sign in, at which point local
 * entries are merged into the account.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const toast = useToast();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const slugsRef = useRef<string[]>([]);
  const previousUser = useRef<string | null>(null);

  const commit = useCallback((next: string[] | ((current: string[]) => string[])) => {
    setSlugs((current) => {
      const value = typeof next === "function" ? (next as (current: string[]) => string[])(current) : next;
      slugsRef.current = value;
      return value;
    });
  }, []);

  useEffect(() => {
    const stored = readJson<string[]>(STORAGE_KEYS.wishlist, []);
    const valid = stored.filter((slug) => getProduct(slug));
    slugsRef.current = valid;
    setSlugs(valid);
    setHydrated(true);
  }, []);

  useEffect(() => {
    /* Only guest lists belong in local storage; writing DB results back here
       made the legacy importer offer to re-import the same boards. */
    if (hydrated && !session.user) writeJson(STORAGE_KEYS.wishlist, slugs);
  }, [slugs, hydrated, session.user]);

  useEffect(() => {
    if (!hydrated) return;
    const userId = session.user?.id ?? null;

    if (!userId) {
      if (previousUser.current) {
        /* Signing out clears the visible list and the guest cache so the next
           visitor does not inherit the account's boards. */
        previousUser.current = null;
        commit([]);
        try {
          window.localStorage.removeItem(STORAGE_KEYS.wishlist);
        } catch {
          /* ignore */
        }
      }
      return;
    }

    previousUser.current = userId;
    setSyncing(true);
    let alive = true;

    void (async () => {
      try {
        const remote = await listSavedBoards();
        if (!alive) return;
        const guestExtras = slugsRef.current.filter((slug) => !remote.includes(slug));
        for (const slug of guestExtras) {
          try {
            await addSavedBoard(slug);
          } catch {
            /* A board that cannot be copied stays local and is reported below. */
          }
        }
        if (!alive) return;
        commit(Array.from(new Set([...remote, ...guestExtras])).filter((slug) => getProduct(slug)));
      } catch {
        if (alive) toast.push("Saved boards could not be loaded from your account.", "error");
      } finally {
        if (alive) setSyncing(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [hydrated, session.user?.id, commit, toast]);

  const persistToggle = useCallback(
    (slug: string, saved: boolean) => {
      if (!session.user) return;
      void (saved ? addSavedBoard(slug) : removeSavedBoard(slug)).catch(() => {
        commit((current) => (saved ? current.filter((item) => item !== slug) : [...current, slug]));
        toast.push("Your saved boards could not be updated. Check your connection and try again.", "error");
      });
    },
    [session.user, commit, toast]
  );

  const toggle = useCallback<WishlistContextValue["toggle"]>(
    (slug) => {
      const product = getProduct(slug);
      const saved = !slugsRef.current.includes(slug);
      commit((current) => (saved ? [...current, slug] : current.filter((item) => item !== slug)));
      persistToggle(slug, saved);
      return {
        saved,
        message: saved ? `${product?.name ?? "Board"} saved to your list.` : "Removed from your saved boards."
      };
    },
    [commit, persistToggle]
  );

  const remove = useCallback(
    (slug: string) => {
      commit((current) => current.filter((item) => item !== slug));
      persistToggle(slug, false);
    },
    [commit, persistToggle]
  );

  const clear = useCallback(() => {
    const current = slugsRef.current;
    commit([]);
    current.forEach((slug) => persistToggle(slug, false));
  }, [commit, persistToggle]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      slugs,
      hydrated,
      syncing,
      has: (slug) => slugs.includes(slug),
      toggle,
      remove,
      clear
    }),
    [slugs, hydrated, syncing, toggle, remove, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
