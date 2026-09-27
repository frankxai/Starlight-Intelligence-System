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

/** Stateful Redis EVAL double: JavaScript serializes execution just as Redis does. */
function atomicMeterFetch(initial = 0) {
  let used = initial;
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
    const [, script, keyCount, key, first, second, ttl] = body;
    assert.equal(body[0], "EVAL");
    assert.equal(keyCount, 1);
    assert.equal(key, "desk:acme:tok:2026-09-26");
    assert.equal(ttl, 172_800);
    if (script.includes("used + requested")) {
      const before = used;
      if (used + first > second) return { ok: true, status: 200, json: async () => ({ result: [0, before] }) };
      used += first;
      return { ok: true, status: 200, json: async () => ({ result: [1, before, used] }) };
    }
    used += second - first;
    return { ok: true, status: 200, json: async () => ({ result: used }) };
  };
  impl.calls = calls;
  impl.used = () => used;
  impl.failNext = (next) => {
    error = next;
  };
  return impl;
}

test("simultaneous admissions atomically reserve no more than the token budget", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 2_000_000, namespace: "acme" });

  const admissions = await Promise.all(Array.from({ length: 200 }, () => meter.reserve(400_000)));
  assert.equal(admissions.filter((result) => result.ok).length, 5);
  assert.equal(admissions.filter((result) => !result.ok).length, 195);
  assert.equal(fetchImpl.used(), 2_000_000, "denied admissions do not increment the one daily key");
  assert.ok(fetchImpl.calls.every((call) => call.body[0] === "EVAL"));
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
    reservation: "desk:acme:tok:2026-09-26",
    retryAfter: 14 * 3600 - 30,
  });
  assert.equal(fetchImpl.used(), 1_600_001);
});

test("Redis admission errors throw so the route fails closed", async () => {
  const fetchImpl = atomicMeterFetch();
  fetchImpl.failNext("WRONGPASS");
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, namespace: "acme" });
  await assert.rejects(meter.reserve(1), /redis EVAL failed: WRONGPASS/);

  fetchImpl.failNext(new TypeError("fetch failed"));
  await assert.rejects(meter.reserve(1), /redis call failed/);
});

test("known usage reconciles the worst-case reservation to the actual total", async () => {
  const fetchImpl = atomicMeterFetch();
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 1_000, namespace: "acme" });
  const admission = await meter.reserve(400);
  assert.equal(admission.ok, true);
  assert.equal(await meter.reconcile(admission, 125), 125);
  assert.equal(fetchImpl.used(), 125);
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

test("a zero budget, or one smaller than a run's worst case, closes the Desk", async () => {
  assert.equal((await memoryTokenMeter({ budget: 0 }).reserve(1)).ok, false);
  assert.equal((await memoryTokenMeter({ budget: 100 }).reserve(101)).ok, false);
  assert.equal((await memoryTokenMeter({ budget: 100 }).reserve(100)).ok, true);
});

test("the in-memory meter reserves atomically, reconciles, and resets each UTC day", async () => {
  let at = AT;
  const meter = memoryTokenMeter({ now: () => at, budget: 1000 });
  const admissions = await Promise.all([meter.reserve(400), meter.reserve(400), meter.reserve(400)]);
  assert.deepEqual(admissions.map((result) => result.ok), [true, true, false]);
  assert.equal(await meter.reconcile(admissions[0], 200), 600);
  assert.equal((await meter.reserve(400)).ok, true, "a known refund makes room available");
  at += 86_400_000;
  assert.deepEqual(await meter.reserve(400), {
    ok: true,
    used: 0,
    budget: 1000,
    worstCase: 400,
    reservation: "2026-09-27",
    retryAfter: 0,
  });
});

test("the token budget reads the environment, and junk falls back to the default", () => {
  assert.equal(dailyTokenBudget({}), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "500000" }), 500_000);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "0" }), 0, "zero closes the Desk");
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "2e6" }), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "-1" }), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "99999999999999999999" }), DEFAULT_DAILY_TOKEN_BUDGET);
});
