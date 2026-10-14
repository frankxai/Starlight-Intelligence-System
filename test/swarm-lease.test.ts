import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SwarmLeaseBroker } from "../src/orchestration/swarm-lease.js";

describe("SwarmLeaseBroker", () => {
  const testDir = join(process.cwd(), ".starlight-test-lease");

  function clean() {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  }

  test("acquires exclusive lease without collisions", () => {
    clean();
    const broker = new SwarmLeaseBroker({ storageDir: testDir });

    const result = broker.acquire(
      "agent-claude-1",
      "claude_code",
      "arcanea-ai-app",
      "C:/worktrees/claude",
      ["src/api/auth.ts", "src/api/session.ts"],
      60
    );

    assert.equal(result.ok, true);
    assert.ok(result.lease);
    assert.equal(result.lease?.agentId, "agent-claude-1");
    assert.equal(broker.listActiveLeases().length, 1);
    clean();
  });

  test("detects and blocks path collisions across agents", () => {
    clean();
    const broker = new SwarmLeaseBroker({ storageDir: testDir });

    broker.acquire(
      "agent-claude-1",
      "claude_code",
      "arcanea-ai-app",
      "C:/worktrees/claude",
      ["src/api/**"],
      60
    );

    // Another agent attempts to modify a file inside src/api/
    const collision = broker.acquire(
      "agent-grok-1",
      "grok",
      "arcanea-ai-app",
      "C:/worktrees/grok",
      ["src/api/auth.ts"],
      60
    );

    assert.equal(collision.ok, false);
    assert.ok(collision.conflict);
    assert.equal(collision.conflict?.conflictingLease.agentId, "agent-claude-1");
    assert.deepEqual(collision.conflict?.conflictingPaths, ["src/api/auth.ts"]);
    clean();
  });

  test("renews and releases leases cleanly", () => {
    clean();
    const broker = new SwarmLeaseBroker({ storageDir: testDir });

    const res = broker.acquire(
      "agent-antigravity",
      "antigravity",
      "Starlight-Intelligence-System",
      "C:/worktrees/antigravity",
      ["src/orchestration/swarm-lease.ts"],
      10
    );

    assert.equal(res.ok, true);
    const leaseId = res.lease!.leaseId;

    const renewed = broker.renew(leaseId, 120);
    assert.equal(renewed, true);

    const released = broker.release(leaseId);
    assert.equal(released, true);
    assert.equal(broker.listActiveLeases().length, 0);

    // Now another agent can immediately acquire the same path
    const secondAcquire = broker.acquire(
      "agent-codex",
      "codex",
      "Starlight-Intelligence-System",
      "C:/worktrees/codex",
      ["src/orchestration/swarm-lease.ts"],
      60
    );
    assert.equal(secondAcquire.ok, true);
    clean();
  });
});
