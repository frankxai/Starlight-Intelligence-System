import {
  ElevenLabsIntegrationError,
  type ElevenLabsModelId,
  type ElevenLabsOutputFormat,
  type ElevenLabsVoiceSettings,
} from "./contracts.js";

export type ElevenLabsCredentialResolver = () => string | Promise<string>;

export interface ElevenLabsRetryPolicy {
  /** Maximum number of attempts including the initial call (default: 3, max: 5). */
  readonly maxAttempts?: number;
  /** Base backoff delay in milliseconds (default: 250). */
  readonly baseDelayMs?: number;
  /** Maximum backoff delay in milliseconds (default: 4000). */
  readonly maxDelayMs?: number;
  /** Optional deterministic or custom sleep hook for testing. */
  readonly sleep?: (delayMs: number) => Promise<void>;
}

export interface ElevenLabsClientOptions {
  /** Server-side credential resolver or explicit key. Defaults to reading process.env.ELEVENLABS_API_KEY at request time. */
  readonly apiKey?: string | ElevenLabsCredentialResolver;
  /** Base URL for the ElevenLabs API (default: https://api.elevenlabs.io). Must be HTTPS unless allowLoopbackHttp is true for 127.0.0.1/localhost. */
  readonly baseUrl?: string;
  readonly allowLoopbackHttp?: boolean;
  /** Per-attempt timeout in milliseconds (default: 30,000). */
  readonly timeoutMs?: number;
  /** Maximum response audio payload size in bytes (default: 25 MB). */
  readonly maxResponseBytes?: number;
  readonly retryPolicy?: ElevenLabsRetryPolicy;
  readonly fetchImplementation?: typeof fetch;
}

export interface ElevenLabsSynthesisHttpRequest {
  readonly voiceId: string;
  readonly modelId: ElevenLabsModelId;
  readonly outputFormat: ElevenLabsOutputFormat;
  readonly text: string;
  readonly languageCode?: string;
  readonly voiceSettings: ElevenLabsVoiceSettings;
  readonly idempotencyKey: string;
  readonly signal?: AbortSignal;
}

export interface ElevenLabsSynthesisHttpResponse {
  readonly audioBytes: Uint8Array;
  readonly contentType: string;
  readonly providerRequestId: string | null;
  readonly providerHistoryItemId: string | null;
  readonly characterCostHeader: number | null;
  readonly attempts: number;
  readonly latencyMs: number;
}

const DEFAULT_BASE_URL = "https://api.elevenlabs.io";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RESPONSE_BYTES = 25 * 1024 * 1024; // 25 MiB
const RETRYABLE_STATUS_CODES = new Set([408, 429, 502, 503, 504]);

function validateEndpointUrl(rawBaseUrl: string, allowLoopbackHttp = false): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawBaseUrl);
  } catch {
    throw new ElevenLabsIntegrationError("endpoint_insecure", "Invalid ElevenLabs base URL.");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new ElevenLabsIntegrationError(
      "endpoint_insecure",
      "ElevenLabs base URL must not contain embedded credentials, query strings, or hash fragments."
    );
  }
  const isLoopback = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost" || parsed.hostname === "::1";
  if (parsed.protocol !== "https:" && !(allowLoopbackHttp && parsed.protocol === "http:" && isLoopback)) {
    throw new ElevenLabsIntegrationError(
      "endpoint_insecure",
      `ElevenLabs endpoint must use HTTPS (received '${parsed.protocol}').`
    );
  }
  return parsed;
}

function parseRetryAfterMs(headerValue: string | null, maxDelayMs: number): number | null {
  if (!headerValue) return null;
  const trimmed = headerValue.trim();
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(maxDelayMs, Math.round(seconds * 1000));
  }
  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) {
    const delta = Math.max(0, dateMs - Date.now());
    return Math.min(maxDelayMs, delta);
  }
  return null;
}

function computeBackoffMs(attempt: number, baseDelayMs: number, maxDelayMs: number, retryAfterMs: number | null): number {
  if (retryAfterMs !== null) {
    return retryAfterMs;
  }
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
  // Deterministic bounded jitter (75% - 100% of exponential interval)
  const jitterFactor = 0.75 + ((attempt * 17) % 26) / 100;
  return Math.min(maxDelayMs, Math.round(exponential * jitterFactor));
}

