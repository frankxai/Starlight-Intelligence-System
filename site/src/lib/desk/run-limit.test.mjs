// node --import ./scripts/test/register.mjs --test src/lib/desk/run-limit.test.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  DEFAULT_DAILY_RUN_LIMIT,
  DEFAULT_DAILY_TOKEN_BUDGET,
  dailyRunLimit,
  dailyTokenBudget,
  memoryRunLimiter,
  memoryTokenMeter,
  RECONCILE_TOKENS,
  RESERVE_TOKENS,
  redisRunLimiter,
  redisTokenMeter,
} from "./run-limit.ts";

const CONFIG = { url: "https://kv.example.upstash.io", token: "kv-token" };
// 2026-09-26T10:00:30Z: thirty seconds into a one-minute window.
const AT = Date.UTC(2026, 8, 26, 10, 0, 30);

/** A fetch that records each pipeline and answers INCR with the next count. */
function pipelineFetch(counts) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    const next = counts.shift();
    if (next === undefined) throw new Error(`unscripted call to ${url}`);
    if (next instanceof Error) throw next;
    return { ok: true, status: 200, json: async () => next };
  };
  impl.calls = calls;
  return impl;
}

test("an address is counted with one pipelined INCR and EXPIRE per window", async () => {
  const fetchImpl = pipelineFetch([[{ result: 1 }, { result: 1 }]]);
  const limiter = redisRunLimiter({ ...CONFIG, fetchImpl }, { now: () => AT, namespace: "acme" });
  const hit = await limiter.hitAddress("203.0.113.7");

  assert.deepEqual(hit, { ok: true, count: 1, limit: 6, retryAfter: 0 });
  const digest = createHash("sha256").update("203.0.113.7").digest("hex").slice(0, 32);
  const key = `desk:acme:rl:${digest}:${Math.floor(AT / 60_000)}`;
  assert.deepEqual(fetchImpl.calls, [
    {
      url: "https://kv.example.upstash.io/pipeline",
      headers: { authorization: "Bearer kv-token", "content-type": "application/json" },
      body: [
        ["INCR", key],
        ["EXPIRE", key, 60],
      ],
    },
  ]);
  assert.ok(!JSON.stringify(fetchImpl.calls).includes("203.0.113.7"), "the address itself never reaches Redis");
});

test("the seventh run in a window is refused until the window turns", async () => {
  const fetchImpl = pipelineFetch([[{ result: 7 }, { result: 1 }]]);
  const hit = await redisRunLimiter({ ...CONFIG, fetchImpl }, { now: () => AT }).hitAddress("203.0.113.7");
  assert.deepEqual(hit, { ok: false, count: 7, limit: 6, retryAfter: 30 });
});

test("the daily ceiling is one counter per UTC day, refused past the limit", async () => {
  const fetchImpl = pipelineFetch([
    [{ result: 3 }, { result: 1 }],
    [{ result: 4 }, { result: 1 }],
  ]);
  const limiter = redisRunLimiter({ ...CONFIG, fetchImpl }, { now: () => AT, dailyLimit: 3 });
  assert.deepEqual(await limiter.hitDaily(), { ok: true, count: 3, limit: 3, retryAfter: 0 });
  const over = await limiter.hitDaily();
  assert.equal(over.ok, false);
  assert.equal(over.retryAfter, 14 * 3600 - 30, "until midnight UTC");
  assert.deepEqual(fetchImpl.calls[0].body, [
    ["INCR", "desk:default:day:2026-09-26"],
    ["EXPIRE", "desk:default:day:2026-09-26", 172_800],
  ]);
});

test("a counter that errors or cannot be reached throws, so the route can fail closed", async () => {
  const erroring = redisRunLimiter({ ...CONFIG, fetchImpl: pipelineFetch([[{ error: "ERR max requests limit exceeded" }, { result: 1 }]]) });
  await assert.rejects(erroring.hitAddress("a"), /redis INCR failed: ERR max requests/);
  const unreachable = redisRunLimiter({ ...CONFIG, fetchImpl: pipelineFetch([new TypeError("fetch failed")]) });
  await assert.rejects(unreachable.hitDaily(), /redis call failed/);
  const misshapen = redisRunLimiter({ ...CONFIG, fetchImpl: pipelineFetch([{ result: 1 }]) });
  await assert.rejects(misshapen.hitDaily(), /unexpected shape/);
});

