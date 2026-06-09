import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { StarlightIntelligence } from "../src/index.js";
import { MemoryManager } from "../src/memory.js";
import { inspectMemoryHealth, updateVaultConsolidationStamps } from "../src/memory-health.js";
import { RetrievalIndex } from "../src/retrieval.js";
import type { AgentDefinition } from "../src/types.js";

function withTempDir<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function withTempDirAsync<T>(prefix: string, fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return await fn(dir);
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

  it("StarlightIntelligence keeps the documented API wired to JSONL memory", async () => {
    await withTempDirAsync("sis-public-api-", async (dir) => {
      const memoryPath = join(dir, ".starlight", "memory.json");
      const agents: AgentDefinition[] = [
        {
          id: "test-builder",
          name: "Test Builder",
          type: "specialist",
          description: "Builds test fixtures",
          skills: ["testing"],
          triggers: {
            keywords: ["build", "test"],
          },
        },
      ];

      const sis = new StarlightIntelligence({
        memoryPath,
        agents,
        executor: async (agent, input) => `${agent} handled ${input}`,
      });
      sis.initialize();

      const entry = sis.remember({
        content: "Public API regression memory should appear in generated context.",
        category: "pattern",
        tags: ["api", "regression"],
        confidence: 0.95,
      });
      assert.equal(entry.vault, "technical");
      assert.ok(existsSync(join(dir, ".starlight", "memory.jsonl")));
      assert.equal(existsSync(join(dir, ".starlight", "memory.json", "memory.jsonl")), false);

      const context = sis.generateContext({
        target: "generic",
        layers: ["memory", "agents"],
        maxTokens: 1000,
      });
      assert.match(context.content, /Public API regression memory/);

      const recommendations = sis.routeTask("build a test fixture");
      assert.equal(recommendations[0]?.agent.id, "test-builder");
      assert.equal(typeof sis.getOrchestrator().execute, "function");
      sis.setExecutor(async (agent, input) => `${agent} reset executor for ${input}`);

      const result = await sis.orchestrate({
        intent: "build a test fixture",
        pattern: "direct",
      });
      assert.equal(result.pattern, "direct");
      assert.equal(result.executions[0]?.agent, "test-builder");
      assert.match(result.executions[0]?.output ?? "", /reset executor/);
    });
  });

  it("inspectMemoryHealth reports fresh memory surfaces from repo-local files", () => {
    withTempDir("sis-memory-health-", (dir) => {
      const memoryRoot = join(dir, "memory");
      const vaultDir = join(memoryRoot, "vaults");
      const voiceDir = join(memoryRoot, "voice-sessions");
      const kgDir = join(memoryRoot, "knowledge-graph");
      const mempalaceDir = join(memoryRoot, "mempalace");

      mkdirSync(vaultDir, { recursive: true });
      mkdirSync(voiceDir, { recursive: true });
      mkdirSync(kgDir, { recursive: true });
      mkdirSync(mempalaceDir, { recursive: true });

      const freshVault = (name: string) => `---\ntype: vault\nvault: ${name}\nretention: permanent\nwriters: [test]\nreaders: all\nlast_consolidated: 2026-05-11\n---\n\n# ${name}\n`;

      for (const name of ["strategic", "technical", "creative", "operational", "wisdom", "horizon"]) {
        writeFileSync(join(vaultDir, `${name}-vault.md`), freshVault(name), "utf8");
      }

      writeFileSync(join(voiceDir, "2026-05-11.md"), "---\ntype: voice-session\ndate: 2026-05-11\nbrand: starlight\ndecay_tier: warm\nintent_class: capture\n---\n\n# Session\n", "utf8");
      writeFileSync(join(kgDir, "index.jsonl"), "{\"id\":\"x\"}\n{\"id\":\"y\"}\n", "utf8");
      writeFileSync(join(kgDir, "_brain-cache.json"), "{}", "utf8");
      writeFileSync(join(memoryRoot, "CONSOLIDATION_LOG.md"), "- 2026-05-11T04:00:02.190Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0\n", "utf8");
      writeFileSync(join(mempalaceDir, "atoms.jsonl"), "{\"id\":\"a\"}\n{\"id\":\"b\"}\n", "utf8");
      writeFileSync(join(mempalaceDir, "vectors.npy"), "placeholder", "utf8");

      const report = inspectMemoryHealth(dir, new Date("2026-05-11T12:00:00Z"));

      assert.equal(report.status, "healthy");
      assert.equal(report.vaults.length, 6);
      assert.equal(report.voiceSessions.count, 1);
      assert.equal(report.knowledgeGraph.indexRows, 2);
      assert.equal(report.knowledgeGraph.brainCachePresent, true);
      assert.equal(report.mempalace.atomRows, 2);
      assert.equal(report.consolidationLog.stale, false);
    });
  });

  it("updateVaultConsolidationStamps refreshes vault frontmatter only", () => {
    withTempDir("sis-memory-stamp-", (dir) => {
      const vaultDir = join(dir, "memory", "vaults");
      mkdirSync(vaultDir, { recursive: true });
      writeFileSync(
        join(vaultDir, "strategic-vault.md"),
        "---\ntype: vault\nvault: strategic\nlast_consolidated: '2026-05-01'\n---\n\n# Strategic\nBody stays.\n",
        "utf8",
      );

      const updated = updateVaultConsolidationStamps(dir, "2026-05-11");
      const next = readFileSync(join(vaultDir, "strategic-vault.md"), "utf8");

      assert.equal(updated.length, 1);
      assert.match(next, /last_consolidated: '2026-05-11'/);
      assert.match(next, /Body stays\./);
    });
  });
});
