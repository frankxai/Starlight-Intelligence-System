/**
 * Who may make the Desk spend money, decided before anything is spent.
 *
 * The policy, in order:
 *
 *   1. A bearer token that does not match DESK_ACCESS_TOKEN is refused (401).
 *   2. With a durable run counter configured, the route is public and every
 *      run is counted in Redis. A valid token skips the per-address window,
 *      so an operator is not throttled by a room sharing one address, but
 *      still counts against the daily ceiling.
 *   3. Off Vercel (local development) the in-memory counter stands in.
 *   4. On Vercel with no durable counter, only a valid token runs, uncounted.
 *      Everyone else gets 503: a public route that spends money with no limit
 *      that holds across instances is not one this Desk will serve.
 *
 * Pure: it reads the environment it is handed and the header, nothing else.
 *
 * Built on SIP — operational tier.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { redisConfigFromEnv } from "./redis-rest";

export type DeskAccess =
  | { ok: true; limiter: "durable" | "memory" | "none"; authorized: boolean }
  | { ok: false; status: 401 | 503; error: string };

export const CLOSED_WITHOUT_COUNTER =
  "This Desk is not open to the public: the deployment has no durable run counter configured.";
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
  if (authorized) return { ok: true, limiter: "none", authorized };
  return { ok: false, status: 503, error: CLOSED_WITHOUT_COUNTER };
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
