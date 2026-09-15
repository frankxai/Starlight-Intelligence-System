import { createHash } from 'node:crypto';
import { buildLoopEngine, runLoopEngine, type LoopEngineState } from './loop-engine.js';
import { compileLoopGraph, type LoopGraph } from './loop-graph.js';
import { isRfc3339Instant } from './work-graph.js';

/** One product workflow shared by brand packs; execution stays with the host. */
export const BRAND_STAGES = ['recover', 'research', 'design', 'build', 'refine', 'check', 'verify'] as const;
export type BrandStage = typeof BRAND_STAGES[number];
export type CriterionKind = 'behavior' | 'engineering' | 'design';
export interface BrandWorkflowContract {
  schema: 'starlight.brand-workflow.v1';
  workId: string;
  brand: string;
  repository: string;
  intent: { revision: string; outcome: string; sourceRefs: string[] };
  criteria: { id: string; kind: CriterionKind; description: string }[];
  references: { name: string; url: string }[];
  constraints: string[];
  maker: { actorId: string; provider: string };
  checker: { actorId: string; provider: string };
  maxAttempts: number;
  contextBudgetChars: number;
}

export interface BrandReceipt {
  stage: BrandStage;
  /** Binds this evidence to one stage of one admitted attempt. */
  operationId: string;
  actorId: string;
  provider: string;
  contractDigest: string;
  artifactDigest: string;
  evidenceRef: string;
  verdict: 'pass' | 'fail';
  criteria?: { id: string; verdict: 'pass' | 'fail'; evidenceRef: string }[];
}

export interface BrandJournal {
  schema: 'starlight.brand-journal.v1';
  contractDigest: string;
  attemptId: string;
  attemptNumber: number;
  admittedAt: string;
  receipts: BrandReceipt[];
  /** Persisted before dispatch; an uncertain outcome requires host reconciliation. */
  inFlight?: BrandStage;
}

export interface BrandInspection {
  status: 'ready' | 'complete' | 'blocked';
  reason?: string;
  next?: BrandStage;
  events: string[];
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown, max = 1024): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function strings(value: unknown, min: number, max: number): value is string[] {
  return Array.isArray(value) && value.length >= min && value.length <= max && value.every((v) => text(v));
}
function digest(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}
function identity(value: unknown): value is BrandWorkflowContract['maker'] {
  return object(value) && text(value.actorId, 160) && typeof value.provider === 'string' &&
    /^[a-z][a-z0-9-]{0,79}$/.test(value.provider);
}

/** Only JSON data. Hashes bind revisions; they do not authenticate an author. */
export function brandDigest(value: unknown): string {
  const canonical = (v: unknown, depth: number): string => {
    if (depth > 20) throw new Error('JSON nesting exceeds limit');
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return JSON.stringify(v);
    if (typeof v === 'number' && Number.isFinite(v)) return JSON.stringify(v);
    if (Array.isArray(v)) return `[${v.map((x) => canonical(x, depth + 1)).join(',')}]`;
    if (object(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k], depth + 1)}`).join(',')}}`;
    throw new Error('Expected finite JSON data');
  };
  return createHash('sha256').update(canonical(value, 0)).digest('hex');
}

