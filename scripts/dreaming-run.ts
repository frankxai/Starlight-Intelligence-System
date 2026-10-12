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
 *   3. Run decay sweep: scan OPERATIONAL vault JSONL for entries whose decayed
 *      confidence (90-day half-life via TemporalEngine) falls below 0.15.
 *      Archive those entries by appending an {type:"archive"} event to the
 *      vault JSONL (append-only; original rows are never deleted). Wisdom and
 *      Horizon vaults are never decayed.
 *   4. Append a 1-line receipt to memory/CONSOLIDATION_LOG.md.
 *      Format: `- <ISO-timestamp> · insights: N · contradictions: N ·
 *               promotions: N · processed: N · decayed: N · archived: N`
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
 * Built on SIP — operational tier (memory observability + decay sweep v0.1).
 */

import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import {
  existsSync,
  appendFileSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { DreamingAgent } from "../src/dreaming.js";
import { TemporalEngine } from "../src/temporal.js";

// ── SweepResult export ────────────────────────────────────────────────────────

/** Result returned by sweepDecay(). Consumed by tests and the receipt line. */
export interface SweepResult {
  /** Total entries inspected across decayable vaults. */
  inspected: number;
  /** Entries whose decayed confidence was computed (had temporal metadata). */
  decayed: number;
  /** Entries archived this run (confidence < ARCHIVE_THRESHOLD). */
  archived: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Vault names that are NEVER decayed.
 *
 * Wisdom: timeless principles — decay would destroy long-horizon signal.
 * Horizon: human hopes and AGI alignment visions — append-only by design.
 */
const PROTECTED_VAULTS = new Set(["wisdom", "horizon"]);

/**
 * Archive threshold: entries whose decayed confidence drops below this are
 * eligible for archival. 0.15 == after ~2.8 half-lives (90 days each ≈ 252 days).
 * This is conservative enough to preserve genuinely durable operational facts.
 */
const ARCHIVE_THRESHOLD = 0.15;

// ── Repo root ─────────────────────────────────────────────────────────────────

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

// ── Log helpers ───────────────────────────────────────────────────────────────

function ensureLog(): void {
  if (existsSync(LOG_PATH)) return;
  const header = `# Memory Consolidation Log

> Append-only receipt of dreaming-pipeline runs. Each line records dreaming-agent output: timestamp, insights extracted from sessions, contradictions detected across vaults, Wisdom-promotion candidates identified, sessions processed.
>
> Maintained by \`scripts/dreaming-run.ts\` (TS runner) and \`scripts/dreaming-cron.ps1\` (Windows scheduled task wrapper). Direct invocation: \`node --import tsx scripts/dreaming-run.ts\`.
>
> **Why this file exists:** the substrate's claim is "memory that compounds." If consolidation isn't observable, the claim isn't verifiable. This log makes the cadence visible. Receipt-stale > 7 days = pipeline broken (or scheduled task not registered).
>
> **Format**: \`- <ISO-timestamp> · insights: N · contradictions: N · promotions: N · processed: N · decayed: N · archived: N\` (or \`error: <msg>\` on failure).
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

// ── Decay sweep ───────────────────────────────────────────────────────────────

/**
 * Sweep vault JSONL files for decayed entries and archive them.
 *
 * Rules:
 *  - Only JSONL files are processed (vault-format requirement).
 *  - Protected vaults (wisdom, horizon) are skipped entirely.
 *  - An entry is eligible for archival if its decayed confidence < ARCHIVE_THRESHOLD.
 *    Confidence is computed by TemporalEngine.scanVaults() which handles both
 *    explicit `temporal` blocks and legacy top-level createdAt/confidence fields.
 *  - Archival = append `{ type: "archive", id, reason, archivedAt }` to the JSONL.
 *    The original row is NEVER deleted (JSONL canon = append-only).
 *  - Idempotent: entries that already have an archive event in the file are
 *    skipped — re-running same day produces zero additional archives.
 *
 * Exported for direct testing (test/v91-identity-drift.test.ts Suite B).
 *
 * @param vaultDir  Directory containing *.jsonl vault files.
 * @returns SweepResult with inspected/decayed/archived counts.
 */
export async function sweepDecay(vaultDir: string): Promise<SweepResult> {
  const engine = new TemporalEngine({ decayHalfLifeDays: 90 });
  const result: SweepResult = { inspected: 0, decayed: 0, archived: 0 };

  if (!existsSync(vaultDir)) return result;

  // Use TemporalEngine.scanVaults() (public API) — reads all JSONL in vaultDir
  // and returns staleness/confidence reports. One call; group by vault name.
  const allReports = engine.scanVaults(vaultDir);

  // Group reports by vault file name (lower-cased filename without .jsonl).
  const byVault = new Map<string, typeof allReports>();
  for (const r of allReports) {
    const vaultName = r.vault.toLowerCase();
    // Skip protected vaults at grouping stage — they must never be processed.
    if (PROTECTED_VAULTS.has(vaultName)) continue;
    if (!byVault.has(vaultName)) byVault.set(vaultName, []);
    byVault.get(vaultName)!.push(r);
  }

  // Process each decayable vault.
  for (const [vaultName, reports] of byVault) {
    const filePath = join(vaultDir, `${vaultName}.jsonl`);
    if (!existsSync(filePath)) continue;

    // Build set of already-archived IDs for idempotency (read current file).
    const rawBefore = readFileSync(filePath, "utf-8");
    const alreadyArchived = new Set<string>();
    for (const line of rawBefore.split("\n")) {
      if (!line.trim()) continue;
      try {
        const evt = JSON.parse(line) as Record<string, unknown>;
        if (evt.type === "archive" && typeof evt.id === "string") {
          alreadyArchived.add(evt.id);
        }
      } catch {
        // Skip malformed lines
      }
    }

    for (const report of reports) {
      result.inspected++;

      // Skip already-archived entries (idempotency).
      if (alreadyArchived.has(report.entryId)) continue;

      result.decayed++;

      if (report.currentConfidence < ARCHIVE_THRESHOLD) {
        const archiveEvent = JSON.stringify({
          type: "archive",
          id: report.entryId,
          reason: `decayed confidence ${report.currentConfidence.toFixed(4)} < ${ARCHIVE_THRESHOLD} threshold (90-day half-life)`,
          archivedAt: new Date().toISOString(),
        });
        appendFileSync(filePath, archiveEvent + "\n", "utf-8");
        alreadyArchived.add(report.entryId); // prevent double-archive within same run
        result.archived++;
      }
    }
  }

  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  ensureLog();
  const ts = timestamp();

  if (!existsSync(VAULT_DIR)) {
    appendReceipt(`- ${ts} · error: vaultDir not found at ${VAULT_DIR}`);
    console.error(`vaultDir not found: ${VAULT_DIR}`);
    process.exit(2);
  }

  (async () => {
    try {
      // Step 1: Dreaming agent
      const agent = new DreamingAgent(VAULT_DIR);
      const dreamResult = agent.dream(SESSIONS_DIR, AUDIT_DIR);

      // Step 2: Decay sweep
      const sweep = await sweepDecay(VAULT_DIR);

      // Step 2b: Second Brain reflection pass (additive, opt-in via
      // STARLIGHT_SECONDBRAIN_DIRS = comma/semicolon-separated dirs). Consolidates
      // Frank's distilled Second-Brain layer (_meta / patterns / decisions / people)
      // exactly like the SIS vaults: cross-file wisdom-promotion + contradiction
      // detection over each dir's .md files. Default-off: unset env => zero behavior
      // change. Uses a non-existent sessions dir so no session insights are counted
      // here (this pass is about notes, not sessions). Never writes to these dirs.
      let sbDirs = 0, sbPromotions = 0, sbContradictions = 0, sbNew = 0;
      const sbSpec = process.env.STARLIGHT_SECONDBRAIN_DIRS;
      if (sbSpec) {
        // Delta state: promotions already surfaced in a prior run are not re-queued.
        // Without this, the nightly run re-reports the same static cross-links forever
        // (observed: identical sb_promotions: 18 every night since 2026-07-01).
        const statePath = join(REPO_ROOT, "memory", ".dreaming-state.json");
        let seen: string[] = [];
        try { seen = JSON.parse(readFileSync(statePath, "utf-8")).sbPromotionsSeen ?? []; } catch { /* first run */ }
        const seenSet = new Set(seen);
        const fresh: string[] = [];

        for (const dir of sbSpec.split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
          if (!existsSync(dir)) continue;
          try {
            const sbResult = new DreamingAgent(dir).dream("__no_sessions__");
            sbDirs++;
            sbPromotions += sbResult.promotions.length;
            sbContradictions += sbResult.contradictions.length;
            const dirTag = dir.replace(/\\/g, "/").split("/").filter(Boolean).slice(-1)[0];
            for (const p of sbResult.promotions) {
              const key = `${dirTag}|${p.entryId}`;
              if (seenSet.has(key)) continue;
              seenSet.add(key);
              fresh.push(`- [ ] **\`${p.entryId}\`** (${dirTag}) — ${p.fromVault} → wisdom\n      ${p.reason}`);
            }
          } catch (sbErr) {
            console.warn(`  SecondBrain: skipped ${dir}: ${sbErr instanceof Error ? sbErr.message : String(sbErr)}`);
          }
        }

        sbNew = fresh.length;
        if (fresh.length > 0) {
          const queuePath = join(REPO_ROOT, "memory", "PROMOTION_QUEUE.md");
          appendFileSync(queuePath, `\n### ${ts} — Second Brain pass (${fresh.length} new)\n\n${fresh.join("\n")}\n`, "utf-8");
        }
        writeFileSync(statePath, JSON.stringify({ sbPromotionsSeen: [...seenSet] }, null, 2), "utf-8");
      }

      const line =
        `- ${ts}` +
        ` · insights: ${dreamResult.extractedInsights.length}` +
        ` · contradictions: ${dreamResult.contradictions.length}` +
        ` · promotions: ${dreamResult.promotions.length}` +
        ` · processed: ${dreamResult.processedFiles}` +
        ` · decayed: ${sweep.decayed}` +
        ` · archived: ${sweep.archived}` +
        (sbDirs ? ` · sb_dirs: ${sbDirs} · sb_promotions: ${sbPromotions} · sb_new: ${sbNew} · sb_contradictions: ${sbContradictions}` : "");
      appendReceipt(line);
      console.log(line);

      // Step 3: Git auto-commit (absorb Git-backed versioning paradigm)
      try {
        if (process.env.STARLIGHT_GIT_AUTO_COMMIT !== "false") {
          const commitMsg = `chore(memory): dreaming consolidation [insights: ${dreamResult.extractedInsights.length}, promotions: ${dreamResult.promotions.length}, archived: ${sweep.archived}]`;
          execSync("git add memory/vaults/ memory/CONSOLIDATION_LOG.md", { cwd: REPO_ROOT, stdio: "ignore" });
          
          // Check if there are staged changes to commit
          const status = execSync("git diff --cached --name-only", { cwd: REPO_ROOT }).toString().trim();
          if (status) {
            execSync(`git commit -m "${commitMsg}"`, { cwd: REPO_ROOT, stdio: "ignore" });
            console.log(`  Git: Auto-committed memory changes: "${commitMsg}"`);
          } else {
            console.log("  Git: No memory changes to commit.");
          }
        }
      } catch (gitErr) {
        console.warn(`  Git Warning: Auto-commit skipped: ${gitErr instanceof Error ? gitErr.message : String(gitErr)}`);
      }

      process.exit(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendReceipt(`- ${ts} · error: ${escapeForLog(msg)}`);
      console.error(msg);
      process.exit(1);
    }
  })();
}

// Guard: only run main() when this script is invoked directly, not when
// imported as a module by tests or other scripts.
// Technique: compare the canonical script path to process.argv[1].
// Works with tsx (which sets argv[1] to the .ts file path) and compiled Node.
const _scriptFile = fileURLToPath(import.meta.url).replace(/\\/g, "/");
const _argvFile = resolve(process.argv[1] ?? "").replace(/\\/g, "/");
// Match on the last two path segments (scripts/dreaming-run) to be
// robust against OS path separator differences.
const _scriptSuffix = _scriptFile.split("/").slice(-2).join("/");
if (_argvFile.replace(/\\/g, "/").endsWith(_scriptSuffix)) {
  main();
}
