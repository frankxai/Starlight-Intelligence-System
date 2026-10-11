/**
 * Starlight Intelligence System — Universal Skills Engine Test Suite
 *
 * Validates:
 *   1. Agent-Skill Matrix & Context Headroom Budgeting
 *   2. 10-Harness Native Config Generator
 *   3. Workspace Skill & Skin Discovery Scanner
 *   4. Empirical Valuation & Fair Market Pricing Engine
 *   5. Multi-Marketplace Syndication Bundler with SIP Attestation
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveSkillMatrix,
  generateHarnessConfig,
  scanWorkspaceSkills,
  auditSkillValuation,
  buildSyndicationBundle,
  syndicateSkill,
  type SkillDefinition,
  type HarnessTarget,
  type SyndicationTarget,
} from "../src/skills/index.js";

describe("Starlight Universal Skill Engine", () => {
  const sampleSkills: SkillDefinition[] = [
    {
      name: "systematic-debugging",
      version: "1.0.0",
      description: "Use when encountering any bug or unexpected behavior before proposing fixes.",
      domain: "code-intelligence",
      license: "MIT",
      author: "FrankX AI Systems",
      contextBudgetTokens: 1100,
      triggers: {
        keywords: ["bug", "fix", "error"],
        agents: ["architect", "sentinel"],
      },
      content: "## Instructions\nAlways reproduce the failure first. Form a hypothesis before editing.",
    },
    {
      name: "multi-agent-coordination",
      version: "1.0.0",
      description: "Hierarchical and council coordination patterns for agent swarms.",
      domain: "orchestration",
      license: "MIT",
      author: "FrankX AI Systems",
      contextBudgetTokens: 1400,
      triggers: {
        keywords: ["swarm", "coordinate", "parallel"],
        agents: ["orchestrator", "prime"],
      },
      content: "## Instructions\nDecompose large requests into independent tasks. Enforce Santa review loop.",
    },
    {
      name: "vault-management",
      version: "1.0.0",
      description: "Semantic memory recall and storage across six Starlight vaults.",
      domain: "memory",
      license: "MIT",
      author: "FrankX AI Systems",
      contextBudgetTokens: 800,
      triggers: {
        keywords: ["vault", "remember", "recall"],
        agents: ["sage", "orchestrator"],
      },
      content: "## Instructions\nSearch relevant vaults before work; record findings and decisions after.",
    },
  ];

  describe("Agent-Skill Matrix & Context Budgeting", () => {
    it("allocates skills based on agent triggers and calculates headroom percentage", () => {
      const agents = ["orchestrator", "architect", "sage", "unmatched-agent"];
      const matrix = resolveSkillMatrix(agents, sampleSkills, {
        defaultTokenBudget: 3000,
      });

      assert.equal(matrix.overallTokenHealth, "healthy");
      assert.equal(matrix.totalRegisteredSkills, 3);

      const orch = matrix.bindings["orchestrator"];
      assert.ok(orch);
      assert.deepEqual(orch.assignedSkills.sort(), ["multi-agent-coordination", "vault-management"]);
      assert.equal(orch.totalStaticTokens, 2200);
      assert.ok(orch.contextHeadroomPercent > 0);

      const unmatched = matrix.bindings["unmatched-agent"];
      assert.equal(unmatched.assignedSkills.length, 0);
      assert.equal(unmatched.contextHeadroomPercent, 100);
    });

    it("detects token budget overflow and flags warnings", () => {
      const heavySkills: SkillDefinition[] = [
        {
          name: "heavy-1",
          version: "1.0.0",
          description: "Heavy skill",
          domain: "orchestration",
          contextBudgetTokens: 2500,
          triggers: { agents: ["worker"] },
        },
        {
          name: "heavy-2",
          version: "1.0.0",
          description: "Heavy skill 2",
          domain: "orchestration",
          contextBudgetTokens: 2000,
          triggers: { agents: ["worker"] },
        },
      ];

      const matrix = resolveSkillMatrix(["worker"], heavySkills, {
        defaultTokenBudget: 4000,
      });

      assert.equal(matrix.overallTokenHealth, "exhausted");
      const workerBinding = matrix.bindings["worker"];
      assert.equal(workerBinding.totalStaticTokens, 4500);
      assert.equal(workerBinding.contextHeadroomPercent, 0);
      assert.ok(workerBinding.warnings.length > 0);
      assert.ok(workerBinding.warnings[0].includes("exceeds token budget limit"));
    });
  });

  describe("10-Harness Configuration Generator", () => {
    const harnesses: HarnessTarget[] = [
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

    for (const h of harnesses) {
      it(`generates valid output files for harness: ${h}`, () => {
        const config = generateHarnessConfig(h, sampleSkills, {
          projectName: "test-fleet",
        });

        assert.equal(config.target, h);
        assert.equal(config.validationStatus, "valid");
        assert.ok(config.outputFiles.length >= 1, `${h} should produce at least 1 output file`);

        for (const file of config.outputFiles) {
          assert.ok(file.relativePath.length > 0);
          assert.ok(file.content.length > 0);
        }
      });
    }

    it("generates Claude Code commands and config files", () => {
      const config = generateHarnessConfig("claude-code", sampleSkills);
      const configJson = config.outputFiles.find((f) => f.relativePath === ".claude/config.json");
      assert.ok(configJson);
      const parsed = JSON.parse(configJson.content);
      assert.equal(parsed.harness, "claude-code");
      assert.equal(parsed.enabledSkills.length, 3);

      const cmd = config.outputFiles.find((f) => f.relativePath.includes("systematic-debugging"));
      assert.ok(cmd);
      assert.ok(cmd.content.includes("# /systematic-debugging"));
    });

    it("generates OpenAI Codex skill schema", () => {
      const config = generateHarnessConfig("codex", sampleSkills);
      const codexFile = config.outputFiles.find((f) => f.relativePath === ".codex/skills.json");
      assert.ok(codexFile);
      const parsed = JSON.parse(codexFile.content);
      assert.equal(parsed.skills.length, 3);
      assert.equal(parsed.skills[0].name, "systematic-debugging");
    });
  });

  describe("Workspace Skill Discovery Scanner", () => {
    it("scans workspace directory and classifies maturity stages", () => {
      const result = scanWorkspaceSkills("./skills/safety");
      assert.ok(result.filesScanned > 0);
      assert.ok(result.skillsFound.length > 0);

      const secretDetector = result.skillsFound.find((s) => s.name.includes("secret-detector"));
      assert.ok(secretDetector, "Should find secret-detector skill");
      assert.ok(secretDetector.hasFrontmatter);
      assert.ok(secretDetector.commercialReadinessScore > 0);
      assert.ok(secretDetector.stageLabel.includes("Stage"));
    });
  });

  describe("Empirical Valuation & Pricing Engine", () => {
    it("computes capability depth, complexity, ROI, and fair market MSRP", () => {
      const report = auditSkillValuation(sampleSkills[0]);

      assert.equal(report.skillName, "systematic-debugging");
      assert.ok(report.metrics.capabilityDepthScore >= 30);
      assert.ok(report.metrics.executionComplexityMultiplier >= 1.0);
      assert.ok(report.metrics.estimatedWeeklyHoursSaved >= 1.0);
      assert.ok(report.metrics.annualLaborSavingsUSD > 0);
      assert.ok(report.valuationIndex > 0);

      // Pricing tiers
      assert.equal(report.suggestedPricing.freeCommunityMSRP, 0);
      assert.ok(report.suggestedPricing.builderTierMSRP >= 19);
      assert.ok(report.suggestedPricing.proTierMSRP >= report.suggestedPricing.builderTierMSRP);
      assert.ok(report.suggestedPricing.teamTierMonthly >= 99);
      assert.ok(report.suggestedPricing.enterpriseAnnual >= 1200);

      assert.ok(report.commercialStrategy.freeTierFeatures.length > 0);
      assert.ok(report.commercialStrategy.proTierFeatures.length > 0);
    });
  });

  describe("Multi-Marketplace Syndication Bundler", () => {
    const targets: SyndicationTarget[] = ["openclaw", "agentskills", "claude", "openai", "starlight"];

    it("builds compliant distribution bundles for all 5 marketplace targets", () => {
      const bundle = buildSyndicationBundle(sampleSkills[0], targets, {
        author: "FrankX",
        pricingUSD: 49,
      });

      assert.equal(bundle.skillName, "systematic-debugging");
      assert.ok(bundle.sha256Digest.length === 64, "Bundle should carry a 64-char hex SHA256 digest");
      assert.ok(bundle.sipAttestation.includes("Built on SIP — Starlight Intelligence Protocol v1.1.1"));
      assert.ok(bundle.sipAttestation.includes("Author: FrankX"));

      // Target manifests
      assert.ok(bundle.targetManifests.starlight);
      assert.ok(bundle.targetManifests.openclaw);
      assert.ok(bundle.targetManifests.agentskills);
      assert.ok(bundle.targetManifests.claude);
      assert.ok(bundle.targetManifests.openai);

      // Check generated files
      const paths = bundle.exportedFiles.map((f) => f.relativePath);
      assert.ok(paths.includes("SKILL.md"));
      assert.ok(paths.includes("claw.json"));
      assert.ok(paths.includes("package.json"));
      assert.ok(paths.includes(".claude-plugin.json"));
      assert.ok(paths.includes("openapi.json"));
      assert.ok(paths.includes("starlight-manifest.json"));
    });

    it("syndicates skill with verified attestation hash", () => {
      const result = syndicateSkill(sampleSkills[1], ["openclaw", "starlight"]);
      assert.equal(result.success, true);
      assert.equal(result.skillName, "multi-agent-coordination");
      assert.deepEqual(result.publishedTargets, ["openclaw", "starlight"]);
      assert.equal(result.attestationSha.length, 64);
    });
  });
});
