import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, CornerDownRight, Frame, PenLine, Ruler } from "lucide-react";
import { collections, getCollection, relatedCollections, seriesFacts } from "@/components/static/collection-data";
import { PageHeader, Section } from "@/components/static/Editorial";
import { ProductGrid } from "@/components/static/Policy";
import { ProductImage } from "@/components/ui/ProductImage";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const collection = getCollection((await params).slug);
  return collection
    ? pageMetadata({
        title: collection.name,
        path: `/collections/${collection.slug}`,
        description: collection.blurb
      })
    : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();
  const selected = collection.select();
  const series = collection.kind === "Series" ? seriesFacts(collection.slug) : null;
  const lead = selected.find((product) => product.media.length > 0) ?? null;
  const related = relatedCollections(collection).map((item) => {
    const products = item.select();
    return { item, count: products.length, photo: products.find((product) => product.media.length > 0) ?? null };
  });

  return (
    <>
      <PageHeader
        trail={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections" }, { label: collection.name }]}
        title={collection.name}
        lead={collection.blurb}
        compact
        bordered={false}
        aside={
          <a
            href="#collection-products"
            className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-primary/25 px-5 text-body-sm font-medium text-brand transition-colors hover:border-primary hover:bg-primary-soft"
          >
            See all {selected.length} {selected.length === 1 ? "item" : "items"}
            <ArrowDown className="size-4" aria-hidden />
          </a>
        }
        media={
          lead ? (
            <div className="aspect-[16/10] overflow-hidden rounded-lg bg-surface lg:aspect-[5/4]">
              <ProductImage
                asset={lead.media[0]}
                name={lead.name}
                categoryId={lead.categoryId}
                sizes="(max-width: 1023px) 92vw, 42vw"
                priority
                className="size-full object-contain"
              />
            </div>
          ) : null
        }
      />
      {series && (
        <section
          id="series-facts"
          className="scroll-mt-48 bg-page py-16 lg:scroll-mt-52 lg:py-24"
          aria-labelledby="series-facts-heading"
        >
          <div className="pm-shell">
            <header className="mx-auto mb-12 max-w-reading text-center lg:mb-16">
              <h2 id="series-facts-heading" className="balance font-display text-h2 font-extrabold text-ink">
                What distinguishes this series
              </h2>
            </header>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-12">
              {[
                { term: "Writing face", detail: series.surface, icon: PenLine },
                { term: "Frame", detail: series.frame, icon: Frame },
                { term: "Corners", detail: series.corners, icon: CornerDownRight },
                { term: "Published sizes", detail: series.sizes.map((size) => size.replace(/ /g, "\u00A0")).join(" · "), icon: Ruler }
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.term} className="flex flex-col items-center text-center">
                    <Icon className="size-7 text-ink" strokeWidth={1.4} aria-hidden />
                    <dt className="mt-5 text-caption font-medium uppercase tracking-[0.14em] text-muted">{row.term}</dt>
                    <dd className="mt-2 max-w-[22ch] text-body leading-relaxed text-ink">{row.detail}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      )}
      <Section id="collection-products" title="Every catalogue item in this collection" bordered={false}>
        <ProductGrid products={selected} />
      </Section>
      <Section id="related-collections" title="Related ways to narrow the catalogue" tone="sand" bordered={false}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map(({ item, count, photo }) => (
            <li key={item.slug}>
              <Link
                href={`/collections/${item.slug}`}
                className="group flex h-full items-center gap-4 rounded-lg bg-surface p-3 transition-shadow hover:shadow-card"
              >
                <span className="size-20 shrink-0 overflow-hidden rounded-md bg-page">
                  {photo && (
                    <ProductImage
                      asset={photo.media[0]}
                      name={photo.name}
                      categoryId={photo.categoryId}
                      sizes="80px"
                      className="size-full object-contain p-1"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted">
                    {item.kind}
                  </span>
                  <span className="mt-1 block text-body-sm font-medium leading-snug text-ink group-hover:text-primary-strong">
                    {item.name}
                  </span>
                  <span className="mt-1 block tabular text-caption text-muted">{count} items</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
