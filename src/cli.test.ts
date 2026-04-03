import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

function runCli(args: string[], env: NodeJS.ProcessEnv = {}): string {
  return execFileSync(process.execPath, [resolve(".test-dist/cli.js"), ...args], {
    cwd: resolve("."),
    env: { ...process.env, ...env },
    encoding: "utf8",
  }).trim();
}

test("canonical CLI appends, reads, validates, and reports stats", () => {
  const sisHome = mkdtempSync(join(tmpdir(), "starlight-cli-"));

  try {
    const appendOutput = runCli([
      "canonical",
      "append",
      "technical",
      "Prefer regression checks for memory plumbing",
      "--entry-type",
      "project_learning",
      "--project",
      "Arcanea",
      "--tags",
      "sis,qa",
      "--confidence-level",
      "high",
      "--sis-home",
      sisHome,
    ]);

    const appended = JSON.parse(appendOutput) as {
      sisHome: string;
      entry: { entry: { entryType: string; metadata: { project: string } } };
    };
    assert.equal(appended.sisHome, sisHome);
    assert.equal(appended.entry.entry.entryType, "project_learning");
    assert.equal(appended.entry.entry.metadata.project, "Arcanea");

    const readOutput = runCli([
      "canonical",
      "read",
      "technical",
      "--sis-home",
      sisHome,
      "--limit",
      "1",
    ]);
    const readResult = JSON.parse(readOutput) as {
      count: number;
      entries: Array<{ content: string; entryType: string }>;
    };
    assert.equal(readResult.count, 1);
    assert.equal(readResult.entries[0]?.entryType, "project_learning");

    const statsOutput = runCli(["canonical", "stats", "--sis-home", sisHome, "--json"]);
    const stats = JSON.parse(statsOutput) as { vaultCounts: Record<string, number> };
    assert.equal(stats.vaultCounts.technical, 1);

    const validateOutput = runCli(["canonical", "validate", "--sis-home", sisHome, "--json"]);
    const validation = JSON.parse(validateOutput) as { valid: boolean; vaults: Array<{ vault: string; valid: boolean }> };
    assert.equal(validation.valid, true);
    assert.equal(validation.vaults.find((vault) => vault.vault === "technical")?.valid, true);
  } finally {
    rmSync(sisHome, { recursive: true, force: true });
  }
});

test("canonical CLI rejects invalid typed append requests", () => {
  const sisHome = mkdtempSync(join(tmpdir(), "starlight-cli-invalid-"));

  try {
    assert.throws(
      () =>
        runCli([
          "canonical",
          "append",
          "technical",
          "Missing required metadata",
          "--entry-type",
          "project_learning",
          "--sis-home",
          sisHome,
        ]),
      /invalid canonical SIS entry/,
    );
  } finally {
    rmSync(sisHome, { recursive: true, force: true });
  }
});
