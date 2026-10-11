/**
 * Starlight Intelligence System — Cloud Managed Types
 *
 * Strongly-typed definitions for Cloudflare D1 edge replica synchronization,
 * Cloudflare Vectorize ANN search, and Stripe managed cloud subscriptions.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

export type CloudAccountTier = "community" | "pro" | "enterprise";

export type CloudSyncState = "idle" | "syncing" | "synced" | "degraded" | "error";

export interface CloudAccountProfile {
  accountId: string;
  email: string;
  tier: CloudAccountTier;
  createdAt: string;
  activeLicenseKey?: string;
  allocatedAgents: number;
  monthlyVectorQueryLimit: number;
  usedVectorQueries: number;
}

export interface D1SyncRecord {
  id: string;
  vaultName: string;
  entryId: string;
  timestamp: string;
  sha256: string;
  payloadJson: string;
  clientVersion: string;
  syncedAt: string;
}

export interface D1BatchPayload {
  accountId: string;
  vaultName: string;
  records: D1SyncRecord[];
  batchSignature: string;
}

export interface D1SyncResult {
  success: boolean;
  vaultName: string;
  syncedRecordsCount: number;
  remoteCheckpoint: string;
  durationMs: number;
  errors?: string[];
}

export interface VectorizeMatch {
  id: string;
  score: number;
  values?: number[];
  metadata: {
    vault: string;
    topic?: string;
    tags?: string[];
    timestamp: string;
    summary?: string;
  };
}

export interface VectorizeQueryOptions {
  topK?: number;
  filter?: Record<string, string | number | boolean>;
  returnVectors?: boolean;
}

export interface VectorizeQueryResult {
  matches: VectorizeMatch[];
  queryDurationMs: number;
  dimensions: number;
  count: number;
}

export interface StripeCheckoutRequest {
  tier: "pro" | "enterprise";
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  annualBilling?: boolean;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
  tier: CloudAccountTier;
  amountUsd: number;
  billingCadence: "monthly" | "annual";
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, any>;
  };
}

export interface CloudLicenseToken {
  licenseId: string;
  accountId: string;
  tier: CloudAccountTier;
  issuedAt: string;
  expiresAt: string;
  features: string[];
  signature: string;
}