async function readBoundedBinaryBody(
  response: Response,
  maxBytes: number,
  signal?: AbortSignal
): Promise<Uint8Array> {
  const contentLengthHeader = response.headers.get("content-length");
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      await response.body?.cancel().catch(() => {});
      throw new ElevenLabsIntegrationError(
        "response_too_large",
        `ElevenLabs audio response Content-Length (${declaredLength}) exceeds ceiling (${maxBytes} bytes).`
      );
    }
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ElevenLabsIntegrationError("provider_unavailable", "ElevenLabs response did not include a readable body.");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          throw new ElevenLabsIntegrationError(
            "response_too_large",
            `ElevenLabs audio stream exceeded byte ceiling (${maxBytes} bytes).`
          );
        }
        chunks.push(value);
      }
    }
    signal?.throwIfAborted();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }

  if (totalBytes === 0) {
    throw new ElevenLabsIntegrationError("provider_unavailable", "ElevenLabs returned an empty audio payload.");
  }

  return new Uint8Array(Buffer.concat(chunks));
}

/**
 * Hardened server-side HTTP client for the ElevenLabs Text-to-Speech v1 API.
 * Resolves credentials strictly on the server at call time, never serializes secrets into errors or state,
 * enforces HTTPS endpoints, and performs bounded retries with Retry-After support.
 */
export class ElevenLabsSpeechClient {
  private readonly credentialResolver: ElevenLabsCredentialResolver;
  private readonly baseUrl: URL;
  private readonly timeoutMs: number;
  private readonly maxResponseBytes: number;
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly sleepFn: (delayMs: number) => Promise<void>;
  private readonly fetchFn: typeof fetch;

  constructor(options?: ElevenLabsClientOptions) {
    this.baseUrl = validateEndpointUrl(options?.baseUrl ?? DEFAULT_BASE_URL, options?.allowLoopbackHttp ?? false);
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxResponseBytes = options?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;

    const maxAttempts = options?.retryPolicy?.maxAttempts ?? 3;
    const baseDelayMs = options?.retryPolicy?.baseDelayMs ?? 250;
    const maxDelayMs = options?.retryPolicy?.maxDelayMs ?? 4000;

    if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
      throw new ElevenLabsIntegrationError("input_invalid", "retryPolicy.maxAttempts must be between 1 and 5.");
    }
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.sleepFn =
      options?.retryPolicy?.sleep ??
      ((delayMs: number) => new Promise<void>(resolve => setTimeout(resolve, delayMs)));
    this.fetchFn = options?.fetchImplementation ?? globalThis.fetch;

