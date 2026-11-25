import { NextResponse } from "next/server";
import { razorpayConfig } from "@/lib/server/razorpay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const config = razorpayConfig();
  return NextResponse.json(
    {
      enabled: config.enabled,
      webhookConfigured: config.webhookEnabled,
      testMode: config.keyId.startsWith("rzp_test_")
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
