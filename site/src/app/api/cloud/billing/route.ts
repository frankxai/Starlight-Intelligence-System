import { NextResponse } from "next/server";
import { StripeBillingService } from "../../../../../src/cloud/billing.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tier?: "pro" | "team" | "enterprise";
      annualBilling?: boolean;
      customerEmail?: string;
      merchant?: "polar" | "stripe";
    };

    const tier =
      body.tier === "enterprise" ? "enterprise" : body.tier === "team" ? "team" : "pro";
    const annualBilling = !!body.annualBilling;

    const billingService = new StripeBillingService();
    const session = await billingService.createCheckoutSession({
      tier,
      annualBilling,
      customerEmail: body.customerEmail,
      merchant: body.merchant,
      successUrl: "https://starlightintelligence.org/cloud?session=success",
      cancelUrl: "https://starlightintelligence.org/cloud?session=cancelled",
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
      tier: session.tier,
      amountUsd: session.amountUsd,
      billingCadence: session.billingCadence,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to create checkout session",
      },
      { status: 400 }
    );
  }
}
