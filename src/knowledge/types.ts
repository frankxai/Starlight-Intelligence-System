/**
 * Starlight Universal Knowledge Management — Epistemic Graph & Ontology Types
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

export type KnowledgeDomain =
  | 'physics_cosmology'
  | 'information_computation'
  | 'complex_systems'
  | 'biology_longevity'
  | 'cognitive_ai'
  | 'epistemology_truth'
  | 'economics_mechanisms'
  | 'aesthetics_mythology'
  | 'governance_harmony'
  | 'cosmological_horizons';

export type NodeKind =
  | 'axiom'
  | 'law'
  | 'hypothesis'
  | 'conjecture'
  | 'empirical_proof'
  | 'paradox'
  | 'artifact'
  | 'invariant';

export type EdgeKind =
  | 'proves'
  | 'refutes'
  | 'derives_from'
  | 'generalizes'
  | 'contradicts'
  | 'analogous_to'
  | 'requires_substrate'
  | 'composes_with';

export interface BiTemporalSpan {
  validFrom: string; // ISO 8601 timestamp
  validUntil?: string | null; // null = indefinitely true until refuted
  assertedAt: string;
  invalidatedAt?: string | null;
  invalidatedBy?: string | null; // Node ID that falsified or superseded this node
}

export interface EpistemicProvenance {
  creator: string; // Agent ID or Human authority (e.g. 'frank', 'starlight-queen', 'codex')
  sourceUri?: string; // DOI, arXiv, Git commit SHA, Vault reference
  method: 'empirical_test' | 'formal_proof' | 'deductive_inference' | 'peer_review' | 'axiom_declaration';
  harness?: string;
  checksum?: string;
}

export interface KnowledgeNode {
  id: string; // e.g. "kn:physics:thermo-second-law" or "kn:reality:sovereign-context"
  domain: KnowledgeDomain;
  kind: NodeKind;
  title: string;
  statement: string;
  falsificationCriteria: string; // Explicit test condition that would disprove this node
  confidence: number; // 0.0 to 1.0
  certaintyCapped: boolean; // True if capped due to lack of non-signal evidence
  provenance: EpistemicProvenance;
  temporal: BiTemporalSpan;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: EdgeKind;
  weight: number; // 0.0 to 1.0 (strength of relationship)
  rationale: string;
  temporal: BiTemporalSpan;
}

export interface ContradictionReport {
  nodeA: KnowledgeNode;
  nodeB: KnowledgeNode;
  edge?: KnowledgeEdge;
  nature: 'direct_contradiction' | 'temporal_collision' | 'uncalibrated_certainty';
  description: string;
  resolved: boolean;
  suggestedFalsifier?: string;
}

export type KnowledgeDomainId = KnowledgeDomain;
export type EpistemicTruthState = NodeKind;
export type TruthState = NodeKind;

export interface KnowledgeQuery {
  domains?: KnowledgeDomain[];
  domain?: KnowledgeDomain;
  kinds?: NodeKind[];
  queryText?: string;
  search?: string;
  tags?: string[];
  maxNodes?: number;
  limit?: number;
  minConfidence?: number;
  activeOnly?: boolean; // filter out invalidated nodes
  asOfDate?: string; // temporal point-in-time query
}

export interface SubgraphProjection {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  contextMarkdown: string;
  tokenEstimate: number;
}
