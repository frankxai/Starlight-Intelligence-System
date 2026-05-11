/**
 * Vercel cost source — wraps the Vercel Usage / Billing API.
 *
 * Generalizes the existing `vercel-cost-watch` skill pattern into the
 * cost-plane vertical. fetch impl is injectable for testing.
 */

import type { SourceFetcher, CostSnapshot } from "./_shared.js";
import { hashResponse, extractNumber } from "./_shared.js";

export class VercelFetcher implements SourceFetcher {
  readonly source = "vercel" as const;

  constructor(
    private readonly apiToken: string,
    private readonly teamId: string | null = null,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetch(period: string): Promise<CostSnapshot> {
    const url = this.teamId
      ? `https://api.vercel.com/v1/teams/${this.teamId}/billing/usage`
      : `https://api.vercel.com/v1/billing/usage`;

    const response = await this.fetchImpl(url, {
      headers: { Authorization: `Bearer ${this.apiToken}` },
    });

    if (!response.ok) {
      throw new Error(`Vercel API ${response.status}: ${response.statusText}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const raw_response_sha256 = await hashResponse(body);

    return {
      ts: new Date().toISOString(),
      source: "vercel",
      scope: this.teamId ?? "personal",
      period,
      cost_usd: this.extractCostUsd(body),
      usage: this.extractUsage(body),
      raw_response_sha256,
      anomaly_flags: [],
    };
  }

  private extractCostUsd(body: Record<string, unknown>): number {
    const total = extractNumber(body, "total");
    if (total > 0) return total;
    return extractNumber(body, "total", "amount");
  }

  private extractUsage(body: Record<string, unknown>): Record<string, number> {
    const usage = body.usage;
    if (typeof usage !== "object" || usage === null) return {};
    return Object.fromEntries(
      Object.entries(usage as Record<string, unknown>)
        .filter(([, v]) => typeof v === "number")
        .map(([k, v]) => [k, v as number]),
    );
  }
}
