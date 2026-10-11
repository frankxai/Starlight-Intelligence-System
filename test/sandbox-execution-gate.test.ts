/**
 * The sandbox executes arbitrary code as the current user, with this process's network and
 * filesystem. Its callers include the MCP `remember` tool and the network gateway, so the
 * content reaching it is frequently not the operator's. These tests pin the gate shut.
 *
 * Each one fails loudly if someone re-opens the default. The proof of "did not execute" is a
 * side effect on disk: a marker file the payload would have written had it run.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EmpiricalSandbox } from "../src/sandbox.js";
import { VaultMemory } from "../src/vault-memory.js";

function withTempDir<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** A payload that proves execution by leaving a file behind. */
const payload = (marker: string) =>
  "```javascript\n" +
  `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "executed");\n` +
  "```";

describe("EmpiricalSandbox execution gate", () => {
  it("refuses to execute without an explicit opt-in", () => {
    withTempDir("sandbox-gate-", (dir) => {
      const marker = join(dir, "executed.txt");
      const result = EmpiricalSandbox.validatePattern(
        `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "x");`,
        "javascript",
      );
      assert.equal(result.refused, true, "must report the refusal, not a silent skip");
      assert.equal(result.success, false);
      assert.equal(existsSync(marker), false, "code ran despite no opt-in");
    });
  });

  it("executes when the caller explicitly opts in", () => {
    withTempDir("sandbox-gate-", (dir) => {
      const marker = join(dir, "executed.txt");
      const result = EmpiricalSandbox.validatePattern(
        `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "x");`,
        "javascript",
        { allowExecution: true },
      );
      assert.equal(result.refused, undefined);
      assert.equal(result.success, true, `sandbox failed: ${result.output}`);
      assert.equal(existsSync(marker), true, "opt-in path no longer executes");
    });
  });

  it("refuses an unsupported language instead of falling through", () => {
    const result = EmpiricalSandbox.validatePattern("whatever", "ruby" as never, { allowExecution: true });
    assert.equal(result.refused, true);
    assert.equal(result.success, false);
  });

  it("does not let a shell metacharacter in the payload reach a shell", () => {
    withTempDir("sandbox-gate-", (dir) => {
      const marker = join(dir, "shell-ran.txt");
      // If any part of this were assembled into a shell command string, the `;` and the
      // backticks would run. Through execFileSync with an argv array they are just bytes
      // inside a file, and the js payload below exits non-zero without touching the marker.
      const result = EmpiricalSandbox.validatePattern(
        `; touch ${JSON.stringify(marker)}; \`touch ${JSON.stringify(marker)}\``,
        "javascript",
        { allowExecution: true },
      );
      assert.equal(result.success, false, "invalid js should fail, not be shell-interpreted");
      assert.equal(existsSync(marker), false, "a shell interpreted the payload");
    });
  });
});

describe("VaultMemory does not execute what it stores", () => {
  it("stores a technical-vault memory containing code WITHOUT running it, by default", () => {
    withTempDir("vault-gate-", (dir) => {
      const marker = join(dir, "executed.txt");
      const memory = new VaultMemory({ storagePath: dir });
      // "pattern" and "api" are technical-vault keywords, so this classifies as technical -
      // the branch that used to execute. The content decides its own vault, which is exactly
      // why the execution gate cannot live behind that classification.
      const entry = memory.rememberInVault(`A useful api pattern:\n\n${payload(marker)}`);
      assert.equal(entry.vault, "technical", "fixture no longer exercises the risky branch");
      assert.equal(existsSync(marker), false, "remembering a memory executed it");
      assert.ok(!entry.tags.includes("unverified-pattern"));
    });
  });

  it("still runs empirical grounding when the operator opts in", () => {
    withTempDir("vault-gate-", (dir) => {
      const marker = join(dir, "executed.txt");
      const memory = new VaultMemory({ storagePath: dir, executeCodeBlocks: true });
      memory.rememberInVault(`A useful api pattern:\n\n${payload(marker)}`);
      assert.equal(existsSync(marker), true, "opt-in no longer grounds patterns empirically");
    });
  });
});
