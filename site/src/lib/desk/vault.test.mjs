// node --experimental-strip-types --import ./scripts/test/register.mjs --test src/lib/desk/vault.test.mjs
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  NO_DURABLE_VAULT,
  appendAtoms,
  fileVault,
  findRelated,
  overlap,
  readAtoms,
  redisVault,
  selectVault,
  terms,
  vaultNamespace,
  vaultPath,
} from "./vault.ts";
import { redisConfigFromEnv } from "./redis-rest.ts";

function atom(id, question, claim) {
  return { id, kind: "belief", question, claim, quote: "q", url: "https://example.org/x", confidence: 0.8, receiptId: "r", at: "2026-09-22T00:00:00Z" };
}

test("beliefs round-trip through the file, newest last", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vault-"));
  const path = join(dir, "nested", "vault.jsonl");
  assert.equal(await appendAtoms(path, [atom("1", "q one", "c one")]), 1);
  assert.equal(await appendAtoms(path, [atom("2", "q two", "c two"), atom("3", "q three", "c three")]), 2);
  const read = await readAtoms(path);
  assert.deepEqual(read.map((a) => a.id), ["1", "2", "3"]);
  assert.equal((await readFile(path, "utf8")).trim().split("\n").length, 3, "one line per belief");
});

test("a missing vault reads as empty rather than throwing", async () => {
  assert.deepEqual(await readAtoms(join(tmpdir(), "definitely-absent", "v.jsonl")), []);
});

test("a torn line is skipped and the rest survive", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vault-"));
  const path = join(dir, "v.jsonl");
  await writeFile(path, `${JSON.stringify(atom("1", "q", "c"))}\n{"broken":\n${JSON.stringify(atom("2", "q", "c"))}\n\n`, "utf8");
  assert.deepEqual((await readAtoms(path)).map((a) => a.id), ["1", "2"]);
});

test("writing nothing writes nothing", async () => {
  assert.equal(await appendAtoms(join(tmpdir(), "unused.jsonl"), []), 0);
});

test("related beliefs are found by content words, and unrelated ones are left alone", () => {
  const atoms = [
    atom("1", "What changed in open reasoning models?", "Open reasoning models improved on citation tasks."),
    atom("2", "How should I price a cohort?", "Cohort pricing follows the value of the outcome."),
    atom("3", "unrelated", "Reasoning models are getting cheaper to run."),
  ];
  const related = findRelated(atoms, "What changed in open reasoning models this quarter?");
  assert.ok(related.some((a) => a.id === "1"), "the matching question is found");
  assert.ok(!related.some((a) => a.id === "2"), "the pricing belief stays out of it");
});

test("overlap and terms behave", () => {
  assert.equal(overlap(new Set(), new Set(["a"])), 0);
  assert.equal(overlap(new Set(["alpha"]), new Set(["alpha"])), 1);
  assert.ok(!terms("The and of a").has("the"), "stopwords are dropped");
  assert.ok(terms("Reasoning models").has("reasoning"));
});

test("the vault path follows the environment", () => {
  assert.equal(vaultPath({ DESK_VAULT_PATH: "/custom/v.jsonl" }), "/custom/v.jsonl");
  assert.equal(vaultPath({}), ".starlight/desk-vault.jsonl");
});

// ── store selection ─────────────────────────────────────────────────────────

const KV = { KV_REST_API_URL: "https://kv.example.upstash.io/", KV_REST_API_TOKEN: "kv-token" };
const UPSTASH = { UPSTASH_REDIS_REST_URL: "https://up.example.upstash.io", UPSTASH_REDIS_REST_TOKEN: "up-token" };

test("a laptop gets the file vault it can cat", () => {
  const picked = selectVault({ DESK_VAULT_PATH: "/custom/v.jsonl" });
  assert.equal(picked.store?.kind, "file");
  assert.equal(picked.store?.ref, "/custom/v.jsonl");
  assert.equal(selectVault({}).store?.ref, ".starlight/desk-vault.jsonl");
});

test("a configured Redis REST backend wins, on Vercel or off it", () => {
  assert.equal(selectVault({ ...KV }).store?.kind, "redis");
  assert.equal(selectVault({ ...KV, VERCEL: "1", DESK_VAULT_PATH: "/x.jsonl" }).store?.kind, "redis");
  assert.equal(selectVault({ ...UPSTASH, VERCEL: "1" }).store?.ref, "redis:desk:vault:default");
});

test("Vercel with no durable store gets no vault, never a silent /tmp", () => {
  const picked = selectVault({ VERCEL: "1" });
  assert.equal(picked.store, null);
  assert.equal(picked.reason, NO_DURABLE_VAULT);
  const explicit = selectVault({ VERCEL: "1", DESK_VAULT_PATH: "/tmp/desk-vault.jsonl" });
  assert.equal(explicit.store, null, "an explicit path on a serverless host is still per-instance and erased");
});

