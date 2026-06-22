/**
 * Demo smoke — guards the README's "See it work" promise.
 *
 * examples/demo.ts is the proof a newcomer runs first. If it regresses, the
 * README lies. This test runs it end-to-end and asserts all four engines
 * produced real output (retrieval hit, a stale entry, a cross-vault conflict,
 * and an orchestration verdict). examples/ is outside tsconfig, so this is the
 * only thing that type-exercises + runs it in CI.
 *
 * Built on SIP — operational tier (proof-surface guard).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("demo smoke — examples/demo.ts runs the four engines", () => {
  it("produces retrieval, temporal, contradiction and orchestration output", () => {
    const run = spawnSync(
      process.execPath,
      ["--import", "tsx", join(REPO_ROOT, "examples", "demo.ts")],
      { cwd: REPO_ROOT, encoding: "utf-8", timeout: 60_000 },
    );

    assert.equal(run.status, 0, `demo exited non-zero:\n${run.stderr}`);
    const out = run.stdout.replace(/\x1b\[[0-9;]*m/g, ""); // strip ANSI

    assert.match(out, /1\. Retrieval/, "retrieval section ran");
    assert.match(out, /\[(technical|strategic)\]/, "retrieval returned ranked hits");
    assert.match(out, /2\. Temporal/, "temporal section ran");
    assert.match(out, /STALE/, "temporal surfaced a stale entry");
    assert.match(out, /3\. Contradiction/, "contradiction section ran");
    assert.match(out, /CONFLICT/, "contradiction found a cross-vault conflict");
    assert.match(out, /4\. Orchestration/, "orchestration section ran");
    assert.match(out, /pattern:/, "orchestration produced a verdict");
    assert.match(out, /This is the operational core/, "demo completed");
  });
});
