import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, requireSupabaseBrowserClient, BackendNotConfiguredError } from "./client";

/**
 * Product reviews on the Plusmark backend.
 * - Only customers who received the product can review it (checked by the database).
 * - Every review passes automatic fraud checks. Suspicious ones wait for a moderator; the shopper
 *   who wrote one always sees it with a "waiting for review" note.
 */
export interface ProductReview {
  id: string;
  productSlug: string;
  /** Empty for other people's reviews: user ids are never sent to the browser. */
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  /** "published" is public. "pending" is visible to its author and moderators only. */
  status?: "published" | "pending" | "rejected";
  verifiedPurchase?: boolean;
  /** Admin only. */
  fraudScore?: number;
  fraudFlags?: string[];
  productName?: string;
}

export interface ReviewInput {
  productSlug: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
}

export class ReviewError extends Error {
  field?: "rating" | "title" | "body" | "form";
  constructor(message: string, field?: ReviewError["field"]) {
    super(message);
    this.name = "ReviewError";
    this.field = field;
  }
}

export const REVIEW_LIMITS = { titleMin: 3, titleMax: 120, bodyMin: 10, bodyMax: 2000 } as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function client() {
  try {
    return requireSupabaseBrowserClient();
  } catch (error) {
    if (error instanceof BackendNotConfiguredError) {
      throw new ReviewError("Reviews are not connected in this build. Add the Supabase keys to .env.local.");
    }
    throw error;
  }
}

async function currentUser(): Promise<User> {
  const supabase = client();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new ReviewError("Sign in to write a review.", "form");
  return user;
}

function toReview(row: Row, slug: string, userId = ""): ProductReview {
  return {
    id: row.id,
    productSlug: slug,
    userId,
    authorName: row.display_name ?? "Plusmark customer",
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    status: row.status ?? "published",
    verifiedPurchase: Boolean(row.verified_purchase)
  };
}

async function productId(slug: string): Promise<string> {
  const supabase = client();
  const { data, error } = await supabase.rpc("product_id_for_slug" as never, { p_slug: slug } as never);
  if (error || !data) throw new ReviewError("That product could not be found.");
  return data as unknown as string;
}

export function validateReview(input: { rating: number; title: string; body: string }): ReviewError | null {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return new ReviewError("Choose a rating from 1 to 5 stars.", "rating");
  }
  const title = input.title.trim();
  if (title.length < REVIEW_LIMITS.titleMin) return new ReviewError("Add a short headline (at least 3 characters).", "title");
  if (title.length > REVIEW_LIMITS.titleMax) return new ReviewError("Keep the headline under 120 characters.", "title");
  const body = input.body.trim();
  if (body.length < REVIEW_LIMITS.bodyMin) return new ReviewError("Write at least 10 characters about the board.", "body");
  if (body.length > REVIEW_LIMITS.bodyMax) return new ReviewError("Keep the review under 2,000 characters.", "body");
  return null;
}

/** Public read: guests see published reviews. A signed-in author also sees their own held review. */
export async function listProductReviews(productSlug: string): Promise<ProductReview[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const pid = await productId(productSlug).catch(() => null);
  if (!pid) return [];
  const { data, error } = await supabase
    .from("product_reviews" as never)
    .select("id,display_name,rating,title,body,verified_purchase,created_at")
    .eq("product_id" as never, pid as never)
    .order("created_at" as never, { ascending: false })
    .limit(200);
  if (error) throw new ReviewError("Reviews could not be loaded. Try again.");
  const reviews = ((data ?? []) as unknown as Row[]).map((row) => toReview(row, productSlug));

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    const mine = await supabase.rpc("my_review" as never, { p_product_id: pid } as never);
    const row = mine.data as unknown as Row | null;
    if (row?.id) {
      const own = toReview(row, productSlug, user.id);
      const index = reviews.findIndex((review) => review.id === own.id);
      if (index >= 0) reviews[index] = own;
      else if (own.status !== "rejected") reviews.unshift(own);
    }
  }
  return reviews;
}

/** Moderation queue for the admin: fraud score and the reasons it was raised. */
export async function listAllReviews(limit = 200, status: "pending" | "published" | "rejected" | null = null): Promise<ProductReview[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("admin_list_reviews" as never, { p_status: status, p_limit: limit, p_offset: 0 } as never);
  if (error) throw new ReviewError("Reviews could not be loaded. Sign in with your admin code and try again.");
  const rows = ((data as unknown as Row)?.rows ?? []) as Row[];
  return rows.map((row) => ({
    id: row.id,
    productSlug: row.slug,
    productName: row.product,
    userId: "",
    authorName: row.display_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.created_at,
    status: row.status,
    verifiedPurchase: Boolean(row.verified_purchase),
    fraudScore: row.fraud_score,
    fraudFlags: row.fraud_flags
  }));
}

export async function moderateReview(id: string, status: "published" | "rejected" | "pending", note?: string): Promise<void> {
  const supabase = client();
  const { error } = await supabase.rpc("admin_moderate_review" as never, { p_review_id: id, p_status: status, p_note: note ?? null } as never);
  if (error) throw new ReviewError("The review could not be updated.");
}

export async function saveProductReview(input: ReviewInput): Promise<ProductReview> {
  const validation = validateReview(input);
  if (validation) throw validation;
  const user = await currentUser();
  const supabase = client();
  const pid = await productId(input.productSlug);
  const { data, error } = await supabase.rpc(
    "submit_review" as never,
    { p_product_id: pid, p_rating: input.rating, p_title: input.title.trim(), p_body: input.body.trim() } as never
  );
  if (error) throw new ReviewError("Your review could not be saved. Nothing was changed.");
  const result = data as unknown as Row;
  if (!result?.ok) throw new ReviewError(String(result?.message ?? "Your review could not be saved."), "form");
  const mine = await supabase.rpc("my_review" as never, { p_product_id: pid } as never);
  const row = mine.data as unknown as Row | null;
  if (!row?.id) throw new ReviewError("Your review was saved but could not be read back.");
  return toReview(row, input.productSlug, user.id);
}

export async function deleteProductReview(id: string): Promise<void> {
  await currentUser();
  const supabase = client();
  const { error } = await supabase.rpc("delete_my_review_by_id" as never, { p_review_id: id } as never);
  if (error) throw new ReviewError("Your review could not be deleted. Nothing was changed.");
}
