/**
 * v9.2 — stored content must never execute, and the scrubber must catch current key shapes.
 *
 * Why this file exists (2026-08-30 audit + adversarial verification):
 *
 *  1. `rememberInVault` used to run every fenced code block in any entry that classified as
 *     `technical` through EmpiricalSandbox — which is execSync with the caller's user, env,
 *     network and filesystem. No flag guarded it. Auto-classification was enough: prose
 *     mentioning architecture/api/database routes to the technical vault without any caller
 *     naming it, so a payload executed and then had its confidence RAISED to 0.8 for running
 *     cleanly. Every production caller (gateway server, goal, index.remember, the MCP tool)
 *     stores text the process did not author, which for a memory substrate is the normal data
 *     flow, not an edge case. Execution is now opt-in via `executeCodeBlocks`, default off.
 *
 *  2. SECRET_PATTERNS[0] was the 2021 `sk-` + 48 alphanumerics shape, which breaks on the
 *     first `-`/`_`. Every current format has one, so Anthropic, current OpenAI, Stripe and
 *     AWS keys passed through the gateway byte-identical.
 *
 *  3. The phone pattern had optional separators, so it matched any 10 consecutive digits and
 *     corrupted every epoch-ms timestamp in stored memory.
 *
 *  4. `sanitizeContext` rebuilt arrays as objects (typeof [] === 'object'), so every task
 *     context with an array field reached the agents malformed via orchestrator.ts.
 *
 * Fixtures are assembled piecewise at runtime so no contiguous key-shaped literal appears in
 * source — the same convention as v8-sanitization-coverage.test.ts, and required by the local
 * secret-guard hook.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { VaultMemory } from "../src/vault-memory.ts";
import { SanitizationGateway } from "../src/sanitization.ts";

/** Prose that auto-classifies as `technical` carrying a block that writes a sentinel file. */
function payload(sentinelPath: string): string {
  return [
    "Useful database api architecture implementation pattern:",
    "",
    "```javascript",
    `require('fs').writeFileSync(${JSON.stringify(sentinelPath)}, 'executed')`,
    "```",
    "",
  ].join("\n");
}

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sis-v92-"));
}

test("stored code blocks do not execute by default", () => {
  const root = tempRoot();
  try {
    const sentinel = path.join(root, "must-not-exist.txt");
    const memory = new VaultMemory({ storagePath: path.join(root, "store") });
    const entry = memory.rememberInVault(payload(sentinel));

    // The entry must still classify as technical — the fix removes execution, not routing.
    assert.equal(entry.vault, "technical");
    assert.equal(fs.existsSync(sentinel), false, "sandbox executed untrusted stored content");
    // No confidence boost, because nothing was validated.
    assert.equal(entry.confidence, 0.5);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("opt-in still executes, so the guard is proven and not vacuous", () => {
  const root = tempRoot();
  try {
    const sentinel = path.join(root, "expected.txt");
    const memory = new VaultMemory({
      storagePath: path.join(root, "store"),
      executeCodeBlocks: true,
    });
    const entry = memory.rememberInVault(payload(sentinel));

    assert.equal(fs.existsSync(sentinel), true, "opt-in path no longer runs blocks");
    assert.equal(entry.confidence, 0.8);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("current API key shapes are scrubbed", () => {
  const gateway = new SanitizationGateway();
  const p = "s" + "k";
  const filler = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789".repeat(3);

  const secrets: Record<string, string> = {
    anthropic: `${p}-ant-api03-${filler.slice(0, 40)}`,
    openaiProject: `${p}-proj-${filler.slice(0, 40)}`,
    stripeLive: `${p}_live_${filler.slice(0, 30)}`,
    awsAccessKeyId: "AKIA" + "IOSFODNN7EXAMPLE",
    legacyOpenai: `${p}-${"a".repeat(48)}`,
  };

  for (const [name, secret] of Object.entries(secrets)) {
    const scrubbed = gateway.sanitize(`token is ${secret} end`);
    assert.ok(!scrubbed.includes(secret), `${name} passed through unredacted`);
  }
});

test("long digit runs survive; real phone numbers do not", () => {
  const gateway = new SanitizationGateway();

  for (const intact of ["event at 1735689600000 ms", "ts=1735689600000", "order 9876543210 shipped"]) {
    assert.equal(gateway.sanitize(intact), intact, "digit run was mangled by the phone pattern");
  }

  assert.ok(gateway.sanitize("call 415-555-0132 now").includes("[REDACTED]"));
});

test("sanitizeContext preserves arrays", () => {
  const gateway = new SanitizationGateway();
  const out = gateway.sanitizeContext({ tags: ["a", "b"], n: 1, nested: { list: [1, 2, 3] } });

  assert.ok(Array.isArray(out.tags), "top-level array became an object");
  assert.deepEqual(out.tags, ["a", "b"]);
  assert.ok(Array.isArray((out.nested as Record<string, unknown>).list), "nested array became an object");
  assert.equal(out.n, 1);
});
