/**
 * Estate Factory smoke — mechanical truth for starlight-estate-os profile.
 *
 * Gates the 2026-06-16 Board PROCEED-WITH-REVISE factory scaffold:
 *   - templates/estate-os file contract present
 *   - estate-provision + estate-army-deploy command surfaces exist
 *   - commissioning + hero-demo docs wired
 *   - SIP attestation markers on load-bearing estate artifacts
 *
 * Built on SIP — operational tier (estate factory conformance)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const ROOT = repoRootFromTestFile(import.meta.url);

const ESTATE_TEMPLATE_FILES = [
  "templates/estate-os/README.md",
  "templates/estate-os/AGENTS.md",
  "templates/estate-os/SKILL.md",
  "templates/estate-os/MEMORY.md",
  "templates/estate-os/SOUL.md",
  "templates/estate-os/.claude/commands/estate-provision.md",
] as const;

const ESTATE_COMMANDS = [
  "commands/estate-provision.md",
  "commands/estate-army-deploy.md",
  ".claude/commands/estate-provision.md",
  ".claude/commands/estate-army-deploy.md",
] as const;

const ESTATE_DOCS = [
  "docs/delivery/estate-army-commissioning-workflow.md",
  "docs/strategic/estate-factory-evolutions.md",
  "docs/strategic/hero-demo-plan-estate-army.md",
] as const;

function readUtf8(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("estate factory — starlight-estate-os smoke", () => {
  it("estate-os template file contract exists", () => {
    for (const rel of ESTATE_TEMPLATE_FILES) {
      assert.ok(existsSync(join(ROOT, rel)), `missing ${rel}`);
    }
    const soul = readUtf8("templates/estate-os/SOUL.md");
    assert.match(soul, /Built on SIP|SIP/i, "SOUL.md must reference SIP");
    assert.match(soul, /4-layer|Genius|promotion loop/i, "SOUL.md must anchor factory invariants");
  });

  it("estate provision + army-deploy command surfaces exist", () => {
    for (const rel of ESTATE_COMMANDS) {
      assert.ok(existsSync(join(ROOT, rel)), `missing ${rel}`);
    }
    const provision = readUtf8("commands/estate-provision.md");
    assert.match(provision, /templates\/estate-os/, "estate-provision must reference estate-os template");
    assert.match(provision, /\/si/, "estate-provision must route via /si");
    const deploy = readUtf8("commands/estate-army-deploy.md");
    assert.match(deploy, /Steward|Standing/i, "estate-army-deploy must name Standing phase");
  });

  it("commissioning workflow + evolutions + hero plan are linked", () => {
    for (const rel of ESTATE_DOCS) {
      assert.ok(existsSync(join(ROOT, rel)), `missing ${rel}`);
    }
    const evo = readUtf8("docs/strategic/estate-factory-evolutions.md");
    assert.match(evo, /## 11\+/, "evolutions doc must include items 11+");
    assert.match(evo, /\*\*15\./, "evolution 15 (case studies) must be documented");
    const workflow = readUtf8("docs/delivery/estate-army-commissioning-workflow.md");
    assert.match(workflow, /estate-provision|Blueprint|4-layer/i);
  });

  it("ORCHESTRATION_ENGINE carries Swarm Operating Manual section", () => {
    const engine = readUtf8("core/ORCHESTRATION_ENGINE.md");
    assert.match(engine, /Swarm Operating Manual|SIP Swarm/i);
  });

  it("si-dispatch orchestration scripts are present", () => {
    assert.ok(existsSync(join(ROOT, "scripts/si-dispatch.ps1")));
    assert.ok(existsSync(join(ROOT, "scripts/si-council.ps1")));
    const dispatch = readUtf8("scripts/si-dispatch.ps1");
    assert.match(dispatch, /Get-AgyConversationResponse/, "si-dispatch must include agy DB recovery");
    assert.match(dispatch, /recovery-below-min/, "si-dispatch must validate agy recovery length");
  });
});