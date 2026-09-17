import { randomUUID } from "node:crypto";
import type { AgentRunner } from "../swarm.js";
import { boundedText, pause, positiveInteger, withAbort } from "./boundary.js";

export interface A2ARunnerOptions {
  /** Operator-selected JSON-RPC endpoint implementing A2A 0.3.0. */
  endpoint: string;
  headers?: () => Record<string, string>;
  allowLoopbackHttp?: boolean;
  pollIntervalMs?: number;
  maxPolls?: number;
  maxResponseBytes?: number;
  fetch?: typeof fetch;
  /** Persist these IDs externally if the operator needs to inspect a remote job. */
  onTask?: (reference: { localTaskId: string; remoteTaskId: string; contextId: string }) => void | Promise<void>;
}

type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid A2A object");
  return value as RecordValue;
}

async function readResponse(response: Response, maxBytes: number): Promise<unknown> {
  if (!response.body) throw new Error("Empty A2A response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) throw new Error("A2A response exceeds byte limit");
      chunks.push(chunk.value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw new Error("Invalid A2A JSON response"); }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

function textParts(value: unknown): string {
  if (!Array.isArray(value) || !value.length) throw new Error("A2A text parts required");
  return value.map(part => {
    const item = record(part);
    if (item.kind !== "text" || typeof item.text !== "string") throw new Error("Unsupported A2A part; text is required");
    return item.text;
  }).join("\n");
}

function agentMessage(value: unknown): string {
  const message = record(value);
  if (message.kind !== "message" || message.role !== "agent" || typeof message.messageId !== "string") {
    throw new Error("Invalid A2A agent message");
  }
  return textParts(message.parts);
}

/** Text-only, non-streaming A2A 0.3 JSON-RPC client. No discovery or submission retries. */
export function createA2ARunner(options: A2ARunnerOptions): AgentRunner {
  const endpoint = new URL(options.endpoint);
  const loopback = ["127.0.0.1", "[::1]"].includes(endpoint.hostname);
  if (endpoint.username || endpoint.password || endpoint.hash || endpoint.search ||
      (endpoint.protocol !== "https:" && !(options.allowLoopbackHttp && loopback && endpoint.protocol === "http:"))) {
    throw new Error("A2A endpoint requires HTTPS without credentials/query/fragment, or explicitly allowed loopback HTTP");
  }
  const pollMs = positiveInteger(options.pollIntervalMs ?? 1_000, "pollIntervalMs", 60_000);
  const maxPolls = positiveInteger(options.maxPolls ?? 120, "maxPolls", 10_000);
  const maxBytes = positiveInteger(options.maxResponseBytes ?? 262_144, "maxResponseBytes", 4_194_304);
  const send = options.fetch ?? fetch;
  const headers = options.headers;
  const onTask = options.onTask;

  async function rpc(method: string, params: unknown, signal: AbortSignal): Promise<RecordValue> {
    const id = randomUUID();
    return withAbort(async () => {
      let response: Response;
      try {
        const requestHeaders = new Headers(headers?.());
        requestHeaders.set("Content-Type", "application/json");
        requestHeaders.set("Accept", "application/json");
        response = await send(endpoint, {
          method: "POST", headers: requestHeaders, redirect: "error", signal,
          body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
        });
      } catch {
        // Provider/transport exception strings can contain authenticated URLs or credentials.
        throw new Error("A2A transport failed; remote execution state may be unknown");
      }
      if (!response.ok) {
        await response.body?.cancel().catch(() => undefined);
        throw new Error(`A2A HTTP ${response.status}; no automatic retry`);
      }
      const envelope = record(await readResponse(response, maxBytes));
      if (envelope.jsonrpc !== "2.0" || envelope.id !== id ||
          (Object.hasOwn(envelope, "result") === Object.hasOwn(envelope, "error"))) {
        throw new Error("Invalid A2A JSON-RPC response envelope");
      }
      if (envelope.error) {
        const code = record(envelope.error).code;
        throw new Error(`A2A RPC error ${typeof code === "number" ? code : "unknown"}`);
      }
      return record(envelope.result);
    }, signal);
  }

  return async (task, signal) => {
    boundedText(task.prompt, "prompt", 1_048_576);
    let result = await rpc("message/send", {
      message: { kind: "message", role: "user", messageId: randomUUID(), parts: [{ kind: "text", text: task.prompt }] },
      configuration: { acceptedOutputModes: ["text/plain"], blocking: false, historyLength: 0 },
    }, signal);
    if (result.kind === "message") return { output: agentMessage(result), exitCode: 0 };
    let remoteId: string | undefined;
    let remoteContext: string | undefined;
    for (let polls = 0; ; polls++) {
      if (result.kind !== "task" || typeof result.id !== "string" || !result.id ||
          typeof result.contextId !== "string" || !result.contextId) throw new Error("Invalid A2A task response");
      if (remoteId && (result.id !== remoteId || result.contextId !== remoteContext)) throw new Error("A2A task identity changed during polling");
      if (!remoteId) {
        remoteId = result.id;
        remoteContext = result.contextId;
        try {
          const reference = { localTaskId: task.id, remoteTaskId: remoteId, contextId: remoteContext };
          await withAbort(() => Promise.resolve(onTask?.(reference)), signal);
        } catch {
          throw new Error("A2A task reference could not be persisted; remote execution state may be unknown");
        }
      }
      const status = record(result.status);
      if (status.state === "completed") {
        const artifacts = result.artifacts;
        if (Array.isArray(artifacts) && artifacts.length) {
          return { output: artifacts.map(artifact => textParts(record(artifact).parts)).join("\n"), exitCode: 0 };
        }
        if (status.message) return { output: agentMessage(status.message), exitCode: 0 };
        throw new Error("A2A task completed without text output");
      }
      if (["canceled", "failed", "rejected"].includes(String(status.state))) {
        // A matching terminal task establishes failure, not an unresolved remote effect.
        // Keep provider diagnostics out of the returned execution result.
        return { output: "A2A task ended without successful completion", exitCode: 1 };
      }
      if (status.state !== "submitted" && status.state !== "working") {
        const known = ["input-required", "auth-required", "unknown"];
        throw new Error(`A2A task stopped: ${known.includes(String(status.state)) ? status.state : "invalid state"}`);
      }
      if (polls >= maxPolls) throw new Error("A2A polling limit reached; remote task may still be running");
      await pause(pollMs, signal);
      result = await rpc("tasks/get", { id: remoteId, historyLength: 0 }, signal);
    }
  };
}
