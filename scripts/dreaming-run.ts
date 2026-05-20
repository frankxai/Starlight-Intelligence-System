/**
 * scripts/dreaming-run.ts — single-shot dreaming consolidation runner.
 *
 * Invoked by:
 *   - scripts/dreaming-cron.ps1 (Windows scheduled task wrapper)
 *   - direct: `node --import tsx scripts/dreaming-run.ts`
 *   - npm script (when wired): `npm run dream`
 *
 * Behavior:
 *   1. Instantiate DreamingAgent against the operator's vault dir.
 *   2. Run agent.dream(sessionsDir) — extracts insights, identifies cross-vault
 *      Wisdom-promotion candidates, detects contradictions.
 *   3. Append a 1-line receipt to memory/CONSOLIDATION_LOG.md.
 *      Format: `- <ISO-timestamp> · insights: N · contradictions: N ·
 *               promotions: N · processed: N`
 *      Or on error: `- <ISO-timestamp> · error: <message>`
 *
 * Why this exists (per breadth audit O9 + day-of audit §3):
 *   The substrate's claim is "memory that compounds." If consolidation isn't
 *   observable, the claim isn't verifiable. As of 2026-05-07, all 6 vaults
 *   stamped `last_consolidated: 2026-05-01` (5 days stale) — the pipeline
 *   architecture exists (FTS5 + temporal half-life + dreaming background)
 *   but no scheduled invocation. This runner closes that gap.
 *
 * Configuration via env vars (all optional):
 *   - STARLIGHT_VAULT_DIR     default: $HOME/.starlight/vaults
 *   - STARLIGHT_SESSIONS_DIR  default: <repo>/memory/voice-sessions
 *
 * Built on SIP — operational tier (memory observability).
 */

import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import {
  existsSync,
  appendFileSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { DreamingAgent } from "../src/dreaming.js";

function repoRoot(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    return resolve(here, "..");
  } catch {
    return process.cwd();
  }
}

const REPO_ROOT = repoRoot();
const VAULT_DIR =
  process.env.STARLIGHT_VAULT_DIR ?? join(homedir(), ".starlight", "vaults");
const SESSIONS_DIR =
  process.env.STARLIGHT_SESSIONS_DIR ??
  join(REPO_ROOT, "memory", "voice-sessions");
// Fix A — 2026-05-20: also process audit-log JSONL so consolidation produces
// non-zero output when voice-operator is paused. See
// docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md.
const AUDIT_DIR =
  process.env.STARLIGHT_AUDIT_DIR ??
  join(REPO_ROOT, "memory", "_audit");
const LOG_PATH = join(REPO_ROOT, "memory", "CONSOLIDATION_LOG.md");

function ensureLog(): void {
  if (existsSync(LOG_PATH)) return;
  const header = `# Memory Consolidation Log

> Append-only receipt of dreaming-pipeline runs. Each line records dreaming-agent output: timestamp, insights extracted from sessions, contradictions detected across vaults, Wisdom-promotion candidates identified, sessions processed.
>
> Maintained by \`scripts/dreaming-run.ts\` (TS runner) and \`scripts/dreaming-cron.ps1\` (Windows scheduled task wrapper). Direct invocation: \`node --import tsx scripts/dreaming-run.ts\`.
>
> **Why this file exists:** the substrate's claim is "memory that compounds." If consolidation isn't observable, the claim isn't verifiable. This log makes the cadence visible. Receipt-stale > 7 days = pipeline broken (or scheduled task not registered).
>
> **Format**: \`- <ISO-timestamp> · insights: N · contradictions: N · promotions: N · processed: N\` (or \`error: <msg>\` on failure).
>
> Background: 2026-05-07 end-to-end excellence audit found all 6 vaults stamped \`last_consolidated: 2026-05-01\` (5 days stale) despite rich pipeline architecture (FTS5 + temporal half-life + dreaming + Memory-Bus singleton). This file + the cron close the observability gap.
>
> **Built on SIP** — operational tier (memory observability).

`;
  writeFileSync(LOG_PATH, header, "utf-8");
}

function appendReceipt(line: string): void {
  appendFileSync(LOG_PATH, line + "\n", "utf-8");
}

function timestamp(): string {
  return new Date().toISOString();
}

function escapeForLog(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

function main(): number {
  ensureLog();
  const ts = timestamp();

  if (!existsSync(VAULT_DIR)) {
    appendReceipt(`- ${ts} · error: vaultDir not found at ${VAULT_DIR}`);
    console.error(`vaultDir not found: ${VAULT_DIR}`);
    return 2;
  }

  try {
    const agent = new DreamingAgent(VAULT_DIR);
    const result = agent.dream(SESSIONS_DIR, AUDIT_DIR);
    const line =
      `- ${ts}` +
      ` · insights: ${result.extractedInsights.length}` +
      ` · contradictions: ${result.contradictions.length}` +
      ` · promotions: ${result.promotions.length}` +
      ` · processed: ${result.processedFiles}`;
    appendReceipt(line);
    console.log(line);
    return 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    appendReceipt(`- ${ts} · error: ${escapeForLog(msg)}`);
    console.error(msg);
    return 1;
  }
}

process.exit(main());
