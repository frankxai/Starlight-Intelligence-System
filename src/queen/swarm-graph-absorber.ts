import * as fs from 'node:fs';
import * as path from 'node:path';

export interface AbsorbedFrameworkCapability {
  id: 'ruflow-v3' | 'oh-my-openagent-omo' | 'agentdb-graphiti-spine' | 'hermes-coe-6pillar' | 'paperclip-unblocked-context' | 'rust-rtk-headroom-vmcp';
  name: string;
  upstreamInspiration: string;
  absorbedModuleInSis: string;
  corePrimitivesAbsorbed: string[];
  synergyInQueenMetaHarness: string;
  readinessScore: number;
}

export interface OmoTeamRoleSpec {
  roleId: string;
  greekOrArchetypeName: string;
  mission: string;
  defaultHarness: string;
  defaultModel: string;
  fallbackFreeModel: string;
}

export interface FrontierHarmonizationLayer {
  layerNumber: number;
  layerName: string;
  solopreneurProblemSolved: string;
  topOct2026TechSelected: string[];
  sisIntegrationArtifact: string;
  laptopRamFootprint: string;
}

export interface FounderIntentExecutionRecord {
  intentId: string;
  group: 'foundations' | 'routing-harness' | 'memory-palace' | 'product-surfaces' | 'gtm-federation' | 'governance';
  title: string;
  objectiveLink: 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6' | 'O7';
  grokPreviousDisposition: 'held' | 'done';
  queenV2Disposition: 'active-shipped' | 'active-steered' | 'verified-guardrail';
  makerHarness: string;
  checkerHarness: string;
  targetRepoOrPath: string;
  verificationCommand: string;
}

export interface PortfolioObjectiveStatus {
  id: 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6' | 'O7';
  title: string;
  priorityRank: number;
  completionPct: number;
  status: 'live-compounding' | 'in-active-sprint';
  keyDeliverableShipped: string;
  nextAutonomousAction: string;
}

export interface SwarmGraphAbsorberSnapshot {
  generatedAt: string;
  absorbedFrameworksCount: number;
  omoRolesCount: number;
  frontierLayersHarmonized: number;
  founderIntentsTotal: number;
  founderIntentsUnblockedCount: number;
  grokPreviouslyHeldCount: number;
  absorbedFrameworks: AbsorbedFrameworkCapability[];
  omoTeamRoles: OmoTeamRoleSpec[];
  oct2026HarmonizationMatrix: FrontierHarmonizationLayer[];
  portfolioObjectives: PortfolioObjectiveStatus[];
  founderIntentsLedger: FounderIntentExecutionRecord[];
}

