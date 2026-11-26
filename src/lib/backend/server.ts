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

import { applyLiveCatalog, buildLiveCatalog, type LiveCatalog, type LiveRow } from "@/lib/catalog";

const PRODUCT_COLUMNS =
  "slug,name,category_id,series_id,subcategory_ids,surface,frame,corners,magnetic,double_sided,board_type,surface_kind,usage,blurb,description,features,specs,customisation,video_id,price_mode,gst_rate,hsn_code,bulk_suggestion_quantity,enquiry_only,needs_data,featured,created_at," +
  "product_media(public_id,alt,width,height,source,sort_order)," +
  "product_variants(id,sku,external_ref,title,options,price_mode,price_inr,compare_at_inr,stock,track_inventory,allow_backorder,available,lead_time_days,pack_qty,sort_order)";

let liveCache: { at: number; live: LiveCatalog | null } | null = null;
let liveInflight: Promise<LiveCatalog | null> | null = null;

/**
 * Loads what the admin published (prices, visibility, new products) and applies it to the in-memory catalogue.
 * Cached for 30 seconds per server instance. Returns null, and leaves the built-in catalogue untouched, when
 * the backend is not configured or cannot be reached.
 */
export async function ensureLiveCatalog(): Promise<LiveCatalog | null> {
  if (!isSupabaseConfigured) return null;
  if (liveCache && Date.now() - liveCache.at < 30_000) return liveCache.live;
  if (liveInflight) return liveInflight;
  liveInflight = (async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=${PRODUCT_COLUMNS}&published=eq.true&deleted_at=is.null&limit=1000`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, cache: "no-store" }
      );
      if (!res.ok) return liveCache?.live ?? null;
      const live = buildLiveCatalog((await res.json()) as LiveRow[]);
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
