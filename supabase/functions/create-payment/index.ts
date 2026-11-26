// Creates (or reuses) a Razorpay order for a placed order. Called by checkout after place_order.
import { adminClient, callerUserId, json, preflight, timingSafeEqual } from "../_shared/common.ts";
import { razorpay } from "../_shared/razorpay.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = String(body.order_id ?? "");
    const guestToken = body.guest_token ? String(body.guest_token) : null;
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return json(req, { error: "bad_order_id" }, 400);

    const db = adminClient();
    const { data: order, error } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (error) throw error;
    if (!order) return json(req, { error: "not_found" }, 404);

    const uid = await callerUserId(req);
    const owns = (uid && order.user_id === uid) ||
      (guestToken && timingSafeEqual(guestToken, order.guest_token));
    if (!owns) return json(req, { error: "not_found" }, 404);

    if (order.payment_method !== "razorpay") return json(req, { error: "not_a_razorpay_order" }, 400);
    if (order.payment_status === "paid") return json(req, { error: "already_paid" }, 409);
    if (!["payment_pending", "payment_failed"].includes(order.status)) {
      return json(req, { error: "order_not_payable", status: order.status }, 409);
    }

    const amountPaise = Math.round(Number(order.total_inr) * 100);
    if (amountPaise < 100) return json(req, { error: "amount_too_small" }, 400);

    // reuse the newest unpaid Razorpay order for the same amount
    const { data: existing } = await db.from("payments").select("provider_order_id, amount_inr")
      .eq("order_id", order.id).eq("status", "created").is("provider_payment_id", null)
      .order("created_at", { ascending: false }).limit(1);
    let rzpOrderId = existing?.[0]?.provider_order_id as string | undefined;
    if (rzpOrderId && Math.round(Number(existing![0].amount_inr) * 100) !== amountPaise) rzpOrderId = undefined;

    if (!rzpOrderId) {
      const created = await razorpay.createOrder(amountPaise, order.order_number, {
        order_id: order.id,
        order_number: order.order_number,
      });
      rzpOrderId = created.id as string;
      const { error: regErr } = await db.rpc("register_payment_attempt", {
        p_order_id: order.id,
        p_provider_order_id: rzpOrderId,
        p_amount_inr: order.total_inr,
      });
      if (regErr) throw regErr;
    }
    if (order.status === "payment_failed") {
      await db.from("orders").update({ status: "payment_pending", payment_status: "pending" }).eq("id", order.id);
    }

    return json(req, {
      key_id: razorpay.keyId(),
      razorpay_order_id: rzpOrderId,
      amount: amountPaise,
      currency: "INR",
      order_number: order.order_number,
      name: "Plusmark",
      description: `Order ${order.order_number}`,
      prefill: { name: order.customer_name ?? "", email: order.email, contact: /^\d{10}$/.test(order.phone) ? `+91${order.phone}` : order.phone },
    });
  } catch (e) {
    console.error("create-payment", e);
    return json(req, { error: "payment_init_failed", message: (e as Error).message }, 502);
  }
});
