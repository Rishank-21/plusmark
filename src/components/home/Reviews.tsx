import { Star } from "lucide-react";
import { customerReviews, GOOGLE_REVIEW_SUMMARY, GOOGLE_REVIEW_URL } from "@/lib/reviews";

function Stars({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className="size-3.5 fill-current" strokeWidth={0} />
      ))}
    </span>
  );
}

export function Reviews() {
  return (
    <section className="bg-sand py-14 lg:py-24" aria-labelledby="reviews-heading">
      <div className="pm-shell !max-w-[105rem]">
        <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
          <div className="flex flex-col gap-2">
            <h2 id="reviews-heading" className="font-sans font-normal text-h1 text-navy">
              What buyers say after the board arrives
            </h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <Stars className="flex items-center gap-1 text-terra" />
            <p className="text-caption text-graphite">
              <span className="tabular font-medium text-navy">{GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)}</span> from{" "}
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-graphite/40 underline-offset-4 hover:text-navy"
              >
                {GOOGLE_REVIEW_SUMMARY.count} Google reviews
              </a>
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {customerReviews.map((review) => (
            <figure key={review.id} className="flex h-full flex-col rounded-xl bg-white p-6 shadow-sm">
              <Stars className="flex items-center gap-1 text-terra" />
              <blockquote className="mt-3 flex-1 text-body leading-relaxed text-ink">“{review.quote}”</blockquote>
              <figcaption className="mt-3 text-caption text-graphite">
                <span className="font-medium text-navy">{review.name}</span> · Google review
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
