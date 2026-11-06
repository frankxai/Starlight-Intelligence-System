import assert from 'node:assert/strict';
import test from 'node:test';
import { handleLifecycle, purgeTenantStorage } from '../dispatcher/src/lifecycle.ts';
import { canTransition, estimateMonthlyUsd, scriptNameFor, sha256Hex } from '../dispatcher/src/core.ts';

function env(token = 'admin-fixture', purgeOk = true) {
  const store = {};
  const purged = [];
  return {
    store,
    purged,
    async purgeTenant(id) { if (purgeOk) purged.push([id, store[id].state]); return purgeOk; },
    PLATFORM_ADMIN_TOKEN: token,
    DEFAULT_CAP_MICRO_USD: '5000000',
    adminLedgerFor: (id) => ({
      async read() { return { record: store[id] ?? null, usage: { periodStart: 'p', spentMicroUsd: 0 } }; },
      async create(record) { if (store[id]) return false; store[id] = record; return true; },
      async setState(state) { store[id] = { ...store[id], state }; },
    }),
  };
}

const call = (e, method, path, token = 'admin-fixture') =>
  handleLifecycle(new Request('https://platform.x' + path, { method, headers: { authorization: 'Bearer ' + token } }), e);

test('signup creates an unpaid tenant and returns the token once, storing only its hash', async () => {
  const e = env();
  const res = await call(e, 'POST', '/tenants/acme');
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.state, 'pending_payment');
  assert.equal(e.store.acme.tokenHash, await sha256Hex(body.accessToken));
  assert.equal(JSON.stringify(e.store).includes(body.accessToken), false);
  assert.equal((await call(e, 'POST', '/tenants/acme')).status, 409);
});

test('export omits the token hash; delete wipes agent storage first and is final', async () => {
  const e = env();
  await call(e, 'POST', '/tenants/acme');
  const exported = await (await call(e, 'GET', '/tenants/acme/export')).json();
  assert.equal('tokenHash' in exported.record, false);
  assert.equal((await call(e, 'DELETE', '/tenants/acme')).status, 200);
  assert.deepEqual(e.purged, [['acme', 'pending_payment']]);
  assert.equal((await call(e, 'DELETE', '/tenants/acme')).status, 409);
});

test('a failed purge leaves the tenant undeleted so delete can be retried', async () => {
  const e = env('admin-fixture', false);
  await call(e, 'POST', '/tenants/acme');
  assert.equal((await call(e, 'DELETE', '/tenants/acme')).status, 502);
  assert.equal(e.store.acme.state, 'pending_payment');
});

test('an active tenant is suspended before its storage is wiped', async () => {
  const e = env();
  await call(e, 'POST', '/tenants/acme');
  e.store.acme = { ...e.store.acme, state: 'active' };
  assert.equal((await call(e, 'DELETE', '/tenants/acme')).status, 200);
  assert.deepEqual(e.purged, [['acme', 'suspended']]);
  assert.equal(e.store.acme.state, 'deleted');
});

test('purge treats a never-uploaded Worker as already clean and anything else as failure', async () => {
  assert.equal(await purgeTenantStorage(() => { throw new Error('Worker not found: tenant--acme'); }), true);
  assert.equal(await purgeTenantStorage(() => { throw new Error('boom'); }), false);
  assert.equal(await purgeTenantStorage(() => ({ fetch: async () => new Response(null, { status: 500 }) })), false);
  assert.equal(await purgeTenantStorage(() => ({ fetch: async () => Response.json({ purged: true }) })), true);
});

test('lifecycle refuses a wrong token, an unset token and invalid tenant ids', async () => {
  assert.equal((await call(env(), 'POST', '/tenants/acme', 'wrong')).status, 401);
  assert.equal((await call(env(''), 'POST', '/tenants/acme', '')).status, 401);
  for (const id of ['a', 'platform', 'Acme', 'a--b', '..', 'acme-']) {
    assert.equal((await call(env(), 'POST', '/tenants/' + id)).status, 404, id);
  }
});

test('no path from deleted back to active, and payment is the only way out of pending', () => {
  assert.equal(canTransition('deleted', 'active'), false);
  assert.equal(canTransition('pending_payment', 'suspended'), false);
  assert.equal(canTransition('pending_payment', 'active'), true);
  assert.throws(() => scriptNameFor('../globex'));
});

test('cost model: flat $30 until included usage runs out, containers dominate per tenant', () => {
  const small = estimateMonthlyUsd({ tenants: 10, requestsPerTenant: 20_000, avgCpuMsPerRequest: 20, containerHoursPerTenant: 0 });
  assert.deepEqual(small, { platform: 30, perTenant: 0, total: 30 });
  const hour = estimateMonthlyUsd({ tenants: 1, requestsPerTenant: 0, avgCpuMsPerRequest: 0, containerHoursPerTenant: 1 });
  assert.equal(hour.perTenant, 0.11);
});
