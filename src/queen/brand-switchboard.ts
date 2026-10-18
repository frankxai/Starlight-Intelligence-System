import * as fs from 'node:fs';
import * as path from 'node:path';

export type BrandId =
  | 'starlight'
  | 'arcanea'
  | 'agentic-income'
  | 'frankx'
  | 'gencreator'
  | 'reality-architect'
  | 'ai-architect-studio'
  | 'ai-architect-academy';

export type EngineeringMoatLayer =
  | 'cli'
  | 'sdks'
  | 'apis'
  | 'platforms'
  | 'apps'
  | 'ai'
  | 'agents'
  | 'subscriptions';

export interface MoatLayerSpec {
  layer: EngineeringMoatLayer;
  label: string;
  artifact: string;
  openCorevsProprietary: 'open-core' | 'sovereign-proprietary' | 'hybrid-attested';
  readinessPct: number;
}

export interface BrandPortfolioEntry {
  id: BrandId;
  name: string;
  tagline: string;
  domain: string;
  githubOrgAndRepo: string;
  aestheticSystem: {
    paletteName: string;
    voidBg: string;
    primaryAccent: string;
    secondaryAccent: string;
    typography: string;
  };
  voiceSignature: string;
  leadQueenPersona: string;
  preferredMakerHarness: string;
  preferredCheckerHarness: string;
  moatLayers: MoatLayerSpec[];
  grokSurfaceSync: {
    connectedToGrokFactory: boolean;
    grokSurfaceId: string | null;
    antigravityCompetitiveUpgrade: string;
  };
}

