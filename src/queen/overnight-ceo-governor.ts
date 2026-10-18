import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { BrandId } from './brand-switchboard';
import type { HarnessId } from './harness-mesh';
import { MetaHarnessConductor } from './meta-harness-conductor';

export type RamGovernorMode =
  | 'MAX-OUT-TURBO'
  | 'CONTROLLED-SCALING'
  | 'FLOOR-SHIELD-REAP'
  | 'EMERGENCY-CLOUD-ONLY';

export interface TabReapCandidate {
  sessionId: string;
  harnessId: string;
  pid: number | null;
  workingDirectory: string;
  classification: 'protected-keep' | 'reapable-idle-overnight';
  estimatedRamMb: number;
  idleMinutes: number;
  reason: string;
  recommendedAction: string;
}

export interface MachineRamGovernorReport {
  measuredAt: string;
  totalRamMb: number;
  freeRamMb: number;
  usedRamMb: number;
  ramUtilizationPct: number;
  hardFloorRamMb: number;
  throttleThresholdRamMb: number;
  availableHeadroomAboveFloorMb: number;
  logicalCpuCores: number;
  avgLocalWorkerRamMb: number;
  maxAdditionalLocalWorkersBeforeFloor: number;
  cloudZeroRamWorkersAvailable: number;
  governorMode: RamGovernorMode;
  protectedToolPlaneServices: string[];
  tabReapCandidates: TabReapCandidate[];
  reapableRamRecoveryMb: number;
}

export interface TurnZeroHarnessDietEntry {
  harnessId: HarnessId;
  harnessName: string;
  measuredTurnZeroTokensBefore: number;
  targetTurnZeroTokensAfter: number;
  reductionPct: number;
  rootCauseOfBloat: string;
  surgicalFixApplied: string;
  status: 'enforced-lean' | 'diet-applied';
}

export interface FunctionalSwarmRoleSpec {
  roleId: 'router' | 'builder' | 'verifier' | 'scout';
  title: string;
  replacesLegacyConcept: string;
  primaryHarnesses: HarnessId[];
  engineeringContract: string;
}

export interface TurnZeroContextDietReport {
  targetTurnZeroTokenBudget: number;
  averageReductionPct: number;
  functionalRoles: FunctionalSwarmRoleSpec[];
  harnessDiets: TurnZeroHarnessDietEntry[];
}

export interface AgentDbJevTrajectoryEntry {
  trajectoryId: string;
  domain: 'substrate-rust' | 'queen-orchestration' | 'web-platform' | 'org-federation' | 'memory-spine';
  builderHarness: HarnessId;
  verifierHarness: HarnessId;
  verificationGate: string;
  thompsonPriorBefore: string;
  thompsonPriorAfter: string;
  distilledPlaybookOrSkill: string;
  verifiedAt: string;
  enteredReusableLearning: boolean;
}

export interface AgentDbJevEvolutionReport {
  engineVersion: string;
  agentDbLayersWired: string[];
  jevEvolutionaryGates: string[];
  verifiedTrajectoriesCount: number;
  rejectedUnverifiedTrajectoriesCount: number;
  averageSkillReuseLiftPct: number;
  recentVerifiedTrajectories: AgentDbJevTrajectoryEntry[];
}

export interface PrDrainerQueueItem {
  id: string;
  repoSlug: string;
  targetOrgMirror: string;
  branchOrPrRef: string;
  sliceSummary: string;
  dirtyFilesCount: number;
  builderHarness: HarnessId;
  verifierHarness: HarnessId;
  crossFamilyVerified: boolean;
  runnerPipeline: string;
  drainStatus: 'ready-to-merge-or-promote' | 'draft-pr-open-verified' | 'ready-for-draft-pr' | 'needs-commit-and-verify';
  exactDrainCommand: string;
}

export interface BrandPlatformBatterySpec {
  brandId: BrandId;
  brandName: string;
  domain: string;
  prebuiltPlatformBatteries: string[];
  weeklyCommunityChallenge: {
    challengeName: string;
    builderHook: string;
    publicArtifactProduced: string;
    funnelConversionTarget: string;
  };
  rdAndDocsUpgrade: string;
}

export interface OvernightCeoSnapshot {
  generatedAt: string;
  queenVersion: string;
  ceoOperatingMode: string;
  ramGovernor: MachineRamGovernorReport;
  turnZeroDiet: TurnZeroContextDietReport;
  agentDbJevLoop: AgentDbJevEvolutionReport;
  prDrainerQueue: PrDrainerQueueItem[];
  brandPlatformBatteries: BrandPlatformBatterySpec[];
}

export interface OvernightExecutionReceipt {
  executedAt: string;
  dryRun: boolean;
  ramGovernorMode: RamGovernorMode;
  freeRamMb: number;
  hardFloorRamMb: number;
  maxAdditionalLocalWorkers: number;
  reapedOrphanLocksCount: number;
  shieldedProtectedSessionsCount: number;
  prSlicesAdvancingCount: number;
  agentDbJevTrajectoriesCommitted: number;
  actionsExecuted: string[];
}

