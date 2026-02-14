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
import type {
  AgentExecutor,
  AgentExecution,
  OrchestrationTask,
  OrchestrationPattern,
  OrchestrationResult,
  SynthesisStrategy,
  PipelineStage,
  AgentDefinition,
  MemoryEntry,
} from "./types.js";

// ── Default Executor ────────────────────────────────────────

/**
 * Fallback executor when no LLM is wired up.
 * Returns a structured placeholder indicating the agent was invoked.
 */
const DEFAULT_EXECUTOR: AgentExecutor = async (
  agent: string,
  input: string,
  _context: Record<string, unknown>
): Promise<string> => {
  return `[${agent}] Processed: ${input.slice(0, 200)}${input.length > 200 ? "..." : ""}`;
};

// ── Complexity Keywords ─────────────────────────────────────

const HIGH_COMPLEXITY_SIGNALS = [
  "architecture",
  "system design",
  "multi-domain",
  "orchestrate",
  "coordinate",
  "refactor",
  "migrate",
  "integrate",
  "cross-cutting",
  "end-to-end",
];

const MEDIUM_COMPLEXITY_SIGNALS = [
  "build",
  "create",
  "implement",
  "review",
  "optimize",
  "analyze",
  "research",
  "compare",
];

// ── Orchestration Engine ────────────────────────────────────

export class OrchestrationEngine {
  private memory: MemoryManager;
  private router: AgentRouter;
  private executor: AgentExecutor;
  private pipeline: PipelineStage[] = [];

  constructor(options: OrchestrationEngineOptions) {
    this.memory = options.memory;
    this.router = options.router;
    this.executor = options.executor ?? DEFAULT_EXECUTOR;
  }

  /**
   * Set or replace the agent executor callback.
   * Consumers call this to wire up their LLM integration.
   */
  setExecutor(executor: AgentExecutor): void {
    this.executor = executor;
  }

  // ── Main Entry Point ────────────────────────────────────

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
  async execute(
    task: OrchestrationTask,
    executor?: AgentExecutor
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const activeExecutor = executor ?? this.executor;
    this.pipeline = [];

    // ── Layer 1: Perception ──
    const perception = this.startStage("perception");
    const complexity = this.assessComplexity(task.intent);
    const intentKeywords = this.extractKeywords(task.intent);
    this.completeStage(perception, { complexity, keywords: intentKeywords });

    // ── Layer 2: Memory Recall ──
    const recallStage = this.startStage("memory-recall");
    const recalledMemories = this.recallMemories(task.intent);
    this.completeStage(recallStage, { count: recalledMemories.length });

    // ── Layer 3: Reasoning ──
    const reasoningStage = this.startStage("reasoning");
    const pattern = task.pattern ?? this.selectPattern(complexity, task);
    const synthesisStrategy =
      task.synthesis ?? this.selectSynthesisStrategy(pattern);
    this.completeStage(reasoningStage, { pattern, synthesisStrategy });

    // ── Layer 4: Routing ──
    const routingStage = this.startStage("routing");
    const recommendations = this.router.route(task.intent, task.filePaths);
    const maxAgents = task.maxAgents ?? this.defaultAgentCount(pattern, complexity);
    const selectedAgents = recommendations.slice(0, maxAgents);
    this.completeStage(routingStage, {
      candidates: recommendations.length,
      selected: selectedAgents.length,
    });

    // ── Layer 5: Execution ──
    const executionStage = this.startStage("execution");
    let executions: AgentExecution[];

    // Build the execution context by merging task context with pipeline state
    const executionContext: Record<string, unknown> = {
      ...task.context,
      complexity,
      pattern,
      recalledMemories: recalledMemories.map((m) => m.content),
    };

    switch (pattern) {
      case "direct":
        executions = await this.direct(
          task,
          selectedAgents[0],
          activeExecutor,
          executionContext
        );
        break;
      case "sequential":
        executions = await this.sequential(
          task,
          selectedAgents,
          activeExecutor,
          executionContext
        );
        break;
      case "parallel":
        executions = await this.parallel(
          task,
          selectedAgents,
          activeExecutor,
          executionContext
        );
        break;
      case "iterative":
        executions = await this.iterative(
          task,
          selectedAgents,
          activeExecutor,
          executionContext,
          task.maxIterations ?? 3
        );
        break;
      case "cascade":
        executions = await this.cascade(
          task,
          selectedAgents,
          activeExecutor,
          executionContext
        );
        break;
      case "broadcast":
        executions = await this.broadcast(
          task,
          selectedAgents,
          activeExecutor,
          executionContext
        );
        break;
      default:
        executions = await this.direct(
          task,
          selectedAgents[0],
          activeExecutor,
          executionContext
        );
    }
    this.completeStage(executionStage, { executionCount: executions.length });

    // ── Layer 6: Synthesis ──
    const synthesisStage = this.startStage("synthesis");
    const synthesis = this.synthesize(executions, synthesisStrategy);
    const overallConfidence = this.computeConfidence(executions);
    this.completeStage(synthesisStage, { confidence: overallConfidence });

    // ── Layer 7: Memory Write ──
    const writeStage = this.startStage("memory-write");
    const memoryWritten = this.writeToMemory(task, pattern, executions, synthesis, overallConfidence);
    this.completeStage(writeStage, { written: memoryWritten });

    return {
      pattern,
      executions,
      synthesis,
      confidence: overallConfidence,
      memoryWritten,
      duration: Date.now() - startTime,
      complexity,
      memoryRecalled: recalledMemories.length,
    };
  }

