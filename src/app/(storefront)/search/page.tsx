import type { Metadata } from "next";
import { Listing } from "@/components/commerce/Listing";
import { filterProducts, sortProducts } from "@/lib/filters";
import { clampPage, parseFilters, parsePage, parseSort, toParams } from "@/lib/listing-query";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  path: "/search",
  description: "Search the Plusmark catalogue by product name, series, board type, size or SKU.",
  noindex: true
});

const PER_PAGE = 12;

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = toParams(await searchParams);
  const filters = parseFilters(raw);
  const sort = parseSort(raw.get("sort"));

  const all = sortProducts(filterProducts(filters), sort);
  const page = clampPage(parsePage(raw.get("page")), all.length, PER_PAGE);
  const query = filters.query.trim();

  return (
    <Listing
      basePath="/search"
      filters={filters}
      sort={sort}
      page={page}
      perPage={PER_PAGE}
      results={all.slice((page - 1) * PER_PAGE, page * PER_PAGE)}
      total={all.length}
      heading={query ? `Results for “${query}”` : "Search the catalogue"}
      description={
        query
          ? "Matching product names, series, surfaces, sizes and SKUs across the Plusmark catalogue."
          : "Type a product name, series, board type, size or SKU to search the catalogue."
      }
      trail={[{ label: "Home", href: "/" }, { label: "Search" }]}
    />
  );
}
