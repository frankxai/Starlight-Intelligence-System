/**
 * Orchestration Engine — Runtime execution of multi-agent workflows
 *
 * Implements the 6 orchestration patterns that were previously documentation-only:
 *   Direct, Sequential, Parallel, Iterative, Cascade, Broadcast
 *
 * Each execution flows through the 7-layer intelligence pipeline:
 *   Perception → Memory Recall → Reasoning → Routing → Execution → Synthesis → Memory Write
 *
 * The engine provides the FRAMEWORK. Consumers (ACOS, Arcanea) wire up actual
 * LLM calls via the AgentExecutor callback.
 */
import { MemoryManager } from "./memory.js";
import { AgentRouter } from "./agents.js";
import type { AgentRecommendation } from "./agents.js";
import type { AgentExecutor, AgentExecution, OrchestrationTask, OrchestrationResult, PipelineStage } from "./types.js";
export declare class OrchestrationEngine {
    private memory;
    private router;
    private executor;
    private pipeline;
    constructor(options: OrchestrationEngineOptions);
    /**
     * Set or replace the agent executor callback.
     * Consumers call this to wire up their LLM integration.
     */
    setExecutor(executor: AgentExecutor): void;
    /**
     * Execute a task through the 7-layer intelligence pipeline.
     *
     * Pipeline:
     * 1. Perception — Parse intent and assess complexity
     * 2. Memory Recall — Query vault for relevant past patterns
     * 3. Reasoning — Select orchestration pattern
     * 4. Routing — Choose agents via AgentRouter
     * 5. Execution — Run the selected pattern
     * 6. Synthesis — Combine results
     * 7. Memory Write — Persist learnings back to vault
     */
    execute(task: OrchestrationTask, executor?: AgentExecutor): Promise<OrchestrationResult>;
    /**
     * Direct: Single agent execution.
     * The simplest pattern — one agent handles the entire task.
     */
    direct(task: OrchestrationTask, recommendation: AgentRecommendation | undefined, executor: AgentExecutor, context: Record<string, unknown>): Promise<AgentExecution[]>;
    /**
     * Sequential: Chain execution A → B → C.
     * Each agent receives the previous agent's output as additional input.
     * Like a relay race — each runner passes the baton.
     */
    sequential(task: OrchestrationTask, recommendations: AgentRecommendation[], executor: AgentExecutor, context: Record<string, unknown>): Promise<AgentExecution[]>;
    /**
     * Parallel: Execute A + B + C simultaneously, then collect all results.
     * All agents work on the same input independently.
     */
    parallel(task: OrchestrationTask, recommendations: AgentRecommendation[], executor: AgentExecutor, context: Record<string, unknown>): Promise<AgentExecution[]>;
    /**
     * Iterative: Create-review-refine loops.
     * The first agent creates, the second reviews, then the first refines.
     * Continues until maxIterations or convergence.
     */
    iterative(task: OrchestrationTask, recommendations: AgentRecommendation[], executor: AgentExecutor, context: Record<string, unknown>, maxIterations: number): Promise<AgentExecution[]>;
    /**
     * Cascade: Start with the simplest/fastest agent, escalate on failure.
     * Like a support tier system — try the cheapest option first.
     */
    cascade(task: OrchestrationTask, recommendations: AgentRecommendation[], executor: AgentExecutor, context: Record<string, unknown>): Promise<AgentExecution[]>;
    /**
     * Broadcast: One event triggers all agents, collect every result.
     * Like an announcement — everyone responds independently.
     * Similar to parallel but semantically different: broadcast collects ALL
     * perspectives rather than seeking the best one.
     */
    broadcast(task: OrchestrationTask, recommendations: AgentRecommendation[], executor: AgentExecutor, context: Record<string, unknown>): Promise<AgentExecution[]>;
    /**
     * Synthesize multiple agent executions into a single output.
     */
    private synthesize;
    /**
     * Weighted Consensus: Score perspectives by confidence, take the highest.
     * When multiple agents agree, their confidence compounds.
     */
    private weightedConsensus;
    /**
     * Sequential Refinement: Each agent's output builds on the previous.
     * The final execution is the refined result.
     */
    private sequentialRefinement;
    /**
     * Conflict Resolution: Explicitly identify disagreements.
     * When agents diverge, present both sides with confidence scores.
     */
    private conflictResolution;
    /**
     * Assess task complexity on a 1-10 scale based on intent analysis.
     */
    private assessComplexity;
    /**
     * Extract keywords from intent for memory search and routing.
     */
    private extractKeywords;
    /**
     * Query memory for relevant past patterns.
     */
    private recallMemories;
    /**
     * Auto-select the best orchestration pattern based on complexity.
     */
    private selectPattern;
    /**
     * Select the appropriate synthesis strategy for a pattern.
     */
    private selectSynthesisStrategy;
    /**
     * Determine default agent count based on pattern and complexity.
     */
    private defaultAgentCount;
    /**
     * Execute a single agent with timing and confidence tracking.
     */
    private executeAgent;
    /**
     * Estimate confidence from output characteristics.
     * This is a heuristic — consumers can override with their own confidence logic.
     */
    private estimateConfidence;
    /**
     * Compute overall confidence from all executions.
     */
    private computeConfidence;
    /**
     * Write orchestration results to the memory vault.
     * Returns true if a memory entry was created.
     */
    private writeToMemory;
    /**
     * Create a placeholder execution for when no agent matches.
     */
    private createEmptyExecution;
    /**
     * Create an error execution record.
     */
    private createErrorExecution;
    private startStage;
    private completeStage;
    /**
     * Get the pipeline stages from the most recent execution.
     * Useful for debugging and observability.
     */
    getPipelineStages(): PipelineStage[];
}
export interface OrchestrationEngineOptions {
    /** Memory manager for vault read/write. */
    memory: MemoryManager;
    /** Agent router for intelligent agent selection. */
    router: AgentRouter;
    /** Optional executor callback. Defaults to a passthrough executor. */
    executor?: AgentExecutor;
}
//# sourceMappingURL=orchestrator.d.ts.map