import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/commerce/Listing";
import { categories, getCategory } from "@/lib/catalog";
import { filterProducts, sortProducts } from "@/lib/filters";
import { clampPage, parseFilters, parsePage, parseSort, toParams } from "@/lib/listing-query";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PER_PAGE = 12;

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

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const raw = toParams(await searchParams);
  const filters = { ...parseFilters(raw), categoryId: category.id, subcategoryId: null };
  const sort = parseSort(raw.get("sort"));

  const all = sortProducts(filterProducts(filters), sort);
  const page = clampPage(parsePage(raw.get("page")), all.length, PER_PAGE);

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
        filters={filters}
        sort={sort}
        page={page}
        perPage={PER_PAGE}
        results={all.slice((page - 1) * PER_PAGE, page * PER_PAGE)}
        total={all.length}
        heading={category.name}
        description={category.description}
        trail={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
      />
    </>
  );
}
