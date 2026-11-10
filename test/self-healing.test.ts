import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SelfHealingEngine } from "../src/orchestration/self-healing.js";

async function withTempDir<T>(prefix: string, fn: (dir: string) => T | Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("SAGE Self-Healing Engine", () => {
  it("manages goal state and advances steps with health check and operational receipts", async () => {
    await withTempDir("sage-heal-", async (dir) => {
      const starlightDir = join(dir, ".starlight");
      const engine = new SelfHealingEngine({ repoRoot: dir, starlightDir });

      // Run goal step (initializes default state and advances task 1)
      const stepResult = await engine.runGoalStep(0, { runTsc: false, runTests: false });

      assert.ok(stepResult);
      assert.equal(stepResult.status, "completed");
      assert.ok(stepResult.receiptId);

      // Verify state was saved to .starlight/goal-state.json
      const statePath = join(starlightDir, "goal-state.json");
      assert.ok(existsSync(statePath));

      const raw = readFileSync(statePath, "utf-8");
      const state = JSON.parse(raw);
      assert.equal(state.checklist[0].status, "completed");
      assert.equal(state.currentStepIndex, 1);

      // Verify operational receipt in memory/vaults/operational.jsonl
      const vaultPath = join(dir, "memory", "vaults", "operational.jsonl");
      assert.ok(existsSync(vaultPath));
      const receiptContent = readFileSync(vaultPath, "utf-8");
      assert.ok(receiptContent.includes("sage_self_healing_receipt"));
      assert.ok(receiptContent.includes("Built on SIP"));
    });
  });

  it("runs full auto-healing loop across tasks", async () => {
    await withTempDir("sage-loop-", async (dir) => {
      const starlightDir = join(dir, ".starlight");
      const engine = new SelfHealingEngine({ repoRoot: dir, starlightDir });

      const report = await engine.runAutoHealingLoop({ runTsc: false, runTests: false });
      assert.ok(report);
      assert.equal(report.success, true);
      assert.equal(report.stepsCompleted, report.stepsTotal);
      assert.ok(report.receiptsRecorded.length > 0);
    });
  });
});
