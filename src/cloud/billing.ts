/**
 * Starlight Intelligence System — Managed Cloud Billing & Stripe Integration
 *
 * Implements checkout session generation, HMAC-SHA256 webhook signature validation,
 * and cryptographic license token issuance for Pro ($29/mo) and Enterprise ($199/mo) tiers.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { createHmac, randomBytes } from "node:crypto";
import type {
  CloudAccountTier,
  CloudLicenseToken,
  PolarBillingConfig,
  PolarWebhookEvent,
  StripeCheckoutRequest,
  StripeCheckoutResponse,
  StripeWebhookEvent,
} from "./types.js";

export interface StripeBillingConfig {
  secretKey?: string;
  webhookSecret?: string;
  appBaseUrl?: string;
}

export class StripeBillingService {
  private config: StripeBillingConfig;

  constructor(config: StripeBillingConfig = {}) {
    this.config = {
      secretKey: config.secretKey || process.env.STRIPE_SECRET_KEY,
      webhookSecret: config.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_starlight_secret",
      appBaseUrl: config.appBaseUrl || "https://starlightintelligence.org",
    };
  }

  /**
   * Creates a checkout session for Starlight Managed Cloud.
   * Defaults to Polar.sh (Developer MoR with automated EU VAT) for Pro & Team,
   * and Stripe for Enterprise Mesh.
   */
  public async createCheckoutSession(request: StripeCheckoutRequest): Promise<StripeCheckoutResponse> {
    const isAnnual = !!request.annualBilling;
    let baseMonthlyUsd = 29;
    if (request.tier === "team") {
      baseMonthlyUsd = 99;
    } else if (request.tier === "enterprise") {
      baseMonthlyUsd = 199;
    }

    const merchant = request.merchant || (request.tier === "enterprise" ? "stripe" : "polar");

    // 20% annual discount
    const amountUsd = isAnnual
      ? Math.round(baseMonthlyUsd * 12 * 0.8)
      : baseMonthlyUsd;

    const sessionId = `cs_starlight_${randomBytes(12).toString("hex")}`;
    const checkoutUrl = `${this.config.appBaseUrl}/checkout?session_id=${sessionId}&tier=${request.tier}&cadence=${isAnnual ? "annual" : "monthly"}&merchant=${merchant}`;

    return {
      sessionId,
      checkoutUrl,
      tier: request.tier,
      amountUsd,
      billingCadence: isAnnual ? "annual" : "monthly",
      merchant,
    };
  }

  /**
   * Verifies Stripe Webhook signature using HMAC-SHA256.
   * Format of Stripe header: t=timestamp,v1=signature
   */
  public verifyWebhookSignature(payloadRaw: string, signatureHeader: string, toleranceSeconds = 300): boolean {
    if (!signatureHeader || !this.config.webhookSecret) {
      return false;
    }

    const items = signatureHeader.split(",").reduce<Record<string, string>>((acc, part) => {
      const [key, val] = part.split("=");
      if (key && val) acc[key.trim()] = val.trim();
      return acc;
    }, {});

    const timestamp = items["t"];
    const expectedSig = items["v1"];

    if (!timestamp || !expectedSig) {
      return false;
    }

    // Check timestamp tolerance
    const nowSeconds = Math.floor(Date.now() / 1000);
    const eventTime = parseInt(timestamp, 10);
    if (isNaN(eventTime) || Math.abs(nowSeconds - eventTime) > toleranceSeconds) {
      return false;
    }

    const signedPayload = `${timestamp}.${payloadRaw}`;
    const computedSig = createHmac("sha256", this.config.webhookSecret)
      .update(signedPayload)
      .digest("hex");

    return computedSig === expectedSig;
  }

  /**
   * Parses and processes a verified Stripe webhook event.
   */
  public processWebhookEvent(event: StripeWebhookEvent): { action: string; license?: CloudLicenseToken } {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const accountId = session.client_reference_id || `acc_${randomBytes(8).toString("hex")}`;
        const tierMeta = session.metadata?.tier;
        const tier: CloudAccountTier =
          tierMeta === "enterprise" ? "enterprise" : tierMeta === "team" ? "team" : "pro";
        const license = this.issueLicenseToken(accountId, tier, 30, "stripe");
        return { action: "license_granted", license };
      }
      case "customer.subscription.deleted": {
        return { action: "license_revoked" };
      }
      default:
        return { action: "ignored" };
    }
  }

  /**
   * Mints a cryptographically signed license token for client-side authentication.
   * Empowers Starlight Pro with edge semantic mirroring, cross-device twin sync,
   * Queen swarm autopilot, semantic caching, and free verified pack entitlements.
   */
  public issueLicenseToken(
    accountId: string,
    tier: CloudAccountTier,
    durationDays = 30,
    merchant?: "polar" | "stripe"
  ): CloudLicenseToken {
    const licenseId = `lic_${randomBytes(10).toString("hex")}`;
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const resolvedMerchant = merchant || (tier === "enterprise" ? "stripe" : "polar");

    const features = [
      "d1_edge_sync",
      "vectorize_ann_search",
      tier === "enterprise" ? "unlimited_agents" : (tier === "team" ? "allocated_agents:50" : "allocated_agents:10"),
      tier === "enterprise" ? "sla_9999" : (tier === "team" ? "team_sla" : "community_sla"),
      // Starlight Pro & Team Superpowers
      "edge_semantic_mirror",
      "twin_cloud_sync",
      "queen_autopilot",
      "semantic_cache",
      // Verified Pack Inclusions (Free Value)
      "pack:safety/secret-detector",
      "pack:orchestration/multi-agent-coordination",
      "pack:memory/vault-management",
      // Tier-specific expansions
      ...(tier !== "community" ? ["pro_packs_access", "marketplace_publishing_unlocked"] : []),
      ...(tier === "team" || tier === "enterprise" ? ["shared_team_vaults", "team_rbac"] : []),
      ...(tier === "enterprise" ? ["dedicated_edge_tenant", "fail_closed_sentinel_mesh"] : []),
    ];

    const payload = `${licenseId}:${accountId}:${tier}:${now.toISOString()}:${expires.toISOString()}`;
    const signature = createHmac("sha256", this.config.webhookSecret || "starlight_license_key")
      .update(payload)
      .digest("hex");

    return {
      licenseId,
      accountId,
      tier,
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      features,
      signature,
      merchant: resolvedMerchant,
    };
  }

  /**
   * Validates a license token string or object.
   */
  public validateLicenseToken(token: CloudLicenseToken): boolean {
    const payload = `${token.licenseId}:${token.accountId}:${token.tier}:${token.issuedAt}:${token.expiresAt}`;
    const expectedSig = createHmac("sha256", this.config.webhookSecret || "starlight_license_key")
      .update(payload)
      .digest("hex");

    if (token.signature !== expectedSig) {
      return false;
    }

    const expiresAt = new Date(token.expiresAt).getTime();
    return expiresAt > Date.now();
  }
}