export function validateBrandContract(value: unknown): string[] {
  if (!object(value)) return ['contract must be an object'];
  const issues: string[] = [];
  if (value.schema !== 'starlight.brand-workflow.v1') issues.push('invalid contract schema');
  for (const key of ['workId', 'brand', 'repository']) if (!text(value[key], 200)) issues.push(`invalid ${key}`);
  if (typeof value.repository !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(value.repository)) issues.push('repository must be owner/name');
  if (!object(value.intent) || !text(value.intent.revision, 160) || !text(value.intent.outcome, 2000) ||
    !strings(value.intent.sourceRefs, 1, 12)) issues.push('intent requires revision, outcome and bounded source references');
  if (!Array.isArray(value.criteria) || value.criteria.length < 1 || value.criteria.length > 24) {
    issues.push('criteria must contain 1–24 entries');
  } else {
    const ids = new Set<string>();
    const kinds = new Set<unknown>();
    for (const c of value.criteria) {
      if (!object(c) || !text(c.id, 80) || !text(c.description, 600) ||
        !['behavior', 'engineering', 'design'].includes(String(c.kind))) { issues.push('invalid criterion'); continue; }
      if (ids.has(c.id)) issues.push('duplicate criterion');
      ids.add(c.id); kinds.add(c.kind);
    }
    for (const kind of ['behavior', 'engineering', 'design']) if (!kinds.has(kind)) issues.push(`missing ${kind} criterion`);
  }
  if (!Array.isArray(value.references) || !value.references.length || value.references.length > 6 ||
    !value.references.every((r) => {
      if (!object(r) || !text(r.name, 160) || !text(r.url, 1000)) return false;
      try { const u = new URL(r.url); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
    })) issues.push('provide 1–6 named HTTPS design/product references');
  if (!strings(value.constraints, 0, 16)) issues.push('invalid constraints');
  if (!identity(value.maker) || !identity(value.checker)) issues.push('invalid actor/provider binding');
  else if (value.maker.actorId === value.checker.actorId || value.maker.provider === value.checker.provider) {
    issues.push('maker and checker must have different authenticated actors and providers');
  }
  if (!Number.isSafeInteger(value.maxAttempts) || Number(value.maxAttempts) < 1 || Number(value.maxAttempts) > 10) issues.push('maxAttempts must be 1–10');
  if (!Number.isSafeInteger(value.contextBudgetChars) || Number(value.contextBudgetChars) < 1000 || Number(value.contextBudgetChars) > 16000) {
    issues.push('contextBudgetChars must be 1000–16000');
  }
  try {
    brandDigest(value);
    if (JSON.stringify(value).length > Number(value.contextBudgetChars)) issues.push('context exceeds budget; curate sources without dropping acceptance criteria');
  } catch { issues.push('contract must contain bounded JSON data'); }
  return issues;
}

export function compileBrandWorkflow(value: unknown): { contract: BrandWorkflowContract; contractDigest: string; graph: LoopGraph } {
  const issues = validateBrandContract(value);
  if (issues.length) throw new Error(issues.join('; '));
  // Snapshot the caller's object. Later mutations must not change an admitted baseline.
  const contract = JSON.parse(JSON.stringify(value)) as BrandWorkflowContract;
  const contractDigest = brandDigest(contract);
  const graph: LoopGraph = {
    schema: 'starlight.loop-graph.v1', id: `brand-${contractDigest}`, shape: 'chain',
    executorRole: 'maker', supervisorRole: 'checker',
    brakes: { maxTurns: BRAND_STAGES.length, maxCostUnits: BRAND_STAGES.length, emptyRoundsToStop: 1,
      allowedActions: [], silenceTriggers: ['publish', 'spend', 'destroy'], requireWriteback: true },
    nodes: BRAND_STAGES.map((id) => ({ id, role: id === 'verify' ? 'checker' : 'maker',
      kind: 'agent', costUnits: 1, outputContract: `brand.${id}.v1` })),
    edges: BRAND_STAGES.slice(1).map((to, i) => ({ from: BRAND_STAGES[i], to, contract: `brand.${BRAND_STAGES[i]}.v1` })),
  };
  const compiled = compileLoopGraph(graph);
  if (!compiled.ok) throw new Error(compiled.issues.join('; '));
  return { contract, contractDigest, graph };
}

export function createBrandJournal(contract: BrandWorkflowContract, attemptId: string, attemptNumber: number, admittedAt: string): BrandJournal {
  const compiled = compileBrandWorkflow(contract);
  if (!text(attemptId, 160) || !Number.isSafeInteger(attemptNumber) || attemptNumber < 1 || attemptNumber > contract.maxAttempts || !isRfc3339Instant(admittedAt)) {
    throw new Error('invalid attempt or timestamp');
  }
  return { schema: 'starlight.brand-journal.v1', contractDigest: compiled.contractDigest, attemptId, attemptNumber, admittedAt, receipts: [] };
}

/** Replays a durable prefix through the existing loop engine; never executes a tool. */
export function inspectBrandWorkflow(value: unknown, journal: unknown, currentArtifactDigest: string): BrandInspection {
  const blocked = (reason: string): BrandInspection => ({ status: 'blocked', reason, events: [] });
  let compiled: ReturnType<typeof compileBrandWorkflow>;
  try { compiled = compileBrandWorkflow(value); } catch { return blocked('invalid-contract'); }
  const { contract, contractDigest, graph } = compiled;
  if (!object(journal) || journal.schema !== 'starlight.brand-journal.v1' || !text(journal.attemptId, 160) ||
    !Number.isSafeInteger(journal.attemptNumber) || Number(journal.attemptNumber) < 1 || Number(journal.attemptNumber) > contract.maxAttempts ||
    typeof journal.admittedAt !== 'string' || !isRfc3339Instant(journal.admittedAt) || !Array.isArray(journal.receipts) ||
    journal.receipts.length > BRAND_STAGES.length || !digest(currentArtifactDigest)) return blocked('invalid-journal');
  if (journal.contractDigest !== contractDigest) return blocked('intent-changed');
  if (journal.inFlight !== undefined) return blocked('reconciliation-required');
  const receipts = journal.receipts as BrandReceipt[];
  for (const [i, receipt] of receipts.entries()) {
    const actor = receipt?.stage === 'verify' ? contract.checker : contract.maker;
    if (!object(receipt) || receipt.stage !== BRAND_STAGES[i] || receipt.contractDigest !== contractDigest ||
      receipt.operationId !== brandDigest([contract.workId, journal.attemptId, contractDigest, receipt.stage]) ||
      receipt.actorId !== actor.actorId || receipt.provider !== actor.provider || !digest(receipt.artifactDigest) ||
      !text(receipt.evidenceRef) || !['pass', 'fail'].includes(receipt.verdict)) return blocked('invalid-receipt');
    if (receipt.verdict !== 'pass') return blocked('stage-failed');
    if (receipt.stage === 'check' || receipt.stage === 'verify') {
      const required = contract.criteria.filter((c) => receipt.stage === 'verify' || c.kind === 'engineering');
      if (!Array.isArray(receipt.criteria) || receipt.criteria.length !== required.length) return blocked('missing-criterion-evidence');
      const seen = new Set<string>();
      for (const result of receipt.criteria) {
        if (!object(result) || !required.some((c) => c.id === result.id) || seen.has(result.id) ||
          result.verdict !== 'pass' || !text(result.evidenceRef)) return blocked('invalid-criterion-evidence');
        seen.add(result.id);
      }
      if (receipt.artifactDigest !== receipts[i - 1]?.artifactDigest) return blocked('artifact-changed-after-refinement');
    }
  }
  if (receipts.length && receipts.at(-1)!.artifactDigest !== currentArtifactDigest) return blocked('artifact-drift');
  const trace = runLoopEngine(buildLoopEngine({ graph, workId: contract.workId, attemptId: journal.attemptId,
    correlationId: contract.workId, projectId: contract.repository, executorActorId: contract.maker.actorId,
    verifierActorId: contract.checker.actorId, now: () => journal.admittedAt as string }),
  receipts.map((r) => ({ node: r.stage, actor: r.actorId, writeback: r.evidenceRef, verdict: r.verdict })));
  const state = JSON.parse(trace.at(-1)!) as LoopEngineState;
  if (state.halted) return blocked(state.haltReason ?? 'loop-halted');
  const events = trace.filter((line) => !JSON.parse(line).__state);
  return state.completed ? { status: 'complete', events } : { status: 'ready', next: BRAND_STAGES[receipts.length], events };
}

export interface BrandWorkflowHost {
  /** Trusted host resolves current decisions, capacity, identities and actual artifact bytes. */
  readContract(): Promise<unknown>;
  artifactDigest(): Promise<string>;
  load(): Promise<BrandJournal>;
  /** Atomic compare-and-swap of a private journal; throw on a competing writer. */
  save(next: BrandJournal, expectedDigest: string): Promise<void>;
  admit(stage: BrandStage): Promise<boolean>;
  /** Authenticate provenance and resolve evidence; a model's claimed provider is insufficient. */
  authenticate(receipt: BrandReceipt): Promise<boolean>;
  /** Existing harness/runtime owns tool permissions, cancellation, time/cost limits and leases. */
  execute(stage: BrandStage, contract: BrandWorkflowContract, operationId: string, signal?: AbortSignal): Promise<BrandReceipt>;
}

/** One bounded wake of an existing host, not a scheduler. Never retries an uncertain effect. */
export async function runBrandWorkflow(host: BrandWorkflowHost, maxSteps = 1, signal?: AbortSignal): Promise<BrandInspection> {
  const stop = (reason: string): BrandInspection => ({ status: 'blocked', reason, events: [] });
  if (!Number.isSafeInteger(maxSteps) || maxSteps < 1 || maxSteps > BRAND_STAGES.length) return stop('invalid-step-budget');
  let journal = structuredClone(await host.load());
  for (let step = 0; step < maxSteps; step++) {
    if (signal?.aborted) return stop('cancelled');
    let current: BrandWorkflowContract;
    try { current = compileBrandWorkflow(await host.readContract()).contract; } catch { return stop('invalid-contract'); }
    const beforeArtifact = await host.artifactDigest();
    const inspection = inspectBrandWorkflow(current, journal, beforeArtifact);
    if (inspection.status === 'blocked') return inspection;
    for (const receipt of journal.receipts) if (!await host.authenticate(receipt)) return stop('unauthenticated-receipt');
    if (inspection.status === 'complete') {
      return inspectBrandWorkflow(await host.readContract(), journal, await host.artifactDigest());
    }
    const stage = inspection.next!;
    if (!await host.admit(stage)) return stop('capacity-held');
    if (signal?.aborted) return stop('cancelled');
    const { contract, contractDigest } = compileBrandWorkflow(current);
    const reserved: BrandJournal = { ...journal, inFlight: stage };
    try { await host.save(reserved, brandDigest(journal)); } catch { return stop('journal-conflict'); }
    // Last check before dispatch. If state changed, keep the reservation for reconciliation.
    if (signal?.aborted) return stop('cancelled');
    try {
      if (compileBrandWorkflow(await host.readContract()).contractDigest !== contractDigest) return stop('intent-changed');
      if (await host.artifactDigest() !== beforeArtifact) return stop('artifact-drift');
      const operationId = brandDigest([contract.workId, journal.attemptId, contractDigest, stage]);
      const receipt = structuredClone(await host.execute(stage, contract, operationId, signal));
      // Preserve even a failed or invalid receipt: it can explain a side effect after a crash.
      const next: BrandJournal = { ...journal, receipts: [...journal.receipts, receipt] };
      await host.save(next, brandDigest(reserved));
      journal = next;
      if (!await host.authenticate(receipt)) return stop('unauthenticated-receipt');
    } catch { return stop('reconciliation-required'); }
  }
  return inspectBrandWorkflow(await host.readContract(), journal, await host.artifactDigest());
}