    const configuredKey = options?.apiKey;
    if (typeof configuredKey === "function") {
      this.credentialResolver = configuredKey;
    } else if (typeof configuredKey === "string") {
      this.credentialResolver = () => configuredKey;
    } else {
      this.credentialResolver = () => process.env.ELEVENLABS_API_KEY ?? "";
    }
  }

  private async resolveApiKey(): Promise<string> {
    const raw = await this.credentialResolver();
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    if (!trimmed) {
      throw new ElevenLabsIntegrationError(
        "credential_missing",
        "Server-side ElevenLabs API credential (ELEVENLABS_API_KEY) is not configured."
      );
    }
    if (trimmed.length < 16 || /\s/.test(trimmed)) {
      throw new ElevenLabsIntegrationError(
        "credential_invalid",
        "Server-side ElevenLabs API credential failed format validation."
      );
    }
    return trimmed;
  }

  async synthesize(request: ElevenLabsSynthesisHttpRequest): Promise<ElevenLabsSynthesisHttpResponse> {
    const apiKey = await this.resolveApiKey();
    const startMs = Date.now();

    const targetUrl = new URL(
      `/v1/text-to-speech/${encodeURIComponent(request.voiceId)}`,
      this.baseUrl
    );
    targetUrl.searchParams.set("output_format", request.outputFormat);

    const requestBody = JSON.stringify({
      text: request.text,
      model_id: request.modelId,
      ...(request.languageCode ? { language_code: request.languageCode } : {}),
      voice_settings: {
        stability: request.voiceSettings.stability,
        similarity_boost: request.voiceSettings.similarityBoost,
        ...(request.voiceSettings.style !== undefined ? { style: request.voiceSettings.style } : {}),
        ...(request.voiceSettings.useSpeakerBoost !== undefined
          ? { use_speaker_boost: request.voiceSettings.useSpeakerBoost }
          : {}),
        ...(request.voiceSettings.speed !== undefined ? { speed: request.voiceSettings.speed } : {}),
      },
    });

    let lastError: ElevenLabsIntegrationError | undefined;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      request.signal?.throwIfAborted();

      const attemptController = new AbortController();
      const timeoutHandle = setTimeout(() => attemptController.abort(new Error("timeout")), this.timeoutMs);
      const onExternalAbort = () => attemptController.abort(request.signal?.reason);
      request.signal?.addEventListener("abort", onExternalAbort, { once: true });

      let response: Response;
      try {
        response = await this.fetchFn(targetUrl.toString(), {
          method: "POST",
          redirect: "error",
          credentials: "omit",
          signal: attemptController.signal,
          headers: {
            "xi-api-key": apiKey,
            "content-type": "application/json",
            accept: request.outputFormat.startsWith("mp3_") ? "audio/mpeg" : "application/octet-stream",
            "x-idempotency-key": request.idempotencyKey,
            "user-agent": "starlight-intelligence-elevenlabs/0.1.0",
          },
          body: requestBody,
        });
      } catch (err) {
        clearTimeout(timeoutHandle);
        request.signal?.removeEventListener("abort", onExternalAbort);
        if (request.signal?.aborted) {
          throw err;
        }
        lastError = new ElevenLabsIntegrationError(
          "provider_unavailable",
          `ElevenLabs transport failure on attempt ${attempt} of ${this.maxAttempts}.`,
          { retryable: true }
        );
        if (attempt < this.maxAttempts) {
          const delayMs = computeBackoffMs(attempt, this.baseDelayMs, this.maxDelayMs, null);
          await this.sleepFn(delayMs);
          continue;
        }
        throw lastError;
      } finally {
        clearTimeout(timeoutHandle);
        request.signal?.removeEventListener("abort", onExternalAbort);
      }

      if (!response.ok) {
        const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"), this.maxDelayMs);
        await response.body?.cancel().catch(() => {});

        if (response.status === 401 || response.status === 403) {
          throw new ElevenLabsIntegrationError(
            "credential_invalid",
            `ElevenLabs rejected server credentials with HTTP ${response.status}.`,
            { retryable: false, statusCode: response.status }
          );
        }

        if (RETRYABLE_STATUS_CODES.has(response.status)) {
          const code = response.status === 429 ? "provider_rate_limited" : "provider_unavailable";
          lastError = new ElevenLabsIntegrationError(
            code,
            `ElevenLabs returned transient HTTP ${response.status} on attempt ${attempt} of ${this.maxAttempts}.`,
            { retryable: true, statusCode: response.status }
          );
          if (attempt < this.maxAttempts) {
            const delayMs = computeBackoffMs(attempt, this.baseDelayMs, this.maxDelayMs, retryAfterMs);
            await this.sleepFn(delayMs);
            continue;
          }
          throw lastError;
        }

        throw new ElevenLabsIntegrationError(
          "provider_rejected",
          `ElevenLabs rejected synthesis request with non-retryable HTTP ${response.status}.`,
          { retryable: false, statusCode: response.status }
        );
      }

      const audioBytes = await readBoundedBinaryBody(response, this.maxResponseBytes, request.signal);
      const contentType = (response.headers.get("content-type") ?? "audio/mpeg").split(";")[0]!.trim().toLowerCase();
      const providerRequestId =
        response.headers.get("request-id") ?? response.headers.get("x-request-id") ?? null;
      const providerHistoryItemId = response.headers.get("history-item-id") ?? null;
      const charCostRaw = response.headers.get("character-cost");
      const characterCostHeader =
        charCostRaw && Number.isFinite(Number(charCostRaw)) ? Number(charCostRaw) : null;

      return {
        audioBytes,
        contentType,
        providerRequestId,
        providerHistoryItemId,
        characterCostHeader,
        attempts: attempt,
        latencyMs: Math.max(1, Date.now() - startMs),
      };
    }

    throw (
      lastError ??
      new ElevenLabsIntegrationError("provider_unavailable", "ElevenLabs synthesis exhausted all retry attempts.")
    );
  }
}
