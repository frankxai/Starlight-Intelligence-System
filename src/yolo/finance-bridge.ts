/**
 * /yolo + Finance bridge — composes W2 cost + W3 revenue data into a
 * session-open status payload that the conductor surfaces during /yolo
 * sessions.
 *
 * Per the /yolo Hive spec §2 framing: budget tripwires should become measured
 * against real revenue + runway, not trust-based. This is the code path that
 * delivers that promise.
 *
 * Behavior:
 *   - Computes MTD P&L for primary entity (Phase 1: Arcanea BV)
 *   - Computes runway months (handles STALE_CASH error gracefully)
 *   - Computes session-budget headroom vs MTD cost
 *   - Emits structured alerts when thresholds approach
 *   - Always returns; never throws (degrades gracefully so /yolo can still open)
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { loadRegistry, type Entity, EntityRegistryError } from "../finance/entity-registry.js";
import { computePnL, computeRunway, StaleCashError, type EntityPnL, type RunwayResult } from "../finance/pnl.js";
import { loadScope, type YoloScope } from "./scope.js";

export type AlertSeverity = "info" | "warn" | "block";

export interface FinanceAlert {
  severity: AlertSeverity;
  code:
    | "registry-missing"
    | "scope-missing"
    | "entity-missing"
    | "stale-cash"
    | "runway-short"
    | "monthly-burn-over-threshold"
    | "session-budget-near-cap"
    | "compose-error";
  message: string;
  details?: Record<string, unknown>;
}

export interface FinanceBridgePayload {
  generated_at: string;
  primary_entity: string | null;
  pnl_mtd: EntityPnL | null;
  runway: RunwayResult | null;
  session_budget_headroom_usd: number | null;
  alerts: FinanceAlert[];
}

/**
 * The Phase 1 primary entity for /yolo's finance lens.
 * Today: Arcanea BV. After W3.1.5 multi-entity unlock, this becomes
 * "the entity matching the active /yolo session" — which the conductor passes in.
 */
const PHASE_1_PRIMARY_ENTITY = "Arcanea BV";