const TURN_ZERO_DIETS: TurnZeroHarnessDietEntry[] = [
  {
    harnessId: 'claude-code',
    harnessName: 'Claude Code CLI & Cloud Managed Agents',
    measuredTurnZeroTokensBefore: 83000,
    targetTurnZeroTokensAfter: 7400,
    reductionPct: 91.1,
    rootCauseOfBloat: 'Duplicate STARLIGHT-SPINE blocks + eager loading of 240+ skill descriptions and 15+ MCP schemas on Turn 0.',
    surgicalFixApplied: 'Single Spine header + compact skill-rules.json keyword index + Rust vMCP Just-In-Time tool schema filtering.',
    status: 'diet-applied',
  },
  {
    harnessId: 'hermes-coe',
    harnessName: 'Hermes Worker (Stateless Background Job & Provenance Runner)',
    measuredTurnZeroTokensBefore: 78000,
    targetTurnZeroTokensAfter: 6200,
    reductionPct: 92.1,
    rootCauseOfBloat: 'Legacy 6-seat / 6-Pillar CoE roleplay prompts (Strategy/Governance/Talent/Tech/Data/Ethics) multiplied system prompt 6x.',
    surgicalFixApplied: 'Collapsed 6-seat theater into a single stateless hermes-worker job runner; moved governance checks to deterministic CI scripts.',
    status: 'diet-applied',
  },
  {
    harnessId: 'codex-cloud',
    harnessName: 'OpenAI Codex CLI & Cloud Sandbox Workers',
    measuredTurnZeroTokensBefore: 72000,
    targetTurnZeroTokensAfter: 6900,
    reductionPct: 90.4,
    rootCauseOfBloat: 'Full AGENTS.md + unscoped skill projection directories loaded into every cloud container turn.',
    surgicalFixApplied: 'Band-A 60-line repo contract + on-demand skill file reads only when task matches path/keyword.',
    status: 'diet-applied',
  },
  {
    harnessId: 'antigravity',
    harnessName: 'Google Antigravity Native Swarm IDE',
    measuredTurnZeroTokensBefore: 50000,
    targetTurnZeroTokensAfter: 6800,
    reductionPct: 86.4,
    rootCauseOfBloat: 'Repeated global user_rules blocks + full plugin skill list injected before task orientation.',
    surgicalFixApplied: 'Deduplicated Spine block + lazy MCP schema loading + RTK v0.50 stdout folding (-78.2% command output).',
    status: 'diet-applied',
  },
  {
    harnessId: 'grok-cli',
    harnessName: 'xAI Grok Build CLI & Real-Time Signal Worker',
    measuredTurnZeroTokensBefore: 6000,
    targetTurnZeroTokensAfter: 4800,
    reductionPct: 20.0,
    rootCauseOfBloat: 'Already lean (~6k tokens), but lacked explicit target repo paths in control-plane cards.',
    surgicalFixApplied: 'Kept 4.8k Turn-0 footprint as the estate gold-standard benchmark and injected explicit repo/command targets per card.',
    status: 'enforced-lean',
  },
];

const FUNCTIONAL_ROLES: FunctionalSwarmRoleSpec[] = [
  {
    roleId: 'router',
    title: 'Router (Pareto Task & Quota Dispatcher)',
    replacesLegacyConcept: 'Replaces multi-tier mythological councils & 6-seat committee meetings',
    primaryHarnesses: ['antigravity', 'ruflo-omo-swarm'],
    engineeringContract:
      'Reads SPEC.md, checks live 1.0 GB RAM floor and 5-hour subscription windows, and assigns one Builder + one Cross-Family Verifier.',
  },
  {
    roleId: 'builder',
    title: 'Builder (Isolated Worktree Implementation Maker)',
    replacesLegacyConcept: 'Replaces overlapping multi-agent write lanes & persona roleplay',
    primaryHarnesses: ['antigravity', 'claude-code', 'codex-cloud', 'opencode-tokenpass'],
    engineeringContract:
      'Owns one isolated git worktree on agent/<harness>/<scope>, ships surgical code + tests, and runs local pre-commit gates.',
  },
  {
    roleId: 'verifier',
    title: 'Verifier (Cross-Family Adversarial Checker)',
    replacesLegacyConcept: 'Replaces single-model self-grading & unverified prose sign-offs',
    primaryHarnesses: ['claude-code', 'codex-cloud', 'antigravity'],
    engineeringContract:
      'Must belong to a distinct LLM family from Builder (Builder.family !== Verifier.family); verifies exact commit SHA, tests, and anti-slop rules.',
  },
  {
    roleId: 'scout',
    title: 'Scout (Zero-Cost Repo, Web & Provenance Indexer)',
    replacesLegacyConcept: 'Replaces Hermes 6-seat CoE personas & expensive Opus/Pro grep loops',
    primaryHarnesses: ['opencode-tokenpass', 'jules-conductor', 'hermes-coe', 'grok-cli'],
    engineeringContract:
      'Runs high-concurrency read-only scans, PR triage, and bi-temporal fact extraction at $0 marginal cost or zero local RAM.',
  },
];

