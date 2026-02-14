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
