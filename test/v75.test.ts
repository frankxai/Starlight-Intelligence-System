/**
 * v7.5 Reconciliation Conformance Harness
 *
 * Companion to test/substrate.test.ts + v73.test.ts + v74.test.ts + v741.test.ts.
 * Guards the v7.5 reconciliation surface against MASSIVE_ACTION_PLAN.md (accepted
 * 2026-04-25):
 *   - 10-IS taxonomy reconciled in STACK.md and ARCHITECTURE.md
 *   - core/orchestrator/ scaffold + 4 CLI harness folders
 *   - verticals/_template/ with full 7-file SIP contract
 *   - verticals/code/ + verticals/voice-video/ + verticals/family/ stubs
 *   - HR Intelligence vertical Path A authorless rewrite (no "Ana's HR" word
 *     references remaining in sub-system agents or vertical wrapper files)
 *   - docs/forking-domain-stacks.md (attribution-back pattern)
 *   - MASSIVE_ACTION_PLAN.md committed at repo root
 *   - VERTICALS.md contains Code IS + Voice & Video IS entries
 *   - ATTESTATIONS.md v7.5.0 entry present
 *   - package.json version bumped to 7.5.x
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates raw
 * fixture content into error messages. Trusted inputs only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol
 * - Substrate: starlightintelligence.org/protocol v1.1.0
 * - Layers used: [file-contract, attestation, commands, sovereignty]
 * - Verticals: starlight-intelligence-system@v7.5
 * - Generated: 2026-04-26
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

const PLAN = join(REPO_ROOT, "MASSIVE_ACTION_PLAN.md");
const STACK = join(REPO_ROOT, "STACK.md");
const VERTICALS = join(REPO_ROOT, "VERTICALS.md");
const ARCHITECTURE = join(REPO_ROOT, "docs", "ARCHITECTURE.md");
const ATTESTATIONS = join(REPO_ROOT, "ATTESTATIONS.md");
const PACKAGE_JSON = join(REPO_ROOT, "package.json");
const FORKING_DOC = join(REPO_ROOT, "docs", "forking-domain-stacks.md");

const ORCHESTRATOR_DIR = join(REPO_ROOT, "core", "orchestrator");
const TEMPLATE_DIR = join(REPO_ROOT, "verticals", "_template");
const CODE_VERTICAL = join(REPO_ROOT, "verticals", "code");
const VOICEVIDEO_VERTICAL = join(REPO_ROOT, "verticals", "voice-video");
const FAMILY_VERTICAL = join(REPO_ROOT, "verticals", "family");

const HR_AGENTS = [
  "starlight-hiring.md",
  "starlight-performance.md",
  "starlight-training.md",
  "starlight-culture.md",
  "starlight-talent.md",
  "starlight-org.md",
].map((f) => join(REPO_ROOT, "agents", f));

const HR_WRAPPER_FILES = [
  "README.md",
  "SKILL.md",
  "SOUL.md",
  "AGENTS.md",
  "MEMORY.md",
  "STACK.md",
  "CANON.md",
  "SUB-SYSTEMS.md",
].map((f) => join(REPO_ROOT, "verticals", "hr-intelligence", f));

const TEMPLATE_FILES = [
  "README.md",
  "SKILL.md",
  "SOUL.md",
  "AGENTS.md",
  "MEMORY.md",
  "STACK.md",
  "CANON.md",
];

const HARNESS_DIRS = ["claude", "codex", "gemini", "opencode"];

// ── Block 1 — MASSIVE_ACTION_PLAN landed ──────────────────────

describe("v7.5 Block 1 — MASSIVE_ACTION_PLAN.md committed at root", () => {
  it("v7.5.1.1 plan file exists", () => {
    assert.ok(existsSync(PLAN), "MASSIVE_ACTION_PLAN.md missing at repo root");
  });

  it("v7.5.1.2 plan declares acceptance + architect voice", () => {
    const content = readFileSync(PLAN, "utf8");
    assert.match(content, /ACCEPTED 2026-04-25/, "plan acceptance header missing");
    assert.match(content, /Voice: architect/, "plan architect voice declaration missing");
  });

  it("v7.5.1.3 plan declares 10-IS taxonomy", () => {
    const content = readFileSync(PLAN, "utf8");
    assert.match(content, /Ten Intelligence Systems/i, "10-IS heading missing");
    assert.match(content, /Starlight Orchestrator/, "Orchestrator naming missing");
  });
});

// ── Block 2 — STACK + VERTICALS + ARCHITECTURE reconciled ─────

describe("v7.5 Block 2 — substrate docs reconciled to 10-IS", () => {
  it("v7.5.2.1 STACK.md contains 10-IS table", () => {
    const content = readFileSync(STACK, "utf8");
    assert.match(content, /10 Intelligence Systems/, "STACK.md missing 10-IS section header");
    assert.match(content, /Code IS/, "STACK.md missing Code IS row");
    assert.match(content, /Voice & Video IS/, "STACK.md missing Voice & Video IS row");
    assert.match(content, /Starlight Orchestrator/, "STACK.md missing Orchestrator row");
    assert.match(content, /Family IS/, "STACK.md missing Family IS row");
  });

  it("v7.5.2.2 VERTICALS.md adds Code IS + Voice & Video IS entries", () => {
    const content = readFileSync(VERTICALS, "utf8");
    assert.match(content, /### Code IS/, "VERTICALS.md missing Code IS section");
    assert.match(content, /### Voice & Video IS/, "VERTICALS.md missing Voice & Video IS section");
    assert.match(content, /### Family IS/, "VERTICALS.md missing Family IS section");
  });

  it("v7.5.2.3 ARCHITECTURE.md retitled to 10-IS", () => {
    const content = readFileSync(ARCHITECTURE, "utf8");
    assert.match(content, /10-IS composition/, "ARCHITECTURE.md not retitled to 10-IS");
    assert.match(content, /Reconciliation note/, "ARCHITECTURE.md missing reconciliation note");
    assert.match(content, /Code IS/, "ARCHITECTURE.md missing Code IS row");
    assert.match(content, /Voice & Video IS/, "ARCHITECTURE.md missing Voice & Video IS row");
    assert.match(content, /Starlight Orchestrator/, "ARCHITECTURE.md missing Orchestrator row");
    assert.match(content, /Family IS/, "ARCHITECTURE.md missing Family IS row");
  });
});

// ── Block 3 — core/orchestrator/ scaffold ─────────────────────

describe("v7.5 Block 3 — core/orchestrator/ scaffold present", () => {
  it("v7.5.3.1 orchestrator README exists with canonical naming", () => {
    const readme = join(ORCHESTRATOR_DIR, "README.md");
    assert.ok(existsSync(readme), "core/orchestrator/README.md missing");
    const content = readFileSync(readme, "utf8");
    assert.match(content, /Starlight Orchestrator/, "README missing canonical name");
    assert.match(content, /Private Intelligence Office/, "README missing premium label");
    assert.match(content, /Killed names/, "README missing killed-names declaration");
  });

  for (const harness of HARNESS_DIRS) {
    it(`v7.5.3.2.${harness} ${harness} harness folder + README present`, () => {
      const path = join(ORCHESTRATOR_DIR, "harnesses", harness, "README.md");
      assert.ok(existsSync(path), `core/orchestrator/harnesses/${harness}/README.md missing`);
    });
  }
});

// ── Block 4 — verticals/_template/ + Code/Voice-Video/Family ──

describe("v7.5 Block 4 — vertical scaffolds present", () => {
  for (const file of TEMPLATE_FILES) {
    it(`v7.5.4.1.${file} template/${file} present`, () => {
      assert.ok(existsSync(join(TEMPLATE_DIR, file)), `verticals/_template/${file} missing`);
    });
  }

  it("v7.5.4.2 verticals/code/README.md present", () => {
    assert.ok(existsSync(join(CODE_VERTICAL, "README.md")), "verticals/code/README.md missing");
  });

  it("v7.5.4.3 verticals/voice-video/README.md present", () => {
    assert.ok(existsSync(join(VOICEVIDEO_VERTICAL, "README.md")), "verticals/voice-video/README.md missing");
  });

  it("v7.5.4.4 verticals/family/README.md present", () => {
    assert.ok(existsSync(join(FAMILY_VERTICAL, "README.md")), "verticals/family/README.md missing");
  });
});

// ── Block 5 — HR vertical Path A authorless ───────────────────

describe("v7.5 Block 5 — HR Intelligence is Path A authorless", () => {
  // Use word-boundary regex to filter false positives like "Analysis" or "Anticipation"
  const ANA_WORD = /\bAna\b/;

  for (const agent of HR_AGENTS) {
    it(`v7.5.5.1 ${agent.split(/[\\/]/).pop()} contains no "Ana" word references`, () => {
      const content = readFileSync(agent, "utf8");
      const matches = content.match(/\bAna\b/g);
      assert.equal(matches, null, `Sub-system agent contains "Ana" word reference (Path A violation)`);
    });
  }

  for (const file of HR_WRAPPER_FILES) {
    it(`v7.5.5.2 ${file.split(/[\\/]/).pop()} contains no "Ana" word references in wrapper`, () => {
      // MEMORY.md is permitted to reference the rewrite event in changelog
      const content = readFileSync(file, "utf8");
      const filename = file.split(/[\\/]/).pop();
      // Allow the changelog entry that names the Path A rewrite
      const filtered = content.replace(/Path A authorless rewrite[^.\n]*/g, "");
      const matches = filtered.match(ANA_WORD);
      assert.equal(matches, null, `${filename} contains "Ana" word reference (Path A violation)`);
    });
  }

  it("v7.5.5.3 HR vertical MEMORY.md declares Path A rewrite in changelog", () => {
    const memory = join(REPO_ROOT, "verticals", "hr-intelligence", "MEMORY.md");
    const content = readFileSync(memory, "utf8");
    assert.match(content, /Path A authorless rewrite/, "HR vertical MEMORY missing Path A changelog entry");
    assert.match(content, /v0\.1\.1/, "HR vertical MEMORY missing v0.1.1 version mark");
  });
});

// ── Block 6 — forking-domain-stacks doc + version + attestations

describe("v7.5 Block 6 — forking pattern doc + version + attestation", () => {
  it("v7.5.6.1 docs/forking-domain-stacks.md present", () => {
    assert.ok(existsSync(FORKING_DOC), "docs/forking-domain-stacks.md missing");
    const content = readFileSync(FORKING_DOC, "utf8");
    assert.match(content, /attribution-back pattern/i, "forking doc missing attribution-back framing");
    assert.match(content, /Path A/, "forking doc missing Path A reference");
  });

  it("v7.5.6.2 package.json version bumped to 7.5.x", () => {
    const content = readFileSync(PACKAGE_JSON, "utf8");
    const pkg = JSON.parse(content);
    assert.match(pkg.version, /^7\.5\./, `package.json version is ${pkg.version}, expected 7.5.x`);
  });

  it("v7.5.6.3 ATTESTATIONS.md contains v7.5.0 entry", () => {
    const content = readFileSync(ATTESTATIONS, "utf8");
    assert.match(content, /## v7\.5\.0/, "ATTESTATIONS.md missing v7.5.0 entry header");
    assert.match(content, /10-IS/, "ATTESTATIONS.md v7.5 entry missing 10-IS reference");
  });
});