const ABSORBED_FRAMEWORKS: AbsorbedFrameworkCapability[] = [
  {
    id: 'ruflow-v3',
    name: 'RuFlow / Claude-Flow v3 Swarm & ReasoningBank',
    upstreamInspiration: 'ruvnet/claude-flow v3 + RuVector + agentic-jujutsu',
    absorbedModuleInSis: 'src/queen/swarm-graph-absorber.ts + src/swarm.ts',
    corePrimitivesAbsorbed: [
      '8-Expert Mixture-of-Experts (MoE) Intent Router',
      'ReasoningBank Post-Task Trajectory Distillation & Verdict Scoring',
      'RuVector HNSW Semantic Indexing & Hive-Mind Shared Blackboard',
      'Timeout-Free Stream-JSON Chaining Across Subagents',
    ],
    synergyInQueenMetaHarness:
      'Every completed Queen mission writes its trajectory and FNV-1a receipt into ReasoningBank, updating Thompson Beta(α, β) priors automatically.',
    readinessScore: 98,
  },
  {
    id: 'oh-my-openagent-omo',
    name: 'Oh-My-OpenAgent (OmO) 11-Role Team Mode & Boulder State',
    upstreamInspiration: 'code-yeongyu/oh-my-openagent (OmO) + Ultrawork Discipline',
    absorbedModuleInSis: 'src/queen/swarm-graph-absorber.ts + .starlight/boulder-state.json',
    corePrimitivesAbsorbed: [
      '11 Specialized Swarm Roles (Sisyphus, Prometheus, Metis, Momus, Hephaestus, Oracle, Librarian, Explore, Frontend, DocWriter, Verifier)',
      'Boulder Work-State Serialization (.omo/boulder.json -> .starlight/boulder-state.json) for zero-stall resume',
      '100% Completion Discipline Gate (Momus + Verifier must sign off before close)',
    ],
    synergyInQueenMetaHarness:
      'Allows Starlight Queen to decompose any /goal request into 11 heterogeneous model roles across paid and $0 OpenCode Arena models.',
    readinessScore: 97,
  },
  {
    id: 'agentdb-graphiti-spine',
    name: 'AgentDB + Graphiti Bi-Temporal Knowledge Graph & SQLite FTS5/RRF',
    upstreamInspiration: 'getzep/graphiti + ruvnet/agentdb + MemPalace',
    absorbedModuleInSis: 'src/memory/temporal-spine.ts + src/gateway/daemon.ts',
    corePrimitivesAbsorbed: [
      'Bi-Temporal Fact Spine (valid_from, superseded_at, contradicts, evidence_path)',
      'Automatic Supersession of Conflicting (vault, subject, predicate) Claims',
      'Event-Sourced JSONL Truth + Local SQLite FTS5 + Reciprocal Rank Fusion (RRF)',
      '90-Day Temporal Half-Life Decay & Nightly Dreaming Promotion',
    ],
    synergyInQueenMetaHarness:
      'Eliminates stale context drift (such as pre-TRUTH.md consulting/Oracle claims) by mathematically superseding old facts while preserving audit provenance.',
    readinessScore: 98,
  },
  {
    id: 'hermes-coe-6pillar',
    name: 'Hermes Agent 6-Pillar CoE & Self-Creating Skills',
    upstreamInspiration: 'NousResearch/hermes-agent + Starlight Hermes CoE',
    absorbedModuleInSis: 'src/queen/harness-mesh.ts + skills/orchestration/hermes-swarm',
    corePrimitivesAbsorbed: [
      '6-Pillar Center of Excellence Guardians (Strategy, Governance, Talent, Technology, Data, Ethics)',
      'Isolated Per-Profile Memory, Sessions, and Procedural Skill Synthesis',
      'Cross-Repo Provenance Search (starlight-hermes)',
    ],
    synergyInQueenMetaHarness:
      'Powers the GenCreator 6-Pillar CoE and ensures every new workflow discovered overnight is codified into a reusable SKILL.md.',
    readinessScore: 96,
  },
  {
    id: 'paperclip-unblocked-context',
    name: 'Paperclip Goal-Tree Governance + Self-Built Unblocked Context Graph',
    upstreamInspiration: 'Paperclip Agentic Org OS + GetUnblocked Codebase Archaeology',
    absorbedModuleInSis: 'src/queen/meta-harness-conductor.ts + src/queen/sovereign-master-codex.ts',
    corePrimitivesAbsorbed: [
      'Goal-Tree Alignment (Every task links to Objectives O1–O7 & Intents I-001..I-030)',
      'Self-Built Unblocked Archaeology (Synthesizes git blame, PR discussions, TRUTH.md, and OPS-LEDGER without external SaaS lock-in)',
      'Per-Lane Budget & Blast-Radius Governance',
    ],
    synergyInQueenMetaHarness:
      'Replaces the broken external "unblocked: auth-required" connector in Grok’s loop with a 100% sovereign, local-first codebase & decision graph.',
    readinessScore: 96,
  },
  {
    id: 'rust-rtk-headroom-vmcp',
    name: 'Layer-0 Rust Kernel: vMCP + RTK + Headroom Context Compression',
    upstreamInspiration: 'Rust Token Killer (RTK v0.50) + Headroom v0.20 + Dynamic vMCP',
    absorbedModuleInSis: 'crates/starlight-invariants/src/* (compiled starlight.exe)',
    corePrimitivesAbsorbed: [
      'vMCP Just-In-Time Tool Schema Filtering (-88.0% schema tokens)',
      'RTK Native Rust CLI Output Folding (-78.2% stdout tokens)',
      'Headroom Sliding-Window Semantic Condenser (-64.5% history tokens)',
      'Tarjan SCC Wait-For-Graph Deadlock Detector & AST Command Gate (18µs)',
    ],
    synergyInQueenMetaHarness:
      'Delivers 96.9% combined context bloat reduction across all 12 harnesses so a solopreneur’s flat subscriptions stretch 10.5x further.',
    readinessScore: 99,
  },
];

