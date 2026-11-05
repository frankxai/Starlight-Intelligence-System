import assert from 'node:assert/strict';
import test from 'node:test';
import {
  transitionLease, isCurrentLease, createLeaseCoordinator, MAX_OPERATIONS,
} from '../services/starlight-cloud-worker/src/swarm-lease-state.ts';

const binding = { tenantId: 'tenant-a', resourceId: 'repository/main' };
const now = 1_000_000;
const acquire = (patch = {}) => ({ ...binding, action: 'acquire', operationId: 'op-1', ownerId: 'node-a', notAfter: now + 60_000, ttlMs: 10_000, ...patch });
const renew = (patch = {}) => ({ ...binding, action: 'renew', operationId: 'op-renew', ownerId: 'node-a', notAfter: now + 60_000, fence: 1, ttlMs: 20_000, ...patch });
const release = (patch = {}) => ({ ...binding, action: 'release', operationId: 'op-release', ownerId: 'node-a', notAfter: now + 60_000, fence: 1, ...patch });

// Synthetic transactional store. It models atomic commit/rollback and scheduling,
// not Cloudflare's deployed storage implementation. Restart reuses committed bytes.
class TransactionStore {
  value;
  tail = Promise.resolve();
  failWrite = false;
  failCommit = false;
  async transaction(callback) {
    const pending = this.tail.then(async () => {
      let staged = structuredClone(this.value);
      const result = await callback({
        get: async () => structuredClone(staged),
        put: async (_key, value) => {
          if (this.failWrite) throw new Error('injected write failure');
          staged = structuredClone(value);
        },
      });
      if (this.failCommit) throw new Error('injected commit failure');
      this.value = staged;
      return result;
    });
    this.tail = pending.catch(() => {});
    return pending;
  }
}

test('acquire binds the resource and owner without mutating inputs', () => {
  const request = acquire();
  const first = transitionLease(undefined, binding, request, now);
  assert.equal(first.result.status, 'acquired');
  assert.equal(first.result.fence, 1);
  assert.equal(isCurrentLease(first.state, binding, 'node-a', 1, now), true);
  assert.equal(isCurrentLease(first.state, binding, 'node-b', 1, now), false);
  request.ownerId = 'changed';
  first.result.fence = 8;
  assert.equal(first.state.operations[0].request.ownerId, 'node-a');
  assert.equal(first.state.operations[0].result.fence, 1);
});

test('idempotent acquisition does not extend its expiry or allocate another fence', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  const retry = transitionLease(first.state, binding, acquire(), now + 1000);
  assert.equal(retry.replayed, true);
  assert.deepEqual(retry.result, first.result);
  assert.equal(retry.state.fence, 1);
  assert.equal(first.state.lastObservedAt, now);
});

test('operation identity cannot change owner, deadline, duration or action', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  for (const request of [acquire({ ownerId: 'node-b' }), acquire({ notAfter: now + 5000 }), acquire({ ttlMs: 3000 }), release({ operationId: 'op-1' })]) {
    assert.throws(() => transitionLease(first.state, binding, request, now + 1), /payload conflict/);
  }
});

test('different operation conflicts even for the same live owner', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  const second = transitionLease(first.state, binding, acquire({ operationId: 'op-2' }), now + 1);
  assert.equal(second.result.status, 'conflict');
  assert.equal(second.state.fence, 1);
  assert.equal(second.state.lease.expiresAt, now + 10_000);
});

test('expiry and reacquisition fence out old-owner renewal and release', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  const second = transitionLease(first.state, binding, acquire({ operationId: 'op-2', ownerId: 'node-b' }), now + 10_000);
  assert.equal(second.result.fence, 2);
  assert.equal(isCurrentLease(second.state, binding, 'node-a', 1, now + 10_000), false);
  assert.equal(isCurrentLease(second.state, binding, 'node-b', 2, now + 10_000), true);
  for (const request of [renew(), release()]) {
    const stale = transitionLease(second.state, binding, request, now + 10_001);
    assert.equal(stale.result.status, 'stale');
    assert.deepEqual(stale.state.lease, second.state.lease);
  }
});

