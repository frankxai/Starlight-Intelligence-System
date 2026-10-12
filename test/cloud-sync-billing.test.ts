/**
 * Starlight Intelligence System — Cloud Managed & Edge Mirror Test Suite
 *
 * Validates Cloudflare D1 edge replica synchronization, Cloudflare Vectorize ANN search,
 * and Stripe subscription checkout and webhook verification.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  D1SyncManager,
  VectorizeClient,
  StripeBillingService,
  PolarBillingService,
} from "../dist/cloud/index.js";

describe("Cloud Managed Subsystem & Edge Mirror", () => {
  describe("Cloudflare D1 Edge Replica Sync", () => {
    const syncManager = new D1SyncManager({
      accountId: "test-cloudflare-account-123",
      databaseId: "d1-test-db-id",
    });

    it("parses valid JSON vault line into D1SyncRecord", () => {
      const line = JSON.stringify({
        id: "pattern-nextjs-rsc",
        content: "Always use server components by default",
        category: "technical",
        timestamp: "2026-10-10T12:00:00Z",
      });

      const record = syncManager.parseVaultEntry("technical", line, 0);
      assert.ok(record, "Record should parse successfully");
      assert.equal(record.id, "technical_pattern-nextjs-rsc");
      assert.equal(record.vaultName, "technical");
      assert.equal(record.entryId, "pattern-nextjs-rsc");
      assert.ok(record.sha256.length === 64, "SHA-256 digest must be 64 hex characters");
    });

    it("skips blank and comment lines", () => {
      assert.equal(syncManager.parseVaultEntry("technical", "   "), null);
      assert.equal(syncManager.parseVaultEntry("technical", "# Comment line"), null);
      assert.equal(syncManager.parseVaultEntry("technical", "// Another comment"), null);
    });

    it("computes deterministic SHA-256 hash for record contents", () => {
      const hash1 = syncManager.computeRecordHash("strategic", "item-1", "2026-10-10T00:00:00Z", '{"test":true}');
      const hash2 = syncManager.computeRecordHash("strategic", "item-1", "2026-10-10T00:00:00Z", '{"test":true}');
      const hash3 = syncManager.computeRecordHash("strategic", "item-1", "2026-10-10T00:00:00Z", '{"test":false}');

      assert.equal(hash1, hash2, "Identical records must yield identical hashes");
      assert.notEqual(hash1, hash3, "Different payloads must yield different hashes");
    });

    it("generates signed batch payload with cryptographic signature", () => {
      const records = [
        {
          id: "tech_1",
          vaultName: "technical",
          entryId: "1",
          timestamp: "2026-10-10T00:00:00Z",
          sha256: "abc",
          payloadJson: "{}",
          clientVersion: "8.3.0",
          syncedAt: "2026-10-10T00:00:00Z",
        },
      ];

      const batch = syncManager.createBatchPayload("technical", records);
      assert.equal(batch.accountId, "test-cloudflare-account-123");
      assert.equal(batch.vaultName, "technical");
      assert.equal(batch.records.length, 1);
      assert.ok(batch.batchSignature.length === 64, "Batch signature must be SHA-256 hex");
    });

    it("executes simulated syncVault returning checkpoint and timing", async () => {
      const records = [
        {
          id: "op_1",
          vaultName: "operational",
          entryId: "op-1",
          timestamp: "2026-10-10T00:00:00Z",
          sha256: "def",
          payloadJson: "{}",
          clientVersion: "8.3.0",
          syncedAt: "2026-10-10T00:00:00Z",
        },
      ];

      const res = await syncManager.syncVault("operational", records);
      assert.equal(res.success, true);
      assert.equal(res.syncedRecordsCount, 1);
      assert.ok(res.remoteCheckpoint.length > 0);
      assert.ok(res.durationMs >= 0);
    });
  });

  describe("Cloudflare Vectorize ANN Search", () => {
    const vectorize = new VectorizeClient({
      accountId: "test-cf-account",
      dimensions: 4,
    });

    it("calculates accurate cosine similarity", () => {
      // Identical vectors -> 1.0
      assert.equal(Math.round(vectorize.computeCosineSimilarity([1, 0, 0, 0], [1, 0, 0, 0]) * 100) / 100, 1.0);
      // Orthogonal vectors -> 0.0
      assert.equal(Math.round(vectorize.computeCosineSimilarity([1, 0, 0, 0], [0, 1, 0, 0]) * 100) / 100, 0.0);
      // Opposite vectors -> -1.0
      assert.equal(Math.round(vectorize.computeCosineSimilarity([1, 0, 0, 0], [-1, 0, 0, 0]) * 100) / 100, -1.0);
    });

    it("upserts and queries nearest neighbors by cosine similarity", async () => {
      await vectorize.upsertVectors([
        {
          id: "vec-frontend",
          values: [0.9, 0.1, 0.0, 0.0],
          metadata: { vault: "technical", topic: "frontend", timestamp: "2026-10-10" },
        },
        {
          id: "vec-backend",
          values: [0.1, 0.9, 0.0, 0.0],
          metadata: { vault: "technical", topic: "backend", timestamp: "2026-10-10" },
        },
        {
          id: "vec-philosophy",
          values: [0.0, 0.0, 0.1, 0.9],
          metadata: { vault: "wisdom", topic: "stoicism", timestamp: "2026-10-10" },
        },
      ]);

      assert.equal(vectorize.size(), 3);

      // Query close to frontend vector
      const queryResult = await vectorize.query([0.85, 0.15, 0.0, 0.0], { topK: 2 });
      assert.equal(queryResult.count, 2);
      assert.equal(queryResult.matches[0].id, "vec-frontend");
      assert.ok(queryResult.matches[0].score > 0.95);
    });

    it("filters nearest neighbors by metadata fields", async () => {
      const queryResult = await vectorize.query([0.5, 0.5, 0.5, 0.5], {
        filter: { vault: "wisdom" },
      });

      assert.equal(queryResult.count, 1);
      assert.equal(queryResult.matches[0].id, "vec-philosophy");
      assert.equal(queryResult.matches[0].metadata.vault, "wisdom");
    });
  });

  describe("Stripe Managed Cloud Billing & License Issuance", () => {
    const testSecret = "whsec_starlight_test_secret_key_42";
    const billing = new StripeBillingService({
      webhookSecret: testSecret,
    });

    it("creates checkout session for Pro and Enterprise with annual discount", async () => {
      const proMonthly = await billing.createCheckoutSession({
        tier: "pro",
        annualBilling: false,
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      });
      assert.equal(proMonthly.amountUsd, 29);
      assert.equal(proMonthly.billingCadence, "monthly");

      const proAnnual = await billing.createCheckoutSession({
        tier: "pro",
        annualBilling: true,
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      });
      // 29 * 12 * 0.8 = 278.4 -> 278
      assert.equal(proAnnual.amountUsd, 278);
      assert.equal(proAnnual.billingCadence, "annual");

      const entMonthly = await billing.createCheckoutSession({
        tier: "enterprise",
        annualBilling: false,
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      });
      assert.equal(entMonthly.amountUsd, 199);
    });

    it("verifies authentic Stripe webhook signature via HMAC-SHA256", () => {
      const payload = JSON.stringify({ id: "evt_123", type: "checkout.session.completed" });
      const now = Math.floor(Date.now() / 1000);
      const signature = createHmac("sha256", testSecret)
        .update(`${now}.${payload}`)
        .digest("hex");
      const header = `t=${now},v1=${signature}`;

      assert.equal(billing.verifyWebhookSignature(payload, header), true);
    });

    it("rejects forged webhook signatures and expired timestamps", () => {
      const payload = JSON.stringify({ id: "evt_123" });
      const now = Math.floor(Date.now() / 1000);
      const forgedHeader = `t=${now},v1=deadbeefcafebabe0123456789abcdef`;

      assert.equal(billing.verifyWebhookSignature(payload, forgedHeader), false);

      // Expired timestamp (10 minutes ago, exceeds 300s tolerance)
      const oldTime = now - 600;
      const oldSig = createHmac("sha256", testSecret)
        .update(`${oldTime}.${payload}`)
        .digest("hex");
      const expiredHeader = `t=${oldTime},v1=${oldSig}`;

      assert.equal(billing.verifyWebhookSignature(payload, expiredHeader), false);
    });

    it("issues and validates signed license tokens", () => {
      const license = billing.issueLicenseToken("acc_frank_test", "pro", 30);
      assert.equal(license.accountId, "acc_frank_test");
      assert.equal(license.tier, "pro");
      assert.ok(license.features.includes("d1_edge_sync"));
      assert.ok(license.signature.length === 64);

      assert.equal(billing.validateLicenseToken(license), true);

      // Tampered license must fail validation
      const tampered = { ...license, tier: "enterprise" as const };
      assert.equal(billing.validateLicenseToken(tampered), false);
    });

    it("processes checkout.session.completed event and returns license", () => {
      const event = {
        id: "evt_test_checkout",
        type: "checkout.session.completed",
        created: Date.now(),
        data: {
          object: {
            client_reference_id: "acc_solo_founder",
            metadata: { tier: "enterprise" },
          },
        },
      };

      const result = billing.processWebhookEvent(event);
      assert.equal(result.action, "license_granted");
      assert.ok(result.license);
      assert.equal(result.license?.tier, "enterprise");
      assert.ok(result.license?.features.includes("unlimited_agents"));
    });

    it("handles checkout fulfillment and sandbox issuance with unique accounts", () => {
      const proLicense = billing.issueLicenseToken("acc_dev_sandbox", "pro", 30);
      assert.equal(proLicense.accountId, "acc_dev_sandbox");
      assert.equal(proLicense.tier, "pro");
      assert.ok(proLicense.features.includes("allocated_agents:10"));

      const entLicense = billing.issueLicenseToken("acc_enterprise_fleet", "enterprise", 365);
      assert.equal(entLicense.accountId, "acc_enterprise_fleet");
      assert.equal(entLicense.tier, "enterprise");
      assert.ok(entLicense.features.includes("unlimited_agents"));
      assert.ok(entLicense.features.includes("sla_9999"));
    });
  });

  describe("Polar.sh Managed Cloud MoR & Webhook Verification", () => {
    const polarSecret = "whsec_polar_test_secret_key_88";
    const polarBilling = new PolarBillingService({
      webhookSecret: polarSecret,
    });

    it("verifies authentic Polar standard webhook signature (v1,<base64>)", () => {
      const payload = JSON.stringify({
        type: "subscription.created",
        data: { id: "sub_polar_1", customer: { email: "frank@example.com" }, metadata: { tier: "pro" } },
      });
      const webhookId = "msg_polar_test_101";
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedPayload = `${webhookId}.${timestamp}.${payload}`;
      const sigBase64 = createHmac("sha256", polarSecret)
        .update(signedPayload)
        .digest("base64");
      const webhookSignature = `v1,${sigBase64}`;

      const isValid = polarBilling.verifyWebhookSignature(payload, {
        webhookId,
        webhookTimestamp: timestamp,
        webhookSignature,
      });
      assert.equal(isValid, true);
    });

    it("rejects forged Polar signatures and expired timestamps", () => {
      const payload = JSON.stringify({ type: "order.created" });
      const webhookId = "msg_polar_test_102";
      const now = Math.floor(Date.now() / 1000);

      const isInvalid = polarBilling.verifyWebhookSignature(payload, {
        webhookId,
        webhookTimestamp: now.toString(),
        webhookSignature: "v1,invalidBase64Signature==",
      });
      assert.equal(isInvalid, false);

      const oldTimestamp = (now - 600).toString();
      const signedPayload = `${webhookId}.${oldTimestamp}.${payload}`;
      const oldSig = createHmac("sha256", polarSecret)
        .update(signedPayload)
        .digest("base64");

      const isExpired = polarBilling.verifyWebhookSignature(payload, {
        webhookId,
        webhookTimestamp: oldTimestamp,
        webhookSignature: `v1,${oldSig}`,
      });
      assert.equal(isExpired, false);
    });

    it("processes subscription.created event granting Pro license", () => {
      const event = {
        type: "subscription.created",
        data: {
          id: "sub_polar_pro_01",
          customer: { email: "builder@starlightintelligence.ai" },
          metadata: { tier: "pro" },
        },
      };

      const result = polarBilling.processWebhookEvent(event);
      assert.equal(result.action, "license_granted");
      assert.ok(result.license);
      assert.equal(result.license?.merchant, "polar");
      assert.equal(result.license?.tier, "pro");
      assert.ok(result.license?.features.includes("edge_semantic_mirror"));
      assert.ok(result.license?.features.includes("twin_cloud_sync"));
    });

    it("processes subscription.active event granting Team license", () => {
      const event = {
        type: "subscription.active",
        data: {
          id: "sub_polar_team_02",
          customer_id: "cust_team_lead",
          subscription_tier: "team",
        },
      };

      const result = polarBilling.processWebhookEvent(event);
      assert.equal(result.action, "license_granted");
      assert.ok(result.license);
      assert.equal(result.license?.tier, "team");
      assert.ok(result.license?.features.includes("shared_team_vaults"));
      assert.ok(result.license?.features.includes("team_rbac"));
    });

    it("processes subscription.canceled revoking license", () => {
      const event = {
        type: "subscription.canceled",
        data: { id: "sub_polar_cancel" },
      };

      const result = polarBilling.processWebhookEvent(event);
      assert.equal(result.action, "license_revoked");
    });
  });
});

