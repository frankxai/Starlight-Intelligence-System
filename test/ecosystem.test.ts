import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ECOSYSTEM_PACKAGES, inspectEcosystem, inspectPackageManifest } from "../src/ecosystem.js";
import { runTerminalCli } from "../src/terminal-cli.js";

const manifest = (name = ECOSYSTEM_PACKAGES[0].name) => ({ name, version: "8.5.0",
  dist: { integrity: "sha512-" + "a".repeat(86) + "==" },
  exports: Object.fromEntries(ECOSYSTEM_PACKAGES[0].exports.map(key => [key, { import: "./dist/index.js" }])) });

describe("public ecosystem package discovery", () => {
  it("lists ecosystem packages locally and refuses execution or extra options", async () => {
    const result = await runTerminalCli(["ecosystem", "list"]);
    assert.equal(result.exitCode, 0); assert.equal(JSON.parse(result.stdout).length, 4);
    assert.equal((await runTerminalCli(["ecosystem", "list", "--authorize"])).exitCode, 1);
    assert.equal((await runTerminalCli(["ecosystem", "install"])).exitCode, 1);
  });
  it("checks exact identity, integrity and required exports without claiming installation", () => {
    assert.equal(inspectPackageManifest(manifest().name, manifest()).status, "manifest-checked");
    assert.equal(inspectPackageManifest(manifest().name, { ...manifest(), name: "@attacker/system" }).status, "blocked");
    assert.equal(inspectPackageManifest(manifest().name, { ...manifest(), exports: {} }).status, "blocked");
    assert.equal(inspectPackageManifest(manifest().name, { ...manifest(), dist: {} }).status, "blocked");
    assert.throws(() => inspectPackageManifest("@attacker/system", {}), /catalog/);
  });
  it("rejects published local dependencies including optional dependencies", () => {
    for (const field of ["dependencies", "optionalDependencies"]) {
      for (const range of ["workspace:*", "file:../local", "link:../local", "portal:../local"]) {
        assert.equal(inspectPackageManifest(manifest().name, { ...manifest(), [field]: { local: range } }).status, "blocked");
      }
    }
  });
  it("uses only fixed public registry URLs and no credentials or redirects", async () => {
    let calls = 0;
    const mock = (async (url, init) => {
      calls++;
      assert.ok(String(url).startsWith("https://registry.npmjs.org/%40"));
      assert.equal(init?.credentials, "omit"); assert.equal(init?.redirect, "error");
      assert.ok(init?.signal);
      const name = decodeURIComponent(String(url).split("/")[3]);
      return new Response(JSON.stringify(manifest(name)));
    }) as typeof fetch;
    const report = await inspectEcosystem({ fetch: mock });
    assert.equal(calls, 4); assert.equal(report.packages.every(item => item.status === "manifest-checked"), true);
    assert.equal(report.packages.every(item => item.installation === "not-tested"), true);
  });
  it("isolates malformed, denied and oversized responses instead of accepting partial data", async () => {
    for (const response of [new Response("not-json"), new Response("denied", { status: 403 }), new Response("x".repeat(131_073))]) {
      const mock = (async () => response.clone()) as typeof fetch;
      assert.equal((await inspectEcosystem({ fetch: mock })).packages.every(item => item.status === "unavailable"), true);
    }
    await assert.rejects(inspectEcosystem({ timeoutMs: 0 }), /timeout/);
  });
});
