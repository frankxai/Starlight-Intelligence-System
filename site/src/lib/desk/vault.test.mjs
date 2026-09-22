// node --experimental-strip-types --import ./scripts/test/register.mjs --test src/lib/desk/vault.test.mjs
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { appendAtoms, findRelated, overlap, readAtoms, terms, vaultPath } from "./vault.ts";

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
  assert.equal(vaultPath({ VERCEL: "1" }), "/tmp/desk-vault.jsonl", "a serverless filesystem only writes to /tmp");
  assert.equal(vaultPath({}), ".starlight/desk-vault.jsonl");
});
