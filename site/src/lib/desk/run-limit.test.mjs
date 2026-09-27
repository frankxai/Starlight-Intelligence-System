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

test("the token meter reads today's total with one GET and refuses a run that could pass the budget", async () => {
  const fetchImpl = pipelineFetch([{ result: "1500000" }, { result: "1600001" }, { result: null }]);
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, budget: 2_000_000, namespace: "acme" });

  assert.deepEqual(await meter.check(400_000), { ok: true, used: 1_500_000, budget: 2_000_000, worstCase: 400_000, retryAfter: 0 });
  const over = await meter.check(400_000);
  assert.equal(over.ok, false, "1,600,001 used plus a 400,000 worst case passes 2,000,000");
  assert.equal(over.retryAfter, 14 * 3600 - 30, "until midnight UTC");
  assert.equal((await meter.check(400_000)).used, 0, "a day with no key has used nothing");

  assert.deepEqual(fetchImpl.calls[0], {
    url: "https://kv.example.upstash.io",
    headers: { authorization: "Bearer kv-token", "content-type": "application/json" },
    body: ["GET", "desk:acme:tok:2026-09-26"],
  });
});

test("after a run the meter adds its tokens with one pipelined INCRBY and EXPIRE", async () => {
  const fetchImpl = pipelineFetch([[{ result: 12_345 }, { result: 1 }]]);
  const meter = redisTokenMeter({ ...CONFIG, fetchImpl }, { now: () => AT, namespace: "acme" });
  assert.equal(await meter.record(12_344.2), 12_345);
  assert.deepEqual(fetchImpl.calls, [
    {
      url: "https://kv.example.upstash.io/pipeline",
      headers: { authorization: "Bearer kv-token", "content-type": "application/json" },
      body: [
        ["INCRBY", "desk:acme:tok:2026-09-26", 12_345],
        ["EXPIRE", "desk:acme:tok:2026-09-26", 172_800],
      ],
    },
  ]);
});

test("a token meter that errors throws, so the route fails closed", async () => {
  const erroring = redisTokenMeter({ ...CONFIG, fetchImpl: pipelineFetch([{ error: "WRONGPASS" }]) });
  await assert.rejects(erroring.check(1), /redis GET failed: WRONGPASS/);
  const junk = redisTokenMeter({ ...CONFIG, fetchImpl: pipelineFetch([{ result: "lots" }]) });
  await assert.rejects(junk.check(1), /not a number/);
  const down = redisTokenMeter({ ...CONFIG, fetchImpl: pipelineFetch([new TypeError("fetch failed")]) });
  await assert.rejects(down.record(10), /redis call failed/);
});

test("a zero budget, or one smaller than a run's worst case, closes the Desk", async () => {
  assert.equal((await memoryTokenMeter({ budget: 0 }).check(1)).ok, false);
  assert.equal((await memoryTokenMeter({ budget: 100 }).check(101)).ok, false);
  assert.equal((await memoryTokenMeter({ budget: 100 }).check(100)).ok, true);
});

test("the in-memory meter keeps the same rules and starts clean each UTC day", async () => {
  let at = AT;
  const meter = memoryTokenMeter({ now: () => at, budget: 1000 });
  assert.equal((await meter.check(400)).ok, true);
  assert.equal(await meter.record(500), 500);
  assert.equal((await meter.check(400)).ok, true, "500 + 400 fits in 1000");
  assert.equal(await meter.record(200), 700);
  assert.equal((await meter.check(400)).ok, false, "700 + 400 does not");
  at += 86_400_000;
  assert.deepEqual(await meter.check(400), { ok: true, used: 0, budget: 1000, worstCase: 400, retryAfter: 0 });
});

test("the token budget reads the environment, and junk falls back to the default", () => {
  assert.equal(dailyTokenBudget({}), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "500000" }), 500_000);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "0" }), 0, "zero closes the Desk");
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "2e6" }), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "-1" }), DEFAULT_DAILY_TOKEN_BUDGET);
  assert.equal(dailyTokenBudget({ DESK_DAILY_TOKEN_BUDGET: "99999999999999999999" }), DEFAULT_DAILY_TOKEN_BUDGET);
});
