/**
 * v9.6 Swarm plan→run bridge — test suite.
 *
 * Guards the seam between planning and execution:
 *   • packetsToTasks folds each packet into a self-contained worker prompt.
 *   • executeSwarmPlan enforces the approval gate — no approve, no run, no audit.
 *   • an approved dry-run executes every packet deterministically and writes a
 *     run-audit record distinct from the plan record.
 *
 * The real claude subprocess is never touched: the dry-run echo runner (and
 * injected runners) stand in. Audit writes are pointed at a temp home.
 *
 * Built on SIP — operational tier (swarm execution spine).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  createSwarmPlan,
  executeSwarmPlan,
  packetsToTasks,
  type AgentRunner,
  type SwarmPacket,
} from "../src/swarm.js";

async function withTempHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = mkdtempSync(join(tmpdir(), "sis-v96-"));
  try {
    return await fn(home);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

function planFor(home: string) {
  mkdirSync(join(home, "Starlight-Intelligence-System"), { recursive: true });
  return createSwarmPlan("wire the swarm bridge in SIS", undefined, {
    homeDir: home,
    now: new Date("2026-07-02T00:00:00.000Z"),
    commandExists: (name) => ["claude", "codex"].includes(name),
    runCommand: (_c, args) => {
      if (args.join(" ") === "branch --show-current") return { status: 0, stdout: "main\n", stderr: "" };
      if (args.join(" ") === "status --porcelain") return { status: 0, stdout: "", stderr: "" };
      return { status: 1, stdout: "", stderr: "unexpected" };
    },
  });
}

const packet = (over: Partial<SwarmPacket> = {}): SwarmPacket => ({
  id: "swarm-x-01-sis",
  goal: "evolve the orchestrator",
  repo: { id: "sis", name: "Starlight Intelligence System", path: "/home/u/SIS" },
  recommendedLane: "claude",
  agent: "starlight-orchestrator",
  requiredContext: ["CLAUDE.md", "AGENTS.md"],
  mutationRisk: "medium",
  externalProviderRisk: "none",
  approvalRequired: true,
  rationale: "SIS is the control spine.",
  ...over,
});

describe("v9.6 bridge — packetsToTasks", () => {
  it("preserves packet ids and folds repo, agent, and context into the prompt", () => {
    const tasks = packetsToTasks([packet(), packet({ id: "swarm-x-02-voice", agent: "starlight-weaver" })]);
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].id, "swarm-x-01-sis");
    assert.equal(tasks[1].id, "swarm-x-02-voice");

    const prompt = tasks[0].prompt;
    assert.match(prompt, /starlight-orchestrator/);
    assert.match(prompt, /evolve the orchestrator/);
    assert.match(prompt, /Starlight Intelligence System/);
    assert.match(prompt, /CLAUDE\.md, AGENTS\.md/);
    assert.match(prompt, /Recommended lane: claude/);
  });

  it("omits the context line when a packet has no required context", () => {
    const [task] = packetsToTasks([packet({ requiredContext: [] })]);
    assert.doesNotMatch(task.prompt, /Required context files/);
  });
});

describe("v9.6 bridge — approval gate", () => {
  it("without --approve nothing executes and no run-audit is written", async () => {
    await withTempHome(async (home) => {
      const plan = planFor(home);
      assert.ok(plan.packets.length >= 1);

      const outcome = await executeSwarmPlan(plan, { approve: false });
      assert.equal(outcome.approved, false);
      assert.equal(outcome.executed, false);
      assert.equal(outcome.mode, "not-executed");
      assert.equal(outcome.summary, undefined);
      // The gate held: createSwarmPlan does not write; executeSwarmPlan wrote nothing.
      assert.equal(existsSync(plan.auditLogPath), false);
    });
  });

  it("a missing approve flag is treated as no-run", async () => {
    await withTempHome(async (home) => {
      const plan = planFor(home);
      const outcome = await executeSwarmPlan(plan);
      assert.equal(outcome.executed, false);
      assert.equal(existsSync(plan.auditLogPath), false);
    });
  });
});

describe("v9.6 bridge — approved dry-run execution", () => {
  it("executes every packet deterministically and appends a run-audit record", async () => {
    await withTempHome(async (home) => {
      const plan = planFor(home);
      const outcome = await executeSwarmPlan(plan, {
        approve: true,
        now: new Date("2026-07-02T01:00:00.000Z"),
      });

      assert.equal(outcome.approved, true);
      assert.equal(outcome.executed, true);
      assert.equal(outcome.mode, "dry-run");
      assert.equal(outcome.summary?.total, plan.packets.length);
      assert.equal(outcome.summary?.succeeded, plan.packets.length);
      assert.equal(outcome.summary?.failed, 0);
      assert.ok(outcome.summary?.results.every((r) => r.output.startsWith("[dry-run]")));

      // A run-audit record was appended, distinct from a plan record.
      const lines = readFileSync(plan.auditLogPath, "utf8").trim().split("\n");
      const last = JSON.parse(lines[lines.length - 1]);
      assert.equal(last.command, "starlight-swarm-run");
      assert.equal(last.mode, "dry-run");
      assert.equal(last.goal, plan.goal);
      assert.equal(last.summary.total, plan.packets.length);
      assert.equal(last.generatedAt, "2026-07-02T01:00:00.000Z");
    });
  });

  it("routes through an injected runner when supplied", async () => {
    await withTempHome(async (home) => {
      const plan = planFor(home);
      const seen: string[] = [];
      const runner: AgentRunner = async (task) => {
        seen.push(task.id);
        return { output: `handled ${task.id}`, exitCode: 0 };
      };

      const outcome = await executeSwarmPlan(plan, { approve: true, runner });
      assert.equal(seen.length, plan.packets.length);
      assert.ok(outcome.summary?.results.every((r) => r.output.startsWith("handled ")));
    });
  });
});
