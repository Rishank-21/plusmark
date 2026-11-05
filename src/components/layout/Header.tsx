"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { categories, products, seriesList } from "@/lib/catalog";
import { searchCatalog } from "@/lib/filters";
import { imageUrl } from "@/lib/media";
import { STORAGE_KEYS } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readJson, writeJson } from "@/lib/storage";
import { classNames } from "@/lib/format";
import { useCart } from "@/state/cart";
import { useWishlist } from "@/state/wishlist";
import { useSession } from "@/state/session";
import { ProductImage } from "@/components/ui/ProductImage";
import type { SearchSuggestion } from "@/types";

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
    <div className="bg-brand text-white">
      <p className="pm-shell py-1.5 text-center text-[0.625rem] font-medium uppercase tracking-[0.06em] text-white/90 sm:py-2 sm:text-[0.6875rem] sm:tracking-[0.14em]">
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();
  const session = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div className={classNames("border-b border-hair bg-surface transition-shadow", scrolled && "shadow-card")}>
        <div className="pm-shell flex h-20 items-center gap-3 lg:h-24 lg:gap-7">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-xs text-ink hover:bg-sand lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Link href="/" className="flex shrink-0 items-center rounded-xs" aria-label="Plusmark Retail home">
            <Image
              src="/images/plusmark/brand/plusmark-retail.png"
              alt="Plusmark Retail"
              width={1375}
              height={480}
              className="h-12 w-auto lg:h-16"
              priority
            />
          </Link>

          <SearchPanel id="desktop-search" className="hidden min-w-0 flex-1 lg:block" />

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0 lg:gap-4">
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

        <div className="pm-shell pb-3 lg:hidden">
          <SearchPanel id="mobile-search" />
        </div>

        <nav aria-label="Product navigation" className="hidden border-t border-hair lg:block">
          <div className="pm-shell">
            <div className="relative flex h-16 items-center gap-1">
              <MegaMenu />
              {NAV_LINKS.map((link) => (
                <NavMenu key={link.href} item={link} />
              ))}
            </div>
          </div>
        </nav>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <span className="tabular absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-blue px-1 text-[0.625rem] font-semibold leading-4 text-white">
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
    "relative flex h-11 items-center justify-center gap-2 rounded-md px-3 text-caption font-medium text-navy transition-colors hover:bg-blue-wash hover:text-blue-deep lg:h-10 lg:px-2.5",
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
          "relative block rounded-xs px-3 py-2 text-body-sm font-medium transition-colors hover:text-navy-deep",
          open && "bg-blue-wash text-blue-deep",
          !open && (active ? "text-ink" : "text-graphite")
        )}
      >
        {item.label}
        {active && <span className="absolute inset-x-3 -bottom-px h-px bg-blue" aria-hidden />}
      </Link>

      {open && (
        <div
          id={id}
          className={classNames(
            "absolute left-0 top-full z-50 pt-1",
            hasRanges ? "w-[min(64rem,92vw)]" : "w-[min(44rem,92vw)]"
          )}
        >
          <div className="rounded-md border border-hair bg-canvas p-6 shadow-lift animate-fade-up">
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
                          className="flex items-center gap-2.5 rounded-xs px-2 py-1.5 transition-colors hover:bg-sand"
                        >
                          <span className="size-8 shrink-0 overflow-hidden rounded-xs bg-sand/70">
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
                        className="flex flex-col rounded-xs px-2 py-1.5 transition-colors hover:bg-sand"
                      >
                        <span className="text-body-sm font-medium text-ink">{series.name}</span>
                        <span className="text-caption leading-snug text-graphite">{series.surface}</span>
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
                    className="group flex items-center gap-3 rounded-lg border border-hair bg-surface p-2 transition-colors hover:border-hair-strong"
                  >
                    <span className="size-14 shrink-0 overflow-hidden rounded-xs border border-hair bg-surface">
                      <ProductImage
                        asset={product.media[0] ?? null}
                        name={product.name}
                        categoryId={product.categoryId}
                        sizes="56px"
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-body-sm font-medium text-ink group-hover:text-navy-deep">{product.name}</span>
                      <span className="text-caption text-graphite">View product</span>
                    </span>
                  </Link>
                ))}
                <Link
                  href={item.href}
                  onClick={close}
                  className="mt-1 flex h-10 items-center justify-center rounded-lg border border-hair-strong text-caption font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-sand"
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
          "rounded-xs px-3 py-2 text-body-sm font-medium transition-colors hover:text-navy-deep",
          open ? "bg-blue-wash text-blue-deep" : "text-navy"
        )}
      >
        Shop All Boards
      </button>

      {open && (
        <div id="pm-mega" className="absolute left-0 top-full z-50 w-[min(64rem,92vw)] pt-1">
          <div className="rounded-md border border-hair bg-canvas p-6 shadow-lift animate-fade-up">
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
                        className="flex flex-col rounded-xs px-2 py-1.5 transition-colors hover:bg-sand"
                      >
                        <span className="text-body-sm font-medium text-ink">{s.name}</span>
                        <span className="text-caption leading-snug text-graphite">{s.surface}</span>
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
                    className="group flex items-center gap-3 rounded-lg border border-hair bg-surface p-2 transition-colors hover:border-hair-strong"
                  >
                    <span className="size-14 shrink-0 overflow-hidden rounded-xs border border-hair bg-surface">
                      <ProductImage
                        asset={p.media[0] ?? null}
                        name={p.name}
                        categoryId={p.categoryId}
                        sizes="56px"
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-body-sm font-medium text-ink group-hover:text-navy-deep">{p.name}</span>
                      <span className="text-caption text-graphite">View product</span>
                    </span>
                  </Link>
                ))}
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex h-10 items-center justify-center rounded-lg border border-hair-strong text-caption font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-sand"
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
      className="flex items-center gap-2.5 rounded-xs px-2 py-1.5 transition-colors hover:bg-sand"
    >
      <span className="size-7 shrink-0 overflow-hidden rounded-xs bg-sand/70">
        {category.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(category.image, { fit: "fill", width: 56, height: 56 })} alt="" className="size-full object-cover" loading="lazy" />
        )}
      </span>
      <span className="text-body-sm text-ink">{category.name}</span>
    </Link>
  );
}

