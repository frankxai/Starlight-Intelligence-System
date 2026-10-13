/**
 * How many runs the Desk will pay for: a per-address window, a daily run
 * ceiling across everyone, and a daily token budget.
 *
 * Every run spends real money on retrieval and four model calls, and the route
 * is reachable by anyone with the URL. On serverless an in-memory counter is
 * one bucket per instance, which is no limit at all, so the deployed Desk
 * counts in Redis: a fixed-window INCR + EXPIRE per address, and one INCR +
 * EXPIRE per UTC day, each pipelined into a single REST round trip. The
 * in-memory counter survives only for local development, where one process is
 * the whole deployment.
 *
 * A run count is not a spend ceiling: one run can cost a hundred times
 * another. The token meter is. It needs no prices: an atomic Redis script
 * conditionally reserves one run's worst case before paid work. Once complete,
 * known usage replaces that reservation. Unknown usage or a failed
 * reconciliation leaves the conservative reservation in place.
 *
 * The day's total and every open reservation live in one Redis hash, so each
 * script touches a single key. A reservation is reconciled at most once: the
 * script takes the reserved amount from the hash itself and
 * deletes it as it applies the refund. It refuses without writing anything
 * when the reservation or the total is missing (an expired or evicted key) or
 * when the refund would take the total below zero.
 *
 * Built on SIP — operational tier.
 */
import { createHash, randomBytes } from "node:crypto";
import { deskKey, redisCommand, redisPipeline, type RedisRestConfig } from "./redis-rest";

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
  /** The Desk namespace the keys sit under (see deskNamespace). */
  namespace?: string;
}

/**
 * Time allowed for each token-meter call. Shorter than the Redis default so
 * recording after a run, which happens after the run's deadline, still ends
 * inside the route's maxDuration.
 */
export const METER_TIMEOUT_MS = 3_000;

/** Tokens per UTC day across every run. Conservative on purpose, like the run ceiling. */
export const DEFAULT_DAILY_TOKEN_BUDGET = 2_000_000;

/**
 * `DESK_DAILY_TOKEN_BUDGET`, a whole number of tokens per UTC day. Zero closes
 * the Desk, and so does any budget smaller than one run's worst case.
 * Anything unparsable falls back to the default.
 */
export function dailyTokenBudget(env: NodeJS.ProcessEnv = process.env): number {
  return wholeNumber(env.DESK_DAILY_TOKEN_BUDGET, DEFAULT_DAILY_TOKEN_BUDGET);
}

export interface BudgetResult {
  ok: boolean;
  /** Tokens reserved or reconciled today before this run. */
  used: number;
  budget: number;
  /** The run's worst case the check reserved room for. */
  worstCase: number;
  /** Opaque UTC-day reservation identifier used for reconciliation. */
  reservation: string;
  /** This reservation's own id within the day, reconciled at most once. Empty when refused. */
  ticket: string;
  /** Seconds until the UTC day resets; 0 when `ok`. */
  retryAfter: number;
}

export interface TokenMeter {
  readonly kind: "durable" | "memory";
  /** Atomically reserve this run's worst case, or refuse without changing usage. */
  reserve(worstCase: number): Promise<BudgetResult>;
  /**
   * Replace this run's reservation with known actual usage, once. Throws,
   * leaving every total as it was, when the reservation is unknown or already
   * reconciled, the day's total is gone, or the result would fall below zero.
   */
  reconcile(reservation: Pick<BudgetResult, "reservation" | "ticket" | "worstCase">, actual: number): Promise<number>;
}

export interface MeterOptions {
  budget?: number;
  now?: () => number;
  namespace?: string;
  /** The reservation id. Defaults to 96 random bits as hex; tests inject one. */
  ticket?: () => string;
}

/** The hash field holding the day's total; every other field is an open reservation. */
const TOTAL_FIELD = "total";

/**
 * KEYS[1] the day's hash. ARGV: requested tokens, budget, TTL seconds, ticket field.
 * Only an absent hash starts a day at zero. A hash without its total, or with
 * a total that is not a whole number of zero or more, is an error, never
 * headroom, and the script returns before its first write.
 */