test('renewal cannot resurrect an expired lease, and shorter renewals do not shorten one', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  assert.equal(transitionLease(first.state, binding, renew(), now + 10_000).result.status, 'stale');
  const shorter = transitionLease(first.state, binding, renew({ ttlMs: 1 }), now + 1);
  assert.equal(shorter.result.expiresAt, first.result.expiresAt);
  const longer = transitionLease(first.state, binding, renew(), now + 1);
  assert.equal(longer.result.expiresAt, now + 20_001);
});

test('release retains the high-water fence and repeated release does not affect the successor', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  const freed = transitionLease(first.state, binding, release(), now + 1);
  const next = transitionLease(freed.state, binding, acquire({ operationId: 'op-2', ownerId: 'node-b' }), now + 2);
  assert.equal(next.result.fence, 2);
  const retry = transitionLease(next.state, binding, release(), now + 3);
  assert.equal(retry.result.status, 'released');
  assert.equal(retry.replayed, true);
  assert.equal(retry.state.lease.ownerId, 'node-b');
});

test('replayed acquisition is a historical acknowledgement, never a renewed grant', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  const retry = transitionLease(first.state, binding, acquire(), now + 10_000);
  assert.equal(retry.result.status, 'acquired');
  assert.equal(retry.replayed, true);
  assert.equal(isCurrentLease(retry.state, binding, 'node-a', retry.result.fence, now + 10_000), false);
});

test('wrong tenant, wrong resource, and moved persisted state fail closed', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  for (const patch of [{ tenantId: 'tenant-b' }, { resourceId: 'other' }]) {
    assert.throws(() => transitionLease(first.state, binding, acquire(patch), now), /outside binding/);
    assert.throws(() => transitionLease({ ...first.state, ...patch }, binding, acquire(), now), /persisted lease state/);
  }
});

test('malformed operations, nonfinite values and unbounded deadlines are rejected', () => {
  for (const request of [null, [], {}, acquire({ ttlMs: 0 }), acquire({ ttlMs: 300_001 }), acquire({ ttlMs: NaN }), acquire({ ttlMs: Infinity }), acquire({ notAfter: now }), acquire({ notAfter: now + 300_001 }), acquire({ extra: true }), acquire({ ownerId: '' }), renew({ fence: 0 }), renew({ fence: true }), release({ ttlMs: 1 })]) {
    assert.throws(() => transitionLease(undefined, binding, request, now));
  }
  assert.throws(() => transitionLease(undefined, binding, acquire(), NaN));
});

test('unknown or corrupt persisted state is not treated as empty', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  for (const state of [null, {}, { ...first.state, version: 2 }, { ...first.state, fence: -1 }, { ...first.state, lease: { ...first.state.lease, fence: 2 } }, { ...first.state, operations: [...first.state.operations, ...first.state.operations] }, { ...first.state, operations: [{ request: acquire(), result: { status: 'acquired', fence: Infinity, expiresAt: now + 1 } }] }]) {
    assert.throws(() => transitionLease(state, binding, acquire(), now));
  }
});

test('clock rollback, counter exhaustion and unsafe timestamp overflow fail closed', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  assert.throws(() => transitionLease(first.state, binding, acquire(), now - 1), /clock/);
  assert.equal(isCurrentLease(first.state, binding, 'node-a', 1, now - 1), false);
  assert.throws(() => transitionLease({ ...first.state, fence: Number.MAX_SAFE_INTEGER, lease: null }, binding, acquire({ operationId: 'next' }), now + 1), /exhausted/);
  assert.throws(() => transitionLease(undefined, binding, acquire({ notAfter: Number.MAX_SAFE_INTEGER }), Number.MAX_SAFE_INTEGER - 1), /exhausted/);
});

