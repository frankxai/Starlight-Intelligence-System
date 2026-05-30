/**
 * Harness self-check — gate the drift guard inside `npm test`.
 *
 * The README advertises `npm run agents:harness-check` as the self-consistency
 * surface. This test runs that exact script and asserts it exits 0, so the
 * guard can never silently break again (the failure mode this whole remediation
 * addressed: the script greped for stale literals and failed out of the box).
 *
 * Built on SIP — operational tier (drift-defense harness, test gate).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

describe("agent-harness drift guard", () => {
  it("scripts/check-agent-harness.mjs passes against current docs", () => {
    const result = spawnSync(
      process.execPath,
      [join(REPO_ROOT, "scripts", "check-agent-harness.mjs")],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );

    assert.equal(
      result.status,
      0,
      `harness check failed:\n${result.stdout}\n${result.stderr}`,
    );
    assert.match(result.stdout, /agent harness check passed/i);
  });
});
