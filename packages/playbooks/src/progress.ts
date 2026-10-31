import { RECEIPT_SCHEMA, assert, boundedArray, canonical, digest, freeze, object, parseJson, PlaybookError } from './manifest.js';
import type { CompiledPlan, ExecutionReceipt, PlanNode } from './manifest.js';
import { isCompiledPlan } from './compiler.js';

export interface NodeProgress {
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed' | 'unknown' | 'rejected';
  outputDigest?: string;
  route?: string;
}
export interface ExecutionProjection {
  runId: string;
  planDigest: string;
  status: 'ready' | 'running' | 'blocked' | 'completed';
  nodes: Record<string, NodeProgress>;
  ready: string[];
  blocking: string[];
  receiptCount: number;
}
export interface ProjectionHost {
  /** Supplied by authenticated durable runtime, never by a model or manifest. */
  runId: string;
  /**
   * Verify provenance, principal/tenant, output/schema and decision evidence.
   * Approvals additionally require the host's authenticated human attestation.
   * This port must not trust fields such as caller-supplied `verified: true`.
   */
  verifyReceipt(receipt: Readonly<ExecutionReceipt>, context: Readonly<{ plan: CompiledPlan; node: PlanNode; runId: string }>): boolean | Promise<boolean>;
}
function opaqueId(value: unknown): asserts value is string {
  assert(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value), 'invalid_receipt', 'Receipt and run identifiers must be bounded.');
}
function parseReceipt(value: unknown): ExecutionReceipt {
  const receipt = object(value, ['schema', 'id', 'runId', 'planDigest', 'nodeId', 'status', 'outputDigest', 'subjectDigest', 'route', 'verdict', 'approval'], ['schema', 'id', 'runId', 'planDigest', 'nodeId', 'status']);
  assert(receipt.schema === RECEIPT_SCHEMA, 'invalid_receipt', 'Unsupported receipt schema.');
  opaqueId(receipt.id); opaqueId(receipt.runId); digest(receipt.planDigest);
  assert(typeof receipt.nodeId === 'string' && receipt.nodeId.length <= 70, 'invalid_receipt', 'Invalid receipt node.');
  assert(typeof receipt.status === 'string' && ['started', 'completed', 'failed', 'unknown'].includes(receipt.status), 'invalid_receipt', 'Unsupported receipt status.');
  for (const key of ['outputDigest', 'subjectDigest'] as const) if (receipt[key] !== undefined) digest(receipt[key]);
  if (receipt.route !== undefined) assert(typeof receipt.route === 'string' && /^[a-z][a-z0-9_-]{0,63}$/.test(receipt.route), 'invalid_receipt', 'Invalid route.');
  if (receipt.verdict !== undefined) assert(receipt.verdict === 'pass' || receipt.verdict === 'fail', 'invalid_receipt', 'Invalid verdict.');
  if (receipt.approval !== undefined) {
    const approval = object(receipt.approval, ['subjectNodeId', 'subjectDigest', 'decision', 'attestationRef']);
    assert(typeof approval.subjectNodeId === 'string', 'invalid_receipt', 'Approval subject is required.'); digest(approval.subjectDigest);
    assert(approval.decision === 'approved' || approval.decision === 'rejected', 'invalid_receipt', 'Invalid approval decision.');
    assert(typeof approval.attestationRef === 'string' && approval.attestationRef.length > 0 && approval.attestationRef.length <= 512, 'invalid_receipt', 'Host attestation reference is required.');
  }
  if (receipt.status !== 'completed') assert(['outputDigest', 'subjectDigest', 'route', 'verdict', 'approval'].every((key) => receipt[key] === undefined), 'invalid_receipt', 'Only completed receipts may carry outputs or decisions.');
  return receipt as unknown as ExecutionReceipt;
}

/**
 * Pure replay of an ordered host journal. This function never dispatches work,
 * authorizes an effect, authenticates a user or creates a paid-call reservation.
 * Persist claims atomically before dispatch; concurrent projections are not locks.
 */