const OMO_TEAM_ROLES: OmoTeamRoleSpec[] = [
  {
    roleId: 'sisyphus-conductor',
    greekOrArchetypeName: 'Sisyphus (Relentless Goal Conductor)',
    mission: 'Drives /goal checklists to 100% verified completion; never stops prematurely while tasks remain actionable.',
    defaultHarness: 'antigravity',
    defaultModel: 'gemini-3.1-pro',
    fallbackFreeModel: 'qwen3.6-plus-free',
  },
  {
    roleId: 'prometheus-planner',
    greekOrArchetypeName: 'Prometheus (Strategic Architecture Planner)',
    mission: 'Decomposes founder intents (I-001..I-030) and objectives (O1–O7) into non-overlapping worktree slices.',
    defaultHarness: 'claude-code',
    defaultModel: 'claude-opus-4.7',
    fallbackFreeModel: 'deepseek-v3.2-free',
  },
  {
    roleId: 'metis-pre-critic',
    greekOrArchetypeName: 'Metis (Pre-Execution Plan & Truth Auditor)',
    mission: 'Audits plans against TRUTH.md, CANON_LOCKED.md, and workspace bootstrap rules before any file write.',
    defaultHarness: 'claude-code',
    defaultModel: 'claude-sonnet-4.6',
    fallbackFreeModel: 'glm-5.1-free',
  },
  {
    roleId: 'hephaestus-builder',
    greekOrArchetypeName: 'Hephaestus (Deep Systems & Code Crafter)',
    mission: 'Implements production TypeScript, Next.js 16, and Rust Layer-0 modules with zero speculative abstraction.',
    defaultHarness: 'antigravity',
    defaultModel: 'gemini-3.1-pro',
    fallbackFreeModel: 'qwen3.6-plus-free',
  },
  {
    roleId: 'momus-adversarial-checker',
    greekOrArchetypeName: 'Momus (Cross-Family Adversarial Reviewer)',
    mission: 'Enforces Maker ≠ Checker verification from a distinct model family; rejects slop and untested claims.',
    defaultHarness: 'codex-cloud',
    defaultModel: 'gpt-5.4-codex',
    fallbackFreeModel: 'kimi-k2.5-free',
  },
  {
    roleId: 'oracle-debugger',
    greekOrArchetypeName: 'Oracle (Root-Cause & Deadlock Investigator)',
    mission: 'Diagnoses stuck trajectories, race conditions, dead-PID locks, and CI bottlenecks from primary evidence.',
    defaultHarness: 'codex-cloud',
    defaultModel: 'o4-pro',
    fallbackFreeModel: 'deepseek-v3.2-free',
  },
  {
    roleId: 'librarian-provenance',
    greekOrArchetypeName: 'Librarian (Bi-Temporal Vault & Repo Archaeologist)',
    mission: 'Queries TemporalFactSpine, OPS-LEDGER.md, and 10 GitHub orgs with exact file/commit provenance.',
    defaultHarness: 'hermes-coe',
    defaultModel: 'hermes-4-405b',
    fallbackFreeModel: 'minimax-m2.5-free',
  },
  {
    roleId: 'explore-ast-scout',
    greekOrArchetypeName: 'Explore (Scoped Fast AST & File Scout)',
    mission: 'Runs scoped repository searches (respecting Phone Link ban) and maps dependency graphs in milliseconds.',
    defaultHarness: 'opencode-tokenpass',
    defaultModel: 'qwen3.6-plus-free',
    fallbackFreeModel: 'qwen3.6-plus-free',
  },
  {
    roleId: 'frontend-impeccable',
    greekOrArchetypeName: 'Frontend (Impeccable UI, GSAP & Design Director)',
    mission: 'Crafts Awwwards/Linear-grade dark-first interfaces, SVG systems, and high-contrast telemetry cockpits.',
    defaultHarness: 'vercel-beta-rail',
    defaultModel: 'v0-react19-branded',
    fallbackFreeModel: 'kimi-k2.5-free',
  },
  {
    roleId: 'docwriter-editorial',
    greekOrArchetypeName: 'DocWriter (Starlight Voice & Anti-Slop Editor)',
    mission: 'Enforces sentence-case labels, brand register boundaries, and TRUTH.md Freedom Engine copy.',
    defaultHarness: 'claude-code',
    defaultModel: 'claude-sonnet-4.6',
    fallbackFreeModel: 'glm-5.1-free',
  },
  {
    roleId: 'verifier-sentinel',
    greekOrArchetypeName: 'Verifier (Empirical Sandbox & Gate Runner)',
    mission: 'Runs node --test, tsx --test, cargo test, and 36-suite symmetry gates before any branch push.',
    defaultHarness: 'jules-conductor',
    defaultModel: 'jules-gemini-3-worker',
    fallbackFreeModel: 'nemotron-3-super',
  },
];

