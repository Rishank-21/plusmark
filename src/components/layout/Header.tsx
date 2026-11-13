"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Heart, Headphones, Layers, LayoutGrid, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { brand, categories, products, seriesList } from "@/lib/catalog";
import { imageUrl } from "@/lib/media";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { classNames } from "@/lib/format";
import { useCart } from "@/state/cart";
import { useWishlist } from "@/state/wishlist";
import { useSession } from "@/state/session";
import { ProductImage } from "@/components/ui/ProductImage";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { useMobileChrome } from "@/components/layout/MobileChrome";

const ANNOUNCEMENT = "Discover quality writing & display boards by Plusmark";

type NavProduct = (typeof products)[number];
type NavMenuItem = { label: string; href: string; image: string | null };
type NavItem = { label: string; href: string; ranges: NavMenuItem[]; featured: NavProduct[] };

function subcategoryImage(subId: string, fallback: string | null): string | null {
  const product = products.find((item) => item.subcategoryIds.includes(subId) && item.media[0]);
  return product?.media[0]?.publicId ?? fallback;
}

function categoryRanges(categoryId: string): NavMenuItem[] {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return [];
  return category.subcategories.map((sub) => ({
    label: sub.name,
    href: `/shop/${category.slug}/${sub.id}`,
    image: subcategoryImage(sub.id, sub.image)
  }));
}

function categoryFeatured(categoryId: string): NavProduct[] {
  const inCategory = products.filter((product) => product.categoryId === categoryId && product.media[0]).slice(0, 2);
  return inCategory.length > 0 ? inCategory : products.filter((product) => product.featured).slice(0, 2);
}

const CERAMIC_RANGES: NavMenuItem[] = categories.flatMap((category) =>
  category.subcategories
    .filter((sub) => sub.id.endsWith("-ceramic"))
    .map((sub) => ({
      label: sub.name,
      href: `/shop/${category.slug}/${sub.id}`,
      image: subcategoryImage(sub.id, sub.image)
    }))
);

const CERAMIC_FEATURED = products
  .filter((product) => product.media[0] && product.subcategoryIds.some((id) => id.endsWith("-ceramic")))
  .slice(0, 2);

const NAV_LINKS: NavItem[] = [
  {
    label: "White Boards",
    href: "/shop/white-boards",
    ranges: categoryRanges("white-boards"),
    featured: categoryFeatured("white-boards")
  },
  {
    label: "Chalk Boards",
    href: "/shop/chalk-boards",
    ranges: categoryRanges("chalk-boards"),
    featured: categoryFeatured("chalk-boards")
  },
  {
    label: "Notice Boards",
    href: "/shop/notice-boards",
    ranges: categoryRanges("notice-boards"),
    featured: categoryFeatured("notice-boards")
  },
  {
    label: "Ceramic Boards",
    href: "/collections/ceramic-boards",
    ranges: CERAMIC_RANGES,
    featured: CERAMIC_FEATURED
  },
  {
    label: "Display Boards",
    href: "/shop/display-boards",
    ranges: categoryRanges("display-boards"),
    featured: categoryFeatured("display-boards")
  },
  {
    label: "Board Stands",
    href: "/shop/board-stands",
    ranges: categoryRanges("board-stands"),
    featured: categoryFeatured("board-stands")
  }
];