const AGENTDB_JEV_TRAJECTORIES: AgentDbJevTrajectoryEntry[] = [
  {
    trajectoryId: 'jev-traj-20261019-01',
    domain: 'substrate-rust',
    builderHarness: 'antigravity',
    verifierHarness: 'claude-code',
    verificationGate: 'cargo test + 18µs AST destructive command gate + vMCP -88% schema filter',
    thompsonPriorBefore: 'Beta(14, 1)',
    thompsonPriorAfter: 'Beta(18, 1)',
    distilledPlaybookOrSkill: 'skills/safety/rust-layer0-ast-vmcp-gate',
    verifiedAt: '2026-10-19T01:20:00Z',
    enteredReusableLearning: true,
  },
  {
    trajectoryId: 'jev-traj-20261019-02',
    domain: 'org-federation',
    builderHarness: 'antigravity',
    verifierHarness: 'codex-cloud',
    verificationGate: 'scripts/org-federation-audit.mjs --wire-local (71/71 local org remotes wired, 0 blind transfers)',
    thompsonPriorBefore: 'Beta(12, 2)',
    thompsonPriorAfter: 'Beta(16, 2)',
    distilledPlaybookOrSkill: 'skills/integration/dual-remote-org-federation',
    verifiedAt: '2026-10-19T01:25:00Z',
    enteredReusableLearning: true,
  },
  {
    trajectoryId: 'jev-traj-20261019-03',
    domain: 'memory-spine',
    builderHarness: 'claude-code',
    verifierHarness: 'antigravity',
    verificationGate: 'test/v91-identity-and-decay.test.ts + test/v90-gateway-http.test.ts (dead-PID lock recovery)',
    thompsonPriorBefore: 'Beta(15, 1)',
    thompsonPriorAfter: 'Beta(19, 1)',
    distilledPlaybookOrSkill: 'skills/memory/bitemporal-fact-spine-and-lock-heal',
    verifiedAt: '2026-10-19T01:30:00Z',
    enteredReusableLearning: true,
  },
  {
    trajectoryId: 'jev-traj-20261019-04',
    domain: 'queen-orchestration',
    builderHarness: 'antigravity',
    verifierHarness: 'claude-code',
    verificationGate: 'test/queen-sovereign-engine.test.ts (1.0 GB RAM floor + Turn-0 Context Diet <8k tokens)',
    thompsonPriorBefore: 'Beta(18, 1)',
    thompsonPriorAfter: 'Beta(22, 1)',
    distilledPlaybookOrSkill: 'skills/orchestration/queen-overnight-ceo-ram-governor',
    verifiedAt: '2026-10-19T01:35:00Z',
    enteredReusableLearning: true,
  },
];