const BRAND_PORTFOLIO: BrandPortfolioEntry[] = [
  {
    id: 'starlight',
    name: 'Starlight Intelligence Systems',
    tagline: 'Sovereign cognitive substrate, 6-vault memory palace, and Queen multi-harness orchestration.',
    domain: 'starlightintelligence.org',
    githubOrgAndRepo: 'frankxai/Starlight-Intelligence-System',
    aestheticSystem: {
      paletteName: 'Starlight Substrate Dark',
      voidBg: '#0a0a0b',
      primaryAccent: '#10b981',
      secondaryAccent: '#06b6d4',
      typography: 'Space Grotesk + Inter + JetBrains Mono',
    },
    voiceSignature: 'Curious, confident, warm, candid, exact on permissions and costs.',
    leadQueenPersona: 'Starlight Queen Prime (Substrate Governor)',
    preferredMakerHarness: 'antigravity',
    preferredCheckerHarness: 'claude-code',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'starlight queen / vault / goal / council CLI', openCorevsProprietary: 'open-core', readinessPct: 98 },
      { layer: 'sdks', label: 'SDKs', artifact: '@starlight/sis-sdk + Rust starlight-invariants FFI', openCorevsProprietary: 'open-core', readinessPct: 94 },
      { layer: 'apis', label: 'APIs', artifact: 'Memory Gateway Loopback API + Queen SSE Telemetry API', openCorevsProprietary: 'hybrid-attested', readinessPct: 96 },
      { layer: 'platforms', label: 'Platforms', artifact: 'Starlight Estate OS + Multi-Harness Mesh', openCorevsProprietary: 'hybrid-attested', readinessPct: 95 },
      { layer: 'apps', label: 'Apps', artifact: 'Queen Sovereign Command Center + 3D Memory Palace', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
      { layer: 'ai', label: 'AI', artifact: 'RRF Hybrid Vault Recall + Dreaming Consolidation + Thompson Router', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 96 },
      { layer: 'agents', label: 'Agents', artifact: '151 Registered Council & Vertical Agents + Queen Swarm', openCorevsProprietary: 'hybrid-attested', readinessPct: 98 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'BYOK Open-Core + Sovereign Estate Commissioning & TokenPass Rail', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 91 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: true,
      grokSurfaceId: 'starlightintelligence.org',
      antigravityCompetitiveUpgrade: 'Replaces static markdown surface specs with live Rust Layer-0 AST/WFG/vMCP kernel telemetry and Pareto Thompson-sampling model routing.',
    },
  },
  {
    id: 'arcanea',
    name: 'Arcanea',
    tagline: 'Creative multiverse OS, 10-Gate progression academy, and Luminor multi-agent studio.',
    domain: 'arcanea.ai',
    githubOrgAndRepo: 'frankxai/arcanea-ai-app',
    aestheticSystem: {
      paletteName: 'Arcanean Cosmic Obsidian & Solar Gold',
      voidBg: '#09080f',
      primaryAccent: '#f59e0b',
      secondaryAccent: '#8b5cf6',
      typography: 'Cinzel / Space Grotesk + Plus Jakarta Sans + JetBrains Mono',
    },
    voiceSignature: 'Mythic precision, luminous craft, 10-Gate creative mastery (strictly canon-locked).',
    leadQueenPersona: 'Lumina & Aiyami (Crown Gate Synthesis)',
    preferredMakerHarness: 'claude-code',
    preferredCheckerHarness: 'antigravity',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'arcanea / pulse / canon-check / world-forge CLI', openCorevsProprietary: 'open-core', readinessPct: 95 },
      { layer: 'sdks', label: 'SDKs', artifact: '@arcanea/canon-engine + @arcanea/peak-performance', openCorevsProprietary: 'open-core', readinessPct: 92 },
      { layer: 'apis', label: 'APIs', artifact: 'Arcanea Lore Graph API + Character/Ship Forge Endpoints', openCorevsProprietary: 'hybrid-attested', readinessPct: 91 },
      { layer: 'platforms', label: 'Platforms', artifact: 'Arcanea Creative Multiverse & 10-Gate Progression Engine', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
      { layer: 'apps', label: 'Apps', artifact: 'Arcanea Studio, NFT Gallery Forge, & Vibe Gods Arena', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 93 },
      { layer: 'ai', label: 'AI', artifact: 'Canon-Locked Retrieval + NanoBanana/Veo/Suno Multimodal Pipelines', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 95 },
      { layer: 'agents', label: 'Agents', artifact: '10 Gate Guardians + Author Council + Lore Master Swarm', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 97 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'Apprentice-to-Luminor Creator Passes & Studio Credits', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 89 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: true,
      grokSurfaceId: 'arcanea.ai',
      antigravityCompetitiveUpgrade: 'Enforces CANON_LOCKED.md invariants pre-commit and wires Santa Loop (Fire Gate Maker -> Crown Gate Checker) directly into the Queen session.',
    },
  },
  {
    id: 'agentic-income',
    name: 'Agentic Income (IIS)',
    tagline: 'Quantitative thesis engines, autonomous revenue loops, and fail-closed DPI capital intelligence.',
    domain: 'agenticincome.ai',
    githubOrgAndRepo: 'frankxai/investor-intelligence-system',
    aestheticSystem: {
      paletteName: 'Institutional Emerald & Precision Slate',
      voidBg: '#070b0a',
      primaryAccent: '#10b981',
      secondaryAccent: '#38bdf8',
      typography: 'Inter Tight + JetBrains MonoTabular',
    },
    voiceSignature: 'Evidence-backed, quantitative, risk-disciplined, zero hype.',
    leadQueenPersona: 'Queen Wealth DPI & Impact Diligence Controller',
    preferredMakerHarness: 'codex-cloud',
    preferredCheckerHarness: 'claude-code',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'wealth-dpi / portfolio-snapshot / thesis-debate CLI', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 93 },
      { layer: 'sdks', label: 'SDKs', artifact: '@starlight/wealth-dpi-schemas + Onchain/Quant Connectors', openCorevsProprietary: 'hybrid-attested', readinessPct: 90 },
      { layer: 'apis', label: 'APIs', artifact: 'Read-Only Portfolio Telemetry & Thesis Scoring API', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 91 },
      { layer: 'platforms', label: 'Platforms', artifact: 'Investor Intelligence System (IIS) + Template Monetization Hub', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 92 },
      { layer: 'apps', label: 'Apps', artifact: 'Weekly Strategy Cockpit & Affiliate/Product Revenue Radar', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 89 },
      { layer: 'ai', label: 'AI', artifact: 'Adversarial Bull/Bear Thesis Debate & Retrospective Calibration', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
      { layer: 'agents', label: 'Agents', artifact: 'Quant Researcher, Risk Sentinel, & Monetization Architect', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 93 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'Pro Research Briefings, Blueprints, & Automated Signal Tiers', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 88 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: false,
      grokSurfaceId: null,
      antigravityCompetitiveUpgrade: 'Adds non-waivable Money-Fails-Closed hardware/AST guardrails so autonomous research swarms can never trigger unapproved capital movement.',
    },
  },
  {
    id: 'frankx',
    name: 'FrankX.AI',
    tagline: 'Flagship AI Architect command hub, ACOS publishing factory, and enterprise systems showcase.',
    domain: 'frankx.ai',
    githubOrgAndRepo: 'frankxai/frankx.ai-vercel-website',
    aestheticSystem: {
      paletteName: 'Glassmorphic Aurora & Deep Space',
      voidBg: '#0a0a0f',
      primaryAccent: '#06b6d4',
      secondaryAccent: '#10b981',
      typography: 'Space Grotesk + Inter + JetBrains Mono',
    },
    voiceSignature: 'Direct, technical, warm, builder-to-builder pattern recognition.',
    leadQueenPersona: 'FrankX Council Prime & Creation Engine',
    preferredMakerHarness: 'claude-code',
    preferredCheckerHarness: 'codex-cloud',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'acos / factory / article-creator / vis-audit CLI', openCorevsProprietary: 'open-core', readinessPct: 97 },
      { layer: 'sdks', label: 'SDKs', artifact: 'ACOS Plugin SDK + Visual Intelligence System (VIS) Registry', openCorevsProprietary: 'open-core', readinessPct: 95 },
      { layer: 'apis', label: 'APIs', artifact: 'Prompt Library API, Newsletter Stream API, & Analytics Feed', openCorevsProprietary: 'hybrid-attested', readinessPct: 96 },
      { layer: 'platforms', label: 'Platforms', artifact: 'FrankX Next.js 16 Production Hub on Vercel', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 98 },
      { layer: 'apps', label: 'Apps', artifact: 'Interactive AI Architect Hub, Books Shelf, & Music Vibe Lab', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 96 },
      { layer: 'ai', label: 'AI', artifact: 'Refresh-Queue Decay Detector + InfoGenius Brand Visual Pipeline', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 95 },
      { layer: 'agents', label: 'Agents', artifact: 'ACOS Content Factory Swarm + SEO & Canary Verifiers', openCorevsProprietary: 'hybrid-attested', readinessPct: 97 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'AI Architect Newsletter Streams + Digital Blueprints & Templates', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: true,
      grokSurfaceId: 'frankx.ai',
      antigravityCompetitiveUpgrade: 'Integrates live Metrics Truth validation (metrics/current.json) and URL preservation locks ("AI Architect" never renamed).',
    },
  },
  {
    id: 'gencreator',
    name: 'GenCreator OS',
    tagline: 'Agent-native creator operating system for multimodal media, music, code, and autonomous distribution.',
    domain: 'gencreator.ai',
    githubOrgAndRepo: 'frankxai/agentic-creator-os',
    aestheticSystem: {
      paletteName: 'Kinetic Neon Studio Dark',
      voidBg: '#0b0b10',
      primaryAccent: '#ec4899',
      secondaryAccent: '#06b6d4',
      typography: 'Cabinet Grotesk / Space Grotesk + Inter + JetBrains Mono',
    },
    voiceSignature: 'High-velocity, craft-obsessed, anti-slop, empowering solo builders to operate like studios.',
    leadQueenPersona: 'Hermes 6-Pillar CoE & Studio Director',
    preferredMakerHarness: 'opencode-tokenpass',
    preferredCheckerHarness: 'antigravity',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'studio / create-music / video-produce / harvest CLI', openCorevsProprietary: 'open-core', readinessPct: 95 },
      { layer: 'sdks', label: 'SDKs', artifact: '@gencreator/workflow-tier + Hyperframes & Remotion Adapters', openCorevsProprietary: 'open-core', readinessPct: 92 },
      { layer: 'apis', label: 'APIs', artifact: 'Multimodal Asset Forge API (NanoBanana + Veo + Suno + ElevenLabs)', openCorevsProprietary: 'hybrid-attested', readinessPct: 93 },
      { layer: 'platforms', label: 'Platforms', artifact: 'Agentic Creator OS (ACOS) + 6-Pillar CoE Framework', openCorevsProprietary: 'open-core', readinessPct: 96 },
      { layer: 'apps', label: 'Apps', artifact: 'Creator Studio Dashboard, Suno Catalog Triage, & Clip Packager', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 91 },
      { layer: 'ai', label: 'AI', artifact: 'Voice-Calibrated Prose & Audio-Reactive Motion Synthesis', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
      { layer: 'agents', label: 'Agents', artifact: 'Social Strategist, Vibe Tracker, Fact Checker, & Visual Director', openCorevsProprietary: 'hybrid-attested', readinessPct: 95 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'GenCreator Pro OS Packs, Skill Libraries, & Studio Automation', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 90 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: true,
      grokSurfaceId: 'gencreator.ai',
      antigravityCompetitiveUpgrade: 'Enforces strict Higgsfield ban and routes all visual/video generation through native Antigravity, NanoBanana, and Veo pipelines with Visual QA Gate scoring.',
    },
  },
  {
    id: 'reality-architect',
    name: 'Reality Architect',
    tagline: 'Conscious systems design, genius excavation, and high-agency personal transformation architecture.',
    domain: 'realityarchitect.ai',
    githubOrgAndRepo: 'frankxai/Starlight-Intelligence-System',
    aestheticSystem: {
      paletteName: 'Sacred Geometry Obsidian & Luminous Cyan',
      voidBg: '#08090c',
      primaryAccent: '#06b6d4',
      secondaryAccent: '#f59e0b',
      typography: 'Instrument Serif / Space Grotesk + Inter + JetBrains Mono',
    },
    voiceSignature: 'Contemplative, lucid, grounded in observation (models patterns, never diagnoses).',
    leadQueenPersona: 'Starlight Genius & Chronicle Palace Architect',
    preferredMakerHarness: 'claude-code',
    preferredCheckerHarness: 'antigravity',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'discover-genius / chronicle / palace / sunday / bless CLI', openCorevsProprietary: 'hybrid-attested', readinessPct: 94 },
      { layer: 'sdks', label: 'SDKs', artifact: '@starlight/genius-excavation + Embodied Energy Schemas', openCorevsProprietary: 'hybrid-attested', readinessPct: 89 },
      { layer: 'apis', label: 'APIs', artifact: 'Private Memory Mount API (Zero-Leakage Veil Sanitized)', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 93 },
      { layer: 'platforms', label: 'Platforms', artifact: 'Self / Family / Health / Wisdom Intelligence Systems', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 92 },
      { layer: 'apps', label: 'Apps', artifact: 'Genius Profile Excavator, Freedom Path Planner, & Weekly Palace', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 90 },
      { layer: 'ai', label: 'AI', artifact: 'Long-Horizon Horizon Vault Synthesis & Contradiction Mirror', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 93 },
      { layer: 'agents', label: 'Agents', artifact: 'Genius, Sage, Embodiment, & Relational Architects', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 95 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'Reality Architect Mastery Cohorts & Sovereign Life OS', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 87 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: false,
      grokSurfaceId: null,
      antigravityCompetitiveUpgrade: 'Enforces the non-waivable "Model, Never Diagnose" invariant and local-first PII/secret scrubbing via The Veil gateway.',
    },
  },
  {
    id: 'ai-architect-studio',
    name: 'AI Architect Studio',
    tagline: 'Enterprise sovereign estate commissioning, custom agent armies, and OCI/cloud solution design.',
    domain: 'studio.frankx.ai',
    githubOrgAndRepo: 'frankxai/starlight-design-intelligence',
    aestheticSystem: {
      paletteName: 'Architectural Carbon & Precision Emerald',
      voidBg: '#090a0c',
      primaryAccent: '#10b981',
      secondaryAccent: '#6366f1',
      typography: 'Space Grotesk + Inter + JetBrains Mono',
    },
    voiceSignature: 'Executive clarity, systems rigor, zero enterprise fluff, verifiable SLAs.',
    leadQueenPersona: 'Starlight Architect & Estate Steward',
    preferredMakerHarness: 'claude-code',
    preferredCheckerHarness: 'codex-cloud',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'estate-blueprint / estate-steward / spawn-domain-stack CLI', openCorevsProprietary: 'hybrid-attested', readinessPct: 95 },
      { layer: 'sdks', label: 'SDKs', artifact: '@starlight/estate-os-template + OCI Draw.io Icon-Native Kit', openCorevsProprietary: 'hybrid-attested', readinessPct: 93 },
      { layer: 'apis', label: 'APIs', artifact: 'Alliance Forge Protocol API & Signed SIP Receipt Verifier', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
      { layer: 'platforms', label: 'Platforms', artifact: '4-Layer Sovereign Estate Commissioning Mesh', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 95 },
      { layer: 'apps', label: 'Apps', artifact: 'Architecture Diagram Generator, SDD Composer, & Fleet Auditor', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 92 },
      { layer: 'ai', label: 'AI', artifact: 'Multi-Cloud Topology Synthesis & Adversarial Security Sentinel', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 94 },
      { layer: 'agents', label: 'Agents', artifact: 'Architect, Sentinel, Steward, & Domain Vertical Queens', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 96 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'Self-Serve Estate OS Packs, BYOK Architecture Blueprints, & Waitlist Demand Signals', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 95 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: true,
      grokSurfaceId: 'aiarchitect.studio',
      antigravityCompetitiveUpgrade: 'Couples Grok Website Software Factory templates with Board-gated SIP attestation and 4-layer Estate Army commissioning blueprints.',
    },
  },
  {
    id: 'ai-architect-academy',
    name: 'AI Architect Academy',
    tagline: 'Interactive builder curriculum, live sandboxed labs, and multi-agent systems certification.',
    domain: 'academy.frankx.ai',
    githubOrgAndRepo: 'frankxai/claude-skills-library',
    aestheticSystem: {
      paletteName: 'Deep Laboratory Slate & Electric Cyan',
      voidBg: '#0a0c10',
      primaryAccent: '#06b6d4',
      secondaryAccent: '#10b981',
      typography: 'Space Grotesk + Inter + JetBrains Mono',
    },
    voiceSignature: 'Feynman-clear explanations, show-dont-tell labs, build-your-own-system ethos.',
    leadQueenPersona: 'Starlight Concierge & Learning Architect',
    preferredMakerHarness: 'antigravity',
    preferredCheckerHarness: 'codex-cloud',
    moatLayers: [
      { layer: 'cli', label: 'CLI', artifact: 'learn-starlight-mission / workshop-new / skill-comply CLI', openCorevsProprietary: 'open-core', readinessPct: 94 },
      { layer: 'sdks', label: 'SDKs', artifact: '190+ Portable Agent Skills & Curriculum Lab Starters', openCorevsProprietary: 'open-core', readinessPct: 96 },
      { layer: 'apis', label: 'APIs', artifact: 'Empirical Sandbox (The Proving Ground) Lab Verification API', openCorevsProprietary: 'hybrid-attested', readinessPct: 91 },
      { layer: 'platforms', label: 'Platforms', artifact: 'Interactive Workshop & Cohort Execution Platform', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 92 },
      { layer: 'apps', label: 'Apps', artifact: 'Skill Tree Explorer, Prompt Optimizer Lab, & Eval Leaderboard', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 91 },
      { layer: 'ai', label: 'AI', artifact: 'Automated Code Lab Grader & Personalized Skill-Gap Navigator', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 92 },
      { layer: 'agents', label: 'Agents', artifact: 'Learning Architect, Feynman Tutor, & Lab Verifier Agents', openCorevsProprietary: 'hybrid-attested', readinessPct: 94 },
      { layer: 'subscriptions', label: 'Subscriptions', artifact: 'Academy All-Access Memberships, Team Workshops, & Certifications', openCorevsProprietary: 'sovereign-proprietary', readinessPct: 90 },
    ],
    grokSurfaceSync: {
      connectedToGrokFactory: true,
      grokSurfaceId: 'academy.frankx.ai',
      antigravityCompetitiveUpgrade: 'Connects curriculum labs directly to the Empirical Sandbox (The Proving Ground) so every code block is regression-tested.',
    },
  },
];

