import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { StripeBillingService } from "../../../../../src/cloud/billing.js";
import type { CloudAccountTier } from "../../../../../src/cloud/types.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      tier?: "pro" | "enterprise";
      accountId?: string;
      customerEmail?: string;
    };

    if (!body.sessionId) {
      return NextResponse.json(
        { ok: false, error: "Missing required sessionId" },
        { status: 400 }
      );
    }

    const tier: CloudAccountTier = body.tier === "enterprise" ? "enterprise" : "pro";
    const accountId = body.accountId?.trim() || `acc_${randomBytes(6).toString("hex")}`;

    const billingService = new StripeBillingService();
    const license = billingService.issueLicenseToken(accountId, tier);

    return NextResponse.json({
      ok: true,
      sessionId: body.sessionId,
      accountId,
      tier,
      license,
      message: "Subscription activated successfully",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to fulfill checkout session",
      },
      { status: 500 }
    );
  }
}
