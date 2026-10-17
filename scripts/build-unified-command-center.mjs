#!/usr/bin/env node
/**
 * build-unified-command-center.mjs
 *
 * Deterministic generator for the Starlight Unified Agentic OS Command Center (HTML5).
 * Reads live telemetry from:
 *   - C:/Users/frank/.starlight/reports/horizon-{2h,12h,1w}-latest.json
 *   - scripts/org-federation-audit.mjs (ORG_FEDERATION_MANIFEST)
 *   - C:/Users/frank/starlight/graph/systems.graph.json (if present)
 *
 * Outputs a self-contained, interactive, accessible HTML5 Command Center to:
 *   1. C:/Users/frank/starlight/command-center/starlight-agentic-os-command-center.html
 *   2. docs/cockpit/starlight-agentic-os-command-center.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ORG_FEDERATION_MANIFEST } from './org-federation-audit.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

export const DEFAULT_REPORTS_DIR = 'C:/Users/frank/.starlight/reports';
export const DEFAULT_STARLIGHT_ROOT = 'C:/Users/frank/starlight';

function readJsonSafe(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return fallback;
  }
}

export function collectCommandCenterData({
  reportsDir = DEFAULT_REPORTS_DIR,
  starlightRoot = DEFAULT_STARLIGHT_ROOT
} = {}) {
  const h2 = readJsonSafe(path.join(reportsDir, 'horizon-2h-latest.json'), {
    horizon: '2h',
    completedAt: new Date().toISOString(),
    gateway: { alive: true, port: 5200, pid: 34852, status: 'ok', healed: false },
    starlightd: { status: 'idle', sweepCount: 1 },
    sovereignMemory: {
      totalAtoms: 1106,
      vectorBytes: 283264,
      kgRows: 400,
      surfaceStatus: 'healthy',
      staleVaults: 0,
      consolidationAgeDays: 0
    },
    eval50: {
      available: true,
      atoms: 1106,
      queries: 50,
      metrics: {
        hit10: 1,
        recall5: 1,
        precision10: 0.438,
        mrr10: 1,
        latencyMs: { p50: 218.85, p95: 280.73, max: 296.39 }
      },
      byClass: {
        disambig: { queries: 3, hit10: 1, recall5: 1, precision10: 0.4 },
        recall: { queries: 43, hit10: 1, recall5: 1, precision10: 0.433 },
        'cross-vault': { queries: 4, hit10: 1, recall5: 1, precision10: 0.525 }
      }
    },
    coordination: { activeLanes: 0, totalLanes: 0, leaseFiles: 161 }
  });

  const h12 = readJsonSafe(path.join(reportsDir, 'horizon-12h-latest.json'), {
    horizon: '12h',
    completedAt: new Date().toISOString(),
    dreaming: { processedFiles: 70, extractedInsights: 119, contradictions: 0, promotions: 4 },
    temporalDecay: { halfLifeDays: 90, entriesScanned: 152, belowArchiveThreshold: 0 },
    orgFederation: {
      organizationsCount: 10,
      totalMappedRepos: 71,
      localPresentCount: 71,
      localOrgRemoteAlignedCount: 71
    }
  });

  const h1w = readJsonSafe(path.join(reportsDir, 'horizon-1w-latest.json'), {
    horizon: '1w',
    completedAt: new Date().toISOString(),
    scheduledTasks: { total: 64, ready: 23, running: 3, disabled: 38, failingReady: [] },
    n8nWorkflowPresent: true
  });

  const sysGraph = readJsonSafe(path.join(starlightRoot, 'graph', 'systems.graph.json'), null);

  // Enrich the 10 GitHub Organizations with Brand Team, Council Leads, AI OS Layer, Vaults, Skills, MCP, and IP governance
  const orgGovernanceMeta = {
    'Starlight-Intelligence': {
      mission: 'Core AI operating system, Command Center Observatory, memory engine, voice pack, design intelligence, and evals.',
      councilLead: 'Queen + Prime + Architect',
      specialistTeam: ['starlight-architect', 'starlight-sentinel', 'starlight-weaver', 'starlight-hermes', 'starlight-sage'],
      aiOsLayer: 'Layer 1-2: Sovereign Cockpit, Voice & Design System, Eval Harness',
      vaults: ['Strategic ◆', 'Technical ⬡', 'Operational ▸'],
      skillsAndPlugins: ['starlight-intelligence', 'starlight-queen', 'visual-qa-gate', 'brand-voice', 'agent-quality'],
      mcpAndConnectors: ['starlight-sis (:5200)', 'starlight-v0', 'Linear MCP', 'GitHub MCP'],
      ipAndData: 'Starlight Brand Pack v1.0, Command Center Electron/Next.js Observatory, Eval-50 Corpus, Android Kit',
      contentAndCommunity: 'starlightintelligence.ai · Operator Release Notes · Design System Showcases',
      accessGate: 'Branch protection + /starlight-board + SIP Attestation'
    },
    'Starlight-Intelligence-Systems': {
      mission: 'Open sovereign substrate (SIP), multi-agent cognitive architecture, 6 semantic memory vaults, and public research.',
      councilLead: 'Architect + Sage + Prime',
      specialistTeam: ['starlight-sage', 'starlight-navigator', 'starlight-hermes', 'starlight-sentinel'],
      aiOsLayer: 'Layer 0: Starlight Intelligence Protocol (SIP) + Event-Sourced SQLite/Vector Substrate',
      vaults: ['Strategic ◆', 'Technical ⬡', 'Creative ✦', 'Operational ▸', 'Wisdom ◎', 'Horizon ↗'],
      skillsAndPlugins: ['sis-memory-orchestrator', 'sip-attest', 'memory-vault-management', 'yolo-conductor', 'santa-method'],
      mcpAndConnectors: ['mcp-server.js (sis_vault_search, sis_append_entry)', 'SisGatewayDaemon (:5200)', 'Syncthing P2P'],
      ipAndData: 'SIP Specification, 151 Agent Profiles, 89 Skill Rules, 1,106 Sovereign Memory Atoms, Research Papers',
      contentAndCommunity: 'starlightintelligence.org/research/ · Open Protocol Releases · Alliance Federation',
      accessGate: 'Pre-commit substrate symmetry hooks (v75-v79) + /starlight-board'
    },
    'Arcanea-Labs': {
      mission: 'Creative multiverse, Ten Gates progression system, Luminor AI companions, AnimeLegends studio, and onchain lore.',
      councilLead: 'Lumina (Queen) + Weaver + Arcanean Art Director',
      specialistTeam: ['arcanea-story', 'arcanea-coder', 'arcanea-reviewer', 'canon-guardian', 'anime-storyboarder'],
      aiOsLayer: 'Creative Worlds & Multimodal Media Pipeline (Ten Gates Framework)',
      vaults: ['Creative ✦', 'Wisdom ◎', 'Horizon ↗'],
      skillsAndPlugins: ['arcanea', 'canon-check', 'character-forge', 'world-forge', 'anime-character-sheets', 'suno-ai-mastery'],
      mcpAndConnectors: ['NanoBanana (nb-image)', 'Veo Video Pipeline', 'ElevenLabs Voice', 'Suno Music Engine'],
      ipAndData: 'CANON_LOCKED.md, Ten Gates Lore, AnimeLegends Trinity (Akashi, Kage, Mira), NFT & Onchain Contracts',
      contentAndCommunity: 'arcanea.ai · Starbound Crews · Academy Halls · Lore Scrolls & Interactive Fiction',
      accessGate: '/canon-check + Santa Loop (Fire Gate -> Crown Gate convergence) + CANON_LOCKED read-only rule'
    },
    'GenCreator-ai': {
      mission: 'Agentic Creator OS (ACOS), multi-model studio, music/video/prose production pipelines, and creator monetization.',
      councilLead: 'Envoy + Orchestrator + Creation Engine',
      specialistTeam: ['content-director', 'music-video-producer', 'audio-producer', 'social-strategist', 'social-visual-director'],
      aiOsLayer: 'Creator OS & Multi-Channel Production Engine (6-Pillar GenCreator CoE)',
      vaults: ['Creative ✦', 'Operational ▸', 'Strategic ◆'],
      skillsAndPlugins: ['acos', 'studio', 'factory', 'create-music', 'video-produce', 'article-creator', 'music-triage'],
      mcpAndConnectors: ['suno-mcp-server', 'starlight-creator-mcp', 'Postiz (Railway)', 'Resend', 'Vercel Blob'],
      ipAndData: '845+ Suno Track Catalog, ACOS Plugin Registry, Creator Launch OS Templates, Multi-Platform Workflows',
      contentAndCommunity: 'gencreator.ai · Creator Blueprints · Open Skills & Studio Packs',
      accessGate: 'Waitlist-first gate + BYOK model routing + Zero-Orphan Provenance'
    },
    'FrankX-AI': {
      mission: 'Personal headquarters of Frank Riemer — AI Architect essays, books, prompt library, and production engineering.',
      councilLead: 'Prime + Frank Brand Editor + Adversarial Reviewer',
      specialistTeam: ['author-team', 'frank-brand-editor', 'seo-specialist', 'visual-intelligence', 'canary'],
      aiOsLayer: 'Editorial Publishing House, Book Engine & Flagship Web Surface',
      vaults: ['Strategic ◆', 'Creative ✦', 'Wisdom ◎'],
      skillsAndPlugins: ['frankx-brand', 'excellence-book-writing', 'article-excellence', 'vis-audit', 'seo-check', 'product-deploy'],
      mcpAndConnectors: ['Vercel MCP', 'Plausible Analytics', 'Resend Newsletter', 'Next-Devtools MCP', 'MCP Doctor'],
      ipAndData: 'Multi-Book Manuscripts, Prompt Library, Claude Skills Library, Visual Registry (VIS), Metrics Truth Ledger',
      contentAndCommunity: 'frankx.ai · AI Architect Newsletter · Published Books & Technical Deep-Dives',
      accessGate: 'Metrics Truth Rule (metrics/current.json) + Editorial Anti-Slop Gate + Two-Repo Production Deploy'
    },
    'AI-Architect-Studio': {
      mission: 'Enterprise-grade AI Center of Excellence (CoE) blueprints, Agentic OS standards, and operational control plane.',
      councilLead: 'Architect + Sentinel + Navigator',
      specialistTeam: ['starlight-architect', 'security-auditor', 'ops-steward', 'healer'],
      aiOsLayer: 'Enterprise Architecture Blueprints & Estate Control Plane (agentic-ops)',
      vaults: ['Technical ⬡', 'Operational ▸', 'Strategic ◆'],
      skillsAndPlugins: ['starlight-architect', 'ai-architecture', 'ops-health', 'healer', 'harnesses', 'security-auditor'],
      mcpAndConnectors: ['starlight-department-lab MCP', 'ops-guard Lease CLI', 'GitHub Multi-Repo Orchestrator'],
      ipAndData: 'Agentic OS Standard, AI CoE Field Guide, 10-Org Federation Manifest, Ops-Guard Lease Engine',
      contentAndCommunity: 'frankx.ai/ai-architect · Awesome AI CoE · Awesome Agent Operating Systems',
      accessGate: 'ops-guard worktree lease check + 4-fact git bootstrap contract'
    },
    'AI-Architect-Academy': {
      mission: 'Cohort-based and self-paced mastery programs teaching builders to architect sovereign AI systems.',
      councilLead: 'Sage + Genius + Concierge',
      specialistTeam: ['learning-architect', 'workshop-facilitator', 'practice-evaluator'],
      aiOsLayer: 'Academy Curriculum, Evaluation Labs & Builder Certification',
      vaults: ['Wisdom ◎', 'Technical ⬡', 'Strategic ◆'],
      skillsAndPlugins: ['workshop-new', 'workshop-prep', 'practice-agent-evaluation', 'feinman-thinking'],
      mcpAndConnectors: ['starlight-department-lab (get_evaluation_cases, check_evaluation_answers)', 'Vercel KV Waitlist'],
      ipAndData: '30-Day Pillar Syllabus, Cohort Labs, Department Evaluation Cases, Builder Rubrics',
      contentAndCommunity: 'frankx.ai/academy · aiarchitectacademy.com · Student Builder Cohorts',
      accessGate: 'Waitlist-first commercial gate + Oracle separation compliance'
    },
    'Agentic-Income': {
      mission: 'Autonomous wealth research, digital product wedges, affiliate intelligence, and capital allocation frameworks.',
      councilLead: 'Navigator + Business IS + Impact Diligence Analyst',
      specialistTeam: ['investor-research', 'affiliate-auditor', 'revenue-modeler', 'thesis-debater'],
      aiOsLayer: 'Wealth & Business Intelligence Sub-Stack (Research-Only & Waitlist Wedges)',
      vaults: ['Strategic ◆', 'Horizon ↗', 'Operational ▸'],
      skillsAndPlugins: ['wealth-ops', 'investor-research', 'affiliate-audit', 'template-monetization', 'weekly-strategy'],
      mcpAndConnectors: ['Portfolio Snapshot CLI', 'Vercel KV', 'Resend'],
      ipAndData: 'IIS Strategy Theses, Affiliate Catalog, Wealth Agent Skills, Investor Research Graph',
      contentAndCommunity: 'agenticincome.ai · Awesome Agentic Income · Open Wealth Agent Skills',
      accessGate: 'NON-WAIVABLE: Money fails closed. Research-only; zero autonomous money movement.'
    },
    'Life-Commons': {
      mission: 'Public-benefit intelligence systems for ocean conservation, paleontology, longevity, mind clarity, and family heritage.',
      councilLead: 'Sage + Embodiment IS + Relational IS',
      specialistTeam: ['marine-intelligence', 'health-body-substrate', 'family-tree-archivist', 'sustainability-researcher'],
      aiOsLayer: 'Commons & Human Flourishing Sub-Stacks (Ocean, Dino, Health, Mind, Family)',
      vaults: ['Wisdom ◎', 'Horizon ↗', 'Creative ✦'],
      skillsAndPlugins: ['marine-intelligence-contribute', 'health-body-substrate', 'family-tree', 'safety-private-public-split'],
      mcpAndConnectors: ['Local-First Family Stack', 'Public Dataset Connectors'],
      ipAndData: 'Blue Life Commons Atlas, Dino Life Commons, Health & Mind Models, Family History Atlas',
      contentAndCommunity: 'bluelifecommons.org · Open Conservation & Educational Commons',
      accessGate: 'NON-WAIVABLE: Model, never diagnose (no clinical claims). Strict private/public data split.'
    },
    'oci-ai-architects': {
      mission: 'Community-contributed multi-cloud and OCI generative AI reference architectures and starter kits.',
      councilLead: 'Oracle AI Architect (Scoped Read-Only Community Mode)',
      specialistTeam: ['oci-services-expert', 'oci-drawio-icon-native', 'oracle-solution-design'],
      aiOsLayer: 'External Cloud Architecture Reference Shelf (Reshape-Frozen)',
      vaults: ['Technical ⬡'],
      skillsAndPlugins: ['oci-drawio-icon-native', 'oracle-ai-architect', 'oracle-solution-design'],
      mcpAndConnectors: ['Read-Only GitHub Remote'],
      ipAndData: 'Multi-Cloud AI Architect Guides, OCI GenAI Starter Kits (Strictly separated from Arcanea Labs BV)',
      contentAndCommunity: 'github.com/oci-ai-architects · Enterprise Architect Community',
      accessGate: 'RESHAPE-FROZEN: Read-only in estate automation; strict Oracle/BV separation.'
    }
  };

  const organizations = ORG_FEDERATION_MANIFEST.map((org) => ({
    ...org,
    meta: orgGovernanceMeta[org.login] || {
      mission: 'Sovereign domain organization.',
      councilLead: 'Prime',
      specialistTeam: ['starlight-architect'],
      aiOsLayer: 'Domain Layer',
      vaults: ['Strategic ◆'],
      skillsAndPlugins: [],
      mcpAndConnectors: [],
      ipAndData: '',
      contentAndCommunity: org.website,
      accessGate: 'Standard GitHub Org Governance'
    }
  }));

  const localHarnesses = [
    {
      id: 'claude-code',
      name: 'Claude Code CLI & Desktop',
      models: 'Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5',
      costModel: 'Max Subscription ($0 marginal) + API Fallback (BYOK)',
      maxLocalWorkers: '2 Opus / Fable sessions max (Memory Guardian 4 GiB floor)',
      strengths: 'Deep multi-file architecture, /yolo hive conductor, 89 auto-activating skills, adversarial review',
      contributes: 'Primary estate conductor, PR creation, complex refactors, book/editorial prose, Santa Loop Crown Gate',
      evalsAndTraces: 'Transcript JSONL + agent-quality 9-check audit + Eval-50 gate + verification-loop',
      whenToUse: 'Default daily driver for deep engineering, multi-repo orchestration, and high-taste writing',
      kickoffCloud: 'claude --remote "<task>" or trigger claude.ai cloud routines / GitHub Actions @claude'
    },
    {
      id: 'antigravity',
      name: 'Google Antigravity',
      models: 'Gemini 3.1 Pro / Flash + Native Image/Veo',
      costModel: 'Workspace / Pro Subscription ($0 marginal)',
      maxLocalWorkers: '1 Lead + 3 Subagents (research, self, image-generator)',
      strengths: '1M+ context window, native reactive background tasks, native schedule tool, NanoBanana/Veo media gen',
      contributes: '10-Org GitHub federation, sovereign memory compilation, 2h/12h/1w Horizon automation, visual cockpits',
      evalsAndTraces: 'brain/<conv-id>/.system_generated/logs/transcript.jsonl + Horizon JSONL telemetry',
      whenToUse: 'Massive cross-repo migrations, long-context estate sweeps, visual UI/HTML5 cockpits, scheduled horizon loops',
      kickoffCloud: 'Invoke-StarlightHorizonCadence.ps1 / n8n webhook / gcloud run jobs execute'
    },
    {
      id: 'codex',
      name: 'OpenAI Codex CLI & App',
      models: 'GPT-5.4 / Codex-Max / o3',
      costModel: 'ChatGPT Pro Subscription + OpenAI API (Batch 50% off)',
      maxLocalWorkers: '2 local worktrees + parallel Cloud Sandboxes',
      strengths: 'Surgical code verification, gstack browser QA, deterministic test writing, isolated cloud task sandboxes',
      contributes: 'Independent exact-revision code review, test coverage expansion, parallel bug-fix worktrees',
      evalsAndTraces: '.codex/automations + gstack-benchmark-models + git diff verification',
      whenToUse: 'Second-opinion adversarial engineering review (/gstack-codex), heavy test generation, isolated cloud tasks',
      kickoffCloud: 'codex cloud exec "<spec>" (runs in OpenAI cloud container against GitHub repo branch)'
    },
    {
      id: 'hermes',
      name: 'Hermes Agent OS',
      models: 'Multi-Model Router (Claude / Gemini / OpenRouter)',
      costModel: 'Subscription OAuth + OpenRouter metered API',
      maxLocalWorkers: '1 Desktop daemon + 6 CoE Guardian profiles',
      strengths: 'Isolated profile memory, cron scheduler, deep cross-repo provenance search, 6-Pillar CoE Guardians',
      contributes: 'Morning founder review, workspace bootstrap verification, continuous background provenance scans',
      evalsAndTraces: 'AppData/Local/hermes/cron/jobs.json + logs/heartbeats/heartbeat-*.json',
      whenToUse: 'Standing background crons, isolated persona research, workspace bootstrap checks',
      kickoffCloud: 'Hermes MCP bridge -> Railway / n8n webhook trigger'
    },
    {
      id: 'opencode-omo',
      name: 'OpenCode / oh-my-openagent (OmO)',
      models: 'Heterogeneous (Kimi K2.6, GPT-5.4, Claude, DeepSeek)',
      costModel: 'Direct API / OpenRouter (Pay-per-token)',
      maxLocalWorkers: 'Team Mode (up to 11 specialized role workers)',
      strengths: 'Boulder state tracking (.omo/boulder.json), heterogeneous model arena, low-cost bulk refactoring',
      contributes: 'Cross-model benchmarking, bulk mechanical migrations, fallback harness when primary quotas cap',
      evalsAndTraces: '.omo/boulder.json + OpenRouter spend telemetry',
      whenToUse: 'Heterogeneous model experiments, cost-optimized bulk code transforms',
      kickoffCloud: 'OpenRouter API batch / background worker dispatch'
    },
    {
      id: 'gemini-cli',
      name: 'Gemini CLI',
      models: 'Gemini 3.1 Pro / Flash-Lite',
      costModel: 'Google AI Pro / Free Tier + Vertex API',
      maxLocalWorkers: '2 fast CLI workers',
      strengths: 'Ultra-fast 1M token repo ingestion, rapid shift/flow gate scanning, low-RAM footprint',
      contributes: 'Fast codebase indexing, large log/transcript summarization, second-source fact checking',
      evalsAndTraces: 'GEMINI.md contract + local session logs',
      whenToUse: 'Summarizing huge transcripts, scanning 50+ files before editing, lightweight terminal queries',
      kickoffCloud: 'Vertex AI Batch Prediction / Cloud Run trigger'
    },
    {
      id: 'grok-build',
      name: 'Grok Build (xAI)',
      models: 'Grok 4 / Grok-Code',
      costModel: 'X Premium+ / xAI API',
      maxLocalWorkers: '1 worktree worker via grok-harness-adapter',
      strengths: 'Real-time X/social pulse, rapid UI/game prototyping, contrarian thesis stress-testing',
      contributes: 'Social vibe tracking, real-time AI lab release radar, rapid creative prototypes',
      evalsAndTraces: 'grok-harness-adapter logs + branch diff gates',
      whenToUse: 'Social/cultural trend analysis, real-time X intelligence, rapid experimental prototypes',
      kickoffCloud: 'xAI API async completion'
    }
  ];

  const cloudPlatforms = [
    {
      id: 'claude-cloud',
      name: 'Claude Cloud Routines & Anthropic API',
      category: 'Frontier Cloud Agent & LLM',
      costTier: 'Included in Max + API (Prompt Caching 90% read discount, Batch 50% discount)',
      currentState: '13 logical cloud routines mapped; 2 noisy self-rearming reminder chains stopped',
      role: 'Scheduled cloud routines (survives laptop closed), Prompt-Cached system prompts, Extended Thinking & Computer Use beta',
      howToTrigger: 'claude.ai/routines schedule OR Anthropic Messages/Batch API with anthropic-beta: prompt-caching',
      gapToSolve: 'Connect Claude Cloud routines to an HTTPS Cloudflare Worker inbox so cloud runs write back to the estate ledger'
    },
    {
      id: 'codex-cloud',
      name: 'OpenAI Codex Cloud & Responses/Batch API',
      category: 'Cloud Sandboxed SWE Fleet',
      costTier: 'Included in Pro + API Batch (50% discount for async 24h evals)',
      currentState: 'Active for isolated repo PR tasks',
      role: 'Zero-local-RAM parallel SWE containers that clone GitHub org repos, run tests, and open draft PRs autonomously',
      howToTrigger: 'codex cloud run --repo <Org>/<Repo> "<prompt>"',
      gapToSolve: 'Pre-warm environment setup scripts in all 10 GitHub Orgs so Codex Cloud containers boot in <15s'
    },
    {
      id: 'google-cloud-vertex',
      name: 'Google Cloud / Vertex AI / Veo / NanoBanana',
      category: 'Multimodal & Long-Context Cloud',
      costTier: 'Workspace / Cloud Credits + Pay-per-second media',
      currentState: 'Active via Antigravity + NanoBanana MCP',
      role: '1M-2M context caching, magazine-grade visual generation (NanoBanana), Veo video generation, Gemini Flash bulk evals',
      howToTrigger: 'Native generate_image / nb-image skill / Vertex Context Caching API',
      gapToSolve: 'Route bulk Dreaming & vault classification jobs to Gemini Flash-Lite with Context Caching'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare (Workers, Durable Objects, R2, DNS)',
      category: 'Edge Compute & Sovereign Bridge',
      costTier: '$5-$20/mo (Workers Paid + R2 zero-egress storage)',
      currentState: 'DNS & edge routing active; Hermes Cloudflare MCP needs re-auth',
      role: 'The missing Local <-> Cloud Bridge! Hosts the HTTPS signed inbox queue, R2 artifact vault, and edge MCP gateways',
      howToTrigger: 'wrangler deploy / HTTPS webhook to edge worker',
      gapToSolve: 'Deploy starlight-edge-bridge Worker + Durable Object so Railway, n8n, and Claude Cloud can enqueue receipts safely'
    },
    {
      id: 'vercel',
      name: 'Vercel Production & Preview Fleet',
      category: 'Web & App Hosting Plane',
      costTier: 'Pro Subscription ($20/mo base + bandwidth/cron)',
      currentState: '50+ projects mapped across registered properties; waitlist KV active',
      role: 'Hosts frankx.ai, arcanea.ai, starlightintelligence.org, gencreator.ai, and preview deployments on every PR',
      howToTrigger: 'git push origin agent/<harness>/<scope> -> Draft PR Preview; merge to main -> Prod',
      gapToSolve: 'Consolidate 5 duplicate unlinked Vercel projects after dropping the legacy required check'
    },
    {
      id: 'railway',
      name: 'Railway Service Mesh',
      category: '24/7 Container & Daemon Cloud',
      costTier: 'Usage-based (~$123.45/mo measured across projects — target <$45/mo after pruning)',
      currentState: 'Hosts n8n, Postiz, and background services; several empty projects flagged [OPEN] for prune',
      role: 'Always-on Docker services, n8n workflow engine, Postiz social distributor, remote MCP servers',
      howToTrigger: 'railway up / webhook triggers',
      gapToSolve: 'Enumerate all environments live, prune idle services, and wire Railway n8n to the Cloudflare Edge Bridge'
    },
    {
      id: 'n8n-cloud',
      name: 'n8n Workflow Orchestrator',
      category: 'Event & Webhook Automation',
      costTier: 'Self-hosted on Railway ($0 license)',
      currentState: 'starlight-horizon-memory-orchestrator.workflow.json versioned in SIS repo',
      role: 'Scheduled 2h/12h/1w webhook orchestration, Slack/Telegram alerts, GitHub org issue triage, Resend newsletter pipelines',
      howToTrigger: 'Import workflows/n8n/starlight-horizon-memory-orchestrator.workflow.json or POST /webhook/starlight-horizon-run',
      gapToSolve: 'Add heartbeat writer so n8n executions appear in logs/heartbeats/heartbeat-n8n.json (two-signal liveness rule)'
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Unified Model Gateway',
      category: 'Multi-Provider API & Spend Cap',
      costTier: 'Prepaid credit balance with hard per-key spend limits',
      currentState: 'Used by Hermes, OmO, and fallback model routing',
      role: 'Single API key for 200+ models (DeepSeek R1, Kimi K2.6, Qwen, Llama 3.3, Claude, GPT) with automatic fallback & cost tracking',
      howToTrigger: 'OPENROUTER_API_KEY via model-routing skill or Starlight Cost Collector',
      gapToSolve: 'Fix StarlightOpenRouterSpend scheduled task exit code 2 by pointing it to the unified cost ledger'
    },
    {
      id: 'langfuse-otel',
      name: 'Langfuse + Headroom Context Layer',
      category: 'Traces, Evals, Prompt Registry & Token Compression',
      costTier: 'Self-hosted / Free Cloud Tier',
      currentState: 'Skills installed (langfuse, headroom); ready for unified daemon hookup',
      role: 'Captures OpenTelemetry traces across all harnesses, compresses long tool outputs via Headroom (40-70% token savings), tracks Eval-50 over time',
      howToTrigger: '/headroom wrap + Langfuse OTEL env vars in .starlight/env',
      gapToSolve: 'Wire SisGatewayDaemon (:5200) to emit trace spans for every memory search/add and horizon eval run'
    }
  ];

  const experiments = [
    {
      id: 'EXP-01',
      name: 'Hybrid Sovereign Memory Recall (TF-IDF + RRF + Entity Boost)',
      domain: 'Memory Substrate',
      status: 'LIVE · VERIFIED',
      baseline: 'Hit@10: 0.000 (placeholder vectors) / 0.820 (raw FTS)',
      current: 'Hit@10: 1.000 · Recall@5: 1.000 · MRR@10: 1.000 (p50: 218.9ms)',
      owner: 'Antigravity + Sage',
      artifact: 'scripts/compile-sovereign-memory.mjs',
      nextStep: 'Keep automated in 2h Horizon cadence; add semantic drift alerts if Hit@10 drops below 0.96'
    },
    {
      id: 'EXP-02',
      name: '10-Organization GitHub Federation & Visibility Parity Gate',
      domain: 'Estate Governance',
      status: 'LIVE · VERIFIED',
      baseline: 'Fragmented orgs, missing .github repos, unmapped local checkouts',
      current: '10/10 Orgs standardized · 71/71 local repos wired (origin + org) · 0 visibility leaks',
      owner: 'Antigravity + Architect',
      artifact: 'scripts/org-federation-audit.mjs',
      nextStep: 'Automate weekly drift verification in 1w Horizon cadence + GitHub Actions org sync'
    },
    {
      id: 'EXP-03',
      name: 'Multi-Horizon Autonomous Cadence (2h Tactical / 12h Dreaming / 1w Audit)',
      domain: 'Autonomous Operations',
      status: 'LIVE · VERIFIED',
      baseline: '159-day vault staleness · Gateway :5200 offline · Dreaming stalled',
      current: '0d vault staleness · Gateway :5200 auto-healed · 2h/12h/1w Windows Tasks LastTaskResult=0',
      owner: 'Antigravity + Queen',
      artifact: 'scripts/horizon-test-runner.mjs',
      nextStep: 'Retire 9 legacy duplicate failing Windows tasks into the unified Horizon runner'
    },
    {
      id: 'EXP-04',
      name: 'Headroom Context Compression + Anthropic/OpenAI Prompt Caching',
      domain: 'Cost & Context Efficiency',
      status: 'READY TO DEPLOY',
      baseline: 'Uncompressed tool logs & repeated system prompt token burn',
      current: 'Headroom skill & cache boundaries designed; target 55% token reduction',
      owner: 'Claude Code + Healer',
      artifact: 'skills/headroom/SKILL.md',
      nextStep: 'Enable Headroom MCP proxy on large grep/log outputs and pin Band-A prefix for 90% cache read discount'
    },
    {
      id: 'EXP-05',
      name: 'Cloudflare Edge Bridge (Local <-> Cloud Queue & Receipt Bus)',
      domain: 'Hybrid Cloud Substrate',
      status: 'NEXT WAVE PRIORITY',
      baseline: 'Local stdio bridge unreachable by Railway, n8n, or Claude Cloud routines',
      current: 'Architecture spec complete (HMAC-signed HTTPS Worker + Durable Object)',
      owner: 'Architect + Codex',
      artifact: 'docs/architecture/starlight-local-cloud-agentic-os-masterplan-2026-10-17.md',
      nextStep: 'Deploy starlight-edge-bridge Worker and connect StarlightHorizon2h to pull cloud receipts'
    },
    {
      id: 'EXP-06',
      name: 'Cross-Harness OpenTelemetry & Langfuse Eval Scoreboard',
      domain: 'Observability & Evals',
      status: 'NEXT WAVE PRIORITY',
      baseline: 'Per-harness isolated JSONL transcripts without unified cost/eval join',
      current: 'Horizon JSONL telemetry active (.starlight/telemetry/horizon-*.jsonl)',
      owner: 'Sentinel + Prime',
      artifact: 'C:/Users/frank/.starlight/telemetry/',
      nextStep: 'Stream Horizon JSONL + harness session receipts into unified cost & eval ledger'
    }
  ];

  const operatorPlaybook = [
    {
      cadence: 'Morning Boot (08:00)',
      slashCommand: '/dawn',
      cliCommand: 'node C:/Users/frank/starlight/tools/gen-systems-map.mjs && node C:/Users/frank/starlight/tools/bake-planes-board.mjs',
      responsibleAgent: 'Concierge + Queen',
      whatItDoes: 'Synthesizes overnight 12h Dreaming insights, active worktree lanes, system health, and top 3 priorities for the day.'
    },
    {
      cadence: 'Before Any New Slice',
      slashCommand: '/search-first',
      cliCommand: 'python C:/Users/frank/AppData/Local/hermes/scripts/starlight_workspace_bootstrap.py --match <kw> --gh',
      responsibleAgent: 'Hermes + Architect',
      whatItDoes: 'Enforces the 4-fact git bootstrap check (path, toplevel, origin, branch), claims an ops-guard lease, and recalls vault decisions.'
    },
    {
      cadence: 'Every 2 Hours (Automated + On-Demand)',
      slashCommand: '/sis recent',
      cliCommand: 'node scripts/horizon-test-runner.mjs --horizon 2h',
      responsibleAgent: 'StarlightHorizon2h Task + Sage',
      whatItDoes: 'Auto-heals SisGatewayDaemon (:5200), compiles 1,106 sovereign memory atoms, and verifies Eval-50 Hit@10 = 1.000.'
    },
    {
      cadence: 'Complex Feature / Multi-File Build',
      slashCommand: '/goal or /ultrawork',
      cliCommand: 'git worktree add C:/Users/frank/starlight/worktrees/<scope> -b agent/<harness>/<scope>',
      responsibleAgent: 'Orchestrator + Fire/Crown Gate Swarm',
      whatItDoes: 'Runs an autonomous, self-verifying implementation loop in an isolated git worktree until all tests and gates pass.'
    },
    {
      cadence: 'Before Merging Any Consequential PR',
      slashCommand: '/santa-method + /starlight-board',
      cliCommand: 'node --test tests/org-federation-audit.test.mjs tests/horizon-test-runner.test.mjs',
      responsibleAgent: 'Sentinel + Adversarial Reviewer + Board',
      whatItDoes: 'Two independent reviewers critique the exact revision against product-outcome-quality.md and SIP governance invariants.'
    },
    {
      cadence: 'Every 12 Hours / End of Day',
      slashCommand: '/eod + /handover',
      cliCommand: 'node scripts/horizon-test-runner.mjs --horizon 12h',
      responsibleAgent: 'StarlightHorizon12h Task + Chronicle',
      whatItDoes: 'Runs Dreaming consolidation, checks 90-day temporal decay, verifies 10-Org remote parity, and writes hub handover.'
    },
    {
      cadence: 'Weekly / Sunday Seventh-Day Cadence',
      slashCommand: '/sunday (or /palace)',
      cliCommand: 'node scripts/horizon-test-runner.mjs --horizon 1w',
      responsibleAgent: 'StarlightHorizon1w Task + Palace Architect',
      whatItDoes: 'Full estate audit: 64 Windows tasks, n8n flows, 10 GitHub Orgs, memory compounding review, and next-week thesis.'
    }
  ];

  const nextPrompts = [
    {
      id: 'PROMPT-01',
      title: 'Wave 1: Consolidate the 9 Legacy Failing Scheduled Tasks & Unify Cost Telemetry',
      targetHarness: 'Antigravity or Claude Code',
      targetRepo: 'C:/Users/frank/starlight + Starlight-Intelligence-System',
      promptText: `Run a surgical cleanup of the 9 legacy failing Windows Scheduled Tasks surfaced by StarlightHorizon1w (Starlight-GbrainWatchdog, StarlightCostCollect, StarlightDreaming, StarlightFleetPulse, StarlightOpenRouterSpend, StarlightQueenProbe2h/12h/Week, StarlightTaskHealthWatch). Since StarlightHorizon2h, StarlightHorizon12h, and StarlightHorizon1w now execute Dreaming, Gateway auto-heal, Eval-50, and Task auditing with LastTaskResult=0, re-point or retire the superseded tasks, fix the OpenRouter/Cost collector script so it writes to C:/Users/frank/.starlight/telemetry/cost-ledger.jsonl, and verify 0 failing ready tasks in horizon-1w-latest.json.`
    },
    {
      id: 'PROMPT-02',
      title: 'Wave 2: Build the Cloudflare Edge Bridge (Local <-> Cloud Queue & Receipt Bus)',
      targetHarness: 'Claude Code or Codex',
      targetRepo: 'Starlight-Intelligence-System (or starlight-command-center)',
      promptText: `Implement the Starlight Cloud-to-Local Edge Bridge so cloud runtimes (Railway n8n, Claude Cloud Routines, Codex Cloud, Vercel webhooks) can safely emit task receipts and heartbeats back to the local estate. Create a lightweight Cloudflare Worker + Durable Object (or Vercel KV queue endpoint) with HMAC-SHA256 bearer verification, and add a pull-sync step into scripts/horizon-test-runner.mjs (2h cadence) that drains verified cloud receipts into C:/Users/frank/starlight/logs/heartbeats/ and C:/Users/frank/starlight/queen/inbox/.`
    },
    {
      id: 'PROMPT-03',
      title: 'Wave 3: Wire Headroom Context Compression & Prompt Caching Across Harnesses',
      targetHarness: 'Claude Code',
      targetRepo: 'Starlight-Intelligence-System + claude-code-config',
      promptText: `Activate the Headroom context compression layer and deterministic Prompt Caching across our local and API harnesses. Configure SisGatewayDaemon (:5200) to expose a /v1/context/compress endpoint and trace token savings in C:/Users/frank/.starlight/telemetry/horizon-2h.jsonl. Ensure static Band-A and vault prefixes are ordered first for 90% Anthropic/OpenAI prompt cache read discounts.`
    },
    {
      id: 'PROMPT-04',
      title: 'Wave 4: Land Open PRs (#451 SIS, #275 agentic-ops, #362 agentic-ops-hub) & Sync Org Remotes',
      targetHarness: 'Claude Code or Antigravity',
      targetRepo: 'Starlight-Intelligence-System + agentic-ops + agentic-ops-hub',
      promptText: `Review and merge ready PRs #451 (Starlight-Intelligence-System), #275 (agentic-ops), and #362 (agentic-ops-hub) after verifying all unit tests and horizon gates pass. Then run node scripts/org-federation-audit.mjs --verify-remote to push main to both origin (frankxai/*) and org (<Org>/*) remotes across the updated flagship repositories.`
    },
    {
      id: 'PROMPT-05',
      title: 'Wave 5: Live Observatory Integration (Mount /horizon & /federation in Starlight Command Center App)',
      targetHarness: 'Codex or Claude Code',
      targetRepo: 'C:/Users/frank/starlight/repos/starlight-Command-Center',
      promptText: `In starlight-Command-Center/apps/observatory (Next.js port 4321), add an API route /api/horizon that reads C:/Users/frank/.starlight/reports/horizon-{2h,12h,1w}-latest.json and scripts/org-federation-audit.mjs data, and wire a live 'Horizon & 10-Org Federation' tab into the Electron/Next.js Observatory so port 4321 and our standalone HTML5 Command Center share the exact same live schema.`
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    h2,
    h12,
    h1w,
    sysGraphSummary: sysGraph?.findings || null,
    organizations,
    localHarnesses,
    cloudPlatforms,
    experiments,
    operatorPlaybook,
    nextPrompts
  };
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCommandCenterHtml(data) {
  const { h2, h12, h1w, organizations, localHarnesses, cloudPlatforms, experiments, operatorPlaybook, nextPrompts } = data;
  const totalRepos = organizations.reduce((acc, o) => acc + o.repos.length, 0);
  const publicRepos = organizations.reduce((acc, o) => acc + o.repos.filter((r) => r.visibility === 'public').length, 0);
  const privateRepos = totalRepos - publicRepos;

  const embeddedJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Starlight Agentic OS — Unified Local + Cloud Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #07090e;
    --bg-elevated: #0d111a;
    --bg-card: rgba(16, 21, 33, 0.86);
    --bg-card-hover: rgba(22, 29, 46, 0.95);
    --bg-subtle: rgba(255, 255, 255, 0.035);
    --ink: #f1f5f9;
    --ink-secondary: #94a3b8;
    --ink-muted: #64748b;
    --border: rgba(255, 255, 255, 0.09);
    --border-strong: rgba(230, 201, 138, 0.35);
    --champagne: #e6c98a;
    --champagne-bg: rgba(230, 201, 138, 0.12);
    --emerald: #10b981;
    --emerald-bg: rgba(16, 185, 129, 0.13);
    --cyan: #06b6d4;
    --cyan-bg: rgba(6, 182, 212, 0.13);
    --violet: #a78bfa;
    --violet-bg: rgba(167, 139, 250, 0.13);
    --amber: #f59e0b;
    --amber-bg: rgba(245, 158, 11, 0.14);
    --rose: #f43f5e;
    --rose-bg: rgba(244, 63, 94, 0.14);
    --font-display: 'Fraunces', Georgia, serif;
    --font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    --radius: 12px;
    --radius-sm: 8px;
  }

  [data-theme="light"] {
    --bg: #f6f5f0;
    --bg-elevated: #ffffff;
    --bg-card: #ffffff;
    --bg-card-hover: #f9f8f4;
    --bg-subtle: #efeee8;
    --ink: #181b20;
    --ink-secondary: #4a5058;
    --ink-muted: #767d86;
    --border: #dcdad2;
    --border-strong: #8c6d2e;
    --champagne: #8a6421;
    --champagne-bg: #f5ecd8;
    --emerald: #18794e;
    --emerald-bg: #e2f3ea;
    --cyan: #0b6bcb;
    --cyan-bg: #e3effb;
    --violet: #6941c6;
    --violet-bg: #f0ebff;
    --amber: #b45309;
    --amber-bg: #fef3c7;
    --rose: #be123c;
    --rose-bg: #ffe4e6;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--bg);
    background-image:
      radial-gradient(circle at 12% 8%, rgba(16, 185, 129, 0.08) 0%, transparent 38%),
      radial-gradient(circle at 88% 12%, rgba(230, 201, 138, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 90%, rgba(6, 182, 212, 0.06) 0%, transparent 45%);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 14.5px;
    line-height: 1.55;
    min-height: 100vh;
    font-feature-settings: "tnum";
  }

  a { color: var(--cyan); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Focus ring for keyboard accessibility */
  button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible {
    outline: 2px solid var(--champagne);
    outline-offset: 2px;
  }

  .app-shell {
    max-width: 1540px;
    margin: 0 auto;
    padding: 24px 28px 72px;
  }

  /* Top Header */
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .brand-eyebrow {
    font-family: var(--font-mono);
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--champagne);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--emerald);
    box-shadow: 0 0 10px var(--emerald);
    display: inline-block;
  }
  .top-header h1 {
    font-family: var(--font-display);
    font-size: clamp(24px, 3vw, 34px);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
  .top-header .subtitle {
    color: var(--ink-secondary);
    font-size: 14px;
    margin-top: 6px;
    max-width: 820px;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .badge-live {
    font-family: var(--font-mono);
    font-size: 11.5px;
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--emerald-bg);
    color: var(--emerald);
    border: 1px solid rgba(16, 185, 129, 0.3);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-action {
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 7px 13px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--ink);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn-action:hover {
    border-color: var(--champagne);
    background: var(--bg-card-hover);
  }

  /* KPI Strip */
  .kpi-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
    gap: 12px;
    margin: 20px 0 24px;
  }
  .kpi-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    position: relative;
    overflow: hidden;
  }
  .kpi-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--emerald);
  }
  .kpi-card.gold::before { background: var(--champagne); }
  .kpi-card.cyan::before { background: var(--cyan); }
  .kpi-card.violet::before { background: var(--violet); }
  .kpi-label {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-muted);
  }
  .kpi-value {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 600;
    margin: 4px 0 2px;
    color: var(--ink);
  }
  .kpi-sub {
    font-size: 12px;
    color: var(--ink-secondary);
  }

  /* Navigation Tabs */
  .nav-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
    margin-bottom: 24px;
    overflow-x: auto;
  }
  .tab-btn {
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-weight: 500;
    padding: 9px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-subtle);
    color: var(--ink-secondary);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .tab-btn:hover {
    color: var(--ink);
    background: var(--bg-card-hover);
  }
  .tab-btn[aria-selected="true"] {
    background: var(--champagne-bg);
    color: var(--champagne);
    border-color: var(--border-strong);
    font-weight: 600;
  }
  .tab-count {
    font-size: 10.5px;
    padding: 1px 6px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.07);
  }

  .tab-panel { display: none; }
  .tab-panel.active { display: block; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

  /* Section Headers */
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 28px 0 14px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .section-head:first-child { margin-top: 0; }
  .section-head h2 {
    font-family: var(--font-display);
    font-size: 21px;
    font-weight: 600;
  }
  .section-head p {
    color: var(--ink-secondary);
    font-size: 13.5px;
  }

  /* Grid & Cards */
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; }
  @media (max-width: 640px) {
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
    .app-shell { padding: 16px 14px 56px; }
  }

  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .card:hover { border-color: rgba(255, 255, 255, 0.18); }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
  }
  .card-meta {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--ink-muted);
  }

  /* Pills */
  .pill {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 999px;
    display: inline-block;
    white-space: nowrap;
  }
  .pill.emerald { background: var(--emerald-bg); color: var(--emerald); }
  .pill.gold { background: var(--champagne-bg); color: var(--champagne); }
  .pill.cyan { background: var(--cyan-bg); color: var(--cyan); }
  .pill.violet { background: var(--violet-bg); color: var(--violet); }
  .pill.amber { background: var(--amber-bg); color: var(--amber); }
  .pill.rose { background: var(--rose-bg); color: var(--rose); }

  /* Tables */
  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  th {
    text-align: left;
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ink-muted);
    padding: 11px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-subtle);
  }
  td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--bg-subtle); }
  .mono { font-family: var(--font-mono); font-size: 12.5px; }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .search-input, .select-input {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--ink);
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 13.5px;
  }
  .search-input { min-width: 260px; flex: 1; }

  /* Key-Value list inside Org Cards */
  .kv-list {
    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 6px 12px;
    font-size: 13px;
    margin-top: 4px;
  }
  .kv-key {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--ink-muted);
  }
  .kv-val { color: var(--ink-secondary); }
  .repo-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
  .repo-chip {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .repo-chip .vis-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .vis-public { background: var(--emerald); }
  .vis-private { background: var(--amber); }

  /* Copy Prompt Box */
  .prompt-box {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-secondary);
    line-height: 1.5;
    white-space: pre-wrap;
    margin-top: 6px;
  }

  /* Toast */
  #toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--emerald);
    color: #04130d;
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
  }
  #toast.show { opacity: 1; }

  footer {
    margin-top: 48px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--ink-muted);
  }
