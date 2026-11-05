import { requireSupabaseBrowserClient } from "@/lib/supabase/client";

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: { description?: string; reason?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

interface CreatedPayment {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  reference: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}

interface VerifiedPayment {
  ok: boolean;
  orderId: string;
  reference: string;
  paymentStatus: string;
}

let scriptPromise: Promise<void> | null = null;

function loadCheckout(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Payments open in the browser only."));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("The Razorpay checkout script could not be loaded. Check the connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

async function accessToken(): Promise<string> {
  const supabase = requireSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in again to pay online.");
  return token;
}

async function post<T>(path: string, body: unknown, token: string): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(data?.error ?? "The payment request was rejected.");
  return data as T;
}

export type PaymentResult = "paid" | "dismissed";

/**
 * Opens the gateway's hosted checkout. The browser never sees the key secret and
 * never marks the order paid: the verify endpoint checks the HMAC and the payment
 * amount before the database moves the order out of payment_pending.
 */
export async function startRazorpayCheckout(input: {
  orderId: string;
  onPaid: (result: VerifiedPayment) => void;
}): Promise<PaymentResult> {
  const token = await accessToken();
  const created = await post<CreatedPayment>("/api/payments/razorpay/order", { orderId: input.orderId }, token);
  await loadCheckout();

  return new Promise<PaymentResult>((resolve, reject) => {
    let settled = false;
    const finish = (outcome: PaymentResult) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      fail(new Error("The Razorpay checkout could not start."));
      return;
    }

    const checkout = new Razorpay({
      key: created.keyId,
      amount: created.amount,
      currency: created.currency,
      name: created.name,
      description: created.description,
      order_id: created.razorpayOrderId,
      prefill: created.prefill,
      theme: { color: "#17324F" },
      modal: {
        ondismiss: () => finish("dismissed")
      },
      handler: (response: RazorpayHandlerResponse) => {
        void (async () => {
          try {
            const verified = await post<VerifiedPayment>(
              "/api/payments/razorpay/verify",
              {
                orderId: input.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              token
            );
            input.onPaid(verified);
            finish("paid");
          } catch (reason) {
            fail(reason instanceof Error ? reason : new Error("The payment could not be verified."));
          }
        })();
      }
    });

    checkout.on("payment.failed", (response) => {
      fail(
        new Error(
          response?.error?.description ??
            "The payment attempt failed. Nothing was confirmed; you can retry from the order page."
        )
      );
    });

    checkout.open();
  });
}
