import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/commerce/Listing";
import { categories, getCategory } from "@/lib/catalog";
import { filterProducts, sortProducts } from "@/lib/filters";
import { clampPage, parseFilters, parsePage, parseSort, toParams } from "@/lib/listing-query";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PER_PAGE = 12;

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

export default async function SubcategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category: slug, subcategory: subId } = await params;
  const category = getCategory(slug);
  const sub = category?.subcategories.find((item) => item.id === subId);
  if (!category || !sub) notFound();

  const raw = toParams(await searchParams);
  const filters = { ...parseFilters(raw), categoryId: category.id, subcategoryId: sub.id };
  const sort = parseSort(raw.get("sort"));

  const all = sortProducts(filterProducts(filters), sort);
  const page = clampPage(parsePage(raw.get("page")), all.length, PER_PAGE);

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
        filters={filters}
        sort={sort}
        page={page}
        perPage={PER_PAGE}
        results={all.slice((page - 1) * PER_PAGE, page * PER_PAGE)}
        total={all.length}
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
