/**
 * Starlight Intelligence System v8.0
 *
 * Universal Context Standard — Portable cognitive architecture
 * for AI-augmented creator workflows.
 *
 * Core capabilities:
 * 1. Context Engine — Generate optimized system prompts for any AI tool
 * 2. Memory Manager — Persistent cross-session knowledge
 * 3. Agent Router — Intelligent task routing aligned with ACOS v8
 *
 * @example
 * ```typescript
 * import { StarlightIntelligence } from "@arcanea/starlight-intelligence-system";
 *
 * const sis = new StarlightIntelligence();
 * sis.initialize();
 *
 * // Generate context for Claude Code
 * const context = sis.generateContext({
 *   target: "claude-code",
 *   layers: ["identity", "knowledge", "strategy", "agents"],
 * });
 *
 * // Route a task to the best agent
 * const recommendations = sis.routeTask("write a blog post about AI agents");
 *
 * // Store a learning
 * sis.remember({
 *   content: "Never use clay/claymorphic style in image generation",
 *   category: "preference",
 *   tags: ["design", "images", "brand"],
 *   confidence: 1.0,
 * });
 * ```
 */

// DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND are re-exported from this module
// via the explicit re-export on line ~218; this import line only needs the values
// the StarlightIntelligence class consumes.
import { ContextEngine } from "./context.js";
import { VaultMemory } from "./vault-memory.js";
import { AgentRouter, ACOS_AGENTS } from "./agents.js";
import { OrchestrationEngine } from "./orchestrator.js";
import { ActiveHealingDaemon } from "./active-healing.js";
import { TestForge } from "./forge.js";
import { dirname } from "node:path";
import type {
  ContextOptions,
  GeneratedContext,
  MemoryEntry,
  MemorySearchOptions,
  MemoryStats,
  AgentDefinition,
  SystemStats,
  UserProfile,
  TechStack,
  BrandSystem,
  OrchestrationTask,
  OrchestrationResult,
  AgentExecutor,
  VaultType,
  VaultEntry,
} from "./types.js";
import type { AgentRecommendation } from "./agents.js";

// ── Main Class ──────────────────────────────────────────────

export class StarlightIntelligence {
  private context: ContextEngine;
  private memory: VaultMemory;
  private router: AgentRouter;
  private orchestrator: OrchestrationEngine;
  private healer: ActiveHealingDaemon;
  private forge: TestForge;
  private initialized = false;

  constructor(options?: StarlightOptions) {
    this.context = new ContextEngine({
      profile: options?.profile,
      stack: options?.stack,
      brand: options?.brand,
      agents: options?.agents ?? ACOS_AGENTS,
    });

    this.memory = new VaultMemory({ storagePath: resolveMemoryStoragePath(options?.memoryPath) });
    this.router = new AgentRouter(options?.agents ?? ACOS_AGENTS);
    this.orchestrator = new OrchestrationEngine({
      memory: this.memory,
      router: this.router,
      executor: options?.executor,
    });
    this.healer = new ActiveHealingDaemon(this.memory, this.orchestrator);
    this.forge = new TestForge(this.memory);
  }

  /**
   * Initialize the system: load persistent memories from disk.
   */
  initialize(): void {
    if (this.initialized) return;
    this.memory.load();
    this.initialized = true;
  }

  /**
   * Run the Test Forge to synthesize regression tests from vault patterns.
   */
  async forgeTests(): Promise<string[]> {
    this.initialize();
    return this.forge.forgeTests();
  }

  /**
   * Start the active healing background process.
   */
  startHealing(intervalMs?: number): void {
    this.healer.start(intervalMs);
  }

  /**
   * Stop the active healing background process.
   */
  stopHealing(): void {
    this.healer.stop();
  }

  /**
   * Generate a portable context packet for an AI surface.
   */
  generateContext(options: ContextOptions): GeneratedContext {
    this.initialize();
    this.context.setMemories(this.memory.getRecent(20));
    return this.context.generate(options);
  }

  /**
   * Route a task to the most relevant SIS agents without executing it.
   */
  routeTask(query: string, filePaths?: string[]): AgentRecommendation[] {
    return this.router.route(query, filePaths);
  }

  /**
   * Execute a task through the orchestration engine.
   */
  async orchestrate(
    task: OrchestrationTask,
    executor?: AgentExecutor
  ): Promise<OrchestrationResult> {
    this.initialize();
    return this.orchestrator.execute(task, executor);
  }

  /**
   * Set the default agent executor for future orchestrations.
   */
  setExecutor(executor: AgentExecutor): void {
    this.orchestrator.setExecutor(executor);
  }

  /**
   * Get the orchestration engine for advanced usage.
   */
  getOrchestrator(): OrchestrationEngine {
    return this.orchestrator;
  }

