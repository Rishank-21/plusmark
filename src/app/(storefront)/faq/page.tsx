import type { Metadata } from "next";
import { FaqExplorer } from "@/components/static/FaqExplorer";
import { PageHeader, Section } from "@/components/static/Editorial";
import { faqItems } from "@/lib/catalog";
import type { FaqItem } from "@/types";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  path: "/faq",
  description: "Plusmark answers on board surfaces, series, magnetic and ceramic faces, sizes, customisation, delivery and returns."
});

const pendingItems: FaqItem[] = [
  { id: "pending-freight", section: "Delivery & policies", question: "What will freight cost and how long will delivery take?", answer: "Plusmark has not published a common freight rate or delivery estimate. Both depend on the order and destination and are confirmed when the invoice is raised.", source: "demo" },
  { id: "pending-returns", section: "Delivery & policies", question: "What return window and refund timeline apply?", answer: "The return window, eligibility rules and refund timeline have not been signed off for this storefront. Confirm the terms with Plusmark before ordering.", source: "demo" },
  
];

export default function FaqPage() {
  const items = [...faqItems, ...pendingItems];
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items)) }}
      />
      <PageHeader
        trail={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        title="Questions about boards, sizes and supply"
        lead="Search the Plusmark FAQ by material, size, surface, delivery or returns. Where the business has not published an answer, the entry says so instead of filling the gap with a guessed policy."
      />
      <Section id="faq-explorer" title="Find an answer">
        <FaqExplorer items={items} />
      </Section>
    </>
  );
}
