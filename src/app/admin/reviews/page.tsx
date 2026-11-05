"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquareOff, Star } from "lucide-react";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { Notice } from "@/components/ui/States";
import { formatDate } from "@/lib/format";
import { listAllReviews, type ProductReview } from "@/lib/supabase/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`size-3.5 ${value <= rating ? "fill-current text-blue" : "text-hair-strong"}`}
          strokeWidth={value <= rating ? 0 : 1.5}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await listAllReviews());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Reviews could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : null;
    return {
      count,
      average,
      products: new Set(reviews.map((review) => review.productSlug)).size,
      fiveStar: reviews.filter((review) => review.rating === 5).length,
      low: reviews.filter((review) => review.rating < 4).length
    };
  }, [reviews]);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Reviews"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reviews" }]}
        lede="Product reviews written by signed-in customers. They publish immediately, carry no seeded rating, and are not marked as verified purchases until checkout is linked to server-side orders."
      />
      <StatStrip
        items={[
          { label: "Published", value: loading ? "—" : String(stats.count) },
          { label: "Products reviewed", value: loading ? "—" : String(stats.products) },
          { label: "Average rating", value: stats.average === null ? "—" : stats.average.toFixed(1), note: stats.count ? `${stats.count} rating${stats.count === 1 ? "" : "s"}` : "No ratings exist" },
          { label: "5-star reviews", value: loading ? "—" : String(stats.fiveStar) },
          { label: "Below 4 stars", value: loading ? "—" : String(stats.low) },
          { label: "Awaiting moderation", value: "0", note: "No moderation queue exists" }
        ]}
      />

      <Notice tone="warning" title="Reviews publish without prior approval">
        Any signed-in customer can publish one review per board, and can edit or delete their own review. There is no
        admin moderation or removal tool yet, and no review is described as a verified purchase.
      </Notice>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)] lg:items-start">
        <AdminPanel
          title="Published reviews"
          description="Newest first. Product names link to the storefront page where the review appears."
          padded={false}
        >
          {loading ? (
            <p className="px-4 py-10 text-center text-body-sm text-graphite" role="status" aria-live="polite">
              Loading reviews…
            </p>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <p className="text-body-sm text-danger">{error}</p>
              <button type="button" onClick={() => void load()} className="pm-link mt-2 text-body-sm font-medium">
                Retry
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <MessageSquareOff className="size-6 text-graphite-light" aria-hidden />
              <p className="font-display text-h3 leading-tight text-ink">No reviews yet</p>
              <p className="max-w-reading text-body-sm leading-relaxed text-graphite">
                Reviews appear here when a signed-in customer writes one on a product page. This screen does not invent
                sample praise to fill the space.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-hair">
              {reviews.map((review) => (
                <li key={review.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Stars rating={review.rating} />
                    <p className="text-body-sm font-semibold text-ink">{review.title}</p>
                  </div>
                  <p className="pt-1 text-caption text-graphite">
                    {review.authorName} · {formatDate(review.createdAt)}
                    {review.updatedAt !== review.createdAt && " · edited"}
                  </p>
                  <p className="whitespace-pre-line pt-1.5 text-body-sm leading-relaxed text-ink">{review.body}</p>
                  <Link
                    href={`/product/${review.productSlug}#customer-reviews`}
                    className="pm-link mt-2 inline-block text-caption font-medium"
                  >
                    {review.productSlug}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <div className="flex min-w-0 flex-col gap-5">
          <AdminPanel title="What the database enforces">
            <ul className="list-disc space-y-2 pl-5 text-body-sm leading-relaxed text-graphite">
              <li>Anyone can read reviews; only a signed-in customer can write one.</li>
              <li>One review per customer per product, enforced by a unique constraint.</li>
              <li>A customer can update or delete only their own review row.</li>
              <li>Ratings are stored as 1–5 and the headline and text have server-side length limits.</li>
              <li>No review is marked verified without a server-side delivered order.</li>
            </ul>
          </AdminPanel>

          <AdminPanel title="Not built yet">
            <ul className="list-disc space-y-2 pl-5 text-body-sm leading-relaxed text-graphite">
              <li>Verified-purchase badge from delivered orders.</li>
              <li>Moderation queue and admin removal with an audit trail.</li>
              <li>Helpful votes or photo attachments.</li>
              <li>Aggregate rating stored on the catalogue feed.</li>
            </ul>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
