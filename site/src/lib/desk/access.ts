/**
 * Who may make the Desk spend money, decided before anything is spent.
 *
 * The policy, in order:
 *
 *   1. A bearer token that does not match DESK_ACCESS_TOKEN is refused (401).
 *   2. With a durable run counter configured, the route is public and every
 *      run is counted in Redis: runs and tokens per UTC day. A valid token
 *      skips the per-address window, so an operator is not throttled by a
 *      room sharing one address, and still counts against the daily run
 *      ceiling and the daily token budget.
 *   3. Off Vercel (local development) the in-memory counters stand in.
 *   4. On Vercel with no durable counter, nobody runs, token or not: 503. A
 *      run nobody can meter is a run with no spend ceiling, whoever asks.
 *
 * Memory follows the same identity (memoryAccess below). On Vercel only a run
 * carrying a valid token may recall from or write to the vault; an anonymous
 * run is stateless, so one stranger's question cannot plant beliefs that the
 * next stranger's run is then argued with. Off Vercel the owner is the only
 * caller, and memory stays on.
 *
 * Pure: it reads the environment it is handed and the header, nothing else.
 *
 * Built on SIP — operational tier.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { redisConfigFromEnv } from "./redis-rest";

export type DeskAccess =
  | { ok: true; limiter: "durable" | "memory"; authorized: boolean }
  | { ok: false; status: 401 | 503; error: string };

export const CLOSED_WITHOUT_COUNTER =
  "This Desk is not running: the deployment has no durable run counter configured.";
export const BAD_TOKEN = "That access token is not valid for this Desk.";

export function deskAccess(env: NodeJS.ProcessEnv, authorization: string | null): DeskAccess {
  const expected = env.DESK_ACCESS_TOKEN?.trim() ?? "";
  const presented = bearer(authorization);
  const authorized = expected.length > 0 && presented !== null && tokensMatch(presented, expected);
  if (expected.length > 0 && presented !== null && !authorized) {
    return { ok: false, status: 401, error: BAD_TOKEN };
  }

  if (redisConfigFromEnv(env)) return { ok: true, limiter: "durable", authorized };
  if (!env.VERCEL) return { ok: true, limiter: "memory", authorized };
  return { ok: false, status: 503, error: CLOSED_WITHOUT_COUNTER };
}

export const ANONYMOUS_MEMORY = "anonymous run: memory is operator-only";

export type MemoryAccess = { allowed: true } | { allowed: false; reason: string };

/**
 * Whether this run may read or write the vault. A deployed vault is shared by
 * everyone who reaches the URL, so only a caller the operator vouched for (a
 * valid DESK_ACCESS_TOKEN) touches it. A laptop is the owner's own machine.
 */
export function memoryAccess(env: NodeJS.ProcessEnv, authorized: boolean): MemoryAccess {
  if (!env.VERCEL) return { allowed: true };
  if (authorized) return { allowed: true };
  return { allowed: false, reason: ANONYMOUS_MEMORY };
}

/** The token from `authorization: Bearer <token>`, or null when there is none. */
export function bearer(header: string | null): string | null {
  const match = header?.match(/^\s*Bearer\s+(\S+)\s*$/i);
  return match ? match[1] : null;
}

/**
 * Constant-time comparison. Both sides are hashed first so the buffers are
 * the same length whatever was sent, and the length of the real token does
 * not leak through an early return.
 */
export function tokensMatch(presented: string, expected: string): boolean {
  const left = createHash("sha256").update(presented, "utf8").digest();
  const right = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(left, right);
}