test("the in-memory counter keeps the same rules for local development", async () => {
  let at = AT;
  const limiter = memoryRunLimiter({ now: () => at, maxPerWindow: 2, dailyLimit: 3 });
  assert.equal((await limiter.hitAddress("a")).ok, true);
  assert.equal((await limiter.hitAddress("a")).ok, true);
  const third = await limiter.hitAddress("a");
  assert.equal(third.ok, false);
  assert.equal(third.retryAfter, 60);
  assert.equal((await limiter.hitAddress("b")).ok, true, "addresses are counted apart");
  at += 60_000;
  assert.equal((await limiter.hitAddress("a")).ok, true, "a new window starts clean");

  assert.equal((await limiter.hitDaily()).ok, true);
  assert.equal((await limiter.hitDaily()).ok, true);
  assert.equal((await limiter.hitDaily()).ok, true);
  assert.equal((await limiter.hitDaily()).ok, false, "the fourth run of the day is refused");
  at += 86_400_000;
  assert.equal((await limiter.hitDaily()).ok, true, "a new UTC day starts clean");
});

test("the daily limit reads the environment, and junk falls back to the default, not to unlimited", () => {
  assert.equal(dailyRunLimit({}), DEFAULT_DAILY_RUN_LIMIT);
  assert.equal(dailyRunLimit({ DESK_DAILY_RUN_LIMIT: "50" }), 50);
  assert.equal(dailyRunLimit({ DESK_DAILY_RUN_LIMIT: "0" }), 0, "zero closes the Desk");
  assert.equal(dailyRunLimit({ DESK_DAILY_RUN_LIMIT: "lots" }), DEFAULT_DAILY_RUN_LIMIT);
  assert.equal(dailyRunLimit({ DESK_DAILY_RUN_LIMIT: "-5" }), DEFAULT_DAILY_RUN_LIMIT);
  assert.equal(dailyRunLimit({ DESK_DAILY_RUN_LIMIT: "Infinity" }), DEFAULT_DAILY_RUN_LIMIT);
});

// ── the daily token meter ───────────────────────────────────────────────────

/**
 * Stateful EVAL double for the request shape and error paths. It mirrors the
 * scripts' rules in JavaScript; run-limit.redis.test.mjs runs the real scripts
 * under a real Redis.
 */
function atomicMeterFetch(initial = 0) {
  const hash = { total: initial, open: new Map() };
  const calls = [];
  let error = null;
  const impl = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url: String(url), headers: init.headers, body });
    if (error) {
      const next = error;
      error = null;
      if (next instanceof Error) throw next;
      return { ok: true, status: 200, json: async () => ({ error: next }) };
    }
    const answer = (result) => ({ ok: true, status: 200, json: async () => ({ result }) });
    assert.equal(body[0], "EVAL");
    assert.equal(body[2], 1, "one key per script");
    assert.equal(body[3], "desk:acme:budget:2026-09-26");
    if (body[1] === RESERVE_TOKENS) {
      const [, , , , requested, budget, ttl, ticket] = body;
      assert.equal(ttl, 172_800);
      const before = hash.total;
      if (before + requested > budget) return answer([0, before]);
      hash.open.set(ticket, requested);
      hash.total += requested;
      return answer([1, before, hash.total]);
    }
    assert.equal(body[1], RECONCILE_TOKENS);
    const [, , , , ticket, actual, ttl] = body;
    assert.equal(ttl, 172_800);
    const reserved = hash.open.get(ticket);
    if (reserved === undefined) return answer([0, "no open reservation"]);
    if (hash.total + actual - reserved < 0) return answer([0, "would fall below zero"]);
    hash.open.delete(ticket);
    hash.total += actual - reserved;
    return answer([1, hash.total]);
  };
  impl.calls = calls;
  impl.used = () => hash.total;
  impl.failNext = (next) => {
    error = next;
  };
  return impl;
}

let serial = 0;
const tickets = () => `t${(serial += 1)}`;

test("simultaneous admissions atomically reserve no more than the token budget", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 2_000_000, namespace: "acme" });

  const admissions = await Promise.all(Array.from({ length: 200 }, () => meter.reserve(400_000)));
  assert.equal(admissions.filter((result) => result.ok).length, 5);
  assert.equal(admissions.filter((result) => !result.ok).length, 195);
  assert.equal(fetchImpl.used(), 2_000_000, "denied admissions do not increment the one daily key");
  assert.ok(fetchImpl.calls.every((call) => call.body[0] === "EVAL"));
  const ids = admissions.filter((result) => result.ok).map((result) => result.ticket);
  assert.equal(new Set(ids).size, 5, "each admission gets its own reservation id");
  assert.ok(ids.every((id) => /^r:[0-9a-f]{24}$/.test(id)));
});

