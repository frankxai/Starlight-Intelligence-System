import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  appendSwarmAudit,
  createSwarmPlan,
  inspectSwarmProviders,
  inspectSwarmRepos,
} from "../src/swarm.js";

function withTempDir<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("starlight swarm planner", () => {
  it("reports available, wrapper, and missing provider adapters without live calls", () => {
    const providers = inspectSwarmProviders(undefined, {
      commandExists: (name) => ["claude", "codex", "opencode", "grok", "agysis"].includes(name),
    });

    const byId = new Map(providers.map((provider) => [provider.id, provider]));
    assert.equal(byId.get("grok")?.status, "available");
    assert.equal(byId.get("antigravity")?.status, "available");
    assert.match(byId.get("antigravity")?.detail ?? "", /agysis/);
    assert.equal(byId.get("gemini")?.status, "missing");
    assert.equal(byId.get("higgsfield")?.status, "missing");
    assert.equal(byId.get("grok")?.liveCallsEnabled, false);
  });

  it("inspects the v1 repo ring and surfaces dirty state without modifying repos", () => {
    withTempDir("sis-swarm-home-", (home) => {
      mkdirSync(join(home, "Starlight-Intelligence-System"), { recursive: true });
      mkdirSync(join(home, "starlight-voice"), { recursive: true });

      const repos = inspectSwarmRepos(undefined, {
        homeDir: home,
        runCommand: (_command, args, cwd) => {
          if (args.join(" ") === "branch --show-current") {
            return { status: 0, stdout: cwd?.includes("starlight-voice") ? "voice-main\n" : "main\n", stderr: "" };
          }
          if (args.join(" ") === "status --porcelain") {
            return { status: 0, stdout: cwd?.includes("starlight-voice") ? " M README.md\n" : "", stderr: "" };
          }
          return { status: 1, stdout: "", stderr: "unexpected" };
        },
      });

      const byId = new Map(repos.map((repo) => [repo.id, repo]));
      assert.equal(byId.get("sis")?.status, "available");
      assert.equal(byId.get("sis")?.branch, "main");
      assert.equal(byId.get("sis")?.dirty, false);
      assert.equal(byId.get("starlight-voice")?.dirty, true);
      assert.equal(byId.get("arcanea")?.status, "missing");
    });
  });

  it("creates approval-gated dry-run packets for matching repos", () => {
    withTempDir("sis-swarm-plan-", (home) => {
      mkdirSync(join(home, "Starlight-Intelligence-System"), { recursive: true });
      mkdirSync(join(home, "starlight-voice"), { recursive: true });
      mkdirSync(join(home, "Arcanea"), { recursive: true });

      const plan = createSwarmPlan(
        "configure starlight swarm for SIS voice and Arcanea provider generation",
        undefined,
        {
          homeDir: home,
          now: new Date("2026-06-12T12:00:00.000Z"),
          commandExists: (name) => ["claude", "codex", "opencode", "grok", "agysis"].includes(name),
          runCommand: (_command, args) => {
            if (args.join(" ") === "branch --show-current") return { status: 0, stdout: "main\n", stderr: "" };
            if (args.join(" ") === "status --porcelain") return { status: 0, stdout: "", stderr: "" };
            return { status: 1, stdout: "", stderr: "unexpected" };
          },
        },
      );

      assert.equal(plan.mode, "dry_run");
      assert.equal(plan.autonomy, "plan_approve");
      assert.equal(plan.providerMode, "adapter_stubs");
      assert.equal(plan.approvalRequired, true);
      assert.equal(plan.generatedAt, "2026-06-12T12:00:00.000Z");
      assert.ok(plan.packets.length >= 3);
      assert.ok(plan.packets.every((packet) => packet.approvalRequired));
      assert.ok(plan.packets.some((packet) => packet.repo.id === "sis"));
      assert.ok(plan.packets.some((packet) => packet.repo.id === "starlight-voice"));
      assert.ok(plan.packets.some((packet) => packet.repo.id === "arcanea"));
      assert.ok(plan.packets.some((packet) => packet.externalProviderRisk === "dry_run_stub"));
      assert.match(plan.auditLogPath, /private[\\/]+voice-operator[\\/]+logs[\\/]+swarm\.jsonl$/);
    });
  });

  it("appends audit records as JSONL", () => {
    withTempDir("sis-swarm-audit-", (home) => {
      mkdirSync(join(home, "Starlight-Intelligence-System"), { recursive: true });
      const plan = createSwarmPlan("inspect SIS", undefined, {
        homeDir: home,
        now: new Date("2026-06-12T12:00:00.000Z"),
        commandExists: () => false,
        runCommand: () => ({ status: 0, stdout: "", stderr: "" }),
      });

      appendSwarmAudit(plan);
      const audit = readFileSync(plan.auditLogPath, "utf8").trim();
      const parsed = JSON.parse(audit);

      assert.equal(parsed.command, "starlight-swarm");
      assert.equal(parsed.goal, "inspect SIS");
    });
  });
});
