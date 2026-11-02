import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { handleRequest, FleetDelivery } from '../src/index.ts';
import { FakeStorage, environment, policy, payload, signed, operation, mockProvider } from './fixtures.mjs';

for (const event of ['push', 'pull_request', 'workflow_job']) {
  test(`${event}: accepted operation is pinned, sanitized and not a completion`, async t => {
    const { env, stores } = environment();
    const provider = mockProvider(t, async () => new Response(JSON.stringify({ name: operation, private_diagnostic: 'not-for-client' })));
    const response = await handleRequest(signed(payload(event), event), env);
    const result = await response.json();
    assert.equal(response.status, 202); assert.equal(result.completion_verified, false);
    assert.equal(JSON.stringify(result).includes('not-for-client'), false);
    const [url, options] = provider.mock.calls[0].arguments;
    assert.equal(url, 'https://run.googleapis.com/v2/projects/fixture-project/locations/europe-west4/jobs/fixture-job:run');
    assert.equal(options.redirect, 'manual'); assert.ok(options.signal);
    const body = JSON.parse(options.body);
    assert.equal(body.etag, 'fixture-etag'); assert.equal(body.overrides.taskCount, 1);
    assert.equal(body.overrides.timeout, '60s');
    const values = Object.fromEntries(body.overrides.containerOverrides[0].env.map(v => [v.name, v.value]));
    assert.equal(values.STARLIGHT_REPO, 'fixture/example'); assert.equal(values.STARLIGHT_COMMIT_SHA, 'a'.repeat(40));
    assert.equal(values.CALLBACK_URL, undefined);
    assert.equal(body.overrides.containerOverrides[0].args, undefined);
    assert.equal([...stores.values()][0].data.get('delivery').state, 'accepted');
  });
}
test('receipt survives object recreation and unsigned delivery-header changes', async t => {
  const { env, stores } = environment(); const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(), env)).status, 202);
  const next = environment(policy(), stores);
  const second = await handleRequest(signed(payload(), 'push', '/v1/github/events', { 'x-github-delivery': 'changed' }), next.env);
  assert.equal(second.status, 200); assert.equal((await second.json()).duplicate, true);
  assert.equal(provider.mock.callCount(), 1);
});
for (const [name, responder] of [
  ['network uncertainty', async () => { throw new Error('private credential-bearing failure'); }],
  ['timeout uncertainty', async () => { throw new DOMException('Timed out', 'TimeoutError'); }],
  ['upstream rejection', async () => new Response('private details', { status: 403 })],
  ['upstream error', async () => new Response('private details', { status: 500 })],
  ['redirect', async () => new Response('', { status: 302, headers: { Location: 'https://other.invalid' } })],
  ['invalid JSON', async () => new Response('{')],
  ['empty JSON', async () => new Response('{}')],
  ['null JSON', async () => new Response('null')],
  ['wrong operation project', async () => new Response(JSON.stringify({ name: operation.replace('fixture-project', 'other-project') }))],
  ['operation with error', async () => new Response(JSON.stringify({ name: operation, error: { message: 'private' } }))],
  ['operation traversal', async () => new Response(JSON.stringify({ name: operation + '/../other' }))],
  ['oversized provider receipt', async () => new Response(' '.repeat(65537))],
]) {
  test(`${name} holds the journal and forbids automatic replay`, async t => {
    const { env, stores } = environment(); const provider = mockProvider(t, responder);
    const first = await handleRequest(signed(), env);
    assert.equal(first.status, 502);
    assert.deepEqual(await first.json(), { error: 'runner_dispatch_uncertain', reconciliation_required: true });
    const second = await handleRequest(signed(), environment(policy(), stores).env);
    assert.equal(second.status, 409); assert.equal(provider.mock.callCount(), 1);
  });
}
test('failed claim persistence never calls the provider', async t => {
  const { env } = environment(); const store = new FakeStorage(); store.failAt = 1;
  env.FLEET_DELIVERIES.get = () => new FleetDelivery({ storage: store }, env);
  const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(), env)).status, 503);
  assert.equal(provider.mock.callCount(), 0);
});
test('failed accepted-receipt persistence retains the prior uncertain claim', async t => {
  const { env } = environment(); const store = new FakeStorage(); store.failAt = 2;
  env.FLEET_DELIVERIES.get = () => new FleetDelivery({ storage: store }, env);
  const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(), env)).status, 502);
  assert.equal(store.data.get('delivery').state, 'uncertain');
  assert.equal((await handleRequest(signed(), env)).status, 409);
  assert.equal(provider.mock.callCount(), 1);
});
for (const corrupt of [null, false, '', 0, {}, { state: 'accepted', fingerprint: 'wrong', operation }]) {
  test(`corrupt persisted receipt (${JSON.stringify(corrupt)}) fails closed`, async t => {
    const { env } = environment(); const store = new FakeStorage(); store.data.set('delivery', corrupt);
    env.FLEET_DELIVERIES.get = () => new FleetDelivery({ storage: store }, env);
    const provider = mockProvider(t);
    assert.equal((await handleRequest(signed(), env)).status, 503);
    assert.equal(provider.mock.callCount(), 0);
  });
}
test('expiration during durable claim prevents the external effect', async t => {
  const p = policy(); const { env } = environment(p); const store = new FakeStorage();
  const tx = store.transaction.bind(store);
  store.transaction = async fn => { const result = await tx(fn); t.mock.method(Date, 'now', () => Date.parse(p.expires_at)); return result; };
  env.FLEET_DELIVERIES.get = () => new FleetDelivery({ storage: store }, env);
  const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(), env)).status, 502);
  assert.equal(provider.mock.callCount(), 0);
});
test('policy changed during admission prevents stale-grant dispatch', async t => {
  const { env } = environment(); const store = new FakeStorage(); const tx = store.transaction.bind(store);
  store.transaction = async fn => { const result = await tx(fn); const p = JSON.parse(env.FLEET_ADMISSION_POLICY); p.policy_id = 'new-policy'; env.FLEET_ADMISSION_POLICY = JSON.stringify(p); return result; };
  env.FLEET_DELIVERIES.get = () => new FleetDelivery({ storage: store }, env);
  const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(), env)).status, 502);
  assert.equal(provider.mock.callCount(), 0);
});
test('internal binding independently rejects unsigned invocations', async t => {
  const { env } = environment(); const provider = mockProvider(t);
  const response = await new FleetDelivery({ storage: new FakeStorage() }, env).fetch(new Request('https://private.invalid/dispatch', { method: 'POST', body: '{}' }));
  assert.equal(response.status, 401); assert.equal(provider.mock.callCount(), 0);
});
test('fingerprint is the SHA256 of the exact signed body', async t => {
  const { env, stores } = environment(); mockProvider(t);
  await handleRequest(signed(), env);
  assert.equal([...stores.keys()][0], createHash('sha256').update(JSON.stringify(payload())).digest('hex'));
});
