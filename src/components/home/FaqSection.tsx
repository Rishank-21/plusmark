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
    <section className="bg-canvas py-16 lg:py-24" aria-labelledby="faq-heading">
      <div className="pm-shell !max-w-[105rem] grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="flex flex-col items-start gap-5 lg:sticky lg:top-40 lg:self-start">
          <h2 id="faq-heading" className="max-w-[14ch] font-sans font-normal text-h1 leading-tight text-navy">
            Frequently asked questions
          </h2>
          <p className="max-w-[36ch] font-sans text-body-sm leading-relaxed text-graphite">
            Answers are the ones published by Plusmark. Anything that depends on a custom size is confirmed before you
            order.
          </p>
          <Link
            href="/faq"
            className="group mt-1 inline-flex items-center gap-2 border-b border-navy/30 pb-1 font-sans text-body-sm font-normal text-navy transition-colors hover:border-navy"
          >
            All questions
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <Accordion items={items} normalQuestions />
      </div>
    </section>
  );
}
