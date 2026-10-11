import { MAX_PAYLOAD_BYTES, WORKER_PROTOCOL, identifier, parseWorkerRequest, record,
  type WorkerResponse, type WorkerRuntime } from "./contracts.js";

/** Resolved only by the trusted host after OAuth identity and granted-scope verification. */
export interface ChatGptPlanConnection {
  accountId: string;
  accessToken: string;
  expiresAt: number;
  scopes: string[];
}

export interface ChatGptPlanModel { slug: string; displayName: string }
export interface ChatGptPlanUsage {
  taskId: string;
  runtimeId: string;
  responseId: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  evidence: "provider-reported" | "provider-usage-missing";
  cost: null;
}
export interface ChatGptPlanRuntime extends WorkerRuntime {
  /** Current account catalog, never a proof of inference entitlement. */
  listModels(signal: AbortSignal): Promise<ChatGptPlanModel[]>;
  invoke(request: unknown, signal: AbortSignal): Promise<WorkerResponse>;
}

class PlanError extends Error {
  constructor(readonly code: string) { super(`chatgpt_plan:${code}`); }
}
function fail(code: string): never { throw new PlanError(code); }
const bytes = (value: string) => Buffer.byteLength(value, "utf8");

function recoveryCode(value: unknown): string {
  if (value === "subscription_sharing_usage_limit_exceeded") return "usage_limit_manage_usage";
  if (value === "subscription_sharing_usage_unavailable") return "usage_unavailable_retry_later";
  return "provider_failed";
}

/** Text-only public Responses adapter. It supplies no tools, credential store or activation authority. */
export function createChatGptPlanRuntime(options: {
  id: string;
  accountId: string;
  model: string;
  resolveConnection: (signal: AbortSignal) => Promise<ChatGptPlanConnection>;
  instructions?: string;
  maxOutputBytes?: number;
  onUsage?: (usage: ChatGptPlanUsage) => void | Promise<void>;
  /** Host-owned transport for testing or network policy; task input cannot replace it. */
  transport?: typeof fetch;
}): ChatGptPlanRuntime {
  const { id, accountId, model, resolveConnection, instructions, onUsage, transport = fetch,
    maxOutputBytes = 32_768 } = options;
  if (!identifier(id) || !identifier(accountId) || !identifier(model) || typeof resolveConnection !== "function"
    || typeof transport !== "function" || (onUsage !== undefined && typeof onUsage !== "function")
    || (instructions !== undefined && (typeof instructions !== "string" || bytes(instructions) > 16_384))
    || !Number.isSafeInteger(maxOutputBytes) || maxOutputBytes < 1 || maxOutputBytes > 32_768) {
    fail("invalid_binding");
  }

  async function connection(signal: AbortSignal): Promise<ChatGptPlanConnection> {
    signal.throwIfAborted();
    let value: unknown;
    try { value = await resolveConnection(signal); }
    catch { fail("connection_unavailable"); }
    signal.throwIfAborted();
    if (!record(value)) fail("connection_or_consent_required");
    const { accessToken, expiresAt, scopes } = value;
    if (value.accountId !== accountId || typeof accessToken !== "string"
      || !/^[A-Za-z0-9._~-]{1,16384}$/.test(accessToken)
      || typeof expiresAt !== "number" || !Number.isFinite(expiresAt) || expiresAt <= Date.now()
      || !Array.isArray(scopes) || !scopes.every(scope => typeof scope === "string")
      || !["resource.invoke", "chatgpt.tokens.use.direct"].every(scope => scopes.includes(scope))) {
      fail("connection_or_consent_required");
    }
    return { accountId, accessToken, expiresAt, scopes: [...scopes] };
  }

  async function send(path: "models" | "responses", credential: ChatGptPlanConnection,
    signal: AbortSignal, body?: string): Promise<Response> {
    signal.throwIfAborted();
    if (credential.expiresAt <= Date.now()) fail("connection_or_consent_required");
    let response: Response;
    try {
      response = await transport(`https://api.openai.com/v1/${path}`, {
        method: body === undefined ? "GET" : "POST", redirect: "error", signal,
        headers: { authorization: `Bearer ${credential.accessToken}`,
          accept: body === undefined ? "application/json" : "text/event-stream",
          ...(body === undefined ? {} : { "content-type": "application/json" }) },
        ...(body === undefined ? {} : { body }),
      });
    } catch { fail("transport_unknown"); }
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      if (response.status === 401) fail("reauth_required");
      if (response.status === 403) fail("access_denied");
      if (response.status === 429) fail("usage_or_rate_limit");
      // A server or transport failure after POST is not proof that inference never started.
      fail("http_unknown");
    }
    return response;
  }

  async function models(credential: ChatGptPlanConnection, signal: AbortSignal): Promise<ChatGptPlanModel[]> {
    const response = await send("models", credential, signal);
    const data = await readJson(response, signal);
    if (!record(data) || !Array.isArray(data.models)) fail("invalid_catalog");
    const result: ChatGptPlanModel[] = [];
    const seen = new Set<string>();
    for (const item of data.models) {
      if (!record(item)) fail("invalid_catalog");
      if (item.visibility !== "list") continue;
      if (!identifier(item.slug) || typeof item.display_name !== "string" || !item.display_name.trim()
        || item.display_name.length > 256 || seen.has(item.slug)) fail("invalid_catalog");
      seen.add(item.slug);
      result.push({ slug: item.slug, displayName: item.display_name });
    }
    return result;
  }

  return {
    id,
    async listModels(signal) { return models(await connection(signal), signal); },
    async invoke(value, signal) {
      const request = parseWorkerRequest(value);
      signal.throwIfAborted();
      let dispatched = false;
      try {
        const credential = await connection(signal);
        const catalog = await models(credential, signal);
        if (!catalog.some(item => item.slug === model)) fail("selected_model_unavailable");
        const current = await connection(signal);
        if (current.accessToken !== credential.accessToken) fail("connection_changed");
        // Worker context is intentionally excluded. Host instructions and explicit user text alone cross the boundary.
        const body = JSON.stringify({ model, input: [{ role: "user", content: request.input }],
          ...(instructions === undefined ? {} : { instructions }), store: false, stream: true });
        dispatched = true;
        const response = await send("responses", current, signal, body);
        const terminal = await readInference(response, signal, maxOutputBytes);
        if (terminal.failure) fail(terminal.failure);
        if (onUsage) {
          try { await onUsage({ taskId: request.taskId, runtimeId: id, ...terminal.usage! }); }
          catch { fail("usage_observation_failed"); }
        }
        return { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "completed", output: terminal.text! };
      } catch (error) {
        signal.throwIfAborted();
        const safe = error instanceof PlanError ? error : new PlanError("protocol_unknown");
        const knownFailure = ["reauth_required", "access_denied", "usage_or_rate_limit", "usage_limit_manage_usage",
          "usage_unavailable_retry_later", "provider_failed", "response_incomplete", "provider_refused"];
        if (!dispatched || knownFailure.includes(safe.code)) {
          return { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "failed", error: safe.message };
        }
        // Throwing retains the existing bridge's unknown/paused state. Never silently retry or switch billing.
        throw safe;
      }
    },
  };
}