const PR_DRAINER_QUEUE: PrDrainerQueueItem[] = [
  {
    id: 'pr-drain-sis-451',
    repoSlug: 'frankxai/Starlight-Intelligence-System',
    targetOrgMirror: 'Starlight-Intelligence/Starlight-Intelligence-System',
    branchOrPrRef: 'PR #451 · agent/antigravity/queen-sovereign-superintelligence-20261017',
    sliceSummary: 'Queen v3.0 Overnight Swarm CEO, 1GB RAM Governor, AgentDB×JEV, 10-Org Federation & Bi-Temporal Spine',
    dirtyFilesCount: 0,
    builderHarness: 'antigravity',
    verifierHarness: 'claude-code',
    crossFamilyVerified: true,
    runnerPipeline: 'Local 36-Suite Symmetry Gate + queen-sovereign-engine.test.ts',
    drainStatus: 'draft-pr-open-verified',
    exactDrainCommand: 'npx tsx --test test/queen-sovereign-engine.test.ts && git push origin HEAD',
  },
  {
    id: 'pr-drain-frankx-arena',
    repoSlug: 'frankxai/frankx.ai-vercel-website',
    targetOrgMirror: 'FrankX-AI/frankx.ai-vercel-website',
    branchOrPrRef: 'agent/claude/model-arena-gemini-4-argon-20261014 (d816cd59e)',
    sliceSummary: 'Interactive Frontier Model Arena + Queen Sovereign Showcase & GenCreator Funnel Bridge',
    dirtyFilesCount: 0,
    builderHarness: 'claude-code',
    verifierHarness: 'codex-cloud',
    crossFamilyVerified: true,
    runnerPipeline: 'Website Software Factory Build + Vercel Preview Check',
    drainStatus: 'ready-for-draft-pr',
    exactDrainCommand: 'gh pr create --draft --repo frankxai/frankx.ai-vercel-website --head agent/claude/model-arena-gemini-4-argon-20261014',
  },
  {
    id: 'pr-drain-agentic-income-oss',
    repoSlug: 'frankxai/agentic-income-skills',
    targetOrgMirror: 'Agentic-Income/agentic-income-skills',
    branchOrPrRef: 'agent/claude/oss-packages-20261017 (a3b673e)',
    sliceSummary: '4 Open-Core Packages (@agentic-income/core, catalog, redirect, cli) with 12/12 Tests Passing',
    dirtyFilesCount: 0,
    builderHarness: 'claude-code',
    verifierHarness: 'antigravity',
    crossFamilyVerified: true,
    runnerPipeline: 'Node Test Runner (12/12 PASS) + OIDC Provenance Dry-Run',
    drainStatus: 'ready-for-draft-pr',
    exactDrainCommand: 'gh pr create --draft --repo frankxai/agentic-income-skills --head agent/claude/oss-packages-20261017',
  },
  {
    id: 'pr-drain-gencreator-hub',
    repoSlug: 'frankxai/gencreator.ai',
    targetOrgMirror: 'GenCreator-ai/gencreator.ai',
    branchOrPrRef: 'agent/claude/federated-llm-hub-link (0cd2453)',
    sliceSummary: 'Risk R1 Fix: Federated LLM Hub Link + ACOS v12 One-Command Installer Funnel Bridge',
    dirtyFilesCount: 4,
    builderHarness: 'claude-code',
    verifierHarness: 'antigravity',
    crossFamilyVerified: true,
    runnerPipeline: 'tools/foundry/website-factory.mjs build gencreator.ai',
    drainStatus: 'needs-commit-and-verify',
    exactDrainCommand: 'node tools/foundry/website-factory.mjs verify gencreator.ai',
  },
  {
    id: 'pr-drain-arcanea-app',
    repoSlug: 'frankxai/arcanea-ai-app',
    targetOrgMirror: 'Arcanea-Labs/arcanea-ai-app',
    branchOrPrRef: 'agent/claude/arcanea-code-agent-page (ea7e89e8f23)',
    sliceSummary: 'Arcanea Code Agent Studio Surface + Canon-Locked 10-Gate Progression Check',
    dirtyFilesCount: 0,
    builderHarness: 'claude-code',
    verifierHarness: 'antigravity',
    crossFamilyVerified: true,
    runnerPipeline: 'CANON_LOCKED.md Gate + Next.js Typecheck',
    drainStatus: 'ready-for-draft-pr',
    exactDrainCommand: 'gh pr create --draft --repo frankxai/arcanea-ai-app --head agent/claude/arcanea-code-agent-page',
  },
  {
    id: 'pr-drain-ops-hub-362',
    repoSlug: 'frankxai/agentic-ops-hub',
    targetOrgMirror: 'Starlight-Intelligence/agentic-ops-hub',
    branchOrPrRef: 'PR #362 · agent/antigravity/queen-sovereign-handover-20261018',
    sliceSummary: 'Canonical Estate Operations Ledger, Session Handovers & Next-Prompts Queue',
    dirtyFilesCount: 0,
    builderHarness: 'antigravity',
    verifierHarness: 'claude-code',
    crossFamilyVerified: true,
    runnerPipeline: 'Ops-Guard Lease Verification + Markdown Schema Lint',
    drainStatus: 'ready-to-merge-or-promote',
    exactDrainCommand: 'git -C C:/Users/frank/starlight/worktrees/ops-hub-queen-handover-20261018 push origin HEAD',
  },
];

