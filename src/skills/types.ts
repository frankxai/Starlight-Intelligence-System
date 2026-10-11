/**
 * Starlight Intelligence System — Skills Engine Types
 *
 * Universal Skill Matrix, Multi-Harness Tuner, Discovery Scanner,
 * Empirical Valuation, and Multi-Marketplace Syndication contracts.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

export type SkillDomain =
  | "code-intelligence"
  | "orchestration"
  | "memory"
  | "integration"
  | "foundry"
  | "business"
  | "vision"
  | "health"
  | "relational"
  | "people-intelligence"
  | "sound-intelligence"
  | "music-is"
  | "energy"
  | "machine"
  | "crypto-intelligence"
  | "safety"
  | "marine-intelligence"
  | "general";

export interface SkillTrigger {
  keywords?: string[];
  files?: string[];
  intents?: string[];
  agents?: string[];
}

export interface SkillPermissionGate {
  terminal?: "none" | "read-only" | "read-write";
  filesystem?: "none" | "read-only" | "read-write";
  network?: "none" | "read-only" | "read-write";
  secrets?: "none" | "read-only" | "read-write";
}

export interface SkillSyndicationFlags {
  openclaw?: boolean;
  agentskills?: boolean;
  claude_plugin?: boolean;
  openai_action?: boolean;
  starlight_hub?: boolean;
}

export interface SkillDefinition {
  name: string;
  version: string;
  description: string;
  domain: SkillDomain | string;
  license?: string;
  tier?: string;
  author?: string;
  contextBudgetTokens?: number;
  triggers?: SkillTrigger;
  permissions?: SkillPermissionGate;
  syndication?: SkillSyndicationFlags;
  rawFrontmatter?: Record<string, unknown>;
  content?: string;
  scripts?: { name: string; path: string; runner?: string }[];
  references?: { name: string; path: string }[];
  evals?: { name: string; path: string }[];
}

export interface AgentSkillBinding {
  agentId: string;
  assignedSkills: string[];
  totalStaticTokens: number;
  tokenBudgetLimit: number;
  contextHeadroomPercent: number;
  warnings: string[];
}

export interface SkillMatrix {
  timestamp: string;
  bindings: Record<string, AgentSkillBinding>;
  overallTokenHealth: "healthy" | "congested" | "exhausted";
  totalRegisteredSkills: number;
  warnings: string[];
}

export type SkillPricingTier = "free" | "builder" | "pro" | "team" | "enterprise";

export type HarnessTarget =
  | "claude-code"
  | "codex"
  | "antigravity"
  | "grok"
  | "hermes"
  | "gemini-cli"
  | "cursor"
  | "opencode"
  | "kilo"
  | "windsurf";

export interface HarnessOutputFile {
  relativePath: string;
  content: string;
  format: "json" | "markdown" | "yaml" | "toml";
}

export interface HarnessConfig {
  target: HarnessTarget;
  outputFiles: HarnessOutputFile[];
  activeSkillsCount: number;
  instructionsSnippet: string;
  validationStatus: "valid" | "warning" | "invalid";
  notes: string[];
}

export type SkillMaturityStage = 0 | 1 | 2 | 3 | 4;

export interface ScannedSkill {
  relativePath: string;
  name: string;
  domain: string;
  stage: SkillMaturityStage;
  stageLabel: string;
  hasFrontmatter: boolean;
  hasScripts: boolean;
  hasReferences: boolean;
  hasEvals: boolean;
  estimatedTokens: number;
  triggersDetected: string[];
  suggestedMSRPUSD?: number;
  commercialReadinessScore: number; // 0 - 100
  warnings: string[];
}

export interface WorkspaceScanResult {
  rootPath: string;
  timestamp: string;
  filesScanned: number;
  skillsFound: ScannedSkill[];
  stageSummary: {
    stage0_scratchpad: number;
    stage1_workspace_skill: number;
    stage2_team_swarm: number;
    stage3_community_pack: number;
    stage4_sovereign_premium: number;
  };
  recommendations: string[];
}

export interface ValuationMetrics {
  capabilityDepthScore: number;     // 0 - 100
  executionComplexityMultiplier: number; // 1.0 - 3.5
  tokenEfficiencyRatio: number;      // e.g. 1.2 - 5.0
  estimatedWeeklyHoursSaved: number; // e.g. 1.5 - 10.0
  annualLaborSavingsUSD: number;     // based on $100/hr baseline
}

export interface SuggestedPricingTiers {
  freeCommunityMSRP: number; // $0
  builderTierMSRP: number;   // e.g. $29 one-time or $9/mo
  proTierMSRP: number;       // e.g. $89 one-time or $29/mo
  teamTierMonthly: number;   // e.g. $299/mo
  enterpriseAnnual: number;  // e.g. $2,400/yr
}

export interface ValuationReport {
  skillName: string;
  evaluatedAt: string;
  maturityStage: SkillMaturityStage;
  metrics: ValuationMetrics;
  valuationIndex: number;
  suggestedPricing: SuggestedPricingTiers;
  valueBreakdown: {
    depthScoreContribution: number;
    complexityMultiplier: number;
    laborROIContribution: number;
    tokenEfficiencyBonus: number;
  };
  commercialStrategy: {
    freeTierFeatures: string[];
    proTierFeatures: string[];
    recommendedLicense: string;
  };
}

export type SyndicationTarget =
  | "openclaw"
  | "agentskills"
  | "claude"
  | "openai"
  | "starlight";

export interface SyndicationBundle {
  skillName: string;
  version: string;
  license: string;
  sha256Digest: string;
  sipAttestation: string;
  targetManifests: Record<SyndicationTarget, Record<string, unknown>>;
  exportedFiles: { relativePath: string; content: string }[];
}

export interface SyndicationResult {
  success: boolean;
  skillName: string;
  version: string;
  bundle: SyndicationBundle;
  publishedTargets: SyndicationTarget[];
  attestationSha: string;
  errors?: string[];
}
