export const PLAYBOOK_SCHEMA = 'starlight.playbook.v1' as const;
export const PLAN_SCHEMA = 'starlight.playbook-plan.v1' as const;
export const RECEIPT_SCHEMA = 'starlight.playbook-receipt.v1' as const;

/** Content hashes lock bytes. The host resolves and authenticates those bytes. */
export type ResourceKind = 'skill' | 'tool' | 'model' | 'memory' | 'schema';
export interface ResourcePin {
  id: string;
  kind: ResourceKind;
  version: string;
  sha256: string;
  uri: string;
}
export interface Bindings {
  skill: string;
  outputSchema: string;
  model?: string;
  tools: string[];
  memory: { resource: string; purpose: string }[];
}
export interface CallLimits { modelCalls: number; toolCalls: number; }
export interface PlanLimits extends CallLimits { maxNodes: number; maxParallel: number; }
interface Action { id: string; bindings: Bindings; limits: CallLimits; }
export type Flow =
  | (Action & { kind: 'task' })
  | (Action & { kind: 'evaluator'; subject: string })
  | (Action & { kind: 'router'; cases: { value: string; flow: Flow }[] })
  | { kind: 'approval'; id: string; subject: string }
  | { kind: 'sequence'; id: string; steps: Flow[] }
  | { kind: 'parallel'; id: string; branches: Flow[] };
export interface Playbook {
  schema: typeof PLAYBOOK_SCHEMA;
  id: string;
  version: string;
  title: string;
  resources: ResourcePin[];
  limits: PlanLimits;
  flow: Flow;
}
export interface Guard { routerId: string; value: string; }
export interface PlanNode {
  id: string;
  kind: 'task' | 'router' | 'evaluator' | 'approval' | 'join';
  dependsOn: string[];
  guards: Guard[];
  bindings?: Bindings;
  limits?: CallLimits;
  subject?: string;
  routes?: string[];
}
export interface CompiledPlan {
  schema: typeof PLAN_SCHEMA;
  playbookId: string;
  playbookVersion: string;
  title: string;
  resources: ResourcePin[];
  limits: PlanLimits;
  worstCaseCalls: CallLimits;
  nodes: PlanNode[];
  digest: string;
}
export interface ExecutionReceipt {
  schema: typeof RECEIPT_SCHEMA;
  id: string;
  runId: string;
  planDigest: string;
  nodeId: string;
  status: 'started' | 'completed' | 'failed' | 'unknown';
  outputDigest?: string;
  subjectDigest?: string;
  route?: string;
  verdict?: 'pass' | 'fail';
  approval?: {
    subjectNodeId: string;
    subjectDigest: string;
    decision: 'approved' | 'rejected';
    attestationRef: string;
  };
}
export class PlaybookError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message); this.name = 'PlaybookError';
  }
}

export function assert(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new PlaybookError(code, message);
}
export function object(value: unknown, fields: string[], required = fields): Record<string, unknown> {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), 'invalid_shape', 'Expected an object.');
  const record = value as Record<string, unknown>;
  assert(Object.keys(record).every((key) => fields.includes(key)) && required.every((key) => Object.hasOwn(record, key)), 'invalid_shape', 'Missing or unsupported field.');
  return record;
}
export function identifier(value: unknown): asserts value is string {
  assert(typeof value === 'string' && /^[a-z][a-z0-9_-]{0,63}$/.test(value), 'invalid_id', 'Use a bounded lowercase identifier.');
}
export function digest(value: unknown): asserts value is string {
  assert(typeof value === 'string' && /^[a-f0-9]{64}$/.test(value), 'invalid_digest', 'Expected a SHA-256 digest.');
}
export function integer(value: unknown, minimum: number, maximum: number): asserts value is number {
  assert(Number.isSafeInteger(value) && Number(value) >= minimum && Number(value) <= maximum, 'invalid_limit', 'Limit is outside the supported range.');
}
export function boundedArray(value: unknown, max = 128, min = 0): asserts value is unknown[] {
  assert(Array.isArray(value) && value.length >= min && value.length <= max, 'invalid_shape', 'Array length is outside the supported range.');
}
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
export function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
export async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonical(value));
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Parse JSON text only: executable objects, getters and toJSON are not a wire format. */
export function parseJson(source: string, maximumBytes: number): unknown {
  assert(typeof source === 'string' && source.length <= maximumBytes && new TextEncoder().encode(source).length <= maximumBytes, 'input_too_large', 'JSON exceeds its byte limit.');
  try { return JSON.parse(source); } catch { throw new PlaybookError('invalid_json', 'Expected valid JSON.'); }
}
