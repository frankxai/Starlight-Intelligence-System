import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { loadRegistry, repoRoot, validateRegistry } from "../tools/foundry/website-factory.mjs";

function clone() {
  return JSON.parse(JSON.stringify(loadRegistry()));
}

function codes(errors) {
  return errors.map((error) => error.code);
}

describe("website software factory", () => {
  it("accepts the seven Starlight surfaces and keeps production held", () => {
    const registry = loadRegistry();
    assert.deepEqual(validateRegistry(registry), []);
    assert.equal(registry.surfaces.length, 7);
    assert.equal(registry.surfaces.every((surface) => surface.production.deployNow === false), true);
    const claimants = registry.surfaces.filter((surface) => surface.production.claimsHost);
    const hosts = claimants.map((surface) => surface.host);
    assert.equal(new Set(hosts).size, hosts.length);
    assert.equal(claimants.some((surface) => surface.id === "ai-front-door"), false);
  });

  it("rejects a second claimant for the same host", () => {
    const registry = clone();
    registry.surfaces.find((surface) => surface.id === "ai-front-door").production.claimsHost = true;
    assert.ok(codes(validateRegistry(registry)).includes("host-collision"));
  });

  it("rejects an agent that would deploy now", () => {
    const registry = clone();
    registry.surfaces[0].production.deployNow = true;
    assert.ok(codes(validateRegistry(registry)).includes("deploy-held"));
  });

  it("rejects a writing sentinel and a reviewer from the maker harness", () => {
    const registry = clone();
    const fleet = registry.surfaces[0].fleet;
    fleet.find((member) => member.role === "sentinel").writes = true;
    fleet.find((member) => member.role === "reviewer").harness = "grok";
    const found = codes(validateRegistry(registry));
    assert.ok(found.includes("read-only-role"));
    assert.ok(found.includes("maker-reviewer"));
  });

  it("rejects a prompt that drops the hold line", () => {
    const registry = clone();
    registry.surfaces[0].prompts.local = "Ship the site to production tonight. Spend cap: $15.";
    assert.ok(codes(validateRegistry(registry)).includes("prompt-hold"));
  });

  it("checks from the command line", () => {
    const run = spawnSync(process.execPath, ["tools/foundry/website-factory.mjs", "check"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /website factory ok: 7 surfaces/);
  });
});
