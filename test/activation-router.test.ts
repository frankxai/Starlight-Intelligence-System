import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { repoRootFromTestFile } from "./_lib/repo.js";

const ROOT = repoRootFromTestFile(import.meta.url);
const ROUTE_SCRIPT = join(
  ROOT,
  "plugins",
  "starlight-activation-router",
  "scripts",
  "route-prompt.mjs",
);
const PLUGIN_JSON = join(
  ROOT,
  "plugins",
  "starlight-activation-router",
  ".codex-plugin",
  "plugin.json",
);

function runRouter(input: Record<string, unknown>, envOverride: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [ROUTE_SCRIPT], {
    input: JSON.stringify(input),
    encoding: "utf8",
    env: { ...process.env, ...envOverride },
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim() || "{}");
}

describe("Starlight Activation Router", () => {
  it("plugin manifest has updated version 0.1.1+codex.20260924", () => {
    const content = JSON.parse(readFileSync(PLUGIN_JSON, "utf8"));
    assert.equal(content.version, "0.1.1+codex.20260924");
    assert.equal(content.name, "starlight-activation-router");
  });

  it("handles SessionStart without index file (live detection fallback)", () => {
    const res = runRouter(
      { hook_event_name: "SessionStart" },
      { STARLIGHT_ACTIVATION_INDEX: join(tmpdir(), "non-existent-index-12345.json") },
    );
    const context = res.hookSpecificOutput?.additionalContext;
    assert.ok(context, "SessionStart context should be emitted");
    assert.match(context, /Starlight Activation Router is installed/);
    assert.match(context, /Estate baseline: live repo detection fallback/);
    assert.match(context, /Index status: not found \(live detection fallback\)/);
  });

  it("handles SessionStart with valid index file and freshness status", () => {
    const tmpIndex = join(tmpdir(), `test-index-${Date.now()}.json`);
    try {
      writeFileSync(
        tmpIndex,
        JSON.stringify({
          generatedAt: "2026-10-06",
          counts: { gitRepos: 75, withAgentsMd: 73, withAgentHarness: 63 },
          repos: [],
          skills: [],
        }),
      );
      const res = runRouter(
        { hook_event_name: "SessionStart" },
        { STARLIGHT_ACTIVATION_INDEX: tmpIndex },
      );
      const context = res.hookSpecificOutput?.additionalContext;
      assert.ok(context);
      assert.match(context, /Estate baseline: 75 git repos, 73 AGENTS\.md, 63 harness files/);
      assert.match(context, /Index status: fresh \(2026-10-06\)/);
    } finally {
      try {
        unlinkSync(tmpIndex);
      } catch {}
    }
  });

  it("repairs repository evidence on UserPromptSubmit for /si prompt", () => {
    const res = runRouter({
      prompt: "/si audit this repo",
      cwd: ROOT,
    });
    const context = res.hookSpecificOutput?.additionalContext;
    assert.ok(context, "Prompt hint should be emitted");
    assert.match(context, /Starlight activation hint:/);
    assert.match(context, /Repo hint:/);
    assert.match(context, /AGENTS\.md=yes/);
    assert.match(context, /harness=yes/);
  });

  it("blocks high-risk destructive commands on PreToolUse", () => {
    const res = runRouter({
      tool_name: "bash",
      tool_input: { command: "git reset --hard HEAD" },
    });
    assert.equal(res.hookSpecificOutput?.hookEventName, "PreToolUse");
    assert.equal(res.hookSpecificOutput?.permissionDecision, "deny");
    assert.match(res.hookSpecificOutput?.permissionDecisionReason, /high-risk command/);
  });

  it("allows non-destructive commands on PreToolUse", () => {
    const res = runRouter({
      tool_name: "bash",
      tool_input: { command: "npm test" },
    });
    assert.notEqual(res.hookSpecificOutput?.permissionDecision, "deny");
  });
});