export class PolarBillingService {
  private config: PolarBillingConfig;

  constructor(config: PolarBillingConfig = {}) {
    this.config = {
      accessToken: config.accessToken || process.env.POLAR_ACCESS_TOKEN,
      webhookSecret: config.webhookSecret || process.env.POLAR_WEBHOOK_SECRET || "whsec_test_polar_secret",
      appBaseUrl: config.appBaseUrl || "https://starlightintelligence.org",
    };
  }

  /**
   * Verifies Polar.sh Webhook signature using Standard Webhooks format.
   * Standard Webhooks header format:
   * webhook-id: <unique-id>
   * webhook-timestamp: <timestamp-seconds>
   * webhook-signature: v1,<base64-signature> (or space-delimited list of signatures)
   */
  public verifyWebhookSignature(
    rawBody: string,
    headers: {
      webhookId?: string;
      webhookTimestamp?: string;
      webhookSignature?: string;
      polarSignature?: string;
    },
    toleranceSeconds = 300
  ): boolean {
    const webhookSecret = this.config.webhookSecret;
    if (!webhookSecret) return false;

    // Direct Polar signature fallback
    if (headers.polarSignature && !headers.webhookSignature) {
      const computed = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
      return computed === headers.polarSignature;
    }

    const id = headers.webhookId;
    const timestamp = headers.webhookTimestamp;
    const signature = headers.webhookSignature;

    if (!id || !timestamp || !signature) {
      return false;
    }

    // Check timestamp tolerance
    const nowSeconds = Math.floor(Date.now() / 1000);
    const eventTime = parseInt(timestamp, 10);
    if (isNaN(eventTime) || Math.abs(nowSeconds - eventTime) > toleranceSeconds) {
      return false;
    }

    // Standard Webhook signed payload: <id>.<timestamp>.<rawBody>
    const signedPayload = `${id}.${timestamp}.${rawBody}`;

    // Clean secret if prefixed with whsec_
    const secretKey = webhookSecret.startsWith("whsec_")
      ? Buffer.from(webhookSecret.slice(6), "base64")
      : Buffer.from(webhookSecret);

    const expectedHmacBase64 = createHmac("sha256", secretKey)
      .update(signedPayload)
      .digest("base64");

    const expectedHmacHex = createHmac("sha256", secretKey)
      .update(signedPayload)
      .digest("hex");

    // signature header can contain multiple signatures: "v1,sig1 v1,sig2"
    const passedSignatures = signature.split(" ").map((s) => s.trim());

    for (const sig of passedSignatures) {
      const value = sig.startsWith("v1,") ? sig.slice(3) : sig;
      if (value === expectedHmacBase64 || value === expectedHmacHex) {
        return true;
      }
    }

    // Also support fallback with raw string secret if base64 decoding was used above
    const rawExpectedBase64 = createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("base64");
    const rawExpectedHex = createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    for (const sig of passedSignatures) {
      const value = sig.startsWith("v1,") ? sig.slice(3) : sig;
      if (value === rawExpectedBase64 || value === rawExpectedHex) {
        return true;
      }
    }

    return false;
  }

  /**
   * Parses and processes a verified Polar.sh webhook event.
   */
  public processWebhookEvent(event: PolarWebhookEvent): { action: string; license?: CloudLicenseToken } {
    switch (event.type) {
      case "order.created":
      case "subscription.created":
      case "subscription.active":
      case "subscription.updated": {
        const data = event.data || {};
        const accountId =
          data.metadata?.accountId ||
          data.customer?.email ||
          data.customer_id ||
          data.customer?.id ||
          `acc_polar_${randomBytes(6).toString("hex")}`;

        const tierMeta = (
          (data.metadata?.tier as string) ||
          data.subscription_tier ||
          data.product?.name ||
          ""
        ).toLowerCase();

        let tier: CloudAccountTier = "pro";
        if (tierMeta.includes("enterprise")) {
          tier = "enterprise";
        } else if (tierMeta.includes("team")) {
          tier = "team";
        }

        const stripeService = new StripeBillingService({ webhookSecret: this.config.webhookSecret });
        const license = stripeService.issueLicenseToken(accountId, tier, 30, "polar");
        return { action: "license_granted", license };
      }
      case "subscription.canceled":
      case "subscription.revoked": {
        return { action: "license_revoked" };
      }
      default:
        return { action: "ignored" };
    }
  }
}

