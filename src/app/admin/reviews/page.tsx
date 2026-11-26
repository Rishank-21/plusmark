"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Loading, Pick, Pill, Section, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { Button } from "@/components/ui/Button";
import { when } from "@/lib/backend/admin";
import { listAllReviews, moderateReview, type ProductReview } from "@/lib/supabase/reviews";
import { useToast } from "@/state/toast";

const FLAG_TEXT: Record<string, string> = {
  duplicate_text: "Same text as another customer's review",
  contains_link: "Contains a link or email",
  contains_phone: "Contains a phone number",
  promotional: "Sounds promotional",
  repeated_chars: "Repeated characters",
  shouting: "Mostly capital letters",
  very_short_extreme: "Very short 1 or 5 star",
  review_burst: "Many reviews in one day",
  shared_network_burst: "Several accounts from one network",
  returned_but_praised: "Item was returned but rated high"
};

export default function AdminReviewsPage() {
  const toast = useToast();
  const [status, setStatus] = useState<"pending" | "published" | "rejected" | "">("pending");
  const q = useAdminQuery(() => listAllReviews(200, status === "" ? null : status));
  // reload when the filter changes
  const [last, setLast] = useState(status);
  if (last !== status) { setLast(status); q.reload(); }

  const decide = async (r: ProductReview, next: "published" | "rejected") => {
    try { await moderateReview(r.id, next); toast.push(next === "published" ? "Review published." : "Review rejected.", "success"); q.reload(); }
    catch (e) { toast.push((e as Error).message, "error"); }
  };

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reviews" }]}
        lede="Only customers who received the product can review it. Reviews that look suspicious wait here for you, with the reasons."
      />
      <div className="mb-4 max-w-xs"><Pick label="Show" value={status} onChange={(v) => setStatus(v as typeof status)} options={[["pending", "Waiting for review"], ["published", "Published"], ["rejected", "Rejected"], ["", "All"]]} /></div>
      {q.error && <ErrorLine message={q.error} onRetry={q.reload} />}
      {q.loading && !q.data ? <Loading what="Loading reviews" /> : (q.data ?? []).length === 0 ? <Section title="Nothing here"><p className="text-body-sm text-muted">No reviews in this list.</p></Section> : (
        <div className="flex flex-col gap-3">
          {(q.data ?? []).map((r) => (
            <article key={r.id} className="rounded-md border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex" aria-label={`${r.rating} stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-line-strong"}`} aria-hidden />)}</span>
                <span className="font-semibold">{r.title}</span>
                <Pill tone={statusTone(r.status ?? "")}>{r.status}</Pill>
                {r.verifiedPurchase && <Pill tone="green">Verified buyer</Pill>}
                {(r.fraudScore ?? 0) > 0 && <Pill tone={(r.fraudScore ?? 0) >= 60 ? "red" : "amber"}>Risk score {r.fraudScore}</Pill>}
              </div>
              <p className="py-2 text-body-sm">{r.body}</p>
              <p className="text-caption text-muted">
                {r.authorName} on <Link href={`/product/${r.productSlug}`} className="underline underline-offset-4">{r.productName}</Link> · {when(r.createdAt)}
              </p>
              {(r.fraudFlags ?? []).length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2 text-caption">{(r.fraudFlags ?? []).map((f) => <li key={f} className="rounded-sm bg-amber-50 px-2 py-0.5 text-amber-900">{FLAG_TEXT[f] ?? f}</li>)}</ul>
              )}
              <div className="mt-3 flex gap-2">
                {r.status !== "published" && <Button size="sm" onClick={() => void decide(r, "published")}>Publish</Button>}
                {r.status !== "rejected" && <Button size="sm" variant="danger" onClick={() => void decide(r, "rejected")}>Reject</Button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
