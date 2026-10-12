import { createHash, randomUUID } from "node:crypto";
import type { AgentExecutor } from "../types.js";
import {
  WORKER_PROTOCOL, identifier, parseWorkerRequest, parseWorkerResponse, record,
  type WorkerRequest, type WorkerRuntime,
} from "./contracts.js";

export interface RuntimeReceipt {
  taskId: string;
  agent: string;
  runtimeId: string;
  status: "completed" | "failed" | "unknown";
  startedAt: number;
  finishedAt: number;
  output?: string;
  /** Fixed local code: provider errors and credentials never enter observations. */
  errorCode?: "worker-failed" | "invalid-response" | "transport-error" | "timeout" | "aborted";
}

export interface RuntimeBridgeOptions {
  runtimes: WorkerRuntime[];
  /** Exact agent-to-runtime bindings, supplied by the host, never by task context. */
  routes: Record<string, string>;
  maxConcurrency: number;
  /** Lifetime submission ceiling and deduplication storage bound for this bridge. */
  maxRuns: number;
  timeoutMs: number;
  /** Opt in to individual context fields crossing a runtime boundary. Default: none. */
  contextKeys?: string[];
}

type Entry = { fingerprint: string; result: Promise<RuntimeReceipt>; receipt?: RuntimeReceipt };

/** A bounded execution adapter for SIS. Durable admission remains with the host. */
export class RuntimeBridge {
  private readonly runtimes = new Map<string, WorkerRuntime>();
  private readonly routes: Map<string, string>;
  private readonly entries = new Map<string, Entry>();
  private readonly paused = new Set<string>();
  private readonly contextKeys: string[];
  private readonly maxConcurrency: number;
  private readonly maxRuns: number;
  private readonly timeoutMs: number;
  private active = 0;
  // Unknown external work still occupies admission capacity after local waiting ends.
  private reserved = 0;

  constructor(options: RuntimeBridgeOptions) {
    for (const [key, maximum] of [["maxConcurrency", 64], ["maxRuns", 10_000], ["timeoutMs", 300_000]] as const) {
      if (!Number.isSafeInteger(options[key]) || options[key] < 1 || options[key] > maximum) {
        throw new Error(`Invalid ${key}: expected integer from 1 to ${maximum}`);
      }
    }
    this.maxConcurrency = options.maxConcurrency;
    this.maxRuns = options.maxRuns;
    this.timeoutMs = options.timeoutMs;
    for (const runtime of options.runtimes) {
      if (!identifier(runtime.id) || typeof runtime.invoke !== "function" || this.runtimes.has(runtime.id)) {
        throw new Error("Invalid or duplicate runtime");
      }
      // Capture the binding so caller mutation cannot change routing mid-run.
      this.runtimes.set(runtime.id, { id: runtime.id, invoke: runtime.invoke.bind(runtime) });
    }
    this.routes = new Map(Object.entries(options.routes));
    for (const [agent, runtimeId] of this.routes) {
      if (!identifier(agent) || !this.runtimes.has(runtimeId)) throw new Error("Invalid runtime route");
    }
    this.contextKeys = [...new Set(options.contextKeys ?? [])];
    if (this.contextKeys.some(key => !identifier(key))) throw new Error("Invalid context key");
  }

  /** Duplicate task IDs reuse their result; changed payloads with the same ID are rejected. */
  async run(value: unknown, signal?: AbortSignal): Promise<RuntimeReceipt> {
    const supplied = parseWorkerRequest(value);
    const request: WorkerRequest = {
      ...supplied,
      context: Object.fromEntries(this.contextKeys.filter(key => Object.hasOwn(supplied.context, key))
        .map(key => [key, supplied.context[key]])),
    };
    // Fingerprint the supplied task, including fields omitted from outbound context.
    const canonical = JSON.stringify(supplied, (_key, value: unknown) => record(value)
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value);
    const fingerprint = createHash("sha256").update(canonical).digest("hex");
    const previous = this.entries.get(request.taskId);
    if (previous) {
      if (previous.fingerprint !== fingerprint) throw new Error("Task ID already bound to another payload");
      return { ...await previous.result };
    }
    if (signal?.aborted) throw new Error("Task aborted before dispatch");
    const runtimeId = this.routes.get(request.agent);
    const runtime = runtimeId ? this.runtimes.get(runtimeId) : undefined;
    if (!runtime) throw new Error("No explicit runtime route for agent");
    if (this.paused.has(runtime.id)) throw new Error("Runtime paused: authoritative host reconciliation required");
    if (this.entries.size >= this.maxRuns) throw new Error("Bridge submission ceiling reached");
    if (this.reserved >= this.maxConcurrency) throw new Error("Bridge concurrency capacity reached");

    this.active += 1;
    this.reserved += 1;
    // Defer invocation until the deduplication entry has been registered.
    const entry: Entry = {
      fingerprint,
      result: Promise.resolve().then(() => this.invoke(runtime, request, signal)),
    };
    this.entries.set(request.taskId, entry);
    const receipt = await entry.result;
    entry.receipt = receipt;
    return { ...receipt };
  }

