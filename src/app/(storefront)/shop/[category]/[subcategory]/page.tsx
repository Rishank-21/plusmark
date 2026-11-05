import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/commerce/Listing";
import { categories, getCategory } from "@/lib/catalog";
import { filterProducts, sortProducts } from "@/lib/filters";
import { clampPage, parseFilters, parsePage, parseSort, toParams } from "@/lib/listing-query";
import { META_TITLE_SUFFIX } from "@/lib/config";

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
  return {
    title: `${sub.name} — ${category.name}${META_TITLE_SUFFIX}`,
    description: `${sub.name} made to order by Plusmark, in the ${category.name.toLowerCase()} range. Sized from 1 × 1 ft to 8 × 4 ft and quoted per requirement.`
  };
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

  return (
    <Listing
      basePath={`/shop/${category.slug}`}
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
  );
}
