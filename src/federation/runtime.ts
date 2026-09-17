import { randomUUID } from "node:crypto";
import { AgentFederation, type FederationLimits, type FederationRoute, type FederationTask,
  type FederationWorker } from "../federation.js";
import { RuntimeBridge, WORKER_PROTOCOL, parseWorkerRequest,
  type RuntimeReceipt, type WorkerRequest } from "../runtime-bridge/index.js";
import type { AgentExecutor } from "../types.js";
import { boundedText, positiveInteger } from "./boundary.js";

export interface FederatedRuntimeOptions extends FederationLimits {
  /** Process-lifetime ceiling, including failed and unknown submissions. */
  maxRuns?: number;
}

export type FederatedTaskResult = { id: string; route: FederationRoute } & (RuntimeReceipt | {
  taskId: string;
  status: "rejected";
  errorCode: "admission-rejected";
});

export interface FederatedRunSummary {
  runId: string;
  total: number;
  succeeded: number;
  failed: number;
  unknown: number;
  rejected: number;
  results: FederatedTaskResult[];
}

type PreparedTask = { route: FederationRoute; request: WorkerRequest };

/**
 * Preferred process-local entry point: pure capability routing plus one lifecycle
 * owner for deduplication, deadlines and capacity across concurrent batches.
 * The host still owns durable admission, credentials, monetary budgets and recovery.
 */
export class FederatedRuntime {
  private readonly router: AgentFederation;
  private readonly bridge: RuntimeBridge;
  private readonly concurrency: number;

  constructor(workers: readonly FederationWorker[], options: FederatedRuntimeOptions = {}) {
    this.router = new AgentFederation(workers, options);
    this.concurrency = positiveInteger(options.concurrency ?? 2, "concurrency", 32);
    const maxOutputBytes = positiveInteger(options.maxOutputBytes ?? 262_144, "maxOutputBytes", 4_194_304);
    this.bridge = new RuntimeBridge({
      maxConcurrency: this.concurrency,
      maxRuns: options.maxRuns ?? 1_000,
      timeoutMs: options.timeoutMs ?? 60_000,
      routes: Object.fromEntries(workers.map(worker => [worker.id, worker.id])),
      // Capability enters the task fingerprint but never the outbound context.
      contextKeys: [],
      runtimes: workers.map(worker => {
        const runner = worker.runner;
        return { id: worker.id, async invoke(request, signal) {
          const result = await runner({ id: request.taskId, prompt: request.input }, signal);
          const output = boundedText(result.output, "worker output", maxOutputBytes);
          if (!Number.isSafeInteger(result.exitCode)) throw new Error("Invalid worker exit code");
          return result.exitCode === 0
            ? { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "completed", output }
            : { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "failed", error: "Worker reported failure" };
        } };
      }),
    });
  }

  /** Validate the whole outbound contract without dispatch or reservation. */
  plan(tasks: readonly FederationTask[]): FederationRoute[] {
    return this.prepare(tasks).map(item => ({ ...item.route }));
  }

  async submit(task: FederationTask, signal?: AbortSignal): Promise<FederatedTaskResult> {
    return this.invoke(this.prepare([task])[0], signal);
  }

  async run(tasks: readonly FederationTask[], options: { signal?: AbortSignal } = {}): Promise<FederatedRunSummary> {
    // Capture and validate every task before the first await or any external effect.
    const prepared = this.prepare(tasks);
    const runId = randomUUID();
    const results = new Array<FederatedTaskResult>(prepared.length);
    let cursor = 0;
    const consume = async () => {
      while (cursor < prepared.length) {
        const index = cursor++;
        results[index] = await this.invoke(prepared[index], options.signal);
      }
    };
    await Promise.all(Array.from({ length: Math.min(this.concurrency, prepared.length) }, consume));
    return { runId, total: results.length,
      succeeded: results.filter(item => item.status === "completed").length,
      failed: results.filter(item => item.status === "failed").length,
      unknown: results.filter(item => item.status === "unknown").length,
      rejected: results.filter(item => item.status === "rejected").length, results };
  }

  /** No prompts or artifacts. The host must still authorize access to operational IDs. */
  snapshot() { return this.bridge.snapshot(); }

  asExecutor(bindings: Readonly<Record<string, { capability: string; workerId?: string }>>): AgentExecutor {
    const mapping = new Map(Object.entries(bindings).map(([agent, binding]) => [agent, { ...binding }]));
    return async (agent, input) => {
      const binding = mapping.get(agent);
      if (!binding) throw new Error("No federation binding for agent");
      const result = await this.submit({ id: randomUUID(), prompt: input, ...binding });
      if (result.status !== "completed") throw new Error(`Federation ${result.status}: ${result.errorCode}`);
      return result.output!;
    };
  }

  private prepare(tasks: readonly FederationTask[]): PreparedTask[] {
    const routes = this.router.plan(tasks);
    return tasks.map((task, index) => {
      if (Object.keys(task).some(key => !["id", "prompt", "capability", "workerId"].includes(key))) {
        throw new Error("Unknown federation task fields");
      }
      const route = routes[index];
      return { route, request: parseWorkerRequest({ protocol: WORKER_PROTOCOL,
        taskId: task.id, agent: route.workerId, input: task.prompt, context: { capability: task.capability } }) };
    });
  }

  private async invoke(item: PreparedTask, signal?: AbortSignal): Promise<FederatedTaskResult> {
    try {
      const receipt = await this.bridge.run(item.request, signal);
      return { ...receipt, id: item.request.taskId, route: { ...item.route } };
    } catch {
      // Admission happens before dispatch. Transport failures are classified by RuntimeBridge.
      return { id: item.request.taskId, taskId: item.request.taskId, route: { ...item.route },
        status: "rejected", errorCode: "admission-rejected" };
    }
  }
}
