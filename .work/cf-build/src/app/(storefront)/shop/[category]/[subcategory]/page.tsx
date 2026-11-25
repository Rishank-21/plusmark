import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/commerce/Listing";
import { categories, getCategory, products } from "@/lib/catalog";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PER_PAGE = 12;

export const dynamic = "force-static";

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.subcategories.map((sub) => ({ category: category.slug, subcategory: sub.id }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { category: slug, subcategory: subId } = await params;
  const category = getCategory(slug);
  const sub = category?.subcategories.find((item) => item.id === subId);
  if (!category || !sub) return {};
  return pageMetadata({
    title: `${sub.name} — ${category.name}`,
    description: `${sub.name} made to order by Plusmark, in the ${category.name.toLowerCase()} range. Sized from 1 × 1 ft to 8 × 4 ft and quoted per requirement.`,
    path: `/shop/${category.slug}/${sub.id}`
  });
}

export default async function SubcategoryPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category: slug, subcategory: subId } = await params;
  const category = getCategory(slug);
  const sub = category?.subcategories.find((item) => item.id === subId);
  if (!category || !sub) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: category.name, path: `/shop/${category.slug}` },
    { name: sub.name, path: `/shop/${category.slug}/${sub.id}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Listing
        basePath={`/shop/${category.slug}/${sub.id}`}
        lockedCategoryId={category.id}
        lockedSubcategoryId={sub.id}
        catalog={products}
        perPage={PER_PAGE}
        heading={sub.name}
        description={`${sub.name} within the ${category.name.toLowerCase()} range, made to order in Ahmedabad.`}
        trail={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name, href: `/shop/${category.slug}` },
          { label: sub.name }
        ]}
      />
    </>
  );
}
