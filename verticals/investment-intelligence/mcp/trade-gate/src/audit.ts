/**
 * Append-only audit log — durable JSONL.
 *
 * ⚠️ v0.1. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Invariant (ports payment-intelligence-system L1): no trade action exists
 * without a prior audit entry, and if the log write fails the action fails.
 * Append-only — never edited, never deleted, never reordered.
 *
 * Each entry persists to `.trade-gate-data/audit.jsonl` (override via
 * TRADE_GATE_DATA_DIR or constructor) FIRST; the in-memory array is a fast
 * read mirror loaded at construction. A failed disk write throws, so the
 * caller fails closed.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { AuditEntry } from "./types.js";

const DEFAULT_DIR = ".trade-gate-data";
const AUDIT_FILE = "audit.jsonl";

/** Resolve the data dir: explicit arg → env → default. */
export function resolveDataDir(dataDir?: string): string {
  return dataDir ?? process.env.TRADE_GATE_DATA_DIR ?? DEFAULT_DIR;
}

export class AuditLog {
  private readonly entries: AuditEntry[] = [];
  private readonly path: string;

  constructor(dataDir?: string) {
    this.path = join(resolveDataDir(dataDir), AUDIT_FILE);
    mkdirSync(dirname(this.path), { recursive: true });
    this.load();
  }

  private load(): void {
    if (!existsSync(this.path)) return;
    const raw = readFileSync(this.path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as AuditEntry;
        this.entries.push(Object.freeze(parsed));
      } catch {
        // A corrupt line is skipped on read but never rewritten — the file is
        // append-only and history is not edited.
      }
    }
  }

  /**
   * Append an entry. Persists to JSONL FIRST, then mirrors in memory. Throws
   * on a malformed entry OR a failed disk write so the caller fails the trade
   * action closed — an unloggable decision must not proceed.
   */
  append(entry: Omit<AuditEntry, "ts"> & { ts?: number }): AuditEntry {
    if (!entry.action || typeof entry.action !== "string") {
      throw new Error("audit append failed: missing action — failing closed");
    }
    const stored: AuditEntry = Object.freeze({ ...entry, ts: entry.ts ?? Date.now() });
    appendFileSync(this.path, JSON.stringify(stored) + "\n", "utf8");
    this.entries.push(stored);
    return stored;
  }

  /** Read-only snapshot. Returns a copy so callers cannot mutate the log. */
  all(): readonly AuditEntry[] {
    return [...this.entries];
  }

  size(): number {
    return this.entries.length;
  }

  filePath(): string {
    return this.path;
  }
}
