import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { FloatingCartFab } from "@/components/layout/FloatingCartFab";
import { MobileChromeProvider } from "@/components/layout/MobileChrome";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { LiveCatalogHydrator } from "@/components/layout/LiveCatalogHydrator";
import { StorefrontThemeProvider } from "@/components/layout/StorefrontThemeProvider";
import { ensureHeaderNav, ensureLiveCatalog, ensureStorefrontTheme } from "@/lib/backend/server";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [live, headerNav, storefrontTheme] = await Promise.all([
    ensureLiveCatalog(),
    ensureHeaderNav(),
    ensureStorefrontTheme()
  ]);
  return (
    <StorefrontThemeProvider initialTheme={storefrontTheme}>
      <MobileChromeProvider>
        <LiveCatalogHydrator live={live} />
        <div data-surface="storefront" className="flex min-h-dvh flex-col pb-[calc(var(--pm-nav-h)+env(safe-area-inset-bottom))] lg:pb-0">
          <Header initialNav={headerNav} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingCartFab />
          <CartDrawer />
          <MobileTabBar />
        </div>
      </MobileChromeProvider>
    </StorefrontThemeProvider>
  );
}