  // ── Pattern Implementations ─────────────────────────────

  /**
   * Direct: Single agent execution.
   * The simplest pattern — one agent handles the entire task.
   */
  async direct(
    task: OrchestrationTask,
    recommendation: AgentRecommendation | undefined,
    executor: AgentExecutor,
    context: Record<string, unknown>
  ): Promise<AgentExecution[]> {
    if (!recommendation) {
      return [this.createEmptyExecution("no-agent-matched", task.intent)];
    }

    const execution = await this.executeAgent(
      recommendation.agent,
      task.intent,
      executor,
      context
    );
    return [execution];
  }

  /**
   * Sequential: Chain execution A → B → C.
   * Each agent receives the previous agent's output as additional input.
   * Like a relay race — each runner passes the baton.
   */
  async sequential(
    task: OrchestrationTask,
    recommendations: AgentRecommendation[],
    executor: AgentExecutor,
    context: Record<string, unknown>
  ): Promise<AgentExecution[]> {
    if (recommendations.length === 0) {
      return [this.createEmptyExecution("no-agents-matched", task.intent)];
    }

    const executions: AgentExecution[] = [];
    let currentInput = task.intent;

    for (const rec of recommendations) {
      const chainContext: Record<string, unknown> = {
        ...context,
        previousOutputs: executions.map((e) => ({
          agent: e.agent,
          output: e.output,
        })),
        chainPosition: executions.length,
        chainTotal: recommendations.length,
      };

      const execution = await this.executeAgent(
        rec.agent,
        currentInput,
        executor,
        chainContext
      );
      executions.push(execution);

      // The next agent receives both the original intent and the accumulated output
      currentInput = `Original intent: ${task.intent}\n\nPrevious agent (${rec.agent.id}) output:\n${execution.output}`;
    }

    return executions;
  }