function SearchPanel({ id, className }: { id: string; className?: string }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (expanded) setRecent(readJson<string[]>(STORAGE_KEYS.recentSearches, []));
  }, [expanded]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(query.trim());
      setLoading(query.trim().length > 0);
    }, 180);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;
    const id = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(id);
  }, [debounced]);

  const suggestions = useMemo(() => (debounced ? searchCatalog(debounced) : []), [debounced]);
  useEffect(() => setActiveIndex(-1), [debounced]);

  const commit = (suggestion?: SearchSuggestion) => {
    const term = suggestion?.label ?? debounced;
    if (term) {
      setRecent((current) => [term, ...current.filter((t) => t !== term)].slice(0, 6));
      writeJson(STORAGE_KEYS.recentSearches, [term, ...recent.filter((t) => t !== term)].slice(0, 6));
    }
    setExpanded(false);
    inputRef.current?.blur();
    if (suggestion) {
      router.push(suggestion.href);
      return;
    }
    if (debounced) router.push(`/search?q=${encodeURIComponent(debounced)}`);
  };

  return (
    <div
      className={classNames("relative min-w-0", className)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(activeIndex >= 0 ? suggestions[activeIndex] : undefined);
        }}
        role="search"
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-graphite" aria-hidden />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") {
              setExpanded(false);
              inputRef.current?.blur();
            }
          }}
          type="search"
          role="combobox"
          aria-haspopup="listbox"
          placeholder="Search boards, sizes, series or SKU"
          aria-label="Search products"
          aria-expanded={expanded}
          aria-controls={id}
          aria-autocomplete="list"
          className="h-12 w-full rounded-full border border-hair-strong bg-canvas/55 pl-10 pr-10 text-body-sm text-ink placeholder:text-graphite focus:border-hair-strong focus:bg-surface focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-graphite hover:bg-sand hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </form>

      {expanded && (
        <div id={id} className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[70] rounded-lg border border-hair bg-surface p-4 shadow-lift" role="listbox" aria-label="Search suggestions">
          {loading && (
            <ul className="flex flex-col gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="pm-skeleton h-12 rounded-xs" />
              ))}
            </ul>
          )}

          {!loading && !debounced && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="pm-eyebrow mr-1">Recent</p>
              {recent.length === 0 ? (
                <p className="text-caption text-graphite">Nothing searched yet. Try “8 x 4 ft”, “magnetic” or “clipboard”.</p>
              ) : (
                recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="h-8 rounded-full border border-hair px-3 text-caption text-graphite transition-colors hover:border-hair-strong hover:text-ink"
                  >
                    {term}
                  </button>
                ))
              )}
            </div>
          )}

          {!loading && debounced && suggestions.length === 0 && (
            <div className="rounded-sm border border-dashed border-hair-strong bg-sand/40 p-5">
              <p className="font-display text-h4">No matches for “{debounced}”.</p>
              <p className="mt-1 text-body-sm text-graphite">
                Plusmark makes boards to order in non-standard sizes. Check the spelling, use a shorter word, or ask the
                Plusmark team about what you need.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/shop" className="h-9 rounded-xs border border-hair-strong px-3 text-caption font-medium text-ink transition-colors hover:bg-sand">
                  Browse all products
                </Link>
                <Link href="/contact" className="h-9 rounded-xs border border-hair-strong px-3 text-caption font-medium text-ink transition-colors hover:bg-sand">
                  Ask about this product
                </Link>
              </div>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <ul className="max-h-[22rem] divide-y divide-hair overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={`${s.kind}-${s.href}`} role="option" aria-selected={i === activeIndex}>
                  <Link
                    href={s.href}
                    onClick={() => commit(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={classNames(
                      "flex items-center gap-3 px-1 py-2.5 transition-colors",
                      i === activeIndex ? "bg-sand/70" : "hover:bg-sand/40"
                    )}
                  >
                    <span className="size-11 shrink-0 overflow-hidden rounded-xs bg-sand/70">
                      {s.imagePublicId && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl(
                            s.imagePublicId,
                            s.kind === "product"
                              ? { fit: "scale", width: 88 }
                              : { fit: "fill", width: 88, height: 88 }
                          )}
                          alt=""
                          className={classNames("size-full", s.kind === "product" ? "object-contain" : "object-cover")}
                          loading="lazy"
                        />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-body-sm font-medium text-ink">{s.label}</span>
                      <span className="truncate text-caption text-graphite">
                        {s.kind === "product" ? s.sublabel : s.kind === "category" ? `Category · ${s.sublabel}` : `Series · ${s.sublabel}`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => commit()}
                  className="w-full rounded-xs border border-hair px-3 py-2 text-caption font-medium text-graphite transition-colors hover:border-hair-strong hover:text-ink"
                >
                  See all results for “{debounced}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
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
      <div className="absolute inset-0 bg-navy-deep/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col bg-canvas shadow-drawer animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-hair px-4 py-3">
          <p className="pm-eyebrow">Menu</p>
          <button type="button" onClick={onClose} aria-label="Close menu" className="-mr-2 flex size-11 items-center justify-center rounded-xs text-graphite hover:bg-sand hover:text-ink">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col">
            <li className="border-b border-hair">
              <Link href="/shop" onClick={onClose} className="flex h-12 items-center justify-between text-body font-medium text-ink">
                Shop all products
              </Link>
            </li>
            <li className="border-b border-hair">
              <button
                type="button"
                aria-expanded={expanded === "cats"}
                onClick={() => setExpanded((v) => (v === "cats" ? null : "cats"))}
                className="flex h-12 w-full items-center justify-between text-body font-medium text-ink"
              >
                Categories
                <span className={classNames("text-graphite transition-transform", expanded === "cats" && "rotate-90")}>›</span>
              </button>
              {expanded === "cats" && (
                <ul className="pb-3">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/shop/${c.slug}`} onClick={onClose} className="flex min-h-11 items-center rounded-xs px-2 text-body-sm text-graphite hover:bg-sand hover:text-ink">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="border-b border-hair">
              <button
                type="button"
                aria-expanded={expanded === "series"}
                onClick={() => setExpanded((v) => (v === "series" ? null : "series"))}
                className="flex h-12 w-full items-center justify-between text-body font-medium text-ink"
              >
                Series
                <span className={classNames("text-graphite transition-transform", expanded === "series" && "rotate-90")}>›</span>
              </button>
              {expanded === "series" && (
                <ul className="pb-3">
                  {seriesList.map((s) => (
                    <li key={s.id}>
                      <Link href={`/shop?series=${s.id}`} onClick={onClose} className="flex min-h-11 items-center rounded-xs px-2 text-body-sm text-graphite hover:bg-sand hover:text-ink">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className="border-b border-hair">
              <Link href="/collections" onClick={onClose} className="flex h-12 items-center text-body font-medium text-ink">Collections</Link>
            </li>
            <li className="border-b border-hair">
              <Link href="/wishlist" onClick={onClose} className="flex h-12 items-center justify-between text-body font-medium text-ink">
                Wishlist
                {wishlist.slugs.length > 0 && <span className="tabular text-caption text-graphite">{wishlist.slugs.length} saved</span>}
              </Link>
            </li>
            <li className="border-b border-hair">
              <Link href="/account" onClick={onClose} className="flex h-12 items-center text-body font-medium text-ink">My account</Link>
            </li>
            <li>
              <Link href="/contact" onClick={onClose} className="flex h-12 items-center text-body font-medium text-ink">Support</Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-hair p-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              cart.openDrawer();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue text-body-sm font-medium text-white"
          >
            <ShoppingCart className="size-4" aria-hidden />
            Cart{cart.count > 0 && ` · ${cart.count}`}
          </button>
        </div>
      </div>
    </div>
  );
}