test('persisted receipts cannot change action meaning, success fence or expiry bounds', () => {
  const first = transitionLease(undefined, binding, acquire(), now);
  for (const result of [
    { status: 'released', fence: 0, expiresAt: 999999999999 },
    { status: 'acquired', fence: 0, expiresAt: now + 1000 },
    { status: 'acquired', fence: 1, expiresAt: null },
    { status: 'acquired', fence: 1, expiresAt: now + 300001 },
  ]) {
    const state = { ...first.state, operations: [{ request: acquire(), result }] };
    assert.throws(() => transitionLease(state, binding, acquire(), now), /persisted result/);
  }
  assert.throws(() => transitionLease({ ...first.state, lease: { ...first.state.lease, expiresAt: now + 300001 } }, binding, acquire(), now), /persisted lease/);
});

test('bounded operation history cannot evict unexpired deduplication evidence', () => {
  let state;
  for (let index = 0; index < MAX_OPERATIONS; index++) state = transitionLease(state, binding, acquire({ operationId: `op-${index}`, notAfter: now + 1 }), now).state;
  assert.throws(() => transitionLease(state, binding, acquire({ operationId: 'overflow' }), now), /capacity/);
  assert.equal(transitionLease(state, binding, acquire({ operationId: 'after-window' }), now + 1).state.operations.length, 1);
  assert.throws(() => transitionLease(state, binding, acquire({ operationId: 'op-0', notAfter: now + 1 }), now + 1), /expired/);
});

test('transaction adapter serializes competing acquisitions and survives re-instantiation', async () => {
  const storage = new TransactionStore();
  const first = createLeaseCoordinator(storage, binding, () => now);
  const second = createLeaseCoordinator(storage, binding, () => now);
  const outcomes = await Promise.all([first.apply(acquire()), second.apply(acquire({ ownerId: 'node-b', operationId: 'op-2' }))]);
  assert.deepEqual(outcomes.map(x => x.result.status), ['acquired', 'conflict']);
  const restarted = createLeaseCoordinator(storage, binding, () => now + 10_000);
  assert.equal((await restarted.apply(acquire({ ownerId: 'node-b', operationId: 'op-3' }))).result.fence, 2);
  await assert.rejects(first.apply(acquire()), /clock moved backwards/);
  assert.equal((await restarted.apply(acquire())).replayed, true);
});

test('failed durable writes or commits do not acknowledge ownership or consume a fence', async () => {
  for (const failure of ['failWrite', 'failCommit']) {
    const storage = new TransactionStore();
    const coordinator = createLeaseCoordinator(storage, binding, () => now);
    storage[failure] = true;
    await assert.rejects(coordinator.apply(acquire()), /injected/);
    assert.equal(storage.value, undefined);
    storage[failure] = false;
    assert.equal((await coordinator.apply(acquire())).result.fence, 1);
  }
});

test('lost response can replay after restart without advancing the fence', async () => {
  const storage = new TransactionStore();
  await createLeaseCoordinator(storage, binding, () => now).apply(acquire());
  const recovered = await createLeaseCoordinator(storage, binding, () => now + 1).apply(acquire());
  assert.equal(recovered.replayed, true);
  assert.equal(recovered.result.fence, 1);
  assert.equal(recovered.result.expiresAt, now + 10_000);
});

test('adapter snapshots mutable request and bootstrap binding before asynchronous work', async () => {
  const storage = new TransactionStore();
  const original = { ...binding };
  const coordinator = createLeaseCoordinator(storage, original, () => now);
  original.tenantId = 'tenant-b';
  const request = acquire();
  const pending = coordinator.apply(request);
  request.ownerId = 'node-b';
  await pending;
  assert.equal(storage.value.tenantId, 'tenant-a');
  assert.equal(storage.value.lease.ownerId, 'node-a');
});
