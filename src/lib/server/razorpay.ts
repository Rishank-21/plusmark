import crypto from "node:crypto";

const API = "https://api.razorpay.com/v1";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  enabled: boolean;
  webhookEnabled: boolean;
}

export function razorpayConfig(): RazorpayConfig {
  const keyId = (process.env.RAZORPAY_API_KEY ?? process.env.RAZORPAY_KEY_ID ?? "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET ?? process.env.RAZORPAY_API_SECRET ?? "").trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET ?? "").trim();
  return {
    keyId,
    keySecret,
    webhookSecret,
    enabled: Boolean(keyId && keySecret),
    webhookEnabled: Boolean(webhookSecret)
  };
}

export class RazorpayError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "RazorpayError";
    this.status = status;
  }
}

async function call<T>(path: string, init: RequestInit, config: RazorpayConfig): Promise<T> {
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  const body = (await response.json().catch(() => null)) as { error?: { description?: string } } | null;
  if (!response.ok) {
    throw new RazorpayError(body?.error?.description ?? "Razorpay rejected the request.", response.status);
  }
  return body as T;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
}

export async function createRazorpayOrder(
  input: { amountPaise: number; receipt: string; notes: Record<string, string> },
  config: RazorpayConfig
): Promise<RazorpayOrder> {
  return call<RazorpayOrder>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: "INR",
        receipt: input.receipt,
        notes: input.notes,
        payment_capture: 1
      })
    },
    config
  );
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
  method: string | null;
  email: string | null;
  contact: string | null;
}

export async function fetchRazorpayPayment(paymentId: string, config: RazorpayConfig): Promise<RazorpayPayment> {
  return call<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`, { method: "GET" }, config);
}

export async function fetchOrderPayments(
  razorpayOrderId: string,
  config: RazorpayConfig
): Promise<RazorpayPayment[]> {
  const result = await call<{ items?: RazorpayPayment[] }>(
    `/orders/${encodeURIComponent(razorpayOrderId)}/payments`,
    { method: "GET" },
    config
  );
  return result.items ?? [];
}

/** Capture an authorized payment when the account is not set to auto-capture. */
export async function captureRazorpayPayment(
  paymentId: string,
  input: { amountPaise: number; currency: string },
  config: RazorpayConfig
): Promise<RazorpayPayment> {
  return call<RazorpayPayment>(
    `/payments/${encodeURIComponent(paymentId)}/capture`,
    {
      method: "POST",
      body: JSON.stringify({ amount: input.amountPaise, currency: input.currency })
    },
    config
  );
}

function safeEqual(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Razorpay checkout handler signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(
  input: { razorpayOrderId: string; razorpayPaymentId: string; signature: string },
  config: RazorpayConfig
): boolean {
  if (!config.enabled) return false;
  const expected = crypto
    .createHmac("sha256", config.keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return safeEqual(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string, config: RazorpayConfig): boolean {
  if (!config.webhookEnabled) return false;
  const expected = crypto.createHmac("sha256", config.webhookSecret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