export function AnnouncementBar() {
  const [entry, setEntry] = useState<{ text: string; linkHref: string | null; linkLabel: string | null } | null>({
    text: ANNOUNCEMENT,
    linkHref: null,
    linkLabel: null
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let alive = true;
    void supabase
      .from("site_content")
      .select("value")
      .eq("key", "announcement")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error || !data) return;
        const value = data.value as { text?: unknown; active?: unknown; linkHref?: unknown; linkLabel?: unknown } | null;
        if (!value || value.active === false) {
          setEntry(null);
          return;
        }
        if (typeof value.text !== "string" || !value.text.trim()) return;
        setEntry({
          text: value.text,
          linkHref: typeof value.linkHref === "string" && value.linkHref ? value.linkHref : null,
          linkLabel: typeof value.linkLabel === "string" && value.linkLabel ? value.linkLabel : null
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!entry) return null;

  return (
    <div className="hidden bg-shell text-shell-on md:block">
      <p className="pm-shell py-1.5 text-center text-[0.625rem] font-medium uppercase tracking-[0.06em] text-shell-on/90 sm:py-2 sm:text-[0.6875rem] sm:tracking-[0.14em]">
        {entry.text}
        {entry.linkHref && entry.linkLabel && (
          <Link href={entry.linkHref} className="ml-2 underline decoration-white/40 underline-offset-2 hover:decoration-white">
            {entry.linkLabel}
          </Link>
        )}
      </p>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const lastY = useRef(0);
  const chrome = useMobileChrome();
  const cart = useCart();
  const wishlist = useWishlist();
  const session = useSession();

  useEffect(() => {
    document.documentElement.dataset.headerCollapsed = collapsed ? "true" : "false";
  }, [collapsed]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (window.innerWidth < 1024) {
        const delta = y - lastY.current;
        if (y > 72 && delta > 6) setCollapsed(true);
        else if (delta < -6 || y <= 72) setCollapsed(false);
      } else {
        setCollapsed(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={classNames(
        "sticky top-0 z-50 transition-transform duration-200 lg:translate-y-0",
        collapsed && "-translate-y-full"
      )}
    >
      <AnnouncementBar />
      <div className={classNames("border-b border-line/80 bg-surface transition-shadow lg:bg-surface/85 lg:backdrop-blur-md", scrolled && "shadow-card")}>
        <div className="pm-shell flex h-14 items-center gap-2 max-[359px]:gap-1 lg:h-[4.5rem] lg:gap-7">
          <button
            type="button"
            onClick={chrome.openMenu}
            aria-label="Open navigation menu"
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-xs text-ink hover:bg-subtle lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Link href="/" className="flex shrink-0 items-center rounded-xs" aria-label="Plusmark home">
            <Image
              src="/images/plusmark/brand/plusmark.png"
              alt="Plusmark"
              width={1304}
              height={262}
              sizes="(min-width: 1024px) 220px, 140px"
              className="h-7 w-auto max-[359px]:h-6 lg:h-11"
              priority
            />
          </Link>

          <SearchPanel id="desktop-search" label="Search products" className="hidden min-w-0 flex-1 lg:block" />

          <div className="ml-auto flex shrink-0 items-center gap-1 max-[359px]:gap-0.5 lg:ml-0 lg:gap-4">
            <button
              type="button"
              onClick={chrome.openSearch}
              aria-label="Search products"
              className="flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-primary-soft hover:text-primary-strong lg:hidden"
            >
              <Search className="size-5" aria-hidden />
            </button>
            <HeaderAction label={`Account${session.account ? " — signed in" : ""}`} href="/account" hideOnMobile>
              <User className="size-5" aria-hidden />
              <span className="hidden xl:block">Account</span>
            </HeaderAction>
            <HeaderAction label={`Wishlist${wishlist.slugs.length ? ` — ${wishlist.slugs.length} saved` : ""}`} href="/wishlist">
              <Heart className="size-5" aria-hidden />
              <span className="hidden xl:block">Wishlist</span>
              {wishlist.slugs.length > 0 && <Dot>{wishlist.slugs.length}</Dot>}
            </HeaderAction>
            <HeaderAction label={`Cart${cart.count ? ` — ${cart.count} items` : ""}`} onClick={cart.openDrawer}>
              <ShoppingCart className="size-5" aria-hidden />
              <span className="hidden sm:block">Cart</span>
              {cart.count > 0 && <Dot>{cart.count}</Dot>}
            </HeaderAction>
          </div>
        </div>

        <nav aria-label="Product navigation" className="hidden border-t border-line lg:block">
          <div className="pm-shell">
            <div className="relative flex h-12 items-center gap-1">
              <MegaMenu />
              {NAV_LINKS.map((link) => (
                <NavMenu key={link.href} item={link} />
              ))}
            </div>
          </div>
        </nav>
      </div>

      <MobileNav open={chrome.menuOpen} onClose={chrome.closeMenu} />
    </header>
  );
}

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <span className="tabular absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-4 text-onprimary">
      {children}
    </span>
  );
}

function HeaderAction({
  label,
  children,
  onClick,
  href,
  hideOnMobile
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  hideOnMobile?: boolean;
}) {
  const className = classNames(
    "relative flex h-11 items-center justify-center gap-2 rounded-md px-3 text-caption font-medium text-ink transition-colors hover:bg-primary-soft hover:text-primary-strong lg:h-10 lg:px-2.5",
    hideOnMobile && "hidden lg:flex"
  );
  if (href) {
    return <Link href={href} aria-label={label} className={className}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} aria-label={label} className={className}>{children}</button>;
}

function NavMenu({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | undefined>(undefined);
  const id = `nav-menu-${item.href.replace(/\W+/g, "-").replace(/^-|-$/g, "")}`;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const hasRanges = item.ranges.length > 0;

  const show = () => {
    window.clearTimeout(timeout.current);
    setOpen(true);
  };
  const scheduleHide = () => {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setOpen(false), 120);
  };
  const close = () => {
    window.clearTimeout(timeout.current);
    setOpen(false);
  };

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <Link
        href={item.href}
        onClick={close}
        aria-expanded={open}
        aria-controls={id}
        className={classNames(
          "relative block rounded-xs px-3 py-2 text-body-sm font-medium transition-colors hover:text-ink",
          open && "bg-primary-soft text-primary-strong",
          !open && (active ? "text-ink" : "text-muted")
        )}
      >
        {item.label}
        {active && <span className="absolute inset-x-3 -bottom-px h-px bg-primary" aria-hidden />}
      </Link>

      {open && (
        <div
          id={id}
          className={classNames(
            "absolute left-0 top-full z-50 pt-1",
            hasRanges ? "w-[min(64rem,92vw)]" : "w-[min(44rem,92vw)]"
          )}
        >
          <div className="rounded-md border border-line bg-page p-6 shadow-lift animate-fade-up">
            <div className={classNames("grid gap-8", hasRanges ? "lg:grid-cols-[1.6fr_1fr_1fr]" : "grid-cols-2")}>
              {hasRanges && (
                <div>
                  <p className="pm-eyebrow mb-3">Product ranges</p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {item.ranges.map((range) => (
                      <li key={range.href}>
                        <Link
                          href={range.href}
                          onClick={close}
                          className="flex items-center gap-2.5 rounded-xs px-2 py-1.5 transition-colors hover:bg-subtle"
                        >
                          <span className="size-8 shrink-0 overflow-hidden rounded-xs bg-surface">
                            {range.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageUrl(range.image, { fit: "fill", width: 64, height: 64 })}
                                alt=""
                                className="size-full object-contain"
                                loading="lazy"
                              />
                            )}
                          </span>
                          <span className="text-body-sm text-ink">{range.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="pm-eyebrow mb-3">By series</p>
                <ul className="flex flex-col gap-2.5">
                  {seriesList.map((series) => (
                    <li key={series.id}>
                      <Link
                        href={`/shop?series=${series.id}`}
                        onClick={close}
                        className="flex flex-col rounded-xs px-2 py-1.5 transition-colors hover:bg-subtle"
                      >
                        <span className="text-body-sm font-medium text-ink">{series.name}</span>
                        <span className="text-caption leading-snug text-muted">{series.surface}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <p className="pm-eyebrow">Start here</p>
                {item.featured.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="group flex items-center gap-3 rounded-lg border border-line bg-surface p-2 transition-colors hover:border-line-strong"
                  >
                    <span className="size-14 shrink-0 overflow-hidden rounded-xs border border-line bg-surface">
                      <ProductImage
                        asset={product.media[0] ?? null}
                        name={product.name}
                        categoryId={product.categoryId}
                        preset="thumb"
                        sizes="56px"
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-body-sm font-medium text-ink group-hover:text-ink">{product.name}</span>
                      <span className="text-caption text-muted">View product</span>
                    </span>
                  </Link>
                ))}
                <Link
                  href={item.href}
                  onClick={close}
                  className="mt-1 flex h-10 items-center justify-center rounded-lg border border-line-strong text-caption font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-subtle"
                >
                  Browse all {item.label.toLowerCase()}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(timeout.current);
    setOpen(true);
  };
  const hide = () => {
    timeout.current = window.setTimeout(() => setOpen(false), 120);
  };

  const featured = products.filter((p) => p.featured).slice(0, 2);

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="pm-mega"
        onClick={() => setOpen((v) => !v)}
        className={classNames(
          "rounded-xs px-3 py-2 text-body-sm font-medium transition-colors hover:text-ink",
          open ? "bg-primary-soft text-primary-strong" : "text-ink"
        )}
      >
        Shop All Boards
      </button>

      {open && (
        <div id="pm-mega" className="absolute left-0 top-full z-50 w-[min(64rem,92vw)] pt-1">
          <div className="rounded-md border border-line bg-page p-6 shadow-lift animate-fade-up">
            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr_1fr]">
              <div>
                <p className="pm-eyebrow mb-3">Product ranges</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <MegaCategory category={c} onNavigate={() => setOpen(false)} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="pm-eyebrow mb-3">By series</p>
                <ul className="flex flex-col gap-2.5">
                  {seriesList.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/shop?series=${s.id}`}
                        onClick={() => setOpen(false)}
                        className="flex flex-col rounded-xs px-2 py-1.5 transition-colors hover:bg-subtle"
                      >
                        <span className="text-body-sm font-medium text-ink">{s.name}</span>
                        <span className="text-caption leading-snug text-muted">{s.surface}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <p className="pm-eyebrow">Start here</p>
                {featured.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-lg border border-line bg-surface p-2 transition-colors hover:border-line-strong"
                  >
                    <span className="size-14 shrink-0 overflow-hidden rounded-xs border border-line bg-surface">
                      <ProductImage
                        asset={p.media[0] ?? null}
                        name={p.name}
                        categoryId={p.categoryId}
                        preset="thumb"
                        sizes="56px"
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-body-sm font-medium text-ink group-hover:text-ink">{p.name}</span>
                      <span className="text-caption text-muted">View product</span>
                    </span>
                  </Link>
                ))}
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex h-10 items-center justify-center rounded-lg border border-line-strong text-caption font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-subtle"
                >
                  Browse all products
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MegaCategory({ category, onNavigate }: { category: (typeof categories)[number]; onNavigate: () => void }) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-xs px-2 py-1.5 transition-colors hover:bg-subtle"
    >
      <span className="size-7 shrink-0 overflow-hidden rounded-xs bg-surface">
        {category.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(category.image, { fit: "fill", width: 56, height: 56 })} alt="" className="size-full object-cover" loading="lazy" />
        )}
      </span>
      <span className="text-body-sm text-ink">{category.name}</span>
    </Link>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cart = useCart();
  const wishlist = useWishlist();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[600] lg:hidden">
      <div className="absolute inset-0 bg-scrim/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col bg-page shadow-drawer pm-slide-in-left">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="pm-eyebrow">Menu</p>
          <button type="button" onClick={onClose} aria-label="Close menu" className="-mr-2 flex size-11 items-center justify-center rounded-xs text-muted hover:bg-subtle hover:text-ink">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="flex flex-col">
            <li className="border-b border-line">
              <Link href="/shop" onClick={onClose} className="flex h-[3.25rem] items-center gap-3 text-body font-medium text-ink">
                <ShoppingBag className="size-5 text-muted" aria-hidden />
                Shop all products
              </Link>
            </li>
            <li className="border-b border-line">
              <button
                type="button"
                aria-expanded={expanded === "cats"}
                onClick={() => setExpanded((v) => (v === "cats" ? null : "cats"))}
                className="flex h-[3.25rem] w-full items-center gap-3 text-body font-medium text-ink"
              >
                <LayoutGrid className="size-5 text-muted" aria-hidden />
                Categories
                <span className={classNames("ml-auto text-muted transition-transform", expanded === "cats" && "rotate-90")}>›</span>
              </button>
              {expanded === "cats" && (
                <ul className="pb-2">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/shop/${c.slug}`} onClick={onClose} className="flex min-h-11 items-center rounded-xs pl-8 pr-2 text-body-sm text-muted hover:bg-subtle hover:text-ink">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="border-b border-line">
              <button
                type="button"
                aria-expanded={expanded === "series"}
                onClick={() => setExpanded((v) => (v === "series" ? null : "series"))}
                className="flex h-[3.25rem] w-full items-center gap-3 text-body font-medium text-ink"
              >
                <Layers className="size-5 text-muted" aria-hidden />
                Series
                <span className={classNames("ml-auto text-muted transition-transform", expanded === "series" && "rotate-90")}>›</span>
              </button>
              {expanded === "series" && (
                <ul className="pb-2">
                  {seriesList.map((s) => (
                    <li key={s.id}>
                      <Link href={`/shop?series=${s.id}`} onClick={onClose} className="flex min-h-11 items-center rounded-xs pl-8 pr-2 text-body-sm text-muted hover:bg-subtle hover:text-ink">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="border-b border-line">
              <Link href="/collections" onClick={onClose} className="flex h-[3.25rem] items-center gap-3 text-body font-medium text-ink">
                <Bookmark className="size-5 text-muted" aria-hidden />
                Collections
              </Link>
            </li>
            <li className="border-b border-line">
              <Link href="/wishlist" onClick={onClose} className="flex h-[3.25rem] items-center gap-3 text-body font-medium text-ink">
                <Heart className="size-5 text-muted" aria-hidden />
                Wishlist
                {wishlist.slugs.length > 0 && <span className="tabular ml-auto text-caption text-muted">{wishlist.slugs.length} saved</span>}
              </Link>
            </li>
            <li className="border-b border-line">
              <Link href="/account" onClick={onClose} className="flex h-[3.25rem] items-center gap-3 text-body font-medium text-ink">
                <User className="size-5 text-muted" aria-hidden />
                My account
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={onClose} className="flex h-[3.25rem] items-center gap-3 text-body font-medium text-ink">
                <Headphones className="size-5 text-muted" aria-hidden />
                Support
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${brand.phone.replace(/\s/g, "")}`}
              aria-label="Call Plusmark"
              className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-subtle"
            >
              <Phone className="size-[18px]" aria-hidden />
            </a>
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Plusmark"
              className="flex size-11 shrink-0 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-subtle"
            >
              <MessageCircle className="size-[18px]" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                cart.openDrawer();
              }}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-body-sm font-medium text-onprimary"
            >
              <ShoppingCart className="size-4" aria-hidden />
              Cart{cart.count > 0 && ` · ${cart.count}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
