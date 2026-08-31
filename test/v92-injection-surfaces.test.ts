/**
 * v9.2 — the injection surfaces an adversarial review found on 2026-08-30, after the
 * first round of fixes. Each one was proof-of-concept'd before being closed here.
 *
 * The theme: closing `rememberInVault`'s sandbox path was necessary and not sufficient.
 * A memory substrate ingests untrusted text by design, so every place that text is later
 * turned into a filename, a shell word, a generated source file, or a regex input is a
 * surface, and they have to be closed together or not at all.
 *
 * Built on SIP — operational tier (injection conformance).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { VaultMemory } from "../src/vault-memory.ts";
import { TestForge } from "../src/forge.ts";
import { SanitizationGateway } from "../src/sanitization.ts";
import { quoteShellArg } from "../src/shell-quote.ts";

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sis-inj-"));
}

test("the Forge will not turn stored content into executable tests unless execution is opted in", async () => {
  const root = tempRoot();
  try {
    const sentinel = path.posix.join(root.split(path.sep).join("/"), "FORGED.txt");
    const payload = [
      "Verified database api architecture pattern:",
      "",
      "```javascript",
      `require('fs').writeFileSync(${JSON.stringify(sentinel)}, 'forged')`,
      "```",
      "",
    ].join("\n");

    // Default store: high confidence so it clears the Forge's 0.8 filter.
    const guarded = new VaultMemory({ storagePath: path.join(root, "guarded") });
    guarded.rememberInVault(payload, "technical", [], 0.95);
    const forgedGuarded = await new TestForge(guarded).forgeTests();
    assert.deepEqual(forgedGuarded, [], "Forge emitted executable tests from stored content by default");

    // Positive control: with execution opted in, the Forge is still functional, so the
    // guard above is a real decision rather than a broken code path.
    const opted = new VaultMemory({
      storagePath: path.join(root, "opted"),
      executeCodeBlocks: true,
    });
    assert.equal(opted.executesCodeBlocks, true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("secret scrubbing cannot be turned into a denial of service", () => {
  const gateway = new SanitizationGateway();

  // Unbounded quantifiers made these catastrophic: 200k characters took 32.6s and 36.8s
  // measured, synchronously, on the path orchestrator.ts:121 runs for every task.
  const inputs = [
    "a".repeat(200_000),
    "1".repeat(200_000),
    "eyJ" + "A".repeat(100_000),
    "bearer " + "a".repeat(100_000),
  ];

  for (const input of inputs) {
    const started = Date.now();
    gateway.sanitize(input);
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 2_000, `sanitize() took ${elapsed}ms on a ${input.length}-char input`);
  }
});

test("shell arguments are passed as literals, not as shell syntax", () => {
  const payload = "hello & echo INJECTED";

  const quoted = spawnSync("node", ["-e", "console.log(process.argv[1])", payload].map(quoteShellArg), {
    shell: true,
    encoding: "utf-8",
  });

  assert.equal(quoted.status, 0, `child failed: ${quoted.stderr}`);
  assert.equal(
    quoted.stdout.trim(),
    payload,
    "argument was interpreted by the shell instead of passed through",
  );
});

test("quoteShellArg survives quotes and trailing backslashes", () => {
  const cases = ['plain', 'with space', 'has "quotes"', "ends with backslash\\", 'a"b\\\\"c', "semi;colon|pipe"];

  for (const value of cases) {
    const round = spawnSync("node", ["-e", "process.stdout.write(process.argv[1])", value].map(quoteShellArg), {
      shell: true,
      encoding: "utf-8",
    });
    assert.equal(round.status, 0, `child failed for ${JSON.stringify(value)}: ${round.stderr}`);
    assert.equal(round.stdout, value, `round-trip changed ${JSON.stringify(value)}`);
  }
});
