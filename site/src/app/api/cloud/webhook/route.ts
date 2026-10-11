import { NextResponse } from "next/server";
import { StripeBillingService } from "../../../../../src/cloud/billing.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const signatureHeader = request.headers.get("stripe-signature") || "";
    const rawBody = await request.text();

    const billingService = new StripeBillingService();
    const isValid = billingService.verifyWebhookSignature(rawBody, signatureHeader);

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid Stripe webhook signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const result = billingService.processWebhookEvent(event);

    return NextResponse.json({
      ok: true,
      processed: true,
      action: result.action,
      licenseId: result.license?.licenseId,
      tier: result.license?.tier,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to process webhook",
      },
      { status: 400 }
    );
  }
}
