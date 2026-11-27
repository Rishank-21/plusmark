/**
 * Server-side reads from the Plusmark backend (Supabase). Used by server components only.
 * Every function degrades to `null` when the backend is not configured or unreachable, so the
 * storefront keeps rendering from its built-in catalogue.
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

export interface ProductRelations {
  /** Slugs picked in the admin for the "Compare with similar products" table. */
  compare: string[];
  /** Slugs for "You may also like": admin picks first, then what other customers bought together. */
  alsoBought: string[];
}

export async function fetchRelations(slug: string, limit = 6): Promise<ProductRelations | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_product_relations`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_slug: slug, p_limit: limit }),
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { compare?: string[]; also_bought?: string[] };
    return { compare: body.compare ?? [], alsoBought: body.also_bought ?? [] };
  } catch {
    return null;
  }
}

/* ------------------------------ live catalogue ------------------------------ */

import { applyLiveCatalog, buildLiveCatalog, type LiveCatalog, type LiveCategoryRow, type LiveRow } from "@/lib/catalog";
import { normalizeHeaderNav, type HeaderNavConfig } from "@/lib/header-nav";
import { normalizeHeroConfig, type HeroSectionConfig } from "@/lib/hero-content";
import { normalizeStorefrontTheme, type StorefrontThemeConfig } from "@/lib/storefront-theme";

const PRODUCT_COLUMNS =
  "slug,name,category_id,series_id,subcategory_ids,surface,frame,corners,magnetic,double_sided,board_type,surface_kind,usage,blurb,description,features,specs,customisation,video_id,price_mode,gst_rate,hsn_code,bulk_suggestion_quantity,enquiry_only,needs_data,featured,created_at," +
  "product_media(public_id,alt,width,height,source,sort_order)," +
  "product_variants(id,sku,external_ref,title,options,price_mode,price_inr,compare_at_inr,stock,track_inventory,allow_backorder,available,lead_time_days,pack_qty,sort_order)";

let liveCache: { at: number; live: LiveCatalog | null } | null = null;
let liveInflight: Promise<LiveCatalog | null> | null = null;
let navCache: { at: number; nav: HeaderNavConfig | null } | null = null;
let navInflight: Promise<HeaderNavConfig | null> | null = null;
let themeCache: { at: number; theme: StorefrontThemeConfig | null } | null = null;
let themeInflight: Promise<StorefrontThemeConfig | null> | null = null;
let heroCache: { at: number; hero: HeroSectionConfig | null } | null = null;
let heroInflight: Promise<HeroSectionConfig | null> | null = null;

/**
 * Loads what the admin published (prices, visibility, categories, new products) and applies it to the in-memory catalogue.
 * Cached briefly per server instance. Returns null, and leaves the built-in catalogue untouched, when
 * the backend is not configured or cannot be reached.
 */
export async function ensureLiveCatalog(): Promise<LiveCatalog | null> {
  if (!isSupabaseConfigured) return null;
  if (liveCache && Date.now() - liveCache.at < 15_000) return liveCache.live;
  if (liveInflight) return liveInflight;
  liveInflight = (async () => {
    try {
      const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/products?select=${PRODUCT_COLUMNS}&published=eq.true&deleted_at=is.null&limit=1000`,
          { headers, cache: "no-store", signal: AbortSignal.timeout(2500) }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=id,parent_id,name,description,subject,image,sort_order,active&active=eq.true&order=sort_order.asc&limit=500`,
          { headers, cache: "no-store", signal: AbortSignal.timeout(2500) }
        ).catch(() => null)
      ]);
      if (!productsRes.ok) return liveCache?.live ?? null;
      const productRows = (await productsRes.json()) as LiveRow[];
      const categoryRows = categoriesRes && categoriesRes.ok ? ((await categoriesRes.json()) as LiveCategoryRow[]) : undefined;
      const live = buildLiveCatalog(productRows, categoryRows);
      applyLiveCatalog(live);
      liveCache = { at: Date.now(), live };
      return live;
    } catch {
      return liveCache?.live ?? null;
    } finally {
      liveInflight = null;
    }
  })();
  return liveInflight;
}

/** Reads `site_content.header_nav` saved by Admin, returning null cleanly when unset or offline. */
export async function ensureHeaderNav(): Promise<HeaderNavConfig | null> {
  if (!isSupabaseConfigured) return null;
  if (navCache && Date.now() - navCache.at < 1_000) return navCache.nav;
  if (navInflight) return navInflight;
  navInflight = (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_content?select=value&key=eq.header_nav&limit=1`,
        {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          cache: "no-store",
          signal: AbortSignal.timeout(2500)
        }
      );
      if (!res.ok) return navCache?.nav ?? null;
      const rows = (await res.json()) as { value?: unknown }[];
      const nav = rows?.[0]?.value ? normalizeHeaderNav(rows[0].value) : null;
      navCache = { at: Date.now(), nav };
      return nav;
    } catch {
      return navCache?.nav ?? null;
    } finally {
      navInflight = null;
    }
  })();
  return navInflight;
}

/** Reads `site_content.storefront_theme` saved by Admin, returning null cleanly when unset or offline. */
export async function ensureStorefrontTheme(): Promise<StorefrontThemeConfig | null> {
  if (!isSupabaseConfigured) return null;
  if (themeCache && Date.now() - themeCache.at < 1_000) return themeCache.theme;
  if (themeInflight) return themeInflight;
  themeInflight = (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_content?select=value&key=eq.storefront_theme&limit=1`,
        {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          cache: "no-store",
          signal: AbortSignal.timeout(2500)
        }
      );
      if (!res.ok) return themeCache?.theme ?? null;
      const rows = (await res.json()) as { value?: unknown }[];
      const theme = rows?.[0]?.value ? normalizeStorefrontTheme(rows[0].value) : null;
      themeCache = { at: Date.now(), theme };
      return theme;
    } catch {
      return themeCache?.theme ?? null;
    } finally {
      themeInflight = null;
    }
  })();
  return themeInflight;
}

/** Reads `site_content.hero_config` saved by Admin, returning null cleanly when unset or offline. */
export async function ensureHeroConfig(): Promise<HeroSectionConfig | null> {
  if (!isSupabaseConfigured) return null;
  if (heroCache && Date.now() - heroCache.at < 1_000) return heroCache.hero;
  if (heroInflight) return heroInflight;
  heroInflight = (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_content?select=value&key=eq.hero_config&limit=1`,
        {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          cache: "no-store",
          signal: AbortSignal.timeout(2500)
        }
      );
      if (!res.ok) return heroCache?.hero ?? null;
      const rows = (await res.json()) as { value?: unknown }[];
      const hero = rows?.[0]?.value ? normalizeHeroConfig(rows[0].value) : null;
      heroCache = { at: Date.now(), hero };
      return hero;
    } catch {
      return heroCache?.hero ?? null;
    } finally {
      heroInflight = null;
    }
  })();
  return heroInflight;
}
