import { NextResponse } from "next/server";
import {
  fetchOrderPayments,
  razorpayConfig,
  verifyWebhookSignature,
  type RazorpayConfig,
  type RazorpayPayment
} from "@/lib/server/razorpay";
import { serverSupabase } from "@/lib/server/supabase-admin";
import type { Json } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface WebhookBody {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayPayment };
    order?: { entity?: { id?: string; amount_paid?: number; status?: string } };
  };
}

async function confirm(
  razorpayOrderId: string,
  paymentId: string,
  amountPaise: number,
  amountExpected: number | null
) {
  if (amountExpected === null || amountPaise !== Math.round(Number(amountExpected) * 100)) {
    return { updated: false, reason: "amount_mismatch" as const };
  }
  const db = serverSupabase();
  const { data: order, error } = await db
    .from("orders")
    .select("id, reference, payment_status")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (error || !order) return { updated: false, reason: "order_not_found" as const };
  if (order.payment_status === "paid") return { updated: true, reference: order.reference };

  const { data, error: confirmError } = await db.rpc("confirm_razorpay_payment", {
    p_order_id: order.id,
    p_razorpay_order_id: razorpayOrderId,
    p_payment_id: paymentId,
    p_signature: ""
  });
  if (confirmError) return { updated: false, reason: "update_failed" as const };
  return { updated: true, reference: data?.reference ?? order.reference };
}

async function resolvePayment(body: WebhookBody, config: RazorpayConfig): Promise<RazorpayPayment | null> {
  const direct = body.payload?.payment?.entity;
  if (direct?.id) return direct;

  const orderId = body.payload?.order?.entity?.id;
  if (!orderId) return null;
  try {
    const payments = await fetchOrderPayments(orderId, config);
    return payments.find((payment) => payment.captured || payment.status === "captured") ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const config = razorpayConfig();
  if (!config.webhookEnabled) {
    return NextResponse.json({ error: "The webhook secret is not configured." }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!signature || !verifyWebhookSignature(raw, signature, config)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const body = (() => {
    try {
      return JSON.parse(raw) as WebhookBody;
    } catch {
      return null;
    }
  })();
  if (!body?.event) return NextResponse.json({ error: "Malformed webhook payload." }, { status: 400 });

  const eventId =
    request.headers.get("x-razorpay-event-id") ??
    `${body.event}:${body.payload?.payment?.entity?.id ?? body.payload?.order?.entity?.id ?? Date.now()}`;

  const db = serverSupabase();
  const { error: eventError } = await db
    .from("payment_events")
    .insert({ event_id: eventId, provider: "razorpay", event_type: body.event, payload: body as unknown as Json });
  if (eventError) {
    if (eventError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: "The event could not be recorded." }, { status: 500 });
  }

  if (body.event === "payment.captured" || body.event === "order.paid") {
    const payment = await resolvePayment(body, config);
    if (payment?.order_id) {
      const orderId = payment.order_id;
      const { data: order } = await db
        .from("orders")
        .select("total")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();
      await confirm(orderId, payment.id, payment.amount, order?.total ?? null);
    }
  }

  return NextResponse.json({ ok: true });
}
