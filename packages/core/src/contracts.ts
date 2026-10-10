export interface MemoryEntry {
  id: string;
  content: string;
  category: "pattern" | "decision" | "insight" | "error" | "preference";
  tags: string[];
  confidence: number;
  createdAt: string;
  source?: string;
  /** Provenance slugs; source remains the existing field. */
  agent?: string;
  brand?: string;
  domain?: string;
  /** Explicit unit scope, otherwise brand; never inferred from agent. */
  unit?: string;
}

export type VaultType =
  | 'strategic'    // Decisions, architecture, roadmaps
  | 'technical'    // Patterns, solutions, code insights
  | 'creative'     // Voice, style, narrative patterns
  | 'operational'  // Recent context, session state
  | 'wisdom'       // Meta-patterns, cross-domain insights
  | 'horizon';

export interface VaultEntry extends MemoryEntry {
  vault: VaultType;
  summary?: string;
  updatedAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface VaultSearchResult {
  entry: VaultEntry;
  score: number;
  matchedTerms: string[];
  channels?: {
    lexicalRank?: number;
    semanticRank?: number;
  };
}

export type MemoryEvent =
  | { type: "add"; payload: MemoryEntry; timestamp: number }
  | { type: "remove"; id: string; timestamp: number };

/** Attribution metadata; this interface does not authenticate signatures. */
export interface SIPAttestation {
  sipVersion: string;
  layers: readonly string[];
  generatedAt: string;
  subject?: { uri: string; sha256: string };
  signatureRef?: string;
}

/** A host's declared capability boundary, not proof that permissions are enforced. */
export interface HarnessContract {
  id: string;
  version: string;
  transports: readonly ("stdio" | "streamable-http" | "in-process")[];
  permissions: { readMemory: boolean; writeMemory: boolean; deleteMemory: boolean };
}

export interface VeilSanitizer { sanitize(input: string): string; }
