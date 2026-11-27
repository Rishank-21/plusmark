"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Heart, Headphones, Layers, LayoutGrid, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { brand, categories, products, seriesList } from "@/lib/catalog";
import { imageUrl } from "@/lib/media";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { classNames } from "@/lib/format";
import {
  buildDefaultHeaderNav,
  normalizeHeaderNav,
  resolveHeaderNav,
  type HeaderNavConfig,
  type ResolvedHeaderChild,
  type ResolvedHeaderMegaMenu,
  type ResolvedHeaderMiddleLink,
  type ResolvedHeaderStripItem
} from "@/lib/header-nav";
import { useCart } from "@/state/cart";
import { useWishlist } from "@/state/wishlist";
import { useSession } from "@/state/session";
import { ProductImage } from "@/components/ui/ProductImage";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { useMobileChrome } from "@/components/layout/MobileChrome";
import type { Product } from "@/types";

export function AnnouncementBar() {
  const [entry, setEntry] = useState<{ text: string; linkHref: string | null; linkLabel: string | null } | null>(null);

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

export function Header({ initialNav = null }: { initialNav?: HeaderNavConfig | null }) {
  const [collapsed, setCollapsed] = useState(false);
  const [navConfig, setNavConfig] = useState<HeaderNavConfig>(() => initialNav ?? buildDefaultHeaderNav());
  const lastY = useRef(0);
  const chrome = useMobileChrome();
  const cart = useCart();
  const wishlist = useWishlist();
  const session = useSession();

  useEffect(() => {
    if (initialNav) setNavConfig(initialNav);
  }, [initialNav]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let alive = true;
    void supabase
      .from("site_content")
      .select("value")
      .eq("key", "header_nav")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error || !data?.value) return;
        setNavConfig(normalizeHeaderNav(data.value));
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.headerCollapsed = collapsed ? "true" : "false";
  }, [collapsed]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
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

  const resolvedNav = useMemo(
    () => resolveHeaderNav(navConfig, { categories, seriesList, products }),
    [navConfig]
  );

  return (
    <header
      className={classNames(
        "sticky top-0 z-50 transition-transform duration-200 lg:translate-y-0",
        collapsed && "-translate-y-full"
      )}
    >
      <AnnouncementBar />
      <div className="border-b border-line bg-surface">
        <div className="pm-shell flex h-14 items-center justify-between gap-3 lg:h-[4.25rem] lg:gap-8">
          <button
            type="button"
            onClick={chrome.openMenu}
            aria-label="Open navigation menu"
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-md text-ink hover:bg-subtle lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Link href="/" className="flex shrink-0 items-center rounded-xs" aria-label="Plusmark home">
            <Image
              src="/images/plusmark/brand/plusmark.png"
              alt="Plusmark"
              width={1304}
              height={262}
              sizes="(min-width: 1024px) 170px, 130px"
              className="h-7 w-auto max-[359px]:h-6 lg:h-9"
              priority
            />
          </Link>

          <SearchPanel id="desktop-search" label="Search products" className="hidden min-w-0 flex-1 max-w-2xl lg:block" />

          <div className="flex shrink-0 items-center gap-1 max-[359px]:gap-0.5 lg:gap-2">
            <button
              type="button"
              onClick={chrome.openSearch}
              aria-label="Search products"
              className="flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-subtle lg:hidden"
            >
              <Search className="size-5" aria-hidden />
            </button>
            <HeaderAction label={`Wishlist${wishlist.slugs.length ? ` — ${wishlist.slugs.length} saved` : ""}`} href="/wishlist">
              <Heart className="size-5" aria-hidden />
              {wishlist.slugs.length > 0 && <Dot>{wishlist.slugs.length}</Dot>}
            </HeaderAction>
            <HeaderAction label={`Account${session.account ? " — signed in" : ""}`} href="/account" hideOnMobile>
              <User className="size-5" aria-hidden />
              <span className="hidden xl:inline">Account</span>
            </HeaderAction>
            <HeaderAction label={`Cart${cart.count ? ` — ${cart.count} items` : ""}`} onClick={cart.openDrawer}>
              <ShoppingCart className="size-5" aria-hidden />
              <span className="hidden xl:inline">Cart</span>
              {cart.count > 0 && <Dot>{cart.count}</Dot>}
            </HeaderAction>
          </div>
        </div>

        <nav aria-label="Product navigation" className="hidden bg-shell text-shell-on lg:block">
          <div className="pm-shell relative flex min-h-[2.875rem] flex-wrap items-center justify-center gap-x-4 gap-y-1 py-1 xl:gap-x-7">
            {resolvedNav.megaMenu.enabled && <MegaMenu config={resolvedNav.megaMenu} />}
            {resolvedNav.items.map((link) => (
              <NavMenu key={link.id} item={link} />
            ))}
          </div>
        </nav>
      </div>

      <MobileNav open={chrome.menuOpen} onClose={chrome.closeMenu} items={resolvedNav.items} />
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
    "relative flex h-11 items-center justify-center gap-2 rounded-md px-3 text-caption font-medium text-ink transition-colors hover:bg-subtle lg:h-10 lg:px-2.5",
    hideOnMobile && "hidden lg:flex"
  );
  if (href) {
    return <Link href={href} aria-label={label} className={className}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} aria-label={label} className={className}>{children}</button>;
}

