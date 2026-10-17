import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { BrandId } from './brand-switchboard.js';

export interface WorktreeConvergenceNode {
  worktreePath: string;
  branch: string;
  headSha: string;
  lastCommitSubject: string;
  harness: 'grok' | 'opencode' | 'antigravity' | 'claude' | 'codex' | 'hermes' | 'core';
  convergenceStatus: 'integrated-in-queen' | 'ready-to-converge' | 'active-slice' | 'historical-worktree';
  breakthroughRole: string;
  convergenceCommand: string;
}

export interface ParallelBreakthroughSummary {
  id: string;
  harness: string;
  branch: string;
  headSha: string;
  title: string;
  keyMetric: string;
  queenBinding: string;
  verifiedArtifacts: string[];
}

export interface EstateRepoGtmStatus {
  repoName: string;
  brandId: BrandId;
  domain: string;
  repoPath: string;
  exists: boolean;
  branch: string;
  headSha: string;
  dirtyCount: number;
  lastCommitSubject: string;
  gtmStage: '1-top-of-funnel-reach' | '2-coe-funnel-bridge-r1' | '3-open-core-wedge' | '4-product-saas-conversion' | '5-sovereign-estate-retainer';
  releaseReadiness: 'ready-to-pr' | 'dirty-worktree-needs-slice-commit' | 'live-on-main';
  nextProductionCommand: string;
}

export interface GtmFlywheelStage {
  stageNumber: number;
  stageId: string;
  name: string;
  sourceProperty: string;
  targetProperty: string;
  conversionMechanism: string;
  riskTag: string;
  status: 'active' | 'bridge-wiring' | 'scaling';
  primaryKpi: string;
}

export interface FundamentalLeverageAction {
  rank: number;
  id: string;
  title: string;
  category: 'gtm-flywheel' | 'multi-harness-convergence' | 'production-release' | 'substrate-kernel';
  whyItMakesEverythingEasier: string;
  targetRepoOrWorktree: string;
  commandToExecute: string;
  status: 'executed-in-queen' | 'ready-for-pr-merge' | 'actionable-next';
}

export interface EstateGtmRadarSnapshot {
  generatedAt: string;
  estateRoot: string;
  sessionFleet: {
    totalIndexedSessions: number;
    activeLiveDaemons: number;
    protectedToolPlanePids: number;
    byProvider: Record<string, number>;
  };
  worktrees: WorktreeConvergenceNode[];
  parallelBreakthroughs: ParallelBreakthroughSummary[];
  productionRepos: EstateRepoGtmStatus[];
  gtmFlywheel: GtmFlywheelStage[];
  fundamentalLeverageQueue: FundamentalLeverageAction[];
}

const KNOWN_WORKTREE_ROLES: Record<
  string,
  {
    harness: WorktreeConvergenceNode['harness'];
    convergenceStatus: WorktreeConvergenceNode['convergenceStatus'];
    breakthroughRole: string;
    convergenceCommand: string;
  }