  /**
   * Store a memory entry with vault classification.
   */
  remember(
    input: string | RememberOptions,
    vault?: VaultType,
    tags: string[] = [],
    confidence = 0.5
  ): VaultEntry {
    if (typeof input === "string") {
      return this.memory.rememberInVault(
        input,
        vault,
        tags,
        confidence,
        "starlight-intelligence"
      );
    }

    return this.memory.rememberInVault(
      input.content,
      input.vault ?? vaultFromCategory(input.category),
      input.tags ?? [],
      input.confidence ?? 0.5,
      input.source ?? "starlight-intelligence"
    );
  }

  /**
   * Search stored memories.
   */
  searchMemories(options: MemorySearchOptions): MemoryEntry[] {
    return this.memory.search(options);
  }

  /**
   * Get memory statistics.
   */
  getMemoryStats(): MemoryStats {
    return this.memory.getStats();
  }

  /**
   * Get an agent by ID.
   */
  getAgent(id: string): AgentDefinition | undefined {
    return this.router.getAgent(id);
  }

  /**
   * Get system statistics.
   */
  getStats(): SystemStats {
    return {
      version: this.router.getRegistry().version,
      agents: this.router.getRegistry().agents.length,
      skills: this.router
        .getRegistry()
        .agents.reduce((sum, a) => sum + a.skills.length, 0),
      memories: this.memory.size,
      strategies: 3, // Default strategies count
      contextLayers: 5,
    };
  }

  /**
   * Save memories to disk.
   */
  save(): void {
    this.memory.save();
  }
}

// ── Options ─────────────────────────────────────────────────

export interface StarlightOptions {
  profile?: UserProfile;
  stack?: TechStack;
  brand?: BrandSystem;
  agents?: AgentDefinition[];
  memoryPath?: string;
  /** Default agent executor for orchestration. */
  executor?: AgentExecutor;
}

export interface RememberOptions {
  content: string;
  category?: MemoryEntry["category"];
  vault?: VaultType;
  tags?: string[];
  confidence?: number;
  source?: string;
}

function resolveMemoryStoragePath(memoryPath?: string): string | undefined {
  if (!memoryPath) return undefined;
  return /\.(jsonl?|JSONL?)$/.test(memoryPath) ? dirname(memoryPath) : memoryPath;
}

function vaultFromCategory(category?: MemoryEntry["category"]): VaultType | undefined {
  if (!category) return undefined;
  const map: Record<MemoryEntry["category"], VaultType> = {
    pattern: "technical",
    decision: "strategic",
    insight: "wisdom",
    error: "technical",
    preference: "creative",
  };
  return map[category];
}

// ── Re-exports ──────────────────────────────────────────────

export { ContextEngine, DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND } from "./context.js";
export { MemoryManager } from "./memory.js";
export { AgentRouter, ACOS_AGENTS } from "./agents.js";
export { OrchestrationEngine } from "./orchestrator.js";
export { syncACOSToSIS } from "./sync.js";
export { generateIntelligenceReport } from "./score.js";
export type { OrchestrationEngineOptions } from "./orchestrator.js";
export type { ACOSTrajectory, ACOSPattern, SyncState, SyncOptions, SyncResult } from "./sync.js";
export type { ScoreComponent, IntelligenceReport } from "./score.js";
export type {
  ContextOptions,
  ContextLayer,
  GeneratedContext,
  UserProfile,
  VoiceGuidelines,
  TechStack,
  BrandSystem,
  AgentDefinition,
  AgentRegistry,
  SkillDefinition,
  MemoryEntry,
  MemorySearchOptions,
  MemoryStats,
  ReasoningStrategy,
  ProjectContext,
  SystemStats,
  // Orchestration types
  AgentExecutor,
  OrchestrationTask,
  OrchestrationPattern,
  OrchestrationResult,
  SynthesisStrategy,
  AgentExecution,
  PipelineStage,
} from "./types.js";
export type { AgentRecommendation } from "./agents.js";

// Vault Layer (v5.0)
export { VaultMemory } from './vault-memory.js';
export type {
  VaultType,
  VaultEntry,
  VaultSearchOptions,
  VaultSearchResult,
  VaultStats,
  HorizonEntry,
  Mem0Message,
  Mem0AddRequest,
  Mem0SearchRequest,
  Mem0MemoryResponse,
  VaultMemoryConfig,
} from './types.js';

// Behavioral Guidance & Federation (v5.0)
export { generateGuidance } from "./guidance.js";
export { registerProject, listProjects, syncAllProjects, syncProject, loadRegistry, saveRegistry } from "./multi-sync.js";
export type { GuidanceOptions, GuidanceResult } from "./guidance.js";
export type { ProjectRegistration, ProjectRegistry, MultiSyncResult } from "./multi-sync.js";

