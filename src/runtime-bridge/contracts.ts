/** Operational worker contract; this is not the A2A or MCP wire protocol. */
export const WORKER_PROTOCOL = "starlight.worker.v1" as const;
export const MAX_PAYLOAD_BYTES = 65_536;

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface WorkerRequest {
  protocol: typeof WORKER_PROTOCOL;
  taskId: string;
  agent: string;
  input: string;
  context: { [key: string]: JsonValue };
}

export type WorkerResponse = {
  protocol: typeof WORKER_PROTOCOL;
  taskId: string;
  status: "completed";
  output: string;
} | {
  protocol: typeof WORKER_PROTOCOL;
  taskId: string;
  status: "failed";
  error: string;
};

/** Bootstrap-owned implementation. Registering it does not grant tool or spend authority. */
export interface WorkerRuntime {
  readonly id: string;
  invoke(request: WorkerRequest, signal: AbortSignal): Promise<unknown>;
}

export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function json(value: unknown, depth = 0): boolean {
  if (depth > 20) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(item => json(item, depth + 1));
  return record(value) && Object.values(value).every(item => json(item, depth + 1));
}

export function identifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(value);
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

export function boundedJson(value: unknown): string {
  if (!json(value)) throw new Error("Expected plain JSON with finite numbers and depth at most 20");
  const encoded = JSON.stringify(value);
  if (Buffer.byteLength(encoded, "utf8") > MAX_PAYLOAD_BYTES) throw new Error("Worker payload exceeds 64 KiB");
  return encoded;
}

export function parseWorkerRequest(value: unknown): WorkerRequest {
  if (!record(value) || !exactKeys(value, ["protocol", "taskId", "agent", "input", "context"])
    || value.protocol !== WORKER_PROTOCOL || !identifier(value.taskId) || !identifier(value.agent)
    || typeof value.input !== "string" || !value.input.trim() || !record(value.context)) {
    throw new Error("Invalid worker request");
  }
  return JSON.parse(boundedJson(value)) as WorkerRequest;
}

export function parseWorkerResponse(value: unknown, taskId: string): WorkerResponse {
  if (!record(value) || value.protocol !== WORKER_PROTOCOL || value.taskId !== taskId
    || !identifier(value.taskId)) throw new Error("Worker response identity mismatch");
  const completed = value.status === "completed" && typeof value.output === "string"
    && exactKeys(value, ["protocol", "taskId", "status", "output"]);
  const failed = value.status === "failed" && typeof value.error === "string"
    && value.error.trim().length > 0 && exactKeys(value, ["protocol", "taskId", "status", "error"]);
  if (!completed && !failed) throw new Error("Invalid worker response");
  return JSON.parse(boundedJson(value)) as WorkerResponse;
}
