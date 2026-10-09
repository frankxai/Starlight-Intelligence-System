import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { repoRootFromTestFile } from "./_lib/repo.js";

const ROOT = repoRootFromTestFile(import.meta.url);
const SCRIPT = join(ROOT, "scripts/agents-md-project.mjs");

function run(file: string, ...extra: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, "--file", file, ...extra], { encoding: "utf8" });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

function copyOfAgentsMd() {
  const file = join(mkdtempSync(join(tmpdir(), "agents-md-")), "AGENTS.md");
  writeFileSync(file, readFileSync(join(ROOT, "AGENTS.md"), "utf8"));
  return file;
}

describe("AGENTS.md Band A contract", () => {
  it("the committed AGENTS.md matches its Band A source", () => {
    const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /up to date/);
  });

  it("check mode never writes, and fails on a hand-edit inside the fence", () => {
    const file = copyOfAgentsMd();
    const edited = readFileSync(file, "utf8").replace("### The five guardrails", "### The six guardrails");
    writeFileSync(file, edited);
    const r = run(file);
    assert.equal(r.code, 1);
    assert.match(r.out, /hand-edited inside the fence/);
    assert.equal(readFileSync(file, "utf8"), edited);
  });

  it("an edit outside the fence (Band C) is not drift", () => {
    const file = copyOfAgentsMd();
    writeFileSync(file, `${readFileSync(file, "utf8")}\nA local note.\n`);
    assert.equal(run(file).code, 0);
  });

  it("a missing fence fails the check; --write adds it and keeps Band C byte-for-byte", () => {
    const file = copyOfAgentsMd();
    const bandC = "# Local contract\r\n\r\nBuild with `npm run build`.\r\n";
    writeFileSync(file, bandC);
    const missing = run(file);
    assert.equal(missing.code, 1);
    assert.match(missing.out, /missing against/);
    assert.equal(run(file, "--write").code, 0);
    const written = readFileSync(file, "utf8");
    assert.ok(written.startsWith("<!-- STARLIGHT:BAND-A:BEGIN v1 sha="));
    assert.ok(written.endsWith(bandC.replace(/\r\n/g, "\n")));
    assert.equal(run(file).code, 0, "a second run is idempotent");
  });
});
