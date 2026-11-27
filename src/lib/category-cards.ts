import type { Category, Product } from "@/types";

export interface ShopCategorySummary {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  productCount: number;
  minPriceInr: number | null;
}

/**
 * Derives lightweight, strictly factual storefront summaries for each category
 * from the active catalogue: live model counts, first fallback photo if no
 * dedicated category image is set, and the lowest fixed single-unit price.
 */
export function buildShopCategoryItems(
  categoryList: readonly Category[],
  productList: readonly Product[]
): ShopCategorySummary[] {
  const counts = new Map<string, number>();
  const minPrices = new Map<string, number>();
  const fallbackImages = new Map<string, string>();

  for (const product of productList) {
    if (!product.published) continue;
    const catId = product.categoryId;
    counts.set(catId, (counts.get(catId) ?? 0) + 1);

    if (!fallbackImages.has(catId) && product.media[0]?.publicId) {
      fallbackImages.set(catId, product.media[0].publicId);
    }

    if (product.enquiryOnly) continue;
    for (const variant of product.variants) {
      if (!variant.available || (variant.packQty ?? 1) > 1 || variant.priceInr === null) continue;
      const existing = minPrices.get(catId);
      if (existing === undefined || variant.priceInr < existing) {
        minPrices.set(catId, variant.priceInr);
      }
    }
  }

  return categoryList.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    image: category.image ?? fallbackImages.get(category.id) ?? null,
    productCount: counts.get(category.id) ?? 0,
    minPriceInr: minPrices.get(category.id) ?? null
  }));
}
