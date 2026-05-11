/**
 * Starlight Intelligence System v2.0 — Type Definitions
 *
 * Universal Context Standard for AI-augmented creator workflows.
 * Designed to work with Claude Code, Cursor, Windsurf, or any LLM tool.
 */

// ── Identity Layer ──────────────────────────────────────────

export interface UserProfile {
  name: string;
  title: string;
  domains: string[];
  values: string[];
  voice: VoiceGuidelines;
}

export interface VoiceGuidelines {
  do: string[];
  dont: string[];
  tone: string;
  examples?: string[];
}

// ── Knowledge Layer ─────────────────────────────────────────

export interface TechStack {
  framework: string;
  language: string;
  styling: string;
  deployment: string;
  database?: string;
  extras?: Record<string, string>;
}

export interface BrandSystem {
  colors: Record<string, string>;
  tagline: string;
  attributes: string[];
  typography?: Record<string, string>;
}

// ── Agent Layer ─────────────────────────────────────────────

export interface AgentDefinition {
  id: string;
  name: string;
  type: "specialist" | "meta";
  description: string;
  skills: string[];
  triggers: {
    keywords: string[];
    filePatterns?: string[];
  };
}

export interface AgentRegistry {
  version: string;
  agents: AgentDefinition[];
}

// ── Skill Layer ─────────────────────────────────────────────

export interface SkillDefinition {
  id: string;
  type: "technical" | "domain" | "creative" | "workflow";
  priority: "critical" | "high" | "medium";
  description: string;
  triggers: {
    keywords: string[];
    files?: string[];
  };
}

// ── Memory Layer ────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  content: string;
  category: "pattern" | "decision" | "insight" | "error" | "preference";
  tags: string[];
  confidence: number;
  createdAt: string;
  source?: string;
}

export interface MemorySearchOptions {
  query: string;
  category?: MemoryEntry["category"];
  limit?: number;
  minConfidence?: number;
}

export interface MemoryStats {
  totalEntries: number;
  byCategory: Record<string, number>;
  oldestEntry?: string;
  newestEntry?: string;
}

// ── Context Generation ──────────────────────────────────────

export interface ContextOptions {
  /** Target AI tool (affects output format) */
  target: "claude-code" | "cursor" | "windsurf" | "generic";
  /** Which layers to include */
  layers: ContextLayer[];
  /** Maximum token budget for the context */
  maxTokens?: number;
  /** Project-specific overrides */
  project?: ProjectContext;
}

export type ContextLayer =
  | "identity"
  | "knowledge"
  | "strategy"
  | "agents"
  | "memory";

export interface ProjectContext {
  name: string;
  path: string;
  stack?: TechStack;
  conventions?: string[];
  activeSkills?: string[];
}

export interface GeneratedContext {
  content: string;
  layers: ContextLayer[];
  tokenEstimate: number;
  target: ContextOptions["target"];
  generatedAt: string;
}

// ── Strategy Layer ──────────────────────────────────────────

export interface ReasoningStrategy {
  id: string;
  name: string;
  description: string;
  steps: string[];
  bestFor: string[];
}

// ── Orchestration Layer ─────────────────────────────────────

/**
 * Callback that consumers provide to wire agents to actual LLM calls.
 * The OrchestrationEngine provides the framework; consumers supply execution.
 */
export type AgentExecutor = (
  agent: string,
  input: string,
  context: Record<string, unknown>
) => Promise<string>;

/** The six orchestration patterns available in the engine. */
export type OrchestrationPattern =
  | "direct"
  | "sequential"
  | "parallel"
  | "iterative"
  | "cascade"
  | "broadcast";

/** Synthesis strategy for combining multi-agent outputs. */
export type SynthesisStrategy =
  | "weighted-consensus"
  | "sequential-refinement"
  | "conflict-resolution";

/**
 * A task submitted to the OrchestrationEngine for execution.
 */
export interface OrchestrationTask {
  /** Natural-language intent describing what needs to be done. */
  intent: string;
  /** Arbitrary context passed through to agents. */
  context?: Record<string, unknown>;
  /** Force a specific orchestration pattern (auto-selected if omitted). */
  pattern?: OrchestrationPattern;
  /** Maximum number of agents to involve. */
  maxAgents?: number;
  /** Maximum iterations for the iterative pattern. */
  maxIterations?: number;
  /** Strategy for synthesizing multi-agent results. */
  synthesis?: SynthesisStrategy;
  /** Optional file paths for agent routing. */
  filePaths?: string[];
}

/**
 * Record of a single agent's execution within an orchestration.
 */
export interface AgentExecution {
  /** Agent ID that was executed. */
  agent: string;
  /** The input provided to the agent. */
  input: string;
  /** The output returned by the agent. */
  output: string;
  /** Execution duration in milliseconds. */
  duration: number;
  /** Confidence score from 0.0 to 1.0. */
  confidence: number;
}

