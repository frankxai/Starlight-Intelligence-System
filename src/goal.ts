/**
 * Starlight Autonomous Goal Execution (SAGE) Framework
 *
 * Implements the core SAGE engine for long-running autonomous tasks:
 * 1. Goal Checkpointing & State Persistence (in .starlight/goal-state.json)
 * 2. Dynamic Context Compression & Vault Consolidation
 * 3. Dual-Agent Adversarial Auditing (Sentinel verification & LGTM structure)
 * 4. Git-Backed Rollback & Recovery (clean branch checkpoints and restoring)
 *
 * Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP).
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { VaultMemory } from "./vault-memory.js";

// ── Types ───────────────────────────────────────────────────

export interface GoalTask {
  id: string;
  task: string;
  status: "pending" | "in-progress" | "completed";
}

export interface GoalLog {
  timestamp: string;
  type: string;
  message: string;
}

export interface GoalState {
  objective: string;
  checklist: GoalTask[];
  logs: GoalLog[];
  contextSummaries: string[];
  gitCheckpointBranch?: string;
  currentStepIndex: number;
}

export interface AuditResult {
  success: boolean;
  output: string;
  approvalTag?: string;
}

// ── SAGE Engine ─────────────────────────────────────────────

export class GoalOrchestrator {
  private starlightDir: string;
  private statePath: string;
  private memory: VaultMemory;

  constructor(options?: { memory?: VaultMemory; starlightDir?: string }) {
    this.starlightDir = options?.starlightDir ?? join(process.cwd(), ".starlight");
    this.statePath = join(this.starlightDir, "goal-state.json");
    this.memory = options?.memory ?? new VaultMemory({ storagePath: this.starlightDir });
    this.memory.load();
  }

  // ── 1. Goal Checkpointing & State Persistence ──────────────

  /**
   * Load checkpoint state from disk.
   * If no file exists, returns undefined.
   */
  loadState(): GoalState | undefined {
    if (!existsSync(this.statePath)) {
      return undefined;
    }
    try {
      const raw = readFileSync(this.statePath, "utf-8");
      return JSON.parse(raw) as GoalState;
    } catch (err: any) {
      this.addLogToDisk("error", `Failed to load state: ${err.message}`);
      return undefined;
    }
  }

  /**
   * Save checkpoint state to disk.
   */
  saveState(state: GoalState): void {
    try {
      if (!existsSync(this.starlightDir)) {
        mkdirSync(this.starlightDir, { recursive: true });
      }
      writeFileSync(this.statePath, JSON.stringify(state, null, 2), "utf-8");
    } catch (err: any) {
      console.error(`[SAGE] Failed to save goal state: ${err.message}`);
    }
  }

  /**
   * Initialize a new goal tracking state.
   */
  createChecklist(objective: string, tasks: string[]): GoalState {
    const checklist: GoalTask[] = tasks.map((t, idx) => ({
      id: `task-${idx + 1}`,
      task: t,
      status: "pending",
    }));

    const state: GoalState = {
      objective,
      checklist,
      logs: [
        {
          timestamp: new Date().toISOString(),
          type: "info",
          message: `Goal initiated: "${objective}"`,
        },
      ],
      contextSummaries: [],
      currentStepIndex: 0,
    };

    this.saveState(state);
    return state;
  }

  /**
   * Update status of a specific task in the checklist.
   */
  updateTaskStatus(taskId: string, status: "pending" | "in-progress" | "completed"): void {
    const state = this.loadState();
    if (!state) return;

    const task = state.checklist.find((t) => t.id === taskId);
    if (task) {
      const oldStatus = task.status;
      task.status = status;
      state.logs.push({
        timestamp: new Date().toISOString(),
        type: "status",
        message: `Task ${taskId} status changed from ${oldStatus} to ${status}: "${task.task}"`,
      });
      this.saveState(state);
    }
  }

  /**
   * Append a log entry to the active goal state.
   */
  addLog(type: string, message: string): void {
    const state = this.loadState();
    if (state) {
      state.logs.push({
        timestamp: new Date().toISOString(),
        type,
        message,
      });
      this.saveState(state);
    } else {
      this.addLogToDisk(type, message);
    }
  }

  private addLogToDisk(type: string, message: string): void {
    console.log(`[SAGE][${type.toUpperCase()}] ${message}`);
  }

  // ── 2. Dynamic Context Compression & Vault Consolidation ───

  /**
   * Compress context: consolidate findings to memory vaults and strategic summary.
   */
  compressContext(findings: string, summary: string): void {
    this.addLog("info", "Approaching context limits. Consolidating context vaults...");

    // Store technical/operational findings
    this.memory.rememberInVault(
      `SAGE Execution Findings:\n${findings}`,
      "technical",
      ["sage-findings", "context-compression"]
    );

    // Store operational context
    this.memory.rememberInVault(
      `SAGE Session Progress:\n${summary}`,
      "operational",
      ["sage-progress", "context-compression"]
    );

    // Store strategic milestone summary
    this.memory.rememberInVault(
      `SAGE Strategic Milestone Summary:\n${summary}`,
      "strategic",
      ["sage-milestone", "context-compression"]
    );

    this.memory.save();

    const state = this.loadState();
    if (state) {
      state.contextSummaries.push(summary);
      state.logs.push({
        timestamp: new Date().toISOString(),
        type: "compression",
        message: "Context compressed and consolidated to Strategic, Technical, and Operational Vaults.",
      });
      this.saveState(state);
    }
  }

  // ── 3. Dual-Agent Adversarial Auditing ─────────────────────

  /**
   * Run verification tests and code checks to verify build/test integrity.
   */
  async runAudit(options?: { runTests?: boolean }): Promise<AuditResult> {
    this.addLog("audit", "Initiating adversarial Sentinel audit...");
    const auditLogs: string[] = [];

    // Check for hardcoded secrets/credentials in modified files (via git diff)
    let secretCheckPassed = true;
    try {
      const gitDiff = execSync("git diff HEAD", { encoding: "utf-8" });
      const secretKeywords = ["api_key", "secret", "private_key", "password", "token", "auth_key"];
      
      for (const keyword of secretKeywords) {
        const regex = new RegExp(`^[+].*${keyword}.*=.*`, "mi");
        if (regex.test(gitDiff)) {
          secretCheckPassed = false;
          auditLogs.push(`[Audit WARNING] Potential hardcoded credential/secret key found for '${keyword}' in diff!`);
        }
      }
      if (secretCheckPassed) {
        auditLogs.push("[Audit Pass] Hardcoded secret credential scan passed.");
      }
    } catch (err: any) {
      auditLogs.push(`[Audit Warning] Secret scan failed to read git diff: ${err.message}`);
    }

    // Run tests
    let testSuccess = true;
    let testOutput = "";
    if (options?.runTests !== false) {
      try {
        auditLogs.push("[Audit Info] Running local test suite (npm test)...");
        testOutput = execSync("npm test", {
          encoding: "utf-8",
          stdio: "pipe",
          env: { ...process.env, FORCE_COLOR: "0" },
        });
        auditLogs.push("[Audit Pass] All local test suites passed.");
      } catch (err: any) {
        testSuccess = false;
        testOutput = (err.stdout ?? "") + "\n" + (err.stderr ?? "");
        auditLogs.push(`[Audit FAIL] Test suite execution failed:\n${testOutput}`);
      }
    }

    const auditPassed = secretCheckPassed && testSuccess;
    const finalLogs = auditLogs.join("\n");

    return {
      success: auditPassed,
      output: finalLogs,
      approvalTag: auditPassed ? "LGTM-SIS" : undefined,
    };
  }

  // ── 4. Git-Backed Rollback & Recovery ──────────────────────

  /**
   * Get name of current Git branch.
   */
  getCurrentBranch(): string {
    try {
      return execSync("git branch --show-current", { encoding: "utf-8" }).trim();
    } catch {
      return "main";
    }
  }

  /**
   * Create a checkpoint branch and commit current changes to it, keeping the current branch clean.
   */
  createGitCheckpoint(): string {
    const originalBranch = this.getCurrentBranch();
    const checkpointBranch = `sage/checkpoint-${Date.now()}`;
    this.addLog("git", `Creating git checkpoint branch: ${checkpointBranch}`);

    try {
      // Create and checkout new checkpoint branch
      execSync(`git checkout -b ${checkpointBranch}`, { stdio: "ignore" });
      
      // Stage and commit all modifications
      execSync("git add .", { stdio: "ignore" });
      execSync('git commit -m "SAGE Auto-checkpoint: Local state backup" --no-verify', { stdio: "ignore" });
      
      // Return to original branch
      execSync(`git checkout ${originalBranch}`, { stdio: "ignore" });

      const state = this.loadState();
      if (state) {
        state.gitCheckpointBranch = checkpointBranch;
        this.saveState(state);
      }

      return checkpointBranch;
    } catch (err: any) {
      this.addLog("error", `Git checkpoint creation failed: ${err.message}`);
      // Fallback: make sure we are on original branch
      try {
        execSync(`git checkout ${originalBranch}`, { stdio: "ignore" });
      } catch {}
      throw err;
    }
  }

  /**
   * Rollback local changes on the current branch back to the clean git HEAD.
   */
  rollbackGit(): void {
    this.addLog("git", "Test failure detected. Executing git rollback to recover...");
    try {
      execSync("git reset --hard HEAD", { stdio: "ignore" });
      execSync("git clean -fd", { stdio: "ignore" });
      this.addLog("git", "Git rollback successful. Workspace clean.");
    } catch (err: any) {
      this.addLog("error", `Git rollback failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Commit local changes to main/current branch.
   */
  commitCheckpoint(message: string): void {
    try {
      execSync("git add .", { stdio: "ignore" });
      execSync(`git commit -m "${message}" --no-verify`, { stdio: "ignore" });
      this.addLog("git", `Committed changes: "${message}"`);
    } catch (err: any) {
      this.addLog("warning", `Commit skipped (likely no changes or git issue): ${err.message}`);
    }
  }
}