test("the Marketplace names win over the Upstash names, and half a pair is no pair", () => {
  assert.deepEqual(redisConfigFromEnv({ ...KV, ...UPSTASH }), { url: "https://kv.example.upstash.io", token: "kv-token" });
  assert.deepEqual(redisConfigFromEnv({ ...UPSTASH }), { url: "https://up.example.upstash.io", token: "up-token" });
  assert.deepEqual(redisConfigFromEnv({ KV_REST_API_URL: "https://kv", ...UPSTASH }), {
    url: "https://up.example.upstash.io",
    token: "up-token",
  });
  assert.equal(redisConfigFromEnv({ KV_REST_API_URL: "https://kv" }), null);
  assert.equal(redisConfigFromEnv({}), null);
});

test("the namespace is a safe key segment or the default", () => {
  assert.equal(vaultNamespace({ DESK_VAULT_NAMESPACE: "acme-prod" }), "acme-prod");
  assert.equal(vaultNamespace({ DESK_VAULT_NAMESPACE: "a b:c" }), "default");
  assert.equal(vaultNamespace({}), "default");
});

test("the file store behaves exactly as the file helpers do", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vault-"));
  const store = fileVault(join(dir, "v.jsonl"));
  assert.equal(await store.append([atom("1", "q", "c"), atom("2", "q", "c")]), 2);
  assert.deepEqual((await store.read()).map((a) => a.id), ["1", "2"]);
  assert.deepEqual((await store.read(1)).map((a) => a.id), ["2"], "the newest survive a limit");
});

// ── the Redis store, against a recorded fetch ───────────────────────────────

function redisFetch(answers) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url: String(url), method: init.method, headers: init.headers, body: JSON.parse(init.body) });
    const next = answers.shift();
    if (!next) throw new Error(`unscripted call to ${url}`);
    return { ok: next.status === undefined || next.status < 400, status: next.status ?? 200, json: async () => next.body };
  };
  impl.calls = calls;
  return impl;
}

test("the Redis store appends with one RPUSH of JSON lines", async () => {
  const fetchImpl = redisFetch([{ body: { result: 2 } }]);
  const store = redisVault({ url: "https://kv.example.upstash.io", token: "kv-token", fetchImpl }, "acme");
  const atoms = [atom("1", "q one", "c one"), atom("2", "q two", "c two")];
  assert.equal(await store.append(atoms), 2);
  assert.deepEqual(fetchImpl.calls, [
    {
      url: "https://kv.example.upstash.io",
      method: "POST",
      headers: { authorization: "Bearer kv-token", "content-type": "application/json" },
      body: ["RPUSH", "desk:vault:acme", JSON.stringify(atoms[0]), JSON.stringify(atoms[1])],
    },
  ]);
  assert.equal(store.ref, "redis:desk:vault:acme", "the receipt names the list, never the URL or token");
});

test("the Redis store reads the newest lines with LRANGE and skips what does not parse", async () => {
  const fetchImpl = redisFetch([
    { body: { result: [JSON.stringify(atom("1", "q", "c")), "{\"broken\":", JSON.stringify({ kind: "other" }), JSON.stringify(atom("2", "q", "c"))] } },
  ]);
  const store = redisVault({ url: "https://kv.example.upstash.io", token: "kv-token", fetchImpl });
  assert.deepEqual((await store.read(50)).map((a) => a.id), ["1", "2"]);
  assert.deepEqual(fetchImpl.calls[0].body, ["LRANGE", "desk:vault:default", -50, -1]);
});

test("writing nothing to Redis makes no call", async () => {
  const fetchImpl = redisFetch([]);
  assert.equal(await redisVault({ url: "https://kv", token: "t", fetchImpl }).append([]), 0);
  assert.equal(fetchImpl.calls.length, 0);
});

test("a Redis refusal throws, so the cascade records a failed stage", async () => {
  const store = redisVault({
    url: "https://kv",
    token: "t",
    fetchImpl: redisFetch([{ status: 401, body: { error: "WRONGPASS invalid token" } }]),
  });
  await assert.rejects(store.append([atom("1", "q", "c")]), /redis answered 401: WRONGPASS/);
  const errored = redisVault({ url: "https://kv", token: "t", fetchImpl: redisFetch([{ body: { error: "OOM" } }]) });
  await assert.rejects(errored.read(), /redis LRANGE failed: OOM/);
  const down = redisVault({
    url: "https://kv",
    token: "t",
    fetchImpl: async () => {
      throw new TypeError("fetch failed");
    },
  });
  await assert.rejects(down.read(), /redis call failed: fetch failed/);
});
