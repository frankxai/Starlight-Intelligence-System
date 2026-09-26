/**
 * How many runs the Desk will pay for: a per-address window and a daily
 * ceiling across everyone.
 *
 * Every run spends real money on retrieval and four model calls, and the route
 * is reachable by anyone with the URL. On serverless an in-memory counter is
 * one bucket per instance, which is no limit at all, so the deployed Desk
 * counts in Redis: a fixed-window INCR + EXPIRE per address, and one INCR +
 * EXPIRE per UTC day, each pipelined into a single REST round trip. The
 * in-memory counter survives only for local development, where one process is
 * the whole deployment.
 *
 * Built on SIP — operational tier.
 */
import { createHash } from "node:crypto";
import { redisPipeline, type RedisRestConfig } from "./redis-rest";

export const WINDOW_MS = 60_000;
export const MAX_RUNS_PER_WINDOW = 6;
/** Conservative on purpose. Raise it deliberately, with prices filled in, not by default. */
export const DEFAULT_DAILY_RUN_LIMIT = 200;

export interface LimitResult {
  ok: boolean;
  /** The count after this hit. */
  count: number;
  limit: number;
  /** Seconds until the window (or the day) resets; 0 when `ok`. */
  retryAfter: number;
}

export interface RunLimiter {
  readonly kind: "durable" | "memory";
  /** Count one request from this address in the current window. */
  hitAddress(address: string): Promise<LimitResult>;
  /** Count one run against today's ceiling (UTC). */
  hitDaily(): Promise<LimitResult>;
}

export interface LimitOptions {
  windowMs?: number;
  maxPerWindow?: number;
  dailyLimit?: number;
  now?: () => number;
}

/**
 * `DESK_DAILY_RUN_LIMIT`, a whole number of runs per UTC day. Zero is a valid
 * setting and closes the Desk; anything unparsable falls back to the default
 * rather than to "unlimited".
 */
export function dailyRunLimit(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.DESK_DAILY_RUN_LIMIT?.trim();
  if (!raw || !/^\d+$/.test(raw)) return DEFAULT_DAILY_RUN_LIMIT;
  return Number(raw);
}

export function redisRunLimiter(config: RedisRestConfig, options: LimitOptions = {}): RunLimiter {
  const { windowMs, maxPerWindow, dailyLimit, now } = resolve(options);
  const windowSeconds = Math.ceil(windowMs / 1000);

  return {
    kind: "durable",
    async hitAddress(address) {
      const at = now();
      const window = Math.floor(at / windowMs);
      const key = `desk:limit:addr:${addressKey(address)}:${window}`;
      // The window index is in the key, so re-arming the expiry on every hit
      // cannot stretch a window; it only lets the key disappear once it is done.
      const [count] = await redisPipeline(config, [
        ["INCR", key],
        ["EXPIRE", key, windowSeconds],
      ]);
      return result(Number(count), maxPerWindow, secondsUntil((window + 1) * windowMs, at));
    },
    async hitDaily() {
      const at = now();
      const key = `desk:limit:day:${utcDay(at)}`;
      const [count] = await redisPipeline(config, [
        ["INCR", key],
        ["EXPIRE", key, 2 * 86_400],
      ]);
      return result(Number(count), dailyLimit, secondsUntil(nextUtcMidnight(at), at));
    },
  };
}

/** One process, one counter. Local development only; the route never uses this on Vercel. */
export function memoryRunLimiter(options: LimitOptions = {}): RunLimiter {
  const { windowMs, maxPerWindow, dailyLimit, now } = resolve(options);
  const seen = new Map<string, { count: number; resetAt: number }>();
  const daily = { day: "", count: 0 };

  return {
    kind: "memory",
    async hitAddress(address) {
      const at = now();
      let record = seen.get(address);
      if (!record || at >= record.resetAt) {
        record = { count: 0, resetAt: at + windowMs };
        seen.set(address, record);
        if (seen.size > 2000) for (const [id, value] of seen) if (at >= value.resetAt) seen.delete(id);
      }
      record.count += 1;
      return result(record.count, maxPerWindow, secondsUntil(record.resetAt, at));
    },
    async hitDaily() {
      const at = now();
      const day = utcDay(at);
      if (daily.day !== day) {
        daily.day = day;
        daily.count = 0;
      }
      daily.count += 1;
      return result(daily.count, dailyLimit, secondsUntil(nextUtcMidnight(at), at));
    },
  };
}

function resolve(options: LimitOptions): Required<LimitOptions> {
  return {
    windowMs: options.windowMs ?? WINDOW_MS,
    maxPerWindow: options.maxPerWindow ?? MAX_RUNS_PER_WINDOW,
    dailyLimit: options.dailyLimit ?? DEFAULT_DAILY_RUN_LIMIT,
    now: options.now ?? (() => Date.now()),
  };
}

function result(count: number, limit: number, resetIn: number): LimitResult {
  if (!Number.isFinite(count)) throw new Error("the run counter answered with something that is not a number");
  const ok = count <= limit;
  return { ok, count, limit, retryAfter: ok ? 0 : resetIn };
}

/** Addresses are counted, not stored: the key holds a digest, never the IP itself. */
function addressKey(address: string): string {
  return createHash("sha256").update(address).digest("hex").slice(0, 32);
}

function utcDay(at: number): string {
  return new Date(at).toISOString().slice(0, 10);
}

function nextUtcMidnight(at: number): number {
  const date = new Date(at);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
}

function secondsUntil(when: number, at: number): number {
  return Math.max(1, Math.ceil((when - at) / 1000));
}
