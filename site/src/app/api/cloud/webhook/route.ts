import { NextResponse } from "next/server";
import { StripeBillingService, PolarBillingService } from "../../../../../src/cloud/billing.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const stripeSig = request.headers.get("stripe-signature");
    const webhookId = request.headers.get("webhook-id");
    const webhookTimestamp = request.headers.get("webhook-timestamp");
    const webhookSignature =
      request.headers.get("webhook-signature") || request.headers.get("polar-webhook-signature");

    if (stripeSig) {
      // Process Stripe Webhook
      const billingService = new StripeBillingService();
      const isValid = billingService.verifyWebhookSignature(rawBody, stripeSig);

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
        merchant: "stripe",
        processed: true,
        action: result.action,
        licenseId: result.license?.licenseId,
        tier: result.license?.tier,
      });
    }

    if (webhookSignature || webhookId) {
      // Process Polar.sh Webhook (Standard Webhooks format)
      const polarBilling = new PolarBillingService();
      const isValid = polarBilling.verifyWebhookSignature(rawBody, {
        webhookId: webhookId || undefined,
        webhookTimestamp: webhookTimestamp || undefined,
        webhookSignature: webhookSignature || undefined,
      });

      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: "Invalid Polar webhook signature" },
          { status: 401 }
        );
      }

      const event = JSON.parse(rawBody);
      const result = polarBilling.processWebhookEvent(event);

      return NextResponse.json({
        ok: true,
        merchant: "polar",
        processed: true,
        action: result.action,
        licenseId: result.license?.licenseId,
        tier: result.license?.tier,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Missing webhook signature header" },
      { status: 400 }
    );
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

