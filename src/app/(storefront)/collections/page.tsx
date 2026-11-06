import type { Metadata } from "next";
import { collections } from "@/components/static/collection-data";
import { PageHeader } from "@/components/static/Editorial";
import { CollectionBrowser, type BrowseCollection } from "@/components/static/CollectionBrowser";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Collections",
  path: "/collections",
  description: "Browse Plusmark by series, board type and format. Every collection is a structural selection from the published catalogue."
});

export default function CollectionsPage() {
  const items: BrowseCollection[] = collections.map((collection) => {
    const products = collection.select();
    const lead = products.find((product) => product.media.length > 0);
    return {
      slug: collection.slug,
      name: collection.name,
      kind: collection.kind,
      blurb: collection.blurb,
      count: products.length,
      media: lead?.media[0] ?? null,
      productName: lead?.name ?? collection.name,
      categoryId: lead?.categoryId
    };
  });

  return (
    <>
      <PageHeader
        trail={[{ label: "Home", href: "/" }, { label: "Collections" }]}
        eyebrow="The catalogue, organised by the decision you are making"
        title="The Plusmark collections"
        lead="Compare construction, choose a writing surface, fit out a particular room or start with the wall size. No collection is labelled bestselling or trending because Plusmark publishes no sales ranking."
        sansHeading
        compact
        bordered={false}
      />
      <CollectionBrowser items={items} />
    </>
  );
}