export class BrandSwitchboard {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  public listBrands(): BrandPortfolioEntry[] {
    const grokSurfacesPath = path.join(
      this.workspaceRoot,
      'foundry',
      'factories',
      'website-surfaces.json'
    );
    const hasGrokSurfacesFile = fs.existsSync(grokSurfacesPath);

    return BRAND_PORTFOLIO.map((brand) => ({
      ...brand,
      grokSurfaceSync: {
        ...brand.grokSurfaceSync,
        connectedToGrokFactory:
          brand.grokSurfaceSync.connectedToGrokFactory || hasGrokSurfacesFile,
      },
    }));
  }

  public getBrand(idOrKeyword: string): BrandPortfolioEntry {
    const clean = idOrKeyword.toLowerCase().trim();
    const match = BRAND_PORTFOLIO.find(
      (b) =>
        b.id === clean ||
        b.name.toLowerCase().includes(clean) ||
        b.domain.toLowerCase().includes(clean)
    );
    return match ?? BRAND_PORTFOLIO[0];
  }

  public detectBrandFromPrompt(prompt: string): BrandPortfolioEntry {
    const text = prompt.toLowerCase();
    if (text.includes('arcanea') || text.includes('luminor') || text.includes('10-gate') || text.includes('canon')) {
      return this.getBrand('arcanea');
    }
    if (text.includes('income') || text.includes('wealth') || text.includes('dpi') || text.includes('thesis') || text.includes('quant')) {
      return this.getBrand('agentic-income');
    }
    if (text.includes('gencreator') || text.includes('suno') || text.includes('music') || text.includes('creator os')) {
      return this.getBrand('gencreator');
    }
    if (text.includes('reality architect') || text.includes('genius') || text.includes('chronicle') || text.includes('embodiment')) {
      return this.getBrand('reality-architect');
    }
    if (text.includes('academy') || text.includes('workshop') || text.includes('curriculum') || text.includes('cohort')) {
      return this.getBrand('ai-architect-academy');
    }
    if (text.includes('studio') || text.includes('commissioning') || text.includes('oci') || text.includes('estate os')) {
      return this.getBrand('ai-architect-studio');
    }
    if (text.includes('frankx') || text.includes('newsletter') || text.includes('blog')) {
      return this.getBrand('frankx');
    }
    return this.getBrand('starlight');
  }

  public getMoatMatrixSummary(): {
    totalBrands: number;
    totalMoatCells: number;
    averageReadinessPct: number;
    byLayer: Record<EngineeringMoatLayer, number>;
  } {
    const byLayer: Record<EngineeringMoatLayer, number> = {
      cli: 0,
      sdks: 0,
      apis: 0,
      platforms: 0,
      apps: 0,
      ai: 0,
      agents: 0,
      subscriptions: 0,
    };

    let sum = 0;
    let count = 0;
    for (const brand of BRAND_PORTFOLIO) {
      for (const cell of brand.moatLayers) {
        byLayer[cell.layer] += cell.readinessPct;
        sum += cell.readinessPct;
        count += 1;
      }
    }

    for (const k of Object.keys(byLayer) as EngineeringMoatLayer[]) {
      byLayer[k] = Number((byLayer[k] / BRAND_PORTFOLIO.length).toFixed(1));
    }

    return {
      totalBrands: BRAND_PORTFOLIO.length,
      totalMoatCells: count,
      averageReadinessPct: Number((sum / Math.max(1, count)).toFixed(1)),
      byLayer,
    };
  }
}
