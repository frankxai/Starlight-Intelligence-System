/**
 * Starlight Intelligence System — Skill Council Orchestration Demo
 *
 * Demonstrates programmatic end-to-end execution of the 6-Mind Multi-Agent
 * Skill Council swarm:
 *
 * 1. Skill Council Lead (Convener & Dispatcher)
 * 2. Skill Auditor (Workspace Scanner & Maturity Classifier)
 * 3. Skill Valuation Specialist (Empirical Pricing & ROI Engine)
 * 4. Skill Architect (Agent-Skill Matrix & Context Headroom Budgeting)
 * 5. Harness Tuner (Cross-Harness Config Generator)
 * 6. Marketplace Syndicator (Multi-Marketplace Bundler & SIP Attestation)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { join } from "node:path";
import {
  scanWorkspaceSkills,
  auditSkillValuation,
  resolveSkillMatrix,
  generateHarnessConfig,
  syndicateSkill,
  loadSkillFromFile,
  type HarnessTarget,
  type SyndicationTarget,
} from "../../src/skills/index.js";

async function runSkillCouncilSwarmDemo() {
  console.log("================================================================================");
  console.log("       STARLIGHT INTELLIGENCE SYSTEM — SKILL COUNCIL ORCHESTRATION SWARM         ");
  console.log("================================================================================");
  console.log("Protocol: Built on SIP — Starlight Intelligence Protocol v1.1.1\n");

  const repoRoot = process.cwd();

  // ---------------------------------------------------------------------------
  // Phase 1: Skill Council Lead Convenes the Swarm
  // ---------------------------------------------------------------------------
  console.log("[Phase 1: Council Lead] Convening 6-Mind Skill Council...");
  const councilMembers = [
    "starlight-skill-council-lead",
    "starlight-skill-architect",
    "starlight-skill-auditor",
    "starlight-skill-valuation-specialist",
    "starlight-harness-tuner",
    "starlight-marketplace-syndicator",
  ];
  console.log(`Active Council Swarm: ${councilMembers.join(", ")}\n`);

  // ---------------------------------------------------------------------------
  // Phase 2: Skill Auditor Scans Workspace
  // ---------------------------------------------------------------------------
  const scanTargetDir = join(repoRoot, "skills", "safety");
  console.log(`[Phase 2: Skill Auditor] Scanning workspace path: ${scanTargetDir}`);
  const scanResult = scanWorkspaceSkills(scanTargetDir);
  console.log(`Files scanned: ${scanResult.filesScanned}`);
  console.log(`Skills discovered: ${scanResult.skillsFound.length}`);
  console.log("Stage Breakdown:", JSON.stringify(scanResult.stageSummary, null, 2));
  console.log("Discovered Skills:");
  for (const s of scanResult.skillsFound) {
    console.log(`  - ${s.name} [Stage ${s.stage}: ${s.stageLabel}] ~${s.estimatedTokens} tokens (Readiness: ${s.commercialReadinessScore}%)`);
  }
  console.log();

  // ---------------------------------------------------------------------------
  // Phase 3: Skill Valuation Specialist Audits Economic Value & Pricing Tiers
  // ---------------------------------------------------------------------------
  const sampleSkillPath = join(repoRoot, "skills", "safety", "secret-detector", "SKILL.md");
  console.log(`[Phase 3: Valuation Specialist] Auditing skill: ${sampleSkillPath}`);
  const loadedSkill = loadSkillFromFile(sampleSkillPath);
  const valuation = auditSkillValuation({
    name: loadedSkill.name,
    version: loadedSkill.version,
    description: loadedSkill.description,
    domain: "safety",
    content: loadedSkill.rawMarkdown ?? loadedSkill.instructions,
  });

  console.log(`Valuation Index: ${valuation.valuationIndex} pts`);
  console.log(`Capability Depth: ${valuation.metrics.capabilityDepthScore}/100`);
  console.log(`Complexity Multiplier: ${valuation.metrics.executionComplexityMultiplier}x`);
  console.log(`Estimated Labor Savings: ${valuation.metrics.estimatedWeeklyHoursSaved} hrs/wk ($${valuation.metrics.annualLaborSavingsUSD.toLocaleString()}/yr)`);
  console.log("Suggested Fair-Market Pricing Tiers:");
  console.log(`  - Free Community: $${valuation.suggestedPricing.freeCommunityMSRP}`);
  console.log(`  - Builder Tier:   $${valuation.suggestedPricing.builderTierMSRP} (One-time)`);
  console.log(`  - Pro Tier:       $${valuation.suggestedPricing.proTierMSRP} (One-time)`);
  console.log(`  - Team Tier:      $${valuation.suggestedPricing.teamTierMonthly}/mo`);
  console.log(`  - Enterprise:     $${valuation.suggestedPricing.enterpriseAnnual.toLocaleString()}/yr`);
  console.log();

  // ---------------------------------------------------------------------------
  // Phase 4: Skill Architect Allocates Skills & Enforces Context Headroom
  // ---------------------------------------------------------------------------
  console.log("[Phase 4: Skill Architect] Resolving Agent-Skill Matrix & Headroom...");
  const agents = ["orchestrator", "prime", "architect", "sentinel", "weaver", "sage"];
  const sampleSkills = [
    {
      name: "secret-detector",
      version: "1.0.0",
      description: "Zero-trust PII & secret scrubbing gateway",
      domain: "safety",
      contextBudgetTokens: 600,
      triggers: { agents: ["sentinel", "prime"] },
    },
    {
      name: "systematic-debugging",
      version: "1.0.0",
      description: "Systematic root cause investigation and verification",
      domain: "code-intelligence",
      contextBudgetTokens: 1200,
      triggers: { agents: ["architect", "sentinel"] },
    },
    {
      name: "vault-management",
      version: "1.0.0",
      description: "Semantic memory recall and vault updates",
      domain: "memory",
      contextBudgetTokens: 800,
      triggers: { agents: ["sage", "orchestrator"] },
    },
  ];

  const matrix = resolveSkillMatrix(agents, sampleSkills);
  console.log(`Overall Context Token Health: ${matrix.overallTokenHealth.toUpperCase()}`);
  for (const [agentId, binding] of Object.entries(matrix.bindings)) {
    console.log(`  Agent [${agentId}]: ${binding.assignedSkills.length} skills | ${binding.totalStaticTokens} tokens | Headroom: ${binding.contextHeadroomPercent}%`);
  }
  console.log();

  // ---------------------------------------------------------------------------
  // Phase 5: Harness Tuner Generates Native Harness Configurations
  // ---------------------------------------------------------------------------
  const testHarnesses: HarnessTarget[] = ["claude-code", "antigravity", "codex"];
  console.log(`[Phase 5: Harness Tuner] Compiling native configurations for: ${testHarnesses.join(", ")}`);
  for (const harness of testHarnesses) {
    const config = generateHarnessConfig(harness, sampleSkills);
    console.log(`  Harness [${harness}]: ${config.validationStatus.toUpperCase()} (${config.outputFiles.length} files generated)`);
    for (const file of config.outputFiles) {
      console.log(`    -> ${file.relativePath} (${file.format})`);
    }
  }
  console.log();

  // ---------------------------------------------------------------------------
  // Phase 6: Marketplace Syndicator Packages Multi-Marketplace Bundle & SIP Attestation
  // ---------------------------------------------------------------------------
  console.log("[Phase 6: Marketplace Syndicator] Building universal marketplace syndication bundle...");
  const marketplaces: SyndicationTarget[] = ["openclaw", "agentskills", "claude", "openai", "starlight"];
  const syndication = syndicateSkill(
    {
      name: "safety/secret-detector",
      version: "1.0.0",
      description: "Zero-trust PII & secret scrubbing gateway",
      domain: "safety",
      license: "MIT",
      content: loadedSkill.instructions || loadedSkill.description,
    },
    marketplaces
  );

  console.log(`Syndication Status: ${syndication.success ? "SUCCESS" : "FAILED"}`);
  console.log(`Target Marketplaces (${syndication.publishedTargets.length}): ${syndication.publishedTargets.join(", ")}`);
  console.log(`Immutable SIP Attestation Digest: ${syndication.attestationSha}`);
  console.log("Bundled Manifests & Artifacts:");
  for (const f of syndication.bundle.exportedFiles) {
    console.log(`  - ${f.relativePath}`);
  }
  console.log();

  console.log("================================================================================");
  console.log("      SKILL COUNCIL SWARM COMPLETED SUCCESSFULLY WITH 100% ATTESTED RECEIPTS     ");
  console.log("================================================================================");
}

runSkillCouncilSwarmDemo().catch((err) => {
  console.error("Skill Council Swarm Demo failed:", err);
  process.exit(1);
});
