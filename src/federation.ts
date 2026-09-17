import { randomUUID } from "node:crypto";
import { runSwarm, type AgentRunner, type SwarmResult, type SwarmSummary } from "./swarm.js";
import type { AgentExecutor } from "./types.js";
import { boundedText, positiveInteger, withAbort } from "./federation/boundary.js";
import type { FederatedRuntime } from "./federation/runtime.js";

export { FederatedRuntime } from "./federation/runtime.js";
export type { FederatedRuntimeOptions, FederatedTaskResult, FederatedRunSummary } from "./federation/runtime.js";

export { createA2ARunner } from "./federation/a2a.js";
export type { A2ARunnerOptions } from "./federation/a2a.js";
export { createMcpToolRunner } from "./federation/mcp.js";
export type { McpToolCaller, McpToolRunnerOptions } from "./federation/mcp.js";
export { createProcessRunner } from "./federation/process.js";
export type { ProcessRunnerOptions } from "./federation/process.js";

export interface FederationWorker {
  id: string;
  transport: "a2a-0.3" | "mcp" | "process" | "custom";
  capabilities: readonly string[];
  runner: AgentRunner;
}

export interface FederationTask {
  id: string;
  prompt: string;
  capability: string;
  /** Required when more than one registered worker matches the capability. */
  workerId?: string;
}

export interface FederationRoute {
  taskId: string;
  workerId: string;
  capability: string;
  transport: FederationWorker["transport"];
}

export interface FederationLimits {
  concurrency?: number;
  timeoutMs?: number;
  maxTasks?: number;
  maxPromptBytes?: number;
  maxOutputBytes?: number;
}

export interface FederationResult extends SwarmResult {
  route: FederationRoute;
}

export interface FederationSummary extends SwarmSummary {
  runId: string;
  results: FederationResult[];
}

/** Register this definition/handler with the host's MCP SDK; the host owns auth and transport. */
export function createFederationTool(federation: AgentFederation | FederatedRuntime) {
  const definition = {
    name: "sis_federate",
    description: "Plan or execute a bounded batch through operator-registered agent workers. Run results describe execution, not artifact verification.",
    inputSchema: {
      type: "object", additionalProperties: false, required: ["operation", "tasks"],
      properties: {
        operation: { type: "string", enum: ["plan", "run"] },
        tasks: { type: "array", items: {
          type: "object", additionalProperties: false, required: ["id", "prompt", "capability"],
          properties: { id: { type: "string" }, prompt: { type: "string" }, capability: { type: "string" }, workerId: { type: "string" } },
        } },
      },
    },
  };
  return {
    definition,
    async handle(input: unknown, signal?: AbortSignal) {
      try {
        if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid federation request");
        if (Object.keys(input).some(key => key !== "operation" && key !== "tasks")) throw new Error("Unknown federation request fields");
        const request = input as { operation: unknown; tasks: FederationTask[] };
        if (request.operation !== "plan" && request.operation !== "run") throw new Error("Explicit plan or run operation required");
        const result = request.operation === "plan"
          ? { routes: federation.plan(request.tasks) }
          : await federation.run(request.tasks, { signal });
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }], isError: "total" in result && result.succeeded !== result.total };
      } catch (error) {
        return { content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Federation request failed" }], isError: true };
      }
    },
  };
}

const identifier = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(value);

/**
 * Explicit worker registry over the existing swarm pool. Registration is trusted
 * operator configuration; task content cannot add endpoints, tools or commands.
 * This is an in-process execution bridge, not a scheduler or a sandbox.
 */
export class AgentFederation {
  private readonly workers = new Map<string, FederationWorker>();
  private readonly limits: Required<FederationLimits>;

