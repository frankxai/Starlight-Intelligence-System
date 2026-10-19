import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BUILTIN_COMMANDS, findExtension, npmShimTarget, runExtension } from "../src/extensions.js";

// The shape npm's cmd-shim writes (copied from a real `npm install -g` shim).
function npmCmdShim(rel: string, { prog = "node", flags = "" } = {}): string {
  return [
    "@ECHO off", "GOTO start", ":find_dp0", "SET dp0=%~dp0", "EXIT /b", ":start", "SETLOCAL", "CALL :find_dp0", "",
    'IF EXIST "%dp0%\\node.exe" (', '  SET "_prog=%dp0%\\node.exe"', ") ELSE (", `  SET "_prog=${prog}"`,
    "  SET PATHEXT=%PATHEXT:;.JS;=;%", ")", "",
    `endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" ${flags} "%dp0%\\${rel}" %*`, "",
  ].join("\r\n");
}

const RECORDER = (log: string) =>
  `#!/usr/bin/env node\nrequire("node:fs").writeFileSync(${JSON.stringify(log)}, JSON.stringify({ argv: process.argv.slice(2), execArgv: process.execArgv }));\nprocess.exit(7);\n`;

/** A global bin dir holding one npm-style Windows shim and its script. */
function windowsInstall(name: string, opts: { prog?: string; flags?: string; script?: string } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sis-ext-"));
  const log = join(dir, "args.json");
  const script = opts.script ?? "cli.cjs";
  mkdirSync(join(dir, "node_modules", "pkg", "bin"), { recursive: true });
  writeFileSync(join(dir, "node_modules", "pkg", "bin", script), RECORDER(log));
  writeFileSync(join(dir, `starlight-${name}.cmd`), npmCmdShim(`node_modules\\pkg\\bin\\${script}`, opts));
  return { dir, log, script: join(dir, "node_modules", "pkg", "bin", script) };
}

/** A global bin dir holding one executable script, as npm links it on Linux and macOS. */
function posixInstall(name: string, mode = 0o755) {
  const dir = mkdtempSync(join(tmpdir(), "sis-ext-"));
  const log = join(dir, "args.json");
  const bin = join(dir, `starlight-${name}`);
  writeFileSync(bin, RECORDER(log));
  chmodSync(bin, mode);
  return { dir, log };
}

const install = (name: string) => (process.platform === "win32" ? windowsInstall(name) : posixInstall(name));
const posixOnly = { skip: process.platform === "win32" ? "execute bits are POSIX-only" : false };

describe("starlight extensions", () => {
  it("finds an installed starlight-<name> command on PATH", () => {
    const { dir } = install("spend");
    assert.ok(findExtension("spend", { PATH: dir })?.source.startsWith(dir));
  });

  it("runs it with the caller's arguments, unquoted, and returns its exit code", () => {
    const { dir, log } = install("plan");
    const args = ["--help", "a b", "x&calc", "'quoted'"];
    assert.equal(runExtension(findExtension("plan", { PATH: dir })!, args), 7);
    assert.deepEqual(JSON.parse(readFileSync(log, "utf8")).argv, args);
  });

  it("resolves an npm .cmd shim to its script on any host, so no shell is involved", () => {
    const { dir, script } = windowsInstall("spend");
    assert.deepEqual(npmShimTarget(join(dir, "starlight-spend.cmd")), { script, flags: [] });
    const found = findExtension("spend", { PATH: dir }, "win32", "node");
    assert.deepEqual(found && { file: found.file, prefix: found.prefix }, { file: "node", prefix: [script] });
  });

  it("keeps Node flags npm copied from the script's shebang", () => {
    const { dir, script } = windowsInstall("flagged", { flags: "--require ./register.js" });
    assert.deepEqual(findExtension("flagged", { PATH: dir }, "win32", "node")?.prefix, ["--require", "./register.js", script]);
  });

  it("accepts an extensionless bin when the shim's program is node", () => {
    const { dir, script } = windowsInstall("plain", { script: "starlight-plain" });
    assert.deepEqual(npmShimTarget(join(dir, "starlight-plain.cmd")), { script, flags: [] });
  });

  it("refuses shims that run another program or carry flags needing shell quoting", () => {
    const sh = windowsInstall("bash", { prog: "/bin/sh" });
    assert.equal(findExtension("bash", { PATH: sh.dir }, "win32"), null);
    const quoted = windowsInstall("quoted", { flags: '--title "x&calc"' });
    assert.equal(findExtension("quoted", { PATH: quoted.dir }, "win32"), null);
    const dir = mkdtempSync(join(tmpdir(), "sis-ext-"));
    writeFileSync(join(dir, "starlight-evil.cmd"), "@echo off\r\ncalc.exe %*\r\n");
    assert.equal(findExtension("evil", { PATH: dir }, "win32"), null);
  });

  it("treats an unreadable or vanished shim as not installed", () => {
    assert.equal(npmShimTarget(join(tmpdir(), "no-such-dir", "starlight-gone.cmd")), null);
  });

  it("skips a non-executable file and keeps searching PATH", posixOnly, () => {
    const blocked = posixInstall("spend", 0o644);
    const good = posixInstall("spend");
    assert.equal(findExtension("spend", { PATH: `${blocked.dir}:${good.dir}` })?.source, join(good.dir, "starlight-spend"));
  });

  it("never dispatches a built-in command, even when a starlight-<built-in> is installed", () => {
    const { dir } = install("vault");
    assert.equal(findExtension("vault", { PATH: dir }), null);
  });

  it("rejects names that could escape the starlight- prefix", () => {
    const { dir } = install("spend");
    for (const bad of ["../spend", "Spend", "spend.cmd", "", "a b", "x".repeat(41)]) {
      assert.equal(findExtension(bad, { PATH: dir }), null);
    }
  });

  it("ignores relative PATH entries and returns null when nothing is installed", () => {
    assert.equal(findExtension("spend", { PATH: `.${process.platform === "win32" ? ";" : ":"}relative` }), null);
    assert.equal(findExtension("spend", { PATH: mkdtempSync(join(tmpdir(), "sis-ext-")) }), null);
  });

  it("lists exactly the top-level commands cli.ts handles", () => {
    const cli = readFileSync(new URL("../src/cli.ts", import.meta.url), "utf8");
    const terminal = JSON.parse(cli.match(/if \((\[[^\]]+\])\.includes\(terminalArgs\[0\]\)\)/)![1]);
    const main = cli.slice(cli.indexOf("\n  switch (command) {"));
    const cases = [...main.matchAll(/^ {4}case "([^"]+)":/gm)].map(m => m[1]);
    assert.deepEqual([...BUILTIN_COMMANDS].sort(), [...new Set([...terminal, ...cases])].sort());
  });
});
