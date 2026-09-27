// node --import ./scripts/test/register.mjs --test src/lib/desk/run-limit.redis.test.mjs
//
// The token meter's Lua scripts under a real Redis EVAL, reached through the
// same REST client the route uses. CI runs a Redis service container; locally
// the test starts redis-server when it is installed, and skips, saying so,
// when it is not.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { redisTokenMeter } from "./run-limit.ts";
import { startRedisRest } from "./redis-test-server.mjs";

const AT = Date.UTC(2026, 8, 26, 10, 0, 30);
const DAY = "2026-09-26";

let rest = null;
let skip = false;

before(async () => {
  rest = await startRedisRest();
  if (!rest && process.env.CI) throw new Error("CI must run the token meter against a real Redis: set DESK_TEST_REDIS_URL");
  if (!rest) skip = "no Redis: set DESK_TEST_REDIS_URL or install redis-server";
});

after(async () => {
  await rest?.close();
});

let namespaces = 0;
/** A meter on its own namespace, so tests never share a key. */
function meterFor(budget) {
  const namespace = `t${process.pid}n${(namespaces += 1)}`;
  const meter = redisTokenMeter({ url: rest.url, token: rest.token }, { now: () => AT, budget, namespace });
  return { meter, key: `desk:${namespace}:budget:${DAY}` };
}

async function total(key) {
  const value = await rest.redis(["HGET", key, "total"]);
  return value === null ? null : Number(value);
}

test("real Redis: concurrent admissions reserve no more than the budget", async (t) => {
  if (skip) return t.skip(skip);
  const { meter, key } = meterFor(2_000_000);
  const admissions = await Promise.all(Array.from({ length: 60 }, () => meter.reserve(400_000)));
  assert.equal(admissions.filter((result) => result.ok).length, 5);
  assert.equal(await total(key), 2_000_000);
  assert.equal(await rest.redis(["HLEN", key]), 6, "the total plus five open reservations");
  assert.ok((await rest.redis(["TTL", key])) > 0, "the day's hash expires");
});

test("real Redis: known usage replaces the reservation, and a second reconcile is refused without writing", async (t) => {
  if (skip) return t.skip(skip);
  const { meter, key } = meterFor(1_000_000);
  const first = await meter.reserve(400_000);
  const second = await meter.reserve(400_000);
  assert.equal(await meter.reconcile(first, 100_000), 500_000);
  await assert.rejects(meter.reconcile(first, 0), /refused to reconcile: no open reservation/);
  assert.equal(await total(key), 500_000, "the repeated refund changed nothing, though another reservation keeps the total positive");
  assert.equal(await meter.reconcile(second, 0), 100_000);
});

test("real Redis: a missing day key refuses to reconcile and never writes a negative total", async (t) => {
  if (skip) return t.skip(skip);
  const { meter, key } = meterFor(1_000_000);
  const admission = await meter.reserve(400_000);
  await rest.redis(["DEL", key]); // an expired or evicted key
  await assert.rejects(meter.reconcile(admission, 0), /refused to reconcile: no open reservation/);
  assert.equal(await rest.redis(["EXISTS", key]), 0, "the refusal did not recreate the key");
  const next = await meter.reserve(1_000_000);
  assert.equal(next.ok, true);
  assert.equal(next.used, 0, "the next admission starts from zero");
});

test("real Redis: a refund that would take the total below zero is refused before any write", async (t) => {
  if (skip) return t.skip(skip);
  const { meter, key } = meterFor(1_000_000);
  const admission = await meter.reserve(400_000);
  await rest.redis(["HSET", key, "total", 10]); // a total that no longer covers the reservation
  await assert.rejects(meter.reconcile(admission, 0), /refused to reconcile: would fall below zero/);
  assert.equal(await total(key), 10);
  assert.equal(await rest.redis(["HEXISTS", key, admission.ticket]), 1, "the reservation stays open");
});

test("real Redis: a total that is missing its field, negative, or not a number is never read as headroom", async (t) => {
  if (skip) return t.skip(skip);
  const { meter, key } = meterFor(1_000_000);
  const admission = await meter.reserve(400_000);
  await rest.redis(["HDEL", key, "total"]);
  await assert.rejects(meter.reconcile(admission, 0), /refused to reconcile: no valid total/);
  assert.equal(await total(key), null, "no total was written");

  await rest.redis(["HSET", key, "total", -500_000]);
  await assert.rejects(meter.reserve(1), /DESK token total is invalid/, "admission fails closed, so the route answers 503");
  await rest.redis(["HSET", key, "total", "lots"]);
  await assert.rejects(meter.reserve(1), /DESK token total is invalid/);
});

test("real Redis: usage above the reservation is charged in full", async (t) => {
  if (skip) return t.skip(skip);
  const { meter, key } = meterFor(1_000_000);
  const admission = await meter.reserve(400);
  assert.equal(await meter.reconcile(admission, 450), 450);
  assert.equal(await total(key), 450);
});
