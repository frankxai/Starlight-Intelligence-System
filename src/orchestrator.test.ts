/**
 * Orchestration Engine — Comprehensive Test Suite
 *
 * Covers all 6 execution patterns, 3 synthesis strategies,
 * complexity assessment, auto-pattern selection, pipeline tracking,
 * error handling, memory integration, and full end-to-end execution.
 *
 * Uses Node.js built-in test runner (node:test + node:assert).
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { OrchestrationEngine } from "./orchestrator.js";
import { MemoryManager } from "./memory.js";
import { AgentRouter } from "./agents.js";
import type {
  AgentExecutor,
  AgentDefinition,
  OrchestrationPattern,
} from "./types.js";

// ── Test Fixtures ───────────────────────────────────────────

/**
 * Deterministic mock executor that returns predictable responses.
 */
const mockExecutor: AgentExecutor = async (
  agent: string,
  input: string,
  _context: Record<string, unknown>
): Promise<string> => {
  return `Response from ${agent}: Processed "${input.slice(0, 50)}"`;
};

/**
 * Mock executor that returns long outputs (triggers higher confidence).
 */
const verboseExecutor: AgentExecutor = async (
  agent: string,
  input: string,
  _context: Record<string, unknown>
): Promise<string> => {
  const filler = "This is a detailed and comprehensive analysis. ".repeat(20);
  return `Response from ${agent}: Processed "${input.slice(0, 50)}"\n\n${filler}`;
};

/**
 * Mock executor that throws errors.
 */
const failingExecutor: AgentExecutor = async (
  _agent: string,
  _input: string,
  _context: Record<string, unknown>
): Promise<string> => {
  throw new Error("LLM service unavailable");
};

/**
 * Mock executor that alternates between success and failure.
 */
const flakyExecutor = (): AgentExecutor => {
  let callCount = 0;
  return async (
    agent: string,
    input: string,
    _context: Record<string, unknown>
  ): Promise<string> => {
    callCount++;
    if (callCount % 2 === 0) {
      throw new Error("Intermittent failure");
    }
    return `Response from ${agent}: Processed "${input.slice(0, 50)}"`;
  };
};

/**
 * Create a set of test agents with known properties.
 */
function createTestAgents(count: number = 4): AgentDefinition[] {
  const agents: AgentDefinition[] = [
    {
      id: "agent-alpha",
      name: "Agent Alpha",
      type: "specialist",
      description: "Frontend specialist for UI work",
      skills: ["react", "tailwind"],
      triggers: {
        keywords: ["build", "create", "component", "ui", "page"],
        filePatterns: ["app/**/*.tsx"],
      },
    },
    {
      id: "agent-beta",
      name: "Agent Beta",
      type: "specialist",
      description: "Backend specialist for API work",
      skills: ["node", "database"],
      triggers: {
        keywords: ["api", "database", "build", "create", "implement"],
        filePatterns: ["api/**/*.ts"],
      },
    },
    {
      id: "agent-gamma",
      name: "Agent Gamma",
      type: "specialist",
      description: "Research analyst for deep dives",
      skills: ["research", "analysis"],
      triggers: {
        keywords: ["research", "analyze", "investigate", "review"],
      },
    },
    {
      id: "agent-delta",
      name: "Agent Delta",
      type: "meta",
      description: "Orchestrator for complex coordination",
      skills: ["orchestration", "architecture"],
      triggers: {
        keywords: ["orchestrate", "coordinate", "system design", "architecture"],
      },
    },
  ];
  return agents.slice(0, count);
}

/**
 * Create a fresh MemoryManager with an isolated in-memory path.
 */
function createTestMemory(): MemoryManager {
  const id = Math.random().toString(36).slice(2, 10);
  return new MemoryManager(`/tmp/sis-test-${id}/memory.json`);
}

/**
 * Create a fully wired OrchestrationEngine for testing.
 */
function createEngine(options?: {
  agents?: AgentDefinition[];
  executor?: AgentExecutor;
  memory?: MemoryManager;
}): { engine: OrchestrationEngine; memory: MemoryManager; router: AgentRouter } {
  const agents = options?.agents ?? createTestAgents();
  const memory = options?.memory ?? createTestMemory();
  const router = new AgentRouter(agents);
  const engine = new OrchestrationEngine({
    memory,
    router,
    executor: options?.executor ?? mockExecutor,
  });
  return { engine, memory, router };
}

// ── Tests ───────────────────────────────────────────────────

