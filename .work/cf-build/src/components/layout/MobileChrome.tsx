"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { categories } from "@/lib/catalog";
import { imageUrl } from "@/lib/media";

type MobileChromeValue = {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  categoriesOpen: boolean;
  openCategories: () => void;
  closeCategories: () => void;
};

const MobileChromeContext = createContext<MobileChromeValue | null>(null);

export function useMobileChrome() {
  const value = useContext(MobileChromeContext);
  if (!value) throw new Error("useMobileChrome must be used inside MobileChromeProvider");
  return value;
}

/**
 * Owns the mobile menu and search overlays so the header and the bottom tab
 * bar can both open them without duplicating state.
 */
export function MobileChromeProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen && !categoriesOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setCategoriesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [searchOpen, categoriesOpen]);

  const value = useMemo<MobileChromeValue>(
    () => ({
      menuOpen,
      openMenu: () => {
        setCategoriesOpen(false);
        setSearchOpen(false);
        setMenuOpen(true);
      },
      closeMenu: () => setMenuOpen(false),
      searchOpen,
      openSearch: () => {
        setCategoriesOpen(false);
        setMenuOpen(false);
        setSearchOpen(true);
      },
      closeSearch: () => setSearchOpen(false),
      categoriesOpen,
      openCategories: () => {
        setMenuOpen(false);
        setSearchOpen(false);
        setCategoriesOpen(true);
      },
      closeCategories: () => setCategoriesOpen(false)
    }),
    [menuOpen, searchOpen, categoriesOpen]
  );

  return (
    <MobileChromeContext.Provider value={value}>
      {children}
      {searchOpen && (
        <div className="fixed inset-0 z-[700] flex flex-col bg-page pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="flex items-center px-3 py-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-subtle"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2">
            <SearchPanel
              id="mobile-search-overlay"
              label="Search products (mobile overlay)"
              variant="inline"
              autoFocus
            />
          </div>
        </div>
      )}
      {categoriesOpen && (
        <div className="fixed inset-0 z-[700] flex flex-col bg-page pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            <button
              type="button"
              onClick={() => setCategoriesOpen(false)}
              aria-label="Close categories"
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-subtle"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <p className="text-body font-semibold text-ink">Categories</p>
          </div>
          <nav
            aria-label="Categories"
            className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-1"
          >
            <Link
              href="/shop"
              onClick={() => setCategoriesOpen(false)}
              className="flex min-h-[3.5rem] items-center gap-3 border-b border-line text-body font-medium text-ink"
            >
              <ShoppingBag className="size-5 text-muted" aria-hidden />
              Shop all boards
            </Link>
            <ul>
              {categories.map((category) => (
                <li key={category.id} className="border-b border-line">
                  <Link
                    href={`/shop/${category.slug}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex min-h-[3.75rem] items-center gap-3 py-2 text-body-sm font-medium text-ink"
                  >
                    <span className="size-12 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
                      {category.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl(category.image, { fit: "fill", width: 96, height: 96 })}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">{category.name}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </MobileChromeContext.Provider>
  );
}
