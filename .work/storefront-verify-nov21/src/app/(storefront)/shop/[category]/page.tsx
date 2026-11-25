import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/commerce/Listing";
import { categories, getCategory, products } from "@/lib/catalog";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PER_PAGE = 12;

export const dynamic = "force-static";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return pageMetadata({
    title: category.name,
    path: `/shop/${category.slug}`,
    description: `${category.description} Made to order by Plusmark in Ahmedabad and dispatched across India.`
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: category.name, path: `/shop/${category.slug}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Listing
        basePath={`/shop/${category.slug}`}
        lockedCategoryId={category.id}
        catalog={products}
        perPage={PER_PAGE}
        heading={category.name}
        description={category.description}
        trail={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
      />
    </>
  );
}
