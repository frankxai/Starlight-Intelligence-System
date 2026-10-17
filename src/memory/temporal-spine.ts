/**
 * src/memory/temporal-spine.ts — Bi-Temporal Fact Spine for Starlight Intelligence System.
 *
 * Implements Graphiti-style bi-temporal edges (tValid, tInvalid, tCreated, tExpired,
 * supersededBy) and deterministic git/PR provenance on top of append-only JSONL / SQLite
 * without requiring Neo4j or Docker containers.
 *
 * Built on SIP — operational tier (memory engine v0.3)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export type VaultName =
  | 'strategic'
  | 'technical'
  | 'creative'
  | 'operational'
  | 'wisdom'
  | 'horizon';

export interface GitProvenance {
  repo: string;
  commitSha?: string;
  prNumber?: number;
  filePath?: string;
  handoverId?: string;
}

export interface TemporalFact {
  id: string;
  vault: VaultName;
  subject: string;
  predicate: string;
  object: string;
  /** When the fact became true in reality (ISO-8601). */
  tValid: string;
  /** When the fact stopped being true in reality (null if still active). */
  tInvalid: string | null;
  /** When the system recorded this fact (ISO-8601). */
  tCreated: string;
  /** When the contradiction engine retired this record (null if still active). */
  tExpired: string | null;
  /** ID of the newer fact that superseded this one, if any. */
  supersededBy: string | null;
  confidence: number;
  provenance?: GitProvenance;
}

export interface AssertFactInput {
  id?: string;
  vault: VaultName;
  subject: string;
  predicate: string;
  object: string;
  tValid?: string;
  tCreated?: string;
  confidence?: number;
  provenance?: GitProvenance;
}

export class TemporalFactSpine {
  private readonly storePath: string;
  private facts: Map<string, TemporalFact> = new Map();

  constructor(storePath: string) {
    this.storePath = resolve(storePath);
    this.load();
  }

