import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  SIS_ENTRY_TYPES,
  appendCanonicalSisEntry,
  getCanonicalSisStats,
  readCanonicalSisVault,
  validateCanonicalSisVaultRows,
  validateSisWriteInput,
} from "./canonical-sis.js";
import {
  callCanonicalSisMcpTool,
  getCanonicalSisMcpResources,
  readCanonicalSisMcpResource,
} from "./canonical-sis-mcp.js";

test("canonical SIS validates typed metadata requirements", () => {
  const invalid = validateSisWriteInput({
    vault: "technical",
    content: "Prompt pack without metadata should fail",
    entryType: "prompt_pack",
  });

  assert.equal(invalid.valid, false);
  assert.match(invalid.errors[0], /metadata\.packName/);

  const valid = validateSisWriteInput({
    vault: "creative",
    content: "Reusable prompt pack",
    entryType: "prompt_pack",
    packName: "arcanea-launch-prompts",
  });

  assert.equal(valid.valid, true);
  assert.equal(valid.normalized.entryType, "prompt_pack");
  assert.equal(valid.normalized.metadata.packName, "arcanea-launch-prompts");
});

test("canonical SIS appends and reads unique entries from filesystem vaults", () => {
  const sisRoot = mkdtempSync(join(tmpdir(), "starlight-canonical-sis-"));

  try {
    const first = appendCanonicalSisEntry(
      {
        vault: "technical",
        content: "Agent OS should stay above native harnesses.",
        category: "architecture",
        source: "test",
        confidence: "high",
        entryType: "project_learning",
        project: "agent_os",
      },
      sisRoot,
    );

    const second = appendCanonicalSisEntry(
      {
        vault: "technical",
        content: "Agent OS should stay above native harnesses.",
        category: "architecture",
        source: "test",
        confidence: "high",
        entryType: "project_learning",
        project: "agent_os",
      },
      sisRoot,
    );

    assert.notEqual(first.entry.id, second.entry.id);

    const entries = readCanonicalSisVault("technical", sisRoot);
    assert.equal(entries.length, 2);
    assert.equal(entries[0].entryType, "project_learning");

    const stats = getCanonicalSisStats(sisRoot);
    assert.equal(stats.vaultCounts.technical, 2);
  } finally {
    rmSync(sisRoot, { recursive: true, force: true });
  }
});

test("canonical SIS detects duplicate ids during vault validation", () => {
  const result = validateCanonicalSisVaultRows("technical", [
    {
      id: "dup_001",
      insight: "First entry",
      confidence: "high",
      createdAt: "2026-04-03T00:00:00.000Z",
      entryType: "generic",
      metadata: { entryType: "generic" },
    },
    {
      id: "dup_001",
      insight: "Second entry",
      confidence: "high",
      createdAt: "2026-04-03T00:00:01.000Z",
      entryType: "generic",
      metadata: { entryType: "generic" },
    },
  ]);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("duplicate id dup_001")));
});

test("canonical SIS exports typed entry families", () => {
  assert.ok("project_learning" in SIS_ENTRY_TYPES);
  assert.deepEqual(SIS_ENTRY_TYPES.creative_asset.requiredMetadata, ["assetName"]);
});

test("canonical SIS MCP helpers expose resources and support append/search flows", async () => {
  const sisRoot = mkdtempSync(join(tmpdir(), "starlight-canonical-sis-mcp-"));

  try {
    const resources = getCanonicalSisMcpResources(sisRoot);
    assert.ok(resources.some((resource) => resource.uri === "starlight://vaults/technical"));

    await callCanonicalSisMcpTool(
      "sis_append_entry",
      {
        vault: "technical",
        content: "Shared canonical SIS MCP package surface is live.",
        category: "architecture",
        source: "test",
        confidence: "high",
        entryType: "project_learning",
        project: "sis_mcp_package",
      },
      sisRoot,
    );

    const searchResult = await callCanonicalSisMcpTool(
      "sis_vault_search",
      { query: "canonical SIS MCP surface", vault: "technical", limit: 5 },
      sisRoot,
    );

    assert.equal(Number(searchResult.count), 1);

    const resource = readCanonicalSisMcpResource("starlight://vaults/technical", sisRoot);
    assert.match(resource.text, /sis_mcp_package|canonical SIS MCP package surface/i);
  } finally {
    rmSync(sisRoot, { recursive: true, force: true });
  }
});