  /**
   * Parallel: Execute A + B + C simultaneously, then collect all results.
   * All agents work on the same input independently.
   */
  async parallel(
    task: OrchestrationTask,
    recommendations: AgentRecommendation[],
    executor: AgentExecutor,
    context: Record<string, unknown>
  ): Promise<AgentExecution[]> {
    if (recommendations.length === 0) {
      return [this.createEmptyExecution("no-agents-matched", task.intent)];
    }

    const promises = recommendations.map((rec, index) => {
      const parallelContext: Record<string, unknown> = {
        ...context,
        parallelIndex: index,
        parallelTotal: recommendations.length,
      };
      return this.executeAgent(rec.agent, task.intent, executor, parallelContext);
    });

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      // On failure, record the error as the output
      return this.createErrorExecution(
        recommendations[index].agent.id,
        task.intent,
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );
    });
  }

  /**
   * Iterative: Create-review-refine loops.
   * The first agent creates, the second reviews, then the first refines.
   * Continues until maxIterations or convergence.
   */
  async iterative(
    task: OrchestrationTask,
    recommendations: AgentRecommendation[],
    executor: AgentExecutor,
    context: Record<string, unknown>,
    maxIterations: number
  ): Promise<AgentExecution[]> {
    if (recommendations.length < 2) {
      // Fall back to direct if we don't have enough agents for iteration
      return this.direct(task, recommendations[0], executor, context);
    }

    const executions: AgentExecution[] = [];
    const creator = recommendations[0];
    const reviewer = recommendations[1];
    let currentOutput = "";

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Create / Refine
      const createInput =
        iteration === 0
          ? task.intent
          : `Original intent: ${task.intent}\n\nPrevious output:\n${currentOutput}\n\nReview feedback:\n${executions[executions.length - 1]?.output ?? ""}`;

      const createContext: Record<string, unknown> = {
        ...context,
        iteration,
        maxIterations,
        phase: iteration === 0 ? "create" : "refine",
      };

      const createExecution = await this.executeAgent(
        creator.agent,
        createInput,
        executor,
        createContext
      );
      executions.push(createExecution);
      currentOutput = createExecution.output;

      // Review (skip on last iteration — no point reviewing if we won't refine)
      if (iteration < maxIterations - 1) {
        const reviewInput = `Original intent: ${task.intent}\n\nContent to review:\n${currentOutput}`;
        const reviewContext: Record<string, unknown> = {
          ...context,
          iteration,
          maxIterations,
          phase: "review",
        };

        const reviewExecution = await this.executeAgent(
          reviewer.agent,
          reviewInput,
          executor,
          reviewContext
        );
        executions.push(reviewExecution);

        // Check for convergence: if reviewer has high confidence, stop early
        if (reviewExecution.confidence >= 0.9) {
          break;
        }
      }
    }

    return executions;
  }

  /**
   * Cascade: Start with the simplest/fastest agent, escalate on failure.
   * Like a support tier system — try the cheapest option first.
   */
  async cascade(
    task: OrchestrationTask,
    recommendations: AgentRecommendation[],
    executor: AgentExecutor,
    context: Record<string, unknown>
  ): Promise<AgentExecution[]> {
    if (recommendations.length === 0) {
      return [this.createEmptyExecution("no-agents-matched", task.intent)];
    }

    const executions: AgentExecution[] = [];
    // Sort by type: specialists first (simpler), then meta agents (more powerful)
    const sorted = [...recommendations].sort((a, b) => {
      if (a.agent.type === "specialist" && b.agent.type === "meta") return -1;
      if (a.agent.type === "meta" && b.agent.type === "specialist") return 1;
      return 0;
    });

    for (let tier = 0; tier < sorted.length; tier++) {
      const cascadeContext: Record<string, unknown> = {
        ...context,
        cascadeTier: tier,
        cascadeTotal: sorted.length,
        previousAttempts: executions.map((e) => ({
          agent: e.agent,
          confidence: e.confidence,
        })),
      };

      const execution = await this.executeAgent(
        sorted[tier].agent,
        task.intent,
        executor,
        cascadeContext
      );
      executions.push(execution);

      // If the agent produced a confident result, stop escalating
      if (execution.confidence >= 0.7) {
        break;
      }
    }

    return executions;
  }

  /**
   * Broadcast: One event triggers all agents, collect every result.
   * Like an announcement — everyone responds independently.
   * Similar to parallel but semantically different: broadcast collects ALL
   * perspectives rather than seeking the best one.
   */
  async broadcast(
    task: OrchestrationTask,
    recommendations: AgentRecommendation[],
    executor: AgentExecutor,
    context: Record<string, unknown>
  ): Promise<AgentExecution[]> {
    if (recommendations.length === 0) {
      return [this.createEmptyExecution("no-agents-matched", task.intent)];
    }

    // Broadcast to ALL matched agents (no limit), in parallel
    const promises = recommendations.map((rec) => {
      const broadcastContext: Record<string, unknown> = {
        ...context,
        broadcastMode: true,
        totalRecipients: recommendations.length,
      };
      return this.executeAgent(rec.agent, task.intent, executor, broadcastContext);
    });

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return this.createErrorExecution(
        recommendations[index].agent.id,
        task.intent,
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );
    });
  }

  // ── Synthesis Strategies ────────────────────────────────

  /**
   * Synthesize multiple agent executions into a single output.
   */
  private synthesize(
    executions: AgentExecution[],
    strategy: SynthesisStrategy
  ): string {
    if (executions.length === 0) {
      return "[No agent executions to synthesize]";
    }

    if (executions.length === 1) {
      return executions[0].output;
    }

    switch (strategy) {
      case "weighted-consensus":
        return this.weightedConsensus(executions);
      case "sequential-refinement":
        return this.sequentialRefinement(executions);
      case "conflict-resolution":
        return this.conflictResolution(executions);
      default:
        return this.weightedConsensus(executions);
    }
  }

  /**
   * Weighted Consensus: Score perspectives by confidence, take the highest.
   * When multiple agents agree, their confidence compounds.
   */
  private weightedConsensus(executions: AgentExecution[]): string {
    // Sort by confidence descending
    const sorted = [...executions].sort((a, b) => b.confidence - a.confidence);

    // Build a weighted synthesis: primary output from highest-confidence agent,
    // with supporting perspectives from others
    const primary = sorted[0];
    const supporting = sorted.slice(1);

    if (supporting.length === 0) {
      return primary.output;
    }

    const parts = [
      primary.output,
      "",
      "--- Supporting perspectives ---",
    ];

    for (const exec of supporting) {
      parts.push(
        `[${exec.agent}] (confidence: ${exec.confidence.toFixed(2)}): ${exec.output}`
      );
    }

    return parts.join("\n");
  }

  /**
   * Sequential Refinement: Each agent's output builds on the previous.
   * The final execution is the refined result.
   */
  private sequentialRefinement(executions: AgentExecution[]): string {
    // In sequential refinement, the last execution is the most refined
    return executions[executions.length - 1].output;
  }

  /**
   * Conflict Resolution: Explicitly identify disagreements.
   * When agents diverge, present both sides with confidence scores.
   */
  private conflictResolution(executions: AgentExecution[]): string {
    if (executions.length < 2) {
      return executions[0]?.output ?? "[No output]";
    }

    const parts = [
      "=== Multi-Agent Analysis ===",
      "",
    ];

    // Group by confidence tiers
    const highConfidence = executions.filter((e) => e.confidence >= 0.7);
    const lowConfidence = executions.filter((e) => e.confidence < 0.7);

    if (highConfidence.length > 0) {
      parts.push("## High-Confidence Perspectives");
      for (const exec of highConfidence) {
        parts.push(
          `\n### ${exec.agent} (confidence: ${exec.confidence.toFixed(2)})`,
          exec.output
        );
      }
    }

    if (lowConfidence.length > 0) {
      parts.push("", "## Lower-Confidence Perspectives (potential conflicts)");
      for (const exec of lowConfidence) {
        parts.push(
          `\n### ${exec.agent} (confidence: ${exec.confidence.toFixed(2)})`,
          exec.output
        );
      }
    }

    // If there are both high and low confidence results, note the divergence
    if (highConfidence.length > 0 && lowConfidence.length > 0) {
      parts.push(
        "",
        "## Resolution Note",
        `${highConfidence.length} agent(s) showed high confidence while ${lowConfidence.length} showed lower confidence. ` +
          "Consider the high-confidence perspectives as primary, but review lower-confidence outputs for edge cases or alternative approaches."
      );
    }

    return parts.join("\n");
  }

  // ── Pipeline Helpers ────────────────────────────────────

  /**
   * Assess task complexity on a 1-10 scale based on intent analysis.
   */
  private assessComplexity(intent: string): number {
    const lower = intent.toLowerCase();
    let score = 3; // Base complexity

    // High-complexity signals
    for (const signal of HIGH_COMPLEXITY_SIGNALS) {
      if (lower.includes(signal)) score += 2;
    }

    // Medium-complexity signals
    for (const signal of MEDIUM_COMPLEXITY_SIGNALS) {
      if (lower.includes(signal)) score += 1;
    }

    // Length heuristic: longer intents tend to be more complex
    if (intent.length > 200) score += 1;
    if (intent.length > 500) score += 1;

    // Multiple sentences suggest compound tasks
    const sentenceCount = intent.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    if (sentenceCount > 2) score += 1;
    if (sentenceCount > 4) score += 1;

    return Math.min(10, Math.max(1, score));
  }

  /**
   * Extract keywords from intent for memory search and routing.
   */
  private extractKeywords(intent: string): string[] {
    return intent
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .filter((w, i, arr) => arr.indexOf(w) === i) // dedupe
      .slice(0, 20);
  }

  /**
   * Query memory for relevant past patterns.
   */
  private recallMemories(intent: string): MemoryEntry[] {
    return this.memory.search({
      query: intent,
      limit: 10,
      minConfidence: 0.3,
    });
  }

  /**
   * Auto-select the best orchestration pattern based on complexity.
   */
  private selectPattern(
    complexity: number,
    task: OrchestrationTask
  ): OrchestrationPattern {
    // If the task specifies a pattern, respect it
    if (task.pattern) return task.pattern;

    // Simple tasks: direct execution
    if (complexity <= 3) return "direct";

    // Moderate tasks: sequential chain for structured flow
    if (complexity <= 5) return "sequential";

    // Complex tasks: parallel for breadth, iterative for depth
    if (complexity <= 7) {
      // If the intent suggests review/refinement, use iterative
      const lower = task.intent.toLowerCase();
      if (
        lower.includes("review") ||
        lower.includes("refine") ||
        lower.includes("improve") ||
        lower.includes("iterate")
      ) {
        return "iterative";
      }
      return "parallel";
    }

    // Very complex tasks: cascade for resilience
    if (complexity <= 9) return "cascade";

    // Maximum complexity: broadcast for complete coverage
    return "broadcast";
  }

  /**
   * Select the appropriate synthesis strategy for a pattern.
   */
  private selectSynthesisStrategy(pattern: OrchestrationPattern): SynthesisStrategy {
    switch (pattern) {
      case "direct":
        return "weighted-consensus";
      case "sequential":
        return "sequential-refinement";
      case "parallel":
        return "weighted-consensus";
      case "iterative":
        return "sequential-refinement";
      case "cascade":
        return "weighted-consensus";
      case "broadcast":
        return "conflict-resolution";
      default:
        return "weighted-consensus";
    }
  }

  /**
   * Determine default agent count based on pattern and complexity.
   */
  private defaultAgentCount(pattern: OrchestrationPattern, complexity: number): number {
    switch (pattern) {
      case "direct":
        return 1;
      case "sequential":
        return Math.min(4, Math.ceil(complexity / 3));
      case "parallel":
        return Math.min(5, Math.ceil(complexity / 2));
      case "iterative":
        return 2; // Creator + reviewer
      case "cascade":
        return Math.min(4, Math.ceil(complexity / 2));
      case "broadcast":
        return 10; // Broadcast to all matching agents
      default:
        return 1;
    }
  }

  /**
   * Execute a single agent with timing and confidence tracking.
   */
  private async executeAgent(
    agent: AgentDefinition,
    input: string,
    executor: AgentExecutor,
    context: Record<string, unknown>
  ): Promise<AgentExecution> {
    const start = Date.now();

    try {
      const output = await executor(agent.id, input, {
        ...context,
        agentName: agent.name,
        agentType: agent.type,
        agentSkills: agent.skills,
      });

      const duration = Date.now() - start;

      // Estimate confidence from output characteristics
      const confidence = this.estimateConfidence(output, duration);

      return {
        agent: agent.id,
        input,
        output,
        duration,
        confidence,
      };
    } catch (error) {
      const duration = Date.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      return {
        agent: agent.id,
        input,
        output: `[Error] ${message}`,
        duration,
        confidence: 0,
      };
    }
  }

  /**
   * Estimate confidence from output characteristics.
   * This is a heuristic — consumers can override with their own confidence logic.
   */
  private estimateConfidence(output: string, duration: number): number {
    let confidence = 0.5; // Base confidence

    // Longer outputs suggest more thorough analysis
    if (output.length > 100) confidence += 0.1;
    if (output.length > 500) confidence += 0.1;

    // Very short outputs may indicate problems
    if (output.length < 20) confidence -= 0.2;

    // Error indicators reduce confidence
    if (output.includes("[Error]") || output.includes("error")) {
      confidence -= 0.3;
    }

    // Reasonable response time (not too fast, not too slow)
    if (duration > 50 && duration < 30000) confidence += 0.1;

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Compute overall confidence from all executions.
   */
  private computeConfidence(executions: AgentExecution[]): number {
    if (executions.length === 0) return 0;

    // Weighted average: higher-confidence executions count more
    let totalWeight = 0;
    let weightedSum = 0;

    for (const exec of executions) {
      const weight = 1 + exec.confidence; // Weight range: 1.0 to 2.0
      weightedSum += exec.confidence * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Write orchestration results to the memory vault.
   * Returns true if a memory entry was created.
   */
  private writeToMemory(
    task: OrchestrationTask,
    pattern: string,
    executions: AgentExecution[],
    synthesis: string,
    confidence: number
  ): boolean {
    // Only write to memory if the result was confident enough to be useful
    if (confidence < 0.3 || executions.length === 0) return false;

    const agents = executions.map((e) => e.agent).join(", ");
    const summaryLength = Math.min(synthesis.length, 500);

    this.memory.add({
      content: `[${pattern}] ${task.intent.slice(0, 200)} → Agents: ${agents}. Result: ${synthesis.slice(0, summaryLength)}`,
      category: "pattern",
      tags: [
        "orchestration",
        pattern,
        ...executions.map((e) => e.agent),
      ],
      confidence,
      source: "orchestration-engine",
    });

    // Persist to disk
    this.memory.save();

    return true;
  }

  /**
   * Create a placeholder execution for when no agent matches.
   */
  private createEmptyExecution(
    agentId: string,
    input: string
  ): AgentExecution {
    return {
      agent: agentId,
      input,
      output: "[No matching agent found for this task]",
      duration: 0,
      confidence: 0,
    };
  }

  /**
   * Create an error execution record.
   */
  private createErrorExecution(
    agentId: string,
    input: string,
    error: string
  ): AgentExecution {
    return {
      agent: agentId,
      input,
      output: `[Error] ${error}`,
      duration: 0,
      confidence: 0,
    };
  }

  // ── Pipeline Tracking ───────────────────────────────────

  private startStage(name: string): PipelineStage {
    const stage: PipelineStage = {
      name,
      startedAt: Date.now(),
    };
    this.pipeline.push(stage);
    return stage;
  }

  private completeStage(stage: PipelineStage, result: unknown): void {
    stage.completedAt = Date.now();
    stage.result = result;
  }

  /**
   * Get the pipeline stages from the most recent execution.
   * Useful for debugging and observability.
   */
  getPipelineStages(): PipelineStage[] {
    return [...this.pipeline];
  }
}

// ── Options ─────────────────────────────────────────────────

export interface OrchestrationEngineOptions {
  /** Memory manager for vault read/write. */
  memory: MemoryManager;
  /** Agent router for intelligent agent selection. */
  router: AgentRouter;
  /** Optional executor callback. Defaults to a passthrough executor. */
  executor?: AgentExecutor;
}
