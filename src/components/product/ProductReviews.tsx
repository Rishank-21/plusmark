"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/States";
import { formatDate } from "@/lib/format";
import { customerReviews, GOOGLE_REVIEW_SUMMARY, GOOGLE_REVIEW_URL } from "@/lib/reviews";
import {
  deleteProductReview,
  listProductReviews,
  saveProductReview,
  validateReview,
  type ProductReview,
  type ReviewError
} from "@/lib/supabase/reviews";
import { useSession } from "@/state/session";

const INITIAL_VISIBLE = 4;
const STAR_ROWS = [5, 4, 3, 2, 1];
type SortOrder = "recent" | "highest" | "lowest";

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span key={index} className={`relative inline-flex ${size} items-center justify-center`} aria-hidden>
            <Star className={`absolute ${size} text-hair-strong`} strokeWidth={1.5} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-current text-blue`} strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function summaryOf(reviews: ProductReview[]) {
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  const distribution = STAR_ROWS.map((star) => {
    const value = reviews.filter((review) => review.rating === star).length;
    return { star, count: value, percent: count ? Math.round((value / count) * 100) : 0 };
  });
  return { count, average, distribution };
}

export function ProductReviews({ productName, productSlug }: { productName: string; productSlug: string }) {
  const session = useSession();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOrder>("recent");
  const [showAll, setShowAll] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setReviews(await listProductReviews(productSlug));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Reviews could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => summaryOf(reviews), [reviews]);
  const myReview = session.user ? reviews.find((review) => review.userId === session.user?.id) : undefined;

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sort === "highest") list.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    else if (sort === "lowest") list.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [reviews, sort]);

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE);

  const openForm = () => {
    setFormOpen(true);
    setMessage(null);
    setFormErrors({});
    setRating(myReview?.rating ?? 0);
    setTitle(myReview?.title ?? "");
    setBody(myReview?.body ?? "");
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormErrors({});
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateReview({ rating, title, body });
    if (validation) {
      const typed = validation as ReviewError;
      setFormErrors({ [typed.field ?? "form"]: typed.message });
      return;
    }
    setSaving(true);
    setFormErrors({});
    setMessage(null);
    try {
      const authorName =
        session.account?.fullName?.trim() ||
        (session.user?.email ? session.user.email.split("@")[0] : "Plusmark customer");
      const saved = await saveProductReview({ productSlug, rating, title, body, authorName });
      setReviews((current) => {
        const rest = current.filter((review) => review.id !== saved.id && review.userId !== saved.userId);
        return [saved, ...rest];
      });
      setFormOpen(false);
      setShowAll(true);
      setMessage("Your review is published. Thank you for helping other customers.");
    } catch (error) {
      const typed = error as ReviewError;
      setFormErrors({ [typed.field ?? "form"]: typed.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!myReview) return;
    setSaving(true);
    setMessage(null);
    try {
      await deleteProductReview(myReview.id);
      setReviews((current) => current.filter((review) => review.id !== myReview.id));
      setFormOpen(false);
      setMessage("Your review was deleted.");
    } catch (error) {
      setFormErrors({ form: error instanceof Error ? error.message : "Your review could not be deleted." });
    } finally {
      setSaving(false);
    }
  };

  const signInHref = `/login?next=${encodeURIComponent(`/product/${productSlug}`)}`;

  return (
    <section
      id="customer-reviews"
      aria-label={`Customer reviews for ${productName}`}
      className="scroll-mt-56 border-t border-hair pt-10 lg:pt-12"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-14">
        <div className="min-w-0">
          <h2 className="font-sans text-[1.5rem] font-normal leading-tight text-ink">Customer reviews</h2>

          {loading ? (
            <div className="flex flex-col gap-3 pt-5" aria-live="polite">
              <span className="sr-only">Loading customer reviews</span>
              <div className="h-11 w-24 animate-pulse rounded-sm bg-sand" />
              <div className="h-3 w-36 animate-pulse rounded-sm bg-sand" />
              {STAR_ROWS.map((star) => (
                <div key={star} className="h-2.5 w-full animate-pulse rounded-sm bg-sand" />
              ))}
            </div>
          ) : summary.count === 0 ? (
            <div className="pt-4">
              <p className="text-body-sm font-medium text-ink">No customer ratings yet</p>
              <p className="pt-1.5 text-caption leading-relaxed text-graphite">
                Be the first to review this board. Reviews appear under the name on your Plusmark account.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 pt-4">
                <span className="text-[2.75rem] font-normal leading-none text-ink">{summary.average.toFixed(1)}</span>
                <div className="flex flex-col gap-1">
                  <Stars rating={summary.average} />
                  <p className="text-caption text-graphite">
                    {summary.count} {summary.count === 1 ? "customer rating" : "customer ratings"}
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-1.5 pt-5">
                {summary.distribution.map((row) => (
                  <li key={row.star} className="flex items-center gap-2.5 text-body-sm text-graphite">
                    <span className="w-11 shrink-0">{row.star} star</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-sm bg-sand" aria-hidden>
                      <span className="block h-full rounded-sm bg-blue" style={{ width: `${row.percent}%` }} />
                    </span>
                    <span className="w-16 shrink-0 text-right tabular text-caption">
                      {row.percent}% ({row.count})
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="pt-5">
            {!session.user ? (
              <ButtonLink href={signInHref} variant="secondary" size="sm">
                Sign in to write a review
              </ButtonLink>
            ) : (
              <Button variant={myReview ? "secondary" : "primary"} size="sm" onClick={openForm}>
                {myReview ? "Edit your review" : "Write a review"}
              </Button>
            )}
          </div>

          {loadError && (
            <div className="pt-4">
              <Notice tone="warning" title="Reviews could not be loaded">
                {loadError}{" "}
                <button type="button" className="pm-link font-medium" onClick={() => void load()}>
                  Retry
                </button>
              </Notice>
            </div>
          )}

          <p className="pt-4 text-caption leading-relaxed text-graphite">
            Reviews are written by signed-in customers on this product page. Plusmark does not seed ratings, and no review
            is marked as a verified purchase until server-side order records can confirm it.
          </p>

          <div className="border-t border-hair pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-body-sm font-semibold text-ink">Plusmark on Google</h3>
              <div className="flex items-center gap-1.5">
                <Stars rating={GOOGLE_REVIEW_SUMMARY.rating} size="size-3.5" />
                <span className="tabular text-caption text-graphite">{GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="pt-1.5 text-caption leading-relaxed text-graphite">
              {GOOGLE_REVIEW_SUMMARY.count} ratings on the business profile. These quotes are about Plusmark as a whole,
              not this specific board.{" "}
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink"
              >
                See the profile on Google
              </a>
              .
            </p>
            {showGoogle && (
              <ul className="flex flex-col divide-y divide-hair pt-2">
                {customerReviews.map((review) => (
                  <li key={review.id} className="py-2.5">
                    <p className="text-caption font-medium text-ink">{review.name}</p>
                    <blockquote className="pt-0.5 text-caption leading-relaxed text-graphite">“{review.quote}”</blockquote>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setShowGoogle((value) => !value)}
              aria-expanded={showGoogle}
              className="mt-2 text-caption font-medium text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink"
            >
              {showGoogle ? "Hide Google reviews" : `Read ${customerReviews.length} Google reviews`}
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hair pb-3">
            <h3 className="text-body font-semibold text-ink">Reviews from Plusmark customers</h3>
            <div className="flex items-center gap-2 text-caption text-graphite">
              <span>{summary.count} written {summary.count === 1 ? "review" : "reviews"}</span>
              {summary.count > 1 && (
                <label className="flex items-center gap-1.5">
                  <span className="sr-only">Sort reviews</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOrder)}
                    className="h-8 rounded-sm border border-hair bg-surface px-2 text-caption text-ink"
                  >
                    <option value="recent">Most recent</option>
                    <option value="highest">Highest rating</option>
                    <option value="lowest">Lowest rating</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          {message && (
            <p role="status" className="pt-3 text-body-sm font-medium text-success">
              {message}
            </p>
          )}

          {formOpen && (
            <div ref={formRef} className="scroll-mt-56 border-b border-hair py-5">
              <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-body font-semibold text-ink">{myReview ? "Edit your review" : "Write a review"}</h4>
                  <button type="button" onClick={closeForm} className="text-caption text-graphite underline underline-offset-4 hover:text-ink">
                    Cancel
                  </button>
                </div>

                <fieldset className="flex flex-col gap-1.5">
                  <legend className="text-caption font-medium text-ink">Your rating *</legend>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={rating === value}
                        onClick={() => {
                          setRating(value);
                          setFormErrors((current) => ({ ...current, rating: null }));
                        }}
                        className="flex size-9 items-center justify-center rounded-sm transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                      >
                        <Star
                          className={`size-6 ${value <= rating ? "fill-current text-blue" : "text-hair-strong"}`}
                          strokeWidth={value <= rating ? 0 : 1.5}
                          aria-hidden
                        />
                      </button>
                    ))}
                    {rating > 0 && <span className="pl-1 text-caption text-graphite">{rating} of 5</span>}
                  </div>
                  {formErrors.rating && <p role="alert" className="text-caption font-medium text-danger">{formErrors.rating}</p>}
                </fieldset>

                <TextField
                  id="review-title"
                  label="Headline"
                  required
                  value={title}
                  maxLength={120}
                  error={formErrors.title}
                  hint="What should other customers know first?"
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setFormErrors((current) => ({ ...current, title: null }));
                  }}
                />

                <TextArea
                  id="review-body"
                  label="Your review"
                  required
                  rows={5}
                  value={body}
                  maxLength={2000}
                  error={formErrors.body}
                  hint={`${body.trim().length} / 2000 characters`}
                  onChange={(event) => {
                    setBody(event.target.value);
                    setFormErrors((current) => ({ ...current, body: null }));
                  }}
                />

                {formErrors.form && (
                  <p role="alert" className="rounded-sm border border-danger/30 bg-danger-wash px-3 py-2 text-body-sm text-danger">
                    {formErrors.form}
                  </p>
                )}

                <p className="text-caption leading-relaxed text-graphite">
                  Published publicly under {session.account?.fullName || session.user?.email}. It is not marked as a
                  verified purchase because checkout is not linked to a server order yet.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" size="sm" loading={saving} disabled={saving}>
                    {myReview ? "Update review" : "Publish review"}
                  </Button>
                  {myReview && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteOpen(true)} disabled={saving}>
                      Delete review
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-4 pt-5" aria-live="polite">
              <span className="sr-only">Loading reviews</span>
              {[0, 1].map((row) => (
                <div key={row} className="flex flex-col gap-2">
                  <div className="h-4 w-48 animate-pulse rounded-sm bg-sand" />
                  <div className="h-3 w-full animate-pulse rounded-sm bg-sand" />
                  <div className="h-3 w-3/4 animate-pulse rounded-sm bg-sand" />
                </div>
              ))}
            </div>
          ) : summary.count === 0 ? (
            <div className="py-8">
              <p className="text-body-sm font-medium text-ink">No reviews yet</p>
              <p className="pt-1 text-caption leading-relaxed text-graphite">
                {session.user
                  ? "Share how the board has held up in use — that is what the next customer needs."
                  : "Sign in to be the first customer to review this board."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hair">
              {visible.map((review) => {
                const mine = review.userId === session.user?.id;
                return (
                  <article key={review.id} className="flex gap-3 py-5">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sand text-caption font-semibold text-navy"
                    >
                      {initials(review.authorName)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-body-sm font-semibold text-ink">{review.authorName}</p>
                        {mine && <span className="rounded-sm bg-sand px-1.5 py-0.5 text-[0.6875rem] text-graphite">Your review</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Stars rating={review.rating} />
                        <p className="text-body-sm font-semibold text-ink">{review.title}</p>
                      </div>
                      <p className="pt-1 text-caption text-graphite">
                        Reviewed on {formatDate(review.createdAt)}
                        {review.updatedAt !== review.createdAt && " · edited"}
                      </p>
                      <p className="whitespace-pre-line pt-1.5 text-body-sm leading-relaxed text-ink">{review.body}</p>
                      {mine && (
                        <div className="flex items-center gap-3 pt-2">
                          <button type="button" onClick={openForm} className="text-caption font-medium text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink">
                            Edit
                          </button>
                          <button type="button" onClick={() => setDeleteOpen(true)} className="text-caption font-medium text-graphite underline decoration-hair-strong underline-offset-4 hover:text-danger">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && sorted.length > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              aria-expanded={showAll}
              className="mt-4 h-10 rounded-full border border-hair-strong bg-surface px-5 text-body-sm font-medium text-ink hover:border-blue hover:bg-blue-wash"
            >
              {showAll ? "Show fewer reviews" : `See all ${sorted.length} reviews`}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void remove()}
        title="Delete your review?"
        body="The review and its rating will be removed from this product page. This cannot be undone."
        confirmLabel="Delete review"
        destructive
      />
    </section>
  );
}
