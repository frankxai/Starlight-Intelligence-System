import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { StarlightDaemon } from "../src/daemon/starlightd.js";

describe("Starlight Daemon (starlightd) — Background Autonomic Service", () => {
  it("executes maintenance tick, logs status, and cleans up on stop", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "sis-starlightd-"));
    try {
      const daemon = new StarlightDaemon(tempDir);
      const status1 = await daemon.tick();

      assert.equal(status1.sweepCount, 1);
      assert.equal(status1.attestation, "Built on SIP");
      assert.ok(status1.pid > 0);
      assert.ok(status1.lastSweepAt);
      assert.equal(existsSync(join(tempDir, "starlightd.json")), true);

      const written = JSON.parse(readFileSync(join(tempDir, "starlightd.json"), "utf-8"));
      assert.equal(written.sweepCount, 1);
      assert.equal(written.attestation, "Built on SIP");

      // Stop daemon
      daemon.stop();
      assert.equal(existsSync(join(tempDir, "starlightd.json")), false);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
