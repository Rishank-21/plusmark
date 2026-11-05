"use client";

import { CartProvider } from "@/state/cart";
import { WishlistProvider } from "@/state/wishlist";
import { ToastProvider } from "@/state/toast";
import { SessionProvider } from "@/state/session";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