  constructor(workers: readonly FederationWorker[], limits: FederationLimits = {}) {
    this.limits = {
      concurrency: positiveInteger(limits.concurrency ?? 2, "concurrency", 32),
      timeoutMs: positiveInteger(limits.timeoutMs ?? 60_000, "timeoutMs", 3_600_000),
      maxTasks: positiveInteger(limits.maxTasks ?? 32, "maxTasks", 1_000),
      maxPromptBytes: positiveInteger(limits.maxPromptBytes ?? 65_536, "maxPromptBytes", 1_048_576),
      maxOutputBytes: positiveInteger(limits.maxOutputBytes ?? 262_144, "maxOutputBytes", 4_194_304),
    };
    for (const worker of workers) {
      if (!identifier(worker.id) || this.workers.has(worker.id)) throw new Error("Invalid or duplicate worker id");
      if (!["a2a-0.3", "mcp", "process", "custom"].includes(worker.transport) || typeof worker.runner !== "function") {
        throw new Error(`Invalid worker: ${worker.id}`);
      }
      if (!Array.isArray(worker.capabilities) || !worker.capabilities.length || !worker.capabilities.every(identifier)) {
        throw new Error(`Invalid capabilities: ${worker.id}`);
      }
      this.workers.set(worker.id, { ...worker, capabilities: [...worker.capabilities] });
    }
  }

  /** Pure preflight: validates every task before any worker can be invoked. */
  plan(tasks: readonly FederationTask[]): FederationRoute[] {
    if (!Array.isArray(tasks) || tasks.length > this.limits.maxTasks) throw new Error("Task limit exceeded or invalid task list");
    const ids = new Set<string>();
    return tasks.map(task => {
      if (!task || !identifier(task.id) || ids.has(task.id)) throw new Error("Invalid or duplicate task id");
      ids.add(task.id);
      if (!identifier(task.capability)) throw new Error(`Invalid capability: ${task.id}`);
      if (!boundedText(task.prompt, "prompt", this.limits.maxPromptBytes).trim()) throw new Error("Prompt is empty");
      const matches = [...this.workers.values()].filter(worker =>
        worker.capabilities.includes(task.capability) && (task.workerId === undefined || worker.id === task.workerId));
      if (matches.length !== 1) throw new Error(`Task ${task.id} needs exactly one matching worker; found ${matches.length}`);
      return { taskId: task.id, workerId: matches[0].id, capability: task.capability, transport: matches[0].transport };
    });
  }

  async run(tasks: readonly FederationTask[], options: { signal?: AbortSignal } = {}): Promise<FederationSummary> {
    const routes = this.plan(tasks);
    const routeById = new Map(routes.map(route => [route.taskId, route]));
    // Snapshot caller input before the first await. Never send arbitrary context or vault contents.
    const inputs = tasks.map(({ id, prompt }) => ({ id, prompt }));
    const summary = await runSwarm(inputs, {
      concurrency: this.limits.concurrency,
      timeoutMs: this.limits.timeoutMs,
      runner: async (task, timeoutSignal) => {
        const controller = new AbortController();
        const abort = () => controller.abort();
        timeoutSignal.addEventListener("abort", abort, { once: true });
        options.signal?.addEventListener("abort", abort, { once: true });
        if (timeoutSignal.aborted || options.signal?.aborted) controller.abort();
        try {
          const worker = this.workers.get(routeById.get(task.id)!.workerId)!;
          const result = await withAbort(() => worker.runner(task, controller.signal), controller.signal);
          const output = boundedText(result.output, "worker output", this.limits.maxOutputBytes);
          if (result.exitCode !== null && !Number.isSafeInteger(result.exitCode)) throw new Error("Invalid worker exit code");
          return { output, exitCode: result.exitCode };
        } finally {
          timeoutSignal.removeEventListener("abort", abort);
          options.signal?.removeEventListener("abort", abort);
        }
      },
    });
    return {
      ...summary,
      runId: randomUUID(),
      results: summary.results.map(result => ({ ...result, route: routeById.get(result.id)! })),
    };
  }

  /** Plug into OrchestrationEngine.setExecutor(); only the explicit input is sent. */
  asExecutor(bindings: Readonly<Record<string, { capability: string; workerId?: string }>>): AgentExecutor {
    const mapping = new Map(Object.entries(bindings).map(([agent, binding]) => [agent, { ...binding }]));
    return async (agent, input) => {
      const binding = mapping.get(agent);
      if (!binding) throw new Error(`No federation binding for agent ${agent}`);
      const { results } = await this.run([{ id: randomUUID(), prompt: input, ...binding }]);
      if (!results[0].ok) throw new Error(results[0].error ?? `Worker exited with ${results[0].exitCode}`);
      return results[0].output;
    };
  }
}