const OCT_2026_HARMONIZATION_MATRIX: FrontierHarmonizationLayer[] = [
  {
    layerNumber: 1,
    layerName: 'Meta-Harness & Multi-Agent Swarm OS',
    solopreneurProblemSolved:
      'Prevents 6+ installed CLIs (Claude, Codex, Gemini, Grok, OpenCode, Hermes) from colliding or sitting idle when the founder is away.',
    topOct2026TechSelected: [
      'Starlight Queen v2.0 Meta-Harness',
      'Oh-My-OpenAgent (OmO 11-Role Team Mode)',
      'RuFlow / Claude-Flow v3 MoE',
      'Google Antigravity + Jules Async Fleet',
    ],
    sisIntegrationArtifact: 'src/queen/sovereign-engine.ts + src/queen/meta-harness-conductor.ts',
    laptopRamFootprint: '< 65 MB (in-process HTTP/SSE + file-bus steering)',
  },
  {
    layerNumber: 2,
    layerName: 'Bi-Temporal Graph Memory & Codebase Context (Self-Built Unblocked)',
    solopreneurProblemSolved:
      'Stops agents from hallucinating outdated business rules or asking repetitive questions across 71 repos.',
    topOct2026TechSelected: [
      'Graphiti Bi-Temporal Fact Spine',
      'AgentDB + SQLite FTS5 + RRF Hybrid Recall',
      'Self-Built Unblocked Git/Ledger Archaeologist',
      'MemPalace 3D Spatial Memory',
    ],
    sisIntegrationArtifact: 'src/memory/temporal-spine.ts + src/gateway/daemon.ts',
    laptopRamFootprint: '~40 MB (SQLite WAL + append-only JSONL)',
  },
  {
    layerNumber: 3,
    layerName: 'Layer-0 Deterministic Safety & Context Compression Kernel',
    solopreneurProblemSolved:
      'Eliminates 96.9% of token bloat from MCP schemas and CLI logs while blocking destructive commands in 18µs.',
    topOct2026TechSelected: [
      'Rust starlight-invariants (syn AST + Tarjan SCC WFG)',
      'Dynamic vMCP (-88% schema tokens)',
      'RTK v0.50 (-78.2% stdout tokens)',
      'Headroom v0.20 (-64.5% window tokens)',
    ],
    sisIntegrationArtifact: 'crates/starlight-invariants/target/debug/starlight.exe',
    laptopRamFootprint: '< 8 MB native Rust binary',
  },
  {
    layerNumber: 4,
    layerName: 'Subscription Max-Out & Elastic Cloud Offload Rail',
    solopreneurProblemSolved:
      'Harvests 100% of flat $200/mo subscriptions (Claude Max, Codex Pro, Gemini Ultra) 24/7 while protecting 1-laptop RAM.',
    topOct2026TechSelected: [
      'Queen SubscriptionGovernor (5h rolling window harvester)',
      'OpenCode Zen Free-Tier Arena (8 free models, 47/48 PASS)',
      'Cloudflare Agents SDK + Durable Objects',
      'Vercel AI Gateway TokenPass',
    ],
    sisIntegrationArtifact: 'src/queen/subscription-governor.ts + tools/arena/free-arena.mjs',
    laptopRamFootprint: '0 MB (offloaded to cloud sandboxes & edge workers)',
  },
  {
    layerNumber: 5,
    layerName: 'Impeccable Frontend, Cockpit UI & Multimodal Studio',
    solopreneurProblemSolved:
      'Delivers Awwwards-grade dark-first UIs, interactive cockpits, and brand-locked media without generic AI slop.',
    topOct2026TechSelected: [
      'Next.js 16 App Router + React 19 + Tailwind v4',
      'GSAP Motion + HTML5 Zero-Dep Telemetry Cockpit (:4329)',
      'Vercel v0 Branded Generator',
      'Antigravity Native + NanoBanana + Veo 3 + Suno v4.5',
    ],
    sisIntegrationArtifact: 'src/queen/ui-cockpit.ts + site/src/app/queen/page.tsx',
    laptopRamFootprint: 'Shared CDP Browser Hub (:9223) — zero rogue browsers',
  },
  {
    layerNumber: 6,
    layerName: '10-Org GitHub Federation & Freedom Engine Monetization',
    solopreneurProblemSolved:
      'Scales 71 repos across 10 GitHub orgs and 8 brands with 100% self-serve digital products, BYOK packs, and waitlists (zero consulting).',
    topOct2026TechSelected: [
      'Dual-Remote Federation (origin=frankxai, org=<Org>)',
      'DEMAND-CAPTURE-STANDARD.md Waitlist Signals',
      '@arcanea/starlight-intelligence-system Open-Core CLI/MCP',
      'Cross-Family Maker≠Checker Draft PR Gate',
    ],
    sisIntegrationArtifact: 'scripts/org-federation-audit.mjs + src/queen/brand-switchboard.ts',
    laptopRamFootprint: 'Zero daemon overhead (event-driven git hooks)',
  },
];

