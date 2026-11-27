import type { Category, Product, Series } from "@/types";

export interface HeaderNavChildItem {
  id: string;
  label: string;
  href: string;
  /** Cloudinary publicId, `/images/...` path, URL, or `product:<slug>`. */
  image: string | null;
  subcategoryId?: string | null;
}

export interface HeaderNavCustomLink {
  id: string;
  label: string;
  subtitle?: string | null;
  href: string;
}

export type HeaderNavMiddleMode = "series" | "custom" | "hidden";
export type HeaderNavRangesMode = "auto" | "custom";

export interface HeaderNavStripItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  categoryId: string | null;
  rangesHeading: string;
  showRanges: boolean;
  rangesMode: HeaderNavRangesMode;
  ranges: HeaderNavChildItem[];
  middleHeading: string;
  middleMode: HeaderNavMiddleMode;
  middleLinks: HeaderNavCustomLink[];
  featuredHeading: string;
  showFeatured: boolean;
  featuredSlugs: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface HeaderNavMegaConfig {
  enabled: boolean;
  label: string;
  rangesHeading: string;
  rangesMode: HeaderNavRangesMode;
  ranges: HeaderNavChildItem[];
  middleHeading: string;
  middleMode: HeaderNavMiddleMode;
  middleLinks: HeaderNavCustomLink[];
  featuredHeading: string;
  showFeatured: boolean;
  featuredSlugs: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface HeaderNavConfig {
  version: 1;
  megaMenu: HeaderNavMegaConfig;
  items: HeaderNavStripItem[];
}

export interface ResolvedHeaderChild {
  id: string;
  label: string;
  href: string;
  image: string | null;
}

export interface ResolvedHeaderMiddleLink {
  id: string;
  label: string;
  subtitle: string | null;
  href: string;
}

export interface ResolvedHeaderStripItem {
  id: string;
  label: string;
  href: string;
  rangesHeading: string;
  ranges: ResolvedHeaderChild[];
  middleHeading: string;
  middleLinks: ResolvedHeaderMiddleLink[];
  featuredHeading: string;
  featured: Product[];
  ctaLabel: string;
  ctaHref: string;
}

export interface ResolvedHeaderMegaMenu {
  enabled: boolean;
  label: string;
  rangesHeading: string;
  ranges: ResolvedHeaderChild[];
  middleHeading: string;
  middleLinks: ResolvedHeaderMiddleLink[];
  featuredHeading: string;
  featured: Product[];
  ctaLabel: string;
  ctaHref: string;
}

export const DEFAULT_STRIP_SPECS: ReadonlyArray<{
  id: string;
  label: string;
  href: string;
  categoryId: string;
  ctaLabel: string;
}> = [
  { id: "white-boards", label: "White Boards", href: "/shop/white-boards", categoryId: "white-boards", ctaLabel: "Browse all white boards" },
  { id: "chalk-boards", label: "Chalk Boards", href: "/shop/chalk-boards", categoryId: "chalk-boards", ctaLabel: "Browse all chalk boards" },
  { id: "notice-boards", label: "Notice Boards", href: "/shop/notice-boards", categoryId: "notice-boards", ctaLabel: "Browse all notice boards" },
  { id: "ceramic-boards", label: "Ceramic Boards", href: "/collections/ceramic-boards", categoryId: "ceramic-boards", ctaLabel: "Browse all ceramic boards" },
  { id: "display-boards", label: "Display Boards", href: "/shop/display-boards", categoryId: "display-boards", ctaLabel: "Browse all display boards" },
  { id: "board-stands", label: "Board Stands", href: "/shop/board-stands", categoryId: "board-stands", ctaLabel: "Browse all board stands" }
];

export function sanitizeNavHref(raw: unknown, fallback = "/shop"): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return fallback;
  if (/^(javascript|data|vbscript):/i.test(value)) return fallback;
  return value;
}

