/**
 * Prototype switches. Everything gated here is demonstration-only, so nothing
 * pretends to be production logic.
 */

/** Plusmark publishes no list prices. Flip this off to render every variant
 *  as "Price on request" with the quotation path instead of a cart checkout. */
export const DEMO_PRICING_ENABLED = process.env.NEXT_PUBLIC_DEMO_PRICING !== "off";

/** Rate card used only to exercise cart → checkout → payment locally. */
export const DEMO_PRICING_LABEL = "Demo price — not a Plusmark quotation";

export const DEMO_SESSION_ENABLED = true;

/** Enquiries and orders written by the prototype live in localStorage only. */
export const STORAGE_KEYS = {
  cart: "plusmark.cart.v1",
  wishlist: "plusmark.wishlist.v1",
  session: "plusmark.session.v1",
  admin: "plusmark.admin.v1",
  draftEnquiry: "plusmark.enquiry.draft.v1",
  recentSearches: "plusmark.search.recent.v1",
  savedCheckout: "plusmark.checkout.v1",
  pincode: "plusmark.pincode.v1"
} as const;

/** Link to the separate sales site for schools, offices and dealers. */
export const B2B_SITE_URL = process.env.NEXT_PUBLIC_B2B_SITE_URL ?? "https://plusmarkboards.com";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const META_TITLE_SUFFIX = "Plusmark — Writing & Display Systems";
