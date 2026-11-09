import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, Prose, Section } from "@/components/static/Editorial";
import { DraftPolicyNotice, PendingValue, PolicySection, PolicyStatusPanel } from "@/components/static/Policy";
import { getPolicy, policies } from "@/components/static/policy-data";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const policy = getPolicy((await params).slug);
  return policy
    ? pageMetadata({
        title: policy.title,
        path: `/policies/${policy.slug}`,
        description: policy.summary
      })
    : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();
  return (
    <>
      <PageHeader compact trail={[{ label: "Home", href: "/" }, { label: "Policies", href: "/policies" }, { label: policy.title }]} title={policy.title} lead={policy.summary} />
      <Section id="policy-status" title="Status of this document" narrow>
        <div className="flex flex-col gap-8">
          <DraftPolicyNotice page={policy.title} />
          <PolicyStatusPanel confirmed={policy.confirmed} pending={policy.pending} />
          <div className="flex flex-col gap-8">
            {policy.sections.map((section, index) => (
              <PolicySection key={section.title} id={`policy-section-${index + 1}`} number={String(index + 1).padStart(2, "0")} title={section.title}>
                <Prose>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                  {section.pending?.map((item) => <PendingValue key={item.label} label={item.label} context={item.context} />)}
                </Prose>
              </PolicySection>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