export async function projectExecution(plan: CompiledPlan, receiptsJson: string, host: ProjectionHost): Promise<ExecutionProjection> {
  assert(isCompiledPlan(plan), 'uncompiled_plan', 'Recompile the original manifest before replaying a plan.');
  assert(host && typeof host.verifyReceipt === 'function', 'verifier_required', 'A host receipt verifier is required.');
  const runId = host.runId; opaqueId(runId);
  const verify = host.verifyReceipt.bind(host);
  const raw = parseJson(receiptsJson, 1048576); boundedArray(raw, 512);
  const receipts = freeze(raw.map(parseReceipt));
  const nodes: Record<string, NodeProgress> = Object.create(null);
  const index = new Map(plan.nodes.map((node) => [node.id, node]));
  for (const node of plan.nodes) nodes[node.id] = { status: 'pending' };
  const blocked = () => plan.nodes.filter((node) => ['failed', 'unknown', 'rejected'].includes(nodes[node.id].status)).map((node) => node.id);
  const satisfied = (node: PlanNode) => node.dependsOn.every((id) => ['completed', 'skipped'].includes(nodes[id].status));
  const guardState = (node: PlanNode): 'active' | 'inactive' | 'pending' => {
    let pending = false;
    for (const guard of node.guards) {
      const decision = nodes[guard.routerId];
      if (decision.status === 'skipped') return 'inactive';
      if (decision.status !== 'completed') pending = true;
      else if (decision.route !== guard.value) return 'inactive';
    }
    return pending ? 'pending' : 'active';
  };
  const settle = () => {
    // Compiler emits topological order, so one pass propagates skips and joins.
    for (const node of plan.nodes) {
      if (nodes[node.id].status !== 'pending') continue;
      const guard = guardState(node);
      if (guard === 'inactive') nodes[node.id].status = 'skipped';
      else if (node.kind === 'join' && guard === 'active' && satisfied(node)) nodes[node.id].status = 'completed';
    }
  };
  const ready = () => {
    if (blocked().length) return [];
    const running = Object.values(nodes).filter((node) => node.status === 'running').length;
    return plan.nodes.filter((node) => node.kind !== 'join' && nodes[node.id].status === 'pending' && guardState(node) === 'active' && satisfied(node)).slice(0, plan.limits.maxParallel - running).map((node) => node.id);
  };
  const seen = new Map<string, string>();
  for (const receipt of receipts) {
    const bytes = canonical(receipt);
    if (seen.has(receipt.id)) {
      assert(seen.get(receipt.id) === bytes, 'receipt_conflict', 'A receipt ID was reused for different evidence.'); continue;
    }
    assert(receipt.runId === runId && receipt.planDigest === plan.digest, 'receipt_scope', 'Receipt belongs to another run or plan.');
    const node = index.get(receipt.nodeId);
    assert(node && node.kind !== 'join', 'invalid_receipt', 'Receipt must name an executable node.');
    let verified = false;
    try { verified = (await verify(receipt, freeze({ plan, node, runId }))) === true; }
    catch { throw new PlaybookError('unverified_receipt', 'Host receipt verification failed.'); }
    assert(verified, 'unverified_receipt', 'Host did not verify this receipt.');
    settle();
    const progress = nodes[node.id];
    if (receipt.status === 'started') {
      assert(ready().includes(node.id), 'invalid_transition', 'Node is not ready or concurrency is exhausted.');
      progress.status = 'running';
    } else {
      assert(progress.status === 'running', 'invalid_transition', 'Only a started node may finish; terminal and unknown effects cannot restart.');
      if (receipt.status === 'failed' || receipt.status === 'unknown') progress.status = receipt.status;
      else {
        if (node.kind === 'approval') {
          const approval = receipt.approval;
          assert(approval && receipt.outputDigest === undefined && receipt.subjectDigest === undefined && receipt.route === undefined && receipt.verdict === undefined, 'invalid_evidence', 'Approval requires only a bound host attestation.');
          assert(approval.subjectNodeId === node.subject && approval.subjectDigest === nodes[node.subject!].outputDigest, 'invalid_evidence', 'Approval must bind the exact subject artifact.');
          progress.status = approval.decision === 'approved' ? 'completed' : 'rejected';
        } else {
          assert(receipt.outputDigest !== undefined && receipt.approval === undefined, 'invalid_evidence', 'A completed action needs an output digest.');
          assert((node.kind === 'router') === (receipt.route !== undefined), 'invalid_evidence', 'Router evidence is required only for routing nodes.');
          assert((node.kind === 'evaluator') === (receipt.verdict !== undefined) && (node.kind === 'evaluator') === (receipt.subjectDigest !== undefined), 'invalid_evidence', 'Evaluation needs a verdict and subject digest.');
          if (node.kind === 'router') assert(node.routes!.includes(receipt.route!), 'invalid_evidence', 'Route is not present in the pinned plan.');
          if (node.kind === 'evaluator') assert(receipt.subjectDigest === nodes[node.subject!].outputDigest, 'invalid_evidence', 'Evaluation must bind the exact subject artifact.');
          progress.status = receipt.verdict === 'fail' ? 'rejected' : 'completed';
          progress.outputDigest = receipt.outputDigest;
          if (receipt.route !== undefined) progress.route = receipt.route;
        }
      }
    }
    seen.set(receipt.id, bytes);
  }
  settle(); const blocking = blocked(); const available = ready();
  const status = blocking.length ? 'blocked' : Object.values(nodes).every((node) => ['completed', 'skipped'].includes(node.status)) ? 'completed' : available.length ? 'ready' : 'running';
  return freeze({ runId, planDigest: plan.digest, status, nodes, ready: available, blocking, receiptCount: seen.size });
}
