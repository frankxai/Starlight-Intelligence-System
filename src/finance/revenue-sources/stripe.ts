/**
 * Stripe revenue source — wraps Stripe REST API (payouts + balance history).
 *
 * Per Board REVISE-3 (2026-05-11): Stripe is the SOLE Phase 1 source.
 * Arcanea BV is the SOLE Phase 1 entity. 14-day validation before promoting
 * to Phase 1.5 (bank CSV + manual invoice + Starlight Holding).
 */

import type { RevenueFetcher, RevenueSnapshot } from "./_shared.js";
import { hashResponse, convertToUsd } from "./_shared.js";

export class StripeFetcher implements RevenueFetcher {
  readonly source = "stripe" as const;

  constructor(
    private readonly apiKey: string,
    private readonly accountCurrency: string = "EUR",
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetch(period: string, entity: string): Promise<RevenueSnapshot[]> {
    // Stripe payouts list: GET /v1/payouts?created[gte]=<unix>&created[lte]=<unix>
    const dayStart = Math.floor(new Date(`${period}T00:00:00Z`).getTime() / 1000);
    const dayEnd = dayStart + 86_400;
    const url = `https://api.stripe.com/v1/payouts?created%5Bgte%5D=${dayStart}&created%5Blte%5D=${dayEnd}&limit=100`;

    const response = await this.fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Stripe-Version": "2024-11-20.acacia",
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API ${response.status}: ${response.statusText}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const raw_response_sha256 = await hashResponse(body);

    const payouts = body.data;
    if (!Array.isArray(payouts)) return [];

    const snapshots: RevenueSnapshot[] = [];
    const ts = new Date().toISOString();

    for (const payout of payouts) {
      if (typeof payout !== "object" || payout === null) continue;
      const p = payout as Record<string, unknown>;

      const amountMinor = typeof p.amount === "number" ? p.amount : 0;
      const currency = (typeof p.currency === "string" ? p.currency : this.accountCurrency).toUpperCase();
      const amount = amountMinor / 100; // Stripe sends amounts in minor units (cents)

      const { amount_usd, conversion } = convertToUsd(amount, currency, period);

      snapshots.push({
        ts,
        source: "stripe",
        entity,
        period,
        amount,
        currency,
        amount_usd_equiv: amount_usd,
        fx_rate_used: conversion.rate,
        fx_rate_source: conversion.source,
        fx_rate_age_days: conversion.age_days,
        category: this.classifyCategory(p),
        raw_response_sha256,
        provenance: "stripe-api",
      });
    }

    return snapshots;
  }

  private classifyCategory(payout: Record<string, unknown>): "subscription" | "one-off" | "refund" | "other" {
    // Stripe payouts don't carry subscription/one-off context directly — that's
    // in the underlying charges. For Phase 1, default to "other" and refine
    // when bank CSV ingest cross-references.
    const status = typeof payout.status === "string" ? payout.status : "";
    if (status === "failed" || status === "reversed") return "refund";
    return "other";
  }
}