export function computeFinanceBridge(
  repoRoot: string,
  asOfDate: Date = new Date(),
): FinanceBridgePayload {
  const alerts: FinanceAlert[] = [];
  const payload: FinanceBridgePayload = {
    generated_at: asOfDate.toISOString(),
    primary_entity: null,
    pnl_mtd: null,
    runway: null,
    session_budget_headroom_usd: null,
    alerts,
  };

  // ── Try loading yolo-scope for budget thresholds ────────────
  let scope: YoloScope | null = null;
  try {
    scope = loadScope(repoRoot);
  } catch {
    alerts.push({
      severity: "info",
      code: "scope-missing",
      message: "private/yolo-scope.json not set up — session-budget alerts disabled",
    });
  }

  // ── Try loading entity registry ────────────────────────────
  let entity: Entity | null = null;
  try {
    const reg = loadRegistry(repoRoot);
    entity = reg.entities.find((e) => e.name === PHASE_1_PRIMARY_ENTITY) ?? null;
    payload.primary_entity = entity?.name ?? null;
    if (!entity) {
      alerts.push({
        severity: "warn",
        code: "entity-missing",
        message: `Phase 1 primary entity "${PHASE_1_PRIMARY_ENTITY}" not in registry — P&L disabled until added`,
      });
      return payload;
    }
  } catch (err) {
    if (err instanceof EntityRegistryError) {
      alerts.push({
        severity: "info",
        code: "registry-missing",
        message: "private/business-registry.json not set up — finance bridge degraded",
        details: { hint: "See SETUP.md §1.3" },
      });
    } else {
      alerts.push({
        severity: "warn",
        code: "compose-error",
        message: `Unexpected error loading registry: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
    return payload;
  }

  // ── Compute MTD P&L ────────────────────────────────────────
  const monthStart = asOfDate.toISOString().slice(0, 7) + "-01";
  const today = asOfDate.toISOString().slice(0, 10);
  try {
    payload.pnl_mtd = computePnL(repoRoot, entity.name, monthStart, today);
  } catch (err) {
    alerts.push({
      severity: "warn",
      code: "compose-error",
      message: `P&L compute failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // ── Compute runway (handle STALE_CASH gracefully) ──────────
  try {
    payload.runway = computeRunway(repoRoot, entity, 3, asOfDate);

    // Surface low-runway alerts based on measured value
    if (payload.runway.runway_months !== Infinity) {
      if (payload.runway.runway_months < 6) {
        alerts.push({
          severity: "block",
          code: "runway-short",
          message: `Runway < 6 months (${payload.runway.runway_months.toFixed(1)}mo). Conductor should surface as block-class alert.`,
          details: { runway_months: payload.runway.runway_months },
        });
      } else if (payload.runway.runway_months < 12) {
        alerts.push({
          severity: "warn",
          code: "runway-short",
          message: `Runway < 12 months (${payload.runway.runway_months.toFixed(1)}mo). Surface as warning.`,
          details: { runway_months: payload.runway.runway_months },
        });
      }
    }
  } catch (err) {
    if (err instanceof StaleCashError) {
      alerts.push({
        severity: "warn",
        code: "stale-cash",
        message: err.message.split("\n")[0], // first line only
        details: { hint: "Refresh via /finance-cash-tick <entity> <amount>" },
      });
    } else {
      alerts.push({
        severity: "warn",
        code: "compose-error",
        message: `Runway compute failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // ── Session budget headroom ────────────────────────────────
  if (scope && payload.pnl_mtd) {
    const monthlyBudget = scope.budget.session_threshold_usd * 30; // simple monthly approximation
    const monthlyBurn = payload.pnl_mtd.outflows_usd;
    const headroom = monthlyBudget - monthlyBurn;
    payload.session_budget_headroom_usd = headroom;

    const burnPctOfMonthlyBudget = monthlyBudget > 0 ? (monthlyBurn / monthlyBudget) * 100 : 0;
    if (burnPctOfMonthlyBudget > 80) {
      alerts.push({
        severity: "block",
        code: "session-budget-near-cap",
        message: `Monthly burn ${burnPctOfMonthlyBudget.toFixed(0)}% of monthly budget cap. Block class.`,
        details: { burn_usd: monthlyBurn, monthly_budget_usd: monthlyBudget },
      });
    } else if (burnPctOfMonthlyBudget > 50) {
      alerts.push({
        severity: "warn",
        code: "session-budget-near-cap",
        message: `Monthly burn ${burnPctOfMonthlyBudget.toFixed(0)}% of monthly budget cap.`,
        details: { burn_usd: monthlyBurn, monthly_budget_usd: monthlyBudget },
      });
    }
  }

  return payload;
}

/**
 * Format the bridge payload for human-readable conductor output.
 * Conductor pastes this into the /yolo session-open scan markdown.
 */
export function formatBridgeMarkdown(payload: FinanceBridgePayload): string {
  const lines: string[] = [];
  lines.push(`### Finance bridge — ${payload.generated_at.slice(0, 10)}`);

  if (!payload.primary_entity) {
    lines.push("- finance bridge degraded — see alerts");
  } else {
    lines.push(`- **Entity:** ${payload.primary_entity}`);
    if (payload.pnl_mtd) {
      const net = payload.pnl_mtd.net_usd;
      lines.push(
        `- **MTD P&L:** inflows $${payload.pnl_mtd.inflows_usd.toFixed(2)} − outflows $${payload.pnl_mtd.outflows_usd.toFixed(2)} = **${net >= 0 ? "+" : ""}$${net.toFixed(2)}**`,
      );
    }
    if (payload.runway) {
      const months =
        payload.runway.runway_months === Infinity ? "∞ (profitable)" : `${payload.runway.runway_months.toFixed(1)}mo`;
      lines.push(`- **Runway:** ${months} (cash $${payload.runway.current_cash_usd.toFixed(2)}, ${payload.runway.cash_age_days.toFixed(1)}d old)`);
    }
    if (payload.session_budget_headroom_usd !== null) {
      lines.push(`- **Monthly budget headroom:** $${payload.session_budget_headroom_usd.toFixed(2)}`);
    }
  }

  if (payload.alerts.length > 0) {
    lines.push("");
    lines.push("**Alerts:**");
    for (const a of payload.alerts) {
      const tag = a.severity === "block" ? "🔴 BLOCK" : a.severity === "warn" ? "🟡 WARN" : "🔵 INFO";
      lines.push(`- ${tag} [${a.code}] ${a.message}`);
    }
  }

  return lines.join("\n");
}

// CLI entry — `npx tsx src/yolo/finance-bridge.ts`
const isMain =
  import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("finance-bridge.ts");

if (isMain) {
  const { dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const _filename = fileURLToPath(import.meta.url);
  const _dirname = dirname(_filename);
  const repoRoot = join(_dirname, "..", "..");

  const payload = computeFinanceBridge(repoRoot);
  console.log(formatBridgeMarkdown(payload));
  if (!existsSync(join(repoRoot, "private", "business-registry.json"))) {
    process.exit(0); // degraded by design — not a failure
  }
  process.exit(0);
}
