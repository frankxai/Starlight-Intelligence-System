/**
 * Daily revenue snapshot orchestrator — runs Phase 1 sources, writes JSONL to
 * memory/_audit/finance/<YYYY-MM-DD>.jsonl.
 *
 * Phase 1 (per Board REVISE-3): Stripe + Arcanea BV ONLY.
 * Phase 1.5: + Cloudflare, + Langfuse, + bank CSV, + manual invoice, + Starlight Holding.
 *
 * Invoked by scripts/cron/daily-revenue-snapshot.ps1 at 02:35 Paris
 * (5 min after cost-snapshot at 02:30).
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadRegistry } from "./entity-registry.js";
import { StripeFetcher } from "./revenue-sources/stripe.js";
import { writeRevenueSnapshot } from "./revenue-sources/_shared.js";
import { InfisicalSecretsClient, EnvSecretsClient, type SecretsClient } from "../infra/secrets.js";

export interface RunResult {
  source: string;
  entity: string;
  status: "ok" | "fail" | "skipped";
  snapshots_written?: number;
  total_inflow_usd?: number;
  error?: string;
}

export async function runDailyRevenueSnapshot(
  repoRoot: string,
  secrets: SecretsClient,
  period: string = new Date().toISOString().slice(0, 10),
): Promise<RunResult[]> {
  const results: RunResult[] = [];

  // Load entity registry (private/business-registry.json)
  let registry;
  try {
    registry = loadRegistry(repoRoot);
  } catch (err) {
    return [
      {
        source: "registry",
        entity: "n/a",
        status: "fail",
        error: err instanceof Error ? err.message : String(err),
      },
    ];
  }

  // Phase 1 narrow: filter to Arcanea BV only (D3 — multi-entity activates in Phase 1.5)
  const phase1Entities = registry.entities.filter((e) => e.name === "Arcanea BV");
  if (phase1Entities.length === 0) {
    results.push({
      source: "registry",
      entity: "Arcanea BV",
      status: "skipped",
      error: 'Phase 1 entity "Arcanea BV" not in registry — check private/business-registry.json',
    });
  }

  // Stripe — sole Phase 1 source per Board REVISE-3
  const stripeKey = secrets.get("STRIPE_API_KEY");
  if (!stripeKey) {
    results.push({
      source: "stripe",
      entity: "all",
      status: "fail",
      error: "STRIPE_API_KEY not in secrets store",
    });
    return results;
  }

  for (const entity of phase1Entities) {
    const fetcher = new StripeFetcher(stripeKey, entity.currency_base);
    try {
      const snapshots = await fetcher.fetch(period, entity.name);
      let totalUsd = 0;
      for (const snap of snapshots) {
        writeRevenueSnapshot(repoRoot, snap);
        totalUsd += snap.amount_usd_equiv;
      }
      results.push({
        source: "stripe",
        entity: entity.name,
        status: "ok",
        snapshots_written: snapshots.length,
        total_inflow_usd: totalUsd,
      });
    } catch (err) {
      results.push({
        source: "stripe",
        entity: entity.name,
        status: "fail",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

// CLI entry — `npx tsx src/finance/revenue-snapshot.ts`
const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("revenue-snapshot.ts");

if (isMain) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(__dirname, "..", "..");

  const useInfisical = process.env.INFISICAL_PROJECT_ID;
  const secrets: SecretsClient = useInfisical
    ? new InfisicalSecretsClient(useInfisical, "prod")
    : new EnvSecretsClient();

  runDailyRevenueSnapshot(repoRoot, secrets).then((results) => {
    console.log(`=== Daily revenue snapshot ${new Date().toISOString().slice(0, 10)} ===`);
    let totalInflow = 0;
    for (const r of results) {
      const label = `${r.source}:${r.entity}`.padEnd(24);
      if (r.status === "ok") {
        console.log(`  ✓ ${label} ${r.snapshots_written} snapshot(s), $${r.total_inflow_usd?.toFixed(2)}`);
        totalInflow += r.total_inflow_usd ?? 0;
      } else if (r.status === "skipped") {
        console.log(`  ○ ${label} skipped: ${r.error}`);
      } else {
        console.log(`  ✗ ${label} ${r.error}`);
      }
    }
    console.log(`  ────────────────────`);
    console.log(`  Total inflow: $${totalInflow.toFixed(2)}`);
    const failed = results.filter((r) => r.status === "fail").length;
    process.exit(failed > 0 ? 1 : 0);
  });
}
