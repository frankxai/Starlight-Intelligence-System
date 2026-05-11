/**
 * Cost source shared primitives — types, snapshot schema, JSONL writer, hash helper.
 *
 * Every cost source implements SourceFetcher.fetch(period) → CostSnapshot.
 * Snapshots persist as one JSONL line per source per day at
 * memory/_audit/cost/<YYYY-MM-DD>.jsonl. Directory is gitignored.
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export type SourceName = "vercel" | "anthropic" | "cloudflare" | "langfuse";

export interface CostSnapshot {
  ts: string;
  source: SourceName;
  scope: string;
  period: string;
  cost_usd: number;
  usage: Record<string, number>;
  raw_response_sha256: string;
  anomaly_flags: string[];
}

export interface SourceFetcher {
  source: SourceName;
  fetch(period: string): Promise<CostSnapshot>;
}

export function writeSnapshot(repoRoot: string, snapshot: CostSnapshot): string {
  const dir = join(repoRoot, "memory", "_audit", "cost");
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
 * Today's period in YYYY-MM-DD (Europe/Paris by default).
 * The cron runs at 02:30 Paris, capturing data for the prior calendar day.
 */
export function periodForToday(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Defensive numeric extraction — walks a known path or returns 0.
 * Used by source-specific fetchers to coax cost from varying response shapes.
 */
export function extractNumber(obj: unknown, ...path: string[]): number {
  let cursor: unknown = obj;
  for (const key of path) {
    if (typeof cursor !== "object" || cursor === null) return 0;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return typeof cursor === "number" ? cursor : 0;
}