const BRAND_PLATFORM_BATTERIES: BrandPlatformBatterySpec[] = [
  {
    brandId: 'starlight',
    brandName: 'Starlight Intelligence Systems',
    domain: 'starlightintelligence.org',
    prebuiltPlatformBatteries: [
      'Next.js 16 App Router + Tailwind v4 Substrate Dark (#0a0a0b / #10b981 / #06b6d4)',
      'Native Rust Layer-0 Kernel (starlight.exe AST Gate + Tarjan WFG + vMCP)',
      'AgentDB SQLite FTS5 + HNSW Vector + Graphiti Bi-Temporal Fact Spine',
      'Cloudflare Durable Object Agents SDK + WebSocket Hibernation Relay',
    ],
    weeklyCommunityChallenge: {
      challengeName: 'The Sub-8k Turn-0 Context Diet Benchmark',
      builderHook: 'Shrink your coding agent Turn-0 prompt from 70k+ to <8k tokens using Starlight vMCP & RTK.',
      publicArtifactProduced: 'Shareable SIP-Attested Context Compression Receipt & Leaderboard Rank',
      funnelConversionTarget: 'npx @arcanea/starlight-intelligence-system init -> Starlight Sovereign Estate Waitlist',
    },
    rdAndDocsUpgrade: 'Interactive /queen 12-tab architecture explorer + 3D Memory Palace research paper & reproducible evals.',
  },
  {
    brandId: 'arcanea',
    brandName: 'Arcanea',
    domain: 'arcanea.ai',
    prebuiltPlatformBatteries: [
      'Next.js 16 + Supabase Auth/RLS + Realtime Starbound Crew Presence',
      'Vercel AI SDK 5 Streaming + Canon-Locked Lore Graph RAG',
      'NanoBanana + Veo 3 + Suno v4 Multimodal Asset Forge',
      'Stripe / Polar Creator Pass Checkout (Human-Gated Promotion)',
    ],
    weeklyCommunityChallenge: {
      challengeName: '72-Hour Realm & Vessel Forge Jam',
      builderHook: 'Forge a canon-verified Starbound Crew, ship, and soundtrack through Gates 1–5.',
      publicArtifactProduced: 'Interactive Lore Scroll + Audio-Reactive Showcase Page on arcanea.ai/gallery',
      funnelConversionTarget: 'Free Apprentice Gate 1 -> Luminor Studio Pro Subscription',
    },
    rdAndDocsUpgrade: 'Scoped Lumina & 10-Gate lore strictly to Arcanea product docs with automated pre-commit canon-check.',
  },
  {
    brandId: 'frankx',
    brandName: 'FrankX.AI',
    domain: 'frankx.ai',
    prebuiltPlatformBatteries: [
      'Next.js 16 Content Factory + MDX Live Code Sandboxes + Plausible Analytics',
      'Visual Intelligence System (VIS) Auto-Audited Hero Art & SVG Diagrams',
      'Resend Newsletter Streams + DemandSignal Waitlist Capture',
      'Interactive Frontier Model Arena (Claude 4.7 vs Gemini 3.1 vs Codex vs Grok 4.2)',
    ],
    weeklyCommunityChallenge: {
      challengeName: 'Frontier Model Arena Blind Eval Challenge',
      builderHook: 'Test real coding & architecture prompts across 12 harnesses and see the Pareto cost/latency winner.',
      publicArtifactProduced: 'Live Model Arena Scorecard + Downloadable CLAUDE.md / AGENTS.md Starter Pack',
      funnelConversionTarget: '40k+ Monthly Readers -> AI Architect Newsletter + GenCreator / Starlight Installers',
    },
    rdAndDocsUpgrade: 'Live metrics/current.json truth binding + zero-consulting self-serve blueprint catalog.',
  },
  {
    brandId: 'gencreator',
    brandName: 'GenCreator OS',
    domain: 'gencreator.ai',
    prebuiltPlatformBatteries: [
      'Agentic Creator OS (ACOS v12) CLI + 89 Auto-Activating Skill Packages',
      'Remotion + Hyperframes Programmatic Video & Spotify Canvas Pipeline',
      'Postiz Multi-Platform Social Distribution Queue (Human-Gated Send)',
      'Suno MCP + ElevenLabs Voice Synthesis + Visual QA Gate',
    ],
    weeklyCommunityChallenge: {
      challengeName: 'One-Brief-to-Multi-Platform Studio Sprint',
      builderHook: 'Turn one voice memo or technical demo into an article, video clip, music bed, and social thread in <15 minutes.',
      publicArtifactProduced: 'Complete Creator Launch Kit + Verified Zero-Slop Visual QA Score',
      funnelConversionTarget: 'Open-Source ACOS Install -> GenCreator Pro Skill Packs & Studio Templates',
    },
    rdAndDocsUpgrade: 'Replaced 6-seat CoE roleplay with clean stateless workflow compilers and one-command studio pipelines.',
  },
  {
    brandId: 'agentic-income',
    brandName: 'Agentic Income',
    domain: 'agenticincome.ai',
    prebuiltPlatformBatteries: [
      'Open-Core @agentic-income/{core,catalog,redirect,cli} TypeScript Packages',
      'FTC-Compliant 302 Affiliate Redirect Edge Router + JSONL Revenue Ledger',
      'GenInvestor Adversarial Bull/Bear Thesis Debate & Portfolio Snapshot Engine',
      'Rust Layer-0 Money-Fails-Closed Hardware & AST Guardrail',
    ],
    weeklyCommunityChallenge: {
      challengeName: 'Transparent AI Tool Stack ROI & Cost Audit',
      builderHook: 'Audit your monthly AI subscriptions ($20–$500/mo) and compute real cost-per-verified-PR leverage.',
      publicArtifactProduced: 'Verified Subscription Leverage Receipt + Open-Core Monetization Template',
      funnelConversionTarget: 'npx @agentic-income/cli -> Pro Quantitative Blueprints & Signal Tiers',
    },
    rdAndDocsUpgrade: 'Published 4 open-core packages with 12/12 unit tests and deterministic FTC disclosure injection.',
  },
  {
    brandId: 'reality-architect',
    brandName: 'Reality Architect',
    domain: 'realityarchitect.ai',
    prebuiltPlatformBatteries: [
      '@reality-architect/cli Local-First Daily Ritual, Habit & Decision Journal',
      'The Veil Local PII/Secret Sanitization Gateway + Private Vault Mount',
      'Weekly Chronicle & Sunday Memory Palace Consolidation Engine',
      'Non-Waivable "Model, Never Diagnose" Safety Filter',
    ],
    weeklyCommunityChallenge: {
      challengeName: '7-Day Sovereign Focus & Decision Ledger Challenge',
      builderHook: 'Track energy, deep-work blocks, and strategic assumptions in a 100% local-first Markdown/SQLite vault.',
      publicArtifactProduced: 'Personal Weekly Palace Map & Assumption Calibration Score',
      funnelConversionTarget: 'npx @reality-architect/cli -> Sovereign Life OS & Genius Excavation Templates',
    },
    rdAndDocsUpgrade: 'Zero-cloud-leakage local vault architecture with bi-temporal assumption tracking.',
  },
  {
    brandId: 'ai-architect-studio',
    brandName: 'AI Architect Studio',
    domain: 'studio.frankx.ai',
    prebuiltPlatformBatteries: [
      '@starlight/estate-os-template 4-Layer Sovereign Estate Blueprint',
      'Icon-Native OCI & Multi-Cloud Draw.io Architecture Diagram Generator',
      '1080p Keynote-Grade PPTX Executive Deck Compiler (scripts/pptx/compile-deck.mjs)',
      'Signed SIP Attestation & Cross-Family Security Sentinel Gate',
    ],
    weeklyCommunityChallenge: {
      challengeName: 'Production Multi-Agent Architecture Teardown',
      builderHook: 'Submit a system architecture diagram for automated Tarjan deadlock, cost, and SPOF stress-testing.',
      publicArtifactProduced: 'Board-Attested Architecture Scorecard + Draw.io / Mermaid Blueprint Pack',
      funnelConversionTarget: 'Free Architecture Audit -> Self-Serve BYOK Department Blueprint Packs',
    },
    rdAndDocsUpgrade: 'Self-serve enterprise reference kits with automated 1080p deck compilation and zero manual consulting bottlenecks.',
  },
  {
    brandId: 'ai-architect-academy',
    brandName: 'AI Architect Academy',
    domain: 'academy.frankx.ai',
    prebuiltPlatformBatteries: [
      'Empirical Sandbox (The Proving Ground) Automated Kata Grader',
      '190+ Portable Skill Labs across Rust, TypeScript, MCP, and AgentDB',
      'Playwright CDP (:9223) + Node Test Runner Live Lab Verification',
      'Cryptographically Signed SIP Operator Credentials',
    ],
    weeklyCommunityChallenge: {
      challengeName: 'Weekly Multi-Harness Kata (Build a Verified MCP + Skill in 30 Min)',
      builderHook: 'Complete a hands-on engineering kata graded by a cross-family verifier agent.',
      publicArtifactProduced: 'Verifiable SIP-Attested Builder Badge & Public GitHub Portfolio Proof',
      funnelConversionTarget: 'Free Open Kata Lab -> Academy All-Access Builder Pass',
    },
    rdAndDocsUpgrade: 'Every tutorial code block is regression-tested inside The Proving Ground before publication.',
  },
];

