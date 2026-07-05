/**
 * Starlight Intelligence System — Dreaming Agent
 * Processes session transcripts, extracts insights, identifies Wisdom promotions.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { type Contradiction, ContradictionDetector } from "./contradiction.js";
import { atomText } from "./atom.js";

export interface DreamResult {
  extractedInsights: Array<{ content: string; suggestedVault: string; confidence: number; source: string }>;
  contradictions: Contradiction[];
  promotions: Array<{ entryId: string; fromVault: string; toVault: "wisdom"; reason: string; content: string }>;
  processedFiles: number;
  timestamp: string;
}

interface SessionData {
  scores?: { commits_pushed?: number; files_changed?: number; tests_passed?: number; lines_added?: number; [k: string]: unknown };
  guardian?: string;
  duration?: number;
  summary?: string;
  tasks?: string[];
  [k: string]: unknown;
}

type VaultEntry = { id: string; vault: string; content: string; createdAt: string };

const HIGH_COMMITS = 5, HIGH_FILES = 10, LONG_SESSION_SEC = 3600;
// PROMO_SIM calibration history:
//   v1 (pre-2026-05-22): 0.5 — set for atom-level session insights (~50-200 chars).
//     Unreachable for vault-doc-level chunks (~500-2000 chars) because trigram
//     density scales inversely with text length. 36-pair probe on memory/vaults/*.md
//     showed max cross-vault similarity = 0.22 (creative ↔ strategic).
//   v2 (2026-05-22, Fix C calibration): 0.15 — above noise floor, captures top ~10
//     cross-vault pairs. Promotions now fire on real vault overlap rather than never.
//     Trade-off: more promotions, some noise. Beats silence.
//   Future v3: when embedding sidecar is wired into dreaming agent, swap trigram
//     Jaccard for hashing-TF cosine; threshold will recalibrate to ~0.4.
const PROMO_SIM = 0.15;

// CONTRADICTION_MIN_SIM: ContradictionDetector.scanVaults() defaults minSimilarity
// to 0.6 (calibrated for atom-level text), which real MD vault-doc chunks can
// never reach on plain overlap (ceiling ~0.22, per the PROMO_SIM probe above).
// similarity() applies a +0.25 boost only when opposing polarity terms
// (always/never/must/avoid/...) are present on both sides, capped at 1.0 — so a
// genuine cross-vault contradiction tops out around 0.22 + 0.25 = 0.47, while a
// merely-similar-but-non-opposing pair stays capped at the 0.22 ceiling. 0.4 sits
// between the two: reachable by a real opposing pair, unreachable by noise alone.
const CONTRADICTION_MIN_SIM = 0.4;

export class DreamingAgent {
  private readonly vaultDir: string;
  private readonly detector: ContradictionDetector;

  constructor(vaultDir: string) {
    this.vaultDir = vaultDir;
    this.detector = new ContradictionDetector();
  }

  dream(sessionsDir: string, auditDir?: string): DreamResult {
    const allInsights: DreamResult["extractedInsights"] = [];
    let processedFiles = 0;

    // Tier 1 — voice-operator session JSON (original path)
    if (fs.existsSync(sessionsDir)) {
      for (const file of fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".json"))) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(sessionsDir, file), "utf-8")) as SessionData;
          for (const ins of this.extractInsights(data)) allInsights.push({ ...ins, source: file });
          processedFiles++;
        } catch { /* skip */ }
      }
    }

    // Tier 2 — audit-log JSONL (Fix A — 2026-05-20). Each daily file is one
    // batch of substrate commits; treat as a synthetic session aggregating
    // namespaces, redaction stats, and attestation freshness. Closes the gap
    // when voice-operator is paused (per project_voice_operator_bridge_off.md).
    if (auditDir && fs.existsSync(auditDir)) {
      for (const file of fs.readdirSync(auditDir).filter((f) => f.endsWith(".jsonl"))) {
        try {
          const synth = this.aggregateAuditDay(path.join(auditDir, file));
          for (const ins of this.extractInsights(synth)) allInsights.push({ ...ins, source: `audit/${file}` });
          processedFiles++;
        } catch { /* skip — corrupt rows shouldn't break the night */ }
      }
    }

    return {
      extractedInsights: allInsights,
      contradictions: this.detectContradictions(this.vaultDir),
      promotions: this.identifyPromotions(this.vaultDir),
      processedFiles,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Aggregate one audit-log day into synthetic SessionData so existing
   * extractInsights() can consume it without a parallel rule-set.
   * Maps audit-row signals to session-shaped scores:
   *   - commits_pushed ← count of op:"commit" rows
   *   - files_changed  ← unique namespaces touched
   *   - duration       ← span between first and last ts
   *   - guardian       ← any redacted-row reason (privacy posture marker)
   */
  private aggregateAuditDay(auditFile: string): SessionData {
    const lines = fs.readFileSync(auditFile, "utf-8").split("\n").filter((l) => l.trim().length > 0);
    const namespaces = new Set<string>();
    const reasons = new Set<string>();
    let commits = 0;
    let firstTs: number | null = null;
    let lastTs: number | null = null;

    for (const line of lines) {
      try {
        const row = JSON.parse(line) as { op?: string; namespace?: string; ts?: string; reasons?: string[] };
        if (row.op === "commit") commits++;
        if (row.namespace) namespaces.add(row.namespace);
        if (row.reasons) for (const r of row.reasons) reasons.add(r);
        if (row.ts) {
          const t = Date.parse(row.ts);
          if (!isNaN(t)) {
            if (firstTs === null || t < firstTs) firstTs = t;
            if (lastTs === null || t > lastTs) lastTs = t;
          }
        }
      } catch { /* skip corrupt row */ }
    }

    const duration = firstTs !== null && lastTs !== null ? Math.round((lastTs - firstTs) / 1000) : 0;
    return {
      scores: {
        commits_pushed: commits,
        files_changed: namespaces.size,
      },
      duration,
      guardian: reasons.size > 0 ? `redactions:${[...reasons].join(",")}` : undefined,
      summary: `Audit day ${path.basename(auditFile, ".jsonl")}: ${commits} commits across ${namespaces.size} namespaces`,
    };
  }

  extractInsights(sessionData: Record<string, unknown>): Array<{ content: string; suggestedVault: string; confidence: number }> {
    const d = sessionData as SessionData;
    const out: Array<{ content: string; suggestedVault: string; confidence: number }> = [];
    const s = d.scores;

    if (s?.commits_pushed && s.commits_pushed >= HIGH_COMMITS)
      out.push({ content: `High-output session: ${s.commits_pushed} commits${d.guardian ? `, guardian: ${d.guardian}` : ""}`, suggestedVault: "operational", confidence: 0.8 });

    if (s?.files_changed && s.files_changed >= HIGH_FILES)
      out.push({ content: `Broad refactor: ${s.files_changed} files changed`, suggestedVault: "technical", confidence: 0.7 });

    if (d.guardian)
      out.push({ content: `Workflow preference: guardian "${d.guardian}"`, suggestedVault: "strategic", confidence: 0.6 });

    if (d.duration && d.duration >= LONG_SESSION_SEC)
      out.push({ content: `Deep-work session: ${Math.round(d.duration / 60)}m`, suggestedVault: "operational", confidence: 0.65 });

    if (s?.tests_passed && s.tests_passed > 0)
      out.push({ content: `Test-driven session: ${s.tests_passed} tests passing`, suggestedVault: "technical", confidence: 0.7 });

    if (typeof d.summary === "string" && d.summary.length > 20) {
      // Audit-day summaries (from Fix A aggregateAuditDay) are operational signal,
      // not creative — they record commits/namespaces/redactions per day.
      // Calibration fix 2026-05-22 per Fix C in MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md.
      const isAuditDay = d.summary.startsWith("Audit day ");
      out.push({
        content: d.summary,
        suggestedVault: isAuditDay ? "operational" : "creative",
        confidence: isAuditDay ? 0.7 : 0.5,
      });
    }

    return out;
  }

  identifyPromotions(vaultDir: string): DreamResult["promotions"] {
    const entries = this.readVaultEntries(vaultDir);
    const promos: DreamResult["promotions"] = [];
    const seen = new Set<string>();

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].vault === "wisdom" || seen.has(entries[i].id)) continue;
      const crossVaults = new Set<string>();
      for (let j = 0; j < entries.length; j++) {
        if (i === j || entries[j].vault === entries[i].vault || entries[j].vault === "wisdom") continue;
        if (this.detector.similarity(entries[i].content, entries[j].content) >= PROMO_SIM)
          crossVaults.add(entries[j].vault);
      }
      if (crossVaults.size >= 1) {
        seen.add(entries[i].id);
        promos.push({ entryId: entries[i].id, fromVault: entries[i].vault, toVault: "wisdom",
          reason: `Cross-vault pattern: found in ${entries[i].vault} + ${[...crossVaults].join(", ")}`,
          content: entries[i].content });
      }
    }
    return promos;
  }

  detectContradictions(vaultDir: string): Contradiction[] {
    // Exclude "wisdom" — every entry there is a verbatim promoted copy of its
    // own source (see applyDreamResult), so comparing it back against that
    // source is a guaranteed identical-text self-match, not a contradiction.
    return this.detector.scanVaults(vaultDir, { minSimilarity: CONTRADICTION_MIN_SIM, excludeVaults: ["wisdom"] });
  }

  private readVaultEntries(vaultDir: string): VaultEntry[] {
    if (!fs.existsSync(vaultDir)) return [];
    const entries: VaultEntry[] = [];

    // Tier 1 — original JSONL vault format ({id, vault, insight|wish, createdAt})
    for (const file of fs.readdirSync(vaultDir).filter((f) => f.endsWith(".jsonl"))) {
      const vault = path.basename(file, ".jsonl");
      for (const line of fs.readFileSync(path.join(vaultDir, file), "utf-8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const r = JSON.parse(line) as Record<string, unknown>;
          // content ?? insight ?? wish via atomText — runtime atoms write `content`,
          // seeded/starter atoms write `insight`/`wish`; all must feed consolidation.
          const content = atomText(r);
          if (content) entries.push({ id: r.id as string, vault: (r.vault as string) || vault, content, createdAt: r.createdAt as string });
        } catch { /* skip */ }
      }
    }

    // Tier 2 — SIS canonical MD vault format (Fix B 2026-05-21 + Fix C2 2026-05-22).
    // Each MD file is SPLIT BY SECTION HEADING (## or ###) — section-chunks
    // give cross-vault trigram similarity actual signal to work on. Whole-file
    // entries (the original Fix B shape) drowned the trigram metric in noise.
    // See docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md §5b.
    for (const file of fs.readdirSync(vaultDir).filter((f) => f.endsWith(".md"))) {
      const stem = path.basename(file, ".md");
      const vault = stem.endsWith("-vault") ? stem.slice(0, -"-vault".length) : stem;
      try {
        const fileMtime = fs.statSync(path.join(vaultDir, file)).mtime.toISOString();
        const content = fs.readFileSync(path.join(vaultDir, file), "utf-8");
        const sections = content.split(/\n(?=#{2,3}\s)/);
        sections.forEach((sec, i) => {
          // Section 0 is everything before the first ##/### heading — strip its
          // YAML frontmatter (retention/writers/readers boilerplate is near-
          // identical across every vault file, so leaving it in makes section 0
          // spuriously "similar" to every other vault's section 0).
          const trimmed = (i === 0 ? sec.replace(/^---\n[\s\S]*?\n---\n?/, "") : sec).trim();
          if (trimmed.length < 100) return;  // skip tiny preamble fragments
          entries.push({
            id: `md:${file}#${i}`,
            vault,
            content: trimmed,
            createdAt: fileMtime,
          });
        });
      } catch { /* skip — corrupt or unreadable file */ }
    }

    return entries;
  }
}

// ── Persistence (the write side of a dream cycle) ─────────────────────────────
//
// DreamingAgent stays pure-analysis: it reads vaults and returns a DreamResult
// but never mutates disk. applyDreamResult is the write side, split out so the
// persistence is unit-testable in isolation and the agent never grows a vault
// dependency it can accidentally corrupt.
//
// Built on SIP — operational tier (memory persistence).

/** Name of the idempotency ledger that guards promotions against double-write. */
const PROMOTION_LEDGER = ".promotion-ledger.json";

export interface ApplyDreamOptions {
  /** Injectable clock for deterministic tests. Defaults to `new Date().toISOString()`. */
  now?: () => string;
}

export interface ApplyDreamStats {
  promotionsWritten: number;
  promotionsSkipped: number;
  insightsWritten: number;
  insightsSkipped: number;
  contradictionsWritten: number;
}

/** Collect the set of atom ids already present in a JSONL vault file. */
function readExistingIds(filePath: string): Set<string> {
  const ids = new Set<string>();
  if (!fs.existsSync(filePath)) return ids;
  for (const line of fs.readFileSync(filePath, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line) as Record<string, unknown>;
      if (typeof r.id === "string") ids.add(r.id);
    } catch { /* skip malformed line */ }
  }
  return ids;
}

