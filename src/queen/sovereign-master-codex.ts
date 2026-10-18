import * as fs from 'node:fs';

export interface GitHubOrgFederationEntry {
  login: string;
  displayName: string;
  website: string;
  brandId: string;
  governanceMode: 'active' | 'reshape-frozen';
  missionAndScope: string;
  publicRepoCount: number;
  privateRepoCount: number;
  totalRepoCount: number;
  repositories: Array<{
    name: string;
    visibility: 'public' | 'private';
    primaryOwner: string;
    localCheckoutPresent: boolean;
  }>;
  responsibleAgentTeam: {
    leadQueenPersona: string;
    stewardAgents: string[];
    primaryMakerHarness: string;
    primaryCheckerHarness: string;
    asyncCloudFleet: string;
  };
  ossAndCommercialSplit: {
    openSourceWedge: string;
    commercialProductOrRetainer: string;
    communitySurface: string;
  };
}

export interface AgentTierDefinition {
  tierOrder: number;
  tierId: string;
  tierName: string;
  agentCount: number;
  representativeAgents: string[];
  whenTheyLead: string;
  preferredHarnesses: string[];
}

export interface CanonicalTruthAndAntiDriftRule {
  ruleNumber: number;
  id: string;
  title: string;
  category: 'workspace-ssot' | 'org-federation' | 'swarm-verification' | 'context-memory' | 'brand-gtm' | 'ci-cost-safety';
  oldAgentFailureMode: string;
  canonicalTruthAndPrinciple: string;
  deterministicEnforcementGate: string;
  verifiedArtifact: string;
}

export interface HorizonMilestonePlan {
  horizonId: 'now-immediate' | '2h-autonomous' | '12h-overnight' | '1w-sprint' | 'q4-2026-vision';
  label: string;
  primaryObjective: string;
  deliverables: string[];
  verificationCommand: string;
  status: 'completed-live' | 'in-execution' | 'scheduled-ready';
}

export interface SovereignMasterCodexSnapshot {
  generatedAt: string;
  visionStatement: string;
  missionStatement: string;
  totals: {
    githubOrganizations: number;
    federatedRepositories: number;
    publicOssRepositories: number;
    privateSovereignRepositories: number;
    namedAgentsInRegistry: number;
    autoActivatingSkills: number;
    federatedHarnesses: number;
    canonicalTruthsLocked: number;
  };
  organizations: GitHubOrgFederationEntry[];
  agentHierarchy: AgentTierDefinition[];
  canonicalTruthsAndAntiDrift: CanonicalTruthAndAntiDriftRule[];
  horizonMilestones: HorizonMilestonePlan[];
}

const ORG_DEFINITIONS: Array<
  Omit<
    GitHubOrgFederationEntry,
    'publicRepoCount' | 'privateRepoCount' | 'totalRepoCount' | 'repositories'
  > & {
    repos: Array<{ name: string; visibility: 'public' | 'private'; primaryOwner: string }>;
  }