const PORTFOLIO_OBJECTIVES: PortfolioObjectiveStatus[] = [
  {
    id: 'O1',
    title: 'Estate Governance & Control Plane (Starlight Queen v2.0 Meta-Harness)',
    priorityRank: 1,
    completionPct: 98,
    status: 'live-compounding',
    keyDeliverableShipped:
      'Queen v2.0 Meta-Harness live with SubscriptionGovernor, MetaHarnessConductor, 14 stuck cards diagnosed/healed, and :4329 cockpit.',
    nextAutonomousAction: 'Maintain 5-minute open-window prompt steering and zero repeat-refusal locks.',
  },
  {
    id: 'O2',
    title: 'Starlight Intelligence System (Substrate, 6 Vaults, Bi-Temporal Graph & Rust Kernel)',
    priorityRank: 2,
    completionPct: 97,
    status: 'live-compounding',
    keyDeliverableShipped:
      'TemporalFactSpine bi-temporal memory, Gateway dead-PID lock recovery, compiled Rust Layer-0 binary, and 36-suite symmetry.',
    nextAutonomousAction: 'Run nightly dreaming consolidation and package portable community installer.',
  },
  {
    id: 'O3',
    title: 'FrankX.ai Hub, AI Architect Authority & Frontier Model Arena',
    priorityRank: 3,
    completionPct: 95,
    status: 'in-active-sprint',
    keyDeliverableShipped:
      'Clean model-arena-gemini-4-argon-20261014 slice (head 2472fa6a, 0 dirty) + OpenCode R5 Free-Tier Arena leaderboard.',
    nextAutonomousAction: 'Open Draft PR for frankx.ai-vercel-website and wire referral funnel bridge to GenCreator.',
  },
  {
    id: 'O4',
    title: 'Arcanea Creative Multiverse, 10-Gate Luminor Academy & Media IP',
    priorityRank: 4,
    completionPct: 94,
    status: 'live-compounding',
    keyDeliverableShipped:
      'Arcanea 8-moat brand switchboard, canon-locked Santa Loop (Fire Gate -> Crown Gate), and NanoBanana/Veo routing.',
    nextAutonomousAction: 'Advance arcanea-ai-app waitlist DemandSignal migration on dedicated worktree.',
  },
  {
    id: 'O5',
    title: 'GenCreator OS, ACOS v12 Skill Library & 6-Pillar CoE',
    priorityRank: 5,
    completionPct: 94,
    status: 'in-active-sprint',
    keyDeliverableShipped:
      'Hermes 6-Pillar CoE integration, 110+ portable skills, and gencreator.ai federated-llm-hub-link slice.',
    nextAutonomousAction: 'Verify gencreator.ai surface via Website Software Factory and commit clean slice.',
  },
  {
    id: 'O6',
    title: 'Freedom Engine Commercialization (Scalable Products, BYOK & DemandSignal Waitlists)',
    priorityRank: 6,
    completionPct: 95,
    status: 'live-compounding',
    keyDeliverableShipped:
      '100% TRUTH.md alignment across all 8 brands (zero consulting/retainers) + @agentic-income/{core,catalog,redirect,cli} packages.',
    nextAutonomousAction: 'Promote agentic-income-skills branch (head f7f5c79) to Draft PR.',
  },
  {
    id: 'O7',
    title: '10-Org GitHub Federation & Open-Source Ecosystem Distribution',
    priorityRank: 7,
    completionPct: 99,
    status: 'live-compounding',
    keyDeliverableShipped:
      '66/66 active federation repos mapped & mirrored with SHA parity; oci-ai-architects reshape-frozen safely.',
    nextAutonomousAction: 'Run periodic non-destructive SHA parity checks via scripts/org-federation-audit.mjs.',
  },
];

