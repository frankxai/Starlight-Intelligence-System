/**
 * Starlight Queen — Swarm Command, Domain Generals and Compute Placement Router
 *
 * Implements the hierarchical swarm command topology:
 * - 5 Domain Generals (Architect, Weaver, Sentinel, Sage, Hermes)
 * - 4 Compute Placement Planes (Local Cockpit, Cloud Run Worker, GitHub Actions Council, Cloudflare Edge)
 * - 3 Model Routing Tiers (Scout, Build, Council)
 * - Local RAM Floor Spillover and Maker-Checker Review Policy
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import {
  isHighRiskPath,
  isReviewerAllowed,
  REVIEW_PROVIDERS,
  type MakerSeat,
  type ReviewProviderSeat,
} from './review-receipt.js';

export type ComputePlane =
  | 'local-cockpit'
  | 'cloud-run-worker'
  | 'github-actions-council'
  | 'cloudflare-edge';

export type DomainGeneralId =
  | 'starlight-architect'
  | 'starlight-weaver'
  | 'starlight-sentinel'
  | 'starlight-sage'
  | 'starlight-hermes';

export type SwarmModelTier = 'scout' | 'build' | 'council';

export type SwarmExecutionMode =
  | 'interactive'
  | 'autonomous-batch'
  | 'ci-verification'
  | 'edge-webhook';

export interface DomainGeneralProfile {
  id: DomainGeneralId;
  title: string;
  domain: string;
  defaultTier: SwarmModelTier;
  invariants: string[];
  requiredGates: string[];
}

export interface SwarmModelSelection {
  tier: SwarmModelTier;
  primaryModel: string;
  fallbackModel: string;
  rationale: string;
}

export interface HostTelemetrySnapshot {
  freeRamGb: number;
  activeLocalAgents: number;
  minFreeRamGb?: number;
  maxLocalAgents?: number;
}

export interface SwarmTaskRequest {
  id: string;
  repo: string;
  title: string;
  description: string;
  scopeFiles: string[];
  maker?: MakerSeat;
  mode?: SwarmExecutionMode;
  parallelCount?: number;
  requiresLiveDocs?: boolean;
}

export interface SwarmRoutingPlan {
  taskId: string;
  repo: string;
  leadGeneral: DomainGeneralProfile;
  supportingGenerals: DomainGeneralId[];
  computePlane: ComputePlane;
  computeReason: string;
  spilledOverToCloud: boolean;
  modelSelection: SwarmModelSelection;
  highRisk: boolean;
  highRiskFiles: string[];
  requiresContext7Grounding: boolean;
  reviewPolicy: {
    maker: MakerSeat;
    requiresCtoPass: boolean;
    allowedReviewers: ReviewProviderSeat[];
    autoMergeAllowed: boolean;
  };
}

export const DEFAULT_MIN_FREE_RAM_GB = 4.0;
export const DEFAULT_MAX_LOCAL_AGENTS = 2;

export const DOMAIN_GENERALS: Record<DomainGeneralId, DomainGeneralProfile> = {
  'starlight-architect': {
    id: 'starlight-architect',
    title: 'General of Architecture and Substrate',
    domain: 'architecture',
    defaultTier: 'build',
    invariants: [
      'Preserve backward-compatible TypeScript exports and SIP v1.1.1 protocol contracts.',
      'Prefer simple interfaces with deterministic internal state transitions.',
    ],
    requiredGates: ['npm test', 'symmetry-suites'],
  },
  'starlight-weaver': {
    id: 'starlight-weaver',
    title: 'General of Customer Experience and Design Excellence',
    domain: 'experience-design',
    defaultTier: 'build',
    invariants: [
      'Enforce sentence-case headings and Starlight editorial voice without generated prestige filler.',
      'Preserve responsive layout stability, keyboard navigation, and reduced-motion states.',
    ],
    requiredGates: ['design-contract', 'editorial-contract'],
  },
  'starlight-sentinel': {
    id: 'starlight-sentinel',
    title: 'General of Security, Governance and Fail-Closed Safety',
    domain: 'security-governance',
    defaultTier: 'council',
    invariants: [
      'Money and high-risk paths fail closed and never arm auto-merge.',
      'Enforce maker-checker independence on every review receipt.',
    ],
    requiredGates: ['merge-review-tests', 'independent-review-policy'],
  },
  'starlight-sage': {
    id: 'starlight-sage',
    title: 'General of Memory Vaults, Evals and Knowledge Synthesis',
    domain: 'memory-evals',
    defaultTier: 'build',
    invariants: [
      'Keep event-sourced JSONL vaults append-only with verifiable provenance.',
      'Ground claims in metrics/current.json with explicit verification timestamps.',
    ],
    requiredGates: ['vault-integrity', 'alexandria-tests'],
  },
  'starlight-hermes': {
    id: 'starlight-hermes',
    title: 'General of Cross-Repo Reconnaissance and Live Documentation',
    domain: 'reconnaissance',
    defaultTier: 'scout',
    invariants: [
      'Ground framework and SDK usage in Context7 live documentation before code synthesis.',
      'Deduplicate findings across repositories with exact file and commit provenance.',
    ],
    requiredGates: ['repo-bridge-check'],
  },
};

export const SWARM_MODEL_MATRIX: Record<SwarmModelTier, Omit<SwarmModelSelection, 'rationale'>> = {
  scout: {
    tier: 'scout',
    primaryModel: 'gemini-2.5-flash',
    fallbackModel: 'deepseek-v3.2',
  },
  build: {
    tier: 'build',
    primaryModel: 'claude-sonnet-4-6',
    fallbackModel: 'gpt-5.4',
  },
  council: {
    tier: 'council',
    primaryModel: 'claude-opus-4-6',
    fallbackModel: 'gpt-5.4-pro',
  },
};

const UI_OR_COPY_PATTERN =
  /(\.tsx$|\.jsx$|\.css$|components\/|app\/|pages\/|design|editorial|creator\.md|copy)/i;
const MEMORY_OR_EVAL_PATTERN =
  /(memory\/|vault|alexandria|eval|metrics\/|consolidation)/i;
const RECON_OR_DOCS_PATTERN =
  /(research\/|context7|docs\/research|search|recon|bridge)/i;
const FRAMEWORK_DOC_PATTERN =
  /(next|react|tailwind|cloudflare|supabase|prisma|drizzle|playwright|shadcn|radix)/i;

/**
 * Assigns the lead Domain General and supporting generals based on task files and intent.
 */
