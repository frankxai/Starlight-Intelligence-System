/**
 * Starlight Intelligence System — Skill Valuation & Pricing Engine
 *
 * Computes empirical valuations and pricing models based on capability depth,
 * execution complexity, token efficiency, and developer hours saved.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import type {
  SkillDefinition,
  ScannedSkill,
  ValuationReport,
  ValuationMetrics,
  SuggestedPricingTiers,
  CreatorRevenueShare,
  SkillMaturityStage,
} from "./types.js";
import { estimateTokenCount } from "./skill-matrix.js";

const BASE_DEVELOPER_HOURLY_RATE_USD = 100;

/**
 * Audits a skill and produces an empirical valuation report with price tier recommendations.
 */
export function auditSkillValuation(
  skill: SkillDefinition | ScannedSkill
): ValuationReport {
  const isScanned = "stage" in skill;
  const stage: SkillMaturityStage = isScanned
    ? (skill as ScannedSkill).stage
    : 2;

  const content = (skill as SkillDefinition).content ?? (skill as SkillDefinition).description ?? "";
  const tokenLength = isScanned
    ? (skill as ScannedSkill).estimatedTokens
    : estimateTokenCount(content);

  const hasScripts = isScanned
    ? (skill as ScannedSkill).hasScripts
    : Boolean((skill as SkillDefinition).scripts?.length);

  const hasReferences = isScanned
    ? (skill as ScannedSkill).hasReferences
    : Boolean((skill as SkillDefinition).references?.length);

  const hasEvals = isScanned
    ? (skill as ScannedSkill).hasEvals
    : Boolean((skill as SkillDefinition).evals?.length);

  // 1. Capability Depth Score (0-100)
  let depth = 30; // base score for a well-formed prompt
  if (tokenLength > 500) depth += 15;
  if (tokenLength > 1500) depth += 15;
  if (hasReferences) depth += 15;
  if (hasEvals) depth += 15;
  if (content.toLowerCase().includes("step") || content.toLowerCase().includes("phase")) depth += 10;
  const capabilityDepthScore = Math.min(100, Math.max(10, depth));

  // 2. Execution Complexity Multiplier (1.0 to 3.5)
  let complexity = 1.0;
  if (hasScripts) complexity += 1.0;
  if (hasEvals) complexity += 0.5;
  if (content.includes("mcp") || content.includes("api") || content.includes("tool")) complexity += 0.5;
  if (stage >= 3) complexity += 0.5;
  const executionComplexityMultiplier = Number(complexity.toFixed(2));

  // 3. Token Efficiency Ratio (ratio of value to context consumed)
  // Higher is better: delivering dense capabilities in tight prompts
  let efficiency = 2.0;
  if (tokenLength <= 1000 && depth >= 60) efficiency = 3.5;
  else if (tokenLength <= 2000 && depth >= 70) efficiency = 2.8;
  else if (tokenLength > 4000) efficiency = 1.4;
  const tokenEfficiencyRatio = Number(efficiency.toFixed(2));

  // 4. Estimated Weekly Hours Saved (1.0 to 8.0 hrs)
  let hoursSaved = 1.0;
  if (stage >= 2) hoursSaved += 1.5;
  if (hasScripts) hoursSaved += 2.0;
  if (depth >= 75) hoursSaved += 2.0;
  const estimatedWeeklyHoursSaved = Number(hoursSaved.toFixed(1));

  // 5. Annual Labor Savings in USD
  const annualLaborSavingsUSD = Math.round(
    estimatedWeeklyHoursSaved * 50 * BASE_DEVELOPER_HOURLY_RATE_USD
  );

  // 6. Valuation Index:
  // (Depth/10) * Complexity * (1 + Hours/5) * (Efficiency/2)
  const valuationIndex = Number(
    (
      (capabilityDepthScore / 10) *
      executionComplexityMultiplier *
      (1 + estimatedWeeklyHoursSaved / 5) *
      (tokenEfficiencyRatio / 2)
    ).toFixed(1)
  );

  // 7. Pricing Tiers Calculation
  // Grounded in labor value savings (typically 1-3% of annual labor value saved)
  const baseMSRP = Math.max(19, Math.round(valuationIndex * 1.5));
  const suggestedPricing: SuggestedPricingTiers = {
    freeCommunityMSRP: 0,
    builderTierMSRP: Math.min(49, Math.max(29, Math.round(baseMSRP * 0.5))),
    proTierMSRP: Math.min(199, Math.max(79, baseMSRP)),
    teamTierMonthly: Math.min(499, Math.max(199, Math.round(baseMSRP * 2.5))),
    enterpriseAnnual: Math.min(9600, Math.max(999, Math.round(annualLaborSavingsUSD * 0.15))),
  };

  // 8. Creator Revenue Share & MoR Take-Home Calculation (85 / 15 Split)
  const creatorSharePercent = 85;
  const platformSharePercent = 15;
  const polarMoRFeePercent = 4.0;
  const polarMoRFeeFixedUSD = 0.40;
  const stripeFeePercent = 2.9;
  const stripeFeeFixedUSD = 0.30;

  const calcNetCreator = (grossUSD: number, isMoR: boolean = true): number => {
    if (grossUSD <= 0) return 0;
    const procFee = isMoR
      ? grossUSD * (polarMoRFeePercent / 100) + polarMoRFeeFixedUSD
      : grossUSD * (stripeFeePercent / 100) + stripeFeeFixedUSD;
    const netAfterProc = Math.max(0, grossUSD - procFee);
    const creatorNet = netAfterProc * (creatorSharePercent / 100);
    return Number(creatorNet.toFixed(2));
  };

  const netCreatorPayoutUSD = {
    builderTier: calcNetCreator(suggestedPricing.builderTierMSRP, true),
    proTier: calcNetCreator(suggestedPricing.proTierMSRP, true),
    teamMonthly: calcNetCreator(suggestedPricing.teamTierMonthly, true),
    enterpriseAnnual: calcNetCreator(suggestedPricing.enterpriseAnnual, false),
  };

  const avgNetPerUser = (netCreatorPayoutUSD.proTier * 0.7) + (netCreatorPayoutUSD.teamMonthly * 0.3);

  const projectedMonthlyRevenueUSD = {
    conservative50Users: Math.round(50 * avgNetPerUser),
    moderate250Users: Math.round(250 * avgNetPerUser),
    scale1000Users: Math.round(1000 * avgNetPerUser),
  };

  const revenueShare: CreatorRevenueShare = {
    creatorSharePercent,
    platformSharePercent,
    polarMoRFeePercent,
    polarMoRFeeFixedUSD,
    stripeFeePercent,
    stripeFeeFixedUSD,
    netCreatorPayoutUSD,
    projectedMonthlyRevenueUSD,
  };

  // 9. Breakdown Contributions
  const valueBreakdown = {
    depthScoreContribution: capabilityDepthScore,
    complexityMultiplier: executionComplexityMultiplier,
    laborROIContribution: annualLaborSavingsUSD,
    tokenEfficiencyBonus: tokenEfficiencyRatio,
  };

  // 10. Commercial Packaging Recommendations
  const commercialStrategy = {
    freeTierFeatures: [
      "Core instructions and single-step prompt triggers",
      "Standard interactive execution in local terminal",
      "Community forum support and MIT reference docs",
    ],
    proTierFeatures: [
      "Deterministic script toolplane and automated AST refactoring",
      "Multi-agent swarm coordination and Santa review hooks",
      "Ground-truth evals suite and verified SLA benchmarks",
      "Priority updates and Starlight Sovereign Attestation seal",
    ],
    recommendedLicense: stage >= 3 ? "SIP-Commercial-v1.1" : "MIT",
  };

  const metrics: ValuationMetrics = {
    capabilityDepthScore,
    executionComplexityMultiplier,
    tokenEfficiencyRatio,
    estimatedWeeklyHoursSaved,
    annualLaborSavingsUSD,
  };

  return {
    skillName: skill.name,
    evaluatedAt: new Date().toISOString(),
    maturityStage: stage,
    metrics,
    valuationIndex,
    suggestedPricing,
    revenueShare,
    valueBreakdown,
    commercialStrategy,
  };
}
