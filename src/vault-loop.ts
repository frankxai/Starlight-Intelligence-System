/**
 * src/vault-loop.ts — VaultLoopEntry substrate trust contract.
 *
 * Per Proposal C (board verdict docs/boards/2026-05-11-v01-sis-shipping-bundle.md,
 * PROCEED-WITH-REVISE C.2), entries with privacy: 'private' MUST NOT appear in
 * export, search, attestation, or knowledge-graph output. This module provides
 * the canonical filter functions every export/search/attestation/KG pathway
 * MUST route through.
 *
 * The privacy gate is enforced structurally, not by assertion. The test at
 * test/v01-vault-loop-privacy.test.ts fails if any of these functions leak a
 * private entry into a surface where it does not belong.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate clause: § 5 (sovereignty + encoded-self forkable)
 * - Vault Architecture: memory/VAULT_ARCHITECTURE.md (record TYPE across vaults)
 */

import type { VaultLoopEntry, VaultLoopPrivacy } from "./types.js";

// ── Pathway taxonomy ──────────────────────────────────────────────────────
//
// Every surface that emits VaultLoopEntry data MUST declare its pathway.
// Pathways determine which privacy classifications are permitted.

export type ExportPathway =
  | "export"        // bulk export — e.g., sis.vault.export, /vault export
  | "search"        // search results — e.g., /vault search, MCP search tool
  | "attestation"   // SIP attestation artifact — public-facing
  | "knowledge-graph"  // graph rows + edges
  | "scoped-share";  // explicit named-recipient share

// ── Privacy contract ──────────────────────────────────────────────────────
//
// Hard rules. Encoded as a function so the test can introspect.

export function privacyAllowsPathway(
  privacy: VaultLoopPrivacy,
  pathway: ExportPathway,
): boolean {
  // 'private' is the substrate trust contract. NEVER allowed on any
  // public-facing pathway. Allowed on scoped-share ONLY if the caller
  // proves recipient consent (out-of-band — this function does not
  // grant consent; it merely allows the surface to consider the entry).
  if (privacy === "private") {
    return false;
  }
  // 'private-shareable' may appear in scoped exports to named recipients,
  // never in default-public surfaces.
  if (privacy === "private-shareable") {
    return pathway === "scoped-share";
  }
  // 'public' is permitted on every surface.
  return true;
}

// ── Canonical filter functions ────────────────────────────────────────────
//
// Every export, search, attestation, or KG pathway MUST route its
// candidate entries through one of these filters. Direct emission of a
// VaultLoopEntry array to any surface is a substrate violation and the
// privacy test will catch it.

export function filterForExport(entries: readonly VaultLoopEntry[]): VaultLoopEntry[] {
  return entries.filter((e) => privacyAllowsPathway(e.privacy, "export"));
}

export function filterForSearch(entries: readonly VaultLoopEntry[]): VaultLoopEntry[] {
  return entries.filter((e) => privacyAllowsPathway(e.privacy, "search"));
}

export function filterForAttestation(
  entries: readonly VaultLoopEntry[],
): VaultLoopEntry[] {
  return entries.filter((e) => privacyAllowsPathway(e.privacy, "attestation"));
}

export function filterForKnowledgeGraph(
  entries: readonly VaultLoopEntry[],
): VaultLoopEntry[] {
  return entries.filter((e) => privacyAllowsPathway(e.privacy, "knowledge-graph"));
}

/**
 * Scoped share — caller MUST supply a non-empty recipient list. The contract
 * is: 'private' entries are still blocked; 'private-shareable' entries pass
 * only when at least one recipient is named (consent assumed out-of-band);
 * 'public' entries pass unconditionally.
 *
 * The contract refuses to ship 'private' entries even on this pathway —
 * private is private, no exception. To share, the sovereign must first
 * promote the entry to 'private-shareable' via a deliberate write.
 */
export function filterForScopedShare(
  entries: readonly VaultLoopEntry[],
  recipients: readonly string[],
): VaultLoopEntry[] {
  if (recipients.length === 0) return [];
  return entries.filter((e) => privacyAllowsPathway(e.privacy, "scoped-share"));
}

// ── Stale-loop detection (REVISE-C.3) ─────────────────────────────────────
//
// A loop is "pending closure" when:
//   1. No downstream stage has been added within 30 days of the latest entry
//   2. The latest stage is not 'outcome' or 'proof' (i.e., the loop has not
//      reached natural closure)
//
// The dashboard surfaces these as a soft nudge.

const CLOSING_STAGES = new Set(["outcome", "proof"]);

export interface LoopStaleness {
  loopRootId: string;       // id of the root Desire entry
  latestEntryId: string;    // id of the most recent stage entry in this loop
  latestStage: string;      // stage of the most recent entry
  latestCreatedAt: string;  // when the most recent stage was recorded
  daysSinceLatest: number;
  isStale: boolean;         // true iff days > 30 AND latest stage is not closing
}

/**
 * Group entries by loop (root Desire) and return staleness assessment for each.
 * Loops with `latestStage` of 'outcome' or 'proof' are considered closed and
 * NEVER stale.
 *
 * The privacy contract applies upstream — callers should typically pass
 * `filterForSearch(allEntries)` or equivalent before grouping. This function
 * does NOT filter by privacy; it only computes staleness.
 */
export function assessLoopStaleness(
  entries: readonly VaultLoopEntry[],
  now: Date = new Date(),
): LoopStaleness[] {
  // Build parent map: child id → parent id
  const byId = new Map<string, VaultLoopEntry>();
  for (const e of entries) byId.set(e.id, e);

  // For each entry, find its root (walk parent chain to null)
  function findRoot(entry: VaultLoopEntry): string {
    let cur: VaultLoopEntry | undefined = entry;
    const seen = new Set<string>();
    while (cur && cur.parent_entry_id !== null) {
      if (seen.has(cur.id)) break; // cycle guard
      seen.add(cur.id);
      const parent = byId.get(cur.parent_entry_id);
      if (!parent) break;
      cur = parent;
    }
    return cur ? cur.id : entry.id;
  }

  // Group by root
  const byRoot = new Map<string, VaultLoopEntry[]>();
  for (const e of entries) {
    const root = findRoot(e);
    const list = byRoot.get(root) ?? [];
    list.push(e);
    byRoot.set(root, list);
  }

  const result: LoopStaleness[] = [];
  for (const [rootId, group] of byRoot.entries()) {
    // Most recent entry by created_at
    const sorted = [...group].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
    const latest = sorted[0]!;
    const latestTs = Date.parse(latest.created_at);
    const days = (now.getTime() - latestTs) / (1000 * 60 * 60 * 24);
    const isClosed = CLOSING_STAGES.has(latest.stage);
    result.push({
      loopRootId: rootId,
      latestEntryId: latest.id,
      latestStage: latest.stage,
      latestCreatedAt: latest.created_at,
      daysSinceLatest: days,
      isStale: !isClosed && days > 30,
    });
  }

  return result;
}
