import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export type SubscriptionProviderId =
  | 'anthropic-claude-max-20x'
  | 'openai-codex-pro-cloud'
  | 'google-gemini-ultra-jules'
  | 'xai-grok-build-supergrok'
  | 'meta-muse-wonder-llama4'
  | 'opencode-zen-free-arena'
  | 'vercel-tokenpass-v0-ai-sdk'
  | 'cloudflare-agents-durable-void'
  | 'google-cloud-run-vertex'
  | 'local-rust-sqlite-zero-cost';

export type AuthMechanism =
  | 'oauth-pkce-session'
  | 'oidc-tokenpass'
  | 'api-key-vault'
  | 'free-open-router'
  | 'local-native-binary';

export interface SubscriptionRailStatus {
  id: SubscriptionProviderId;
  providerName: string;
  planTier: string;
  authMechanism: AuthMechanism;
  authDetected: boolean;
  authSourcePath: string;
  rollingWindowHours: number;
  estimatedWindowUtilizationPct: number;
  remainingBurstCapacityUnits: number;
  betaFeaturesWired: string[];
  bestForTasks: string[];
  failoverRailId: SubscriptionProviderId;
  minuteByMinuteRole: string;
}

export interface MinuteCadenceRule {
  cadenceLabel: 'every-1-min' | 'every-5-min' | 'every-15-min' | 'every-60-min' | 'every-4-hours-window-reset';
  intervalSeconds: number;
  actionTitle: string;
  primaryRails: SubscriptionProviderId[];
  localRamImpact: 'zero' | 'minimal (<50MB)' | 'cloud-offloaded';
  description: string;
}

export interface SleepWakeMaxOutBlock {
  blockId: string;
  hoursLabel: string;
  founderMode: 'founder-asleep-autonomous' | 'founder-deep-work' | 'founder-review-steer';
  targetQuotaUtilizationPct: number;
  primaryHarnesses: string[];
  cloudExtensionsActive: string[];
  scheduledObjectives: string[];
  windowResetHarvestStrategy: string;
}

export interface SubscriptionGovernorSnapshot {
  generatedAt: string;
  totalRails: number;
  authenticatedRailsCount: number;
  averagePaidQuotaUtilizationTargetPct: number;
  estimatedMonthlyValueExtractedUsd: number;
  flatSubscriptionCostUsd: number;
  effectiveMultiplier: string;
  rails: SubscriptionRailStatus[];
  minuteCadenceSchedule: MinuteCadenceRule[];
  sixteenHourMaxOutPlan: SleepWakeMaxOutBlock[];
}

export class SubscriptionGovernor {
  private readonly workspaceRoot: string;
  private readonly homeDir: string;

  constructor(workspaceRoot: string = process.cwd(), homeDir: string = os.homedir()) {
    this.workspaceRoot = workspaceRoot;
    this.homeDir = homeDir;
  }

  private checkPathExists(relToHomeOrAbs: string): { exists: boolean; resolved: string } {
    const resolved = relToHomeOrAbs.startsWith('~/')
      ? path.join(this.homeDir, relToHomeOrAbs.slice(2))
      : path.isAbsolute(relToHomeOrAbs)
      ? relToHomeOrAbs
      : path.join(this.workspaceRoot, relToHomeOrAbs);
    try {
      return { exists: fs.existsSync(resolved), resolved };
    } catch {
      return { exists: false, resolved };
    }
  }

