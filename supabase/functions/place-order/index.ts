// The only way to place an order. Checks the captcha (optional), the caller's network, and then
// runs the internal _place_order function as the service role on behalf of the signed-in user or guest.
import { adminClient, callerUserId, json, preflight } from "../_shared/common.ts";

function clientIp(req: Request): string | null {
  const raw = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  return raw.split(",")[0].trim() || null;
}

async function captchaOk(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) return false;
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  try {
    const b = await req.json().catch(() => null);
    if (!b || typeof b !== "object") return json(req, { ok: false, error: "bad_request" }, 400);

    const ip = clientIp(req);
    const uid = await callerUserId(req);

    // Guests must pass the captcha when it is switched on (REQUIRE_CAPTCHA=true). Signed-in users are
    // already rate limited per account and per network.
    if (!uid && Deno.env.get("REQUIRE_CAPTCHA") === "true") {
      if (!(await captchaOk(b.captcha_token, ip))) {
        return json(req, { ok: false, error: "captcha_failed", message: "Please complete the security check and try again." }, 400);
      }
    }

    const db = adminClient();
    const { data, error } = await db.rpc("_place_order", {
      p_uid: uid,
      p_ip: ip,
      p_items: b.items,
      p_email: b.email ?? null,
      p_phone: b.phone ?? null,
      p_customer_name: b.customer_name ?? null,
      p_shipping_address: b.shipping_address,
      p_billing_address: b.billing_address ?? null,
      p_coupon: b.coupon ?? null,
      p_payment_method: b.payment_method ?? "razorpay",
      p_notes: b.notes ?? null,
    });
    if (error) {
      const msg = error.message ?? "";
      const status = /invalid_address|insufficient_stock/.test(msg) ? 400 : 500;
      const friendly = msg.startsWith("invalid_address") ? msg.replace(/^invalid_address:\s*/, "")
        : msg.startsWith("insufficient_stock") ? "An item just sold out. Please review your cart." : "Could not place the order.";
      if (status === 500) console.error("place-order", error);
      return json(req, { ok: false, error: status === 400 ? "invalid" : "internal", message: friendly }, status);
    }
    const status = data?.ok ? 200 : data?.error === "rate_limited" || data?.error === "too_many_pending" ? 429 : 409;
    return json(req, data, status);
  } catch (e) {
    console.error("place-order", e);
    return json(req, { ok: false, error: "internal", message: "Could not place the order." }, 500);
  }
});