/**
 * The structured result of an orchestration execution.
 */
export interface OrchestrationResult {
  /** Which pattern was used. */
  pattern: string;
  /** All individual agent executions. */
  executions: AgentExecution[];
  /** Synthesized final output. */
  synthesis: string;
  /** Overall confidence score from 0.0 to 1.0. */
  confidence: number;
  /** Whether the result was persisted to memory. */
  memoryWritten: boolean;
  /** Total orchestration duration in milliseconds. */
  duration: number;
  /** Complexity assessment (1-10) that informed pattern selection. */
  complexity: number;
  /** Memory entries recalled during the pipeline. */
  memoryRecalled: number;
}

/**
 * Configuration for the 7-layer intelligence pipeline.
 */
export interface PipelineStage {
  name: string;
  startedAt: number;
  completedAt?: number;
  result?: unknown;
}

// ── System Stats ────────────────────────────────────────────

export interface SystemStats {
  version: string;
  agents: number;
  skills: number;
  memories: number;
  strategies: number;
  contextLayers: number;
}

// ── Starlight Vault Layer (v5.0) ────────────────────────────

/** The six semantic vault categories for Starlight Memory */
export type VaultType =
  | 'strategic'    // Decisions, architecture, roadmaps
  | 'technical'    // Patterns, solutions, code insights
  | 'creative'     // Voice, style, narrative patterns
  | 'operational'  // Recent context, session state
  | 'wisdom'       // Meta-patterns, cross-domain insights
  | 'horizon';     // Benevolent intentions (append-only)

