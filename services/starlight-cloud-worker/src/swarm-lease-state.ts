/** Service-private arbitration core. Built on SIP; not a new public wire protocol.
 * The host authenticates identity before calling this module. A lease is not a
 * tool grant. Effect receivers must enforce its fence atomically with the effect.
 */
export const LEASE_STATE_VERSION = 1;
export const MAX_LEASE_MS = 300_000;
export const MAX_OPERATION_WINDOW_MS = 300_000;
export const MAX_OPERATIONS = 1024;

export interface LeaseBinding { tenantId: string; resourceId: string }
export interface Lease { ownerId: string; fence: number; expiresAt: number }
interface BaseOperation extends LeaseBinding {
  operationId: string;
  ownerId: string;
  notAfter: number;
}
export type LeaseOperation = BaseOperation & (
  { action: 'acquire'; ttlMs: number } |
  { action: 'renew'; fence: number; ttlMs: number } |
  { action: 'release'; fence: number }
);
export interface LeaseResult {
  status: 'acquired' | 'renewed' | 'released' | 'conflict' | 'stale';
  fence: number;
  expiresAt: number | null;
}
interface RecordedOperation {
  request: LeaseOperation;
  result: LeaseResult;
}
export interface LeaseState extends LeaseBinding {
  version: typeof LEASE_STATE_VERSION;
  fence: number;
  lastObservedAt: number;
  lease: Lease | null;
  operations: RecordedOperation[];
}
export interface LeaseTransition {
  state: LeaseState;
  result: LeaseResult;
  replayed: boolean;
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function keys(value: Record<string, unknown>, expected: string[]): boolean {
  return Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
}
function id(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(value);
}
function integer(value: unknown, min = 0): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min;
}
function binding(value: LeaseBinding): void {
  if (!object(value) || !keys(value, ['tenantId', 'resourceId']) || !id(value.tenantId) || !id(value.resourceId)) {
    throw new Error('Invalid lease binding');
  }
}
function operation(value: unknown): asserts value is LeaseOperation {
  if (!object(value)) throw new Error('Invalid lease operation');
  const action = value.action;
  const expected = ['tenantId', 'resourceId', 'operationId', 'ownerId', 'notAfter', 'action'];
  if (action === 'acquire' || action === 'renew') expected.push('ttlMs');
  if (action === 'renew' || action === 'release') expected.push('fence');
  if (!['acquire', 'renew', 'release'].includes(String(action)) || !keys(value, expected)
    || !id(value.tenantId) || !id(value.resourceId) || !id(value.operationId) || !id(value.ownerId)
    || !integer(value.notAfter, 1)
    || (action !== 'release' && (!integer(value.ttlMs, 1) || value.ttlMs > MAX_LEASE_MS))
    || (action !== 'acquire' && !integer(value.fence, 1))) throw new Error('Invalid lease operation');
}
function sameRequest(a: LeaseOperation, b: LeaseOperation): boolean {
  return Object.keys(a).every(key => a[key as keyof LeaseOperation] === b[key as keyof LeaseOperation]);
}
function assertState(value: unknown, expected: LeaseBinding): asserts value is LeaseState {
  if (!object(value) || !keys(value, ['version', 'tenantId', 'resourceId', 'fence', 'lastObservedAt', 'lease', 'operations'])
    || value.version !== LEASE_STATE_VERSION || value.tenantId !== expected.tenantId
    || value.resourceId !== expected.resourceId || !integer(value.fence) || !integer(value.lastObservedAt)
    || !Array.isArray(value.operations) || value.operations.length > MAX_OPERATIONS) throw new Error('Invalid persisted lease state');
  if (value.lease !== null && (!object(value.lease) || !keys(value.lease, ['ownerId', 'fence', 'expiresAt'])
    || !id(value.lease.ownerId) || !integer(value.lease.fence, 1) || value.lease.fence !== value.fence
    || !integer(value.lease.expiresAt, 1)
    || value.lease.expiresAt - value.lastObservedAt > MAX_LEASE_MS)) throw new Error('Invalid persisted lease');
  const seen = new Set<string>();
  for (const entry of value.operations) {
    if (!object(entry) || !keys(entry, ['request', 'result'])) throw new Error('Invalid persisted operation');
    operation(entry.request);
    const request = entry.request;
    if (request.tenantId !== expected.tenantId || request.resourceId !== expected.resourceId
      || seen.has(request.operationId)) throw new Error('Invalid persisted operation binding');
    seen.add(request.operationId);
    const result = entry.result;
    if (!object(result) || !keys(result, ['status', 'fence', 'expiresAt'])
      || !['acquired', 'renewed', 'released', 'conflict', 'stale'].includes(String(result.status))
      || !integer(result.fence) || result.fence > value.fence
      || !(result.expiresAt === null || integer(result.expiresAt, 1))) throw new Error('Invalid persisted result');
    const allowed = request.action === 'acquire' ? ['acquired', 'conflict']
      : request.action === 'renew' ? ['renewed', 'stale'] : ['released', 'stale'];
    if (!allowed.includes(String(result.status))
      || (['acquired', 'renewed', 'conflict'].includes(String(result.status))
        && (result.fence === 0 || result.expiresAt === null))
      || (result.status === 'released' && result.expiresAt !== null)
      || (['renewed', 'released'].includes(String(result.status))
        && (request.action === 'acquire' || result.fence !== request.fence))
      || (typeof result.expiresAt === 'number' && result.expiresAt - value.lastObservedAt > MAX_LEASE_MS)) {
      throw new Error('Invalid persisted result semantics');
    }
  }
}