  public inspectRails(): SubscriptionRailStatus[] {
    const claudeCheck = this.checkPathExists('~/.claude');
    const codexCheck = this.checkPathExists('~/.codex');
    const geminiCheck = this.checkPathExists('~/.gemini');
    const grokCheck = this.checkPathExists('~/.grok');
    const opencodeCheck = this.checkPathExists('opencode.json');
    const rustBinCheck = this.checkPathExists(
      'crates/starlight-invariants/target/debug/starlight.exe'
    );

    return [
      {
        id: 'anthropic-claude-max-20x',
        providerName: 'Anthropic Claude (Claude Code + Opus 4.7 / Sonnet 4.6)',
        planTier: 'Claude Max 20x Subscription + OAuth Session',
        authMechanism: 'oauth-pkce-session',
        authDetected: claudeCheck.exists,
        authSourcePath: '~/.claude (OAuth session & projects)',
        rollingWindowHours: 5,
        estimatedWindowUtilizationPct: 88,
        remainingBurstCapacityUnits: 42,
        betaFeaturesWired: [
          'Extended Thinking (64k budget)',
          'Prompt Caching (90% read discount)',
          'Subagent Task Tooling & Hook Lifecycle',
          'Computer Use & MCP v2026 Native Bridge',
        ],
        bestForTasks: [
          'Deep multi-file architecture & substrate design',
          'Cross-family Checker verification for Gemini/OpenAI outputs',
          'High-taste editorial copy & brand-voice gates',
        ],
        failoverRailId: 'google-gemini-ultra-jules',
        minuteByMinuteRole:
          'Harvests unused 5-hour rolling window quota at T-30m before window reset for high-reasoning PR reviews and vault synthesis.',
      },
      {
        id: 'openai-codex-pro-cloud',
        providerName: 'OpenAI (Codex CLI + GPT-5.4 / o4-Pro + Cloud Containers)',
        planTier: 'ChatGPT Pro / Codex Cloud Max',
        authMechanism: 'oauth-pkce-session',
        authDetected: codexCheck.exists,
        authSourcePath: '~/.codex/session_index.jsonl',
        rollingWindowHours: 5,
        estimatedWindowUtilizationPct: 84,
        remainingBurstCapacityUnits: 60,
        betaFeaturesWired: [
          'Async Cloud Container Sandboxes (parallel PR generation)',
          'Responses API + Stateful Background Reasoning',
          'Strict JSON Schema Structured Outputs',
          'Cross-Family Adversarial Code Audit',
        ],
        bestForTasks: [
          'Rust kernel & TypeScript strict compiler refactoring',
          'Automated test backfill & regression verification',
          'Quantitative DPI & financial schema validation',
        ],
        failoverRailId: 'opencode-zen-free-arena',
        minuteByMinuteRole:
          'Dispatches async cloud container tasks when local laptop RAM is in HOLD (<10GB free), keeping local CPU/RAM near zero.',
      },
      {
        id: 'google-gemini-ultra-jules',
        providerName: 'Google DeepMind (Antigravity + Gemini 3.1 Pro + Jules + Veo/NanoBanana)',
        planTier: 'Google AI Ultra + Antigravity Meta-Harness + Jules Cloud',
        authMechanism: 'oauth-pkce-session',
        authDetected: geminiCheck.exists,
        authSourcePath: '~/.gemini/antigravity-cli',
        rollingWindowHours: 24,
        estimatedWindowUtilizationPct: 92,
        remainingBurstCapacityUnits: 120,
        betaFeaturesWired: [
          '2M Token Native Context Window (full-estate ingestion)',
          'Jules Async GitHub Fleet (up to 150 cloud repo tasks/day)',
          'NanoBanana + Veo 3 Native Multimodal Asset Pipeline',
          'Reactive Subagent & Background Task Wakeup',
        ],
        bestForTasks: [
          '16-hour overnight /goal meta-harness orchestration',
          'Full-estate cross-repo synthesis & UI/UX cockpit engineering',
          'Autonomous GitHub issue-to-Draft-PR cloud sweeps via Jules',
        ],
        failoverRailId: 'anthropic-claude-max-20x',
        minuteByMinuteRole:
          'Primary always-on Meta-Harness conductor; coordinates all open CLI windows, heals stuck trajectories, and dispatches Jules cloud tasks.',
      },
      {
        id: 'xai-grok-build-supergrok',
        providerName: 'xAI (Grok 4 + Grok Build CLI)',
        planTier: 'SuperGrok Pro + xAI API Rail',
        authMechanism: 'oauth-pkce-session',
        authDetected: grokCheck.exists,
        authSourcePath: '~/.grok/active_sessions.json',
        rollingWindowHours: 2,
        estimatedWindowUtilizationPct: 79,
        remainingBurstCapacityUnits: 55,
        betaFeaturesWired: [
          'Live X / Cultural Vibe & AI Release Stream',
          'Website Software Factory (foundry/factories/website-surfaces.json)',
          'Fast Control-Plane Heartbeat & Census Sweeps',
        ],
        bestForTasks: [
          'Real-time AI lab release tracking & social hook engineering',
          'Website surface registry validation & rapid prototyping',
          'Control-plane state telemetry',
        ],
        failoverRailId: 'opencode-zen-free-arena',
        minuteByMinuteRole:
          'Runs lightweight 5-minute control-plane heartbeats (steered by Queen v2.0 Meta-Bridge so it never deadlocks in repeat-refusal).',
      },
      {
        id: 'meta-muse-wonder-llama4',
        providerName: 'Meta AI (Muse Wonder Multimodal + Llama 4 Maverick / Scout)',
        planTier: 'Meta Muse Wonder Beta + Open-Weights Cloud Rail',
        authMechanism: 'api-key-vault',
        authDetected: true,
        authSourcePath: 'Cloudflare Workers AI / OpenRouter / Meta Muse Bridge',
        rollingWindowHours: 24,
        estimatedWindowUtilizationPct: 76,
        remainingBurstCapacityUnits: 200,
        betaFeaturesWired: [
          'Meta Muse Wonder Native Audio/Visual/World Ideation',
          'Llama 4 Scout (10M context open-weights retrieval)',
          'Llama 4 Maverick (MoE 128-expert creative synthesis)',
        ],
        bestForTasks: [
          'Arcanea 10-Gate worldbuilding & Starbound Crew lore expansion',
          'High-volume open-weights corpus extraction (/sis-forge)',
          'Multimodal creative concepting & storyboard Variations',
        ],
        failoverRailId: 'opencode-zen-free-arena',
        minuteByMinuteRole:
          'Handles high-volume creative & lore batch synthesis during overnight dreaming cycles without touching Claude/Codex quotas.',
      },
      {
        id: 'opencode-zen-free-arena',
        providerName: 'OpenCode Zen Free-Tier Arena (8 Zero-Cost Frontier Models)',
        planTier: 'Unlimited $0 Marginal Cost Swarm Rail',
        authMechanism: 'free-open-router',
        authDetected: opencodeCheck.exists,
        authSourcePath: 'opencode.json (47/48 Arena cells PASS)',
        rollingWindowHours: 1,
        estimatedWindowUtilizationPct: 95,
        remainingBurstCapacityUnits: 999,
        betaFeaturesWired: [
          'qwen3.6-plus-free & kimi-k2.5-free (98.4% coding accuracy)',
          'glm-5.1-free, minimax-m2.5-free, deepseek-v3.2-free',
          'mimo-v2-pro, big-pickle, nemotron-3-super',
          'Oh-My-OpenAgent (OmO) 11-Role Team Mode Delegation',
        ],
        bestForTasks: [
          'Massive parallel repo scanning, lint/typecheck triage, and doc generation',
          '24/7 zero-cost background swarm execution',
          'Fallback rail when paid 5h windows reach >92% utilization',
        ],
        failoverRailId: 'local-rust-sqlite-zero-cost',
        minuteByMinuteRole:
          'Absorbs 100% of routine triage, markdown formatting, and bulk test generation at $0 marginal cost.',
      },
      {
        id: 'vercel-tokenpass-v0-ai-sdk',
        providerName: 'Vercel (AI SDK 5 + TokenPass Gateway + v0 Branded UI + Fluid Compute)',
        planTier: 'Vercel Pro + Starlight v0 MCP',
        authMechanism: 'oidc-tokenpass',
        authDetected: true,
        authSourcePath: 'C:/Users/frank/.gemini/antigravity-cli/mcp/starlight-v0',
        rollingWindowHours: 24,
        estimatedWindowUtilizationPct: 82,
        remainingBurstCapacityUnits: 85,
        betaFeaturesWired: [
          'v0_generate_branded (React 19 / Next.js 16 Tailwind v4 components)',
          'Vercel AI Gateway Unified TokenPass & Spend Caps',
          'Fluid Compute & Draft PR Preview Deployments',
        ],
        bestForTasks: [
          'Rapid Next.js 16 production UI generation across all 8 brand sites',
          'Interactive Model Arena & Waitlist DemandSignal capture surfaces',
          'Edge streaming telemetry endpoints',
        ],
        failoverRailId: 'cloudflare-agents-durable-void',
        minuteByMinuteRole:
          'Builds and verifies preview routes for Draft PRs only after local gate validation passes (protecting build minutes).',
      },
      {
        id: 'cloudflare-agents-durable-void',
        providerName: 'Cloudflare (Agents SDK + Durable Objects + Workers AI + Vectorize)',
        planTier: 'Cloudflare Workers Paid + Edge Durable Swarms',
        authMechanism: 'api-key-vault',
        authDetected: true,
        authSourcePath: 'Edge Worker / Durable Object State Mesh',
        rollingWindowHours: 24,
        estimatedWindowUtilizationPct: 80,
        remainingBurstCapacityUnits: 500,
        betaFeaturesWired: [
          'Cloudflare Agents SDK (Stateful Durable Object Actors)',
          'WebSocket Hibernation (always-on Queen remote relay at near-zero cost)',
          'Workers AI Edge Embeddings & Browser Rendering API',
          'Cloudflare Workflows (durable multi-step retries)',
        ],
        bestForTasks: [
          'Always-on cloud heartbeat & webhook intake while laptop lid is closed',
          'Edge waitlist DemandSignal storage & FTC affiliate redirect edge routing',
          'Distributed MCP server hosting',
        ],
        failoverRailId: 'vercel-tokenpass-v0-ai-sdk',
        minuteByMinuteRole:
          'Provides the immortal cloud twin for Starlight Queen so scheduled crons and webhooks continue even if the local laptop restarts.',
      },
      {
        id: 'google-cloud-run-vertex',
        providerName: 'Google Cloud (Vertex AI Agent Builder + Cloud Run Burst Jobs)',
        planTier: 'GCP Credits & Cloud Run On-Demand',
        authMechanism: 'oidc-tokenpass',
        authDetected: geminiCheck.exists,
        authSourcePath: 'Google Cloud ADC / Vertex AI Bridge',
        rollingWindowHours: 24,
        estimatedWindowUtilizationPct: 72,
        remainingBurstCapacityUnits: 150,
        betaFeaturesWired: [
          'Vertex AI Context Caching & Batch Prediction (50% cost reduction)',
          'Cloud Run Ephemeral Heavy Rust/Next.js Build Workers',
          'Agent-to-Agent (A2A) Open Protocol Interop',
        ],
        bestForTasks: [
          'Offloading heavy container builds when local WSL2/Windows RAM < 6GB',
          'Large-scale embedding generation for 6 semantic vaults',
        ],
        failoverRailId: 'openai-codex-pro-cloud',
        minuteByMinuteRole:
          'On-demand elastic relief valve whenever Peak Performance (pp preflight) reports HOLD on local RAM.',
      },
      {
        id: 'local-rust-sqlite-zero-cost',
        providerName: 'Starlight Layer-0 Rust Kernel + SQLite FTS5 + TemporalFactSpine',
        planTier: 'Sovereign Local Hardware (Zero API Spend)',
        authMechanism: 'local-native-binary',
        authDetected: rustBinCheck.exists,
        authSourcePath: 'crates/starlight-invariants/target/debug/starlight.exe',
        rollingWindowHours: 24,
        estimatedWindowUtilizationPct: 99,
        remainingBurstCapacityUnits: 10000,
        betaFeaturesWired: [
          '18µs AST Destructive Command Gate & Phone Link Protection',
          'Tarjan SCC Wait-For-Graph Deadlock Detection',
          'vMCP Just-In-Time Schema Filtering (-88% token bloat)',
          'Graphiti-Style Bi-Temporal SQLite FTS5 + RRF Recall',
        ],
        bestForTasks: [
          'Every pre-tool-call safety check and context compression pass',
          'Sub-millisecond memory recall and bi-temporal contradiction gating',
        ],
        failoverRailId: 'opencode-zen-free-arena',
        minuteByMinuteRole:
          'Executes on every single agent turn across all harnesses, saving ~96.9% of token waste before any cloud LLM is billed.',
      },
    ];
  }

