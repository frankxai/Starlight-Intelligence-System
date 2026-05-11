import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

describe("v81 — /yolo Hive substrate symmetry", () => {
  it("yolo-scope.json exists with required schema", () => {
    const path = join(ROOT, "yolo-scope.json");
    assert.ok(existsSync(path), "yolo-scope.json must exist at repo root");
    const scope = JSON.parse(readFileSync(path, "utf8"));
    assert.ok(Array.isArray(scope.repos), "repos must be an array");
    assert.ok(scope.repos.length >= 1, "repos must have at least one entry");
    assert.ok(scope.phase_in, "phase_in object required");
    assert.equal(typeof scope.phase_in.phase_in_repo, "string", "phase_in.phase_in_repo required");
    assert.ok(["closed", "open"].includes(scope.phase_in.unlock_status), "unlock_status must be closed or open");
    assert.equal(typeof scope.phase_in.session_count, "number", "session_count required");
    assert.ok(scope.budget, "budget object required");
    assert.equal(typeof scope.budget.session_threshold_usd, "number", "session_threshold_usd required");
    for (const repo of scope.repos) {
      assert.equal(typeof repo.name, "string", "every repo needs a name");
      assert.equal(typeof repo.path, "string", "every repo needs a path");
      assert.equal(typeof repo.alliance_touched, "boolean", "alliance_touched required (hard sovereignty hygiene)");
    }
  });

  it("phase-in repo is present in repos list", () => {
    const scope = JSON.parse(readFileSync(join(ROOT, "yolo-scope.json"), "utf8"));
    const phaseInRepo = scope.phase_in.phase_in_repo;
    const found = scope.repos.find((r: { name: string }) => r.name === phaseInRepo);
    assert.ok(found, `phase_in_repo "${phaseInRepo}" must exist in repos list`);
  });

  it("no alliance-touched repo present in registry (sovereignty hygiene)", () => {
    const scope = JSON.parse(readFileSync(join(ROOT, "yolo-scope.json"), "utf8"));
    const alliance = scope.repos.filter((r: { alliance_touched: boolean }) => r.alliance_touched);
    assert.equal(alliance.length, 0, "alliance-touched repos must be excluded from yolo-scope (hard rule)");
  });

  it("three /yolo commands exist with meaningful content + frontmatter", () => {
    for (const cmd of ["yolo.md", "yolo-exit.md", "yolo-abort.md"]) {
      const path = join(ROOT, "commands", cmd);
      assert.ok(existsSync(path), `commands/${cmd} must exist`);
      const body = readFileSync(path, "utf8");
      assert.ok(body.length > 200, `commands/${cmd} must have meaningful content (>200 chars)`);
      assert.ok(body.startsWith("---"), `commands/${cmd} must have frontmatter`);
    }
  });

  it("two /yolo skills exist with frontmatter", () => {
    for (const skill of ["yolo-conductor.md", "yolo-scan.md"]) {
      const path = join(ROOT, "skills", "orchestration", skill);
      assert.ok(existsSync(path), `skills/orchestration/${skill} must exist`);
      const body = readFileSync(path, "utf8");
      assert.ok(body.startsWith("---"), `${skill} must have frontmatter`);
      assert.ok(body.length > 500, `${skill} must have meaningful content (>500 chars)`);
    }
  });

  it("yolo-conductor skill encodes audit-log path contract", () => {
    const conductor = readFileSync(join(ROOT, "skills", "orchestration", "yolo-conductor.md"), "utf8");
    assert.ok(
      conductor.includes("memory/_audit/yolo"),
      "yolo-conductor must encode the audit log path (runtime mkdir contract — dir is gitignored)",
    );
  });

  it("yolo-conductor skill encodes phase-in lockout contract", () => {
    const conductor = readFileSync(join(ROOT, "skills", "orchestration", "yolo-conductor.md"), "utf8");
    assert.ok(
      /phase[-_]in/i.test(conductor),
      "yolo-conductor must reference phase-in lockout",
    );
    assert.ok(
      conductor.includes("unlock_status"),
      "yolo-conductor must check unlock_status",
    );
  });

  it("yolo-conductor skill encodes sovereign re-ack on substrate merges (REVISE-1)", () => {
    const conductor = readFileSync(join(ROOT, "skills", "orchestration", "yolo-conductor.md"), "utf8");
    assert.ok(
      /re[-_ ]?ack/i.test(conductor) || /fresh.*ack/i.test(conductor),
      "yolo-conductor must encode Frank re-ack requirement on substrate merges per Board REVISE-1",
    );
  });

  it("skill-rules.json registers yolo-conductor and yolo-scan activation", () => {
    const raw = readFileSync(join(ROOT, "skills", "skill-rules.json"), "utf8");
    assert.ok(raw.includes("yolo-conductor"), "skill-rules.json must reference yolo-conductor");
    assert.ok(raw.includes("yolo-scan"), "skill-rules.json must reference yolo-scan");
  });

  it("CLAUDE.md references /yolo command", () => {
    const claudeMd = readFileSync(join(ROOT, "CLAUDE.md"), "utf8");
    assert.ok(claudeMd.includes("/yolo"), "CLAUDE.md must reference /yolo");
  });

  it("AGENTS.md references /yolo command (platform-prompt symmetry)", () => {
    const agentsMd = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
    assert.ok(agentsMd.includes("/yolo"), "AGENTS.md must reference /yolo (v80 platform symmetry)");
  });

  it("AGENT_REGISTRY notes yolo-conductor on Orchestrator", () => {
    const registry = readFileSync(join(ROOT, "agents", "AGENT_REGISTRY.md"), "utf8");
    assert.ok(registry.includes("yolo-conductor"), "AGENT_REGISTRY must note yolo-conductor skill");
  });
});
