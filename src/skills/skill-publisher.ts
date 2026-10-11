/**
 * Starlight Intelligence System — Sovereign Skill Publisher & Dual Monetization Pipeline
 *
 * Validates skills against the 3-level progressive disclosure standard,
 * computes empirical fair-market valuations, configures dual monetization rails
 * (Stripe Enterprise + Polar Developer/Open-Source), stamps immutable SIP v1.1.1
 * cryptographic attestation seals, and bundles distribution packages across 5 marketplaces.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { auditSkillValuation } from "./valuation-pricing-engine.js";
import { syndicateSkill } from "./marketplace-syndicator.js";
import { loadSkillFromFile } from "./legacy-bridge.js";
import type {
  SkillPricingTier,
  SyndicationTarget,
  ValuationReport,
  SyndicationResult,
} from "./types.js";

export type MonetizationRail = "stripe" | "polar" | "both" | "community-free";

export interface ProgressiveDisclosureAudit {
  level: 1 | 2 | 3;
  level1Metadata: boolean;
  level2Instructions: boolean;
  level3ExecutionDeepDive: boolean;
  score: number;
  recommendation: string;
}

export interface StripeMonetizationConfig {
  enabled: boolean;
  suggestedPriceUSD: number;
  currency: string;
  mode: "payment" | "subscription";
  productName: string;
  meteredUsage: boolean;
}

export interface PolarMonetizationConfig {
  enabled: boolean;
  tierName: string;
  monthlyUSD: number;
  benefits: string[];
}

export interface DualMonetizationConfig {
  tier: SkillPricingTier;
  rail: MonetizationRail;
  stripe: StripeMonetizationConfig;
  polar: PolarMonetizationConfig;
}

export interface PublishSkillOptions {
  author?: string;
  license?: string;
  monetization?: MonetizationRail;
  monetizationRail?: MonetizationRail;
  tier?: SkillPricingTier;
  pricingTier?: SkillPricingTier;
  outDir?: string;
  syndicateTargets?: SyndicationTarget[];
}

export interface SkillPublishPayload {
  name: string;
  version?: string;
  title?: string;
  description?: string;
  domain?: string;
  license?: string;
  pricingTier?: SkillPricingTier;
  content: string;
}

export interface PublishedSkillPackage {
  success: boolean;
  skillName: string;
  version: string;
  pricingTier: SkillPricingTier;
  attestationSha: string;
  attestationSha256: string;
  sipProtocolVersion: string;
  progressiveDisclosureAudit: ProgressiveDisclosureAudit;
  monetizationConfig: DualMonetizationConfig;
  syndication: SyndicationResult;
  packagedFiles: Array<{ path: string; format: string; sizeBytes: number }>;
  valuation?: ValuationReport;
}

/**
 * Validates 3-level progressive disclosure compliance in a skill content string.
 */
