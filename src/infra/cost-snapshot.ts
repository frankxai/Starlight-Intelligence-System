/**
 * Daily cost snapshot orchestrator — runs each Phase 1 source fetcher,
 * writes JSONL to memory/_audit/cost/<YYYY-MM-DD>.jsonl.
 *
 * Invoked by the cron at scripts/cron/daily-cost-snapshot.ps1.
 * Can also be run manually: `npx tsx src/infra/cost-snapshot.ts`.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SourceFetcher } from "./cost-sources/_shared.js";
import { writeSnapshot, periodForToday } from "./cost-sources/_shared.js";
import { VercelFetcher } from "./cost-sources/vercel.js";
import { AnthropicFetcher } from "./cost-sources/anthropic.js";
import { InfisicalSecretsClient, EnvSecretsClient, type SecretsClient } from "./secrets.js";

export interface RunResult {
  source: string;
  status: "ok" | "fail";
  cost_usd?: number;
  error?: string;
  log_path?: string;
}

export async function runDailySnapshot(
  repoRoot: string,
  secrets: SecretsClient,
  period: string = periodForToday(),
): Promise<RunResult[]> {
  const results: RunResult[] = [];
  const fetchers: SourceFetcher[] = [];

  // Vercel
  const vercelToken = secrets.get("VERCEL_API_TOKEN");
  if (vercelToken) {
    const teamId = secrets.get("VERCEL_TEAM_ID") ?? null;
    fetchers.push(new VercelFetcher(vercelToken, teamId));
  } else {
    results.push({ source: "vercel", status: "fail", error: "VERCEL_API_TOKEN not in secrets store" });
  }

  // Anthropic
  const anthropicKey = secrets.get("ANTHROPIC_API_KEY");
  const anthropicOrg = secrets.get("ANTHROPIC_ORG_ID");
  if (anthropicKey && anthropicOrg) {
    fetchers.push(new AnthropicFetcher(anthropicKey, anthropicOrg));
  } else {
    results.push({
      source: "anthropic",
      status: "fail",
      error: "ANTHROPIC_API_KEY or ANTHROPIC_ORG_ID not in secrets store",
    });
  }

  // Run all fetchers in parallel
  const settled = await Promise.allSettled(fetchers.map((f) => f.fetch(period)));

  for (let i = 0; i < settled.length; i++) {
    const settled_i = settled[i];
    const sourceName = fetchers[i].source;
    if (settled_i.status === "fulfilled") {
      const snapshot = settled_i.value;
      const path = writeSnapshot(repoRoot, snapshot);
      results.push({
        source: sourceName,
        status: "ok",
        cost_usd: snapshot.cost_usd,
        log_path: path,
      });
    } else {
      results.push({
        source: sourceName,
        status: "fail",
        error: settled_i.reason instanceof Error ? settled_i.reason.message : String(settled_i.reason),
      });
    }
  }

  return results;
}

// CLI entry — `npx tsx src/infra/cost-snapshot.ts`
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("cost-snapshot.ts");
if (isMain) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(__dirname, "..", "..");

  // In production, swap EnvSecretsClient for InfisicalSecretsClient with a real project ID
  const useInfisical = process.env.INFISICAL_PROJECT_ID;
  const secrets: SecretsClient = useInfisical
    ? new InfisicalSecretsClient(useInfisical, "prod")
    : new EnvSecretsClient();

  runDailySnapshot(repoRoot, secrets).then((results) => {
    console.log(`=== Daily cost snapshot ${periodForToday()} ===`);
    let totalUsd = 0;
    for (const r of results) {
      if (r.status === "ok") {
        console.log(`  ✓ ${r.source.padEnd(12)} $${r.cost_usd?.toFixed(2)} → ${r.log_path}`);
        totalUsd += r.cost_usd ?? 0;
      } else {
        console.log(`  ✗ ${r.source.padEnd(12)} ${r.error}`);
      }
    }
    console.log(`  ────────────────────`);
    console.log(`  Total: $${totalUsd.toFixed(2)}`);
    const failed = results.filter((r) => r.status === "fail").length;
    process.exit(failed > 0 ? 1 : 0);
  });
}
