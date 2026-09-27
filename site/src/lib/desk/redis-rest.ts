/**
 * Redis over HTTPS, the Upstash REST dialect, with `fetch` and nothing else.
 *
 * A serverless function cannot hold a Redis socket open between invocations,
 * and an SDK is a dependency the Desk does not need: the REST API takes a
 * command as a JSON array and answers `{ result }` or `{ error }`. Two things
 * use it: the durable vault (RPUSH / LRANGE) and the run counters (INCR /
 * EXPIRE, pipelined). Every key sits under one namespace (deskNamespace).
 *
 * Built on SIP — operational tier.
 */

export const DEFAULT_TIMEOUT_MS = 5_000;

export type RedisValue = string | number;

export interface RedisRestConfig {
  url: string;
  token: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/**
 * The durable backend, when one is configured. Vercel's Marketplace injects
 * `KV_REST_API_URL` / `KV_REST_API_TOKEN`; an Upstash database created
 * directly uses `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Both a
 * URL and a token from the same pair, or null.
 */
export function redisConfigFromEnv(env: NodeJS.ProcessEnv = process.env): RedisRestConfig | null {
  const pairs: Array<[string | undefined, string | undefined]> = [
    [env.KV_REST_API_URL, env.KV_REST_API_TOKEN],
    [env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN],
  ];
  for (const [url, token] of pairs) {
    if (url?.trim() && token?.trim()) return { url: url.trim().replace(/\/+$/, ""), token: token.trim() };
  }
  return null;
}

/**
 * The namespace every Desk key sits under: DESK_NAMESPACE, else the older
 * DESK_VAULT_NAMESPACE, else "default". Two Desks sharing one database with
 * different namespaces share no memory and no counters. A value that is not a
 * safe key segment is ignored.
 */
export function deskNamespace(env: NodeJS.ProcessEnv = process.env): string {
  for (const raw of [env.DESK_NAMESPACE, env.DESK_VAULT_NAMESPACE]) {
    const value = (raw ?? "").trim();
    if (/^[A-Za-z0-9._-]{1,64}$/.test(value)) return value;
  }
  return "default";
}

/** `desk:<namespace>:<part>:…`, the one shape every Desk key takes. */
export function deskKey(namespace: string, ...parts: Array<string | number>): string {
  return ["desk", namespace, ...parts].join(":");
}

export class RedisRestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RedisRestError";
  }
}

/** One command. Returns its `result`; a Redis-side error throws. `signal` abandons the call early. */
export async function redisCommand(config: RedisRestConfig, command: RedisValue[], signal?: AbortSignal): Promise<unknown> {
  const payload = await post(config, config.url, command, signal);
  return unwrap(payload, String(command[0]));
}

/**
 * Several commands in one round trip. Not a transaction: each runs in order,
 * and one failing does not undo the others. Any error throws.
 */
export async function redisPipeline(config: RedisRestConfig, commands: RedisValue[][]): Promise<unknown[]> {
  const payload = await post(config, `${config.url}/pipeline`, commands);
  if (!Array.isArray(payload) || payload.length !== commands.length) {
    throw new RedisRestError("redis pipeline answered with an unexpected shape");
  }
  return payload.map((entry, index) => unwrap(entry, String(commands[index][0])));
}

async function post(config: RedisRestConfig, url: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  const fetchImpl = config.fetchImpl ?? fetch;
  if (signal?.aborted) throw new RedisRestError("redis not called: the run's deadline passed");
  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = errorOf(payload);
      throw new RedisRestError(`redis answered ${response.status}${detail ? `: ${detail}` : ""}`);
    }
    return payload;
  } catch (error) {
    if (error instanceof RedisRestError) throw error;
    if (signal?.aborted) throw new RedisRestError("redis call abandoned: the run's deadline passed");
    if (error instanceof Error && error.name === "AbortError") {
      throw new RedisRestError(`redis did not answer within ${timeoutMs} ms`);
    }
    throw new RedisRestError(`redis call failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

function unwrap(entry: unknown, name: string): unknown {
  const detail = errorOf(entry);
  if (detail) throw new RedisRestError(`redis ${name} failed: ${detail}`);
  if (!entry || typeof entry !== "object" || !("result" in entry)) {
    throw new RedisRestError(`redis ${name} answered without a result`);
  }
  return (entry as { result: unknown }).result;
}

function errorOf(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const error = (payload as { error?: unknown }).error;
  return typeof error === "string" ? error.slice(0, 200) : "";
}
