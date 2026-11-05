import { NextResponse } from "next/server";
import { requestUser } from "@/lib/server/request-auth";
import { createRazorpayOrder, razorpayConfig, RazorpayError } from "@/lib/server/razorpay";
import { serverSupabase } from "@/lib/server/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  orderId?: string;
}

export async function POST(request: Request) {
  const config = razorpayConfig();
  if (!config.enabled) {
    return NextResponse.json(
      { error: "Online payment is not configured on this deployment. Add Razorpay keys on the server." },
      { status: 503 }
    );
  }

  const user = await requestUser(request);
  if (!user) return NextResponse.json({ error: "Sign in to pay online." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Body | null;
  const orderId = body?.orderId?.trim();
  if (!orderId) return NextResponse.json({ error: "An order id is required." }, { status: 400 });

  const db = serverSupabase();
  const { data: order, error } = await db
    .from("orders")
    .select(
      "id, user_id, reference, total, payment_status, payment_method, razorpay_order_id, contact_email, shipping_address"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "The order could not be read." }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.user_id !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.payment_method !== "razorpay") {
    return NextResponse.json({ error: "This order is not an online payment order." }, { status: 409 });
  }
  if (order.payment_status === "paid") {
    return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
  }
  if (order.total === null || order.total <= 0) {
    return NextResponse.json({ error: "The order total is not confirmed yet." }, { status: 409 });
  }

  const amount = Math.round(Number(order.total) * 100);
  const address = (order.shipping_address ?? {}) as { recipientName?: string; phone?: string };
  const digits = (address.phone ?? "").replace(/\D/g, "").slice(-10);
  const contact = digits.length === 10 ? `+91${digits}` : "";

  let razorpayOrderId = order.razorpay_order_id;
  try {
    if (!razorpayOrderId) {
      const created = await createRazorpayOrder(
        {
          amountPaise: amount,
          receipt: order.reference.slice(0, 40),
          notes: {
            plusmark_order_id: order.id,
            plusmark_reference: order.reference,
            contact_email: order.contact_email
          }
        },
        config
      );
      razorpayOrderId = created.id;
      const { error: saveError } = await db
        .from("orders")
        .update({ razorpay_order_id: razorpayOrderId })
        .eq("id", order.id)
        .is("razorpay_order_id", null);
      if (saveError) {
        return NextResponse.json({ error: "The payment reference could not be saved." }, { status: 500 });
      }
    }
  } catch (reason) {
    const status = reason instanceof RazorpayError ? reason.status : 502;
    return NextResponse.json(
      { error: reason instanceof Error ? reason.message : "Razorpay could not create a payment order." },
      { status }
    );
  }

  return NextResponse.json(
    {
      keyId: config.keyId,
      razorpayOrderId,
      amount,
      currency: "INR",
      reference: order.reference,
      name: "Plusmark Retail",
      description: `Order ${order.reference}`,
      prefill: {
        name: address.recipientName ?? "",
        email: order.contact_email,
        contact
      }
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