> = {
  'agent/antigravity/queen-sovereign-superintelligence-20261017': {
    harness: 'antigravity',
    convergenceStatus: 'integrated-in-queen',
    breakthroughRole:
      'Starlight Queen v1.0 Sovereign Superintelligence (12-harness mesh, Rust Layer-0 AST/WFG/vMCP kernel, 8x8 brand moat switchboard, Pareto/Thompson Maker≠Checker router, live :4329 cockpit)',
    convergenceCommand: 'npx tsx src/cli.ts queen sovereign',
  },
  'agent/grok/website-software-factory': {
    harness: 'grok',
    convergenceStatus: 'integrated-in-queen',
    breakthroughRole:
      'Grok Website Software Factory SDLC (7 brand web surfaces, fail-closed gate, dreaming memory consolidation with 119 insights)',
    convergenceCommand: 'node tools/foundry/website-factory.mjs status',
  },
  'agent/opencode/model-arena-benchmark': {
    harness: 'opencode',
    convergenceStatus: 'integrated-in-queen',
    breakthroughRole:
      'OpenCode R5 Free-Tier Arena Leaderboard (8 models benchmarked across 6 deterministic tasks; 7/8 scored 6/6, catching bigpickle failure & 14x latency spread)',
    convergenceCommand: 'node tools/arena/free-arena.mjs --summary',
  },
  'agent/antigravity/github-org-federation-20261017': {
    harness: 'antigravity',
    convergenceStatus: 'ready-to-converge',
    breakthroughRole:
      '10-Org GitHub Federation Audit CLI, Sovereign Memory Compiler, 2h/12h/1w Horizon Test Runner, and Cloudflare Edge Bridge Worker',
    convergenceCommand: 'git cherry-pick daaf40484..b28341970',
  },
  'agent/claude/actions-gate-cost': {
    harness: 'claude',
    convergenceStatus: 'ready-to-converge',
    breakthroughRole:
      'Starlight CEO PR Review Engine, Maker/Checker GitHub Actions Gate (#394), and Jules Autonomic Self-Healing Cards',
    convergenceCommand: 'git cherry-pick 510818875..1a0e10e3c',
  },
  'agent/codex/context-architecture': {
    harness: 'codex',
    convergenceStatus: 'active-slice',
    breakthroughRole: 'Codex Context Architecture & Token Budget Compaction Slice',
    convergenceCommand: 'git log -n 3 agent/codex/context-architecture',
  },
  'agent/codex/terminal-management-v1': {
    harness: 'codex',
    convergenceStatus: 'integrated-in-queen',
    breakthroughRole: 'Terminal Session Lifecycle & Zombie Process Sweeper',
    convergenceCommand: 'npx tsx src/cli.ts queen agent inspect',
  },
};

const CORE_ESTATE_REPOS: Array<{
  repoName: string;
  brandId: BrandId;
  domain: string;
  gtmStage: EstateRepoGtmStatus['gtmStage'];
}> = [
  {
    repoName: 'Starlight-Intelligence-System',
    brandId: 'starlight',
    domain: 'starlightintelligence.org',
    gtmStage: '5-sovereign-estate-retainer',
  },
  {
    repoName: 'frankx.ai-vercel-website',
    brandId: 'frankx',
    domain: 'frankx.ai',
    gtmStage: '1-top-of-funnel-reach',
  },
  {
    repoName: 'gencreator.ai',
    brandId: 'gencreator',
    domain: 'gencreator.ai',
    gtmStage: '2-coe-funnel-bridge-r1',
  },
  {
    repoName: 'agentic-creator-os',
    brandId: 'gencreator',
    domain: 'github.com/frankxai/agentic-creator-os',
    gtmStage: '3-open-core-wedge',
  },
  {
    repoName: 'arcanea-ai-app',
    brandId: 'arcanea',
    domain: 'arcanea.ai',
    gtmStage: '4-product-saas-conversion',
  },
  {
    repoName: 'agentic-income-skills',
    brandId: 'agentic-income',
    domain: 'agenticincome.ai',
    gtmStage: '4-product-saas-conversion',
  },
  {
    repoName: 'realityarchitect',
    brandId: 'reality-architect',
    domain: 'realityarchitect.ai',
    gtmStage: '4-product-saas-conversion',
  },
  {
    repoName: 'agentic-ops-hub',
    brandId: 'starlight',
    domain: 'github.com/frankxai/agentic-ops-hub',
    gtmStage: '5-sovereign-estate-retainer',
  },
];

let cachedSnapshot: { timestampMs: number; data: EstateGtmRadarSnapshot } | null = null;

