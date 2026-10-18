import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findExtension, npmShimTarget, runExtension } from "../src/extensions.js";

// What `npm install -g` writes for a bin on Windows, trimmed to the line that matters.
const npmCmdShim = (rel: string) => `@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n` +
  `endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\${rel}" %*\r\n`;

/** Lays out a global bin dir with one starlight-<name> command that records its arguments. */
function install(name: string, platform: NodeJS.Platform): { dir: string; log: string } {
  const dir = mkdtempSync(join(tmpdir(), "sis-ext-"));
  const log = join(dir, "args.json");
  const script = `#!/usr/bin/env node\nrequire("node:fs").writeFileSync(${JSON.stringify(log)}, JSON.stringify(process.argv.slice(2)));\nprocess.exit(7);\n`;
  if (platform === "win32") {
    mkdirSync(join(dir, "node_modules", "pkg", "bin"), { recursive: true });
    writeFileSync(join(dir, "node_modules", "pkg", "bin", "cli.cjs"), script);
    writeFileSync(join(dir, `starlight-${name}.cmd`), npmCmdShim("node_modules\\pkg\\bin\\cli.cjs"));
  } else {
    const bin = join(dir, `starlight-${name}`);
    writeFileSync(bin, script);
    chmodSync(bin, 0o755);
  }
  return { dir, log };
}

describe("starlight extensions", () => {
  it("finds an installed starlight-<name> command on PATH", () => {
    const { dir } = install("spend", process.platform);
    const found = findExtension("spend", { PATH: dir });
    assert.ok(found);
    assert.ok(found.source.startsWith(dir));
  });

  it("runs it with the caller's arguments, unquoted, and returns its exit code", () => {
    const { dir, log } = install("plan", process.platform);
    const args = ["--json", "a b", "x&calc", "'quoted'"];
    assert.equal(runExtension(findExtension("plan", { PATH: dir })!, args), 7);
    assert.deepEqual(JSON.parse(readFileSync(log, "utf8")), args);
  });

  it("resolves an npm .cmd shim to its script so no shell is involved", () => {
    const { dir } = install("spend", "win32");
    const target = npmShimTarget(join(dir, "starlight-spend.cmd"));
    assert.equal(target, join(dir, "node_modules", "pkg", "bin", "cli.cjs"));
    const found = findExtension("spend", { PATH: dir }, "win32", "node");
    assert.deepEqual(found && { file: found.file, prefix: found.prefix }, { file: "node", prefix: [target] });
  });

  it("does not run a .cmd it cannot resolve", () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-ext-"));
    writeFileSync(join(dir, "starlight-evil.cmd"), "@echo off\r\ncalc.exe %*\r\n");
    assert.equal(findExtension("evil", { PATH: dir }, "win32"), null);
  });

  it("rejects names that could escape the starlight- prefix", () => {
    const { dir } = install("spend", process.platform);
    for (const bad of ["../spend", "Spend", "spend.cmd", "", "a b", "x".repeat(41)]) {
      assert.equal(findExtension(bad, { PATH: dir }), null);
    }
  });

  it("ignores relative PATH entries and returns null when nothing is installed", () => {
    assert.equal(findExtension("spend", { PATH: `.${process.platform === "win32" ? ";" : ":"}relative` }), null);
    assert.equal(findExtension("spend", { PATH: mkdtempSync(join(tmpdir(), "sis-ext-")) }), null);
  });
});