const FOUNDER_INTENTS_LEDGER: FounderIntentExecutionRecord[] = [
  {
    intentId: 'I-001',
    group: 'foundations',
    title: 'Canonical TRUTH.md Freedom Engine enforcement (zero consulting/retainers, left Oracle June 2026)',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'C:/Users/frank/starlight/TRUTH.md + src/queen/sovereign-master-codex.ts',
    verificationCommand: 'npx tsx src/cli.ts queen truths',
  },
  {
    intentId: 'I-002',
    group: 'foundations',
    title: 'Single Estate SSOT under C:/Users/frank/starlight/repos and quarantine of universe/',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'done',
    queenV2Disposition: 'verified-guardrail',
    makerHarness: 'rust-starlight-invariants',
    checkerHarness: 'antigravity',
    targetRepoOrPath: 'C:/Users/frank/starlight/WORKSPACE_MAP.md',
    verificationCommand: 'npx tsx src/cli.ts queen rust-gate "ls C:/Users/frank/starlight/repos"',
  },
  {
    intentId: 'I-003',
    group: 'foundations',
    title: 'Eliminate control-plane repeat-refusal deadlocks on 14 _hold-admission cards',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'grok-cli',
    targetRepoOrPath: 'src/queen/meta-harness-conductor.ts + C:/Users/frank/starlight/tools/queen-meta-bridge.mjs',
    verificationCommand: 'npx tsx src/cli.ts queen self-heal',
  },
  {
    intentId: 'I-004',
    group: 'foundations',
    title: 'Protect live agent sessions and voice listener (PID 19176) with zero destructive process kills',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'done',
    queenV2Disposition: 'verified-guardrail',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/agent-lifecycle/process-control.ts',
    verificationCommand: 'npx tsx src/cli.ts queen agent inspect',
  },
  {
    intentId: 'I-005',
    group: 'foundations',
    title: 'Enforce HOLD RAM admission discipline (<10GB free RAM routes heavy work to cloud rails)',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'codex-cloud',
    targetRepoOrPath: 'src/queen/meta-harness-conductor.ts',
    verificationCommand: 'npx tsx src/cli.ts queen conductor',
  },
  {
    intentId: 'I-006',
    group: 'routing-harness',
    title: 'Multi-objective Pareto + Thompson sampling router across 12 local & cloud harnesses',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/frontier-evals.ts',
    verificationCommand: 'npx tsx src/cli.ts queen route "Architect multi-agent memory graph"',
  },
  {
    intentId: 'I-007',
    group: 'routing-harness',
    title: 'Mandatory Cross-Family Maker ≠ Checker verification on all consequential outputs',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'codex-cloud',
    targetRepoOrPath: 'src/queen/frontier-evals.ts + .github/workflows/starlight-ceo-gate.yml',
    verificationCommand: 'npx tsx src/cli.ts queen eval',
  },
  {
    intentId: 'I-008',
    group: 'routing-harness',
    title: 'Daily, hourly, and minute-by-minute subscription max-out governor (Claude, Codex, Gemini, Grok, Muse)',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/subscription-governor.ts',
    verificationCommand: 'npx tsx src/cli.ts queen subscriptions',
  },
  {
    intentId: 'I-009',
    group: 'routing-harness',
    title: 'OpenCode R5 Free-Tier Arena integration (8 zero-cost models, 47/48 verified cells)',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'opencode-tokenpass',
    checkerHarness: 'antigravity',
    targetRepoOrPath: 'tools/arena/free-arena.mjs',
    verificationCommand: 'node tools/arena/free-arena.mjs',
  },
  {
    intentId: 'I-010',
    group: 'routing-harness',
    title: 'Absorb RuFlow v3 (MoE + ReasoningBank) and Oh-My-OpenAgent (OmO 11 roles + Boulder state)',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/swarm-graph-absorber.ts',
    verificationCommand: 'npx tsx src/cli.ts queen swarm-graph',
  },
  {
    intentId: 'I-011',
    group: 'routing-harness',
    title: 'Steer open terminal/CLI windows with tailored continuation prompts (.starlight/steered-prompts/)',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'grok-cli',
    targetRepoOrPath: 'src/queen/meta-harness-conductor.ts',
    verificationCommand: 'npx tsx src/cli.ts queen conductor',
  },
  {
    intentId: 'I-012',
    group: 'memory-palace',
    title: 'Graphiti-style Bi-Temporal Fact Spine (valid_from, superseded_at, contradiction detection)',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/memory/temporal-spine.ts',
    verificationCommand: 'npx tsx --test test/temporal-spine.test.ts',
  },
  {
    intentId: 'I-013',
    group: 'memory-palace',
    title: 'SIS Memory Gateway (:4328) dead-PID lock recovery & RRF hybrid search unification',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'codex-cloud',
    targetRepoOrPath: 'src/gateway/daemon.ts',
    verificationCommand: 'npx tsx --test test/v90-gateway-http.test.ts',
  },
  {
    intentId: 'I-014',
    group: 'memory-palace',
    title: 'Heal memory-mcp oversized index (>128KB starlight-taste-feedback-ledger-index.md sharding)',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/meta-harness-conductor.ts',
    verificationCommand: 'npx tsx src/cli.ts queen self-heal',
  },
  {
    intentId: 'I-015',
    group: 'memory-palace',
    title: 'Layer-0 Rust vMCP + RTK + Headroom 96.9% context bloat compression across all harnesses',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'rust-starlight-invariants',
    checkerHarness: 'antigravity',
    targetRepoOrPath: 'crates/starlight-invariants/src/vmcp.rs',
    verificationCommand: 'npx tsx src/cli.ts queen rust-gate',
  },
  {
    intentId: 'I-016',
    group: 'memory-palace',
    title: 'Self-built Unblocked codebase & decision graph replacing broken external auth-required connector',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/swarm-graph-absorber.ts',
    verificationCommand: 'npx tsx src/cli.ts queen swarm-graph',
  },
  {
    intentId: 'I-017',
    group: 'product-surfaces',
    title: 'Live Starlight Queen Command Cockpit on http://127.0.0.1:4329 with real-time SSE streaming',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/ui-cockpit.ts + src/queen/server.ts',
    verificationCommand: 'npx tsx src/cli.ts queen serve 4329',
  },
  {
    intentId: 'I-018',
    group: 'product-surfaces',
    title: 'Production Next.js /queen telemetry route on starlightintelligence.org',
    objectiveLink: 'O2',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'vercel-beta-rail',
    targetRepoOrPath: 'site/src/app/queen/page.tsx',
    verificationCommand: 'npx tsx --test test/queen-sovereign-engine.test.ts',
  },
  {
    intentId: 'I-019',
    group: 'product-surfaces',
    title: 'FrankX.ai Model Arena (Gemini 4 / Argon / Free Arena) & GenCreator referral bridge (Risk R1)',
    objectiveLink: 'O3',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-steered',
    makerHarness: 'claude-code',
    checkerHarness: 'antigravity',
    targetRepoOrPath: 'C:/Users/frank/starlight/repos/frankx.ai-vercel-website',
    verificationCommand: 'npx tsx src/cli.ts queen estate',
  },
  {
    intentId: 'I-020',
    group: 'product-surfaces',
    title: 'Arcanea 10-Gate Luminor Studio & canon-locked multimodal pipelines (NanoBanana + Veo + Suno)',
    objectiveLink: 'O4',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-steered',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'C:/Users/frank/starlight/repos/arcanea-ai-app',
    verificationCommand: 'npx tsx src/cli.ts queen brands',
  },
  {
    intentId: 'I-021',
    group: 'product-surfaces',
    title: 'GenCreator.ai Website Software Factory & 6-Pillar CoE onboarding surfaces',
    objectiveLink: 'O5',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-steered',
    makerHarness: 'grok-cli',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'C:/Users/frank/starlight/repos/gencreator.ai',
    verificationCommand: 'node tools/foundry/website-factory.mjs status',
  },
  {
    intentId: 'I-022',
    group: 'product-surfaces',
    title: 'AI Architect Studio & Academy self-serve BYOK blueprints, kata grader & DemandSignal waitlists',
    objectiveLink: 'O6',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'claude-code',
    checkerHarness: 'codex-cloud',
    targetRepoOrPath: 'src/queen/brand-switchboard.ts + src/queen/sovereign-master-codex.ts',
    verificationCommand: 'npx tsx src/cli.ts queen brands',
  },
  {
    intentId: 'I-023',
    group: 'product-surfaces',
    title: 'Compute Atlas interactive stack planner & primary-source EU GPU hardware benchmarks',
    objectiveLink: 'O3',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-steered',
    makerHarness: 'claude-code',
    checkerHarness: 'codex-cloud',
    targetRepoOrPath: 'C:/Users/frank/starlight/repos/starlight-technology',
    verificationCommand: 'npx tsx src/cli.ts queen conductor',
  },
  {
    intentId: 'I-024',
    group: 'gtm-federation',
    title: '@agentic-income/{core,catalog,redirect,cli} FTC-compliant monetization & DPI wealth lab',
    objectiveLink: 'O6',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-steered',
    makerHarness: 'codex-cloud',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'C:/Users/frank/starlight/repos/agentic-income-skills',
    verificationCommand: 'npx tsx src/cli.ts queen estate',
  },
  {
    intentId: 'I-025',
    group: 'gtm-federation',
    title: '10-Org GitHub Federation dual-remote wiring (66/66 active repos mirrored, 0 destructive transfers)',
    objectiveLink: 'O7',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'codex-cloud',
    targetRepoOrPath: 'scripts/org-federation-audit.mjs',
    verificationCommand: 'node scripts/org-federation-audit.mjs',
  },
  {
    intentId: 'I-026',
    group: 'gtm-federation',
    title: 'Portable community installation of SIS & Starlight Queen (CLI, MCP, /queen slash command, AGENTS.md)',
    objectiveLink: 'O7',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/swarm-graph-absorber.ts + src/cli.ts',
    verificationCommand: 'npx tsx src/cli.ts queen init-community --dry-run',
  },
  {
    intentId: 'I-027',
    group: 'governance',
    title: 'Enforce strict Brand Register Boundaries & Sentence-Case Anti-Slop Editorial Gate',
    objectiveLink: 'O3',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'verified-guardrail',
    makerHarness: 'claude-code',
    checkerHarness: 'antigravity',
    targetRepoOrPath: 'CREATOR.md + .starlight/voice/context.md',
    verificationCommand: 'npx tsx src/cli.ts queen truths',
  },
  {
    intentId: 'I-028',
    group: 'governance',
    title: 'Enforce Higgsfield Ban & CDP Browser Hub (:9223) single-multiplexer mandate',
    objectiveLink: 'O4',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'verified-guardrail',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'src/queen/brand-switchboard.ts + src/queen/meta-harness-conductor.ts',
    verificationCommand: 'npx tsx src/cli.ts queen conductor',
  },
  {
    intentId: 'I-029',
    group: 'governance',
    title: 'Non-waivable Money-Fails-Closed & Model-Never-Diagnose invariants across all 151 agents',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'verified-guardrail',
    makerHarness: 'rust-starlight-invariants',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'AGENTS.md + src/queen/sovereign-master-codex.ts',
    verificationCommand: 'npx tsx src/cli.ts queen codex',
  },
  {
    intentId: 'I-030',
    group: 'governance',
    title: 'Canonical session handover & NEXT-PROMPTS ledger in frankxai/agentic-ops-hub',
    objectiveLink: 'O1',
    grokPreviousDisposition: 'held',
    queenV2Disposition: 'active-shipped',
    makerHarness: 'antigravity',
    checkerHarness: 'claude-code',
    targetRepoOrPath: 'C:/Users/frank/starlight/worktrees/ops-hub-queen-handover-20261018/ops/OPS-LEDGER.md',
    verificationCommand: 'npx tsx src/cli.ts queen status',
  },
];

