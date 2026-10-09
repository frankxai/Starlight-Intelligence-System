import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { findRepoForPath, normalizePath, probeAgentsMd } from "../../plugins/starlight-activation-router/scripts/route-prompt.mjs";

const routerPath = path.resolve("plugins/starlight-activation-router/scripts/route-prompt.mjs");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "starlight-router-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function writeIndex(indexPath, data) {
  fs.writeFileSync(indexPath, JSON.stringify(data), "utf8");
}

function repoIndex(repoPath, agentsMd, generatedAt = "2026-09-22T00:00:00Z") {
  return {
    generatedAt,
    repos: [
      {
        name: "fixture-repo",
        path: repoPath,
        agentsMd,
        agentHarness: false,
        skillsDir: false,
      },
    ],
    skills: [],
  };
}

function runPrompt(prompt, cwd, indexPath) {
  const result = spawnSync(
    process.execPath,
    [routerPath],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      input: JSON.stringify({ event: "UserPromptSubmit", prompt, cwd }),
      env: { ...process.env, STARLIGHT_ACTIVATION_INDEX: indexPath },
    },
  );
  assert.equal(result.status, 0, result.stderr);
  if (!result.stdout.trim()) return "";
  return JSON.parse(result.stdout).hookSpecificOutput.additionalContext;
}

