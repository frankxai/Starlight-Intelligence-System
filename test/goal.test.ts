import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { GoalOrchestrator } from "../src/goal.js";
import { VaultMemory } from "../src/vault-memory.js";

function withTempDir<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("SAGE Goal Engine", () => {
  it("creates and updates checkpoints correctly", () => {
    withTempDir("sage-goal-", (dir) => {
      const orchestrator = new GoalOrchestrator({ starlightDir: dir });
      
      const objective = "Test goal execution";
      const tasks = ["Task 1", "Task 2"];
      
      const state = orchestrator.createChecklist(objective, tasks);
      assert.equal(state.objective, objective);
      assert.equal(state.checklist.length, 2);
      assert.equal(state.checklist[0].task, "Task 1");
      assert.equal(state.checklist[0].status, "pending");

      // Load state
      const loaded = orchestrator.loadState();
      assert.ok(loaded);
      assert.equal(loaded.objective, objective);

      // Update status
      orchestrator.updateTaskStatus("task-1", "in-progress");
      const updated = orchestrator.loadState()!;
      assert.equal(updated.checklist[0].status, "in-progress");
      assert.ok(updated.logs.some(l => l.message.includes("in-progress")));
    });
  });

  it("compresses context and consolidates to vaults", () => {
    withTempDir("sage-compress-", (dir) => {
      const orchestrator = new GoalOrchestrator({ starlightDir: dir });
      
      orchestrator.createChecklist("Compress Test", ["Task 1"]);
      
      const findings = "Found some code issues in components/CommandPalette.tsx";
      const summary = "Plan executed successfully up to step 3.";
      
      orchestrator.compressContext(findings, summary);
      
      const state = orchestrator.loadState()!;
      assert.equal(state.contextSummaries.length, 1);
      assert.equal(state.contextSummaries[0], summary);

      // Check memories
      const memory = new VaultMemory({ storagePath: dir });
      memory.load();
      const memories = memory.getAll();
      
      // Should have stored in technical, operational, and strategic
      const technical = memories.find(m => m.tags.includes("vault:technical"));
      const operational = memories.find(m => m.tags.includes("vault:operational"));
      const strategic = memories.find(m => m.tags.includes("vault:strategic"));
      
      assert.ok(technical);
      assert.ok(operational);
      assert.ok(strategic);
      
      assert.match(technical.content, /Found some code issues/);
      assert.match(strategic.content, /Strategic Milestone Summary/);
    });
  });

  it("runs adversarial Sentinel audit", async () => {
    withTempDir("sage-audit-", async (dir) => {
      const orchestrator = new GoalOrchestrator({ starlightDir: dir });
      orchestrator.createChecklist("Audit Test", ["Task 1"]);
      
      const result = await orchestrator.runAudit({ runTests: false });
      assert.equal(result.success, true);
      assert.equal(result.approvalTag, "LGTM-SIS");
    });
  });

  it("performs git checkpoint creation and rollback in a temporary git repository", () => {
    withTempDir("sage-git-", (dir) => {
      // Initialize a real temp git repo
      execSync("git init -b main", { cwd: dir, stdio: "ignore" });
      execSync('git config user.name "SAGE Test"', { cwd: dir, stdio: "ignore" });
      execSync('git config user.email "sage@test.com"', { cwd: dir, stdio: "ignore" });

      const initialFile = join(dir, "initial.txt");
      writeFileSync(initialFile, "Initial content", "utf8");
      execSync("git add .", { cwd: dir, stdio: "ignore" });
      execSync('git commit -m "Initial commit"', { cwd: dir, stdio: "ignore" });

      const orchestrator = new GoalOrchestrator({ starlightDir: join(dir, ".starlight") });
      orchestrator.createChecklist("Git Test", ["Task 1"]);

      // Modify a file
      writeFileSync(initialFile, "Modified content", "utf8");

      // Let's temporarily change process.cwd() to the temp directory
      const originalCwd = process.cwd();
      try {
        process.chdir(dir);
        
        assert.equal(orchestrator.getCurrentBranch(), "main");
        const checkpointBranch = orchestrator.createGitCheckpoint();
        assert.ok(checkpointBranch.startsWith("sage/checkpoint-"));
        
        // Verify file is clean on main
        assert.equal(readFileSync(initialFile, "utf8"), "Initial content");

        // Modify file again, and verify rollback
        writeFileSync(initialFile, "Broken content", "utf8");
        orchestrator.rollbackGit();
        assert.equal(readFileSync(initialFile, "utf8"), "Initial content");
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