/** A vault-classified memory entry */
export interface VaultEntry extends MemoryEntry {
  vault: VaultType;
  summary?: string;
  updatedAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

/** Horizon Vault entry — append-only benevolent wish */
export interface HorizonEntry {
  id: string;
  wish: string;
  context: string;
  author: string;
  coAuthored: boolean;
  tags: string[];
  createdAt: string;
}

/** Vault search with type filtering */
export interface VaultSearchOptions extends MemorySearchOptions {
  vaults?: VaultType[];
  sortBy?: 'relevance' | 'recency' | 'confidence';
}

/** Vault search result with relevance score */
export interface VaultSearchResult {
  entry: VaultEntry;
  score: number;
  matchedTerms: string[];
}

/** Vault statistics */
export interface VaultStats {
  vault: VaultType;
  entryCount: number;
  oldestEntry?: string;
  newestEntry?: string;
  topTags: Array<{ tag: string; count: number }>;
}

// ── Mem0-Compatible Types (v5.0) ────────────────────────────

/** Mem0-compatible memory message format */
export interface Mem0Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Mem0-compatible add request */
export interface Mem0AddRequest {
  messages: Mem0Message[];
  user_id?: string;
  agent_id?: string;
  metadata?: Record<string, unknown>;
}

/** Mem0-compatible search request */
export interface Mem0SearchRequest {
  query: string;
  user_id?: string;
  agent_id?: string;
  limit?: number;
}

/** Mem0-compatible memory response */
export interface Mem0MemoryResponse {
  id: string;
  memory: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Configuration for vault-aware memory */
export interface VaultMemoryConfig {
  storagePath?: string;
  enableVaults?: boolean;
  enableHorizon?: boolean;
  horizonAuthor?: string;
  defaultVault?: VaultType;
}

// ── Temporal Layer (v6.0) ──────────────────────────────────

/** Temporal metadata for staleness and validity tracking */
export interface TemporalMeta {
  validFrom: string;
  validUntil: string | null;
  lastConfirmed: string;
  confidenceDecay: number;
}

/** Contradiction record between two entries */
export interface ContradictionRecord {
  id: string;
  entryIdA: string;
  entryIdB: string;
  reason: string;
  detectedAt: string;
  resolvedAt: string | null;
}

// ── Track A — Agent Ops Substrate (v0.1, demo 2026-05-15) ──
//
// 13 schemas governing work packets, agent runs, decisions, artifacts,
// packs, approvals, council reviews, knowledge graph entities/edges,
// cost records, eval results. Schema-first: MCP tools (T2) and the
// dashboard (T3) compose on top of these contracts. Persisted via
// append-only JSONL ledgers + SQLite shadow indices (see ledgers.ts).
//
// Invariants:
//   • GraphEdge.evidenceRef is REQUIRED — every edge cites its source.
//   • All events are append-only; status transitions go through the ledger.
//   • Risk-tiered fields use the same scale across all schemas.

/** Risk classification shared across WorkPacket / Decision / AgentEvent / ApprovalGate. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** WorkPacket lifecycle states. */
export type WorkPacketStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';

/** AgentRun lifecycle states. */
export type AgentRunStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** ApprovalGate lifecycle states. */
export type ApprovalGateStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

/** Attestation status on an Artifact — SIP attestation or unattested. */
export type AttestationStatus = 'sip-attested' | 'unattested';

/** Pack kinds shipped through the ecosystem (Track A v0.1). */
export type PackKind =
  | 'prompt'
  | 'skill'
  | 'agent'
  | 'knowledge'
  | 'claw'
  | 'white-label';

/** CostRecord measurement units. */
export type CostKind = 'tokens' | 'time' | 'api-call' | 'storage';

/** GraphEntity kinds — extensible, but free-text to keep the substrate open. */
export type GraphEntityKind = string;

/** Permission scope/action descriptor used by Packs. */
export interface Permission {
  id: string;
  scope: string;
  action: string;
  conditions: string[];
}

/** An immutable event emitted during an AgentRun. */
export interface AgentEvent {
  id: string;
  runId: string;
  agentId: string;
  eventType: string;
  summary: string;
  toolsUsed: string[];
  inputRefs: string[];
  outputRefs: string[];
  decisionsCreated: string[];
  artifactsCreated: string[];
  riskLevel: RiskLevel;
  costEstimate: number;
  timestamp: string;
}

/** A produced artifact with attestation status. */
export interface Artifact {
  id: string;
  kind: string;
  uri: string;
  sha256: string;
  createdBy: string;
  createdAt: string;
  attestation: AttestationStatus;
}

/** A unit of agent work — mission, constraints, lifecycle. */
export interface WorkPacket {
  id: string;
  title: string;
  mission: string;
  contextRefs: string[];
  requiredOutputs: string[];
  allowedTools: string[];
  allowedPaths: string[];
  forbiddenActions: string[];
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  assignedAgent: string;
  status: WorkPacketStatus;
  events: AgentEvent[];
  artifacts: Artifact[];
  costEstimate: number;
  createdAt: string;
  completedAt?: string;
}

/** A single agent execution against a WorkPacket. */
export interface AgentRun {
  id: string;
  workPacketId: string;
  agentId: string;
  startedAt: string;
  completedAt?: string;
  status: AgentRunStatus;
  rootEventId?: string;
}

/** A council-eligible decision made during work. */
export interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  chosen: string;
  rationale: string;
  riskLevel: RiskLevel;
  workPacketId?: string;
  councilReviewId?: string;
  createdAt: string;
  createdBy: string;
}

/** Installable pack — prompt / skill / agent / knowledge / claw / white-label. */
export interface Pack {
  id: string;
  name: string;
  version: string;
  kind: PackKind;
  permissions: Permission[];
  licenseTier: string;
  signatureRef?: string;
  installedAt?: string;
  manifestSha: string;
}

/** Human-in-the-loop gate for a WorkPacket. */
export interface ApprovalGate {
  id: string;
  workPacketId: string;
  requestedAt: string;
  status: ApprovalGateStatus;
  riskLevel: RiskLevel;
  decidedBy?: string;
  decidedAt?: string;
  rationale?: string;
}

/** Seven-perspective council pressure-test of a decision or work packet. */
export interface CouncilReviewPerspectives {
  elderFather: string;
  elderMother: string;
  sage: string;
  builderElder: string;
  shadowWitness: string;
  divineNeutralWitness: string;
  futureSelf90: string;
}

/** Recorded council review with convergence + conflict + verdict. */
export interface CouncilReview {
  id: string;
  workPacketId?: string;
  decisionId?: string;
  decision: string;
  context: string;
  perspectives: CouncilReviewPerspectives;
  convergence: string;
  conflict: string;
  redLines: string[];
  cleanestPath: string;
  oneNextMove: string;
  reviewDate: string;
  createdAt: string;
}

/** Knowledge-graph node. */
export interface GraphEntity {
  id: string;
  kind: GraphEntityKind;
  name: string;
  attributes: Record<string, unknown>;
  createdAt: string;
}

/**
 * Knowledge-graph edge. evidenceRef is REQUIRED — the substrate invariant.
 * Every edge cites the artifact / event / decision that justifies it.
 */
export interface GraphEdge {
  id: string;
  edgeType: string;
  source: string;
  target: string;
  evidenceRef: string;
  confidence: number;
  createdBy: string;
  createdAt: string;
}

/** Per-run / per-packet cost ledger entry. */
export interface CostRecord {
  id: string;
  agentRunId?: string;
  workPacketId?: string;
  kind: CostKind;
  amount: number;
  currencyOrUnit: string;
  timestamp: string;
}

/** Single eval-harness verdict against a target schema instance. */
export interface EvalResult {
  id: string;
  evalName: string;
  targetId: string;
  targetKind: string;
  passed: boolean;
  evidenceRef?: string;
  createdAt: string;
}
