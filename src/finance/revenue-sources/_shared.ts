/**
 * Revenue source shared primitives — types, snapshot schema, JSONL writer,
 * FX helper.
 *
 * Mirrors src/infra/cost-sources/_shared.ts pattern. Revenue snapshots persist
 * as one JSONL line per source per day at memory/_audit/finance/<YYYY-MM-DD>.jsonl.
 * Directory is gitignored.
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export type RevenueSourceName = "stripe" | "bank-csv" | "invoice-manual" | "paypal" | "crypto";

export interface RevenueSnapshot {
  ts: string;
  source: RevenueSourceName;
  entity: string;
  period: string;
  amount: number;
  currency: string;
  amount_usd_equiv: number;
  fx_rate_used: number;
  fx_rate_source: string;
  fx_rate_age_days: number;
  category: "subscription" | "one-off" | "refund" | "other";
  raw_response_sha256: string;
  provenance: "stripe-api" | "csv-import" | "manual-entry";
}

export interface RevenueFetcher {
  source: RevenueSourceName;
  fetch(period: string, entity: string): Promise<RevenueSnapshot[]>;
}

export function writeRevenueSnapshot(repoRoot: string, snapshot: RevenueSnapshot): string {
  const dir = join(repoRoot, "memory", "_audit", "finance");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const datePart = snapshot.ts.slice(0, 10);
  const path = join(dir, `${datePart}.jsonl`);
  appendFileSync(path, JSON.stringify(snapshot) + "\n", "utf8");
  return path;
}

export async function hashResponse(body: string | object): Promise<string> {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * FX conversion helper — ECB daily reference (placeholder; real ECB integration
 * lands in W3.1.5). Returns rate, source, and age-in-days vs requested date.
 *
 * Per Board REVISE-2: ECB doesn't publish weekend rates. Returns most-recent
 * business-day rate with fx_rate_age_days field for transparency.
 */
export interface FxConversion {
  rate: number;
  source: string;
  age_days: number;
}

export function convertToUsd(
  amount: number,
  fromCurrency: string,
  period: string,
  fxLookup: (from: string, to: string, period: string) => FxConversion | null = stubFxLookup,
): { amount_usd: number; conversion: FxConversion } {
  if (fromCurrency === "USD") {
    return {
      amount_usd: amount,
      conversion: { rate: 1.0, source: "identity", age_days: 0 },
    };
  }
  const conv = fxLookup(fromCurrency, "USD", period);
  if (!conv) {
    throw new Error(`No FX rate available for ${fromCurrency}->USD on ${period}`);
  }
  return {
    amount_usd: amount * conv.rate,
    conversion: conv,
  };
}

/**
 * Stub FX lookup — returns a stable mock rate for testing.
 * Real ECB integration replaces this in W3.1.5.
 */
function stubFxLookup(from: string, to: string, _period: string): FxConversion | null {
  if (from === "EUR" && to === "USD") {
    return { rate: 1.0810, source: "stub-ECB-2026-05-11", age_days: 0 };
  }
  if (from === "GBP" && to === "USD") {
    return { rate: 1.2650, source: "stub-ECB-2026-05-11", age_days: 0 };
  }
  return null;
}
