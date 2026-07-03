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
 *   - People Intelligence vertical Path A authorless rewrite (renamed from HR Intelligence at v7.6.0; no "Ana's HR" word
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
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
].map((f) => join(REPO_ROOT, "verticals", "people-intelligence", f));

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

describe("v7.5 Block 5 — People Intelligence (was HR Intelligence) is Path A authorless", () => {
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
      // Per OpenClaw v7.5 MEDIUM-5: tighten changelog allowance to exact-match
      // the canonical phrasing. Previous regex (`/Path A authorless rewrite[^.\n]*/g`)
      // over-matched any sentence containing the phrase. Real Path A violations
      // could hide in a "(originally authored by Ana)"-shaped suffix on the
      // same logical sentence as "Path A authorless rewrite". Strict match only.
      const filtered = content.replace(
        /Path A authorless rewrite applied per Luminor Board v7\.4\.1 Item 2/g,
        ""
      );
      const matches = filtered.match(ANA_WORD);
      assert.equal(matches, null, `${filename} contains "Ana" word reference (Path A violation)`);
    });
  }

  it("v7.5.5.3 HR vertical MEMORY.md declares Path A rewrite in changelog", () => {
    const memory = join(REPO_ROOT, "verticals", "people-intelligence", "MEMORY.md");
    const content = readFileSync(memory, "utf8");
    assert.match(content, /Path A authorless rewrite/, "HR vertical MEMORY missing Path A changelog entry");
    assert.match(content, /v0\.1\.1/, "HR vertical MEMORY missing v0.1.1 version mark");
  });
});

// ── Block 7 — v7.5.1 OpenClaw remediation (CRITICAL-1 + CRITICAL-2 + HIGH-1 + HIGH-6) ──

