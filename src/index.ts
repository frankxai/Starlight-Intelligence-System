/**
 * Starlight Intelligence System v2.0
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
 * import { StarlightIntelligence } from "@frankx/starlight-intelligence-system";
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

import { ContextEngine, DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND } from "./context.js";
import { MemoryManager } from "./memory.js";
import { AgentRouter, ACOS_AGENTS } from "./agents.js";
import { OrchestrationEngine } from "./orchestrator.js";
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
  ReasoningStrategy,
  OrchestrationTask,
  OrchestrationResult,
  AgentExecutor,
} from "./types.js";
import type { AgentRecommendation } from "./agents.js";

// ── Main Class ──────────────────────────────────────────────

export class StarlightIntelligence {
  private context: ContextEngine;
  private memory: MemoryManager;
  private router: AgentRouter;
  private orchestrator: OrchestrationEngine;
  private initialized = false;

  constructor(options?: StarlightOptions) {
    this.context = new ContextEngine({
      profile: options?.profile,
      stack: options?.stack,
      brand: options?.brand,
      agents: options?.agents ?? ACOS_AGENTS,
    });

    this.memory = new MemoryManager(options?.memoryPath);
    this.router = new AgentRouter(options?.agents ?? ACOS_AGENTS);
    this.orchestrator = new OrchestrationEngine({
      memory: this.memory,
      router: this.router,
      executor: options?.executor,
    });
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
   * Execute a task through the orchestration engine.
   * This is the primary method for multi-agent workflow execution.
   *
   * @example
   * ```typescript
   * const result = await sis.orchestrate({
   *   intent: "Design and implement a new authentication system",
   *   pattern: "sequential",
   *   synthesis: "sequential-refinement",
   * });
   * ```
   */
  async orchestrate(
    task: OrchestrationTask,
    executor?: AgentExecutor
  ): Promise<OrchestrationResult> {
    return this.orchestrator.execute(task, executor);
  }

  /**
   * Set the agent executor for orchestration.
   * Consumers call this to wire up their LLM integration.
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
   * Generate a context injection for the target AI tool.
   */
  generateContext(options: ContextOptions): GeneratedContext {
    // If memory layer requested, inject relevant memories
    if (options.layers.includes("memory")) {
      const recentMemories = this.memory.getRecent(20);
      this.context.setMemories(recentMemories);
    }

    return this.context.generate(options);
  }

  /**
   * Route a task to the best agent(s).
   */
  routeTask(query: string, filePaths?: string[]): AgentRecommendation[] {
    return this.router.route(query, filePaths);
  }

  /**
   * Store a learning/memory entry.
   */
  remember(entry: Omit<MemoryEntry, "id" | "createdAt">): MemoryEntry {
    const stored = this.memory.add(entry);
    this.memory.save();
    return stored;
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
      version: "2.0.0",
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

// ── Re-exports ──────────────────────────────────────────────

export { ContextEngine, DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND } from "./context.js";
export { MemoryManager } from "./memory.js";
export { AgentRouter, ACOS_AGENTS } from "./agents.js";
export { OrchestrationEngine } from "./orchestrator.js";
export type { OrchestrationEngineOptions } from "./orchestrator.js";
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
