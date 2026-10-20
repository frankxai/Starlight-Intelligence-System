import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { StarlightCloudWorker, SwarmCoordinator } from './worker.mjs';
import oldWorker from './original-deployed.mjs';

const base = 'https://synthetic.invalid';
const token = 'synthetic-credential-not-issued-by-any-service';
const routes = [
  ['POST', '/v1/memory/append'], ['POST', '/v1/memory/query'],
  ['POST', '/v1/chat/completions'], ['POST', '/chat/completions'],
  ['POST', '/v1/vmcp/synthesize'], ['POST', '/v1/swarm/lease/acquire'],
  ['POST', '/v1/swarm/lease/release'], ['GET', '/v1/mcp/sse'],
  ['POST', '/v1/mcp/messages?sessionId=synthetic-b'], ['POST', '/v1/future-protected-route'],
];

test('old deployed code accepts a fabricated identity before routing; candidate contains it', async () => {
  const req = () => new Request(base + '/v1/future-protected-route', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal((await oldWorker.fetch(req(), {})).status, 404);
  assert.equal((await worker.fetch(req(), {})).status, 503);
});

for (const authorization of [undefined, 'Basic synthetic', 'Bearer ', 'Bearer', 'Bearer two tokens']) {
  test(`rejects malformed Authorization ${JSON.stringify(authorization)} before body access`, async () => {
    const request = new Request(base + '/v1/memory/query', {
      method: 'POST', headers: authorization ? { Authorization: authorization } : {}, body: '{bad-json',
    });
    assert.equal((await worker.fetch(request, {})).status, 401);
    assert.equal(request.bodyUsed, false);
  });
}

for (const tenant of ['synthetic-a', 'synthetic-b']) {
  for (const [method, path] of routes) {
    test(`contains ${method} ${path} for ${tenant} with zero protected effects`, async (t) => {
      let effects = 0;
      const forbidden = new Proxy({}, { get() { effects++; throw Error('protected binding accessed'); } });
      t.mock.method(globalThis, 'fetch', () => { effects++; throw Error('outbound fetch attempted'); });
      const request = new Request(base + path, {
        method, headers: {
          Authorization: `Bearer ${token}`, 'X-Starlight-Tenant': tenant,
          'Cf-Access-Jwt-Assertion': 'synthetic-unverified-assertion',
          'Cf-Access-Authenticated-User-Email': 'synthetic@invalid.example',
        }, ...(method === 'POST' ? { body: '{bad-json' } : {}),
      });
      const response = await worker.fetch(request, forbidden);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(await response.json(), {
        error: 'Service Unavailable', code: 'protected_api_unavailable',
        message: 'Protected API unavailable: verified identity and tenant membership are not configured.',
      });
      assert.equal(request.bodyUsed, false);
      assert.equal(effects, 0);
    });
  }
}

for (const path of ['/v1/health', '/health']) {
  test(`public ${path} declares protected service unavailable`, async () => {
    const response = await worker.fetch(new Request(base + path), {});
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).protectedApi, { status: 'unavailable', reason: 'identity_membership_verifier_missing' });
  });
}

test('public palace bytes and preflight behavior remain unchanged', async () => {
  const request = () => new Request(base + '/palace');
  assert.equal(await (await worker.fetch(request(), {})).text(), await (await oldWorker.fetch(request(), {})).text());
  assert.equal((await worker.fetch(new Request(base + '/v1/memory/append', { method: 'OPTIONS' }), {})).status, 204);
  assert.equal(StarlightCloudWorker.resolveTenant(), null);
});

for (const [method, path] of [['POST', '/lease/acquire'], ['GET', '/'], ['POST', '/lease/release'], ['OPTIONS', '/lease/acquire']]) {
  test(`direct coordinator ${method} ${path} cannot acquire or claim activity`, async () => {
    let effects = 0;
    const forbidden = new Proxy({}, { get() { effects++; throw Error('protected state accessed'); } });
    const response = await new SwarmCoordinator(forbidden, forbidden).fetch(new Request(base + path, { method }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal((await response.json()).code, 'swarm_coordinator_unavailable');
    assert.equal(effects, 0);
  });
}