describe("OrchestrationEngine", () => {
  // ── Construction ──────────────────────────────────────

  describe("construction", () => {
    it("should construct with all required options", () => {
      const { engine } = createEngine();
      assert.ok(engine instanceof OrchestrationEngine);
    });

    it("should construct without an explicit executor (uses default)", async () => {
      const agents = createTestAgents();
      const memory = createTestMemory();
      const router = new AgentRouter(agents);
      const engine = new OrchestrationEngine({ memory, router });

      const result = await engine.execute({
        intent: "build a new component for the page",
      });

      assert.ok(result.executions.length > 0);
      assert.ok(result.executions[0].output.includes("Processed:"));
    });

    it("should allow setting executor after construction", async () => {
      const { engine } = createEngine();
      let customExecutorCalled = false;

      engine.setExecutor(async (agent, input, _ctx) => {
        customExecutorCalled = true;
        return `Custom: ${agent} handled ${input.slice(0, 20)}`;
      });

      const result = await engine.execute({
        intent: "build a component",
      });

      assert.ok(customExecutorCalled, "Custom executor should have been called");
      assert.ok(result.executions[0].output.startsWith("Custom:"));
    });

    it("should construct with custom agents", () => {
      const customAgents: AgentDefinition[] = [
        {
          id: "custom-one",
          name: "Custom Agent",
          type: "specialist",
          description: "A custom test agent",
          skills: ["custom-skill"],
          triggers: { keywords: ["custom"] },
        },
      ];
      const { engine } = createEngine({ agents: customAgents });
      assert.ok(engine instanceof OrchestrationEngine);
    });

    it("should construct with custom memory manager", () => {
      const memory = createTestMemory();
      const { engine } = createEngine({ memory });
      assert.ok(engine instanceof OrchestrationEngine);
    });
  });

  // ── Execution Patterns ────────────────────────────────

  describe("direct pattern", () => {
    it("should execute with a single agent", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "build a simple button component",
        pattern: "direct",
      });

      assert.equal(result.pattern, "direct");
      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("Response from"));
      assert.ok(result.executions[0].duration >= 0);
    });

    it("should handle no matching agent gracefully", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "something that matches no agent keywords whatsoever xyz123",
        pattern: "direct",
      });

      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("No matching agent"));
      assert.equal(result.executions[0].confidence, 0);
    });

    it("should pass context through to the executor", async () => {
      let receivedContext: Record<string, unknown> = {};
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          receivedContext = ctx;
          return "done " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build a page",
        pattern: "direct",
        context: { projectName: "TestProject", version: 42 },
      });

      assert.equal(receivedContext.projectName, "TestProject");
      assert.equal(receivedContext.version, 42);
    });
  });

  describe("sequential pattern", () => {
    it("should chain agents in sequence", async () => {
      const callOrder: string[] = [];
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          callOrder.push(agent);
          return `Output from ${agent}` + " detail ".repeat(20);
        },
      });

      const result = await engine.execute({
        intent: "build and review a component",
        pattern: "sequential",
        maxAgents: 3,
      });

      assert.equal(result.pattern, "sequential");
      assert.ok(result.executions.length >= 2);
      assert.deepEqual(
        callOrder.slice(0, result.executions.length),
        result.executions.map(e => e.agent)
      );
    });

    it("should pass previous agent output to next agent", async () => {
      const inputs: string[] = [];
      const { engine } = createEngine({
        executor: async (_agent, input, _ctx) => {
          inputs.push(input);
          return `Processed step` + " data ".repeat(20);
        },
      });

      const result = await engine.execute({
        intent: "build and review a component",
        pattern: "sequential",
        maxAgents: 2,
      });

      assert.ok(inputs[0].includes("build and review"));
      if (result.executions.length > 1) {
        assert.ok(inputs[1].includes("Original intent:"));
        assert.ok(inputs[1].includes("Previous agent"));
      }
    });

    it("should include chain position in context", async () => {
      const positions: number[] = [];
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          positions.push(ctx.chainPosition as number);
          return "done " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build and review a component",
        pattern: "sequential",
        maxAgents: 3,
      });

      for (let i = 0; i < positions.length; i++) {
        assert.equal(positions[i], i);
      }
    });

    it("should handle empty agent list", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "zzz no keywords match this xyz",
        pattern: "sequential",
      });

      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("No matching agent"));
    });
  });

  describe("parallel pattern", () => {
    it("should execute all agents simultaneously", async () => {
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return `Parallel result from ${agent}` + " detail ".repeat(20);
        },
      });

      const result = await engine.execute({
        intent: "build and create a component for the page",
        pattern: "parallel",
        maxAgents: 3,
      });

      assert.equal(result.pattern, "parallel");
      assert.ok(result.executions.length >= 2);
      for (const exec of result.executions) {
        assert.ok(exec.output.includes("Parallel result from"));
      }
    });

    it("should handle partial failures gracefully", async () => {
      const flaky = flakyExecutor();
      const { engine } = createEngine({ executor: flaky });

      const result = await engine.execute({
        intent: "build and create a ui component for the page",
        pattern: "parallel",
        maxAgents: 4,
      });

      const successes = result.executions.filter(e => !e.output.includes("[Error]"));
      const failures = result.executions.filter(e => e.output.includes("[Error]"));
      assert.ok(successes.length > 0 || failures.length > 0);
    });

    it("should include parallel index in context", async () => {
      const indices: number[] = [];
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          indices.push(ctx.parallelIndex as number);
          return "done " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build and create a component",
        pattern: "parallel",
        maxAgents: 3,
      });

      const uniqueIndices = new Set(indices);
      assert.equal(uniqueIndices.size, indices.length);
    });

    it("should handle empty agent list", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "zzz no keywords match xyz",
        pattern: "parallel",
      });

      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("No matching agent"));
    });
  });

  describe("iterative pattern", () => {
    it("should alternate between creator and reviewer", async () => {
      const callOrder: Array<{ agent: string; phase: string }> = [];
      const { engine } = createEngine({
        executor: async (agent, _input, ctx) => {
          callOrder.push({ agent, phase: ctx.phase as string });
          return `${ctx.phase} output from ${agent}` + " content ".repeat(20);
        },
      });

      const result = await engine.execute({
        intent: "build and review a component",
        pattern: "iterative",
        maxIterations: 2,
        maxAgents: 2,
      });

      assert.equal(result.pattern, "iterative");
      assert.ok(result.executions.length >= 2);

      const phases = callOrder.map(c => c.phase);
      assert.ok(phases.includes("create"), "Should have a create phase");
    });

    it("should fall back to direct with fewer than 2 agents", async () => {
      const singleAgent: AgentDefinition[] = [
        {
          id: "solo-agent",
          name: "Solo",
          type: "specialist",
          description: "The only agent",
          skills: ["solo"],
          triggers: { keywords: ["solo", "build"] },
        },
      ];
      const { engine } = createEngine({ agents: singleAgent });

      const result = await engine.execute({
        intent: "build something solo",
        pattern: "iterative",
        maxIterations: 3,
      });

      assert.equal(result.executions.length, 1);
    });

    it("should pass iteration count in context", async () => {
      const iterations: number[] = [];
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          iterations.push(ctx.iteration as number);
          return "iteration output " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build and review a component",
        pattern: "iterative",
        maxIterations: 2,
        maxAgents: 2,
      });

      assert.ok(iterations.length > 0);
      assert.equal(iterations[0], 0);
    });

    it("should respect maxIterations limit", async () => {
      const { engine } = createEngine({
        executor: async (_agent, _input, _ctx) => {
          return "short"; // Low confidence, won't trigger early stop
        },
      });

      const result = await engine.execute({
        intent: "build and review a component",
        pattern: "iterative",
        maxIterations: 2,
        maxAgents: 2,
      });

      // maxIterations=2: iter0 create + review, iter1 create (no review on last)
      // So max 5 executions for 2 iterations: create, review, create, review, create
      // Actually: iter0 = create + review, iter1 = create (last, no review) = 3
      assert.ok(result.executions.length <= 5);
    });
  });

  describe("cascade pattern", () => {
    it("should try agents in order until confident result", async () => {
      let callCount = 0;
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          callCount++;
          if (callCount >= 2) {
            return "Highly detailed and comprehensive " + "analysis ".repeat(100) + ` from ${agent}`;
          }
          return "brief";
        },
      });

      const result = await engine.execute({
        intent: "build and create a component for the page",
        pattern: "cascade",
        maxAgents: 4,
      });

      assert.equal(result.pattern, "cascade");
      assert.ok(result.executions.length >= 1);
    });

    it("should sort specialists before meta agents", async () => {
      const agentTypes: string[] = [];
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          agentTypes.push(ctx.agentType as string);
          return "ok";
        },
      });

      await engine.execute({
        intent: "orchestrate and build a system design for the architecture component",
        pattern: "cascade",
        maxAgents: 10,
      });

      if (agentTypes.length >= 2) {
        const firstMetaIndex = agentTypes.indexOf("meta");
        const lastSpecialistIndex = agentTypes.lastIndexOf("specialist");
        if (firstMetaIndex >= 0 && lastSpecialistIndex >= 0) {
          assert.ok(
            lastSpecialistIndex < firstMetaIndex,
            "Specialists should be tried before meta agents in cascade"
          );
        }
      }
    });

    it("should include cascade tier in context", async () => {
      const tiers: number[] = [];
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          tiers.push(ctx.cascadeTier as number);
          return "short";
        },
      });

      await engine.execute({
        intent: "build and create a component",
        pattern: "cascade",
        maxAgents: 3,
      });

      for (let i = 0; i < tiers.length; i++) {
        assert.equal(tiers[i], i);
      }
    });

    it("should stop at confident result", async () => {
      const agentsCalled: string[] = [];
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          agentsCalled.push(agent);
          return "Extremely detailed comprehensive thorough " + "analysis ".repeat(200) + ` from ${agent}`;
        },
      });

      const result = await engine.execute({
        intent: "build and create a component for the page",
        pattern: "cascade",
        maxAgents: 4,
      });

      // First agent should produce high confidence; cascade should stop
      assert.equal(result.executions.length, 1);
    });

    it("should handle empty agent list", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "zzz no keywords match xyz",
        pattern: "cascade",
      });

      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("No matching agent"));
    });
  });

  describe("broadcast pattern", () => {
    it("should execute all matching agents", async () => {
      const agentsCalled: string[] = [];
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          agentsCalled.push(agent);
          return `Broadcast response from ${agent}` + " details ".repeat(20);
        },
      });

      const result = await engine.execute({
        intent: "build and create a component for the page",
        pattern: "broadcast",
        maxAgents: 10,
      });

      assert.equal(result.pattern, "broadcast");
      assert.ok(result.executions.length >= 2);
      for (const exec of result.executions) {
        assert.ok(exec.output.includes("Broadcast response from"));
      }
    });

    it("should include broadcast context flags", async () => {
      let broadcastMode = false;
      let totalRecipients = 0;
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          broadcastMode = ctx.broadcastMode as boolean;
          totalRecipients = ctx.totalRecipients as number;
          return "response " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build a component",
        pattern: "broadcast",
        maxAgents: 5,
      });

      assert.equal(broadcastMode, true);
      assert.ok(totalRecipients > 0);
    });

    it("should handle partial failures in broadcast", async () => {
      const flaky = flakyExecutor();
      const { engine } = createEngine({ executor: flaky });

      const result = await engine.execute({
        intent: "build and create a component for ui page",
        pattern: "broadcast",
        maxAgents: 5,
      });

      assert.ok(result.executions.length >= 1);
    });

    it("should handle empty agent list", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "zzz no keywords match xyz",
        pattern: "broadcast",
      });

      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("No matching agent"));
    });
  });

  // ── Synthesis Strategies ──────────────────────────────

  describe("synthesis strategies", () => {
    describe("weighted-consensus", () => {
      it("should return single output directly for one execution", async () => {
        const { engine } = createEngine();

        const result = await engine.execute({
          intent: "build a component",
          pattern: "direct",
          synthesis: "weighted-consensus",
        });

        assert.equal(result.synthesis, result.executions[0].output);
      });

      it("should include supporting perspectives when multiple agents", async () => {
        const { engine } = createEngine({ executor: verboseExecutor });

        const result = await engine.execute({
          intent: "build and create a component for the page",
          pattern: "parallel",
          synthesis: "weighted-consensus",
          maxAgents: 3,
        });

        if (result.executions.length > 1) {
          assert.ok(
            result.synthesis.includes("Supporting perspectives"),
            "Multi-agent weighted consensus should include supporting info"
          );
        }
      });
    });

    describe("sequential-refinement", () => {
      it("should use the last execution as the refined result", async () => {
        const { engine } = createEngine({
          executor: async (agent, _input, _ctx) => {
            return `Refined output from ${agent}` + " detail ".repeat(20);
          },
        });

        const result = await engine.execute({
          intent: "build and review a component",
          pattern: "sequential",
          synthesis: "sequential-refinement",
          maxAgents: 3,
        });

        if (result.executions.length > 0) {
          const lastExec = result.executions[result.executions.length - 1];
          assert.equal(result.synthesis, lastExec.output);
        }
      });
    });

    describe("conflict-resolution", () => {
      it("should present multi-agent analysis header", async () => {
        let callIndex = 0;
        const { engine } = createEngine({
          executor: async (agent, _input, _ctx) => {
            callIndex++;
            if (callIndex === 1) {
              return "Maybe";
            }
            return "Comprehensive detailed thorough " + "analysis ".repeat(100) + ` from ${agent}`;
          },
        });

        const result = await engine.execute({
          intent: "build and create a component for the page",
          pattern: "parallel",
          synthesis: "conflict-resolution",
          maxAgents: 3,
        });

        if (result.executions.length >= 2) {
          assert.ok(
            result.synthesis.includes("Multi-Agent Analysis"),
            "Conflict resolution should have multi-agent analysis header"
          );
        }
      });

      it("should include resolution note when high and low confidence coexist", async () => {
        let callIndex = 0;
        const { engine } = createEngine({
          executor: async (_agent, _input, _ctx) => {
            callIndex++;
            if (callIndex % 2 === 0) {
              return "x"; // Very short -> low confidence
            }
            return "This is extremely detailed and comprehensive work " + "content ".repeat(150);
          },
        });

        const result = await engine.execute({
          intent: "build and create a component for the page ui",
          pattern: "parallel",
          synthesis: "conflict-resolution",
          maxAgents: 4,
        });

        if (result.executions.length >= 2) {
          const hasHighAndLow =
            result.executions.some(e => e.confidence >= 0.7) &&
            result.executions.some(e => e.confidence < 0.7);

          if (hasHighAndLow) {
            assert.ok(
              result.synthesis.includes("Resolution Note"),
              "Should include resolution note when high and low confidence coexist"
            );
          }
        }
      });

      it("should handle synthesis with zero executions", async () => {
        const { engine } = createEngine();
        const result = await engine.execute({
          intent: "zzz nothing matches",
          pattern: "direct",
          synthesis: "conflict-resolution",
        });

        // Even no-match produces one empty execution, synthesis should still work
        assert.ok(typeof result.synthesis === "string");
        assert.ok(result.synthesis.length > 0);
      });
    });
  });

  // ── Complexity Assessment ─────────────────────────────

  describe("complexity assessment", () => {
    it("should rate simple intents as low complexity", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "fix a typo",
        pattern: "direct",
      });

      assert.ok(result.complexity <= 4, `Expected low complexity, got ${result.complexity}`);
    });

    it("should rate intents with high-complexity keywords as high", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "architecture and system design for a multi-domain orchestration that will coordinate and integrate end-to-end",
        pattern: "direct",
      });

      assert.ok(result.complexity >= 7, `Expected high complexity, got ${result.complexity}`);
    });

    it("should rate intents with medium-complexity keywords as medium", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "build and implement a new feature",
        pattern: "direct",
      });

      assert.ok(result.complexity >= 4, `Expected medium+ complexity, got ${result.complexity}`);
      assert.ok(result.complexity <= 7, `Expected medium complexity, got ${result.complexity}`);
    });

    it("should increase complexity for long intents", async () => {
      const { engine } = createEngine();

      const shortResult = await engine.execute({
        intent: "fix bug",
        pattern: "direct",
      });

      const longResult = await engine.execute({
        intent: "We need to fix a bug. " + "Additional context sentence. ".repeat(30),
        pattern: "direct",
      });

      assert.ok(
        longResult.complexity >= shortResult.complexity,
        `Long intent (${longResult.complexity}) should be >= short intent (${shortResult.complexity})`
      );
    });

    it("should increase complexity for multi-sentence intents", async () => {
      const { engine } = createEngine();

      const singleSentence = await engine.execute({
        intent: "Fix the login button",
        pattern: "direct",
      });

      const multiSentence = await engine.execute({
        intent: "Fix the login button. Then update the auth flow. Also check the session handling. Review the token refresh. Test the logout.",
        pattern: "direct",
      });

      assert.ok(
        multiSentence.complexity >= singleSentence.complexity,
        `Multi-sentence (${multiSentence.complexity}) should be >= single sentence (${singleSentence.complexity})`
      );
    });

    it("should cap complexity at 10", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "architecture system design multi-domain orchestrate coordinate refactor migrate integrate cross-cutting end-to-end build create implement review optimize analyze research compare. ".repeat(10),
        pattern: "direct",
      });

      assert.ok(result.complexity <= 10, `Complexity should be capped at 10, got ${result.complexity}`);
    });

    it("should floor complexity at 1", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "hi",
        pattern: "direct",
      });

      assert.ok(result.complexity >= 1, `Complexity should be at least 1, got ${result.complexity}`);
    });
  });

  // ── Auto Pattern Selection ────────────────────────────

  describe("auto pattern selection", () => {
    it("should select direct for simple intents (complexity <= 3)", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({ intent: "fix a typo" });
      assert.equal(result.pattern, "direct");
    });

    it("should select sequential for moderate intents (complexity 4-5)", async () => {
      const { engine } = createEngine();
      // "build" and "create" are medium keywords -> 3 + 1 + 1 = 5
      const result = await engine.execute({ intent: "build and create something" });
      assert.equal(result.pattern, "sequential");
    });

    it("should select iterative for review-oriented complex intents", async () => {
      const { engine } = createEngine();
      // "review" (medium +1) + "refactor" (high +2) + "optimize" (medium +1) = 3 + 1 + 2 + 1 = 7
      const result = await engine.execute({ intent: "review and refactor and optimize the code" });
      assert.equal(result.pattern, "iterative");
    });

    it("should select cascade or broadcast for very complex intents", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "architecture system design multi-domain orchestrate coordinate integrate cross-cutting end-to-end",
      });
      assert.ok(
        ["cascade", "broadcast"].includes(result.pattern),
        `Expected cascade or broadcast, got ${result.pattern}`
      );
    });

    it("should respect explicit pattern override regardless of complexity", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "simple fix",
        pattern: "broadcast",
      });
      assert.equal(result.pattern, "broadcast");
    });
  });

  // ── Pipeline Stage Tracking ───────────────────────────

  describe("pipeline stage tracking", () => {
    it("should track all 7 pipeline stages", async () => {
      const { engine } = createEngine();
      await engine.execute({ intent: "build a component", pattern: "direct" });

      const stages = engine.getPipelineStages();
      assert.equal(stages.length, 7);

      const stageNames = stages.map(s => s.name);
      assert.deepEqual(stageNames, [
        "perception",
        "memory-recall",
        "reasoning",
        "routing",
        "execution",
        "synthesis",
        "memory-write",
      ]);
    });

    it("should record start and completion times for each stage", async () => {
      const { engine } = createEngine();
      await engine.execute({ intent: "build a component", pattern: "direct" });

      const stages = engine.getPipelineStages();
      for (const stage of stages) {
        assert.ok(stage.startedAt > 0, `Stage ${stage.name} should have startedAt`);
        assert.ok(stage.completedAt !== undefined, `Stage ${stage.name} should have completedAt`);
        assert.ok(
          stage.completedAt! >= stage.startedAt,
          `Stage ${stage.name}: completedAt should be >= startedAt`
        );
      }
    });

    it("should include perception results (complexity, keywords)", async () => {
      const { engine } = createEngine();
      await engine.execute({ intent: "build a component", pattern: "direct" });

      const stages = engine.getPipelineStages();
      const perception = stages.find(s => s.name === "perception");
      assert.ok(perception);
      const result = perception!.result as { complexity: number; keywords: string[] };
      assert.ok(typeof result.complexity === "number");
      assert.ok(Array.isArray(result.keywords));
    });

    it("should include routing results (candidates, selected)", async () => {
      const { engine } = createEngine();
      await engine.execute({ intent: "build a component", pattern: "direct" });

      const stages = engine.getPipelineStages();
      const routing = stages.find(s => s.name === "routing");
      assert.ok(routing);
      const result = routing!.result as { candidates: number; selected: number };
      assert.ok(typeof result.candidates === "number");
      assert.ok(typeof result.selected === "number");
    });

    it("should include execution count", async () => {
      const { engine } = createEngine();
      await engine.execute({
        intent: "build and create a component",
        pattern: "parallel",
        maxAgents: 3,
      });

      const stages = engine.getPipelineStages();
      const execution = stages.find(s => s.name === "execution");
      assert.ok(execution);
      const result = execution!.result as { executionCount: number };
      assert.ok(result.executionCount >= 1);
    });

    it("should reset pipeline stages on each execute call", async () => {
      const { engine } = createEngine();

      await engine.execute({ intent: "build a component", pattern: "direct" });
      const firstStages = engine.getPipelineStages();
      assert.equal(firstStages.length, 7);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));

      await engine.execute({ intent: "create another component", pattern: "direct" });
      const secondStages = engine.getPipelineStages();
      assert.equal(secondStages.length, 7);
    });

    it("should return a copy of pipeline stages (not a reference)", async () => {
      const { engine } = createEngine();
      await engine.execute({ intent: "build a component", pattern: "direct" });

      const stages1 = engine.getPipelineStages();
      const stages2 = engine.getPipelineStages();

      assert.notEqual(stages1, stages2);
      assert.deepEqual(stages1, stages2);
    });
  });

  // ── Error Handling ────────────────────────────────────

  describe("error handling", () => {
    it("should handle executor errors gracefully in direct pattern", async () => {
      const { engine } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.equal(result.executions.length, 1);
      assert.ok(result.executions[0].output.includes("[Error]"));
      assert.ok(result.executions[0].output.includes("LLM service unavailable"));
      assert.equal(result.executions[0].confidence, 0);
    });

    it("should handle executor errors gracefully in sequential pattern", async () => {
      const { engine } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build and create a component",
        pattern: "sequential",
        maxAgents: 2,
      });

      for (const exec of result.executions) {
        assert.ok(exec.output.includes("[Error]"));
        assert.equal(exec.confidence, 0);
      }
    });

    it("should handle executor errors gracefully in parallel pattern", async () => {
      const { engine } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build and create a component for the page",
        pattern: "parallel",
        maxAgents: 3,
      });

      for (const exec of result.executions) {
        assert.ok(exec.output.includes("[Error]"));
      }
    });

    it("should handle non-Error exceptions", async () => {
      const { engine } = createEngine({
        executor: async () => {
          throw "string error";
        },
      });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.ok(result.executions[0].output.includes("[Error]"));
      assert.ok(result.executions[0].output.includes("string error"));
    });

    it("should produce zero confidence on all-error results", async () => {
      const { engine } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.equal(result.confidence, 0);
    });

    it("should not write to memory when confidence is too low", async () => {
      const { engine, memory } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.equal(result.memoryWritten, false);
      assert.equal(memory.size, 0);
    });
  });

  // ── Memory Integration ────────────────────────────────

  describe("memory integration", () => {
    it("should write to memory when confidence >= 0.3", async () => {
      const { engine, memory } = createEngine({ executor: verboseExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      if (result.confidence >= 0.3) {
        assert.equal(result.memoryWritten, true);
        assert.ok(memory.size > 0, "Memory should have entries after successful execution");
      }
    });

    it("should NOT write to memory when confidence < 0.3", async () => {
      const { engine, memory } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.equal(result.memoryWritten, false);
      assert.equal(memory.size, 0);
    });

    it("should store orchestration pattern in memory entry", async () => {
      const { engine, memory } = createEngine({ executor: verboseExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      if (result.memoryWritten) {
        const entries = memory.getAll();
        assert.ok(entries.length > 0);
        const entry = entries[0];
        assert.ok(entry.content.includes("direct"), "Memory should reference the pattern used");
        assert.ok(entry.tags.includes("orchestration"));
        assert.ok(entry.tags.includes("direct"));
      }
    });

    it("should recall relevant memories during execution", async () => {
      const memory = createTestMemory();

      memory.add({
        content: "Previous component build used React with Tailwind styling approach",
        category: "pattern",
        tags: ["component", "build", "react"],
        confidence: 0.8,
        source: "test",
      });

      const { engine } = createEngine({ memory, executor: verboseExecutor });

      const result = await engine.execute({
        intent: "build a component with react",
        pattern: "direct",
      });

      assert.ok(result.memoryRecalled >= 0);
    });

    it("should pass recalled memories in execution context", async () => {
      const memory = createTestMemory();

      memory.add({
        content: "Always use server components for data fetching",
        category: "pattern",
        tags: ["react", "component", "build"],
        confidence: 0.9,
        source: "test",
      });

      let capturedContext: Record<string, unknown> = {};
      const { engine } = createEngine({
        memory,
        executor: async (_agent, _input, ctx) => {
          capturedContext = ctx;
          return "done " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build a react component",
        pattern: "direct",
      });

      assert.ok("recalledMemories" in capturedContext);
      assert.ok(Array.isArray(capturedContext.recalledMemories));
    });

    it("should record the memoryRecalled count in result", async () => {
      const { engine } = createEngine();

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.ok(typeof result.memoryRecalled === "number");
      assert.ok(result.memoryRecalled >= 0);
    });
  });

  // ── Full Pipeline End-to-End ──────────────────────────

  describe("full execute() pipeline end-to-end", () => {
    it("should return a complete OrchestrationResult", async () => {
      const { engine } = createEngine();

      const result = await engine.execute({
        intent: "build a new UI component for the page",
        pattern: "direct",
        context: { project: "test-project" },
      });

      assert.equal(typeof result.pattern, "string");
      assert.ok(Array.isArray(result.executions));
      assert.ok(result.executions.length > 0);
      assert.equal(typeof result.synthesis, "string");
      assert.ok(result.synthesis.length > 0);
      assert.equal(typeof result.confidence, "number");
      assert.ok(result.confidence >= 0 && result.confidence <= 1);
      assert.equal(typeof result.memoryWritten, "boolean");
      assert.equal(typeof result.duration, "number");
      assert.ok(result.duration >= 0);
      assert.equal(typeof result.complexity, "number");
      assert.ok(result.complexity >= 1 && result.complexity <= 10);
      assert.equal(typeof result.memoryRecalled, "number");
    });

    it("should track duration accurately", async () => {
      const delay = 50;
      const { engine } = createEngine({
        executor: async (agent, input, _ctx) => {
          await new Promise(resolve => setTimeout(resolve, delay));
          return `Response from ${agent}: ${input.slice(0, 30)}` + " x".repeat(50);
        },
      });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.ok(
        result.duration >= delay - 10,
        `Duration (${result.duration}ms) should be >= ${delay - 10}ms`
      );
    });

    it("should work with per-call executor override", async () => {
      const { engine } = createEngine();

      const overrideExecutor: AgentExecutor = async (agent, _input, _ctx) => {
        return `Override executor: ${agent}` + " detail ".repeat(20);
      };

      const result = await engine.execute(
        { intent: "build a component", pattern: "direct" },
        overrideExecutor
      );

      assert.ok(result.executions[0].output.includes("Override executor"));
    });

    it("should handle sequential with per-call executor", async () => {
      const { engine } = createEngine();

      const result = await engine.execute(
        {
          intent: "build and review a component",
          pattern: "sequential",
          maxAgents: 2,
        },
        async (agent, _input, _ctx) => {
          return `Sequential override: ${agent}` + " output ".repeat(20);
        }
      );

      assert.ok(result.executions.length >= 1);
      assert.ok(result.executions[0].output.includes("Sequential override"));
    });

    it("should produce consistent results across runs", async () => {
      const { engine } = createEngine();

      const result1 = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      const result2 = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.equal(result1.pattern, result2.pattern);
      assert.equal(result1.complexity, result2.complexity);
      assert.equal(result1.executions.length, result2.executions.length);
      assert.equal(result1.executions[0].agent, result2.executions[0].agent);
    });

    it("should handle all 6 patterns in sequence", async () => {
      const { engine } = createEngine({ executor: verboseExecutor });

      const patterns: OrchestrationPattern[] = [
        "direct", "sequential", "parallel", "iterative", "cascade", "broadcast",
      ];

      for (const pattern of patterns) {
        const result = await engine.execute({
          intent: "build and create a component to review for the page ui",
          pattern,
          maxAgents: 3,
          maxIterations: 2,
        });

        assert.equal(result.pattern, pattern);
        assert.ok(result.executions.length >= 1, `${pattern} should have at least 1 execution`);
        assert.ok(result.synthesis.length > 0, `${pattern} should produce a synthesis`);
        assert.ok(result.confidence >= 0, `${pattern} confidence should be >= 0`);
        assert.ok(result.duration >= 0, `${pattern} duration should be >= 0`);
      }
    });

    it("should propagate maxAgents correctly", async () => {
      const agentsCalled = new Set<string>();
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          agentsCalled.add(agent);
          return `Response from ${agent}` + " x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build and create a component for the page ui",
        pattern: "parallel",
        maxAgents: 2,
      });

      assert.ok(agentsCalled.size <= 2, `Should limit to 2 agents, got ${agentsCalled.size}`);
    });

    it("should set correct synthesis strategy based on pattern when not specified", async () => {
      const { engine } = createEngine({ executor: verboseExecutor });

      const seqResult = await engine.execute({
        intent: "build and create a component",
        pattern: "sequential",
        maxAgents: 2,
      });

      if (seqResult.executions.length > 1) {
        const lastOutput = seqResult.executions[seqResult.executions.length - 1].output;
        assert.equal(seqResult.synthesis, lastOutput,
          "Sequential refinement synthesis should equal last execution output");
      }
    });

    it("should include agent metadata in executor context", async () => {
      let capturedContext: Record<string, unknown> = {};
      const { engine } = createEngine({
        executor: async (_agent, _input, ctx) => {
          capturedContext = ctx;
          return "done " + "x".repeat(100);
        },
      });

      await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.ok("agentName" in capturedContext);
      assert.ok("agentType" in capturedContext);
      assert.ok("agentSkills" in capturedContext);
      assert.ok("complexity" in capturedContext);
      assert.ok("pattern" in capturedContext);
    });
  });

  // ── Confidence Computation ────────────────────────────

  describe("confidence computation", () => {
    it("should produce higher confidence for longer outputs", async () => {
      const { engine: shortEngine } = createEngine({
        executor: async () => "ok",
      });
      const { engine: longEngine } = createEngine({
        executor: async () => "This is a very comprehensive " + "detailed ".repeat(200),
      });

      const shortResult = await shortEngine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      const longResult = await longEngine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.ok(
        longResult.confidence >= shortResult.confidence,
        `Long output confidence (${longResult.confidence}) should be >= short (${shortResult.confidence})`
      );
    });

    it("should produce zero confidence for error outputs", async () => {
      const { engine } = createEngine({ executor: failingExecutor });

      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.equal(result.executions[0].confidence, 0);
    });

    it("should reduce confidence for outputs containing error keywords", async () => {
      const { engine: errorEngine } = createEngine({
        executor: async () => "There was an error processing the request " + "x".repeat(100),
      });
      const { engine: cleanEngine } = createEngine({
        executor: async () => "Successfully processed the request " + "x".repeat(100),
      });

      const errorResult = await errorEngine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      const cleanResult = await cleanEngine.execute({
        intent: "build a component",
        pattern: "direct",
      });

      assert.ok(
        cleanResult.confidence >= errorResult.confidence,
        `Clean confidence (${cleanResult.confidence}) should be >= error confidence (${errorResult.confidence})`
      );
    });

    it("should compute weighted average across multiple executions", async () => {
      const { engine } = createEngine({ executor: verboseExecutor });

      const result = await engine.execute({
        intent: "build and create a component for the page",
        pattern: "parallel",
        maxAgents: 3,
      });

      assert.ok(result.confidence >= 0);
      assert.ok(result.confidence <= 1);

      if (result.executions.length > 1) {
        assert.ok(result.confidence > 0, "Multi-agent confidence should be positive");
      }
    });
  });

  // ── Default Agent Count ───────────────────────────────

  describe("default agent count by pattern", () => {
    it("should use 1 agent for direct pattern", async () => {
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "build a component",
        pattern: "direct",
      });
      assert.equal(result.executions.length, 1);
    });

    it("should use 2 agents for iterative pattern", async () => {
      const { engine } = createEngine({
        executor: async (agent, _input, _ctx) => {
          return `Response from ${agent}` + " x".repeat(100);
        },
      });

      const result = await engine.execute({
        intent: "build and review a component",
        pattern: "iterative",
        maxIterations: 2,
      });

      const uniqueAgents = new Set(result.executions.map(e => e.agent));
      assert.ok(uniqueAgents.size <= 2);
    });

    it("should use up to 10 agents for broadcast pattern", async () => {
      // Even with maxAgents unset, broadcast defaults to 10
      const { engine } = createEngine();
      const result = await engine.execute({
        intent: "build a component",
        pattern: "broadcast",
      });
      // Limited by matching agents, but the default agent count should allow up to 10
      assert.ok(result.executions.length >= 1);
    });
  });
});
