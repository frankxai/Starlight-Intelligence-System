// node --experimental-strip-types --import ./scripts/test/register.mjs --test src/lib/desk/run-limit.test.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { DEFAULT_DAILY_RUN_LIMIT, dailyRunLimit, memoryRunLimiter, redisRunLimiter } from "./run-limit.ts";

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
  const limiter = redisRunLimiter({ ...CONFIG, fetchImpl }, { now: () => AT });
  const hit = await limiter.hitAddress("203.0.113.7");

  assert.deepEqual(hit, { ok: true, count: 1, limit: 6, retryAfter: 0 });
  const digest = createHash("sha256").update("203.0.113.7").digest("hex").slice(0, 32);
  const key = `desk:limit:addr:${digest}:${Math.floor(AT / 60_000)}`;
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
    ["INCR", "desk:limit:day:2026-09-26"],
    ["EXPIRE", "desk:limit:day:2026-09-26", 172_800],
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