> = [
  {
    login: 'Starlight-Intelligence',
    displayName: 'Starlight Intelligence',
    website: 'https://starlightintelligence.ai',
    brandId: 'starlight',
    governanceMode: 'active',
    missionAndScope:
      'Personal AI command center, memory routing, voice runtime, cross-harness agent configuration, design intelligence, and evaluation harnesses.',
    repos: [
      { name: 'starlight-command-center', visibility: 'private', primaryOwner: 'Starlight-Intelligence' },
      { name: 'starlight-agent-config', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlight-memory', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlight-voice', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-technology', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-design-intelligence', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-evals', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-android', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlightintelligence.ai', visibility: 'private', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Starlight Prime & Queen Orchestrator',
      stewardAgents: ['starlight-architect', 'starlight-sentinel', 'starlight-voice-operator', 'starlight-evaluator'],
      primaryMakerHarness: 'antigravity',
      primaryCheckerHarness: 'claude-code',
      asyncCloudFleet: 'jules-conductor + vercel-beta-rail',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'starlight-design-intelligence, starlight-agent-skills, starlight-evals, starlight-voice',
      commercialProductOrRetainer: 'Starlight Command Center Pro & Sovereign Operator Workstation ($49-$299/mo)',
      communitySurface: 'github.com/Starlight-Intelligence + starlightintelligence.ai',
    },
  },
  {
    login: 'Starlight-Intelligence-Systems',
    displayName: 'Starlight Intelligence Systems',
    website: 'https://starlightintelligence.org',
    brandId: 'starlight',
    governanceMode: 'active',
    missionAndScope:
      'Sovereign substrate, Starlight Intelligence Protocol (SIP), six-vault cognitive architecture, Layer-0 Rust invariant kernel, swarm coordination, and public research.',
    repos: [
      { name: 'Starlight-Intelligence-System', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-research-hub', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-knowledge-tree', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-cosmos-engine', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-swarm', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-memory-vault', visibility: 'private', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Starlight Prime & Sage Vault Keeper',
      stewardAgents: ['starlight-orchestrator', 'starlight-sage', 'starlight-hermes', 'starlight-navigator'],
      primaryMakerHarness: 'claude-code',
      primaryCheckerHarness: 'codex-cloud',
      asyncCloudFleet: 'ruflo-omo-swarm + jules-conductor',
    },
    ossAndCommercialSplit: {
      openSourceWedge: '@arcanea/starlight-intelligence-system npm package, SIP specification, 6-vault SQLite/FTS5 substrate',
      commercialProductOrRetainer: 'Self-Serve Sovereign Estate OS Packs, BYOK Cloud Mesh Licenses & Waitlist DemandSignal Tiers (Zero Retainers)',
      communitySurface: 'starlightintelligence.org/research + GitHub Discussions & Alliance Attestations',
    },
  },
  {
    login: 'Arcanea-Labs',
    displayName: 'Arcanea Labs',
    website: 'https://arcanea.ai',
    brandId: 'arcanea',
    governanceMode: 'active',
    missionAndScope:
      'Creative worldbuilding framework, 10-Gate Luminor progression academy, generative media studio (Veo + NanoBanana + Suno), and on-chain provenance.',
    repos: [
      { name: 'Arcanea', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-ai-app', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-studio', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-ecosystem', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-agent-skills', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'arcanea-onchain', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-orchestrator', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'AnimeLegends', visibility: 'private', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Arcanea Studio & Canon Engine Lead (Lumina lore scoped to app)',
      stewardAgents: ['starlight-weaver', 'canon-guardian', 'arcanea-author-council', 'social-visual-director'],
      primaryMakerHarness: 'antigravity',
      primaryCheckerHarness: 'claude-code',
      asyncCloudFleet: 'vercel-beta-rail + opencode-tokenpass',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'Arcanea open lore primers, arcanea-orchestrator, and community world-forge templates',
      commercialProductOrRetainer: 'Arcanea Realm Builder SaaS, Luminor Studio Pro, Digital Books & Collectible Media IP',
      communitySurface: 'arcanea.ai + Starbound Crews & 10-Gate Academy Guilds',
    },
  },
  {
    login: 'GenCreator-ai',
    displayName: 'GenCreator',
    website: 'https://gencreator.ai',
    brandId: 'gencreator',
    governanceMode: 'active',
    missionAndScope:
      'Agentic Creator OS (ACOS v12), GenCreator Studio, stateless workflow compilers, creator skill packs, launch storefront templates, and Suno/Creator MCP servers.',
    repos: [
      { name: 'gencreator.ai', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'GenCreator-OS', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'GenCreator-Studio', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-creator-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'creator-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'creator-launch-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'suno-mcp-server', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-creator-mcp', visibility: 'public', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'GenCreator ACOS Workflow & Multimodal Studio Lead',
      stewardAgents: ['starlight-envoy', 'starlight-music-producer', 'starlight-content-director', 'social-strategist'],
      primaryMakerHarness: 'hermes-coe',
      primaryCheckerHarness: 'claude-code',
      asyncCloudFleet: 'opencode-tokenpass + ruflo-omo-swarm',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'agentic-creator-os (ACOS v12, 110+ skills), suno-mcp-server, creator-launch-os',
      commercialProductOrRetainer: 'GenCreator Pro OS Packs, Self-Serve Studio Templates & BYOK Licenses',
      communitySurface: 'gencreator.ai + GitHub ACOS builder community (Risk R1 funnel bridge target)',
    },
  },
  {
    login: 'FrankX-AI',
    displayName: 'FrankX',
    website: 'https://frankx.ai',
    brandId: 'frankx',
    governanceMode: 'active',
    missionAndScope:
      'Flagship frankx.ai authority platform (40k+ monthly builders), Frontier Model Arena, multi-book publishing house, prompt library, Claude Code hooks, and Visual Intelligence System (VIS).',
    repos: [
      { name: 'frankx.ai-vercel-website', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'FrankX', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'author-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'publishing-house', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'prompt-library', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'claude-skills-library', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'mcp-doctor', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'claude-code-hooks', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'visual-intelligence', visibility: 'public', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'FrankX Systems Architect & Composer',
      stewardAgents: ['starlight-architect', 'starlight-weaver', 'social-fact-checker', 'social-sentinel'],
      primaryMakerHarness: 'claude-code',
      primaryCheckerHarness: 'antigravity',
      asyncCloudFleet: 'vercel-beta-rail + jules-conductor',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'claude-skills-library, claude-code-hooks, mcp-doctor, prompt-library, visual-intelligence',
      commercialProductOrRetainer: 'AI Architect Newsletter Pro, Digital Books, Self-Serve Architecture Blueprints & Templates (Zero Consulting)',
      communitySurface: 'frankx.ai (Top-of-funnel engine feeding GenCreator, Arcanea & Starlight)',
    },
  },
  {
    login: 'AI-Architect-Studio',
    displayName: 'AI Architect Studio',
    website: 'https://frankx.ai/ai-architect',
    brandId: 'ai-architect-studio',
    governanceMode: 'active',
    missionAndScope:
      'Enterprise AI architecture reference kits, 6-pillar AI Center of Excellence (CoE) blueprints, multi-cloud solution design diagrams, and self-serve agentic operating standards.',
    repos: [
      { name: 'ai-architect', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'ai-coe', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-architecture-field-guide', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-ai-coe', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-agent-operating-systems', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-operating-system-standard', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-ops', visibility: 'private', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Enterprise Chief AI Architect Queen',
      stewardAgents: ['starlight-architect', 'starlight-sentinel', 'starlight-business', 'oracle-ai-architect'],
      primaryMakerHarness: 'claude-code',
      primaryCheckerHarness: 'codex-cloud',
      asyncCloudFleet: 'jules-conductor',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'awesome-ai-coe, awesome-agent-operating-systems, agentic-architecture-field-guide',
      commercialProductOrRetainer: 'Self-Serve AI Department Blueprint Packs, BYOK CoE Reference Kits & Waitlist DemandSignal Capture',
      communitySurface: 'frankx.ai/ai-architect + Self-Serve Enterprise Architecture Library',
    },
  },
  {
    login: 'AI-Architect-Academy',
    displayName: 'AI Architect Academy',
    website: 'https://frankx.ai/academy',
    brandId: 'ai-architect-academy',
    governanceMode: 'active',
    missionAndScope:
      'Hands-on AI architecture curriculum, live kata labs, automated grading rubrics, and verifiable SIP-attested operator credentials.',
    repos: [
      { name: 'ai-architect-academy', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-intelligence-academy', visibility: 'private', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Academy Dean & Kata Evaluator Queen',
      stewardAgents: ['starlight-training', 'starlight-learning-architect', 'starlight-evaluator'],
      primaryMakerHarness: 'codex-cloud',
      primaryCheckerHarness: 'claude-code',
      asyncCloudFleet: 'opencode-tokenpass + jules-conductor',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'ai-architect-academy open kata starter labs & benchmark rubrics',
      commercialProductOrRetainer: 'Self-Paced Academy Builder Pass, Automated Kata Grading & SIP-Attested Credentials',
      communitySurface: 'frankx.ai/academy + Certified AI Architect Builder Network',
    },
  },
  {
    login: 'Agentic-Income',
    displayName: 'Agentic Income',
    website: 'https://agenticincome.ai',
    brandId: 'agentic-income',
    governanceMode: 'active',
    missionAndScope:
      'Digital product monetization catalogs, transparent comparison templates, FTC-compliant affiliate routing (@agentic-income/*), and local-first quantitative investor research (GenInvestor).',
    repos: [
      { name: 'agenticincome', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'agenticpassiveincome', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'awesome-agentic-income', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-income-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-income-template', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'affiliate-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-wealth-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-investor-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'GenInvestor', visibility: 'public', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Sovereign Wealth & DPI Strategist Queen',
      stewardAgents: ['starlight-wealth-dpi', 'starlight-quant-scout', 'starlight-sentinel'],
      primaryMakerHarness: 'codex-cloud',
      primaryCheckerHarness: 'claude-code',
      asyncCloudFleet: 'grok-cli + opencode-tokenpass',
    },
    ossAndCommercialSplit: {
      openSourceWedge: '@agentic-income/core, catalog, redirect, cli + GenInvestor + awesome-agentic-income',
      commercialProductOrRetainer: 'Pro Signal Terminal ($49/mo) & Sovereign Wealth Lab ($299/mo)',
      communitySurface: 'agenticincome.ai + Weekly Strategy & Thesis Debate Digest',
    },
  },
  {
    login: 'Life-Commons',
    displayName: 'Life Commons',
    website: 'https://bluelifecommons.org',
    brandId: 'starlight',
    governanceMode: 'active',
    missionAndScope:
      'Source-led public knowledge commons across ocean intelligence, paleobiology, personal health substrate, non-clinical observational mind modeling, and family history.',
    repos: [
      { name: 'blue-life-commons', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'dino-life-commons', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'ocean-intelligence', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'health-intelligence-system', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'mind-intelligence-systems', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'family-intelligence-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'family-history-atlas', visibility: 'public', primaryOwner: 'frankxai' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Life Commons Steward & Marine/Health Guardian',
      stewardAgents: ['starlight-embodiment', 'starlight-relational', 'starlight-marine-steward'],
      primaryMakerHarness: 'antigravity',
      primaryCheckerHarness: 'claude-code',
      asyncCloudFleet: 'opencode-tokenpass',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'blue-life-commons, dino-life-commons, health-intelligence-system, mind-intelligence-systems',
      commercialProductOrRetainer: 'Open public research & sovereign family/health templates (Model, Never Diagnose invariant)',
      communitySurface: 'bluelifecommons.org + Open Science & Citizen Conservation Contributors',
    },
  },
  {
    login: 'oci-ai-architects',
    displayName: 'OCI AI Architects',
    website: 'https://github.com/oci-ai-architects',
    brandId: 'ai-architect-studio',
    governanceMode: 'reshape-frozen',
    missionAndScope:
      'Community-built OCI AI Architect reference patterns, icon-native draw.io diagram generators, skill packs, and one-click OpenTofu/Terraform stacks.',
    repos: [
      { name: 'multi-cloud-ai-architect', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'claude-code-oci-ai-architect-skills', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'oci-ai-coe-starter-kit', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'oci-genai-guides', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'oci-ai-architect', visibility: 'private', primaryOwner: 'oci-ai-architects' },
    ],
    responsibleAgentTeam: {
      leadQueenPersona: 'Multi-Cloud & OCI Reference Architect',
      stewardAgents: ['oracle-ai-architect', 'oracle-solution-design', 'oci-drawio-icon-native'],
      primaryMakerHarness: 'claude-code',
      primaryCheckerHarness: 'codex-cloud',
      asyncCloudFleet: 'jules-conductor',
    },
    ossAndCommercialSplit: {
      openSourceWedge: 'multi-cloud-ai-architect, claude-code-oci-ai-architect-skills, oci-ai-coe-starter-kit',
      commercialProductOrRetainer: 'Community reference patterns (strict Oracle separation & confidentiality rules enforced)',
      communitySurface: 'github.com/oci-ai-architects',
    },
  },
];

const AGENT_HIERARCHY: AgentTierDefinition[] = [
  {
    tierOrder: 1,
    tierId: 'tier-01-front-door',
    tierName: '1. Front-Door Tier (3 Agents)',
    agentCount: 3,
    representativeAgents: ['starlight-concierge', 'starlight-envoy', 'starlight-voice-operator'],
    whenTheyLead:
      'Owns the surface between human intent and deep agents: Concierge (/welcome, /intake), Envoy (zero-terminal creator handoffs), and Voice Operator (cockpit-pace handoff packets).',
    preferredHarnesses: ['antigravity', 'claude-code'],
  },
  {
    tierOrder: 2,
    tierId: 'tier-02-excavation',
    tierName: '2. Excavation & Proving Ground Tier (2 Agents)',
    agentCount: 2,
    representativeAgents: ['starlight-genius', 'starlight-evaluator'],
    whenTheyLead:
      'Genius leads /discover-genius (scattered corpora -> Genius Profile + Freedom Path); Evaluator leads /starlight-eval, Proving Ground runs, and Model & Agent Arena scorecards.',
    preferredHarnesses: ['claude-code', 'codex-cloud', 'opencode-tokenpass'],
  },
  {
    tierOrder: 3,
    tierId: 'tier-03-leadership',
    tierName: '3. Sovereign Leadership Tier (3 Agents)',
    agentCount: 3,
    representativeAgents: ['starlight-orchestrator', 'starlight-prime', 'starlight-architect'],
    whenTheyLead:
      'Orchestrator conducts multi-step/parallel workflows and /yolo Hive loops; Prime chairs the Council and synthesizes conflicting perspectives; Architect designs planet-scale systems and APIs.',
    preferredHarnesses: ['antigravity', 'claude-code', 'codex-cloud'],
  },
  {
    tierOrder: 4,
    tierId: 'tier-04-specialist-social',
    tierName: '4. Specialist & 7-Seat Social Intelligence Tier (13 Agents)',
    agentCount: 13,
    representativeAgents: [
      'starlight-navigator',
      'starlight-sentinel',
      'starlight-weaver',
      'starlight-hermes',
      'starlight-steward',
      'starlight-sentinel-daemon',
      'social-strategist',
      'social-sentinel',
      'social-psychologist',
      'social-vibe-tracker',
      'social-fact-checker',
      'social-visual-director',
      'social-news-analyst',
    ],
    whenTheyLead:
      'Roadmaps, security/OWASP gating, creative synthesis, read-only provenance search (Hermes), background healing, and 7-seat social campaign engineering.',
    preferredHarnesses: ['claude-code', 'codex-cloud', 'grok-cli', 'antigravity'],
  },
  {
    tierOrder: 5,
    tierId: 'tier-05-foundation',
    tierName: '5. Foundation Memory Tier (1 Agent)',
    agentCount: 1,
    representativeAgents: ['starlight-sage'],
    whenTheyLead:
      'Institutional memory keeper and vault guardian across all 6 semantic vaults (Strategic, Technical, Creative, Operational, Wisdom, Horizon) + Bi-Temporal Fact Spine.',
    preferredHarnesses: ['rust-starlight-invariants', 'claude-code'],
  },
  {
    tierOrder: 6,
    tierId: 'tier-06-council-archetypes',
    tierName: '6. Council Archetype Tier (7 Agents)',
    agentCount: 7,
    representativeAgents: [
      'elder-father',
      'elder-mother',
      'council-sage',
      'builder-elder',
      'shadow-witness',
      'divine-neutral-witness',
      'future-self-at-90',
    ],
    whenTheyLead:
      'Artificial-wisdom review body (agents/council/*) convened on /council, /starlight-board, or /luminor-board for substrate-level or high/critical risk decisions.',
    preferredHarnesses: ['claude-code', 'antigravity'],
  },
  {
    tierOrder: 7,
    tierId: 'tier-07-executive',
    tierName: '7. Executive Decision-Rights Tier (7 Agents)',
    agentCount: 7,
    representativeAgents: ['exec-ceo', 'exec-caio', 'exec-cmo', 'exec-cfo', 'exec-cto', 'exec-coo', 'exec-chief-of-staff'],
    whenTheyLead:
      'Hold decision rights and metrics (P&L, runway, register boundaries, model routing, repo creation) as a counterweight to specialist sprawl. CFO fails closed on money.',
    preferredHarnesses: ['claude-code', 'codex-cloud'],
  },
  {
    tierOrder: 8,
    tierId: 'tier-08-universal-is',
    tierName: '8. Universal Intelligence Systems Tier (14 Agents)',
    agentCount: 14,
    representativeAgents: [
      'starlight-business',
      'starlight-visionary',
      'starlight-embodiment',
      'starlight-secondbrain',
      'starlight-relational',
      'self-is',
      'brand-is',
      'creator-is',
      'wealth-is',
      'code-is',
      'voice-video-is',
      'family-is',
      'spiritual-is',
      'health-is',
    ],
    whenTheyLead:
      'Maps to the 10 Universal Intelligence Systems in STACK.md (locked v8.0) + 9-Layer Intelligence Stack with isolated vault namespaces.',
    preferredHarnesses: ['claude-code', 'codex-cloud', 'antigravity', 'hermes-coe'],
  },
  {
    tierOrder: 9,
    tierId: 'tier-09-domain-substacks',
    tierName: '9. Domain Sub-Stack Verticals (96 Agents across 14 Verticals)',
    agentCount: 96,
    representativeAgents: [
      'People Intelligence (6) & Sound Intelligence (6) & Music IS (8)',
      'Energy Intelligence (7) & Crypto Intelligence (6) & Legal/Compliance (7)',
      'Space & Cosmos (7) & Marine/Oceanographic (7) & Longevity/Health (7)',
      'Infrastructure & Ops (7) & Partner/Framework Adapters (10: Hermes, Mastra, LangGraph, OpenAI SDK, Ollama)',
      'Research & Publications (7) & Asset/Production (7) & Content/Distribution (5)',
    ],
    whenTheyLead:
      'Modular vertical sub-systems (verticals/<slug>/) generalizable via /spawn-domain-stack without bloating the core substrate.',
    preferredHarnesses: ['ruflo-omo-swarm', 'opencode-tokenpass', 'jules-conductor', 'vercel-beta-rail'],
  },
  {
    tierOrder: 10,
    tierId: 'tier-10-sis-extractors',
    tierName: '10. SIS Corpus Extractor Tier (5 Agents)',
    agentCount: 5,
    representativeAgents: [
      'extractor-transcripts (t-)',
      'extractor-vault (v-)',
      'extractor-prompts (p-)',
      'extractor-repos (r-)',
      'extractor-external (e-)',
    ],
    whenTheyLead:
      'Dispatched during Phase 1 of /sis-forge to extract <=200 SIP-attested JSONL corpus atoms each from enumerable sources.',
    preferredHarnesses: ['opencode-tokenpass', 'jules-conductor'],
  },
];

const CANONICAL_TRUTHS: CanonicalTruthAndAntiDriftRule[] = [
  {
    ruleNumber: 1,
    id: 'truth-01-estate-ssot',
    title: 'Single Local Estate SSOT (C:/Users/frank/starlight/repos) & Quarantine of universe/',
    category: 'workspace-ssot',
    oldAgentFailureMode:
      'Agents previously invented top-level folders in C:/Users/frank/ (such as universe/ or duplicate arcanea-studio clones), causing split-brain lore and orphaned commits.',
    canonicalTruthAndPrinciple:
      'Every product repository lives exclusively under C:/Users/frank/starlight/repos/<repo>. C:/Users/frank/universe is permanently quarantined. Queen coordinates; child repos own product truth.',
    deterministicEnforcementGate:
      'starlight_workspace_bootstrap.py enforces a mandatory 4-fact git check (path, toplevel, origin, branch) before any write.',
    verifiedArtifact: 'C:/Users/frank/starlight/WORKSPACE_MAP.md',
  },
  {
    ruleNumber: 2,
    id: 'truth-02-phone-link-ban',
    title: 'Zero Root/Home Recursive Searches (Windows Phone Link Protection)',
    category: 'workspace-ssot',
    oldAgentFailureMode:
      'Broad grep/ripgrep scans from C:\\ or C:\\Users\\frank traversed Windows Phone Link virtual mounts and triggered mass file downloads from connected mobile devices.',
    canonicalTruthAndPrinciple:
      'All file and text searches must be strictly scoped to explicit child repository or worktree directories.',
    deterministicEnforcementGate:
      'Layer-0 Rust AST Command Gate + workspace bootstrap boundary rules block unscoped root searches.',
    verifiedArtifact: 'src/queen/harness-mesh.ts',
  },
  {
    ruleNumber: 3,
    id: 'truth-03-worktree-isolation',
    title: 'One Harness = One Isolated Git Worktree (Zero Working-Tree Collisions)',
    category: 'swarm-verification',
    oldAgentFailureMode:
      'Multiple harnesses (Claude, Codex, Grok, Antigravity) checked out competing branches inside the same primary working tree, clobbering uncommitted files.',
    canonicalTruthAndPrinciple:
      'Every parallel agent session operates in its own isolated git worktree under C:/Users/frank/starlight/worktrees/<harness>-<slice> on branch agent/<harness>/<scope>.',
    deterministicEnforcementGate:
      'Rust LeaseManager flock arbitration (crates/starlight-invariants/src/leases.rs) + EstateGtmRadar worktree tracker.',
    verifiedArtifact: 'src/queen/estate-gtm-radar.ts',
  },
  {
    ruleNumber: 4,
    id: 'truth-04-dual-remote-org-federation',
    title: 'Dual-Remote 10-Org Federation (origin = frankxai, org = <Org>) with Strict Visibility Parity',
    category: 'org-federation',
    oldAgentFailureMode:
      'Blindly calling POST /repos/frankxai/<repo>/transfer into a GitHub Free org broke 41 Vercel Pro webhook bindings and npm OIDC trusted publishing.',
    canonicalTruthAndPrinciple:
      'Keep origin pointed to frankxai/<repo> (preserving Vercel & npm OIDC) while pushing to org (<Org>/<repo>) with 66/66 SHA parity and strict private->private visibility parity.',
    deterministicEnforcementGate:
      'scripts/org-federation-audit.mjs --wire-local + validateVisibilityParity() + validateOrgBasePermission("none").',
    verifiedArtifact: 'scripts/org-federation-audit.mjs',
  },
  {
    ruleNumber: 5,
    id: 'truth-05-cross-family-maker-checker',
    title: 'Mandatory Cross-Family Maker ≠ Checker Verification (Anti-Echo-Chamber)',
    category: 'swarm-verification',
    oldAgentFailureMode:
      'Single-harness agents wrote code and graded their own work using the same LLM family, missing systematic architectural and edge-case bugs.',
    canonicalTruthAndPrinciple:
      'No consequential artifact ships without verification by a distinct model family (e.g., Antigravity/Gemini or Claude makes -> Codex/OpenAI or Claude checks).',
    deterministicEnforcementGate:
      'FrontierEvalEngine.routeTaskPareto() enforces maker.family !== checker.family + .github/workflows/starlight-ceo-gate.yml.',
    verifiedArtifact: 'src/queen/frontier-evals.ts',
  },
  {
    ruleNumber: 6,
    id: 'truth-06-rust-vmcp-rtk-headroom',
    title: 'Layer-0 Rust vMCP + RTK + Headroom Context Compression (96.9% Bloat Reduction)',
    category: 'context-memory',
    oldAgentFailureMode:
      'Loading 15+ unfiltered MCP schemas and raw CLI stdout logs consumed 60k+ tokens per turn, causing context degradation and high API spend.',
    canonicalTruthAndPrinciple:
      'Filter MCP tool schemas Just-In-Time by intent (vMCP -88%), fold CLI stdout in native Rust (RTK v0.50 -78.2%), and condense sliding windows via Headroom v0.20 (-64.5%).',
    deterministicEnforcementGate:
      'Compiled native Rust binary crates/starlight-invariants/target/debug/starlight.exe (vmcp & gate subcommands).',
    verifiedArtifact: 'crates/starlight-invariants/src/vmcp.rs',
  },
  {
    ruleNumber: 7,
    id: 'truth-07-bitemporal-fact-spine',
    title: 'Graphiti-Style Bi-Temporal Fact Spine & Metrics Truth Discipline',
    category: 'context-memory',
    oldAgentFailureMode:
      'Agents hardcoded fast-moving counts in prose or appended conflicting facts to vaults without invalidating superseded claims.',
    canonicalTruthAndPrinciple:
      'Every factual claim carries valid_from / superseded_at bi-temporal timestamps in TemporalFactSpine and reads metrics/current.json with "as of [date]" attribution.',
    deterministicEnforcementGate:
      'TemporalFactSpine.assertFact() auto-supersedes prior conflicting (vault, subject, predicate) tuples + v91 identity/decay symmetry tests.',
    verifiedArtifact: 'src/memory/temporal-spine.ts',
  },
  {
    ruleNumber: 8,
    id: 'truth-08-register-and-voice-boundaries',
    title: 'Strict Brand Register Boundaries & Sentence-Case Anti-Slop Gate',
    category: 'brand-gtm',
    oldAgentFailureMode:
      'Agents leaked Arcanea mythic vocabulary into Starlight/FrankX technical surfaces or used AI prestige slop ("not just X, but Y", Title Case badge spam).',
    canonicalTruthAndPrinciple:
      'Each brand operates in its locked register (FrankX = Professional Architect, Arcanea = Mythic Creative, Starlight = Curious/Technical/Playful Sovereign) with sentence-case UI labels.',
    deterministicEnforcementGate:
      'CREATOR.md + .starlight/voice/context.md + REGISTER-BOUNDARIES.md + Website Software Factory fail-closed gate.',
    verifiedArtifact: 'CREATOR.md',
  },
  {
    ruleNumber: 9,
    id: 'truth-09-gateway-dead-lock-recovery',
    title: 'Self-Healing Loopback Daemon & Dead-PID Lock Recovery',
    category: 'context-memory',
    oldAgentFailureMode:
      'Abrupt terminal exits left orphaned .lock files in .starlight/, blocking subsequent sessions from starting the SIS Memory Gateway.',
    canonicalTruthAndPrinciple:
      'Gateway daemons inspect lockfile PIDs on boot, automatically reclaim dead-PID or empty legacy locks, and verify Tarjan SCC wait-for graphs.',
    deterministicEnforcementGate:
      'src/gateway/daemon.ts dead-PID lock recovery + test/v90-gateway-http.test.ts.',
    verifiedArtifact: 'src/gateway/daemon.ts',
  },
  {
    ruleNumber: 10,
    id: 'truth-10-draft-pr-ci-cost-gate',
    title: 'Draft-First PR Protocol & Actions Cost Guardrails',
    category: 'ci-cost-safety',
    oldAgentFailureMode:
      'Pushing directly to main or opening ready-for-review PRs on every intermediate commit burned GitHub Actions minutes and triggered redundant Vercel builds.',
    canonicalTruthAndPrinciple:
      'All agent branches push to agent/<harness>/<scope> and open Draft PRs (--draft). Heavy CI runs only when local verification passes and the PR is marked ready.',
    deterministicEnforcementGate:
      '<Org>/.github/workflows/reusable-ci.yml draft gate + local pre-commit 36-suite symmetry runner.',
    verifiedArtifact: 'docs/architecture/github-org-federation-2026-10-17.md',
  },
  {
    ruleNumber: 11,
    id: 'truth-11-gtm-flywheel-bridge-r1',
    title: 'Closed-Loop 5-Stage GTM Flywheel (FrankX -> GenCreator -> Open-Core -> SaaS -> Estate)',
    category: 'brand-gtm',
    oldAgentFailureMode:
      'Shipping isolated articles or tools without wiring the referral bridge from frankx.ai (40k+ readers) into gencreator.ai, arcanea.ai, and starlightintelligence.org.',
    canonicalTruthAndPrinciple:
      'Every top-of-funnel benchmark and blueprint links directly into the GenCreator 6-Pillar CoE, open-core npm packages (@agentic-income/*, @reality-architect/cli), and paid SaaS/Estate tiers.',
    deterministicEnforcementGate:
      'EstateGtmRadar 5-stage flywheel monitor + tools/foundry/website-factory.mjs surface checks.',
    verifiedArtifact: 'src/queen/estate-gtm-radar.ts',
  },
  {
    ruleNumber: 12,
    id: 'truth-12-non-waivable-sovereignty',
    title: 'Freedom Engine Doctrine (TRUTH.md), Money Fails Closed, Model Never Diagnose & Canon Locks',
    category: 'ci-cost-safety',
    oldAgentFailureMode:
      'Pitching consulting/retainers/hourly services, referencing past Oracle employment as active, speculative autonomous spend, or clinical language in mind/health repos.',
    canonicalTruthAndPrinciple:
      '100% scalable software, digital products, and media IP (zero consulting/retainers; waitlist-first DemandSignal capture per TRUTH.md); money movement fails closed; mind/health repos model observations without clinical diagnosis; CANON_LOCKED.md is read-only.',
    deterministicEnforcementGate:
      'C:/Users/frank/starlight/TRUTH.md + Starlight Band-A non-waivable contract projected via scripts/agents-md-project.mjs.',
    verifiedArtifact: 'C:/Users/frank/starlight/TRUTH.md',
  },
];

const HORIZON_MILESTONES: HorizonMilestonePlan[] = [
  {
    horizonId: 'now-immediate',
    label: 'Now (Completed & Live in Queen v1.0)',
    primaryObjective:
      'Unify all 12 harnesses, Layer-0 compiled Rust binary, 8x8 Brand Switchboard, 10-Org GitHub Federation, Bi-Temporal Fact Spine, and Live :4329 Cockpit.',
    deliverables: [
      'Queen v1.0 Sovereign Engine (97.3/100 12-layer score vs Grok 72.8 & YC 83.0)',
      '10-Org Federation Audit & Local Dual-Remote Wiring (66/66 repos mapped)',
      'OpenCode R5 Free-Tier Arena Leaderboard (47/48 cells PASS across 8 free models)',
      'Graphiti-style Bi-Temporal Fact Spine (src/memory/temporal-spine.ts) + Gateway Lock Recovery',
      'Live 8-Tab Command Cockpit at http://127.0.0.1:4329 with SSE streaming',
    ],
    verificationCommand: 'npx tsx src/cli.ts queen codex',
    status: 'completed-live',
  },
  {
    horizonId: '2h-autonomous',
    label: '2-Hour Autonomous Horizon (Clean PR Wave & Funnel Bridge)',
    primaryObjective:
      'Promote clean production branches to Draft PRs and close P0 Risk R1 (FrankX -> GenCreator -> Arcanea funnel bridge).',
    deliverables: [
      'Open Draft PR for frankx.ai-vercel-website (model-arena-gemini-4-argon-20261014, 0 dirty)',
      'Open Draft PR for agentic-income-skills (@agentic-income/core, catalog, redirect, cli, 0 dirty)',
      'Commit & validate gencreator.ai federated-llm-hub-link slice via Website Software Factory',
      'Record canonical session handover in isolated agentic-ops-hub worktree',
    ],
    verificationCommand: 'npx tsx src/cli.ts queen estate',
    status: 'in-execution',
  },
  {
    horizonId: '12h-overnight',
    label: '12-Hour Overnight Horizon (Multi-Harness Swarm & Dreaming Consolidation)',
    primaryObjective:
      'Run zero-marginal-cost overnight benchmark, test backfill, and memory consolidation across all 10 GitHub Organizations.',
    deliverables: [
      'Nightly Dreaming memory consolidation + Bi-Temporal Fact Spine pruning across 6 vaults',
      'OpenCode Free + Jules Conductor async test backfill across public OSS org repos',
      'Automated 66/66 org mirror SHA parity verification & two-signal heartbeat emission',
    ],
    verificationCommand: 'node scripts/org-federation-audit.mjs',
    status: 'scheduled-ready',
  },
  {
    horizonId: '1w-sprint',
    label: '1-Week Sprint Horizon (Traffic, Digital Products & Open-Core npm Wave)',
    primaryObjective:
      'Turn 40k+ monthly FrankX readers into active ACOS/SIP open-core installers, SaaS subscribers, and AI Architect Academy cohort members.',
    deliverables: [
      'Publish @starlight-intelligence/sis, @agentic-income/cli, and @reality-architect/cli release wave',
      'Launch interactive Model Arena & Queen Sovereign live showcase on frankx.ai and starlightintelligence.org',
      'Ship Arcanea 10-Gate Luminor Studio & GenCreator 6-Pillar CoE onboarding flows',
    ],
    verificationCommand: 'node tools/foundry/website-factory.mjs status',
    status: 'scheduled-ready',
  },
  {
    horizonId: 'q4-2026-vision',
    label: 'Q4 2026 Sovereign Ecosystem Vision (Category-Defining Multi-Agent OS)',
    primaryObjective:
      'Operate the benchmark sovereign multi-agent ecosystem competing above top-quartile YC Oct 2026 startups across substrate, creator media, and enterprise AI departments.',
    deliverables: [
      '10 GitHub Organizations operating with autonomous per-org Steward Agent Teams and Maker≠Checker CI gates',
      'Compound recurring revenue across scalable SaaS realms, self-serve BYOK Blueprint packs, digital books, and DemandSignal waitlists (Zero Consulting/Retainers per TRUTH.md)',
      '100% verifiable SIP provenance across code, memory vaults, benchmarks, and visual media',
    ],
    verificationCommand: 'npx tsx src/cli.ts queen eval',
    status: 'scheduled-ready',
  },
];

export class SovereignMasterCodex {
  private readonly reposRoot: string;

  constructor(reposRoot = 'C:/Users/frank/starlight/repos') {
    this.reposRoot = reposRoot;
  }

  public getSnapshot(): SovereignMasterCodexSnapshot {
    let localEntries: string[] = [];
    try {
      if (fs.existsSync(this.reposRoot)) {
        localEntries = fs
          .readdirSync(this.reposRoot, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name.toLowerCase());
      }
    } catch {
      localEntries = [];
    }

    const localSet = new Set(localEntries);

    const organizations: GitHubOrgFederationEntry[] = ORG_DEFINITIONS.map((org) => {
      const repositories = org.repos.map((r) => ({
        name: r.name,
        visibility: r.visibility,
        primaryOwner: r.primaryOwner,
        localCheckoutPresent: localSet.has(r.name.toLowerCase()),
      }));
      const publicRepoCount = repositories.filter((r) => r.visibility === 'public').length;
      const privateRepoCount = repositories.filter((r) => r.visibility === 'private').length;
      return {
        login: org.login,
        displayName: org.displayName,
        website: org.website,
        brandId: org.brandId,
        governanceMode: org.governanceMode,
        missionAndScope: org.missionAndScope,
        publicRepoCount,
        privateRepoCount,
        totalRepoCount: repositories.length,
        repositories,
        responsibleAgentTeam: org.responsibleAgentTeam,
        ossAndCommercialSplit: org.ossAndCommercialSplit,
      };
    });

    const federatedRepositories = organizations.reduce((s, o) => s + o.totalRepoCount, 0);
    const publicOssRepositories = organizations.reduce((s, o) => s + o.publicRepoCount, 0);
    const privateSovereignRepositories = organizations.reduce((s, o) => s + o.privateRepoCount, 0);

    return {
      generatedAt: new Date().toISOString(),
      visionStatement:
        'A sovereign, multi-harness superintelligence ecosystem where 12 local and cloud agent runtimes, 151 specialized agents, 10 GitHub organizations, and 8 flagship brands compound knowledge, code, media, and commercial value on a single verifiable substrate.',
      missionStatement:
        'Build abundance and help builders create their own sovereign systems—guarded by deterministic Rust Layer-0 invariants, cross-family Maker ≠ Checker verification, and bi-temporal memory.',
      totals: {
        githubOrganizations: organizations.length,
        federatedRepositories,
        publicOssRepositories,
        privateSovereignRepositories,
        namedAgentsInRegistry: 151,
        autoActivatingSkills: 89,
        federatedHarnesses: 12,
        canonicalTruthsLocked: CANONICAL_TRUTHS.length,
      },
      organizations,
      agentHierarchy: AGENT_HIERARCHY,
      canonicalTruthsAndAntiDrift: CANONICAL_TRUTHS,
      horizonMilestones: HORIZON_MILESTONES,
    };
  }
}