export function assignDomainGeneral(task: SwarmTaskRequest): {
  leadGeneral: DomainGeneralProfile;
  supportingGenerals: DomainGeneralId[];
  highRisk: boolean;
  highRiskFiles: string[];
} {
  const normalizedFiles = task.scopeFiles.map((f) => f.replace(/\\/g, '/'));
  const highRiskFiles = normalizedFiles.filter((f) => isHighRiskPath(f));
  const highRisk = highRiskFiles.length > 0;
  const combinedText = `${task.title} ${task.description} ${normalizedFiles.join(' ')}`;

  const supporting = new Set<DomainGeneralId>();
  let leadId: DomainGeneralId = 'starlight-architect';

  if (highRisk) {
    leadId = 'starlight-sentinel';
    supporting.add('starlight-architect');
  } else if (
    normalizedFiles.some((f) => UI_OR_COPY_PATTERN.test(f)) ||
    /\b(ui|ux|layout|navbar|modal|hero|responsive|sentence-case|editorial)\b/i.test(combinedText)
  ) {
    leadId = 'starlight-weaver';
    supporting.add('starlight-architect');
  } else if (
    normalizedFiles.some((f) => MEMORY_OR_EVAL_PATTERN.test(f)) ||
    /\b(vault|memory|eval|benchmark|alexandria|jsonl)\b/i.test(combinedText)
  ) {
    leadId = 'starlight-sage';
    supporting.add('starlight-architect');
  } else if (
    normalizedFiles.some((f) => RECON_OR_DOCS_PATTERN.test(f)) ||
    /\b(search|recon|survey|provenance|context7)\b/i.test(combinedText)
  ) {
    leadId = 'starlight-hermes';
    supporting.add('starlight-sage');
  } else {
    leadId = 'starlight-architect';
    supporting.add('starlight-sentinel');
  }

  if (highRisk && leadId !== 'starlight-sentinel') {
    supporting.add('starlight-sentinel');
  }
  if (normalizedFiles.some((f) => UI_OR_COPY_PATTERN.test(f)) && leadId !== 'starlight-weaver') {
    supporting.add('starlight-weaver');
  }

  supporting.delete(leadId);

  return {
    leadGeneral: DOMAIN_GENERALS[leadId],
    supportingGenerals: [...supporting],
    highRisk,
    highRiskFiles,
  };
}

/**
 * Selects the optimal compute plane while protecting local workstation RAM limits.
 */
