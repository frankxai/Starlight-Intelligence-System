// Reads metrics/current.json from the repo root at build/request time — the
// "living ledger" per METRICS_TRUTH.md. Same process.cwd() + ".." pattern as
// lib/agents.ts, lib/skills.ts, and lib/sip.ts.

import { promises as fs } from "fs";
import path from "path";

export interface Metric {
  key: string;
  value: string | number;
  lastVerified: string;
  source: string;
  ownership?: string;
  stale?: boolean;
  notes?: string;
}

export interface MetricsLedger {
  version: string;
  ledgerStarted: string;
  lastUpdated: string;
  metrics: Metric[];
}

interface RawMetric {
  value: string | number;
  last_verified: string;
  source: string;
  ownership?: string;
  stale?: boolean;
  notes?: string;
}

interface RawLedger {
  version?: string;
  ledger_started?: string;
  last_updated?: string;
  metrics?: Record<string, RawMetric>;
}

export async function getMetricsLedger(): Promise<MetricsLedger> {
  const repoRoot = path.join(process.cwd(), "..");
  const metricsPath = path.join(repoRoot, "metrics", "current.json");

  try {
    const raw = await fs.readFile(metricsPath, "utf8");
    const data: RawLedger = JSON.parse(raw);

    const metrics: Metric[] = Object.entries(data.metrics ?? {}).map(
      ([key, m]) => ({
        key,
        value: m.value,
        lastVerified: m.last_verified,
        source: m.source,
        ownership: m.ownership,
        stale: m.stale,
        notes: m.notes,
      })
    );

    return {
      version: data.version ?? "",
      ledgerStarted: data.ledger_started ?? "",
      lastUpdated: data.last_updated ?? "",
      metrics,
    };
  } catch {
    return { version: "", ledgerStarted: "", lastUpdated: "", metrics: [] };
  }
}

/** "named_agents" -> "Named Agents" */
export function labelFromKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
