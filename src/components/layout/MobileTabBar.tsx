"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { classNames } from "@/lib/format";
import { useCart } from "@/state/cart";
import { useMobileChrome } from "@/components/layout/MobileChrome";

const HIDDEN_PREFIXES = ["/product/", "/cart", "/checkout"];

export function MobileTabBar() {
  const pathname = usePathname();
  const cart = useCart();
  const chrome = useMobileChrome();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  if (chrome.menuOpen || chrome.categoriesOpen) return null;

  const active = {
    home: pathname === "/",
    categories: pathname.startsWith("/shop") || pathname.startsWith("/collections"),
    cart: false,
    account: pathname.startsWith("/account")
  };

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-[190] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-[var(--pm-nav-h)] grid-cols-5">
        <Tab href="/" label="Home" active={active.home}>
          <Home className="size-6" aria-hidden />
        </Tab>
        <Tab label="Categories" active={active.categories} onClick={chrome.openCategories}>
          <LayoutGrid className="size-6" aria-hidden />
        </Tab>
        <Tab label="Search" onClick={chrome.openSearch}>
          <Search className="size-6" aria-hidden />
        </Tab>
        <Tab label="Cart" onClick={cart.openDrawer} badge={cart.count > 0 ? cart.count : undefined}>
          <ShoppingCart className="size-6" aria-hidden />
        </Tab>
        <Tab href="/account" label="Account" active={active.account}>
          <User className="size-6" aria-hidden />
        </Tab>
      </ul>
    </nav>
  );
}

function Tab({
  href,
  label,
  active = false,
  onClick,
  badge,
  children
}: {
  href?: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  const className = classNames(
    "relative flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium leading-none transition-colors",
    active ? "text-primary" : "text-muted"
  );

  const content = (
    <>
      <span className="relative">
        {children}
        {badge !== undefined && (
          <span className="tabular absolute -right-2.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-4 text-onprimary">
            {badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <li>
        <Link href={href} aria-current={active ? "page" : undefined} className={className}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={classNames(className, "w-full")}>
        {content}
      </button>
    </li>
  );
}
