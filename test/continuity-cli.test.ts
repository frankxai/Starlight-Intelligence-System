import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runContinuityCli } from "../src/continuity-cli.js";
import { capture, policy, writeBundle } from "./_lib/continuity-fixture.js";

const ownerAtTerminal = { interactive: true, ask: () => "work:continuity" };

function withHome<T>(run: () => T): T {
  const previous = process.env.SIS_CONTINUITY_HOME;
  const home = mkdtempSync(join(tmpdir(), "sis-continuity-cli-"));
  writeFileSync(join(home, "trust-policy.json"), JSON.stringify(policy));
  process.env.SIS_CONTINUITY_HOME = home;
  try { return run(); } finally {
    if (previous === undefined) delete process.env.SIS_CONTINUITY_HOME;
    else process.env.SIS_CONTINUITY_HOME = previous;
  }
}

describe("starlight-continuity CLI", () => {
  it("imports, shows the recovered checkout and owner, then admits only on explicit owner decision", () => {
    withHome(() => {
      assert.equal(runContinuityCli(["import", writeBundle([capture()])]).exitCode, 0);
      const before = runContinuityCli(["status"]).stdout;
      assert.match(before, /\[input-required\]  owner actor:frank/);
      assert.match(before, /paused \(operator-supplied\)/);
      assert.match(before, /with uncommitted work/);
      assert.match(before, /Nothing resumes automatically/);
      const refused = runContinuityCli(["reconcile", "--work", "work:continuity", "--actor", "actor:frank", "--decision", "admit", "--reason", "checked"], ownerAtTerminal);
      assert.equal(refused.exitCode, 1);
      assert.match(refused.stderr, /acknowledge it explicitly/);
      const admitted = runContinuityCli(["reconcile", "--work", "work:continuity", "--actor", "actor:frank", "--decision", "admit", "--reason", "checked", "--acknowledge-paused"], ownerAtTerminal);
      assert.equal(JSON.parse(admitted.stdout).recorded, "work.admitted");
      assert.match(runContinuityCli(["status"]).stdout, /\[working\][\s\S]*missing artifact, change, checks, verification/);
    });
  });

  it("reports refusals on stderr with a nonzero exit and prints usage for unknown commands", () => {
    withHome(() => {
      const refused = runContinuityCli(["import", "relative/path"]);
      assert.equal(refused.exitCode, 1);
      assert.ok(refused.stderr.length > 0);
      assert.equal(runContinuityCli(["resume"]).exitCode, 2);
    });
  });
});
