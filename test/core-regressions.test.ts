import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { MemoryManager } from "../src/memory.js";
import { RetrievalIndex } from "../src/retrieval.js";

function withTempDir<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("core regression coverage", () => {
  it("MemoryManager.save creates parent directories for platform-native paths", () => {
    withTempDir("sis-memory-", (dir) => {
      const storagePath = join(dir, "nested", "memory.json");
      const memory = new MemoryManager(storagePath);

      memory.add({
        content: "Memory persistence works with platform-native paths.",
        category: "test",
        tags: ["memory", "filesystem"],
        confidence: 1,
      });
      memory.save();

      const saved = JSON.parse(readFileSync(storagePath, "utf8"));
      assert.equal(saved.length, 1);
      assert.equal(saved[0].content, "Memory persistence works with platform-native paths.");
    });
  });

  it("RetrievalIndex.rebuildFromVaults indexes MCP-style content entries", () => {
    withTempDir("sis-retrieval-", (dir) => {
      const vaultDir = join(dir, "vaults");
      const dbPath = join(dir, "index.sqlite");
      mkdirSync(vaultDir, { recursive: true });
      writeFileSync(
        join(vaultDir, "technical.jsonl"),
        JSON.stringify({
          id: "content-entry",
          content: "SQLite retrieval should index content fields from MCP appends.",
          vault: "technical",
          category: "regression",
          confidence: "high",
          tags: ["retrieval"],
          createdAt: "2026-05-06T00:00:00.000Z",
        }) + "\n",
        "utf8",
      );

      const index = new RetrievalIndex(dbPath);
      try {
        assert.equal(index.rebuildFromVaults(vaultDir), 1);
        const results = index.search("MCP appends", { limit: 5 });
        assert.equal(results.length, 1);
        assert.equal(results[0].entry.id, "content-entry");
      } finally {
        index.close();
      }
    });
  });

  it("README protocol badge matches the canonical SIP.md version", () => {
    const sip = readFileSync("SIP.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const version = sip.match(/^Version:\s+`(v\d+\.\d+\.\d+)`/m)?.[1];

    assert.ok(version, "SIP.md is missing a canonical Version line");
    assert.match(readme, new RegExp(`SIP-${version}`));
    assert.match(readme, new RegExp(`/badge/${version}`));
  });
});
