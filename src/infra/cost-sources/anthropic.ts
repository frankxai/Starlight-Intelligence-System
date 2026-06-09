/**
 * Anthropic cost source — wraps the Anthropic Organizations / Usage API.
 *
 * Captures per-day token cost (input + output + cache) and request count
 * per model. Per Board REVISE-1, Anthropic is one of two Phase 1 sources
 * (highest-dollar AI cost surface).
 */

import type { SourceFetcher, CostSnapshot } from "./_shared.js";
import { hashResponse, extractNumber } from "./_shared.js";

export class AnthropicFetcher implements SourceFetcher {
  readonly source = "anthropic" as const;

  constructor(
    private readonly apiKey: string,
    private readonly orgId: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetch(period: string): Promise<CostSnapshot> {
    // Anthropic Organizations usage API
    // GET /v1/organizations/usage_report?starting_at=<unix>&ending_at=<unix>
    const dayStart = Math.floor(new Date(`${period}T00:00:00Z`).getTime() / 1000);
    const dayEnd = dayStart + 86_400;
    const url = `https://api.anthropic.com/v1/organizations/usage_report?starting_at=${dayStart}&ending_at=${dayEnd}`;

    const response = await this.fetchImpl(url, {
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      throw new Error(`Anthropic API ${response.status}: ${response.statusText}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const raw_response_sha256 = await hashResponse(body);

    return {
      ts: new Date().toISOString(),
      source: "anthropic",
      scope: this.orgId,
      period,
      cost_usd: this.extractCostUsd(body),
      usage: this.extractUsage(body),
      raw_response_sha256,
      anomaly_flags: [],
    };
  }

  private extractCostUsd(body: Record<string, unknown>): number {
    // Anthropic returns per-line-item cost; sum across all line items
    const lineItems = body.data;
    if (!Array.isArray(lineItems)) {
      return extractNumber(body, "total_cost_usd");
    }
    return lineItems.reduce<number>((sum, item) => {
      if (typeof item === "object" && item !== null) {
        return sum + extractNumber(item, "cost_usd");
      }
      return sum;
    }, 0);
  }

  private extractUsage(body: Record<string, unknown>): Record<string, number> {
    const lineItems = body.data;
    if (!Array.isArray(lineItems)) return {};

    const usage: Record<string, number> = {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      request_count: 0,
    };

    for (const item of lineItems) {
      if (typeof item !== "object" || item === null) continue;
      const rec = item as Record<string, unknown>;
      usage.input_tokens += extractNumber(rec, "input_tokens");
      usage.output_tokens += extractNumber(rec, "output_tokens");
      usage.cache_creation_tokens += extractNumber(rec, "cache_creation_tokens");
      usage.cache_read_tokens += extractNumber(rec, "cache_read_tokens");
      usage.request_count += extractNumber(rec, "request_count");
    }

    return usage;
  }
}