  /** Drop-in callback for OrchestrationEngine.setExecutor(). */
  asExecutor(): AgentExecutor {
    return async (agent, input, context) => {
      const receipt = await this.run({ protocol: WORKER_PROTOCOL, taskId: randomUUID(), agent, input, context });
      if (receipt.status !== "completed") throw new Error(`Runtime ${receipt.status}: ${receipt.errorCode}`);
      return receipt.output!;
    };
  }

  /** Prompt-free read model for the existing Observatory, API, or overlay. */
  snapshot() {
    return {
      observedAt: Date.now(),
      durability: "process-local" as const,
      activeCalls: this.active,
      reservedCalls: this.reserved,
      unresolvedCalls: this.reserved - this.active,
      remainingCapacity: this.maxConcurrency - this.reserved,
      submitted: this.entries.size,
      remainingSubmissions: this.maxRuns - this.entries.size,
      pausedRuntimes: [...this.paused],
      runs: [...this.entries].map(([taskId, entry]) => entry.receipt
        ? { taskId, agent: entry.receipt.agent, runtimeId: entry.receipt.runtimeId,
          status: entry.receipt.status, startedAt: entry.receipt.startedAt,
          finishedAt: entry.receipt.finishedAt, errorCode: entry.receipt.errorCode }
        : { taskId, status: "running" as const }),
    };
  }

  private async invoke(runtime: WorkerRuntime, request: WorkerRequest, parent?: AbortSignal): Promise<RuntimeReceipt> {
    const startedAt = Date.now();
    const controller = new AbortController();
    let interruption: "timeout" | "aborted" = "aborted";
    const abort = () => controller.abort();
    const timer = setTimeout(() => { interruption = "timeout"; abort(); }, this.timeoutMs);
    parent?.addEventListener("abort", abort, { once: true });
    let removeAbort = () => {};
    const interrupted = new Promise<never>((_, reject) => {
      const rejectAbort = () => reject(new Error("Runtime interrupted"));
      controller.signal.addEventListener("abort", rejectAbort, { once: true });
      removeAbort = () => controller.signal.removeEventListener("abort", rejectAbort);
    });
    if (parent?.aborted) abort();
    let receipt: RuntimeReceipt;
    try {
      const work = Promise.resolve().then(() => {
        if (controller.signal.aborted) throw new Error("Runtime interrupted");
        return runtime.invoke(request, controller.signal);
      });
      const raw = await Promise.race([work, interrupted]);
      try {
        const response = parseWorkerResponse(raw, request.taskId);
        receipt = { taskId: request.taskId, agent: request.agent, runtimeId: runtime.id,
          startedAt, finishedAt: Date.now(), status: response.status,
          ...(response.status === "completed" ? { output: response.output } : { errorCode: "worker-failed" as const }) };
      } catch {
        receipt = this.unknown(request, runtime.id, startedAt, "invalid-response");
      }
    } catch {
      receipt = this.unknown(request, runtime.id, startedAt,
        controller.signal.aborted ? interruption : "transport-error");
    } finally {
      clearTimeout(timer);
      parent?.removeEventListener("abort", abort);
      removeAbort();
      this.active -= 1;
    }
    if (receipt.status === "unknown") this.paused.add(runtime.id);
    else this.reserved -= 1;
    return receipt;
  }

  private unknown(request: WorkerRequest, runtimeId: string, startedAt: number,
    errorCode: RuntimeReceipt["errorCode"]): RuntimeReceipt {
    return { taskId: request.taskId, agent: request.agent, runtimeId, startedAt,
      finishedAt: Date.now(), status: "unknown", errorCode };
  }
}