/** Pure transition; now comes from the coordinator, never from the remote caller.
 * Replayed results are historical acknowledgements, not renewed execution rights.
 * Idempotency lasts through notAfter; expired records can be pruned. Callers must
 * use a fresh operation ID for new intent, never extend an old request's deadline.
 */
export function transitionLease(previous: unknown, expected: LeaseBinding, input: unknown, now: number): LeaseTransition {
  binding(expected);
  operation(input);
  if (!integer(now) || input.notAfter <= now || input.notAfter - now > MAX_OPERATION_WINDOW_MS
    || input.tenantId !== expected.tenantId || input.resourceId !== expected.resourceId) throw new Error('Lease operation expired or outside binding');
  if (previous !== undefined) assertState(previous, expected);
  const state: LeaseState = previous === undefined
    ? { version: LEASE_STATE_VERSION, ...expected, fence: 0, lastObservedAt: now, lease: null, operations: [] }
    : structuredClone(previous as LeaseState);
  if (now < state.lastObservedAt) throw new Error('Coordinator clock moved backwards');
  state.lastObservedAt = now;
  const recorded = state.operations.find(entry => entry.request.operationId === input.operationId);
  if (recorded) {
    if (!sameRequest(recorded.request, input)) throw new Error('Operation ID payload conflict');
    return { state, result: structuredClone(recorded.result), replayed: true };
  }
  state.operations = state.operations.filter(entry => entry.request.notAfter > now);
  if (state.operations.length >= MAX_OPERATIONS) throw new Error('Lease operation capacity reached');
  const current = state.lease !== null && state.lease.expiresAt > now ? state.lease : null;
  let result: LeaseResult;
  if (input.action === 'acquire') {
    if (current) result = { status: 'conflict', fence: state.fence, expiresAt: current.expiresAt };
    else {
      if (state.fence === Number.MAX_SAFE_INTEGER || !integer(now + input.ttlMs)) throw new Error('Lease counter or time exhausted');
      state.fence++;
      state.lease = { ownerId: input.ownerId, fence: state.fence, expiresAt: now + input.ttlMs };
      result = { status: 'acquired', fence: state.fence, expiresAt: state.lease.expiresAt };
    }
  } else if (!current || current.ownerId !== input.ownerId || current.fence !== input.fence) {
    result = { status: 'stale', fence: state.fence, expiresAt: current?.expiresAt ?? null };
  } else if (input.action === 'release') {
    state.lease = null;
    result = { status: 'released', fence: state.fence, expiresAt: null };
  } else {
    if (!integer(now + input.ttlMs)) throw new Error('Lease time exhausted');
    state.lease = { ...current, expiresAt: Math.max(current.expiresAt, now + input.ttlMs) };
    result = { status: 'renewed', fence: state.fence, expiresAt: state.lease.expiresAt };
  }
  state.operations.push({ request: structuredClone(input), result: structuredClone(result) });
  return { state, result, replayed: false };
}

/** Read-only qualification. Must be atomic with any protected resource mutation
 * at its receiver; checking this and then issuing an unrelated write is unsafe.
 */
export function isCurrentLease(state: unknown, expected: LeaseBinding, ownerId: string, fence: number, now: number): boolean {
  binding(expected);
  assertState(state, expected);
  if (!id(ownerId) || !integer(fence, 1) || !integer(now) || now < state.lastObservedAt) return false;
  return state.lease !== null && state.lease.ownerId === ownerId && state.lease.fence === fence && state.lease.expiresAt > now;
}

export interface LeaseTransaction {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}
export interface LeaseStorage {
  transaction<T>(callback: (transaction: LeaseTransaction) => Promise<T>): Promise<T>;
}

/** Adapter for DurableObjectStorage.transaction. No HTTP/RPC method is exposed.
 * The existing SwarmCoordinator must remain contained until trusted enrollment
 * binds an authenticated tenant/resource to this adapter at host bootstrap.
 */
export function createLeaseCoordinator(storage: LeaseStorage, expected: LeaseBinding, clock: () => number = Date.now) {
  binding(expected);
  const pinned = { ...expected };
  return {
    apply(input: unknown): Promise<Omit<LeaseTransition, 'state'>> {
      // Snapshot before yielding, so caller mutation cannot change an admitted request.
      operation(input);
      const request = structuredClone(input);
      return storage.transaction(async transaction => {
        const previous = await transaction.get<LeaseState>('swarm-lease-state:v1');
        const next = transitionLease(previous, pinned, request, clock());
        await transaction.put('swarm-lease-state:v1', next.state);
        return { result: next.result, replayed: next.replayed };
      });
    },
  };
}