function readLedger(ledgerPath: string): string[] {
  if (!fs.existsSync(ledgerPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(ledgerPath, "utf-8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Persist a DreamResult to disk. Three write channels, each with its own
 * durability contract:
 *
 *  - PROMOTIONS → append a `wis_promo_<sourceId>` atom to wisdom.jsonl carrying
 *    the source's own text (carried inline on the promotion, from either a
 *    JSONL atom or an `md:*` vault-doc section) + provenance. Guarded by an
 *    idempotency ledger (.promotion-ledger.json) so a source is promoted at
 *    most once, ever.
 *  - INSIGHTS → append to <suggestedVault>.jsonl with a content-hash id, so a
 *    repeated run never materializes the same insight twice.
 *  - CONTRADICTIONS → overwrite contradictions.jsonl entirely (a report of the
 *    current state, not an append-only ledger).
 *
 * @param result   The DreamResult produced by DreamingAgent.dream().
 * @param vaultDir Directory of JSONL vault files to persist into.
 * @param options  Optional injectable clock.
 * @returns Counts of what was written vs. skipped.
 */
export function applyDreamResult(
  result: DreamResult,
  vaultDir: string,
  options?: ApplyDreamOptions,
): ApplyDreamStats {
  const nowIso = options?.now ?? (() => new Date().toISOString());
  const stats: ApplyDreamStats = {
    promotionsWritten: 0,
    promotionsSkipped: 0,
    insightsWritten: 0,
    insightsSkipped: 0,
    contradictionsWritten: 0,
  };

  if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });

  // ── Promotions → wisdom.jsonl (idempotent via ledger) ──────────────────────
  const ledgerPath = path.join(vaultDir, PROMOTION_LEDGER);
  const ledger = new Set<string>(readLedger(ledgerPath));
  const wisdomPath = path.join(vaultDir, "wisdom.jsonl");

  for (const promo of result.promotions) {
    const sourceId = promo.entryId;
    if (ledger.has(sourceId)) { stats.promotionsSkipped++; continue; }  // already promoted
    if (!promo.content) { stats.promotionsSkipped++; continue; }       // no text to promote

    const atom = {
      id: `wis_promo_${sourceId}`,
      vault: "wisdom",
      content: promo.content,
      category: "insight",
      confidence: "high",
      source: "dreaming-promotion",
      createdAt: nowIso(),
      metadata: { promotedFrom: promo.fromVault, sourceId, reason: promo.reason },
    };
    fs.appendFileSync(wisdomPath, JSON.stringify(atom) + "\n", "utf-8");
    ledger.add(sourceId);
    stats.promotionsWritten++;
  }
  fs.writeFileSync(ledgerPath, JSON.stringify([...ledger], null, 2) + "\n", "utf-8");

  // ── Insights → <suggestedVault>.jsonl (idempotent via content hash) ────────
  const existingByFile = new Map<string, Set<string>>();
  for (const ins of result.extractedInsights) {
    const targetPath = path.join(vaultDir, `${ins.suggestedVault}.jsonl`);
    let existing = existingByFile.get(targetPath);
    if (!existing) { existing = readExistingIds(targetPath); existingByFile.set(targetPath, existing); }

    const hash = createHash("sha1").update(`${ins.content}|${ins.source}`).digest("hex").slice(0, 16);
    const id = `ins_${hash}`;
    if (existing.has(id)) { stats.insightsSkipped++; continue; }

    const atom = {
      id,
      vault: ins.suggestedVault,
      content: ins.content,
      category: "insight",
      confidence: ins.confidence,
      source: "dreaming-insight",
      createdAt: nowIso(),
      metadata: { originSource: ins.source },
    };
    fs.appendFileSync(targetPath, JSON.stringify(atom) + "\n", "utf-8");
    existing.add(id);
    stats.insightsWritten++;
  }

  // ── Contradictions → contradictions.jsonl (report; overwrite each run) ─────
  const contradictionsPath = path.join(vaultDir, "contradictions.jsonl");
  const body = result.contradictions.map((c) => JSON.stringify(c)).join("\n");
  fs.writeFileSync(contradictionsPath, body ? body + "\n" : "", "utf-8");
  stats.contradictionsWritten = result.contradictions.length;

  return stats;
}