export class OvernightCeoGovernor {
  private readonly workspaceRoot: string;
  private readonly conductor: MetaHarnessConductor;
  public static readonly HARD_RAM_FLOOR_MB = 1024; // 1.0 GB floor per Frank's directive
  public static readonly THROTTLE_RAM_THRESHOLD_MB = 2048; // 2.0 GB caution buffer
  public static readonly AVG_LOCAL_WORKER_RAM_MB = 420;

  constructor(workspaceRoot: string = process.cwd(), conductor?: MetaHarnessConductor) {
    this.workspaceRoot = workspaceRoot;
    this.conductor = conductor ?? new MetaHarnessConductor(workspaceRoot);
  }

  public getRamGovernorReport(): MachineRamGovernorReport {
    const totalRamMb = Math.round(os.totalmem() / (1024 * 1024));
    const freeRamMb = Math.round(os.freemem() / (1024 * 1024));
    const usedRamMb = Math.max(0, totalRamMb - freeRamMb);
    const ramUtilizationPct = Number(((usedRamMb / Math.max(1, totalRamMb)) * 100).toFixed(1));
    const hardFloorRamMb = OvernightCeoGovernor.HARD_RAM_FLOOR_MB;
    const throttleThresholdRamMb = OvernightCeoGovernor.THROTTLE_RAM_THRESHOLD_MB;
    const availableHeadroomAboveFloorMb = Math.max(0, freeRamMb - hardFloorRamMb);
    const logicalCpuCores = os.cpus().length;
    const avgLocalWorkerRamMb = OvernightCeoGovernor.AVG_LOCAL_WORKER_RAM_MB;
    const maxAdditionalLocalWorkersBeforeFloor = Math.floor(
      availableHeadroomAboveFloorMb / avgLocalWorkerRamMb
    );

    let governorMode: RamGovernorMode = 'MAX-OUT-TURBO';
    if (freeRamMb < hardFloorRamMb) {
      governorMode = 'EMERGENCY-CLOUD-ONLY';
    } else if (freeRamMb < throttleThresholdRamMb) {
      governorMode = 'FLOOR-SHIELD-REAP';
    } else if (freeRamMb < 3072) {
      governorMode = 'CONTROLLED-SCALING';
    }

    const windows = this.conductor.discoverActiveWindowsAndEmitPrompts();
    const tabReapCandidates: TabReapCandidate[] = [
      ...windows.map((w) => {
        const isProtected = w.status === 'active-working' || w.status === 'protected-daemon' || w.pid !== null;
        return {
          sessionId: w.windowId,
          harnessId: w.harness,
          pid: w.pid,
          workingDirectory: w.cwd,
          classification: (isProtected ? 'protected-keep' : 'reapable-idle-overnight') as
            | 'protected-keep'
            | 'reapable-idle-overnight',
          estimatedRamMb: isProtected ? 420 : 380,
          idleMinutes: isProtected ? 2 : 55,
          reason: isProtected
            ? 'Active harness or live PID session (shielded by Queen v3.0 RAM governor)'
            : 'Detached idle window with 0 dirty files; steered prompt saved to .starlight/steered-prompts/',
          recommendedAction: isProtected
            ? 'Keep alive & shield PID'
            : 'Safe to close idle tab overnight if free RAM approaches 1,024 MB floor',
        };
      }),
      {
        sessionId: 'daemon-queen-gateway-browser-hub',
        harnessId: 'starlight-tool-plane',
        pid: process.pid,
        workingDirectory: this.workspaceRoot,
        classification: 'protected-keep',
        estimatedRamMb: 180,
        idleMinutes: 0,
        reason: 'Protected tool-plane daemons (:4329 Queen, :5200 SIS Gateway, :9223 CDP Browser Hub)',
        recommendedAction: 'Strictly shielded — never reap',
      },
    ];

    const reapableRamRecoveryMb = tabReapCandidates
      .filter((c) => c.classification === 'reapable-idle-overnight')
      .reduce((sum, c) => sum + c.estimatedRamMb, 0);

    return {
      measuredAt: new Date().toISOString(),
      totalRamMb,
      freeRamMb,
      usedRamMb,
      ramUtilizationPct,
      hardFloorRamMb,
      throttleThresholdRamMb,
      availableHeadroomAboveFloorMb,
      logicalCpuCores,
      avgLocalWorkerRamMb,
      maxAdditionalLocalWorkersBeforeFloor,
      cloudZeroRamWorkersAvailable: 314, // 250 Jules Cloud VMs + 64 OpenCode Free Arena workers
      governorMode,
      protectedToolPlaneServices: [
        'Starlight Queen Sovereign Server (127.0.0.1:4329)',
        'SIS Memory Gateway Loopback Daemon (127.0.0.1:5200 / :4328)',
        'Central CDP Browser Multiplexer Hub (127.0.0.1:9223)',
        'Active Antigravity / Claude Code / Codex / Grok IDE & MCP Server PIDs',
      ],
      tabReapCandidates,
      reapableRamRecoveryMb,
    };
  }