test("a depleted budget is denied without changing its reservation total", async () => {
  const fetchImpl = atomicMeterFetch(1_600_001);
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 2_000_000, namespace: "acme" });
  const denied = await meter.reserve(400_000);

  assert.deepEqual(denied, {
    ok: false,
    used: 1_600_001,
    budget: 2_000_000,
    worstCase: 400_000,
    reservation: "desk:acme:budget:2026-09-26",
    ticket: "",
    retryAfter: 14 * 3600 - 30,
  });
  assert.equal(fetchImpl.used(), 1_600_001);
  await assert.rejects(meter.reconcile(denied, 0), /no reservation to reconcile/, "a refusal has nothing to refund");
});

test("Redis admission errors throw so the route fails closed", async () => {
  const fetchImpl = atomicMeterFetch();
  fetchImpl.failNext("WRONGPASS");
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, namespace: "acme" });
  await assert.rejects(meter.reserve(1), /redis EVAL failed: WRONGPASS/);

  fetchImpl.failNext(new TypeError("fetch failed"));
  await assert.rejects(meter.reserve(1), /redis call failed/);
});

test("known usage reconciles the worst-case reservation to the actual total, once", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 1_000, namespace: "acme", ticket: tickets });
  const admission = await meter.reserve(400);
  assert.equal(admission.ok, true);
  assert.equal(await meter.reconcile(admission, 125), 125);
  assert.equal(fetchImpl.used(), 125);
  const call = fetchImpl.calls.at(-1).body;
  assert.equal(call.length, 7, "reconcile sends the ticket and actual usage, not the caller's idea of the worst case");
  await assert.rejects(meter.reconcile(admission, 0), /refused to reconcile: no open reservation/);
  assert.equal(fetchImpl.used(), 125, "a second reconcile changes nothing");
});

test("post-run accounting errors retain the worst-case reservation", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 400, namespace: "acme" });
  const admission = await meter.reserve(400);
  assert.equal(admission.ok, true);
  fetchImpl.failNext(new TypeError("fetch failed"));
  await assert.rejects(meter.reconcile(admission, 125), /redis call failed/);
  assert.equal(fetchImpl.used(), 400);
  assert.equal((await meter.reserve(1)).ok, false, "a later retry cannot spend reservation room whose refund failed");
});

test("unknown usage is not reconciled and a retried admission remains blocked", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 400, namespace: "acme" });
  assert.equal((await meter.reserve(400)).ok, true);
  // The caller deliberately does not reconcile when provider usage is unknown.
  assert.equal((await meter.reserve(400)).ok, false);
  assert.equal(fetchImpl.used(), 400);
});

test("a reservation id that is not short lowercase alphanumeric is refused before any call", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, namespace: "acme", ticket: () => "TOTAL" });
  await assert.rejects(meter.reserve(1), /reservation id/);
  assert.equal(fetchImpl.calls.length, 0);
});

test("a zero budget, or one smaller than a run's worst case, closes the Desk", async () => {
  assert.equal((await memoryTokenMeter({ budget: 0 }).reserve(1)).ok, false);
  assert.equal((await memoryTokenMeter({ budget: 100 }).reserve(101)).ok, false);
  assert.equal((await memoryTokenMeter({ budget: 100 }).reserve(100)).ok, true);
});

test("the in-memory meter reserves atomically, reconciles once, and resets each UTC day", async () => {
  let at = AT;
  const meter = memoryTokenMeter({ now: () => at, budget: 1000, ticket: tickets });
  const admissions = await Promise.all([meter.reserve(400), meter.reserve(400), meter.reserve(400)]);
  assert.deepEqual(admissions.map((result) => result.ok), [true, true, false]);
  assert.equal(await meter.reconcile(admissions[0], 200), 600);
  await assert.rejects(meter.reconcile(admissions[0], 0), /no open reservation/, "a repeated refund is refused");
  assert.equal((await meter.reserve(400)).ok, true, "a known refund makes room available");
  at += 86_400_000;
  const next = await meter.reserve(400);
  assert.equal(next.ok, true);
  assert.equal(next.used, 0);
  assert.equal(next.reservation, "2026-09-27");
});

test("the token budget reads the environment, and junk falls back to the default", () => {
  assert.equal(dailyTokenBudget({}), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "500000" }), 500_000);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "0" }), 0, "zero closes the Desk");
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "2e6" }), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "-1" }), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "99999999999999999999" }), DEFAULT_DAILY_TOKEN_BUDGET);
});