test("fresh repo filesystem evidence exposes a stale negative index claim", (t) => {
  const root = fixture(t);
  const repoPath = path.join(root, "repo");
  fs.mkdirSync(repoPath);
  fs.writeFileSync(path.join(repoPath, "AGENTS.md"), "fixture");
  const indexPath = path.join(root, "index.json");
  writeIndex(indexPath, repoIndex(repoPath, false));

  const context = runPrompt("/si route this task", repoPath, indexPath);
  assert.match(context, /AGENTS\.md=present \(fresh check/);
  assert.match(context, /AGENTS\.md cached=false \(stale; conflicts with filesystem\)/);
  assert.match(context, /generated 2026-09-22T00:00:00Z; cached, not live/);
});

test("filesystem absence supersedes a stale positive cache and rechecks after mutation", (t) => {
  const root = fixture(t);
  const repoPath = path.join(root, "repo");
  fs.mkdirSync(repoPath);
  const markerPath = path.join(repoPath, "AGENTS.md");
  fs.writeFileSync(markerPath, "fixture");
  const indexPath = path.join(root, "index.json");
  writeIndex(indexPath, repoIndex(repoPath, true));

  assert.match(runPrompt("/si route this task", repoPath, indexPath), /AGENTS\.md=present \(fresh check/);
  fs.unlinkSync(markerPath);
  const context = runPrompt("/si route this task", repoPath, indexPath);
  assert.match(context, /AGENTS\.md=absent \(fresh check/);
  assert.match(context, /AGENTS\.md cached=true \(stale; conflicts with filesystem\)/);
});

test("an unknown cached AGENTS value is not coerced to false", (t) => {
  const root = fixture(t);
  const repoPath = path.join(root, "repo");
  fs.mkdirSync(repoPath);
  fs.writeFileSync(path.join(repoPath, "AGENTS.md"), "fixture");
  const indexPath = path.join(root, "index.json");
  writeIndex(indexPath, repoIndex(repoPath, null));

  const context = runPrompt("/si route this task", repoPath, indexPath);
  assert.match(context, /AGENTS\.md cached=unknown/);
  assert.match(context, /AGENTS\.md=present \(fresh check/);
  assert.doesNotMatch(context, /AGENTS\.md cached=unknown \(stale/);
});

test("cwd overrides the process directory and nested worktree rows win by path depth", (t) => {
  const root = fixture(t);
  const outer = path.join(root, "outer");
  const nested = path.join(outer, "worktrees", "feature");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(outer, "AGENTS.md"), "outer");
  fs.writeFileSync(path.join(nested, "AGENTS.md"), "nested");
  const indexPath = path.join(root, "index.json");
  writeIndex(indexPath, {
    repos: [
      { name: "outer", path: outer, agentsMd: true },
      { name: "feature-worktree", path: nested, agentsMd: true },
    ],
    skills: [],
  });

  const context = runPrompt("/si route this task", nested, indexPath);
  assert.match(context, /feature-worktree/);
  assert.match(context, new RegExp(`fresh check at ${nested.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/AGENTS\\.md`));
});

test("missing and malformed indexes stay unknown while probing only the explicit cwd", (t) => {
  const root = fixture(t);
  const repoPath = path.join(root, "repo");
  fs.mkdirSync(repoPath);
  fs.writeFileSync(path.join(repoPath, "AGENTS.md"), "fixture");
  const missingIndex = path.join(root, "missing-index.json");
  const missingContext = runPrompt("/si route this task", repoPath, missingIndex);
  assert.match(missingContext, /AGENTS\.md=present \(fresh check\)/);
  assert.match(missingContext, /Repository index=absent/);

  const malformedIndex = path.join(root, "malformed-index.json");
  fs.writeFileSync(malformedIndex, "{", "utf8");
  const malformedContext = runPrompt("/si route this task", repoPath, malformedIndex);
  assert.match(malformedContext, /AGENTS\.md=present \(fresh check\)/);
  assert.match(malformedContext, /Repository index=malformed/);
});

test("unreachable and unexpected filesystem errors remain distinct from absence", () => {
  const unreachable = probeAgentsMd("/tmp/router-fixture", () => {
    throw Object.assign(new Error("permission denied"), { code: "EACCES" });
  });
  const unknown = probeAgentsMd("/tmp/router-fixture", () => {
    throw Object.assign(new Error("I/O error"), { code: "EIO" });
  });
  const missingRepo = probeAgentsMd("/tmp/router-fixture", () => {
    throw Object.assign(new Error("repo missing"), { code: "ENOENT" });
  });
  assert.deepEqual(unreachable, { status: "inaccessible" });
  assert.deepEqual(unknown, { status: "unknown" });
  assert.deepEqual(missingRepo, { status: "unknown" });
});

test("path matching follows Windows and POSIX case and separator semantics", () => {
  const windowsIndex = {
    repos: [{ name: "windows", path: "C:\\Work\\Repo", agentsMd: true }],
  };
  assert.equal(findRepoForPath(windowsIndex, "c:/work/repo/child")?.name, "windows");
  assert.equal(normalizePath("C:\\Work\\Repo"), "c:/work/repo");

  const posixIndex = { repos: [{ name: "posix", path: "/Work/Repo" }] };
  assert.equal(findRepoForPath(posixIndex, "/Work/Repo/child")?.name, "posix");
  assert.equal(findRepoForPath(posixIndex, "/work/repo/child"), null);
  assert.equal(findRepoForPath(posixIndex, "/Work/Repository"), null);
});

test("routing aliases remain hints only and do not authorize fanout", (t) => {
  const root = fixture(t);
  const repoPath = path.join(root, "repo");
  fs.mkdirSync(repoPath);
  const indexPath = path.join(root, "index.json");
  writeIndex(indexPath, repoIndex(repoPath, false));

  for (const [alias, skill] of [
    ["/si", "starlight-si"],
    ["si:", "starlight-si"],
    ["/so", "starlight-so"],
    ["so:", "starlight-so"],
    ["/acos", "acos-router"],
    ["acos:", "acos-router"],
  ]) {
    const context = runPrompt(`${alias} route this task`, repoPath, indexPath);
    assert.match(context, new RegExp(skill));
  }

  const soContext = runPrompt("/so plan a multi-lane task", repoPath, indexPath);
  assert.match(soContext, /execute fanout only when the prompt explicitly says/);
  assert.doesNotMatch(soContext, /permissionDecision/);
});

test("pre-tool safety still denies destructive commands and secret-file disclosure", (t) => {
  const root = fixture(t);
  const indexPath = path.join(root, "index.json");
  writeIndex(indexPath, { repos: [], skills: [] });
  for (const command of [
    "rm -rf ./build",
    "cat .env",
    'cat "$HOME/.env"',
    "printenv",
    "env -0",
  ]) {
    const result = spawnSync(
      process.execPath,
      [routerPath],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        input: JSON.stringify({
          event: "PreToolUse",
          tool_name: "Bash",
          tool_input: { command },
        }),
        env: { ...process.env, STARLIGHT_ACTIVATION_INDEX: indexPath },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, "deny");
  }

  const exampleRead = spawnSync(
    process.execPath,
    [routerPath],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      input: JSON.stringify({
        event: "PreToolUse",
        tool_name: "Bash",
        tool_input: { command: "cat .env.example" },
      }),
      env: { ...process.env, STARLIGHT_ACTIVATION_INDEX: indexPath },
    },
  );
  assert.equal(exampleRead.status, 0, exampleRead.stderr);
  assert.equal(exampleRead.stdout, "");
});

test("plugin manifest keeps the PR202 layout and bundled hook discovery path", () => {
  const pluginRoot = path.resolve("plugins/starlight-activation-router");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"),
  );
  const hooks = JSON.parse(
    fs.readFileSync(path.join(pluginRoot, "hooks", "hooks.json"), "utf8"),
  );

  assert.equal(manifest.version, "0.1.1+codex.20260924");
  assert.equal(Object.hasOwn(manifest, "hooks"), false);
  assert.ok(hooks.hooks.UserPromptSubmit);
  assert.ok(hooks.hooks.PreToolUse);
});
