import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion, type AccordionEntry } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/catalog";
import { homepageFaq } from "@/lib/demo-data";

export function FaqSection({ limit = 6 }: { limit?: number }) {
  const items: AccordionEntry[] = homepageFaq(faqItems, limit).map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer
  }));

  return (
    <section className="bg-page py-12 sm:py-16 lg:py-20" aria-labelledby="faq-heading">
      <div className="pm-shell grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-3 lg:sticky lg:top-32 lg:self-start">
          <h2
            id="faq-heading"
            className="max-w-[14ch] font-display text-[1.375rem] font-extrabold leading-tight text-ink sm:text-h2"
          >
            Frequently asked questions
          </h2>
          <p className="max-w-[34ch] text-body-sm leading-relaxed text-muted">
            Board sizes, writing surfaces, GST billing and India delivery.
          </p>
          <Link
            href="/faq"
            className="mt-1 inline-flex items-center gap-1.5 text-body-sm font-medium text-ink underline-offset-4 hover:underline"
          >
            <span>All questions</span>
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <Accordion items={items} />
      </div>
    </section>
  );
}