async function readJson(response: Response, signal: AbortSignal): Promise<unknown> {
  if (!response.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    await response.body?.cancel().catch(() => {});
    fail("invalid_catalog");
  }
  const reader = response.body?.getReader();
  if (!reader) fail("invalid_catalog");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_PAYLOAD_BYTES) fail("invalid_catalog");
      chunks.push(next.value);
    }
    signal.throwIfAborted();
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { fail("invalid_catalog"); }
  finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

type Inference = { text?: string; failure?: string; usage?: Omit<ChatGptPlanUsage, "taskId" | "runtimeId"> };

async function readInference(response: Response, signal: AbortSignal, maxOutputBytes: number): Promise<Inference> {
  if (!response.headers.get("content-type")?.toLowerCase().startsWith("text/event-stream")) {
    await response.body?.cancel().catch(() => {});
    fail("protocol_unknown");
  }
  const reader = response.body?.getReader();
  if (!reader) fail("protocol_unknown");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const deltas = new Map<string, string>();
  let deltaBytes = 0;
  let received = 0;
  let buffer = "";
  let terminal: Inference | undefined;
  let responseId: string | undefined;

  function consume(frame: string) {
    if (bytes(frame) > MAX_PAYLOAD_BYTES) fail("stream_limit_unknown");
    const payload = frame.split(/\r\n|\r|\n/).filter(line => line.startsWith("data:"))
      .map(line => line.slice(5).replace(/^ /, "")).join("\n");
    if (!payload) return;
    if (payload === "[DONE]") { if (!terminal) fail("terminal_missing"); return; }
    if (terminal) fail("multiple_terminal_events");
    const event: unknown = JSON.parse(payload);
    if (!record(event) || typeof event.type !== "string") fail("protocol_unknown");
    if (event.type === "response.created") {
      if (!record(event.response) || !identifier(event.response.id) || responseId) fail("protocol_unknown");
      responseId = event.response.id;
    }
    if (event.type === "response.output_text.delta") {
      if (typeof event.delta !== "string" || !Number.isSafeInteger(event.output_index) || !Number.isSafeInteger(event.content_index)
        || (event.output_index as number) < 0 || (event.content_index as number) < 0) fail("protocol_unknown");
      deltaBytes += bytes(event.delta);
      if (deltaBytes > maxOutputBytes) fail("output_limit_unknown");
      const key = `${event.output_index}:${event.content_index}`;
      deltas.set(key, (deltas.get(key) ?? "") + event.delta);
    }
    if (event.type === "response.failed") {
      const code = record(event.response) && record(event.response.error) ? event.response.error.code : undefined;
      terminal = { failure: recoveryCode(code) };
    }
    if (event.type === "error") terminal = { failure: recoveryCode(event.code) };
    if (event.type === "response.incomplete") terminal = { failure: "response_incomplete" };
    if (event.type === "response.completed") {
      const result = event.response;
      if (!record(result) || result.status !== "completed" || !identifier(result.id) || !identifier(result.model)
        || (responseId !== undefined && responseId !== result.id) || !Array.isArray(result.output)) fail("protocol_unknown");
      const parts: string[] = [];
      const observed = new Set<string>();
      result.output.forEach((item: unknown, outputIndex: number) => {
        if (!record(item)) fail("protocol_unknown");
        if (item.type === "reasoning") return;
        if (item.type !== "message" || !Array.isArray(item.content)) fail("unsupported_output_unknown");
        item.content.forEach((content: unknown, contentIndex: number) => {
          if (record(content) && content.type === "refusal") fail("provider_refused");
          if (!record(content) || content.type !== "output_text" || typeof content.text !== "string") fail("protocol_unknown");
          const key = `${outputIndex}:${contentIndex}`;
          if (deltas.has(key) && deltas.get(key) !== content.text) fail("output_mismatch_unknown");
          observed.add(key);
          parts.push(content.text);
        });
      });
      if ([...deltas.keys()].some(key => !observed.has(key))) fail("output_mismatch_unknown");
      const text = parts.join("\n");
      if (!text.trim()) fail("empty_output_unknown");
      if (bytes(text) > maxOutputBytes) fail("output_limit_unknown");
      let usage: Pick<ChatGptPlanUsage, "inputTokens" | "outputTokens" | "totalTokens" | "evidence"> = {
        inputTokens: null, outputTokens: null, totalTokens: null, evidence: "provider-usage-missing",
      };
      if (result.usage !== undefined && result.usage !== null) {
        const counts = result.usage;
        if (!record(counts) || ![counts.input_tokens, counts.output_tokens, counts.total_tokens]
          .every(count => Number.isSafeInteger(count) && (count as number) >= 0)
          || counts.total_tokens !== (counts.input_tokens as number) + (counts.output_tokens as number)) fail("invalid_usage");
        usage = { inputTokens: counts.input_tokens as number, outputTokens: counts.output_tokens as number,
          totalTokens: counts.total_tokens as number, evidence: "provider-reported" };
      }
      terminal = { text, usage: { responseId: result.id, model: result.model, ...usage, cost: null } };
    }
  }

  try {
    while (true) {
      signal.throwIfAborted();
      const chunk = await reader.read();
      if (chunk.done) { buffer += decoder.decode(); break; }
      received += chunk.value.byteLength;
      if (received > 2_097_152) fail("stream_limit_unknown");
      buffer += decoder.decode(chunk.value, { stream: true });
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r\n\r\n|\n\n|\r\r/.exec(buffer))) {
        consume(buffer.slice(0, boundary.index));
        buffer = buffer.slice(boundary.index + boundary[0].length);
      }
      if (bytes(buffer) > MAX_PAYLOAD_BYTES) fail("stream_limit_unknown");
    }
    signal.throwIfAborted();
    if (buffer.trim()) fail("truncated_event_unknown");
    if (!terminal) fail("terminal_missing");
    return terminal;
  } catch (error) { throw error instanceof PlanError ? error : new PlanError("stream_unknown"); }
  finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
