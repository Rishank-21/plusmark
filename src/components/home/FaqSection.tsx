import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion, type AccordionEntry } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/catalog";
import { homepageFaq } from "@/lib/demo-data";

export function FaqSection({ limit = 7 }: { limit?: number }) {
  const items: AccordionEntry[] = homepageFaq(faqItems, limit).map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer
  }));

  return (
    <section className="bg-page py-10 lg:py-24" aria-labelledby="faq-heading">
      <div className="pm-shell grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="flex flex-col items-start gap-3 sm:gap-5 lg:sticky lg:top-40 lg:self-start">
          <h2 id="faq-heading" className="max-w-[14ch] font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-tight">
            Frequently asked questions
          </h2>
          <p className="max-w-[36ch] font-sans text-body-sm leading-relaxed text-muted">
            Common questions on board surfaces, frames, GST invoicing, custom sizing and delivery across India.
          </p>
          <Link
            href="/faq"
            className="mt-1 inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-sans text-body-sm font-normal text-ink transition-colors hover:border-ink"
          >
            All questions
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <Accordion items={items} />
      </div>
    </section>
  );
}
