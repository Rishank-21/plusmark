import type { Metadata } from "next";
import { Listing } from "@/components/commerce/Listing";
import { categories, products } from "@/lib/catalog";
import { filterProducts, sortProducts } from "@/lib/filters";
import { clampPage, parseFilters, parsePage, parseSort, toParams } from "@/lib/listing-query";
import { META_TITLE_SUFFIX } from "@/lib/config";

export const metadata: Metadata = {
  title: `Shop all boards${META_TITLE_SUFFIX}`,
  description:
    "Browse the full Plusmark catalogue — white boards, chalk boards, notice boards, ceramic and display boards, stands, clipboards and school benches, made to order in Ahmedabad and dispatched across India."
};

const PER_PAGE = 12;

export default async function ShopAllPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = toParams(await searchParams);
  // The category is chosen from the sidebar and navigates to /shop/[category],
  // so the all-products view never carries a category of its own.
  const filters = { ...parseFilters(params), categoryId: null, subcategoryId: null };
  const sort = parseSort(params.get("sort"));

  const all = sortProducts(filterProducts(filters), sort);
  const page = clampPage(parsePage(params.get("page")), all.length, PER_PAGE);

  return (
    <Listing
      basePath="/shop"
      filters={filters}
      sort={sort}
      page={page}
      perPage={PER_PAGE}
      results={all.slice((page - 1) * PER_PAGE, page * PER_PAGE)}
      total={all.length}
      heading="Shop all products"
      description={`${products.length} products across ${categories.length} ranges, from 1 × 1 ft desk boards to 8 × 4 ft lecture halls. Every board is made to order — ask Plusmark about any size that is not listed.`}
      trail={[{ label: "Home", href: "/" }, { label: "Shop" }]}
    />
  );
}
