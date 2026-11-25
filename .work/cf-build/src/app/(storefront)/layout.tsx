import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileChromeProvider } from "@/components/layout/MobileChrome";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileChromeProvider>
      <div className="flex min-h-dvh flex-col pb-[calc(var(--pm-nav-h)+env(safe-area-inset-bottom))] lg:pb-0">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <MobileTabBar />
      </div>
    </MobileChromeProvider>
  );
}
