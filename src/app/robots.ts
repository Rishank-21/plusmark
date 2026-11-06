import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/account",
        "/cart",
        "/checkout",
        "/order-confirmation",
        "/search",
        "/wishlist",
        "/track-order",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email"
      ]
    },
    sitemap: `${base}/sitemap.xml`
  };
}