export function makeNavId(seed: string): string {
  const clean = seed
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || `nav-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildDefaultMegaConfig(): HeaderNavMegaConfig {
  return {
    enabled: true,
    label: "All Boards",
    rangesHeading: "Product ranges",
    rangesMode: "auto",
    ranges: [],
    middleHeading: "By series",
    middleMode: "series",
    middleLinks: [],
    featuredHeading: "Start here",
    showFeatured: true,
    featuredSlugs: [],
    ctaLabel: "Browse all products",
    ctaHref: "/shop"
  };
}

export function buildStripItemFromCategory(
  input: { id: string; label: string; href: string; categoryId: string | null; ctaLabel?: string }
): HeaderNavStripItem {
  return {
    id: input.id,
    label: input.label,
    href: input.href,
    visible: true,
    categoryId: input.categoryId,
    rangesHeading: "Product ranges",
    showRanges: true,
    rangesMode: "auto",
    ranges: [],
    middleHeading: "By series",
    middleMode: "series",
    middleLinks: [],
    featuredHeading: "Start here",
    showFeatured: true,
    featuredSlugs: [],
    ctaLabel: input.ctaLabel ?? `Browse all ${input.label.toLowerCase()}`,
    ctaHref: input.href
  };
}

export function buildDefaultHeaderNav(): HeaderNavConfig {
  return {
    version: 1,
    megaMenu: buildDefaultMegaConfig(),
    items: DEFAULT_STRIP_SPECS.map((spec) => buildStripItemFromCategory(spec))
  };
}

function normalizeChildItem(raw: unknown, index: number): HeaderNavChildItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const label = typeof r.label === "string" ? r.label.trim() : "";
  if (!label) return null;
  const href = sanitizeNavHref(r.href, "/shop");
  const id = typeof r.id === "string" && r.id.trim() ? r.id.trim() : `${makeNavId(label)}-${index}`;
  const image = typeof r.image === "string" && r.image.trim() ? r.image.trim() : null;
  const subcategoryId = typeof r.subcategoryId === "string" && r.subcategoryId.trim() ? r.subcategoryId.trim() : null;
  return { id, label, href, image, subcategoryId };
}

function normalizeCustomLink(raw: unknown, index: number): HeaderNavCustomLink | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const label = typeof r.label === "string" ? r.label.trim() : "";
  if (!label) return null;
  const href = sanitizeNavHref(r.href, "/shop");
  const id = typeof r.id === "string" && r.id.trim() ? r.id.trim() : `${makeNavId(label)}-${index}`;
  const subtitle = typeof r.subtitle === "string" && r.subtitle.trim() ? r.subtitle.trim() : null;
  return { id, label, subtitle, href };
}

function normalizeMiddleMode(raw: unknown, fallback: HeaderNavMiddleMode): HeaderNavMiddleMode {
  return raw === "series" || raw === "custom" || raw === "hidden" ? raw : fallback;
}

function normalizeRangesMode(raw: unknown, fallback: HeaderNavRangesMode): HeaderNavRangesMode {
  return raw === "auto" || raw === "custom" ? raw : fallback;
}

function normalizeSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const slug = item.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

function normalizeStripItem(raw: unknown, index: number): HeaderNavStripItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const label = typeof r.label === "string" ? r.label.trim() : "";
  if (!label) return null;
  const href = sanitizeNavHref(r.href, "/shop");
  const id = typeof r.id === "string" && r.id.trim() ? r.id.trim() : `${makeNavId(label)}-${index}`;
  const categoryId = typeof r.categoryId === "string" && r.categoryId.trim() ? r.categoryId.trim() : null;
  const ranges = Array.isArray(r.ranges)
    ? r.ranges.map((entry, idx) => normalizeChildItem(entry, idx)).filter((x): x is HeaderNavChildItem => Boolean(x))
    : [];
  const middleLinks = Array.isArray(r.middleLinks)
    ? r.middleLinks.map((entry, idx) => normalizeCustomLink(entry, idx)).filter((x): x is HeaderNavCustomLink => Boolean(x))
    : [];

  return {
    id,
    label,
    href,
    visible: r.visible !== false,
    categoryId,
    rangesHeading: typeof r.rangesHeading === "string" && r.rangesHeading.trim() ? r.rangesHeading.trim() : "Product ranges",
    showRanges: r.showRanges !== false,
    rangesMode: normalizeRangesMode(r.rangesMode, categoryId ? "auto" : "custom"),
    ranges,
    middleHeading: typeof r.middleHeading === "string" && r.middleHeading.trim() ? r.middleHeading.trim() : "By series",
    middleMode: normalizeMiddleMode(r.middleMode, "series"),
    middleLinks,
    featuredHeading: typeof r.featuredHeading === "string" && r.featuredHeading.trim() ? r.featuredHeading.trim() : "Start here",
    showFeatured: r.showFeatured !== false,
    featuredSlugs: normalizeSlugs(r.featuredSlugs),
    ctaLabel: typeof r.ctaLabel === "string" ? r.ctaLabel.trim() : "",
    ctaHref: sanitizeNavHref(r.ctaHref, href)
  };
}

function normalizeMegaConfig(raw: unknown): HeaderNavMegaConfig {
  const def = buildDefaultMegaConfig();
  if (!raw || typeof raw !== "object") return def;
  const r = raw as Record<string, unknown>;
  const ranges = Array.isArray(r.ranges)
    ? r.ranges.map((entry, idx) => normalizeChildItem(entry, idx)).filter((x): x is HeaderNavChildItem => Boolean(x))
    : def.ranges;
  const middleLinks = Array.isArray(r.middleLinks)
    ? r.middleLinks.map((entry, idx) => normalizeCustomLink(entry, idx)).filter((x): x is HeaderNavCustomLink => Boolean(x))
    : def.middleLinks;

  return {
    enabled: r.enabled !== false,
    label: typeof r.label === "string" && r.label.trim() ? r.label.trim() : def.label,
    rangesHeading: typeof r.rangesHeading === "string" && r.rangesHeading.trim() ? r.rangesHeading.trim() : def.rangesHeading,
    rangesMode: normalizeRangesMode(r.rangesMode, def.rangesMode),
    ranges,
    middleHeading: typeof r.middleHeading === "string" && r.middleHeading.trim() ? r.middleHeading.trim() : def.middleHeading,
    middleMode: normalizeMiddleMode(r.middleMode, def.middleMode),
    middleLinks,
    featuredHeading: typeof r.featuredHeading === "string" && r.featuredHeading.trim() ? r.featuredHeading.trim() : def.featuredHeading,
    showFeatured: r.showFeatured !== false,
    featuredSlugs: normalizeSlugs(r.featuredSlugs),
    ctaLabel: typeof r.ctaLabel === "string" ? r.ctaLabel.trim() : def.ctaLabel,
    ctaHref: sanitizeNavHref(r.ctaHref, def.ctaHref)
  };
}

/** Validates and normalizes `site_content.header_nav` JSON, falling back safely to defaults when invalid. */
export function normalizeHeaderNav(raw: unknown): HeaderNavConfig {
  const def = buildDefaultHeaderNav();
  if (!raw || typeof raw !== "object") return def;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.items)) return def;

  const items = r.items
    .map((entry, index) => normalizeStripItem(entry, index))
    .filter((x): x is HeaderNavStripItem => Boolean(x));

  return {
    version: 1,
    megaMenu: normalizeMegaConfig(r.megaMenu),
    items
  };
}

function subcategoryImage(subId: string, fallback: string | null, products: Product[]): string | null {
  const product = products.find((item) => item.subcategoryIds.includes(subId) && item.media[0]);
  return product?.media[0]?.publicId ?? fallback;
}

/** Expands all automatic child links for a category (or `ceramic-boards` virtual collection). */
export function autoRangesForCategory(
  categoryId: string | null,
  categories: Category[],
  products: Product[]
): HeaderNavChildItem[] {
  if (!categoryId) return [];
  if (categoryId === "ceramic-boards") {
    return categories.flatMap((category) =>
      category.subcategories
        .filter((sub) => sub.id.endsWith("-ceramic"))
        .map((sub) => ({
          id: sub.id,
          label: sub.name,
          href: `/shop/${category.slug}/${sub.id}`,
          image: subcategoryImage(sub.id, sub.image, products),
          subcategoryId: sub.id
        }))
    );
  }
  const category = categories.find((c) => c.id === categoryId || c.slug === categoryId);
  if (!category) return [];
  return category.subcategories.map((sub) => ({
    id: sub.id,
    label: sub.name,
    href: `/shop/${category.slug}/${sub.id}`,
    image: subcategoryImage(sub.id, sub.image, products),
    subcategoryId: sub.id
  }));
}

/** Expands all automatic top-level categories for the MegaMenu's "Product ranges" grid. */
export function autoMegaCategories(categories: Category[]): HeaderNavChildItem[] {
  return categories.map((c) => ({
    id: c.id,
    label: c.name,
    href: `/shop/${c.slug}`,
    image: c.image,
    subcategoryId: null
  }));
}

function resolveImageRef(ref: string | null, products: Product[]): string | null {
  if (!ref) return null;
  if (ref.startsWith("product:")) {
    const slug = ref.slice("product:".length).trim();
    const matched = products.find((p) => p.slug === slug);
    return matched?.media[0]?.publicId ?? null;
  }
  return ref;
}

function resolveMiddleLinks(
  mode: HeaderNavMiddleMode,
  customLinks: HeaderNavCustomLink[],
  seriesList: Series[]
): ResolvedHeaderMiddleLink[] {
  if (mode === "hidden") return [];
  if (mode === "custom") {
    return customLinks.map((link) => ({
      id: link.id,
      label: link.label,
      subtitle: link.subtitle ?? null,
      href: link.href
    }));
  }
  return seriesList.map((s) => ({
    id: s.id,
    label: s.name,
    subtitle: s.surface,
    href: `/shop?series=${s.id}`
  }));
}

function autoFeaturedProducts(categoryId: string | null, products: Product[]): Product[] {
  if (categoryId === "ceramic-boards") {
    return products
      .filter((product) => product.media[0] && product.subcategoryIds.some((id) => id.endsWith("-ceramic")))
      .slice(0, 2);
  }
  if (categoryId) {
    const inCategory = products.filter((product) => product.categoryId === categoryId && product.media[0]).slice(0, 2);
    if (inCategory.length > 0) return inCategory;
  }
  return products.filter((product) => product.featured).slice(0, 2);
}

function resolveFeaturedProducts(
  showFeatured: boolean,
  slugs: string[],
  categoryId: string | null,
  products: Product[],
  allowGlobalFallback: boolean
): Product[] {
  if (!showFeatured) return [];
  if (slugs.length > 0) {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return slugs.map((slug) => bySlug.get(slug)).filter((p): p is Product => Boolean(p));
  }
  if (!categoryId && !allowGlobalFallback) return [];
  return autoFeaturedProducts(categoryId, products);
}

function resolveRangesList(
  showRanges: boolean,
  mode: HeaderNavRangesMode,
  autoItems: HeaderNavChildItem[],
  customItems: HeaderNavChildItem[],
  products: Product[]
): ResolvedHeaderChild[] {
  if (!showRanges) return [];
  const merged =
    mode === "auto"
      ? [
          ...autoItems,
          ...customItems.filter((custom) => !autoItems.some((auto) => auto.href === custom.href || auto.id === custom.id))
        ]
      : customItems;

  return merged.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    image: resolveImageRef(item.image, products)
  }));
}

export function resolveHeaderNav(
  config: HeaderNavConfig,
  catalog: { categories: Category[]; seriesList: Series[]; products: Product[] }
): {
  megaMenu: ResolvedHeaderMegaMenu;
  items: ResolvedHeaderStripItem[];
} {
  const { categories, seriesList, products } = catalog;
  const megaAuto = autoMegaCategories(categories);

  const megaMenu: ResolvedHeaderMegaMenu = {
    enabled: config.megaMenu.enabled,
    label: config.megaMenu.label,
    rangesHeading: config.megaMenu.rangesHeading,
    ranges: resolveRangesList(true, config.megaMenu.rangesMode, megaAuto, config.megaMenu.ranges, products),
    middleHeading: config.megaMenu.middleHeading,
    middleLinks: resolveMiddleLinks(config.megaMenu.middleMode, config.megaMenu.middleLinks, seriesList),
    featuredHeading: config.megaMenu.featuredHeading,
    featured: resolveFeaturedProducts(
      config.megaMenu.showFeatured,
      config.megaMenu.featuredSlugs,
      null,
      products,
      true
    ),
    ctaLabel: config.megaMenu.ctaLabel,
    ctaHref: config.megaMenu.ctaHref
  };

  const items: ResolvedHeaderStripItem[] = config.items
    .filter((item) => item.visible)
    .map((item) => {
      const autoRanges = autoRangesForCategory(item.categoryId, categories, products);
      return {
        id: item.id,
        label: item.label,
        href: item.href,
        rangesHeading: item.rangesHeading,
        ranges: resolveRangesList(item.showRanges, item.rangesMode, autoRanges, item.ranges, products),
        middleHeading: item.middleHeading,
        middleLinks: resolveMiddleLinks(item.middleMode, item.middleLinks, seriesList),
        featuredHeading: item.featuredHeading,
        featured: resolveFeaturedProducts(
          item.showFeatured,
          item.featuredSlugs,
          item.categoryId,
          products,
          false
        ),
        ctaLabel: item.ctaLabel,
        ctaHref: item.ctaHref
      };
    });

  return { megaMenu, items };
}