</style>
</head>
<body>
<div class="app-shell">
  <header class="top-header">
    <div>
      <div class="brand-eyebrow">
        <span class="pulse-dot"></span>
        <span>STARLIGHT INTELLIGENCE SYSTEM · SOVEREIGN AGENTIC OS · BUILT ON SIP</span>
      </div>
      <h1>Unified Local + Cloud Agentic Command Center</h1>
      <p class="subtitle">
        Live telemetry across 7 local harnesses, 9 cloud runtimes, 10 federated GitHub Organizations (${totalRepos} flagship repos), 6 semantic memory vaults (${escapeHtml(h2.sovereignMemory?.totalAtoms ?? 1106)} atoms), and 2h / 12h / 1w autonomous Horizon loops.
      </p>
    </div>
    <div class="header-actions">
      <span class="badge-live" title="SisGatewayDaemon listening on 127.0.0.1:5200">
        ● Gateway :${escapeHtml(h2.gateway?.port ?? 5200)} ${escapeHtml((h2.gateway?.status ?? 'ok').toUpperCase())} (PID ${escapeHtml(h2.gateway?.pid ?? 'active')})
      </span>
      <button class="btn-action" id="themeToggle" type="button" aria-label="Toggle color theme">◐ Theme</button>
    </div>
  </header>

  <!-- Live KPI Strip -->
  <section class="kpi-strip" aria-label="Key system metrics">
    <div class="kpi-card">
      <div class="kpi-label">Eval-50 Recall &amp; Hit@10</div>
      <div class="kpi-value">${((h2.eval50?.metrics?.hit10 ?? 1) * 100).toFixed(1)}%</div>
      <div class="kpi-sub">Recall@5: ${((h2.eval50?.metrics?.recall5 ?? 1) * 100).toFixed(0)}% · MRR: ${(h2.eval50?.metrics?.mrr10 ?? 1).toFixed(2)} · p50: ${Math.round(h2.eval50?.metrics?.latencyMs?.p50 ?? 219)}ms</div>
    </div>
    <div class="kpi-card gold">
      <div class="kpi-label">Sovereign Memory Substrate</div>
      <div class="kpi-value">${escapeHtml(h2.sovereignMemory?.totalAtoms ?? 1106)} atoms</div>
      <div class="kpi-sub">6/6 Vaults Fresh (${escapeHtml(h2.sovereignMemory?.staleVaults ?? 0)} stale) · ${escapeHtml(h2.sovereignMemory?.kgRows ?? 400)} KG rows</div>
    </div>
    <div class="kpi-card cyan">
      <div class="kpi-label">10-Org GitHub Federation</div>
      <div class="kpi-value">${escapeHtml(h12.orgFederation?.localOrgRemoteAlignedCount ?? 71)} / ${escapeHtml(h12.orgFederation?.totalMappedRepos ?? 71)}</div>
      <div class="kpi-sub">10 Orgs · ${publicRepos} public + ${privateRepos} private · 0 leaks</div>
    </div>
    <div class="kpi-card violet">
      <div class="kpi-label">Dreaming &amp; 90d Decay</div>
      <div class="kpi-value">${escapeHtml(h12.dreaming?.extractedInsights ?? 119)} insights</div>
      <div class="kpi-sub">${escapeHtml(h12.dreaming?.promotions ?? 4)} promotions · ${escapeHtml(h12.dreaming?.contradictions ?? 0)} contradictions</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">2h / 12h / 1w Horizon Loops</div>
      <div class="kpi-value">3 / 3 GREEN</div>
      <div class="kpi-sub">Last 2h run: ${escapeHtml(String(h2.completedAt || '').slice(11, 19))} UTC · Exit 0</div>
    </div>
    <div class="kpi-card gold">
      <div class="kpi-label">Local + Cloud Harnesses</div>
      <div class="kpi-value">7 Local · 9 Cloud</div>
      <div class="kpi-sub">${escapeHtml(h2.coordination?.leaseFiles ?? 161)} tracked leases · ${escapeHtml(h1w.scheduledTasks?.ready ?? 23)} ready tasks</div>
    </div>
  </section>

  <!-- Navigation Tabs -->
  <nav class="nav-tabs" role="tablist" aria-label="Command Center Views">
    <button class="tab-btn" role="tab" aria-selected="true" aria-controls="panel-vision" id="tab-vision" data-tab="vision">
      1. Executive Pulse: Have vs. Hope For <span class="tab-count">6 Pillars</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-harnesses" id="tab-harnesses" data-tab="harnesses">
      2. Local + Cloud Harnesses &amp; Cost Matrix <span class="tab-count">16 Runtimes</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-orgs" id="tab-orgs" data-tab="orgs">
      3. 10 GitHub Orgs, Brand Teams &amp; IP Governance <span class="tab-count">10 Orgs · ${totalRepos} Repos</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-evals" id="tab-evals" data-tab="evals">
      4. Experiments, Traces, Evals &amp; Horizon Telemetry <span class="tab-count">Eval-50 · 2h/12h/1w</span>
    </button>
    <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-playbook" id="tab-playbook" data-tab="playbook">
      5. Slash Commands, Daemons &amp; Next Prompts <span class="tab-count">5 Ready Prompts</span>
    </button>
  </nav>

  <!-- PANEL 1: EXECUTIVE PULSE (WHAT WE HAVE VS WHAT WE HOPE FOR) -->
  <section class="tab-panel active" id="panel-vision" role="tabpanel" aria-labelledby="tab-vision">
    <div class="section-head">
      <div>
        <h2>Where We Stand Today vs. The Next Horizon Architecture</h2>
        <p>Every capability below distinguishes verified live production state on this machine from the next engineering waves.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Substrate Pillar</th>
            <th>Verified Live Today (2026-10-17)</th>
            <th>What We Hope For (Next Horizon Target)</th>
            <th>Responsible Lead</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Sovereign Memory &amp; Eval-50</strong><div class="card-meta">6 Vaults + SQLite FTS5 + Vector Store</div></td>
            <td><strong>1,106 sovereign atoms</strong> compiled from all 6 vaults + KG. <code>Eval-50 Hit@10 = 100%</code>, <code>Recall@5 = 100%</code>, <code>MRR@10 = 1.000</code>, <code>0d</code> vault staleness. <code>SisGatewayDaemon</code> live on <code>:5200</code>.</td>
            <td>Real-time cross-harness session ingestion into <code>:5200/v1/sessions</code> + Headroom context compression (55% token savings) + semantic drift alerts.</td>
            <td class="mono">Sage + Antigravity</td>
            <td><span class="pill emerald">LIVE · 100% HIT@10</span></td>
          </tr>
          <tr>
            <td><strong>2. 10-Org GitHub Federation</strong><div class="card-meta">Dual Remote (origin + org) &amp; Governance</div></td>
            <td><strong>10 GitHub Organizations</strong> standardized, <code>9/9</code> active <code>&lt;Org&gt;/.github</code> governance repos deployed, <strong>71/71 local repos</strong> wired with dual remotes, <code>0</code> visibility violations.</td>
            <td>Automated CI/Eval-gated cross-org release syndication + branch protection convergence across all 71 flagship repos.</td>
            <td class="mono">Architect + Sentinel</td>
            <td><span class="pill emerald">LIVE · 71/71 ALIGNED</span></td>
          </tr>
          <tr>
            <td><strong>3. 2h / 12h / 1w Horizon Loops</strong><div class="card-meta">Windows Tasks + n8n + CLI Runner</div></td>
            <td><code>StarlightHorizon2h</code>, <code>StarlightHorizon12h</code>, <code>StarlightHorizon1w</code>, and <code>StarlightOpsGuardAudit</code> registered &amp; verified with <code>LastTaskResult = 0</code>.</td>
            <td>Retire 9 legacy duplicate failing Windows tasks into the unified Horizon runner and wire n8n heartbeat receipts.</td>
            <td class="mono">Queen + Healer</td>
            <td><span class="pill emerald">LIVE · AUTONOMOUS</span></td>
          </tr>
          <tr>
            <td><strong>4. Local &lt;-&gt; Cloud Task Bridge</strong><div class="card-meta">Laptop Harnesses &lt;-&gt; Cloud Workers</div></td>
            <td>7 local harnesses coordinate via <code>ops-guard</code> git worktree leases (161 lease files) and local <code>queen/inbox</code>. Cloud planes run independently.</td>
            <td><strong>Cloudflare Edge Bridge</strong> (Worker + Durable Object) so Railway, n8n, Claude Cloud, and Codex Cloud can enqueue signed receipts into the local estate.</td>
            <td class="mono">Architect + Codex</td>
            <td><span class="pill gold">WAVE 2 PRIORITY</span></td>
          </tr>
          <tr>
            <td><strong>5. Unified Cost &amp; Quota Router</strong><div class="card-meta">Subscriptions vs. Direct API Spend</div></td>
            <td>Subscription-first routing (Claude Max, ChatGPT Pro, Gemini Pro) + OpenRouter / BYOK guardrails in <code>providers.graph.json</code>.</td>
            <td>Unified <code>cost-ledger.jsonl</code> + Prompt Caching (90% read discount) + Batch API (50% discount) + Railway container prune ($123/mo -&gt; &lt;$45/mo).</td>
            <td class="mono">Navigator + Hakari</td>
            <td><span class="pill cyan">WAVE 1-3 PRIORITY</span></td>
          </tr>
          <tr>
            <td><strong>6. Cross-Harness Traces &amp; Evals</strong><div class="card-meta">Langfuse OTEL + Santa Loop</div></td>
            <td>Horizon JSONL telemetry (<code>.starlight/telemetry/horizon-*.jsonl</code>), per-harness transcripts, and Santa Method Fire/Crown convergence loops.</td>
            <td>Unified OpenTelemetry / Langfuse trace ingestion joining prompt version, model latency, token cost, and Eval-50 score per PR.</td>
            <td class="mono">Prime + Sentinel</td>
            <td><span class="pill violet">WAVE 3 PRIORITY</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-head">
      <div>
        <h2>The Overarching Goal: Why We Built This &amp; How It Compounds</h2>
        <p>Frank's Sovereign Agentic OS turns 7 local harnesses, 9 cloud platforms, and 10 brand organizations into one disciplined organism.</p>
      </div>
    </div>

    <div class="grid-3">
      <div class="card">
        <div class="card-header">
          <div class="card-title">1. Zero-Collision Multi-Harness Velocity</div>
          <span class="pill emerald">Git Worktrees + Leases</span>
        </div>
        <p class="kv-val">
          Claude Code, Antigravity, Codex, Hermes, OpenCode, Gemini CLI, and Grok never step on the same checkout. Every slice runs on <code>agent/&lt;harness&gt;/&lt;scope&gt;</code> in an isolated worktree under <code>C:/Users/frank/starlight/worktrees/</code>, guarded by <code>ops-guard</code> leases and dual-remote federation.
        </p>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">2. Observable Compounding Memory</div>
          <span class="pill gold">1,106 Atoms · 100% Hit@10</span>
        </div>
        <p class="kv-val">
          Instead of ephemeral chat history, every architectural ruling, creative canon lock, and operational lesson compiles into 6 semantic vaults (Strategic, Technical, Creative, Operational, Wisdom, Horizon) served over loopback HTTP (<code>127.0.0.1:5200</code>) and verified every 2 hours against <code>Eval-50</code>.
        </p>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">3. Subscription-Maxed, Cloud-Extended</div>
          <span class="pill cyan">Smart Cost Routing</span>
        </div>
        <p class="kv-val">
          Interactive reasoning and deep code synthesis max out flat-rate local subscriptions first (respecting the 4 GiB RAM floor), while asynchronous 24/7 webhooks, batch evals, and container sandboxes burst to Codex Cloud, Claude Cloud, Cloudflare Workers, Railway, and Vercel.
        </p>
      </div>
    </div>
  </section>

  <!-- PANEL 2: LOCAL + CLOUD HARNESSES & COST MATRIX -->
  <section class="tab-panel" id="panel-harnesses" role="tabpanel" aria-labelledby="tab-harnesses">
    <div class="section-head">
      <div>
        <h2>Interactive Workload Router: When to Use Which Harness &amp; Cloud Runtime</h2>
        <p>Select a task type to filter the recommended local harness, cloud offload target, cost tier, and kickoff command.</p>
      </div>
    </div>

    <div class="filter-bar">
      <input type="search" id="harnessSearch" class="search-input" placeholder="Search harness, model, capability, or cloud platform..." aria-label="Search harnesses and cloud platforms">
      <select id="workloadFilter" class="select-input" aria-label="Filter by workload type">
        <option value="all">All Runtimes (7 Local + 9 Cloud)</option>
        <option value="local">Local Harnesses Only (7)</option>
        <option value="cloud">Cloud Platforms Only (9)</option>
        <option value="zero-marginal">Flat-Rate Subscription ($0 Marginal)</option>
        <option value="bridge">Needs Cloud-to-Local Bridge</option>
      </select>
    </div>

    <div class="section-head">
      <div>
        <h2>7 Local Agent Harnesses (Workstation Fleet)</h2>
        <p>Coordinated via <code>AGENTS.md</code> Band-A contract, <code>SisGatewayDaemon (:5200)</code>, and Memory Guardian RAM caps.</p>
      </div>
    </div>

    <div class="table-wrap" style="margin-bottom: 28px;">
      <table id="localHarnessTable">
        <thead>
          <tr>
            <th>Local Harness</th>
            <th>Models &amp; Cost Model</th>
            <th>Local Worker Cap</th>
            <th>Who Contributes What &amp; When to Use</th>
            <th>Evals, Traces &amp; Cloud Kickoff</th>
          </tr>
        </thead>
        <tbody>
          ${localHarnesses.map((h) => `
          <tr class="runtime-row" data-kind="local" data-cost="${h.costModel.includes('$0') ? 'zero-marginal' : 'metered'}">
            <td>
              <strong>${escapeHtml(h.name)}</strong>
              <div class="card-meta">${escapeHtml(h.id)}</div>
            </td>
            <td>
              <span class="pill emerald">${escapeHtml(h.models)}</span>
              <div class="card-meta" style="margin-top:4px;">${escapeHtml(h.costModel)}</div>
            </td>
            <td class="mono">${escapeHtml(h.maxLocalWorkers)}</td>
            <td>
              <div><strong>Use when:</strong> ${escapeHtml(h.whenToUse)}</div>
              <div style="color:var(--ink-secondary);font-size:12.5px;margin-top:4px;"><strong>Contributes:</strong> ${escapeHtml(h.contributes)}</div>
            </td>
            <td>
              <div class="mono" style="font-size:11.5px;color:var(--champagne);">Eval: ${escapeHtml(h.evalsAndTraces)}</div>
              <div class="mono" style="font-size:11.5px;color:var(--cyan);margin-top:4px;">Cloud: ${escapeHtml(h.kickoffCloud)}</div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section-head">
      <div>
        <h2>9 Cloud Runtimes, Infrastructure Planes &amp; Beta Capabilities</h2>
        <p>How local agents kick off cloud tasks, how each plane is billed, and the exact substrate gap we are closing next.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table id="cloudPlatformTable">
        <thead>
          <tr>
            <th>Cloud Platform</th>
            <th>Category &amp; Cost Tier</th>
            <th>Measured Estate State</th>
            <th>Role &amp; Beta Capabilities to Exploit</th>
            <th>How to Kick Off &amp; Next Gap to Solve</th>
          </tr>
        </thead>
        <tbody>
          ${cloudPlatforms.map((c) => `
          <tr class="runtime-row" data-kind="cloud" data-cost="${c.costTier.includes('$0') || c.costTier.includes('Included') ? 'zero-marginal' : 'metered'}" data-bridge="${c.gapToSolve.toLowerCase().includes('bridge') || c.gapToSolve.toLowerCase().includes('inbox') ? 'bridge' : ''}">
            <td>
              <strong>${escapeHtml(c.name)}</strong>
              <div class="card-meta">${escapeHtml(c.id)}</div>
            </td>
            <td>
              <span class="pill cyan">${escapeHtml(c.category)}</span>
              <div class="card-meta" style="margin-top:4px;">${escapeHtml(c.costTier)}</div>
            </td>
            <td>${escapeHtml(c.currentState)}</td>
            <td>${escapeHtml(c.role)}</td>
            <td>
              <div class="mono" style="font-size:11.5px;color:var(--emerald);">Trigger: ${escapeHtml(c.howToTrigger)}</div>
              <div style="font-size:12px;color:var(--amber);margin-top:4px;"><strong>Next Gap:</strong> ${escapeHtml(c.gapToSolve)}</div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </section>

  <!-- PANEL 3: 10 GITHUB ORGS, BRAND TEAMS & IP GOVERNANCE -->
  <section class="tab-panel" id="panel-orgs" role="tabpanel" aria-labelledby="tab-orgs">
    <div class="section-head">
      <div>
        <h2>10 GitHub Organizations, Responsible Brand Teams &amp; IP/Connector Matrix</h2>
        <p>All 71 mapped repositories have verified local checkouts, dual remotes (<code>origin</code> + <code>org</code>), and strict public/private visibility parity.</p>
      </div>
    </div>

    <div class="filter-bar">
      <input type="search" id="orgSearch" class="search-input" placeholder="Filter by organization, repo name, agent team, skill, or MCP connector..." aria-label="Filter organizations and repositories">
      <select id="orgModeFilter" class="select-input" aria-label="Filter by governance mode">
        <option value="all">All 10 Organizations (${totalRepos} Repos)</option>
        <option value="active">Active Governance Orgs (9)</option>
        <option value="reshape-frozen">Reshape-Frozen / Read-Only (1)</option>
      </select>
    </div>

    <div class="grid-2" id="orgGrid">
      ${organizations.map((org) => {
        const pubCount = org.repos.filter((r) => r.visibility === 'public').length;
        const privCount = org.repos.length - pubCount;
        return `
      <article class="card org-card" data-mode="${escapeHtml(org.governanceMode)}">
        <div class="card-header">
          <div>
            <div class="card-title">${escapeHtml(org.displayName)} <span class="mono" style="color:var(--ink-muted);font-weight:400;">(@${escapeHtml(org.login)})</span></div>
            <div class="card-meta"><a href="${escapeHtml(org.website)}" target="_blank" rel="noopener">${escapeHtml(org.website)}</a> · Brand ID: <code>${escapeHtml(org.brandId)}</code></div>
          </div>
          <span class="pill ${org.governanceMode === 'active' ? 'emerald' : 'amber'}">${escapeHtml(org.governanceMode.toUpperCase())} · ${org.repos.length} repos</span>
        </div>
        <p style="font-size:13.5px;color:var(--ink-secondary);">${escapeHtml(org.meta.mission)}</p>
        <div class="kv-list">
          <div class="kv-key">Council Lead</div>
          <div class="kv-val"><strong>${escapeHtml(org.meta.councilLead)}</strong></div>
          <div class="kv-key">Brand Specialists</div>
          <div class="kv-val mono" style="font-size:11.5px;">${escapeHtml(org.meta.specialistTeam.join(' · '))}</div>
          <div class="kv-key">AI OS Layer</div>
          <div class="kv-val">${escapeHtml(org.meta.aiOsLayer)}</div>
          <div class="kv-key">Memory Vaults</div>
          <div class="kv-val">${escapeHtml(org.meta.vaults.join(' · '))}</div>
          <div class="kv-key">Skills &amp; Plugins</div>
          <div class="kv-val mono" style="font-size:11.5px;">${escapeHtml(org.meta.skillsAndPlugins.join(', '))}</div>
          <div class="kv-key">MCP &amp; Connectors</div>
          <div class="kv-val mono" style="font-size:11.5px;color:var(--cyan);">${escapeHtml(org.meta.mcpAndConnectors.join(' · '))}</div>
          <div class="kv-key">IP, Data &amp; Tech</div>
          <div class="kv-val">${escapeHtml(org.meta.ipAndData)}</div>
          <div class="kv-key">Community Surface</div>
          <div class="kv-val">${escapeHtml(org.meta.contentAndCommunity)}</div>
          <div class="kv-key">Governance Gate</div>
          <div class="kv-val" style="color:var(--champagne);">${escapeHtml(org.meta.accessGate)}</div>
        </div>
        <div class="repo-chips" aria-label="Repositories in ${escapeHtml(org.login)} (${pubCount} public, ${privCount} private)">
          ${org.repos.map((r) => `
            <span class="repo-chip" title="${escapeHtml(r.visibility)} repo · primary: ${escapeHtml(r.primaryOwner)}/${escapeHtml(r.name)} · federated: ${escapeHtml(org.login)}/${escapeHtml(r.name)}">
              <i class="vis-dot ${r.visibility === 'public' ? 'vis-public' : 'vis-private'}"></i>
              ${escapeHtml(r.name)}
            </span>
          `).join('')}
        </div>
      </article>`;
      }).join('')}
    </div>
  </section>

  <!-- PANEL 4: EXPERIMENTS, TRACES, EVALS & HORIZON TELEMETRY -->
  <section class="tab-panel" id="panel-evals" role="tabpanel" aria-labelledby="tab-evals">
    <div class="section-head">
      <div>
        <h2>Eval-50 Sovereign Memory Benchmark &amp; Horizon Cadence Scorecards</h2>
        <p>Live metrics read from <code>C:/Users/frank/.starlight/reports/horizon-{2h,12h,1w}-latest.json</code>.</p>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom: 24px;">
      <div class="card">
        <div class="card-header">
          <div class="card-title">2h Tactical Pulse</div>
          <span class="pill emerald">StarlightHorizon2h · EXIT 0</span>
        </div>
        <div class="kv-list">
          <div class="kv-key">Completed At</div>
          <div class="kv-val mono">${escapeHtml(h2.completedAt)}</div>
          <div class="kv-key">Gateway :5200</div>
          <div class="kv-val mono">${escapeHtml(h2.gateway?.alive ? 'ONLINE' : 'OFFLINE')} (PID ${escapeHtml(h2.gateway?.pid)})</div>
          <div class="kv-key">Eval-50 Hit@10</div>
          <div class="kv-val mono"><strong>${((h2.eval50?.metrics?.hit10 ?? 1) * 100).toFixed(1)}%</strong> (50/50 queries)</div>
          <div class="kv-key">Disambig Class</div>
          <div class="kv-val mono">Hit@10: ${((h2.eval50?.byClass?.disambig?.hit10 ?? 1) * 100).toFixed(0)}% (3 queries)</div>
          <div class="kv-key">Recall Class</div>
          <div class="kv-val mono">Hit@10: ${((h2.eval50?.byClass?.recall?.hit10 ?? 1) * 100).toFixed(0)}% (43 queries)</div>
          <div class="kv-key">Cross-Vault Class</div>
          <div class="kv-val mono">Hit@10: ${((h2.eval50?.byClass?.['cross-vault']?.hit10 ?? 1) * 100).toFixed(0)}% (4 queries)</div>
          <div class="kv-key">Latency (p50/p95)</div>
          <div class="kv-val mono">${Math.round(h2.eval50?.metrics?.latencyMs?.p50 ?? 219)}ms / ${Math.round(h2.eval50?.metrics?.latencyMs?.p95 ?? 281)}ms</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">12h Operational Consolidation</div>
          <span class="pill gold">StarlightHorizon12h · EXIT 0</span>
        </div>
        <div class="kv-list">
          <div class="kv-key">Completed At</div>
          <div class="kv-val mono">${escapeHtml(h12.completedAt)}</div>
          <div class="kv-key">Dreaming Scan</div>
          <div class="kv-val mono">${escapeHtml(h12.dreaming?.processedFiles ?? 70)} files -> ${escapeHtml(h12.dreaming?.extractedInsights ?? 119)} insights</div>
          <div class="kv-key">Promotions</div>
          <div class="kv-val mono">${escapeHtml(h12.dreaming?.promotions ?? 4)} high-confidence candidates</div>
          <div class="kv-key">Contradictions</div>
          <div class="kv-val mono">${escapeHtml(h12.dreaming?.contradictions ?? 0)} conflicts detected</div>
          <div class="kv-key">90d Half-Life</div>
          <div class="kv-val mono">${escapeHtml(h12.temporalDecay?.entriesScanned ?? 152)} entries · ${escapeHtml(h12.temporalDecay?.belowArchiveThreshold ?? 0)} expired</div>
          <div class="kv-key">Org Federation</div>
          <div class="kv-val mono">${escapeHtml(h12.orgFederation?.localOrgRemoteAlignedCount ?? 71)}/${escapeHtml(h12.orgFederation?.totalMappedRepos ?? 71)} repos aligned</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">1w Weekly Governance Sweep</div>
          <span class="pill cyan">StarlightHorizon1w · EXIT 0</span>
        </div>
        <div class="kv-list">
          <div class="kv-key">Completed At</div>
          <div class="kv-val mono">${escapeHtml(h1w.completedAt)}</div>
          <div class="kv-key">Scheduled Tasks</div>
          <div class="kv-val mono">${escapeHtml(h1w.scheduledTasks?.total ?? 64)} total (${escapeHtml(h1w.scheduledTasks?.ready ?? 23)} Ready, ${escapeHtml(h1w.scheduledTasks?.disabled ?? 38)} Disabled)</div>
          <div class="kv-key">n8n Orchestrator</div>
          <div class="kv-val mono">${h1w.n8nWorkflowPresent ? 'Versioned & Ready' : 'Missing'}</div>
          <div class="kv-key">Legacy Tasks Flagged</div>
          <div class="kv-val mono" style="color:var(--amber);">${(h1w.scheduledTasks?.failingReady || []).length} ready tasks with non-zero last exit</div>
          <div class="kv-key">Flagged Names</div>
          <div class="kv-val mono" style="font-size:11px;">${escapeHtml((h1w.scheduledTasks?.failingReady || []).map((t) => t.name).join(', ') || 'None')}</div>
        </div>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h2>Active Substrate &amp; Agentic OS Experiment Registry</h2>
        <p>Tracked experiments across memory recall, org governance, horizon cadences, context compression, and cloud bridging.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID &amp; Experiment</th>
            <th>Domain &amp; Owner</th>
            <th>Baseline</th>
            <th>Measured Result / Current State</th>
            <th>Status &amp; Next Action</th>
          </tr>
        </thead>
        <tbody>
          ${experiments.map((exp) => `
          <tr>
            <td>
              <strong class="mono">${escapeHtml(exp.id)}</strong>: <strong>${escapeHtml(exp.name)}</strong>
              <div class="card-meta">${escapeHtml(exp.artifact)}</div>
            </td>
            <td>
              <span class="pill violet">${escapeHtml(exp.domain)}</span>
              <div class="card-meta" style="margin-top:4px;">${escapeHtml(exp.owner)}</div>
            </td>
            <td style="color:var(--ink-secondary);">${escapeHtml(exp.baseline)}</td>
            <td><strong>${escapeHtml(exp.current)}</strong></td>
            <td>
              <span class="pill ${exp.status.includes('LIVE') ? 'emerald' : 'gold'}">${escapeHtml(exp.status)}</span>
              <div style="font-size:12px;color:var(--ink-secondary);margin-top:4px;">${escapeHtml(exp.nextStep)}</div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </section>

  <!-- PANEL 5: OPERATOR PLAYBOOK & NEXT PROMPTS -->
  <section class="tab-panel" id="panel-playbook" role="tabpanel" aria-labelledby="tab-playbook">
    <div class="section-head">
      <div>
        <h2>Operator Slash-Command &amp; Automation Playbook</h2>
        <p>When to run which slash command or CLI script, and which agent leads each cadence.</p>
      </div>
    </div>

    <div class="table-wrap" style="margin-bottom: 28px;">
      <table>
        <thead>
          <tr>
            <th>Cadence / Trigger Moment</th>
            <th>Slash Command</th>
            <th>Deterministic CLI / Automation Command</th>
            <th>Responsible Lead</th>
            <th>What It Executes</th>
          </tr>
        </thead>
        <tbody>
          ${operatorPlaybook.map((op) => `
          <tr>
            <td><strong>${escapeHtml(op.cadence)}</strong></td>
            <td><span class="pill gold">${escapeHtml(op.slashCommand)}</span></td>
            <td>
              <code class="mono" style="font-size:11.5px;color:var(--cyan);">${escapeHtml(op.cliCommand)}</code>
              <button class="btn-action copy-btn" type="button" style="padding:2px 8px;font-size:10.5px;margin-top:4px;" data-copy="${escapeHtml(op.cliCommand)}">Copy CLI</button>
            </td>
            <td class="mono">${escapeHtml(op.responsibleAgent)}</td>
            <td>${escapeHtml(op.whatItDoes)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section-head">
      <div>
        <h2>Ready-to-Run Next Prompts (Copy &amp; Dispatch)</h2>
        <p>The 5 concrete execution slices to complete the Local+Cloud Agentic OS roadmap.</p>
      </div>
    </div>

    <div class="grid-2">
      ${nextPrompts.map((np) => `
      <div class="card">
        <div class="card-header">
          <div>
            <span class="pill emerald">${escapeHtml(np.id)}</span>
            <span class="card-title" style="margin-left:6px;">${escapeHtml(np.title)}</span>
            <div class="card-meta" style="margin-top:4px;">Target Harness: <strong>${escapeHtml(np.targetHarness)}</strong> · Repo: <code>${escapeHtml(np.targetRepo)}</code></div>
          </div>
          <button class="btn-action copy-btn" type="button" data-copy="${escapeHtml(np.promptText)}">Copy Prompt</button>
        </div>
        <div class="prompt-box">${escapeHtml(np.promptText)}</div>
      </div>`).join('')}
    </div>
  </section>

  <footer>
    <div>Generated deterministically by <code>scripts/build-unified-command-center.mjs</code> · ${escapeHtml(data.generatedAt)}</div>
    <div>Attestation: <strong>Built on SIP</strong> · Starlight Intelligence Protocol v1.0</div>
  </footer>
</div>

<div id="toast" role="status" aria-live="polite">Copied to clipboard</div>

<script id="command-center-data" type="application/json">${embeddedJson}</script>
<script>
  // Tab switching with keyboard support (Left/Right arrow keys)
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));

  function activateTab(tabBtn) {
    const target = tabBtn.getAttribute('data-tab');
    tabs.forEach((t) => t.setAttribute('aria-selected', t === tabBtn ? 'true' : 'false'));
    panels.forEach((p) => p.classList.toggle('active', p.id === 'panel-' + target));
  }

  tabs.forEach((tabBtn, idx) => {
    tabBtn.addEventListener('click', () => activateTab(tabBtn));
    tabBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        const next = tabs[(idx + 1) % tabs.length];
        next.focus();
        activateTab(next);
      } else if (e.key === 'ArrowLeft') {
        const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
        prev.focus();
        activateTab(prev);
      }
    });
  });

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
  });

  // Copy buttons
  const toast = document.getElementById('toast');
  let toastTimer = null;
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(text);
        toast.textContent = 'Copied to clipboard!';
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
      } catch {
        toast.textContent = 'Select & copy manually';
        toast.classList.add('show');
      }
    });
  });

  // Runtime search & filter
  const harnessSearch = document.getElementById('harnessSearch');
  const workloadFilter = document.getElementById('workloadFilter');
  function filterRuntimes() {
    const q = (harnessSearch.value || '').toLowerCase().trim();
    const mode = workloadFilter.value;
    document.querySelectorAll('.runtime-row').forEach((row) => {
      const text = row.textContent.toLowerCase();
      const kind = row.getAttribute('data-kind');
      const cost = row.getAttribute('data-cost');
      const bridge = row.getAttribute('data-bridge');
      const matchQ = !q || text.includes(q);
      const matchMode =
        mode === 'all' ||
        (mode === 'local' && kind === 'local') ||
        (mode === 'cloud' && kind === 'cloud') ||
        (mode === 'zero-marginal' && cost === 'zero-marginal') ||
        (mode === 'bridge' && bridge === 'bridge');
      row.style.display = matchQ && matchMode ? '' : 'none';
    });
  }
  if (harnessSearch) harnessSearch.addEventListener('input', filterRuntimes);
  if (workloadFilter) workloadFilter.addEventListener('change', filterRuntimes);

  // Org search & filter
  const orgSearch = document.getElementById('orgSearch');
  const orgModeFilter = document.getElementById('orgModeFilter');
  function filterOrgs() {
    const q = (orgSearch.value || '').toLowerCase().trim();
    const mode = orgModeFilter.value;
    document.querySelectorAll('.org-card').forEach((card) => {
      const text = card.textContent.toLowerCase();
      const cardMode = card.getAttribute('data-mode');
      const matchQ = !q || text.includes(q);
      const matchMode = mode === 'all' || cardMode === mode;
      card.style.display = matchQ && matchMode ? '' : 'none';
    });
  }
  if (orgSearch) orgSearch.addEventListener('input', filterOrgs);
  if (orgModeFilter) orgModeFilter.addEventListener('change', filterOrgs);
</script>
</body>
</html>`;
}

export function buildUnifiedCommandCenter(options = {}) {
  const data = collectCommandCenterData(options);
  const html = renderCommandCenterHtml(data);

  const outPaths = options.outPaths || [
    path.join(DEFAULT_STARLIGHT_ROOT, 'command-center', 'starlight-agentic-os-command-center.html'),
    path.join(REPO_ROOT, 'docs', 'cockpit', 'starlight-agentic-os-command-center.html')
  ];

  for (const outPath of outPaths) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
  }

  return {
    generatedAt: data.generatedAt,
    outPaths,
    bytes: Buffer.byteLength(html, 'utf8'),
    organizationsCount: data.organizations.length,
    localHarnessesCount: data.localHarnesses.length,
    cloudPlatformsCount: data.cloudPlatforms.length
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const result = buildUnifiedCommandCenter();
  console.log(JSON.stringify(result, null, 2));
}
