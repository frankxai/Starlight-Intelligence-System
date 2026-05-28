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
  readFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { DreamingAgent, type DreamResult } from "../src/dreaming.js";

function repoRoot(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    return resolve(here, "..");
  } catch {
    return process.cwd();
  }
}

const REPO_ROOT = repoRoot();
// Fix B (2026-05-21): default vault dir to in-repo memory/vaults so the
// dreaming agent reads the canonical SIS vault MD files. Fallback to
// ~/.starlight/vaults for backward compatibility. Override via env var.
// See docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md §5b.
const REPO_VAULTS = join(REPO_ROOT, "memory", "vaults");
const VAULT_DIR =
  process.env.STARLIGHT_VAULT_DIR ??
  (existsSync(REPO_VAULTS) ? REPO_VAULTS : join(homedir(), ".starlight", "vaults"));
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
const QUEUE_PATH = join(REPO_ROOT, "memory", "PROMOTION_QUEUE.md");
const STATE_PATH = join(REPO_ROOT, "memory", ".dreaming-state.json");

type DreamingState = {
  version: 1;
  promoted: Record<string, { queuedAt: string; fromVault: string; reason: string }>;
};

function loadState(): DreamingState {
  if (!existsSync(STATE_PATH)) return { version: 1, promoted: {} };
  try {
    const raw = JSON.parse(readFileSync(STATE_PATH, "utf-8")) as DreamingState;
    if (raw.version === 1 && raw.promoted) return raw;
  } catch { /* corrupt — start fresh */ }
  return { version: 1, promoted: {} };
}

function saveState(state: DreamingState): void {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

function ensureQueue(): void {
  if (existsSync(QUEUE_PATH)) return;
  const header = `# Wisdom Promotion Queue

> Append-only queue of dreaming-pipeline promotion candidates awaiting human review. Maintained by \`scripts/dreaming-run.ts\` (writeback step landed 2026-05-28, closes audit N3).
>
> **Why this file exists:** the dreaming agent identifies entries that appear across multiple non-wisdom vaults (cross-vault patterns at \`PROMO_SIM=0.15\`). Per the calibration history in \`src/dreaming.ts\`, that threshold is set low — "more promotions, some noise. Beats silence." This queue surfaces candidates for human review rather than auto-merging them into \`memory/vaults/wisdom-vault.md\` (where bad promotions would be hard to unwind).
>
> **Review process:**
> 1. Read each candidate — open the source vault file at the noted \`entryId\`.
> 2. Decide whether the pattern is real wisdom (genuinely cross-vault and durable) or noise (vocabulary overlap without substantive shared pattern).
> 3. If wisdom: copy the relevant content into \`memory/vaults/wisdom-vault.md\` under the appropriate section. Mark this row reviewed by deleting it.
> 4. If noise: delete the row. The dedup state (\`memory/.dreaming-state.json\`) prevents re-queueing.
>
> **Dedup guarantee:** \`memory/.dreaming-state.json\` (gitignored) records every \`entryId\` ever queued. Nightly runs append only NEW candidates — the queue grows monotonically per real new patterns, not per nightly noise.
>
> **Built on SIP** — operational tier (dreaming pipeline writeback).

## Candidates

`;
  writeFileSync(QUEUE_PATH, header, "utf-8");
}

function appendNewPromotions(result: DreamResult, state: DreamingState, ts: string): number {
  const fresh = result.promotions.filter(p => !state.promoted[p.entryId]);
  if (fresh.length === 0) return 0;
  ensureQueue();
  const lines: string[] = [`### ${ts}`, ""];
  for (const p of fresh) {
    lines.push(`- [ ] **\`${p.entryId}\`** — ${p.fromVault} → ${p.toVault}  `);
    lines.push(`      ${p.reason}`);
    state.promoted[p.entryId] = { queuedAt: ts, fromVault: p.fromVault, reason: p.reason };
  }
  lines.push("");
  appendFileSync(QUEUE_PATH, lines.join("\n"), "utf-8");
  return fresh.length;
}

function ensureLog(): void {
  if (existsSync(LOG_PATH)) return;
  const header = `# Memory Consolidation Log

> Append-only receipt of dreaming-pipeline runs. Each line records dreaming-agent output: timestamp, insights extracted from sessions, contradictions detected across vaults, Wisdom-promotion candidates identified, sessions processed.
>
> Maintained by \`scripts/dreaming-run.ts\` (TS runner) and \`scripts/dreaming-cron.ps1\` (Windows scheduled task wrapper). Direct invocation: \`node --import tsx scripts/dreaming-run.ts\`.
>
> **Why this file exists:** the substrate's claim is "memory that compounds." If consolidation isn't observable, the claim isn't verifiable. This log makes the cadence visible. Receipt-stale > 7 days = pipeline broken (or scheduled task not registered).
>
> **Format**: \`- <ISO-timestamp> · insights: N · contradictions: N · promotions: N · queued: N · processed: N\` (or \`error: <msg>\` on failure). \`queued\` counts NEW candidates appended to memory/PROMOTION_QUEUE.md (after dedup vs memory/.dreaming-state.json).
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
    const state = loadState();
    const queued = appendNewPromotions(result, state, ts);
    if (queued > 0) saveState(state);
    const line =
      `- ${ts}` +
      ` · insights: ${result.extractedInsights.length}` +
      ` · contradictions: ${result.contradictions.length}` +
      ` · promotions: ${result.promotions.length}` +
      ` · queued: ${queued}` +
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
