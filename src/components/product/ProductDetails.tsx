"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Accordion, type AccordionEntry } from "@/components/ui/Accordion";
import { formatDimension, variantLabel } from "@/lib/format";
import type { Product } from "@/types";

/**
 * Below-the-fold product content. Tabs would hide information a buyer needs to
 * compare, so this is one long, clearly divided column instead — with the
 * honest gaps left visible rather than filled in.
 */
export function ProductDetails({ product }: { product: Product }) {
  const specs: { term: string; detail: string }[] = [
    ...(product.surface ? [{ term: "Surface", detail: product.surface }] : []),
    ...(product.frame ? [{ term: "Frame", detail: product.frame }] : []),
    ...(product.corners ? [{ term: "Corners", detail: product.corners }] : []),
    { term: "Magnetic", detail: product.magnetic ? "Yes" : "No" },
    { term: "Sides", detail: product.doubleSided ? "Both side usable" : "Single side" },
    ...(product.usage ? [{ term: "Typical use", detail: product.usage }] : []),
    ...(product.hsnCode ? [{ term: "HSN code", detail: product.hsnCode }] : []),
    { term: "Retail minimum", detail: "1 board" }
  ];

  const sizes = product.variants.map((variant) => ({
    label: variantLabel(variant),
    dimension: formatDimension(variant.size.widthCm, variant.size.heightCm),
    sku: variant.sku
  }));

  const descriptionParagraphs = product.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const features = product.features.map((feature, index) => {
    const separator = feature.indexOf(" — ");
    const title = separator > -1 ? feature.slice(0, separator) : `Feature ${index + 1}`;
    const detail = separator > -1 ? feature.slice(separator + 3) : feature;
    return { feature, title, detail };
  });

  const accordions: AccordionEntry[] = [
    {
      id: "installation",
      question: "Installation and care",
      answer: (
        <div className="flex flex-col gap-3 text-body leading-relaxed text-graphite">
          <p>
            Boards up to 4 × 3 ft are wall-mountable with standard anchors and a level; larger sizes are best fixed into
            a stud or with two fixings per edge. Plusmark ships fixing centres with the frame, and the frame has a
            channel for them.
          </p>
          <p>
            Wipe an HPL or melamine white face with a dry eraser first, then a soft cloth if ghosting remains. Avoid
            solvent-based cleaners on the printed surface and never leave ink on the board overnight. Chalk faces wipe
            with a damp cloth; let the surface dry before use again.
          </p>
          <p>Do not use the board as a pin surface unless it is specified as a notice or cork board.</p>
        </div>
      )
    },
    {
      id: "customisation",
      question: "Custom sizes, layouts and both-side boards",
      answer: (
        <p className="text-body leading-relaxed text-graphite">
          Sizes outside the listed range, split layouts, ruled grids, perforated and grooved surfaces, printed headings
          and both-side construction are all made to order. Send the size and finish you need and Plusmark confirms the
          price before you order.
        </p>
      )
    },
    {
      id: "dispatch",
      question: "Dispatch and delivery",
      answer: (
        <p className="text-body leading-relaxed text-graphite">
          Freight rules are still being finalised, so the transport method and delivery estimate for your pincode are
          confirmed when the invoice is raised. Pickup from the Narolgam works in Ahmedabad carries no transport
          charge.
        </p>
      )
    }
  ];

  return (
    <div className="product-details pm-shell !max-w-[90rem] border-t border-hair pt-12 lg:pt-16">
      <div className="product-details-stack">
        <section aria-labelledby="desc-heading" className="product-detail-row">
          <div className="product-detail-label">
            <span className="product-section-kicker">Product information</span>
            <h2 id="desc-heading" className="font-display text-h2 leading-tight text-ink">Description</h2>
          </div>
          <div className="product-description max-w-reading text-[1.0625rem] leading-[1.8] text-graphite pretty">
            {descriptionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section aria-labelledby="features-heading" className="product-detail-row">
          <div className="product-detail-label">
            <span className="product-section-kicker">Materials and construction</span>
            <h2 id="features-heading" className="font-display text-h2 leading-tight text-ink">Key Features</h2>
          </div>
          <ul className="product-feature-grid">
            {features.map(({ feature, title, detail }) => (
              <li key={feature} className="product-feature-item">
                <CircleCheck className="product-feature-check" size={18} strokeWidth={2} aria-hidden />
                <span className="flex min-w-0 flex-col gap-1">
                  <strong className="text-body font-medium text-ink">{title}</strong>
                  <span className="text-[0.9375rem] leading-relaxed text-graphite">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="specs-heading" className="product-detail-row">
          <div className="product-detail-label">
            <span className="product-section-kicker">At a glance</span>
            <h2 id="specs-heading" className="font-display text-h2 leading-tight text-ink">Specifications</h2>
          </div>
          <dl className="product-spec-list">
            {specs.map((row) => (
              <div key={row.term} className="product-spec-row">
                <dt className="text-[0.9375rem] font-medium uppercase tracking-[0.08em] text-graphite-light">{row.term}</dt>
                <dd className="text-[1.0625rem] text-ink">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sizes-heading" className="product-detail-row">
          <div className="product-detail-label">
            <span className="product-section-kicker">Available configurations</span>
            <h2 id="sizes-heading" className="font-display text-h2 leading-tight text-ink">Sizes and SKUs</h2>
          </div>
          <div>
            <div className="product-size-table-wrap overflow-x-auto">
              <table className="w-full border-collapse text-left text-body">
                <caption className="sr-only">Sizes, dimensions and SKUs offered for {product.name}</caption>
                <thead>
                  <tr className="border-b border-hair">
                    <th scope="col" className="px-4 py-3 text-[0.9375rem] font-medium uppercase tracking-[0.08em] text-graphite">
                      Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-[0.9375rem] font-medium uppercase tracking-[0.08em] text-graphite">
                      Metric
                    </th>
                    <th scope="col" className="px-4 py-3 text-[0.9375rem] font-medium uppercase tracking-[0.08em] text-graphite">
                      SKU
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((row) => (
                    <tr key={row.sku} className="border-b border-hair last:border-b-0 even:bg-sand/35">
                      <td className="px-4 py-3 text-[1rem] font-medium text-ink">{row.label}</td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-[1rem] text-graphite">{row.dimension}</td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.9375rem] text-graphite">{row.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[0.9375rem] leading-relaxed text-graphite">
              Need a size that is not listed? Boards are cut to order —{" "}
              <Link href="/contact" className="underline decoration-hair-strong underline-offset-4 hover:text-ink">
                ask Plusmark for the price
              </Link>
              .
            </p>
          </div>
        </section>

        <section aria-labelledby="care-heading" className="product-detail-row">
          <div className="product-detail-label">
            <h2 id="care-heading" className="font-display text-h2 leading-tight text-ink">Care and delivery</h2>
          </div>
          <Accordion items={accordions} defaultOpenId="installation" />
        </section>

        {product.usage && (
          <section aria-labelledby="applications-heading" className="product-detail-row">
            <div className="product-detail-label">
              <h2 id="applications-heading" className="font-display text-h2 leading-tight text-ink">Applications</h2>
            </div>
            <p className="text-body leading-relaxed text-graphite">{product.usage}</p>
          </section>
        )}
      </div>
    </div>
  );
}