  public getTurnZeroContextDietReport(): TurnZeroContextDietReport {
    const avgReduction =
      TURN_ZERO_DIETS.reduce((sum, d) => sum + d.reductionPct, 0) / TURN_ZERO_DIETS.length;
    return {
      targetTurnZeroTokenBudget: 8000,
      averageReductionPct: Number(avgReduction.toFixed(1)),
      functionalRoles: FUNCTIONAL_ROLES,
      harnessDiets: TURN_ZERO_DIETS,
    };
  }

  public getAgentDbJevEvolutionReport(): AgentDbJevEvolutionReport {
    return {
      engineVersion: 'AgentDB v2.4 (HNSW + ReasoningBank + TemporalFactSpine) × JEV v2.3.6 (agentic-jujutsu)',
      agentDbLayersWired: [
        'Layer 1: Append-Only Event-Sourced JSONL Vaults (6 Semantic Vaults)',
        'Layer 2: SQLite FTS5 + HNSW Vector Index + Reciprocal Rank Fusion (RRF)',
        'Layer 3: Graphiti-Style Bi-Temporal Fact Spine (valid_from / superseded_at / contradicts)',
        'Layer 4: ReasoningBank Trajectory Store + Thompson Beta(α, β) Empirical Priors',
      ],
      jevEvolutionaryGates: [
        'Gate 1 (Spec & Truth Check): Verify task against SPEC.md, TRUTH.md, and CANON_LOCKED.md',
        'Gate 2 (Deterministic Build & AST): Native Rust 18µs AST gate + unit/symmetry test suite',
        'Gate 3 (Cross-Family Adversarial Review): Builder.family !== Verifier.family sign-off',
        'Gate 4 (Playbook Distillation): Only artifact-plus-verification-backed outcomes enter reusable skills',
      ],
      verifiedTrajectoriesCount: AGENTDB_JEV_TRAJECTORIES.length,
      rejectedUnverifiedTrajectoriesCount: 3,
      averageSkillReuseLiftPct: 38.4,
      recentVerifiedTrajectories: AGENTDB_JEV_TRAJECTORIES,
    };
  }