export function auditProgressiveDisclosure(content: string): ProgressiveDisclosureAudit {
  const hasLevel1 = /---[\s\S]+?name:[\s\S]+?---/i.test(content) || /^#\s+[A-Za-z0-9]/m.test(content);
  const hasLevel2 = /(##\s+(Instructions|Mission|Workflow|Usage|Overview)|When to use)/i.test(content);
  const hasLevel3 = /(##\s+(Workflows|Verification|Checklist|Implementation|Edge Cases)|```(bash|typescript|python|json))/i.test(content);

  const lines = content.split("\n").length;
  let level: 1 | 2 | 3 = 1;
  let score = 30;

  if (hasLevel1) score += 20;
  if (hasLevel2) {
    score += 25;
    level = 2;
  }
  if (hasLevel3 && lines >= 30) {
    score += 25;
    level = 3;
  }

  let recommendation = "Level 1: Minimal metadata. Add ## Instructions and practical workflows.";
  if (level === 2) {
    recommendation = "Level 2: Clear mission and guidance. Add structured workflows and verification gates to reach Level 3.";
  } else if (level === 3) {
    recommendation = "Level 3: Full progressive disclosure achieved (Metadata -> Instructions -> Deep Execution).";
  }

  return {
    level,
    level1Metadata: hasLevel1,
    level2Instructions: hasLevel2,
    level3ExecutionDeepDive: hasLevel3,
    score: Math.min(100, score),
    recommendation,
  };
}

/**
 * Publishes a skill by validating, empirically valuing, configuring dual monetization,
 * stamping with SIP v1.1.1 SHA-256, and bundling for multi-marketplace syndication.
 */
export function publishSkill(
  input: string | SkillPublishPayload,
  options: PublishSkillOptions = {}
): PublishedSkillPackage {
  let skillData: SkillPublishPayload;

  if (typeof input === "string") {
    const filePath = existsSync(input) && statSync(input).isDirectory()
      ? join(input, "SKILL.md")
      : input;

    if (!existsSync(filePath)) {
      throw new Error(`Cannot publish skill: file not found at "${input}"`);
    }

    const loaded = loadSkillFromFile(filePath);
    const content = loaded.rawMarkdown ?? loaded.instructions ?? readFileSync(filePath, "utf8");
    skillData = {
      name: loaded.name,
      version: loaded.version || "1.0.0",
      title: loaded.title,
      description: loaded.description,
      domain: (loaded as any).domain || "general",
      license: loaded.license || "MIT",
      pricingTier: loaded.pricingTier || "builder",
      content,
    };
  } else {
    skillData = input;
  }

  const content = skillData.content;
  const name = skillData.name;
  const version = skillData.version || "1.0.0";
  const tier: SkillPricingTier = options.tier || options.pricingTier || skillData.pricingTier || "builder";
  const rail: MonetizationRail = options.monetization || options.monetizationRail || "both";

  // 1. Audit progressive disclosure
  const disclosure = auditProgressiveDisclosure(content);

  // 2. Audit empirical valuation
  const valuation = auditSkillValuation({
    name,
    version,
    description: skillData.description || `Starlight skill ${name}`,
    domain: skillData.domain || "general",
    content,
  });

  // 3. Dual monetization pricing calculation
  let priceUSD = 29;
  let polarTierName = "Builder";
  let metered = false;
  let mode: "payment" | "subscription" = "payment";

  if (tier === "free") {
    priceUSD = 0;
    polarTierName = "Community";
  } else if (tier === "builder") {
    priceUSD = valuation.suggestedPricing?.builderTierMSRP ?? 29;
    polarTierName = "Indie Builder";
  } else if (tier === "pro") {
    priceUSD = valuation.suggestedPricing?.proTierMSRP ?? 79;
    polarTierName = "Pro Builder";
    metered = true;
  } else if (tier === "team") {
    priceUSD = valuation.suggestedPricing?.teamTierMonthly ?? 199;
    polarTierName = "Team Swarm";
    mode = "subscription";
    metered = true;
  } else if (tier === "enterprise") {
    priceUSD = valuation.suggestedPricing?.enterpriseAnnual ?? 999;
    polarTierName = "Enterprise Sovereign";
    mode = "subscription";
    metered = true;
  }

  const monetizationConfig: DualMonetizationConfig = {
    tier,
    rail,
    stripe: {
      enabled: rail === "stripe" || rail === "both",
      suggestedPriceUSD: priceUSD,
      currency: "usd",
      mode,
      productName: `Starlight Skill: ${name} (${tier.toUpperCase()})`,
      meteredUsage: metered,
    },
    polar: {
      enabled: rail === "polar" || rail === "both",
      tierName: polarTierName,
      monthlyUSD: priceUSD,
      benefits: [
        "Cryptographically Attested SIP Package",
        "License Key Generation & Validation",
        "Discord Sovereign Builder Role Gate",
        "Private Continuous Model Update Feed",
      ],
    },
  };

  // 4. Multi-marketplace syndication
  const targets: SyndicationTarget[] = options.syndicateTargets ?? [
    "starlight",
    "openclaw",
    "agentskills",
    "claude",
    "openai",
  ];

  const syndication = syndicateSkill(
    {
      name,
      version,
      description: skillData.description || `Autonomous skill ${name}`,
      domain: skillData.domain || "general",
      license: skillData.license || "MIT",
      content,
    },
    targets
  );

  // 5. Attestation hash
  const attestationSha = createHash("sha256")
    .update(`${name}:${version}:${tier}:${content}`)
    .digest("hex");

  const packagedFiles: Array<{ path: string; format: string; sizeBytes: number }> = [];

  // 6. Write to disk if outDir provided
  if (options.outDir) {
    if (!existsSync(options.outDir)) {
      mkdirSync(options.outDir, { recursive: true });
    }

    // SKILL.md
    const skillMdPath = join(options.outDir, "SKILL.md");
    writeFileSync(skillMdPath, content, "utf8");
    packagedFiles.push({ path: skillMdPath, format: "markdown", sizeBytes: Buffer.byteLength(content, "utf8") });

    // manifest.json
    const manifest = {
      schema: "sip.skill.manifest.v1",
      name,
      version,
      pricingTier: tier,
      attestationSha256: attestationSha,
      author: options.author || "Starlight Sovereign Creator",
      license: skillData.license || "MIT",
      progressiveDisclosureLevel: disclosure.level,
      syndicationTargets: targets,
    };
    const manifestPath = join(options.outDir, "manifest.json");
    const manifestStr = JSON.stringify(manifest, null, 2);
    writeFileSync(manifestPath, manifestStr, "utf8");
    packagedFiles.push({ path: manifestPath, format: "json", sizeBytes: Buffer.byteLength(manifestStr, "utf8") });

    // monetization.json
    const monetizationPath = join(options.outDir, "monetization.json");
    const monetizationStr = JSON.stringify(monetizationConfig, null, 2);
    writeFileSync(monetizationPath, monetizationStr, "utf8");
    packagedFiles.push({ path: monetizationPath, format: "json", sizeBytes: Buffer.byteLength(monetizationStr, "utf8") });
  }

  return {
    success: true,
    skillName: name,
    version,
    pricingTier: tier,
    attestationSha,
    attestationSha256: attestationSha,
    sipProtocolVersion: "1.1.1",
    progressiveDisclosureAudit: disclosure,
    monetizationConfig,
    syndication,
    packagedFiles,
    valuation,
  };
}
