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
    <section className="bg-subtle py-10 lg:py-24" aria-labelledby="reviews-heading">
      <div className="pm-shell">
        <header className="flex flex-col-reverse gap-4 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pb-8">
          <div className="flex flex-col gap-2">
            <h2 id="reviews-heading" className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">
              What buyers say after the board arrives
            </h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Stars className="flex items-center gap-1 text-rating" />
              <span className="tabular text-body-sm font-semibold text-ink">{GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)}</span>
            </div>
            <p className="text-caption text-muted">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-graphite/40 underline-offset-4 hover:text-ink"
              >
                {GOOGLE_REVIEW_SUMMARY.count} Google reviews
              </a>
            </p>
          </div>
        </header>

        <div className="no-scrollbar -mx-md mt-5 flex snap-x snap-mandatory scroll-pl-md gap-3 overflow-x-auto px-md pb-1 sm:mx-0 sm:mt-10 sm:grid sm:scroll-pl-0 sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {customerReviews.map((review) => (
            <figure key={review.id} className="flex h-full w-[86%] shrink-0 snap-start flex-col rounded-xl border border-line bg-surface p-5 shadow-card sm:w-auto sm:p-6">
              <Stars className="flex items-center gap-1 text-rating" />
              <blockquote className="mt-3 line-clamp-4 flex-1 text-body-sm leading-relaxed text-ink sm:text-body">“{review.quote}”</blockquote>
              <figcaption className="mt-3 text-caption text-muted">
                <span className="font-medium text-ink">{review.name}</span> · Google review
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