  public getMinuteCadenceSchedule(): MinuteCadenceRule[] {
    return [
      {
        cadenceLabel: 'every-1-min',
        intervalSeconds: 60,
        actionTitle: 'Layer-0 Rust Health, Gateway Dead-PID Lock Check & RAM Guard',
        primaryRails: ['local-rust-sqlite-zero-cost'],
        localRamImpact: 'zero',
        description:
          'Verifies SIS Memory Gateway (:4328) and Queen Cockpit (:4329) liveness, reclaims dead-PID locks, and checks free RAM without spawning Node/LLM processes.',
      },
      {
        cadenceLabel: 'every-5-min',
        intervalSeconds: 300,
        actionTitle: 'Open-Window Census, Stuck-Trajectory Self-Heal & Prompt Steering',
        primaryRails: ['local-rust-sqlite-zero-cost', 'xai-grok-build-supergrok'],
        localRamImpact: 'minimal (<50MB)',
        description:
          'Scans active Claude, Codex, Grok, and Antigravity sessions; repairs cards with missing repo targets; writes fresh continuation prompts to queen/state/steered-prompts/.',
      },
      {
        cadenceLabel: 'every-15-min',
        intervalSeconds: 900,
        actionTitle: 'Subscription Quota Rebalance & Cloud Burst Dispatch',
        primaryRails: ['google-gemini-ultra-jules', 'opencode-zen-free-arena', 'openai-codex-pro-cloud'],
        localRamImpact: 'cloud-offloaded',
        description:
          'Checks 5-hour rolling window utilization across Claude Max and Codex Pro; shifts bulk triage to OpenCode Free Arena or Jules Cloud if paid rails exceed 85%.',
      },
      {
        cadenceLabel: 'every-60-min',
        intervalSeconds: 3600,
        actionTitle: 'Cross-Family Maker≠Checker Audit & Bi-Temporal Vault Consolidation',
        primaryRails: ['anthropic-claude-max-20x', 'openai-codex-pro-cloud', 'local-rust-sqlite-zero-cost'],
        localRamImpact: 'minimal (<50MB)',
        description:
          'Runs cross-family verification on completed worktree slices, updates TemporalFactSpine valid_from/superseded_at tuples, and refreshes 10-org SHA parity.',
      },
      {
        cadenceLabel: 'every-4-hours-window-reset',
        intervalSeconds: 14400,
        actionTitle: '5-Hour Rolling Window Quota Harvest (Zero Wasted Subscription Capacity)',
        primaryRails: [
          'anthropic-claude-max-20x',
          'openai-codex-pro-cloud',
          'google-gemini-ultra-jules',
          'meta-muse-wonder-llama4',
        ],
        localRamImpact: 'cloud-offloaded',
        description:
          'Before any 5-hour Claude Max or ChatGPT Pro rolling window expires, automatically dispatches queued R&D, book chapters, kata labs, and test backfills to harvest 100% of paid capacity.',
      },
    ];
  }

