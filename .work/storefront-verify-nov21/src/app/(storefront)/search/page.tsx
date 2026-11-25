import type { Metadata } from "next";
import { Listing } from "@/components/commerce/Listing";
import { products } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  path: "/search",
  description: "Search the Plusmark catalogue by product name, series, board type, size or SKU.",
  noindex: true
});

const PER_PAGE = 12;

export const dynamic = "force-static";

export default function SearchPage() {
  return (
    <Listing
      basePath="/search"
      catalog={products}
      perPage={PER_PAGE}
      heading="Search the catalogue"
      description="Type a product name, series, board type, size or SKU to search the catalogue."
      trail={[{ label: "Home", href: "/" }, { label: "Search" }]}
    />
  );
}
