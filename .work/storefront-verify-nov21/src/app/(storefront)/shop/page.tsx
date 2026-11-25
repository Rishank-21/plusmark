import type { Metadata } from "next";
import { Listing } from "@/components/commerce/Listing";
import { categories, products } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop all boards",
  path: "/shop",
  description:
    "Browse the full Plusmark catalogue — white boards, chalk boards, notice boards, ceramic and display boards, stands, clipboards and school benches, made to order in Ahmedabad and dispatched across India."
});

const PER_PAGE = 12;

export const dynamic = "force-static";

export default function ShopAllPage() {

  return (
    <Listing
      basePath="/shop"
      catalog={products}
      perPage={PER_PAGE}
      heading="Shop all products"
      description={`${products.length} products across ${categories.length} ranges, from 1 × 1 ft desk boards to 8 × 4 ft lecture halls. Every board is made to order — ask Plusmark about any size that is not listed.`}
      trail={[{ label: "Home", href: "/" }, { label: "Shop" }]}
    />
  );
}
