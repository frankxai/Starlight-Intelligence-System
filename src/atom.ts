/**
 * Starlight Intelligence System — Canonical vault atom.
 *
 * Three atom shapes coexist on disk today:
 *   1. `insight`/`wish` atoms (public-vault starter content, seeded vaults)
 *   2. `content` atoms (runtime writes from the MCP server + VaultMemory)
 *   3. MemoryEvent-wrapped entries (the event store at .starlight/memory.jsonl)
 *
 * Before this module, each reader resolved text its own way — and two of them
 * (contradiction, dreaming) read `insight || wish` ONLY, silently excluding
 * every runtime-written atom from consolidation. This module is the single
 * text-resolution and normalization point so that can never diverge again.
 *
 * Built on SIP — operational tier (memory integrity).
 */

import type { VaultType } from './types.js';

/** The canonical flat vault atom — the shape every JSONL vault reader should target. */
export interface VaultAtom {
  id: string;
  vault: string;
  /** Resolved text (content ?? insight ?? wish). Empty string when none present. */
  text: string;
  category: string | null;
  /** Raw confidence as stored — string level ("high"|"medium"|"low") or numeric. */
  confidence: string | number | null;
  tags: string[];
  source: string | null;
  createdAt: string;
  /** The raw record, untouched, for readers that need extra fields. */
  raw: Record<string, unknown>;
}

/** Resolve the text of any vault record shape. The one rule: content ?? insight ?? wish. */
export function atomText(raw: Record<string, unknown>): string {
  const value = raw.content ?? raw.insight ?? raw.wish;
  return typeof value === 'string' ? value : '';
}

/** Normalize any raw JSONL vault record into the canonical atom shape. */
export function normalizeAtom(
  raw: Record<string, unknown>,
  fallbackVault?: string,
): VaultAtom {
  return {
    id: String(raw.id ?? ''),
    vault: String(raw.vault ?? fallbackVault ?? 'operational'),
    text: atomText(raw),
    category: typeof raw.category === 'string' ? raw.category : null,
    confidence:
      typeof raw.confidence === 'string' || typeof raw.confidence === 'number'
        ? raw.confidence
        : null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    source: typeof raw.source === 'string' ? raw.source : null,
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    raw,
  };
}

/** The six canonical vault names. */
export const VAULT_NAMES: readonly VaultType[] = [
  'strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon',
] as const;
