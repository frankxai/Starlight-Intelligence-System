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
import { OrchestrationEngine } from "./orchestrator.js";
import type { ContextOptions, GeneratedContext, MemoryEntry, MemorySearchOptions, MemoryStats, AgentDefinition, SystemStats, UserProfile, TechStack, BrandSystem, OrchestrationTask, OrchestrationResult, AgentExecutor } from "./types.js";
import type { AgentRecommendation } from "./agents.js";
export declare class StarlightIntelligence {
    private context;
    private memory;
    private router;
    private orchestrator;
    private initialized;
    constructor(options?: StarlightOptions);
    /**
     * Initialize the system: load persistent memories from disk.
     */
    initialize(): void;
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
    orchestrate(task: OrchestrationTask, executor?: AgentExecutor): Promise<OrchestrationResult>;
    /**
     * Set the agent executor for orchestration.
     * Consumers call this to wire up their LLM integration.
     */
    setExecutor(executor: AgentExecutor): void;
    /**
     * Get the orchestration engine for advanced usage.
     */
    getOrchestrator(): OrchestrationEngine;
    /**
     * Generate a context injection for the target AI tool.
     */
    generateContext(options: ContextOptions): GeneratedContext;
    /**
     * Route a task to the best agent(s).
     */
    routeTask(query: string, filePaths?: string[]): AgentRecommendation[];
    /**
     * Store a learning/memory entry.
     */
    remember(entry: Omit<MemoryEntry, "id" | "createdAt">): MemoryEntry;
    /**
     * Search stored memories.
     */
    searchMemories(options: MemorySearchOptions): MemoryEntry[];
    /**
     * Get memory statistics.
     */
    getMemoryStats(): MemoryStats;
    /**
     * Get an agent by ID.
     */
    getAgent(id: string): AgentDefinition | undefined;
    /**
     * Get system statistics.
     */
    getStats(): SystemStats;
    /**
     * Save memories to disk.
     */
    save(): void;
}
export interface StarlightOptions {
    profile?: UserProfile;
    stack?: TechStack;
    brand?: BrandSystem;
    agents?: AgentDefinition[];
    memoryPath?: string;
    /** Default agent executor for orchestration. */
    executor?: AgentExecutor;
}
export { ContextEngine, DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND } from "./context.js";
export { MemoryManager } from "./memory.js";
export { AgentRouter, ACOS_AGENTS } from "./agents.js";
export { OrchestrationEngine } from "./orchestrator.js";
export { syncACOSToSIS } from "./sync.js";
export { generateIntelligenceReport } from "./score.js";
export type { OrchestrationEngineOptions } from "./orchestrator.js";
export type { ACOSTrajectory, ACOSPattern, SyncState, SyncOptions, SyncResult } from "./sync.js";
export type { ScoreComponent, IntelligenceReport } from "./score.js";
export type { ContextOptions, ContextLayer, GeneratedContext, UserProfile, VoiceGuidelines, TechStack, BrandSystem, AgentDefinition, AgentRegistry, SkillDefinition, MemoryEntry, MemorySearchOptions, MemoryStats, ReasoningStrategy, ProjectContext, SystemStats, AgentExecutor, OrchestrationTask, OrchestrationPattern, OrchestrationResult, SynthesisStrategy, AgentExecution, PipelineStage, } from "./types.js";
export type { AgentRecommendation } from "./agents.js";
//# sourceMappingURL=index.d.ts.map