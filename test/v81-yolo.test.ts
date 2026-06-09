import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

describe("v81 — /yolo Hive substrate symmetry", () => {
  it("yolo-scope.template.json exists at repo root (schema-only)", () => {
    const path = join(ROOT, "yolo-scope.template.json");
    assert.ok(existsSync(path), "yolo-scope.template.json must exist at repo root");
    const tpl = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(typeof tpl.version, "string", "version required");
    assert.ok(tpl.budget, "budget object required");
    assert.ok(tpl.phase_in, "phase_in object required");
    assert.ok(Array.isArray(tpl.repos), "repos array required");
    // Template should use placeholders, not real values
    const firstRepoName = tpl.repos[0]?.name as string;
    assert.match(
      firstRepoName,
      /<.*>/,
      "template repos[0].name must be a placeholder like <your-primary-repo-name>",
    );
  });

  it("yolo-scope.json NOT at repo root (instance data in private/)", () => {
    const rootPath = join(ROOT, "yolo-scope.json");
    assert.ok(
      !existsSync(rootPath),
      "yolo-scope.json must NOT be at repo root — instance data lives in private/ per privacy-split memory rule",
    );
  });

  it("private/ is gitignored", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    assert.ok(/^private/m.test(gitignore), "private/ must be gitignored");
  });

  it("loader prefers private/yolo-scope.json when present (schema check via template)", () => {
    // Template is the schema source of truth; runtime loader reads private/yolo-scope.json
    const tpl = JSON.parse(readFileSync(join(ROOT, "yolo-scope.template.json"), "utf8"));
    assert.equal(typeof tpl.phase_in.phase_in_repo, "string");
    assert.ok(["closed", "open"].includes(tpl.phase_in.unlock_status));
    assert.equal(typeof tpl.phase_in.session_count, "number");
    assert.equal(typeof tpl.budget.session_threshold_usd, "number");
    for (const repo of tpl.repos) {
      assert.equal(typeof repo.alliance_touched, "boolean", "alliance_touched required");
    }
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
