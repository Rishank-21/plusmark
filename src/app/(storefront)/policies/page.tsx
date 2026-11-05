import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, Section } from "@/components/static/Editorial";
import { DraftPolicyNotice } from "@/components/static/Policy";
import { policies } from "@/components/static/policy-data";

export const metadata: Metadata = { title: "Policies", description: "Draft shipping, returns, privacy and storefront terms, with every unresolved Plusmark business rule clearly marked for confirmation." };

export default function PoliciesPage() {
  return (
    <>
      <PageHeader trail={[{ label: "Home", href: "/" }, { label: "Policies" }]} eyebrow="No guessed freight, returns or legal promises" title="Storefront policies" lead="These pages explain what the prototype does and separate published Plusmark facts from terms that still require business approval. Confirm the terms attached to your actual order before paying." />
      <Section id="policy-index" title="Read the draft terms">
        <div className="mb-8"><DraftPolicyNotice page="The policy index" /></div>
        <ul className="grid gap-px overflow-hidden rounded-sm border border-hair bg-hair md:grid-cols-2">
          {policies.map((policy) => (
            <li key={policy.slug} className="bg-surface">
              <Link href={`/policies/${policy.slug}`} className="group flex h-full min-h-60 flex-col p-6 hover:bg-sand/35">
                <div className="flex items-start justify-between gap-4"><h2 className="font-display text-h3">{policy.title}</h2><ArrowUpRight className="size-4 text-graphite" aria-hidden /></div>
                <p className="pt-3 text-body-sm leading-relaxed text-graphite">{policy.summary}</p>
                <span className="mt-auto pt-5 text-caption font-medium text-navy-deep">{policy.pending.length} areas pending sign-off</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