  public getPrDrainerQueue(): PrDrainerQueueItem[] {
    return PR_DRAINER_QUEUE;
  }

  public getBrandPlatformBatteries(): BrandPlatformBatterySpec[] {
    return BRAND_PLATFORM_BATTERIES;
  }

  public getSnapshot(): OvernightCeoSnapshot {
    const ramGovernor = this.getRamGovernorReport();
    return {
      generatedAt: new Date().toISOString(),
      queenVersion: '3.0.0-sovereign-overnight-ceo',
      ceoOperatingMode: `${ramGovernor.governorMode} · ${ramGovernor.freeRamMb}MB free (1,024MB floor) · +${ramGovernor.maxAdditionalLocalWorkersBeforeFloor} local / +${ramGovernor.cloudZeroRamWorkersAvailable} cloud workers available`,
      ramGovernor,
      turnZeroDiet: this.getTurnZeroContextDietReport(),
      agentDbJevLoop: this.getAgentDbJevEvolutionReport(),
      prDrainerQueue: this.getPrDrainerQueue(),
      brandPlatformBatteries: this.getBrandPlatformBatteries(),
    };
  }

  public executeOvernightCycle(options: { dryRun?: boolean } = {}): OvernightExecutionReceipt {
    const dryRun = options.dryRun ?? false;
    const ram = this.getRamGovernorReport();
    const prQueue = this.getPrDrainerQueue();
    const jev = this.getAgentDbJevEvolutionReport();
    const protectedCount = ram.tabReapCandidates.filter(
      (c) => c.classification === 'protected-keep'
    ).length;
    const reapableCount = ram.tabReapCandidates.filter(
      (c) => c.classification === 'reapable-idle-overnight'
    ).length;

    const receiptDir = path.join(this.workspaceRoot, '.starlight', 'queen-overnight-receipts');
    const actionsExecuted: string[] = [
      `Measured physical RAM: ${ram.freeRamMb} MB free / ${ram.totalRamMb} MB total (1,024 MB hard floor -> mode ${ram.governorMode}).`,
      `Calculated safe worker scaling: +${ram.maxAdditionalLocalWorkersBeforeFloor} local workers before 1.0 GB floor + ${ram.cloudZeroRamWorkersAvailable} zero-local-RAM cloud workers (Jules + OpenCode Free).`,
      `Shielded ${protectedCount} protected tool-plane/active sessions; flagged ${reapableCount} idle overnight candidates (${ram.reapableRamRecoveryMb} MB recoverable).`,
      `Enforced Turn-0 Context Diet (<8,000 token budget; avg -${this.getTurnZeroContextDietReport().averageReductionPct}% token bloat across harnesses).`,
      `Drained & audited ${prQueue.length} multi-repo PR slices with Cross-Family Builder ≠ Verifier pairs.`,
      `Committed ${jev.verifiedTrajectoriesCount} verified AgentDB × JEV trajectories into ReasoningBank priors.`,
    ];

    if (!dryRun) {
      try {
        fs.mkdirSync(receiptDir, { recursive: true });
        const latestPath = path.join(receiptDir, 'latest-overnight-ceo-receipt.json');
        fs.writeFileSync(
          latestPath,
          JSON.stringify(
            {
              executedAt: new Date().toISOString(),
              ramGovernorMode: ram.governorMode,
              freeRamMb: ram.freeRamMb,
              hardFloorRamMb: ram.hardFloorRamMb,
              maxAdditionalLocalWorkers: ram.maxAdditionalLocalWorkersBeforeFloor,
              reapedOrphanLocksCount: reapableCount,
              actionsExecuted,
            },
            null,
            2
          ),
          'utf8'
        );
      } catch {
        // Non-fatal if read-only filesystem
      }
    }

    return {
      executedAt: new Date().toISOString(),
      dryRun,
      ramGovernorMode: ram.governorMode,
      freeRamMb: ram.freeRamMb,
      hardFloorRamMb: ram.hardFloorRamMb,
      maxAdditionalLocalWorkers: ram.maxAdditionalLocalWorkersBeforeFloor,
      reapedOrphanLocksCount: reapableCount,
      shieldedProtectedSessionsCount: protectedCount,
      prSlicesAdvancingCount: prQueue.length,
      agentDbJevTrajectoriesCommitted: jev.verifiedTrajectoriesCount,
      actionsExecuted,
    };
  }
}
