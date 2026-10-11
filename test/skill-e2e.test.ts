/**
 * Starlight Intelligence System — End-to-End Skill Economy & Harness Verification Suite
 *
 * Verifies the complete lifecycle:
 *   1. Workspace Skill Discovery Scanner
 *   2. Empirical Valuation & Fair Market Pricing Engine
 *   3. Agent-Skill Matrix & Context Headroom Budgeting
 *   4. 10-Harness Native Config Generator
 *   5. Multi-Marketplace Syndication Bundler & SIP Attestation
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import {
  scanWorkspaceSkills,
  auditSkillValuation,
  resolveSkillMatrix,
  generateHarnessConfig,
  syndicateSkill,
  loadSkillFromFile,
  type HarnessTarget,
  type SyndicationTarget,
} from "../src/skills/index.js";

const REPO_ROOT = process.cwd();

describe("Starlight Skill Economy — End-to-End Operational Lifecycle", () => {
  describe("1. Workspace Skill Discovery Scanner", () => {
    it("scans real repository skills directory and classifies maturity levels", () => {
      const scanPath = join(REPO_ROOT, "skills", "safety");
      const scanResult = scanWorkspaceSkills(scanPath);

      assert.equal(scanResult.rootPath, scanPath);
      assert.ok(scanResult.filesScanned >= 4, "Should scan at least 4 files in safety directory");
      assert.ok(scanResult.skillsFound.length >= 4, "Should discover at least 4 skills in safety");

      const names = scanResult.skillsFound.map((s) => s.name);
      assert.ok(names.some((n) => n.includes("secret-detector")), "Discovers secret-detector");
      assert.ok(names.some((n) => n.includes("permission-gate")), "Discovers permission-gate");

      for (const skill of scanResult.skillsFound) {
        assert.ok(skill.estimatedTokens > 0, "Tokens must be calculated");
        assert.ok(skill.stageLabel.length > 0, "Stage label must exist");
      }
    });
  });

  describe("2. Empirical Valuation & Pricing Engine", () => {
    it("audits real skill file and derives mathematically justified pricing tiers", () => {
      const skillPath = join(REPO_ROOT, "skills", "safety", "secret-detector", "SKILL.md");
      assert.ok(existsSync(skillPath), `Expected skill file at ${skillPath}`);

      const loaded = loadSkillFromFile(skillPath);
      assert.equal(loaded.name, "safety/secret-detector");

      const report = auditSkillValuation({
        name: loaded.name,
        version: loaded.version,
        description: loaded.description,
        domain: "safety",
        content: loaded.rawMarkdown ?? loaded.instructions,
      });

      assert.equal(report.skillName, "safety/secret-detector");
      assert.ok(report.metrics.capabilityDepthScore > 0, "Depth score must be > 0");
      assert.ok(report.metrics.executionComplexityMultiplier >= 1.0, "Complexity multiplier >= 1.0");
      assert.ok(report.metrics.estimatedWeeklyHoursSaved > 0, "Hours saved must be > 0");
      assert.ok(report.metrics.annualLaborSavingsUSD > 0, "Annual labor savings must be positive");
      assert.ok(report.valuationIndex > 0, "Valuation index must be positive");

      assert.equal(report.suggestedPricing.freeCommunityMSRP, 0);
      assert.ok(report.suggestedPricing.builderTierMSRP >= 19);
      assert.ok(report.suggestedPricing.proTierMSRP >= 49);
      assert.ok(report.suggestedPricing.teamTierMonthly >= 99);
      assert.ok(report.suggestedPricing.enterpriseAnnual >= 1000);
      assert.equal(report.commercialStrategy.recommendedLicense, "MIT");
    });
  });

  describe("3. Agent-Skill Matrix & Context Headroom Budgeting", () => {
    it("allocates skills across 6 core council minds and calculates healthy headroom", () => {
      const agents = ["orchestrator", "prime", "architect", "sentinel", "weaver", "sage"];
      const sampleSkills = [
        {
          name: "systematic-debugging",
          version: "1.0.0",
          description: "Systematic root cause debugging",
          domain: "code-intelligence",
          contextBudgetTokens: 1200,
          triggers: { agents: ["architect", "sentinel"] },
        },
        {
          name: "multi-agent-coordination",
          version: "1.0.0",
          description: "Hierarchical multi-agent coordination",
          domain: "orchestration",
          contextBudgetTokens: 1400,
          triggers: { agents: ["orchestrator", "prime"] },
        },
        {
          name: "vault-management",
          version: "1.0.0",
          description: "Direct vault access and memory search",
          domain: "memory",
          contextBudgetTokens: 800,
          triggers: { agents: ["sage", "orchestrator"] },
        },
        {
          name: "secret-detector",
          version: "1.0.0",
          description: "Zero-trust PII & secret scrubbing",
          domain: "safety",
          contextBudgetTokens: 600,
          triggers: { agents: ["sentinel", "prime"] },
        },
        {
          name: "pattern-weaving",
          version: "1.0.0",
          description: "Creative pattern synthesis and aesthetic design",
          domain: "creative",
          contextBudgetTokens: 900,
          triggers: { agents: ["weaver", "prime"] },
        },
      ];

      const matrix = resolveSkillMatrix(agents, sampleSkills);

      assert.equal(matrix.totalRegisteredSkills, 5);
      assert.equal(matrix.overallTokenHealth, "healthy");

      // Verify specific agent allocations
      const architect = matrix.bindings["architect"];
      assert.deepEqual(architect.assignedSkills, ["systematic-debugging"]);
      assert.equal(architect.totalStaticTokens, 1200);
      assert.equal(architect.contextHeadroomPercent, 70);

      const orchestrator = matrix.bindings["orchestrator"];
      assert.deepEqual(orchestrator.assignedSkills, ["multi-agent-coordination", "vault-management"]);
      assert.equal(orchestrator.totalStaticTokens, 2200);
      assert.equal(orchestrator.contextHeadroomPercent, 45);

      const weaver = matrix.bindings["weaver"];
      assert.deepEqual(weaver.assignedSkills, ["pattern-weaving"]);
      assert.equal(weaver.totalStaticTokens, 900);
      assert.equal(weaver.contextHeadroomPercent, 78);
    });
  });

  describe("4. 10-Harness Native Config Generator", () => {
    const allHarnesses: HarnessTarget[] = [
      "claude-code",
      "codex",
      "antigravity",
      "grok",
      "hermes",
      "gemini-cli",
      "cursor",
      "opencode",
      "kilo",
      "windsurf",
    ];

    for (const harness of allHarnesses) {
      it(`compiles valid, syntactically correct configuration for harness: ${harness}`, () => {
        const config = generateHarnessConfig(harness, [
          {
            name: "systematic-debugging",
            version: "1.0.0",
            description: "Systematic root cause debugging",
            domain: "code-intelligence",
          },
        ]);

        assert.equal(config.target, harness);
        assert.equal(config.validationStatus, "valid");
        assert.ok(config.outputFiles.length > 0, `Harness ${harness} must produce at least 1 config file`);

        for (const file of config.outputFiles) {
          assert.ok(file.relativePath.length > 0);
          assert.ok(file.content.length > 0);
        }
      });
    }
  });

  describe("5. Multi-Marketplace Syndication Bundler & SIP Attestation", () => {
    it("packages skill into 5 marketplace formats and signs with immutable SIP attestation", () => {
      const targets: SyndicationTarget[] = ["openclaw", "agentskills", "claude", "openai", "starlight"];
      const result = syndicateSkill(
        {
          name: "safety/secret-detector",
          version: "1.0.0",
          description: "Zero-trust PII & secret scrubbing",
          domain: "safety",
          license: "MIT",
          content: "## Secret Detector\nScrub all API tokens before transmitting.",
        },
        targets
      );

      assert.equal(result.success, true);
      assert.equal(result.skillName, "safety/secret-detector");
      assert.equal(result.version, "1.0.0");
      assert.equal(result.publishedTargets.length, 5);
      assert.match(result.attestationSha, /^[0-9a-f]{64}$/);

      // Verify bundle contains artifacts for all targets
      const fileNames = result.bundle.exportedFiles.map((f) => f.relativePath);
      assert.ok(fileNames.includes("SKILL.md"));
      assert.ok(fileNames.includes("claw.json"));
      assert.ok(fileNames.includes("package.json"));
      assert.ok(fileNames.includes(".claude-plugin.json"));
      assert.ok(fileNames.includes("openapi.json"));
      assert.ok(fileNames.includes("starlight-manifest.json"));

      // Verify SIP attestation format
      assert.ok(result.bundle.sipAttestation.includes("Built on SIP — Starlight Intelligence Protocol v1.1.1"));
      assert.ok(result.bundle.sipAttestation.includes("Integrity SHA256:"));
      assert.equal(result.attestationSha.length, 64);
    });
  });
});
