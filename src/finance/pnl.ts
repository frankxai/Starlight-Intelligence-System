/**
 * P&L + runway computation — pure functions over cost (W2) + revenue (W3) JSONL streams.
 *
 * Per Board REVISE-2: runway computation must refuse with STALE_CASH error when
 * cash data > 14 days old, rather than compute on stale inputs and call it truth.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Entity } from "./entity-registry.js";
import { isCashStale } from "./entity-registry.js";

export interface EntityPnL {
  entity: string;
  period_start: string;
  period_end: string;
  inflows_usd: number;
  outflows_usd: number;
  net_usd: number;
  by_category: Record<string, { in: number; out: number }>;
  snapshot_count: number;
}

export interface RunwayResult {
  entity: string;
  runway_months: number;
  current_cash_usd: number;
  monthly_burn_usd: number;
  cash_age_days: number;
}

export class StaleCashError extends Error {
  constructor(entity: string, ageDays: number) {
    super(
      `STALE_CASH: entity "${entity}" cash data is ${ageDays.toFixed(1)} days old (> 14 day threshold).\n` +
        `Refresh via: /finance-cash-tick ${entity} <amount>\n` +
        `Per Board REVISE-2: refuse to compute runway on stale data.`,
    );
    this.name = "StaleCashError";
  }
}

/**
 * Compute P&L for an entity over a period.
 * Reads revenue snapshots from memory/_audit/finance/ + cost snapshots from memory/_audit/cost/.
 */
export function computePnL(
  repoRoot: string,
  entity: string,
  periodStart: string,
  periodEnd: string,
): EntityPnL {
  const result: EntityPnL = {
    entity,
    period_start: periodStart,
    period_end: periodEnd,
    inflows_usd: 0,
    outflows_usd: 0,
    net_usd: 0,
    by_category: {},
    snapshot_count: 0,
  };

  // Revenue (inflows)
  const revenueDir = join(repoRoot, "memory", "_audit", "finance");
  if (existsSync(revenueDir)) {
    const files = readdirSync(revenueDir).filter((f) => f.endsWith(".jsonl") && !f.startsWith("_"));
    for (const file of files) {
      const datePart = file.replace(".jsonl", "");
      if (datePart < periodStart || datePart > periodEnd) continue;
      const lines = readFileSync(join(revenueDir, file), "utf8")
        .split(/\r?\n/)
        .filter((l) => l.length > 0);
      for (const line of lines) {
        try {
          const snap = JSON.parse(line);
          if (snap.entity !== entity) continue;
          const usd = typeof snap.amount_usd_equiv === "number" ? snap.amount_usd_equiv : 0;
          result.inflows_usd += usd;
          result.snapshot_count += 1;
          const cat = String(snap.category ?? "other");
          if (!result.by_category[cat]) result.by_category[cat] = { in: 0, out: 0 };
          result.by_category[cat].in += usd;
        } catch {
          // skip malformed
        }
      }
    }
  }

  // Cost (outflows) — entity-aware cost-tagging is W3.2; Phase 1 sums all cost
  // (assumes Arcanea BV operates SIS infra during Phase 1 — single-entity simplification)
  const costDir = join(repoRoot, "memory", "_audit", "cost");
  if (existsSync(costDir)) {
    const files = readdirSync(costDir).filter((f) => f.endsWith(".jsonl") && !f.startsWith("_"));
    for (const file of files) {
      const datePart = file.replace(".jsonl", "");
      if (datePart < periodStart || datePart > periodEnd) continue;
      const lines = readFileSync(join(costDir, file), "utf8")
        .split(/\r?\n/)
        .filter((l) => l.length > 0);
      for (const line of lines) {
        try {
          const snap = JSON.parse(line);
          const usd = typeof snap.cost_usd === "number" ? snap.cost_usd : 0;
          result.outflows_usd += usd;
          result.snapshot_count += 1;
          const cat = `cost:${snap.source ?? "other"}`;
          if (!result.by_category[cat]) result.by_category[cat] = { in: 0, out: 0 };
          result.by_category[cat].out += usd;
        } catch {
          // skip malformed
        }
      }
    }
  }

  result.net_usd = result.inflows_usd - result.outflows_usd;
  return result;
}

/**
 * Compute runway months for an entity.
 * Refuses with StaleCashError if cash data is > 14 days old.
 * Returns Infinity if monthly burn is zero or negative (operator profitable).
 */
export function computeRunway(
  repoRoot: string,
  entity: Entity,
  monthsLookback: number = 3,
  asOfDate: Date = new Date(),
): RunwayResult {
  const lastUpdated = new Date(entity.current_cash.last_updated);
  const cashAgeDays = (asOfDate.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

  if (isCashStale(entity, asOfDate)) {
    throw new StaleCashError(entity.name, cashAgeDays);
  }

  // Compute average monthly burn over lookback period
  const end = asOfDate.toISOString().slice(0, 10);
  const startDate = new Date(asOfDate);
  startDate.setMonth(startDate.getMonth() - monthsLookback);
  const start = startDate.toISOString().slice(0, 10);

  const pnl = computePnL(repoRoot, entity.name, start, end);
  const monthlyNet = pnl.net_usd / monthsLookback;
  const monthlyBurn = monthlyNet < 0 ? -monthlyNet : 0; // burn = negative net averaged monthly

  // Convert current cash to USD (assumes entity.currency_base for now;
  // multi-currency cash conversion is W3.1.5)
  const cashUsd =
    entity.currency_base === "USD"
      ? entity.current_cash.amount
      : entity.current_cash.amount * (entity.currency_base === "EUR" ? 1.0810 : 1.0);

  const runwayMonths = monthlyBurn === 0 ? Infinity : cashUsd / monthlyBurn;

  return {
    entity: entity.name,
    runway_months: runwayMonths,
    current_cash_usd: cashUsd,
    monthly_burn_usd: monthlyBurn,
    cash_age_days: cashAgeDays,
  };
}
