/**
 * Starlight Intelligence System — Dreaming Agent
 * Processes session transcripts, extracts insights, identifies Wisdom promotions.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { type Contradiction, ContradictionDetector } from "./contradiction.js";

export interface DreamResult {
  extractedInsights: Array<{ content: string; suggestedVault: string; confidence: number; source: string }>;
  contradictions: Contradiction[];
  promotions: Array<{ entryId: string; fromVault: string; toVault: "wisdom"; reason: string }>;
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

const HIGH_COMMITS = 5, HIGH_FILES = 10, LONG_SESSION_SEC = 3600, PROMO_SIM = 0.5;

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

    if (typeof d.summary === "string" && d.summary.length > 20)
      out.push({ content: d.summary, suggestedVault: "creative", confidence: 0.5 });

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
          reason: `Cross-vault pattern: found in ${entries[i].vault} + ${[...crossVaults].join(", ")}` });
      }
    }
    return promos;
  }

  detectContradictions(vaultDir: string): Contradiction[] {
    return this.detector.scanVaults(vaultDir);
  }

  private readVaultEntries(vaultDir: string): VaultEntry[] {
    if (!fs.existsSync(vaultDir)) return [];
    const entries: VaultEntry[] = [];
    for (const file of fs.readdirSync(vaultDir).filter((f) => f.endsWith(".jsonl"))) {
      const vault = path.basename(file, ".jsonl");
      for (const line of fs.readFileSync(path.join(vaultDir, file), "utf-8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const r = JSON.parse(line) as Record<string, unknown>;
          const content = (r.insight as string) || (r.wish as string) || "";
          if (content) entries.push({ id: r.id as string, vault: (r.vault as string) || vault, content, createdAt: r.createdAt as string });
        } catch { /* skip */ }
      }
    }
    return entries;
  }
}