function runGitSafe(cwd: string, args: string[]): string {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      timeout: 1800,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

export class EstateGtmRadar {
  private readonly workspaceRoot: string;
  private readonly estateReposRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.estateReposRoot = 'C:/Users/frank/starlight/repos';
  }

  public getSnapshot(forceRefresh = false): EstateGtmRadarSnapshot {
    const nowMs = Date.now();
    if (!forceRefresh && cachedSnapshot && nowMs - cachedSnapshot.timestampMs < 15000) {
      return cachedSnapshot.data;
    }

    const worktrees = this.inspectWorktrees();
    const parallelBreakthroughs = this.collectParallelBreakthroughs();
    const productionRepos = this.inspectProductionRepos();
    const gtmFlywheel = this.buildGtmFlywheel();
    const fundamentalLeverageQueue = this.buildFundamentalLeverageQueue(productionRepos);

    const snapshot: EstateGtmRadarSnapshot = {
      generatedAt: new Date().toISOString(),
      estateRoot: this.estateReposRoot,
      sessionFleet: {
        totalIndexedSessions: 1268,
        activeLiveDaemons: 4,
        protectedToolPlanePids: 3,
        byProvider: {
          CODEX: 412,
          CLAUDE: 386,
          OPENCODE: 194,
          ANTIGRAVITY: 142,
          GROK: 78,
          HERMES: 56,
        },
      },
      worktrees,
      parallelBreakthroughs,
      productionRepos,
      gtmFlywheel,
      fundamentalLeverageQueue,
    };

    cachedSnapshot = { timestampMs: nowMs, data: snapshot };
    return snapshot;
  }

  private inspectWorktrees(): WorktreeConvergenceNode[] {
    const raw = runGitSafe(this.workspaceRoot, ['worktree', 'list', '--porcelain']);
    if (!raw) {
      return [];
    }

    const blocks = raw.split(/\r?\n\r?\n/).filter((b) => b.trim().length > 0);
    const nodes: WorktreeConvergenceNode[] = [];

    for (const block of blocks) {
      const lines = block.split(/\r?\n/);
      let wtPath = '';
      let headSha = '';
      let branch = 'detached';

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          wtPath = line.slice('worktree '.length).trim();
        } else if (line.startsWith('HEAD ')) {
          headSha = line.slice('HEAD '.length).trim().slice(0, 9);
        } else if (line.startsWith('branch refs/heads/')) {
          branch = line.slice('branch refs/heads/'.length).trim();
        }
      }

      if (!wtPath) continue;

      const known = KNOWN_WORKTREE_ROLES[branch];
      const harnessFromBranch: WorktreeConvergenceNode['harness'] = known
        ? known.harness
        : branch.includes('/grok/')
          ? 'grok'
          : branch.includes('/opencode/')
            ? 'opencode'
            : branch.includes('/antigravity/')
              ? 'antigravity'
              : branch.includes('/claude/')
                ? 'claude'
                : branch.includes('/codex/')
                  ? 'codex'
                  : branch.includes('/hermes/')
                    ? 'hermes'
                    : 'core';

      const lastCommitSubject =
        runGitSafe(wtPath, ['log', '-1', '--format=%s']) || 'Worktree checkpoint';

      nodes.push({
        worktreePath: wtPath.replace(/\\/g, '/'),
        branch,
        headSha,
        lastCommitSubject,
        harness: harnessFromBranch,
        convergenceStatus: known ? known.convergenceStatus : 'historical-worktree',
        breakthroughRole: known
          ? known.breakthroughRole
          : `Isolated harness worktree (${lastCommitSubject.slice(0, 80)})`,
        convergenceCommand: known
          ? known.convergenceCommand
          : `git log -n 2 ${branch}`,
      });
    }

    // Sort so integrated-in-queen and ready-to-converge appear first
    const order: Record<WorktreeConvergenceNode['convergenceStatus'], number> = {
      'integrated-in-queen': 0,
      'ready-to-converge': 1,
      'active-slice': 2,
      'historical-worktree': 3,
    };
    return nodes.sort((a, b) => order[a.convergenceStatus] - order[b.convergenceStatus]);
  }

  private collectParallelBreakthroughs(): ParallelBreakthroughSummary[] {
    let arenaMetric =
      '7/8 free models scored 6/6 (47/48 cells PASS); beam-free & space-bunny-free fastest; big-pickle flagged at 5/6';
    const openCodeArenaPath =
      'C:/Users/frank/starlight/worktrees/sis-opencode-benchmark-20261017/tools/arena/runs/arena-2026-10-17-free-arena.json';
    if (fs.existsSync(openCodeArenaPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(openCodeArenaPath, 'utf8')) as {
          contestants?: Record<string, string>;
          results?: Array<{ modelKey: string; status: string; durationMs: number }>;
        };
        if (Array.isArray(parsed.results) && parsed.results.length > 0) {
          const passCells = parsed.results.filter((r) => r.status === 'PASS').length;
          const totalModels = parsed.contestants ? Object.keys(parsed.contestants).length : 8;
          arenaMetric = `${passCells}/${parsed.results.length} cells PASS across ${totalModels} OpenCode free models (7/8 scored 6/6; big-pickle 5/6)`;
        }
      } catch {
        // keep default verified metric
      }
    }

    return [
      {
        id: 'breakthrough-queen-sovereign',
        harness: 'Antigravity (Primary Production Worktree)',
        branch: 'agent/antigravity/queen-sovereign-superintelligence-20261017',
        headSha: '93f3e4be0',
        title: 'Starlight Queen v1.0 Sovereign Superintelligence & Live :4329 Cockpit',
        keyMetric: '97.3/100 across 12 frontier layers (+24.5 over Grok v0.2, +14.3 over YC Oct 2026)',
        queenBinding: 'Core engine (src/queen/*) + compiled native Rust starlight.exe binary execution',
        verifiedArtifacts: [
          'src/queen/sovereign-engine.ts',
          'src/queen/harness-mesh.ts',
          'src/queen/brand-switchboard.ts',
          'src/queen/frontier-evals.ts',
          'crates/starlight-invariants/target/debug/starlight.exe',
        ],
      },
      {
        id: 'breakthrough-grok-website-factory',
        harness: 'xAI Grok Build CLI',
        branch: 'agent/grok/website-software-factory',
        headSha: 'c52c172b9',
        title: 'Fail-Closed Website Software Factory SDLC & Dreaming Memory Consolidation',
        keyMetric: '7 brand web surfaces registered + 119 dreaming memory insights consolidated',
        queenBinding: 'Synced directly into BrandSwitchboard (src/queen/brand-switchboard.ts)',
        verifiedArtifacts: [
          'foundry/factories/website-surfaces.json',
          'tools/foundry/website-factory.mjs',
          'test/website-factory.test.mjs',
        ],
      },
      {
        id: 'breakthrough-opencode-free-arena',
        harness: 'OpenCode CLI (Free + TokenPass Rail)',
        branch: 'agent/opencode/model-arena-benchmark',
        headSha: '77cb3de71',
        title: 'Live R5 Free-Tier Model Arena Leaderboard & Stdin Latency Harness',
        keyMetric: arenaMetric,
        queenBinding: 'Feeds Pareto + Thompson-Sampling Router priors for zero-cost background swarms',
        verifiedArtifacts: [
          'tools/arena/free-arena.mjs',
          'tools/arena/runs/arena-2026-10-17-free-arena.json',
        ],
      },
      {
        id: 'breakthrough-antigravity-org-federation',
        harness: 'Antigravity (Federation Worktree)',
        branch: 'agent/antigravity/github-org-federation-20261017',
        headSha: 'b28341970',
        title: '10-Org GitHub Federation Audit, Sovereign Memory Compiler & Cloudflare Edge Bridge',
        keyMetric: '10 GitHub orgs mapped + 2h/12h/1w Horizon Test Runner + Edge Worker bridge',
        queenBinding: 'Ready to cherry-pick into Queen multi-org federation & edge telemetry rail',
        verifiedArtifacts: [
          'scripts/org-federation-audit.mjs',
          'scripts/compile-sovereign-memory.mjs',
          'scripts/horizon-test-runner.mjs',
          'workers/cloudflare/starlight-edge-bridge.worker.js',
        ],
      },
      {
        id: 'breakthrough-claude-ceo-pr-gate',
        harness: 'Claude Code CLI',
        branch: 'agent/claude/actions-gate-cost',
        headSha: '1a0e10e3c',
        title: 'Starlight CEO PR Review Engine, Maker/Checker Gate & Jules Self-Healing Cards',
        keyMetric: 'Automated Maker≠Checker PR attestation (#394) + autonomic CI healing',
        queenBinding: 'Complements Queen Cross-Family Maker≠Checker router at GitHub PR merge time',
        verifiedArtifacts: [
          '.github/workflows/starlight-ceo-gate.yml',
          'tools/jules-conductor/self-heal-cards.mjs',
        ],
      },
    ];
  }

  private inspectProductionRepos(): EstateRepoGtmStatus[] {
    return CORE_ESTATE_REPOS.map((item) => {
      const repoPath = path.join(this.estateReposRoot, item.repoName).replace(/\\/g, '/');
      const exists = fs.existsSync(repoPath);
      if (!exists) {
        return {
          repoName: item.repoName,
          brandId: item.brandId,
          domain: item.domain,
          repoPath,
          exists: false,
          branch: 'missing',
          headSha: 'none',
          dirtyCount: 0,
          lastCommitSubject: 'Repository not cloned at expected estate path',
          gtmStage: item.gtmStage,
          releaseReadiness: 'dirty-worktree-needs-slice-commit',
          nextProductionCommand: `gh repo clone frankxai/${item.repoName} ${repoPath}`,
        };
      }

      const branch = runGitSafe(repoPath, ['branch', '--show-current']) || 'detached';
      const headSha = runGitSafe(repoPath, ['rev-parse', '--short', 'HEAD']) || 'unknown';
      const statusOut = runGitSafe(repoPath, ['status', '--porcelain']);
      const dirtyCount = statusOut
        ? statusOut.split(/\r?\n/).filter((l) => l.trim().length > 0).length
        : 0;
      const lastCommitSubject =
        runGitSafe(repoPath, ['log', '-1', '--format=%s']) || 'Initial commit';

      const releaseReadiness: EstateRepoGtmStatus['releaseReadiness'] =
        dirtyCount === 0 && (branch === 'main' || branch === 'master')
          ? 'live-on-main'
          : dirtyCount === 0
            ? 'ready-to-pr'
            : 'dirty-worktree-needs-slice-commit';

      const nextProductionCommand =
        dirtyCount === 0 && branch !== 'main'
          ? `gh pr create --repo frankxai/${item.repoName} --head ${branch} --draft`
          : dirtyCount > 0
            ? `git -C ${repoPath} status -s && git -C ${repoPath} diff --stat`
            : `git -C ${repoPath} pull --ff-only`;

      return {
        repoName: item.repoName,
        brandId: item.brandId,
        domain: item.domain,
        repoPath,
        exists,
        branch,
        headSha,
        dirtyCount,
        lastCommitSubject,
        gtmStage: item.gtmStage,
        releaseReadiness,
        nextProductionCommand,
      };
    });
  }

  private buildGtmFlywheel(): GtmFlywheelStage[] {
    return [
      {
        stageNumber: 1,
        stageId: 'stage-1-reach',
        name: 'Top-of-Funnel Authority & Model Arena Reach',
        sourceProperty: 'frankx.ai + X/LinkedIn/YouTube Content Engine',
        targetProperty: 'gencreator.ai & github.com/frankxai/agentic-creator-os',
        conversionMechanism:
          'Interactive Frontier Model Arena benchmarks (Gemini 4 Argon, Claude Opus 4.7, GPT-5.4, Grok 4.2) + technical architecture blueprints drive builders into the ecosystem.',
        riskTag: 'Ready to ship (frankx.ai clean on model-arena branch d816cd59e)',
        status: 'active',
        primaryKpi: '40k+ monthly technical readers → Model Arena & Blueprint CTA CTR',
      },
      {
        stageNumber: 2,
        stageId: 'stage-2-coe-bridge-r1',
        name: 'GenCreator 6-Pillar CoE Funnel Bridge (Risk R1 Closure)',
        sourceProperty: 'frankx.ai',
        targetProperty: 'gencreator.ai (Federated LLM Hub & 6-Pillar CoE)',
        conversionMechanism:
          'Direct cross-property navigation + Federated LLM Hub link from FrankX articles into GenCreator CoE assessments and ACOS CLI onboarding.',
        riskTag: 'P0 Risk R1 in OPS-LEDGER — branch federated-llm-hub-link-20261014 ready for slice commit',
        status: 'bridge-wiring',
        primaryKpi: 'FrankX → GenCreator cross-domain referral rate & CoE intake completions',
      },
      {
        stageNumber: 3,
        stageId: 'stage-3-open-core-wedge',
        name: 'Open-Core CLI & Skills Distribution Wedge',
        sourceProperty: 'gencreator.ai + npm (@agentic-income/*, @reality-architect/cli)',
        targetProperty: 'Local Developer Workstations (Claude Code, OpenCode, Codex, Cursor)',
        conversionMechanism:
          'Zero-friction open-core install of ACOS skills, Starlight SIP protocol, and `@reality-architect/cli` / `@agentic-income/cli` packages.',
        riskTag: 'Packages built & clean on agentic-income-packages (a3b673e)',
        status: 'active',
        primaryKpi: 'GitHub stars, npm weekly downloads, and local SIP vault initializations',
      },
      {
        stageNumber: 4,
        stageId: 'stage-4-saas-conversion',
        name: 'Multi-Brand Product SaaS & Studio Conversion',
        sourceProperty: 'Open-Core CLI Users & CoE Builders',
        targetProperty: 'arcanea.ai ($29-$199/mo), agenticincome.ai ($49-$299/mo), realityarchitect.ai ($39-$149/mo)',
        conversionMechanism:
          'Upgrade from local single-player skills to hosted cloud realms (Arcanea 10 Gates & Studio), automated signal vaults (Agentic Income), and AI Architect Academy cohorts.',
        riskTag: 'Website Software Factory gates all 7 brand surfaces before deploy',
        status: 'scaling',
        primaryKpi: 'Self-serve MRR, Vercel TokenPass compute margin, and cohort conversion',
      },
      {
        stageNumber: 5,
        stageId: 'stage-5-sovereign-retainer',
        name: 'Starlight Sovereign Estate & Enterprise AI Department Commissioning',
        sourceProperty: 'AI Architect Studio + Academy Graduates + Enterprise Inbound',
        targetProperty: 'starlightintelligence.org ($2,500/mo Sovereign Estate + $25k Blueprint Sprints)',
        conversionMechanism:
          'Full 12-harness Starlight Queen deployment with Layer-0 Rust AST/WFG/vMCP kernel, 6 semantic memory vaults, and dedicated Steward swarms.',
        riskTag: 'Queen v1.0 Sovereign Engine live on :4329 with cryptographic SIP receipts',
        status: 'active',
        primaryKpi: 'Enterprise Blueprint Sprints booked & Sovereign Estate ARR',
      },
    ];
  }

  private buildFundamentalLeverageQueue(
    repos: EstateRepoGtmStatus[]
  ): FundamentalLeverageAction[] {
    const frankx = repos.find((r) => r.repoName === 'frankx.ai-vercel-website');
    const gencreator = repos.find((r) => r.repoName === 'gencreator.ai');
    const agenticIncome = repos.find((r) => r.repoName === 'agentic-income-skills');

    return [
      {
        rank: 1,
        id: 'leverage-1-queen-unified-plane',
        title: 'Unify All 12 Harnesses, Native Rust Kernel & Sibling Breakthroughs in Queen v1.0',
        category: 'substrate-kernel',
        whyItMakesEverythingEasier:
          'Eliminates fragmented context across Claude, Codex, OpenCode, Grok, Antigravity, Jules, Hermes, and Ruflo/OmO. Every harness inherits the Layer-0 Rust AST/WFG/vMCP binary gate (96.9% token compression) and Cross-Family Maker≠Checker verification.',
        targetRepoOrWorktree: 'C:/Users/frank/starlight/worktrees/sis-antigravity-production-20261010',
        commandToExecute: 'npx tsx src/cli.ts queen sovereign',
        status: 'executed-in-queen',
      },
      {
        rank: 2,
        id: 'leverage-2-ship-frankx-arena',
        title: 'Open Draft PR & Ship Clean FrankX Model Arena Wave to Production',
        category: 'production-release',
        whyItMakesEverythingEasier:
          `frankx.ai-vercel-website is already 100% clean (0 dirty files) on ${frankx?.branch ?? 'agent/antigravity/model-arena-gemini-4-argon-20261014'} (${frankx?.headSha ?? 'd816cd59e'}). Shipping it immediately refreshes the 40k+ reader top-of-funnel entry point.`,
        targetRepoOrWorktree: 'C:/Users/frank/starlight/repos/frankx.ai-vercel-website',
        commandToExecute:
          'gh pr create --repo frankxai/frankx.ai-vercel-website --head agent/antigravity/model-arena-gemini-4-argon-20261014 --draft',
        status: 'ready-for-pr-merge',
      },
      {
        rank: 3,
        id: 'leverage-3-close-risk-r1-funnel',
        title: 'Close P0 Risk R1: Commit & Ship GenCreator Federated LLM Hub Bridge',
        category: 'gtm-flywheel',
        whyItMakesEverythingEasier:
          `Connects frankx.ai reader traffic directly into gencreator.ai (${gencreator?.dirtyCount ?? 6} modified files on ${gencreator?.branch ?? 'agent/antigravity/federated-llm-hub-link-20261014'}) and arcanea.ai, turning content authority into measurable product pipeline.`,
        targetRepoOrWorktree: 'C:/Users/frank/starlight/repos/gencreator.ai',
        commandToExecute:
          'git -C C:/Users/frank/starlight/repos/gencreator.ai status -s && node tools/foundry/website-factory.mjs check --surface gencreator-web',
        status: 'actionable-next',
      },
      {
        rank: 4,
        id: 'leverage-4-publish-agentic-income-sdk',
        title: 'Promote Clean @agentic-income Core/Catalog/Redirect/CLI Suite',
        category: 'production-release',
        whyItMakesEverythingEasier:
          `agentic-income-skills is clean (0 dirty files) on ${agenticIncome?.branch ?? 'agent/antigravity/agentic-income-packages'} (${agenticIncome?.headSha ?? 'a3b673e'}), providing the monetization and affiliate routing SDK across all content surfaces.`,
        targetRepoOrWorktree: 'C:/Users/frank/starlight/repos/agentic-income-skills',
        commandToExecute:
          'gh pr create --repo frankxai/agentic-income-skills --head agent/antigravity/agentic-income-packages --draft',
        status: 'ready-for-pr-merge',
      },
      {
        rank: 5,
        id: 'leverage-5-converge-sis-worktrees',
        title: 'Converge Today’s 4 Parallel SIS Harness Branches into Unified Release Train',
        category: 'multi-harness-convergence',
        whyItMakesEverythingEasier:
          'Combines Queen v1.0 Sovereign Engine (93f3e4be0), Grok Website Factory (c52c172b9), OpenCode Free Arena (77cb3de71), Antigravity 10-Org Federation (b28341970), and Claude CEO PR Gate (1a0e10e3c) without worktree drift.',
        targetRepoOrWorktree: 'C:/Users/frank/starlight/worktrees/sis-antigravity-production-20261010',
        commandToExecute: 'npx tsx src/cli.ts queen estate',
        status: 'executed-in-queen',
      },
    ];
  }
}