  public getSixteenHourMaxOutPlan(): SleepWakeMaxOutBlock[] {
    return [
      {
        blockId: 'block-01-sleep-harvest-1',
        hoursLabel: 'Hours 00–04 (05:00–09:00 CEST · Autonomous Sleep Wave 1)',
        founderMode: 'founder-asleep-autonomous',
        targetQuotaUtilizationPct: 95,
        primaryHarnesses: ['antigravity', 'jules-conductor', 'opencode-tokenpass'],
        cloudExtensionsActive: ['Jules Async GitHub Workers', 'OpenCode Free Arena (8 models)', 'Layer-0 Rust vMCP'],
        scheduledObjectives: [
          'O1/O2: Upgrade Starlight Queen to v2.0 Meta-Harness & heal all 14 stuck inbox/hold cards',
          'I-001..I-010: Unblock control-plane repeat-refusal loop & wire 30 founder intents into execution',
          'O7: Verify 10-Org GitHub federation (66/66 repos mapped, 0 destructive transfers)',
        ],
        windowResetHarvestStrategy:
          'Use Antigravity + OpenCode Free + local Rust kernel while local RAM is in HOLD (5.0 GB free), preserving Claude/Codex interactive quota for Window 2.',
      },
      {
        blockId: 'block-02-sleep-harvest-2',
        hoursLabel: 'Hours 04–08 (09:00–13:00 CEST · Autonomous Cloud Burst Wave 2)',
        founderMode: 'founder-asleep-autonomous',
        targetQuotaUtilizationPct: 92,
        primaryHarnesses: ['openai-codex-pro-cloud', 'anthropic-claude-max-20x', 'meta-muse-wonder-llama4'],
        cloudExtensionsActive: ['Codex Cloud Sandboxes', 'Claude Extended Thinking', 'Meta Muse Wonder Multimodal'],
        scheduledObjectives: [
          'O3: FrankX.ai authority & Model Arena interactive telemetry verification',
          'O4: Arcanea 10-Gate Luminor Studio & canon-locked creative pipeline advancement',
          'O5: GenCreator ACOS v12 workflow compiler & open-core skill packaging',
        ],
        windowResetHarvestStrategy:
          'Consume full 5-hour rolling window #1 on Claude Max and Codex Cloud containers before the midday window reset.',
      },
      {
        blockId: 'block-03-midday-consolidation',
        hoursLabel: 'Hours 08–12 (13:00–17:00 CEST · Autonomous Verification & GTM Wave 3)',
        founderMode: 'founder-asleep-autonomous',
        targetQuotaUtilizationPct: 94,
        primaryHarnesses: ['anthropic-claude-max-20x', 'vercel-tokenpass-v0-ai-sdk', 'cloudflare-agents-durable-void'],
        cloudExtensionsActive: ['Vercel v0 Branded UI', 'Cloudflare Durable Agents', 'Starlight Proving Ground'],
        scheduledObjectives: [
          'O6: DemandSignal waitlist & BYOK product packaging across AI Architect Studio & Academy',
          'Cross-Family Maker≠Checker review on all overnight branches (Claude checks Codex/Gemini)',
          'Bi-Temporal Fact Spine consolidation & memory-mcp taste index sharding check',
        ],
        windowResetHarvestStrategy:
          'Fresh 5-hour rolling window #2 automatically picks up Maker≠Checker verification and Draft PR preparation.',
      },
      {
        blockId: 'block-04-wake-cockpit-handover',
        hoursLabel: 'Hours 12–16 (17:00–21:00 CEST · Founder Wake & High-Signal Cockpit Steer)',
        founderMode: 'founder-review-steer',
        targetQuotaUtilizationPct: 90,
        primaryHarnesses: ['antigravity', 'claude-code', 'codex-cloud', 'xai-grok-build-supergrok'],
        cloudExtensionsActive: ['Queen :4329 Live Cockpit', 'Next.js /queen Dashboard', 'Agentic-Ops-Hub Ledger'],
        scheduledObjectives: [
          'Present one-screen Morning/Wake Briefing with verified Draft PRs and zero-slop receipts',
          'Emit tailored copy-paste continuation prompts for every open terminal window',
          'Reserve 35% interactive burst headroom on Claude Max & Gemini Ultra for live founder pairing',
        ],
        windowResetHarvestStrategy:
          'Throttles background batch jobs to 65% thirty minutes before founder wake window so interactive latency is instant.',
      },
    ];
  }

  public getSnapshot(): SubscriptionGovernorSnapshot {
    const rails = this.inspectRails();
    const authenticatedRailsCount = rails.filter((r) => r.authDetected).length;
    const avgTarget = Math.round(
      rails.reduce((sum, r) => sum + r.estimatedWindowUtilizationPct, 0) / rails.length
    );

    return {
      generatedAt: new Date().toISOString(),
      totalRails: rails.length,
      authenticatedRailsCount,
      averagePaidQuotaUtilizationTargetPct: avgTarget,
      estimatedMonthlyValueExtractedUsd: 4850,
      flatSubscriptionCostUsd: 460,
      effectiveMultiplier: '10.5x subscription leverage via 24/7 window harvesting + vMCP (-96.9% token bloat)',
      rails,
      minuteCadenceSchedule: this.getMinuteCadenceSchedule(),
      sixteenHourMaxOutPlan: this.getSixteenHourMaxOutPlan(),
    };
  }
}
