/**
 * v9.3 Memory Integrity — the five-defect regression suite.
 *
 * Guards the fixes for the silent-corruption class defects found in the
 * 2026-07-02 memory-pipeline recon:
 *   D1 — consolidation blindness: contradiction + dreaming readers must see
 *        `content` atoms (runtime writes), not only `insight`/`wish` (seeded).
 *   D2 — split-brain stores: VaultMemory.rememberInVault mirrors a flat atom
 *        into <storage>/vaults/<vault>.jsonl (the MCP/retrieval store) —
 *        except private-tagged entries, which stay event-store-only.
 *   D4 — duplicate-id total outage: rebuildFromVaults keeps throw-by-default
 *        (pinned by core-regressions) but supports {onDuplicate:'skip'} with a
 *        report, so operational callers degrade instead of losing all search.
 *   D5 — The Veil on the write path: secrets are scrubbed before an atom is
 *        persisted (PII scrubbing stays opt-in for a personal memory system).
 *
 * Built on SIP — operational tier (memory integrity).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { atomText, normalizeAtom } from "../src/atom.js";
import { ContradictionDetector } from "../src/contradiction.js";
import { DreamingAgent } from "../src/dreaming.js";
import { RetrievalIndex } from "../src/retrieval.js";
import { VaultMemory } from "../src/vault-memory.js";

function withTempDir(prefix: string, fn: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const now = () => new Date().toISOString();

describe("atom — canonical text resolution", () => {
  it("resolves content ?? insight ?? wish in that order", () => {
    assert.equal(atomText({ content: "a", insight: "b", wish: "c" }), "a");
    assert.equal(atomText({ insight: "b", wish: "c" }), "b");
    assert.equal(atomText({ wish: "c" }), "c");
    assert.equal(atomText({}), "");
  });

  it("normalizeAtom fills vault fallback and preserves raw", () => {
    const atom = normalizeAtom({ id: "x1", insight: "hello", tags: ["t"] }, "technical");
    assert.equal(atom.vault, "technical");
    assert.equal(atom.text, "hello");
    assert.deepEqual(atom.tags, ["t"]);
    assert.equal(atom.raw.insight, "hello");
  });
});

describe("D1 — runtime `content` atoms are visible to consolidation", () => {
  it("contradiction detector flags a conflict between a content atom and an insight atom", () => {
    withTempDir("sis-d1-contra-", (dir) => {
      // Runtime-written atom (content field) vs seeded atom (insight field),
      // near-identical opposing statements across two vaults.
      writeFileSync(join(dir, "technical.jsonl"), JSON.stringify({
        id: "t1", vault: "technical", createdAt: now(),
        content: "Always cache the rebuilt index between sessions for cold-start retrieval",
      }) + "\n");
      writeFileSync(join(dir, "strategic.jsonl"), JSON.stringify({
        id: "s1", vault: "strategic", createdAt: now(),
        insight: "Never cache the rebuilt index between sessions for cold-start retrieval",
      }) + "\n");

      const conflicts = new ContradictionDetector().scanVaults(dir, { minSimilarity: 0.6 });
      assert.ok(conflicts.length >= 1, "content-field atom must participate in contradiction detection");
      const ids = conflicts.flatMap((c) => [c.entryA.id, c.entryB.id]);
      assert.ok(ids.includes("t1"), "the runtime `content` atom is part of the detected conflict");
    });
  });

  it("dreaming promotions consider content atoms for cross-vault patterns", () => {
    withTempDir("sis-d1-dream-", (dir) => {
      const text = "Read the file before editing it to avoid clobbering concurrent state";
      writeFileSync(join(dir, "technical.jsonl"), JSON.stringify({
        id: "t1", vault: "technical", createdAt: now(), content: text,
      }) + "\n");
      writeFileSync(join(dir, "operational.jsonl"), JSON.stringify({
        id: "o1", vault: "operational", createdAt: now(), insight: text,
      }) + "\n");

      const promos = new DreamingAgent(dir).identifyPromotions(dir);
      assert.ok(
        promos.some((p) => p.entryId === "t1" || p.entryId === "o1"),
        "cross-vault pattern spanning a content atom and an insight atom must be promotable",
      );
    });
  });
});

describe("D4 — duplicate ids degrade instead of destroying the index (opt-in)", () => {
  it("skip mode indexes the first occurrence and reports the duplicate", () => {
    withTempDir("sis-d4-", (dir) => {
      writeFileSync(join(dir, "strategic.jsonl"), [
        JSON.stringify({ id: "dup", vault: "strategic", createdAt: now(), insight: "first wins" }),
        JSON.stringify({ id: "dup", vault: "strategic", createdAt: now(), insight: "second skipped" }),
        JSON.stringify({ id: "ok", vault: "strategic", createdAt: now(), insight: "unrelated entry" }),
      ].join("\n") + "\n");

      const index = new RetrievalIndex(join(dir, "index.sqlite"));
      try {
        const count = index.rebuildFromVaults(dir, { onDuplicate: "skip" });
        assert.equal(count, 2, "first occurrence + the unique entry are indexed");
        const dups = index.getLastDuplicates();
        assert.equal(dups.length, 1);
        assert.equal(dups[0].id, "dup");
        assert.equal(index.getEntry("dup")?.content, "first wins");
      } finally {
        index.close();
      }
    });
  });

  it("default mode still throws (silent replacement stays impossible)", () => {
    withTempDir("sis-d4-throw-", (dir) => {
      writeFileSync(join(dir, "strategic.jsonl"), [
        JSON.stringify({ id: "dup", vault: "strategic", createdAt: now(), insight: "first" }),
        JSON.stringify({ id: "dup", vault: "strategic", createdAt: now(), insight: "second" }),
      ].join("\n") + "\n");

      const index = new RetrievalIndex(join(dir, "index.sqlite"));
      try {
        assert.throws(() => index.rebuildFromVaults(dir), /Duplicate vault entry id "dup"/);
      } finally {
        index.close();
      }
    });
  });
});

describe("D5 — The Veil scrubs secrets on the write path", () => {
  it("rememberInVault masks an API key but keeps ordinary prose", () => {
    withTempDir("sis-d5-", (dir) => {
      const memory = new VaultMemory({ storagePath: dir });
      memory.load();
      const secret = "sk-" + "a".repeat(48);
      const entry = memory.rememberInVault(
        `Rotate the key ${secret} after the incident`,
        "operational",
        [],
        0.8,
        "test",
      );
      assert.ok(!entry.content.includes(secret), "secret must not persist");
      assert.match(entry.content, /\[REDACTED\]/);
      assert.match(entry.content, /Rotate the key/, "surrounding prose survives");
    });
  });

  it("PII (email) is kept by default — personal memory stores contacts", () => {
    withTempDir("sis-d5-pii-", (dir) => {
      const memory = new VaultMemory({ storagePath: dir });
      memory.load();
      const entry = memory.rememberInVault(
        "Follow up with ada@example.com about the alliance",
        "operational",
      );
      assert.match(entry.content, /ada@example\.com/, "PII scrubbing is opt-in (STARLIGHT_SCRUB_PII=1)");
    });
  });
});

describe("D2 — VaultMemory mirrors flat atoms into the vaults/ store", () => {
  it("a remembered entry lands in <storage>/vaults/<vault>.jsonl for MCP/retrieval", () => {
    withTempDir("sis-d2-", (dir) => {
      const memory = new VaultMemory({ storagePath: dir });
      memory.load();
      const entry = memory.rememberInVault("Mirror this atom into the shared store", "strategic");

      const vaultFile = join(dir, "vaults", "strategic.jsonl");
      assert.ok(existsSync(vaultFile), "vaults/strategic.jsonl created by the mirror write");
      const atoms = readFileSync(vaultFile, "utf-8").trim().split("\n").map((l) => JSON.parse(l));
      const mirrored = atoms.find((a) => a.id === entry.id);
      assert.ok(mirrored, "the mirrored atom carries the same id");
      assert.equal(mirrored.content, "Mirror this atom into the shared store");

      // And the retrieval index can see it — the split brain is bridged.
      const index = new RetrievalIndex(join(dir, "index.sqlite"));
      try {
        index.rebuildFromVaults(join(dir, "vaults"));
        const hits = index.search("mirror shared store");
        assert.ok(hits.some((h) => h.entry.id === entry.id), "mirrored atom is searchable");
      } finally {
        index.close();
      }
    });
  });

  it("private-tagged entries are NOT mirrored (gateway privacy model preserved)", () => {
    withTempDir("sis-d2-priv-", (dir) => {
      const memory = new VaultMemory({ storagePath: dir });
      memory.load();
      memory.rememberInVault("A private reflection that stays in the event store", "strategic", ["private"]);

      const vaultFile = join(dir, "vaults", "strategic.jsonl");
      if (existsSync(vaultFile)) {
        const text = readFileSync(vaultFile, "utf-8");
        assert.ok(!text.includes("private reflection"), "private entries never reach the shared vault files");
      }
    });
  });
});