describe("v7.5.1 Block 7 — OpenClaw v7.5 audit remediation", () => {
  // CRITICAL-1: six IS-layer substrate homes scaffolded
  const SIX_IS_VERTICALS = ["self", "wealth", "business", "creator", "secondbrain", "brand"];
  for (const slug of SIX_IS_VERTICALS) {
    it(`v7.5.1.7.1 verticals/${slug}/ scaffolded with README + MEMORY (CRITICAL-1)`, () => {
      const dir = join(REPO_ROOT, "verticals", slug);
      assert.ok(existsSync(dir), `verticals/${slug}/ directory missing`);
      assert.ok(existsSync(join(dir, "README.md")), `verticals/${slug}/README.md missing`);
      assert.ok(existsSync(join(dir, "MEMORY.md")), `verticals/${slug}/MEMORY.md missing`);
    });
  }

  // CRITICAL-2: vertical READMEs mark external commands explicitly
  it("v7.5.1.7.2 verticals/code/README.md marks /arco /ao as external (CRITICAL-2)", () => {
    const content = readFileSync(join(REPO_ROOT, "verticals", "code", "README.md"), "utf8");
    assert.match(content, /\(external/, "Code IS README missing external-command marker");
    assert.match(content, /Required external commands/, "Code IS README missing required-external section");
  });

  it("v7.5.1.7.3 verticals/voice-video/README.md marks /factory as external (CRITICAL-2)", () => {
    const content = readFileSync(join(REPO_ROOT, "verticals", "voice-video", "README.md"), "utf8");
    assert.match(content, /\(external/, "Voice & Video IS README missing external-command marker");
    assert.match(content, /Required external commands/, "Voice & Video IS README missing required-external section");
  });

  // HIGH-1 (generalized 2026-07-03): EVERY workflow SHA-pins its `uses:` actions.
  // Originally scoped to vercel-deploy.yml (the CLI deploy pipeline); that workflow
  // was retired when deploys moved to Vercel's native Git integration, so the control
  // was broadened to the whole .github/workflows/ dir — a strictly stronger invariant
  // that no longer depends on any single file existing.
  it("v7.5.1.7.4 every .github/workflows/*.yml pins all actions to 40-char SHAs (HIGH-1, generalized)", () => {
    const workflowsDir = join(REPO_ROOT, ".github", "workflows");
    const files = readdirSync(workflowsDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    assert.ok(files.length > 0, "no workflow files found under .github/workflows/");
    for (const file of files) {
      const content = readFileSync(join(workflowsDir, file), "utf8");
      const usesLines = content.split("\n").filter((l) => l.match(/^\s+-?\s*uses:/));
      for (const line of usesLines) {
        const match = line.match(/uses:\s+\S+@(\S+?)(?:\s|$)/);
        assert.ok(match, `${file}: uses: line did not parse: ${line.trim().slice(0, 60)}`);
        const ref = match[1];
        // Must be a 40-char hex SHA, not @vN or @branch (supply-chain hardening).
        assert.match(
          ref,
          /^[0-9a-f]{40}$/,
          `${file}: uses: pin must be a 40-char SHA (got "${ref}", length ${ref.length})`
        );
      }
    }
  });

  it("v7.5.1.7.5 .github/dependabot.yml configures github-actions ecosystem (HIGH-1)", () => {
    const path = join(REPO_ROOT, ".github", "dependabot.yml");
    assert.ok(existsSync(path), "dependabot.yml missing");
    const content = readFileSync(path, "utf8");
    assert.match(content, /package-ecosystem:\s*"github-actions"/, "dependabot missing github-actions ecosystem");
  });

  // HIGH-6: real-instance MEMORY.md files contain no template placeholders
  it("v7.5.1.7.6 real-instance vertical MEMORY.md files contain no template placeholders (HIGH-6)", () => {
    const placeholders = ["<name>", "<slug>", "<commit-sha>"];
    const realInstancePaths = [
      "verticals/people-intelligence/MEMORY.md",
      "verticals/self/MEMORY.md",
      "verticals/wealth/MEMORY.md",
      "verticals/business/MEMORY.md",
      "verticals/creator/MEMORY.md",
      "verticals/secondbrain/MEMORY.md",
      "verticals/brand/MEMORY.md",
      "verticals/family/MEMORY.md",
    ].map((p) => join(REPO_ROOT, p));

    for (const path of realInstancePaths) {
      if (!existsSync(path)) continue; // family/MEMORY.md may not be scaffolded yet
      const content = readFileSync(path, "utf8");
      const filename = path.split(/[\\/]/).slice(-2).join("/");
      for (const placeholder of placeholders) {
        assert.equal(
          content.includes(placeholder),
          false,
          `${filename} contains template placeholder (HIGH-6 violation; placeholders allowed only in _template/)`
        );
      }
    }
  });

  // MEDIUM-3: package.json test scripts split (substrate-only published gate)
  it("v7.5.1.7.7 package.json prepublishOnly uses test:substrate not test (MEDIUM-3)", () => {
    const content = readFileSync(join(REPO_ROOT, "package.json"), "utf8");
    const pkg = JSON.parse(content);
    assert.match(
      pkg.scripts.prepublishOnly,
      /test:substrate/,
      "prepublishOnly should run test:substrate (substrate-only) not full test suite"
    );
    assert.ok(pkg.scripts["test:substrate"], "test:substrate script missing");
    assert.ok(pkg.scripts["test:operational"], "test:operational script missing");
  });

  // LOW-2: forking doc replaces TBD with target dates
  it("v7.5.1.7.8 docs/forking-domain-stacks.md no longer uses TBD (LOW-2)", () => {
    const content = readFileSync(FORKING_DOC, "utf8");
    // The doc may still reference TBD in code blocks — check the reference-verticals table only
    const tableSection = content.match(/Reference verticals available for forking[\s\S]*?(?=\n##|$)/);
    if (tableSection) {
      assert.equal(
        tableSection[0].includes("TBD"),
        false,
        "Reference verticals table contains TBD; replace with target date or current path"
      );
    }
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

  it("v7.5.6.2 package.json version is at or above 7.5.x", () => {
    const content = readFileSync(PACKAGE_JSON, "utf8");
    const pkg = JSON.parse(content);
    // Updated at v7.6.0 — assertion was originally /^7\.5\./ to guard the
    // v7.5 ship moment. After v7.6, the load-bearing check is "version did
    // not regress below 7.5", not "version is exactly 7.5.x". Accept any
    // 7.5.x through 7.99.x and 8.x+ as forward-compatible. Test name kept
    // at v7.5.6.2 because the test ID is the historical conformance
    // contract; the assertion semantics widen with substrate evolution.
    assert.match(
      pkg.version,
      /^(7\.([5-9]|\d{2,})\.|[89]\.|\d{2,}\.)/,
      `package.json version is ${pkg.version}, expected ≥7.5.0`,
    );
  });

  it("v7.5.6.3 ATTESTATIONS.md contains v7.5.0 entry", () => {
    const content = readFileSync(ATTESTATIONS, "utf8");
    assert.match(content, /## v7\.5\.0/, "ATTESTATIONS.md missing v7.5.0 entry header");
    assert.match(content, /10-IS/, "ATTESTATIONS.md v7.5 entry missing 10-IS reference");
  });
});
