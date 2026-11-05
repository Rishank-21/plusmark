"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { STORAGE_KEYS } from "@/lib/config";
import { readJson, writeJson } from "@/lib/storage";
import type { AddressBookEntry, BulkEnquiry, CustomerAccount, Order } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteAddress as deleteAddressRow,
  getProfile,
  saveAddress as saveAddressRow,
  updateProfile as updateProfileRow
} from "@/lib/supabase/account";
import {
  clearLegacyKeys,
  importLegacySnapshot,
  markLegacyHandled,
  readLegacySnapshot,
  type LegacyImportResult,
  type LegacySnapshot
} from "@/lib/supabase/legacy";

/**
 * Account state. Identity and profile data come from Supabase Auth/Postgres;
 * the local orders and enquiries lists remain because checkout is still a
 * browser-side prototype (see supabase/README.md).
 */

interface SessionContextValue {
  account: CustomerAccount | null;
  user: User | null;
  adminSignedIn: boolean;
  adminLoading: boolean;
  hydrated: boolean;
  accountLoading: boolean;
  accountError: string | null;
  orders: Order[];
  enquiries: BulkEnquiry[];
  legacyPrompt: LegacySnapshot | null;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  adminSignOut: () => void;
  placeOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  submitEnquiry: (enquiry: BulkEnquiry) => void;
  saveAddress: (address: AddressBookEntry) => Promise<AddressBookEntry>;
  removeAddress: (id: string) => Promise<void>;
  updateProfile: (patch: { fullName?: string; phone?: string }) => Promise<void>;
  importLegacy: () => Promise<LegacyImportResult | null>;
  dismissLegacy: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<BulkEnquiry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [legacyPrompt, setLegacyPrompt] = useState<LegacySnapshot | null>(null);
  const activeUser = useRef<string | null>(null);
  const legacyChecked = useRef(false);

  useEffect(() => {
    setOrders(readJson<Order[]>("plusmark.orders.v1", []));
    setEnquiries(readJson<BulkEnquiry[]>("plusmark.my-enquiries.v1", []));
  }, []);

  useEffect(() => {
    if (hydrated) writeJson("plusmark.orders.v1", orders);
  }, [orders, hydrated]);

  useEffect(() => {
    if (hydrated) writeJson("plusmark.my-enquiries.v1", enquiries);
  }, [enquiries, hydrated]);

  const loadAccount = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      activeUser.current = null;
      setUser(null);
      setAccount(null);
      setAccountError(null);
      setAccountLoading(false);
      return;
    }

    activeUser.current = nextUser.id;
    setUser(nextUser);
    setAccountLoading(true);
    setAccountError(null);

    try {
      const profile = await getProfile(nextUser);
      if (activeUser.current !== nextUser.id) return;
      setAccount(profile);
    } catch (error) {
      if (activeUser.current !== nextUser.id) return;
      setAccountError(error instanceof Error ? error.message : "Your profile could not be loaded.");
    } finally {
      if (activeUser.current === nextUser.id) setAccountLoading(false);
    }

    if (!legacyChecked.current) {
      legacyChecked.current = true;
      const snapshot = readLegacySnapshot();
      if (snapshot) setLegacyPrompt(snapshot);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setHydrated(true);
      return;
    }

    let alive = true;
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      /* Calling back into Supabase from this callback can deadlock the SDK. */
      if (event === "SIGNED_OUT") {
        activeUser.current = null;
        setUser(null);
        setAccount(null);
        setAccountError(null);
        setAccountLoading(false);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        const nextUser = session?.user ?? null;
        window.setTimeout(() => {
          if (alive) void loadAccount(nextUser);
        }, 0);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      void loadAccount(data.session?.user ?? null);
      setHydrated(true);
    });

    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadAccount]);

  const refreshAccount = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const {
      data: { user: current }
    } = await supabase.auth.getUser();
    await loadAccount(current);
  }, [loadAccount]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    activeUser.current = null;
    setAccount(null);
    setUser(null);
    setAccountError(null);
    setLegacyPrompt(null);
    if (supabase) await supabase.auth.signOut();
    try {
      window.localStorage.removeItem(STORAGE_KEYS.session);
    } catch {
      /* ignore */
    }
  }, []);

  const saveAddress = useCallback<SessionContextValue["saveAddress"]>(async (address) => {
    const saved = await saveAddressRow(address);
    setAccount((current) => {
      if (!current) return current;
      const exists = current.addresses.some((item) => item.id === saved.id);
      const addresses = exists
        ? current.addresses.map((item) => (item.id === saved.id ? saved : item))
        : [...current.addresses, saved];
      return {
        ...current,
        addresses: saved.isDefaultShipping
          ? addresses.map((item) => (item.id === saved.id ? item : { ...item, isDefaultShipping: false, isDefaultBilling: false }))
          : addresses
      };
    });
    return saved;
  }, []);

  const removeAddress = useCallback<SessionContextValue["removeAddress"]>(async (id) => {
    await deleteAddressRow(id);
    setAccount((current) => (current ? { ...current, addresses: current.addresses.filter((item) => item.id !== id) } : current));
  }, []);

  const updateProfile = useCallback<SessionContextValue["updateProfile"]>(async (patch) => {
    await updateProfileRow(patch);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const {
      data: { user: current }
    } = await supabase.auth.getUser();
    if (current) await loadAccount(current);
  }, [loadAccount]);

  const dismissLegacy = useCallback(() => {
    markLegacyHandled();
    setLegacyPrompt(null);
  }, []);

  const importLegacy = useCallback<SessionContextValue["importLegacy"]>(async () => {
    if (!legacyPrompt) return null;
    const result = await importLegacySnapshot(legacyPrompt);
    /* Keep the old keys when anything was skipped so nothing is lost; the
       handled flag stops the prompt from reappearing. */
    if (result.skipped.length === 0) clearLegacyKeys();
    markLegacyHandled();
    setLegacyPrompt(null);
    await refreshAccount();
    return result;
  }, [legacyPrompt, refreshAccount]);

  const placeOrder = useCallback((order: Order) => {
    setOrders((current) => {
      const matches = (item: Order) => item.id === order.id || item.reference === order.reference;
      return current.some(matches)
        ? current.map((item) => (matches(item) ? order : item))
        : [order, ...current];
    });
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
  }, []);

  const submitEnquiry = useCallback((enquiry: BulkEnquiry) => {
    setEnquiries((current) => [enquiry, ...current]);
  }, []);

  const adminSignedIn = account?.role === "admin";

  const value = useMemo<SessionContextValue>(
    () => ({
      account,
      user,
      adminSignedIn,
      adminLoading: accountLoading,
      hydrated,
      accountLoading,
      accountError,
      orders,
      enquiries,
      legacyPrompt,
      signOut,
      refreshAccount,
      adminSignOut: () => {
        void signOut();
      },
      placeOrder,
      updateOrderStatus,
      submitEnquiry,
      saveAddress,
      removeAddress,
      updateProfile,
      importLegacy,
      dismissLegacy
    }),
    [
      account,
      user,
      adminSignedIn,
      accountLoading,
      hydrated,
      accountError,
      orders,
      enquiries,
      legacyPrompt,
      signOut,
      refreshAccount,
      placeOrder,
      updateOrderStatus,
      submitEnquiry,
      saveAddress,
      removeAddress,
      updateProfile,
      importLegacy,
      dismissLegacy
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
