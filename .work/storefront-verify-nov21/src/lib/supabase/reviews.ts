import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, requireSupabaseBrowserClient, BackendNotConfiguredError } from "./client";
import type { ProductReviewRow } from "./database.types";
export interface ProductReview {
  id: string;
  productSlug: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
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

function toReview(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    productSlug: row.product_slug,
    userId: row.user_id,
    authorName: row.author_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function failure(error: { code?: string; message?: string } | null, fallback: string): ReviewError {
  if (!error) return new ReviewError(fallback);
  if (error.code === "42P01" || error.code === "PGRST205") {
    return new ReviewError("Reviews are not set up on this build yet. Nothing was saved.");
  }
  if (error.code === "23514") {
    return new ReviewError("The rating or text does not meet the review limits. Check the fields and try again.");
  }
  if (error.code === "23505") {
    return new ReviewError("You have already reviewed this board. Edit the review you wrote.");
  }
  if (error.code === "42501" || error.code === "PGRST301") {
    return new ReviewError("You do not have permission to change that review. Sign in again.");
  }
  return new ReviewError(fallback);
}

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

/** Public read: guests can see published reviews, so this does not require a session. */
export async function listProductReviews(productSlug: string): Promise<ProductReview[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_slug", productSlug)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw failure(error, "Reviews could not be loaded. Try again.");
  return (data ?? []).map(toReview);
}

export async function listAllReviews(limit = 200): Promise<ProductReview[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw failure(error, "Reviews could not be loaded. Try again.");
  return (data ?? []).map(toReview);
}

export async function saveProductReview(input: ReviewInput): Promise<ProductReview> {
  const validation = validateReview(input);
  if (validation) throw validation;

  const user = await currentUser();
  const supabase = client();
  const { data, error } = await supabase
    .from("product_reviews")
    .upsert(
      {
        product_slug: input.productSlug,
        user_id: user.id,
        author_name: input.authorName.trim().slice(0, 80) || "Plusmark customer",
        rating: input.rating,
        title: input.title.trim(),
        body: input.body.trim()
      },
      { onConflict: "user_id,product_slug" }
    )
    .select("*")
    .single();

  if (error) throw failure(error, "Your review could not be saved. Nothing was changed.");
  return toReview(data);
}

export async function deleteProductReview(id: string): Promise<void> {
  await currentUser();
  const supabase = client();
  const { error } = await supabase.from("product_reviews").delete().eq("id", id);
  if (error) throw failure(error, "Your review could not be deleted. Nothing was changed.");
}