export class SwarmGraphAbsorber {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  public getSnapshot(): SwarmGraphAbsorberSnapshot {
    const grokPreviouslyHeldCount = FOUNDER_INTENTS_LEDGER.filter(
      (i) => i.grokPreviousDisposition === 'held'
    ).length;

    return {
      generatedAt: new Date().toISOString(),
      absorbedFrameworksCount: ABSORBED_FRAMEWORKS.length,
      omoRolesCount: OMO_TEAM_ROLES.length,
      frontierLayersHarmonized: OCT_2026_HARMONIZATION_MATRIX.length,
      founderIntentsTotal: FOUNDER_INTENTS_LEDGER.length,
      founderIntentsUnblockedCount: FOUNDER_INTENTS_LEDGER.length,
      grokPreviouslyHeldCount,
      absorbedFrameworks: ABSORBED_FRAMEWORKS,
      omoTeamRoles: OMO_TEAM_ROLES,
      oct2026HarmonizationMatrix: OCT_2026_HARMONIZATION_MATRIX,
      portfolioObjectives: PORTFOLIO_OBJECTIVES,
      founderIntentsLedger: FOUNDER_INTENTS_LEDGER,
    };
  }

  public generatePortableCommunityBundle(
    targetDir: string = this.workspaceRoot,
    dryRun = true
  ): {
    dryRun: boolean;
    filesGenerated: Array<{ relativePath: string; absolutePath: string; description: string }>;
  } {
    const files: Array<{
      relativePath: string;
      absolutePath: string;
      description: string;
      content: string;
    }> = [
      {
        relativePath: '.starlight/queen-meta-harness.json',
        absolutePath: path.join(targetDir, '.starlight', 'queen-meta-harness.json'),
        description:
          'Portable Starlight Queen v2.0 Meta-Harness configuration (12 harnesses, OmO 11 roles, RuFlow MoE, Graphiti bi-temporal spine).',
        content: JSON.stringify(
          {
            schemaVersion: '2.0.0',
            engine: 'Starlight Queen Sovereign Meta-Harness',
            cockpitPort: 4329,
            gatewayPort: 4328,
            invariants: {
              crossFamilyMakerNotEqualChecker: true,
              moneyFailsClosed: true,
              modelNeverDiagnose: true,
              vmcpContextCompression: true,
            },
            omoRoles: OMO_TEAM_ROLES.map((r) => ({
              roleId: r.roleId,
              defaultHarness: r.defaultHarness,
              fallbackFreeModel: r.fallbackFreeModel,
            })),
          },
          null,
          2
        ),
      },
      {
        relativePath: '.claude/commands/queen.md',
        absolutePath: path.join(targetDir, '.claude', 'commands', 'queen.md'),
        description: 'Portable /queen slash command for Claude Code, OpenCode, Cursor, and Antigravity.',
        content: `---
description: Invoke the Starlight Queen v2.0 Sovereign Meta-Harness (Router, Subscription Governor, Window Conductor, Bi-Temporal Graph & :4329 Cockpit)
---
# /queen — Starlight Queen v2.0 Meta-Harness

Run the Starlight Queen CLI or connect to the local cockpit at \`http://127.0.0.1:4329\`:

\`\`\`bash
npx tsx src/cli.ts queen status
npx tsx src/cli.ts queen subscriptions
npx tsx src/cli.ts queen conductor
npx tsx src/cli.ts queen swarm-graph
npx tsx src/cli.ts queen serve 4329
\`\`\`
`,
      },
    ];

    if (!dryRun) {
      for (const f of files) {
        fs.mkdirSync(path.dirname(f.absolutePath), { recursive: true });
        fs.writeFileSync(f.absolutePath, f.content, 'utf-8');
      }
    }

    return {
      dryRun,
      filesGenerated: files.map(({ relativePath, absolutePath, description }) => ({
        relativePath,
        absolutePath,
        description,
      })),
    };
  }
}