export function selectComputePlane(
  task: SwarmTaskRequest,
  telemetry?: HostTelemetrySnapshot,
): {
  computePlane: ComputePlane;
  computeReason: string;
  spilledOverToCloud: boolean;
} {
  const mode = task.mode ?? 'interactive';
  const minFreeRamGb = telemetry?.minFreeRamGb ?? DEFAULT_MIN_FREE_RAM_GB;
  const maxLocalAgents = telemetry?.maxLocalAgents ?? DEFAULT_MAX_LOCAL_AGENTS;
  const parallelCount = task.parallelCount ?? 1;

  if (mode === 'ci-verification') {
    return {
      computePlane: 'github-actions-council',
      computeReason: 'Deterministic CI verification and merge-review gate evaluation run on GitHub Actions.',
      spilledOverToCloud: false,
    };
  }

  if (mode === 'edge-webhook') {
    return {
      computePlane: 'cloudflare-edge',
      computeReason: 'Low-latency webhook and telemetry routing runs on Cloudflare Workers edge.',
      spilledOverToCloud: false,
    };
  }

  if (!telemetry || !Number.isFinite(telemetry.freeRamGb) || telemetry.freeRamGb < 0 ||
      !Number.isInteger(telemetry.activeLocalAgents) || telemetry.activeLocalAgents < 0 ||
      !Number.isFinite(minFreeRamGb) || minFreeRamGb < DEFAULT_MIN_FREE_RAM_GB ||
      !Number.isInteger(maxLocalAgents) || maxLocalAgents < 1 || maxLocalAgents > DEFAULT_MAX_LOCAL_AGENTS ||
      !Number.isInteger(parallelCount) || parallelCount < 1) {
    throw new Error('Fresh finite host telemetry and non-weakened capacity limits are required.');
  }

  if (mode === 'autonomous-batch') {
    return {
      computePlane: 'cloud-run-worker',
      computeReason: `Batch execution (parallelCount=${parallelCount}) routes to scale-to-zero Cloud Run and Jules workers.`,
      spilledOverToCloud: false,
    };
  }

  if (telemetry.freeRamGb < minFreeRamGb) {
    return {
      computePlane: 'cloud-run-worker',
      computeReason: `Local free RAM (${telemetry.freeRamGb.toFixed(1)} GB) is below floor (${minFreeRamGb.toFixed(1)} GB); spilling over to Cloud Run worker.`,
      spilledOverToCloud: true,
    };
  }

  if (telemetry.activeLocalAgents + parallelCount > maxLocalAgents) {
    return {
      computePlane: 'cloud-run-worker',
      computeReason: `Active local agents (${telemetry.activeLocalAgents}) plus requested agents (${parallelCount}) exceed cap (${maxLocalAgents}); proposing Cloud Run worker.`,
      spilledOverToCloud: true,
    };
  }

  return {
    computePlane: 'local-cockpit',
    computeReason: `Local cockpit has sufficient headroom (${telemetry.freeRamGb.toFixed(1)} GB free, ${telemetry.activeLocalAgents}/${maxLocalAgents} active terminals).`,
    spilledOverToCloud: false,
  };
}

/**
 * Selects the model tier and primary/fallback frontier models for a task.
 */
export function selectModelTier(
  leadGeneral: DomainGeneralProfile,
  highRisk: boolean,
  task: SwarmTaskRequest,
): SwarmModelSelection {
  if (highRisk || leadGeneral.id === 'starlight-sentinel') {
    return {
      ...SWARM_MODEL_MATRIX.council,
      rationale: 'High-risk surface or Sentinel governance requires Council-tier reasoning.',
    };
  }

  if (leadGeneral.defaultTier === 'scout' && task.scopeFiles.length <= 2) {
    return {
      ...SWARM_MODEL_MATRIX.scout,
      rationale: 'Reconnaissance and lightweight triage route to fast Scout-tier models.',
    };
  }

  return {
    ...SWARM_MODEL_MATRIX.build,
    rationale: `Standard implementation under ${leadGeneral.id} routes to Build-tier frontier coding models.`,
  };
}

/**
 * Computes a complete SwarmRoutingPlan for a task across Domain Generals, compute planes, and review gates.
 */
export function routeSwarmTask(
  task: SwarmTaskRequest,
  telemetry?: HostTelemetrySnapshot,
): SwarmRoutingPlan {
  const maker: MakerSeat = task.maker ?? 'antigravity';
  const { leadGeneral, supportingGenerals, highRisk, highRiskFiles } = assignDomainGeneral(task);
  const { computePlane, computeReason, spilledOverToCloud } = selectComputePlane(task, telemetry);
  const modelSelection = selectModelTier(leadGeneral, highRisk, task);

  const combinedText = `${task.title} ${task.description} ${task.scopeFiles.join(' ')}`;
  const requiresContext7Grounding =
    Boolean(task.requiresLiveDocs) || FRAMEWORK_DOC_PATTERN.test(combinedText);

  const allowedReviewers = REVIEW_PROVIDERS.filter((provider) =>
    isReviewerAllowed(maker, provider, highRisk),
  );

  return {
    taskId: task.id,
    repo: task.repo,
    leadGeneral,
    supportingGenerals,
    computePlane,
    computeReason,
    spilledOverToCloud,
    modelSelection,
    highRisk,
    highRiskFiles,
    requiresContext7Grounding,
    reviewPolicy: {
      maker,
      requiresCtoPass: highRisk && maker !== 'cto',
      allowedReviewers,
      autoMergeAllowed: !highRisk,
    },
  };
}