function NavThumb({ image }: { image: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-subtle text-muted">
        <Layers className="size-3.5" aria-hidden />
      </span>
    );
  }

  return (
    <span className="size-8 shrink-0 overflow-hidden rounded-xs bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl(image, { fit: "fill", width: 64, height: 64 })}
        alt=""
        className="size-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function NavDropdownPanel({
  id,
  rangesHeading,
  ranges,
  middleHeading,
  middleLinks,
  featuredHeading,
  featured,
  ctaLabel,
  ctaHref,
  onNavigate
}: {
  id: string;
  rangesHeading: string;
  ranges: ResolvedHeaderChild[];
  middleHeading: string;
  middleLinks: ResolvedHeaderMiddleLink[];
  featuredHeading: string;
  featured: Product[];
  ctaLabel: string;
  ctaHref: string;
  onNavigate: () => void;
}) {
  const hasRanges = ranges.length > 0;
  const hasMiddle = middleLinks.length > 0;
  const hasFeaturedCol = featured.length > 0 || Boolean(ctaLabel);
  const colCount = (hasRanges ? 1 : 0) + (hasMiddle ? 1 : 0) + (hasFeaturedCol ? 1 : 0);

  if (colCount === 0) return null;

  const widthCls =
    colCount >= 3
      ? "w-[min(64rem,92vw)]"
      : colCount === 2
        ? "w-[min(46rem,92vw)]"
        : "w-[min(28rem,92vw)]";

  const gridCls =
    colCount >= 3
      ? "lg:grid-cols-[1.6fr_1fr_1fr]"
      : colCount === 2
        ? hasRanges
          ? "lg:grid-cols-[1.45fr_1fr]"
          : "sm:grid-cols-2"
        : "grid-cols-1";

  return (
    <div id={id} className={classNames("absolute left-0 top-full z-50 pt-2", widthCls)}>
      <div className="rounded-md border border-line bg-surface p-6 text-ink shadow-lift">
        <div className={classNames("grid gap-8", gridCls)}>
          {hasRanges && (
            <div>
              <p className="pm-eyebrow mb-3">{rangesHeading}</p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                {ranges.map((range) => (
                  <li key={`${range.id}-${range.href}`}>
                    <Link
                      href={range.href}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 rounded-xs px-2 py-1.5 transition-colors hover:bg-subtle"
                    >
                      <NavThumb image={range.image} />
                      <span className="text-body-sm text-ink">{range.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasMiddle && (
            <div>
              <p className="pm-eyebrow mb-3">{middleHeading}</p>
              <ul className="flex flex-col gap-2.5">
                {middleLinks.map((entry) => (
                  <li key={`${entry.id}-${entry.href}`}>
                    <Link
                      href={entry.href}
                      onClick={onNavigate}
                      className="flex flex-col rounded-xs px-2 py-1.5 transition-colors hover:bg-subtle"
                    >
                      <span className="text-body-sm font-medium text-ink">{entry.label}</span>
                      {entry.subtitle && <span className="text-caption leading-snug text-muted">{entry.subtitle}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasFeaturedCol && (
            <div className="flex flex-col gap-3">
              {featured.length > 0 && <p className="pm-eyebrow">{featuredHeading}</p>}
              {featured.map((product) => (
                <Link
                  key={product.slug}
                  href={`/product/${product.slug}`}
                  onClick={onNavigate}
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
              {ctaLabel && (
                <Link
                  href={ctaHref}
                  onClick={onNavigate}
                  className="mt-1 flex h-10 items-center justify-center rounded-lg border border-line-strong text-caption font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-subtle"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavMenu({ item }: { item: ResolvedHeaderStripItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | undefined>(undefined);
  const id = `nav-menu-${item.href.replace(/\W+/g, "-").replace(/^-|-$/g, "") || item.id}`;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const hasDropdown =
    item.ranges.length > 0 || item.middleLinks.length > 0 || item.featured.length > 0 || Boolean(item.ctaLabel);

  const show = () => {
    if (!hasDropdown) return;
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
        aria-expanded={hasDropdown ? open : undefined}
        aria-controls={hasDropdown ? id : undefined}
        className={classNames(
          "relative block whitespace-nowrap rounded-xs px-2 py-1.5 text-[0.6875rem] uppercase tracking-[0.11em] transition-colors focus-visible:ring-surface focus-visible:ring-offset-shell hover:text-shell-on xl:text-[0.75rem] xl:tracking-[0.13em]",
          open && "bg-white/15 text-shell-on",
          !open && (active ? "font-semibold text-shell-on" : "text-shell-on/80")
        )}
      >
        {item.label}
        {active && <span className="absolute inset-x-2 -bottom-px h-[2px] bg-shell-on" aria-hidden />}
      </Link>

      {open && hasDropdown && (
        <NavDropdownPanel
          id={id}
          rangesHeading={item.rangesHeading}
          ranges={item.ranges}
          middleHeading={item.middleHeading}
          middleLinks={item.middleLinks}
          featuredHeading={item.featuredHeading}
          featured={item.featured}
          ctaLabel={item.ctaLabel}
          ctaHref={item.ctaHref}
          onNavigate={close}
        />
      )}
    </div>
  );
}

function MegaMenu({ config }: { config: ResolvedHeaderMegaMenu }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);

  const show = () => {
    window.clearTimeout(timeout.current);
    setOpen((prev) => {
      if (!prev) hoverOpenedAt.current = Date.now();
      return true;
    });
  };
  const hide = () => {
    timeout.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={hide}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="pm-mega"
        onClick={() => {
          if (Date.now() - hoverOpenedAt.current < 250) return;
          setOpen((v) => !v);
        }}
        className={classNames(
          "whitespace-nowrap rounded-xs px-2 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.11em] transition-colors focus-visible:ring-surface focus-visible:ring-offset-shell hover:text-shell-on xl:text-[0.75rem] xl:tracking-[0.13em]",
          open ? "bg-white/15 text-shell-on" : "text-shell-on"
        )}
      >
        {config.label}
      </button>

      {open && (
        <NavDropdownPanel
          id="pm-mega"
          rangesHeading={config.rangesHeading}
          ranges={config.ranges}
          middleHeading={config.middleHeading}
          middleLinks={config.middleLinks}
          featuredHeading={config.featuredHeading}
          featured={config.featured}
          ctaLabel={config.ctaLabel}
          ctaHref={config.ctaHref}
          onNavigate={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function MobileNav({ open, onClose, items }: { open: boolean; onClose: () => void; items: ResolvedHeaderStripItem[] }) {
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
            {items.map((item) => {
              const hasChildren = item.ranges.length > 0;
              const isOpen = expanded === item.id;
              return (
                <li key={item.id} className="border-b border-line">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded((v) => (v === item.id ? null : item.id))}
                        className="flex h-[3.25rem] w-full items-center gap-3 text-body font-medium text-ink"
                      >
                        <LayoutGrid className="size-5 text-muted" aria-hidden />
                        {item.label}
                        <span className={classNames("ml-auto text-muted transition-transform", isOpen && "rotate-90")}>›</span>
                      </button>
                      {isOpen && (
                        <ul className="pb-2">
                          <li>
                            <Link href={item.href} onClick={onClose} className="flex min-h-11 items-center rounded-xs pl-8 pr-2 text-body-sm font-medium text-ink hover:bg-subtle">
                              All {item.label}
                            </Link>
                          </li>
                          {item.ranges.map((sub) => (
                            <li key={`${sub.id}-${sub.href}`}>
                              <Link href={sub.href} onClick={onClose} className="flex min-h-11 items-center rounded-xs pl-8 pr-2 text-body-sm text-muted hover:bg-subtle hover:text-ink">
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} onClick={onClose} className="flex h-[3.25rem] items-center gap-3 text-body font-medium text-ink">
                      <LayoutGrid className="size-5 text-muted" aria-hidden />
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
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