  private load(): void {
    this.facts.clear();
    if (!existsSync(this.storePath)) {
      return;
    }
    const raw = readFileSync(this.storePath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const fact = JSON.parse(trimmed) as TemporalFact;
        if (fact && typeof fact.id === 'string') {
          this.facts.set(fact.id, fact);
        }
      } catch {
        // Ignore malformed trailing lines
      }
    }
  }

  private persistAll(): void {
    mkdirSync(dirname(this.storePath), { recursive: true });
    const lines = Array.from(this.facts.values()).map((f) => JSON.stringify(f));
    writeFileSync(this.storePath, lines.length ? lines.join('\n') + '\n' : '', 'utf8');
  }

  /**
   * Assert a fact into the temporal spine.
   * If an active fact with the same (vault, subject, predicate) exists and has a
   * different `object`, it is automatically superseded (tInvalid = newFact.tValid,
   * tExpired = now, supersededBy = newFact.id).
   * If an active fact with the exact same (vault, subject, predicate, object) exists,
   * its provenance/confidence is refreshed without duplicating rows.
   */
  assertFact(input: AssertFactInput): {
    fact: TemporalFact;
    supersededIds: string[];
    deduplicated: boolean;
  } {
    const nowIso = input.tCreated ?? new Date().toISOString();
    const validIso = input.tValid ?? nowIso;
    const normSubject = input.subject.trim();
    const normPredicate = input.predicate.trim();
    const normObject = input.object.trim();

    if (!normSubject || !normPredicate || !normObject) {
      throw new Error('subject, predicate, and object must be non-empty strings');
    }

    // Check existing active facts for the same (vault, subject, predicate)
    const supersededIds: string[] = [];
    for (const existing of this.facts.values()) {
      const isSameSlot =
        existing.vault === input.vault &&
        existing.subject === normSubject &&
        existing.predicate === normPredicate &&
        existing.tInvalid === null &&
        existing.supersededBy === null;

      if (!isSameSlot) continue;

      if (existing.object === normObject) {
        // Idempotent refresh of identical active truth
        existing.confidence = Math.max(existing.confidence, input.confidence ?? 1.0);
        if (input.provenance) {
          existing.provenance = { ...existing.provenance, ...input.provenance };
        }
        this.persistAll();
        return { fact: existing, supersededIds: [], deduplicated: true };
      }

      supersededIds.push(existing.id);
    }

    const newFact: TemporalFact = {
      id: input.id ?? randomUUID(),
      vault: input.vault,
      subject: normSubject,
      predicate: normPredicate,
      object: normObject,
      tValid: validIso,
      tInvalid: null,
      tCreated: nowIso,
      tExpired: null,
      supersededBy: null,
      confidence: input.confidence ?? 1.0,
      provenance: input.provenance,
    };

    for (const oldId of supersededIds) {
      const oldFact = this.facts.get(oldId);
      if (oldFact) {
        oldFact.tInvalid = validIso;
        oldFact.tExpired = nowIso;
        oldFact.supersededBy = newFact.id;
      }
    }

    this.facts.set(newFact.id, newFact);
    if (supersededIds.length > 0) {
      this.persistAll();
    } else {
      mkdirSync(dirname(this.storePath), { recursive: true });
      appendFileSync(this.storePath, JSON.stringify(newFact) + '\n', 'utf8');
    }

    return { fact: newFact, supersededIds, deduplicated: false };
  }

  /**
   * Return only currently active (non-superseded, non-invalidated) facts.
   */
  queryActiveFacts(filter?: {
    vault?: VaultName;
    subject?: string;
    predicate?: string;
    keyword?: string;
  }): TemporalFact[] {
    const kw = filter?.keyword?.toLowerCase();
    return Array.from(this.facts.values()).filter((f) => {
      if (f.tInvalid !== null || f.supersededBy !== null) return false;
      if (filter?.vault && f.vault !== filter.vault) return false;
      if (filter?.subject && f.subject !== filter.subject) return false;
      if (filter?.predicate && f.predicate !== filter.predicate) return false;
      if (kw) {
        const hay = `${f.subject} ${f.predicate} ${f.object}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  /**
   * Point-in-time historical recall (Graphiti bi-temporal semantics):
   * Returns facts that were valid in reality at `asOfIso` (tValid <= asOfIso < tInvalid).
   */
  queryFactsAt(asOfIso: string, filter?: { subject?: string; vault?: VaultName }): TemporalFact[] {
    const targetMs = Date.parse(asOfIso);
    if (Number.isNaN(targetMs)) {
      throw new Error(`Invalid ISO timestamp: ${asOfIso}`);
    }
    return Array.from(this.facts.values()).filter((f) => {
      if (filter?.vault && f.vault !== filter.vault) return false;
      if (filter?.subject && f.subject !== filter.subject) return false;
      const validStart = Date.parse(f.tValid);
      const validEnd = f.tInvalid ? Date.parse(f.tInvalid) : Number.POSITIVE_INFINITY;
      return validStart <= targetMs && targetMs < validEnd;
    });
  }

  /**
   * Return the full lineage chain for a (vault, subject, predicate) slot ordered by tValid.
   */
  getLineage(vault: VaultName, subject: string, predicate: string): TemporalFact[] {
    return Array.from(this.facts.values())
      .filter((f) => f.vault === vault && f.subject === subject && f.predicate === predicate)
      .sort((a, b) => Date.parse(a.tValid) - Date.parse(b.tValid));
  }

  /**
   * Format active facts into a deterministic, token-bounded text block suitable
   * for Turn-0 or task-scoped context injection.
   */
  formatCompactBlock(options?: { vault?: VaultName; subject?: string; maxChars?: number }): string {
    const maxChars = options?.maxChars ?? 2000;
    const active = this.queryActiveFacts({
      vault: options?.vault,
      subject: options?.subject,
    }).sort((a, b) => `${a.vault}:${a.subject}:${a.predicate}`.localeCompare(`${b.vault}:${b.subject}:${b.predicate}`));

    const lines: string[] = [];
    let used = 0;
    for (const f of active) {
      const prov = f.provenance?.prNumber
        ? ` (${f.provenance.repo}#${f.provenance.prNumber})`
        : f.provenance?.commitSha
          ? ` (${f.provenance.repo}@${f.provenance.commitSha.slice(0, 7)})`
          : '';
      const line = `- [${f.vault}:${f.subject}] ${f.predicate} -> ${f.object}${prov}`;
      if (used + line.length + 1 > maxChars) break;
      lines.push(line);
      used += line.length + 1;
    }
    return lines.join('\n');
  }
}

