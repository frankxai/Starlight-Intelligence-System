import { MAX_PAYLOAD_BYTES, WORKER_PROTOCOL, boundedJson, identifier, record,
  type WorkerRequest, type WorkerRuntime } from "./contracts.js";

/** Bootstrap must own this endpoint and its credentials; task input cannot select a URL. */
export function createHttpWorkerRuntime(options: {
  id: string;
  endpoint: string;
  headers?: Record<string, string>;
  allowLoopbackHttp?: boolean;
}): WorkerRuntime {
  if (!identifier(options.id)) throw new Error("Invalid runtime ID");
  const endpoint = new URL(options.endpoint);
  const loopback = ["127.0.0.1", "[::1]"].includes(endpoint.hostname);
  if ((endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && loopback && options.allowLoopbackHttp))
    || endpoint.username || endpoint.password || endpoint.hash || endpoint.search) {
    throw new Error("Worker endpoint requires HTTPS or explicitly enabled loopback HTTP; no URL credentials, query, or fragment");
  }
  const url = endpoint.href;
  const headers = new Headers(options.headers);
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  return {
    id: options.id,
    async invoke(request, signal) {
      const response = await fetch(url, { method: "POST", headers,
        body: boundedJson(request), signal, redirect: "error" });
      if (!response.ok || !response.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
        await response.body?.cancel();
        throw new Error("Worker HTTP response rejected");
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Worker response body missing");
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_PAYLOAD_BYTES) {
            await reader.cancel();
            throw new Error("Worker response exceeds 64 KiB");
          }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); }
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    },
  };
}

/** Bind an already-connected official MCP client at host bootstrap. */
export type McpToolCaller = (
  params: { name: string; arguments: Record<string, unknown> }, signal: AbortSignal,
) => Promise<unknown>;

/** Invoke one host-selected MCP tool; arguments follow the operational worker envelope. */
export function createMcpWorkerRuntime(options: {
  id: string;
  tool: string;
  callTool: McpToolCaller;
  /** Text mode is only for tools whose successful response means completed work. */
  resultMode?: "worker-response" | "text";
  mapArguments?: (request: WorkerRequest) => Record<string, unknown>;
}): WorkerRuntime {
  if (!identifier(options.id) || !identifier(options.tool) || typeof options.callTool !== "function") {
    throw new Error("Invalid MCP runtime binding");
  }
  if (options.resultMode !== undefined && !["worker-response", "text"].includes(options.resultMode)) {
    throw new Error("Invalid MCP result mode");
  }
  const { id, tool, callTool, mapArguments, resultMode = "worker-response" } = options;
  return {
    id,
    async invoke(request, signal) {
      const args = mapArguments ? mapArguments(request) : { ...request };
      if (!record(args)) throw new Error("MCP arguments must be an object");
      const argumentsSnapshot = JSON.parse(boundedJson(args)) as Record<string, unknown>;
      const result = await callTool({ name: tool, arguments: argumentsSnapshot }, signal);
      if (!record(result) || Object.hasOwn(result, "task")
        || (result.isError !== undefined && typeof result.isError !== "boolean")) {
        throw new Error("Invalid MCP tool result");
      }
      if (result.isError === true) {
        return { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "failed", error: "MCP tool failed" };
      }
      // Structured results must satisfy WorkerResponse; the bridge checks task identity.
      if (result.structuredContent !== undefined) return result.structuredContent;
      if (resultMode !== "text") throw new Error("Structured worker response required");
      // Plain text is the synchronous tool's output, never an asynchronous task handle.
      if (!Array.isArray(result.content) || result.content.length === 0
        || result.content.some(item => !record(item) || item.type !== "text" || typeof item.text !== "string")) {
        throw new Error("MCP worker requires structured worker response or text-only content");
      }
      return { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "completed",
        output: result.content.map(item => item.text).join("\n") };
    },
  };
}