export const RESERVE_TOKENS = `
local raw = redis.call("HGET", KEYS[1], "${TOTAL_FIELD}")
local used
if raw then
  used = tonumber(raw)
elseif redis.call("EXISTS", KEYS[1]) == 1 then
  return redis.error_reply("DESK token total is missing")
else
  used = 0
end
if used == nil or used < 0 or used ~= math.floor(used) then return redis.error_reply("DESK token total is invalid") end
local requested = tonumber(ARGV[1])
local budget = tonumber(ARGV[2])
if used + requested > budget then
  if redis.call("EXISTS", KEYS[1]) == 1 then redis.call("EXPIRE", KEYS[1], ARGV[3]) end
  return {0, used}
end
if redis.call("HSETNX", KEYS[1], ARGV[4], requested) == 0 then
  return redis.error_reply("DESK token reservation id already in use")
end
local total = redis.call("HINCRBY", KEYS[1], "${TOTAL_FIELD}", requested)
redis.call("EXPIRE", KEYS[1], ARGV[3])
return {1, used, total}
`;

/**
 * KEYS[1] the day's hash. ARGV: ticket field, actual tokens, TTL seconds.
 * Every refusal returns before the first write.
 */
export const RECONCILE_TOKENS = `
local reserved = tonumber(redis.call("HGET", KEYS[1], ARGV[1]) or "")
if reserved == nil or reserved < 0 or reserved ~= math.floor(reserved) then return {0, "no open reservation"} end
local total = tonumber(redis.call("HGET", KEYS[1], "${TOTAL_FIELD}") or "")
if total == nil or total < 0 or total ~= math.floor(total) then return {0, "no valid total"} end
local adjustment = tonumber(ARGV[2]) - reserved
if total + adjustment < 0 then return {0, "would fall below zero"} end
redis.call("HDEL", KEYS[1], ARGV[1])
local after = redis.call("HINCRBY", KEYS[1], "${TOTAL_FIELD}", adjustment)
redis.call("EXPIRE", KEYS[1], ARGV[3])
return {1, after}
`;

/** Why a reconciliation was refused, as the script names it. Fixed strings only. */
const RECONCILE_REFUSALS = new Set(["no open reservation", "no valid total", "would fall below zero"]);

const TOKEN_KEY_TTL_SECONDS = 2 * 86_400;

export function redisTokenMeter(config: RedisRestConfig, options: MeterOptions = {}): TokenMeter {
  const budget = options.budget ?? DEFAULT_DAILY_TOKEN_BUDGET;
  const now = options.now ?? (() => Date.now());
  const namespace = options.namespace ?? "default";
  const newTicket = options.ticket ?? (() => randomBytes(12).toString("hex"));
  const keyAt = (at: number) => deskKey(namespace, "budget", utcDay(at));
  return {
    kind: "durable",
    async reserve(worstCase) {
      const at = now();
      const requested = tokenCount(worstCase);
      const ticket = ticketField(newTicket());
      const raw = await redisCommand(config, [
        "EVAL",
        RESERVE_TOKENS,
        1,
        keyAt(at),
        requested,
        budget,
        TOKEN_KEY_TTL_SECONDS,
        ticket,
      ]);
      if (!Array.isArray(raw) || raw.length < 2) throw new Error("the token meter answered with an unexpected reservation");
      const admitted = Number(raw[0]);
      const used = Number(raw[1]);
      if ((admitted !== 0 && admitted !== 1) || !Number.isFinite(used)) {
        throw new Error("the token meter answered with an invalid reservation");
      }
      return budgetResult(Boolean(admitted), used, budget, requested, keyAt(at), admitted ? ticket : "", at);
    },
    async reconcile(reservation, actual) {
      if (!reservation.ticket) throw new Error("the token meter has no reservation to reconcile");
      const raw = await redisCommand(config, [
        "EVAL",
        RECONCILE_TOKENS,
        1,
        reservation.reservation,
        reservation.ticket,
        tokenCount(actual),
        TOKEN_KEY_TTL_SECONDS,
      ]);
      if (!Array.isArray(raw) || raw.length < 2) throw new Error("the token meter answered with an unexpected reconciliation");
      if (Number(raw[0]) !== 1) {
        const reason = RECONCILE_REFUSALS.has(String(raw[1])) ? String(raw[1]) : "unexpected answer";
        throw new Error(`the token meter refused to reconcile: ${reason}`);
      }
      const total = Number(raw[1]);
      if (!Number.isFinite(total) || total < 0) throw new Error("the token meter answered with an invalid total");
      return total;
    },
  };
}

