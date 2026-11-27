"use client";

import { useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = customerReviews.length;
  const review = customerReviews[currentIndex];

  const prev = () => setCurrentIndex((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrentIndex((c) => (c === total - 1 ? 0 : c + 1));

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  return (
    <section
      className="bg-shell py-16 text-shell-on sm:py-20 lg:py-28"
      aria-labelledby="reviews-heading"
      onKeyDown={onKeyDown}
    >
      <div className="pm-shell">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-rating sm:text-[0.75rem]">
            Client Commendations
          </p>
          <h2 id="reviews-heading" className="sr-only">
            What buyers say after the board arrives
          </h2>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-caption text-shell-on/75">
            <Stars className="inline-flex items-center gap-1 text-rating" />
            <span className="font-semibold tabular-nums text-shell-on">
              {GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)}
            </span>
            <span aria-hidden>·</span>
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-shell-on/30 underline-offset-4 transition-colors hover:text-shell-on hover:decoration-shell-on"
            >
              {GOOGLE_REVIEW_SUMMARY.count} Google reviews
            </a>
          </div>

          <figure
            aria-live="polite"
            className="mt-8 flex min-h-[13.5rem] flex-col items-center justify-center sm:mt-10 sm:min-h-[14rem]"
          >
            <blockquote
              key={review.id}
              className="animate-fade-up max-w-3xl font-display text-[1.25rem] font-normal leading-[1.55] tracking-[-0.01em] text-shell-on sm:text-[1.625rem] sm:leading-[1.45] lg:text-[1.875rem]"
            >
              “{review.quote}”
            </blockquote>

            <figcaption className="mt-7 sm:mt-8">
              <p className="text-caption font-semibold uppercase tracking-[0.2em] text-rating">
                {review.name}
              </p>
              <p className="mt-1 font-mono text-[0.75rem] text-shell-on/60">
                Verified Buyer · Google Review
              </p>
            </figcaption>
          </figure>

          <div className="mt-8 flex items-center justify-center gap-5 sm:mt-10 sm:gap-6">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="flex size-11 items-center justify-center rounded-full border border-shell-on/20 text-shell-on transition-colors hover:border-rating hover:text-rating focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rating focus-visible:ring-offset-2 focus-visible:ring-offset-shell"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>

            <span className="min-w-[4.5rem] font-mono text-caption tabular-nums text-shell-on/65">
              {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>

            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="flex size-11 items-center justify-center rounded-full border border-shell-on/20 text-shell-on transition-colors hover:border-rating hover:text-rating focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rating focus-visible:ring-offset-2 focus-visible:ring-offset-shell"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