// v6.0 — Retrieval, Temporal, Contradiction, Dreaming, Adapters
export { RetrievalIndex } from './retrieval.js';
export type { IndexedEntry, SearchResult } from './retrieval.js';
export { TemporalEngine } from './temporal.js';
export type { TemporalConfig, TemporalMeta, StalenessReport } from './temporal.js';
export { ContradictionDetector } from './contradiction.js';
export type { Contradiction } from './contradiction.js';
export { DreamingAgent } from './dreaming.js';
export type { DreamResult } from './dreaming.js';
export { createAdapter } from './adapters/index.js';
export type { PlatformAdapter, ContextInjection, AdapterConfig } from './adapters/types.js';
export type { TemporalMeta as TemporalMetaType, ContradictionRecord } from './types.js';

// v7.0 — Sanitization, Sandbox, Active Healing
export { SanitizationGateway } from "./sanitization.js";
export type { SanitizationOptions } from "./sanitization.js";
export { EmpiricalSandbox } from "./sandbox.js";
export type { SandboxExecutionResult, SupportedLanguage } from "./sandbox.js";
export { ActiveHealingDaemon } from "./active-healing.js";
export { TestForge } from "./forge.js";
export {
  DEFAULT_SWARM_CONFIG,
  appendSwarmAudit,
  createSwarmPlan,
  inspectSwarmProviders,
  inspectSwarmRepos,
} from "./swarm.js";
export type {
  SwarmAutonomy,
  SwarmConfig,
  SwarmExternalRisk,
  SwarmMutationRisk,
  SwarmPacket,
  SwarmPlan,
  SwarmProviderConfig,
  SwarmProviderMode,
  SwarmProviderStatusReport,
  SwarmRepoConfig,
  SwarmRepoStatusReport,
  SwarmRuntimeOptions,
} from "./swarm.js";

// v8.2 — Embedding Provider (memory engine v0.2)
export { HashingTFProvider, TransformerProvider, createEmbeddingProvider, rrfMerge } from './embedding.js';
export type { EmbeddingProvider, EmbeddingVector, EmbeddingProviderConfig, RRFOptions } from './embedding.js';

// v8.3 — Memory Gateway + Session Store
export { SessionStore } from './session-store.js';
export type { SessionItem } from './session-store.js';
export { SisGatewayCore } from './gateway/server.js';
export { InProcessTransport, HttpTransport, SisMemoryClient } from './gateway/client.js';
export { SisGatewayDaemon } from './gateway/daemon.js';
export { parseRoute, ok, err } from './gateway/protocol.js';
export type {
  GatewayRequest,
  GatewayResponse,
  GatewaySuccessResponse,
  GatewayErrorResponse,
  AuthContext,
  ParsedRoute,
  MemoryAddBody,
  MemorySearchBody,
  SessionAddBody,
} from './gateway/protocol.js';
export type { GatewayTransport, HttpTransportOptions } from './gateway/client.js';
export type { GatewayCoreOptions } from './gateway/server.js';
export type { DaemonOptions, DaemonInfo } from './gateway/daemon.js';

// v8.8 — SAGE Autonomous Goal Execution (Autonomous Loops)
export { GoalOrchestrator } from './goal.js';
export type { GoalTask, GoalLog, GoalState, AuditResult } from './goal.js';

// Community OS reference contracts and deterministic weekly loop.
export { CommunityLedger, validateCommunityEvent, planCommunityAction, fixtureCommunityAdapter } from './community.js';
export type { CommunityEvent, CommunityConsent, CommunityPrivacy, CommunityEventKind, CommunityAdapterManifest, CommunityAdmission, CommunityStewardAction } from './community.js';

// Operational Work Graph — harness-neutral intent-to-production receipts
export { parseWorkGraphJsonl, projectWorkGraph } from './work-graph.js';
export type {
  CompletionRequirements,
  ParsedWorkGraphJsonl,
  ProofKind,
  WorkGraphEvent,
  WorkGraphEventKind,
  WorkGraphIssue,
  WorkGraphProjection,
  WorkGraphSourceSystem,
  WorkGraphWorkItem,
} from './work-graph.js';

export {
  compileLoopGraph,
  evaluateLoopGraph,
  initHarness,
  recordFeatureEvidence,
} from './loop-graph.js';
export type {
  CompiledLoopGraph,
  HarnessFeature,
  HarnessState,
  LoopBrakes,
  LoopEdge,
  LoopEvaluation,
  LoopEvaluationInput,
  LoopGraph,
  LoopNode,
  LoopShape,
} from './loop-graph.js';