/** A reservation's field in the day's hash. Never the total's own field name. */
function ticketField(id: string): string {
  if (!/^[0-9a-z]{1,64}$/.test(id)) throw new Error("the token meter needs a short lowercase alphanumeric reservation id");
  return `r:${id}`;
}

/** One process, one meter. Local development only, like memoryRunLimiter. */
export function memoryTokenMeter(options: MeterOptions = {}): TokenMeter {
  const budget = options.budget ?? DEFAULT_DAILY_TOKEN_BUDGET;
  const now = options.now ?? (() => Date.now());
  const newTicket = options.ticket ?? (() => randomBytes(12).toString("hex"));
  const days = new Map<string, { total: number; open: Map<string, number> }>();
  const dayOf = (day: string) => {
    let record = days.get(day);
    if (!record) days.set(day, (record = { total: 0, open: new Map() }));
    return record;
  };
  return {
    kind: "memory",
    async reserve(worstCase) {
      const at = now();
      const day = utcDay(at);
      const record = dayOf(day);
      const requested = tokenCount(worstCase);
      const ok = record.total + requested <= budget;
      const ticket = ok ? ticketField(newTicket()) : "";
      const result = budgetResult(ok, record.total, budget, requested, day, ticket, at);
      if (ok) {
        if (record.open.has(ticket)) throw new Error("the token meter reservation id is already in use");
        record.open.set(ticket, requested);
        record.total += requested;
      }
      return result;
    },
    async reconcile(reservation, actual) {
      const record = days.get(reservation.reservation);
      const reserved = record?.open.get(reservation.ticket);
      if (!record || reserved === undefined) throw new Error("the token meter refused to reconcile: no open reservation");
      const total = record.total + tokenCount(actual) - reserved;
      if (total < 0) throw new Error("the token meter refused to reconcile: would fall below zero");
      record.open.delete(reservation.ticket);
      record.total = total;
      return total;
    },
  };
}

function budgetResult(
  ok: boolean,
  used: number,
  budget: number,
  worstCase: number,
  reservation: string,
  ticket: string,
  at: number,
): BudgetResult {
  return { ok, used, budget, worstCase, reservation, ticket, retryAfter: ok ? 0 : secondsUntil(nextUtcMidnight(at), at) };
}

function tokenCount(value: number): number {
  if (!Number.isFinite(value)) throw new Error("the token meter needs a finite token count");
  return Math.max(0, Math.ceil(value));
}

/**
 * `DESK_DAILY_RUN_LIMIT`, a whole number of runs per UTC day. Zero is a valid
 * setting and closes the Desk; anything unparsable falls back to the default
 * rather than to "unlimited".
 */
export function dailyRunLimit(env: NodeJS.ProcessEnv = process.env): number {
  return wholeNumber(env.DESK_DAILY_RUN_LIMIT, DEFAULT_DAILY_RUN_LIMIT);
}

function wholeNumber(value: string | undefined, fallback: number): number {
  const raw = value?.trim();
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

export function redisRunLimiter(config: RedisRestConfig, options: LimitOptions = {}): RunLimiter {
  const { windowMs, maxPerWindow, dailyLimit, now, namespace } = resolve(options);
  const windowSeconds = Math.ceil(windowMs / 1000);

  return {
    kind: "durable",
    async hitAddress(address) {
      const at = now();
      const window = Math.floor(at / windowMs);
      const key = deskKey(namespace, "rl", addressKey(address), window);
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
      const key = deskKey(namespace, "day", utcDay(at));
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
    namespace: options.namespace ?? "default",
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
