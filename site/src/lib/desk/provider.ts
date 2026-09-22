/**
 * The model call. One function, one shape, no SDK.
 *
 * Token Factory speaks the OpenAI-compatible chat-completions dialect, so a
 * plain `fetch` reaches it with zero dependencies: nothing to install on the
 * day, nothing to break in a lockfile, and `fetch` is injectable so every
 * stage above this file is testable without a key or a network.
 *
 * Built on SIP — operational tier.
 */

/** Where Token Factory listens. Override per environment; confirm in the console before the day. */
export const DEFAULT_BASE_URL = "https://api.studio.nebius.com/v1";
/** A stage that has not answered in this long is a stage that will not save the demo. */
export const DEFAULT_TIMEOUT_MS = 45_000;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Ask for a JSON object back. The caller still validates what arrives. */
  json?: boolean;
  timeoutMs?: number;
}

export interface ChatResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** Wall clock, injectable so tests can assert latency without sleeping. */
  now?: () => number;
}

export class ProviderError extends Error {
  readonly status: number;
  readonly retryable: boolean;
  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.retryable = retryable;
  }
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * One chat completion. Retries once on a throttle or a server fault, because a
 * single retry is the difference between a stage that stalls on stage and a
 * stage that arrives a second late. Anything else surfaces immediately.
 */
export async function chat(request: ChatRequest, config: ProviderConfig): Promise<ChatResult> {
  const attempt = () => chatOnce(request, config);
  try {
    return await attempt();
  } catch (error) {
    if (error instanceof ProviderError && error.retryable) return attempt();
    throw error;
  }
}

async function chatOnce(request: ChatRequest, config: ProviderConfig): Promise<ChatResult> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const now = config.now ?? (() => Date.now());
  const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const controller = new AbortController();
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = now();

  try {
    const response = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 2048,
        ...(request.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    const latencyMs = Math.max(0, now() - startedAt);

    if (!response.ok) {
      const detail = await safeText(response);
      throw new ProviderError(
        `${request.model} answered ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        response.status,
        isRetryable(response.status),
      );
    }

    const payload: unknown = await response.json().catch(() => null);
    const text = extractText(payload);
    if (text === null) {
      throw new ProviderError(`${request.model} returned no message content`, 502, false);
    }

    const usage = extractUsage(payload);
    return { text, inputTokens: usage.input, outputTokens: usage.output, latencyMs, model: request.model };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderError(`${request.model} did not answer within ${timeoutMs} ms`, 408, true);
    }
    throw new ProviderError(`${request.model} call failed: ${error instanceof Error ? error.message : String(error)}`, 0, true);
  } finally {
    clearTimeout(timer);
  }
}

async function safeText(response: { text(): Promise<string> }): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function extractText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;
  const content = (message as { content?: unknown }).content;
  return typeof content === "string" ? content : null;
}

function extractUsage(payload: unknown): { input: number; output: number } {
  const usage = payload && typeof payload === "object" ? (payload as { usage?: unknown }).usage : null;
  if (!usage || typeof usage !== "object") return { input: 0, output: 0 };
  const record = usage as Record<string, unknown>;
  return {
    input: numberOr(record.prompt_tokens, 0),
    output: numberOr(record.completion_tokens, 0),
  };
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}
