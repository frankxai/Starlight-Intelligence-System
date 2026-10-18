/**
 * Synthetic cloud-worker containment checks. No live services are contacted.
 * Protected routes remain unavailable until verified identity and membership
 * are wired; the component checks do not establish deployed readiness.
 * Built on SIP v1.1.1
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import worker, { StarlightCloudWorker } from '../services/starlight-cloud-worker/src/index.js';
import { StarlightCloudConnector } from '../src/gateway/cloud-connector.js';

const BASE_URL = 'https://worker.invalid';
const TEST_API_KEY = 'synthetic-credential-not-issued-by-any-service';

const protectedRoutes = [
  ['POST', '/v1/memory/append', { content: 'synthetic memory' }],
  ['POST', '/v1/memory/query', { query: 'synthetic' }],
  ['POST', '/v1/chat/completions', { model: 'starlight-edge', messages: [{ role: 'user', content: 'synthetic' }] }],
  ['POST', '/chat/completions', { messages: [{ role: 'user', content: 'synthetic' }] }],
  ['POST', '/v1/vmcp/synthesize', { agentId: 'synthetic-agent', activeIntent: 'memory query' }],
  ['POST', '/v1/swarm/lease/acquire', { agentId: 'synthetic-agent', worktree: '/fixture', paths: ['fixture.ts'] }],
  ['POST', '/v1/swarm/lease/release', { leaseId: 'synthetic-lease' }],
  ['GET', '/v1/mcp/sse', undefined],
  ['POST', '/v1/mcp/messages?sessionId=tenant-b', { method: 'tools/call' }],
  ['POST', '/v1/future-protected-route', {}],
] as const;

describe('Cloud worker ingress containment (synthetic requests)', () => {
  for (const path of ['/v1/health', '/health']) {
    it(`keeps ${path} public and reports protected API unavailability`, async () => {
      const res = await StarlightCloudWorker.handleRequest(new Request(`${BASE_URL}${path}`));
      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.service, 'starlight-cloud-worker');
      assert.equal(body.protectedApi.status, 'unavailable');
      assert.equal(body.protectedApi.reason, 'identity_membership_verifier_missing');
    });
  }

  it('keeps preflight free of protected execution', async () => {
    const req = new Request(`${BASE_URL}/v1/memory/append`, { method: 'OPTIONS' });
    const res = await StarlightCloudWorker.handleRequest(req);
    assert.equal(res.status, 204);
    assert.equal(await res.text(), '');
  });

  for (const authorization of [undefined, 'Basic synthetic', 'Bearer ', 'Bearer']) {
    it(`rejects missing/malformed authorization ${JSON.stringify(authorization)}`, async () => {
      const req = new Request(`${BASE_URL}/v1/memory/query`, {
        method: 'POST',
        headers: authorization ? { Authorization: authorization } : {},
        body: '{malformed-json',
      });
      const res = await StarlightCloudWorker.handleRequest(req);
      assert.equal(res.status, 401);
      assert.equal(req.bodyUsed, false);
    });
  }

  for (const tenant of ['tenant-a', 'tenant-b']) {
    for (const [method, path, payload] of protectedRoutes) {
      it(`contains ${method} ${path} for caller-asserted ${tenant} before any effect`, async (t) => {
        let effects = 0;
        const forbiddenEffect = () => { effects++; throw new Error('protected effect reached'); };
        t.mock.method(globalThis, 'fetch', forbiddenEffect);
        const req = new Request(`${BASE_URL}${path}`, {
          method,
          headers: {
            Authorization: `Bearer ${TEST_API_KEY}`,
            'X-Starlight-Tenant': tenant,
            'X-Starlight-Signature': 'caller-asserted-signature',
            'Cf-Access-Authenticated-User-Email': 'caller@tenant.invalid',
            'Cf-Access-Jwt-Assertion': 'caller-asserted-jwt',
            'Content-Type': 'application/json',
          },
          ...(payload ? { body: JSON.stringify(payload) } : {}),
        });
        const res = await StarlightCloudWorker.handleRequest(req, {
          ENVIRONMENT: 'production',
          STARLIGHT_DB: { prepare: forbiddenEffect },
          STARLIGHT_KV: { get: forbiddenEffect, put: forbiddenEffect, delete: forbiddenEffect },
          STARLIGHT_VECTORS: { query: forbiddenEffect, upsert: forbiddenEffect },
          AI: { run: forbiddenEffect },
        });
        assert.equal(res.status, 503);
        assert.equal(res.headers.get('Cache-Control'), 'no-store');
        const body = await res.json() as any;
        assert.equal(body.code, 'protected_api_unavailable');
        assert.equal(body.success, undefined);
        assert.equal(body.choices, undefined);
        assert.equal(body.results, undefined);
        assert.equal(body.leaseId, undefined);
        assert.equal(req.bodyUsed, false);
        assert.equal(effects, 0);
        assert.equal(JSON.stringify(body).includes(tenant), false);
        assert.equal(JSON.stringify(body).includes(TEST_API_KEY), false);
      });
    }
  }

  it('contains invalid JSON with an arbitrary bearer before parsing', async () => {
    const req = new Request(`${BASE_URL}/v1/memory/append`, {
      method: 'POST', headers: { Authorization: 'Bearer any-eight-characters' }, body: '{',
    });
    const res = await StarlightCloudWorker.handleRequest(req);
    assert.equal(res.status, 503);
    assert.equal(req.bodyUsed, false);
  });

  it('keeps the deployed default fetch entrypoint behind the same containment', async () => {
    const req = new Request(`${BASE_URL}/v1/memory/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TEST_API_KEY}`, 'X-Starlight-Tenant': 'tenant-b' },
      body: JSON.stringify({ query: 'synthetic' }),
    });
    const res = await worker.fetch(req, {});
    assert.equal(res.status, 503);
    assert.equal((await res.json() as any).code, 'protected_api_unavailable');
    assert.equal(req.bodyUsed, false);
  });

  it('7. Sovereign Cloud Connector handles client-side Zero-Knowledge E2EE', () => {
    const connector = new StarlightCloudConnector({
      apiKey: TEST_API_KEY,
      encryptionPassphrase: 'synthetic-roundtrip-passphrase',
    });

    const secretIntel = 'Synthetic private fixture for encryption round trip';
    const encrypted = connector.encrypt(secretIntel);
    assert.notEqual(encrypted.ciphertext, secretIntel);
    assert.ok(encrypted.iv);
    assert.ok(encrypted.tag);

    const decrypted = connector.decrypt(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    assert.equal(decrypted, secretIntel);
  });

  it('9. Serves the 3D Visual Memory Palace HTML surface', async () => {
    const palaceReq = new Request(`${BASE_URL}/palace`, { method: 'GET' });
    const res = await StarlightCloudWorker.handleRequest(palaceReq);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('Content-Type')?.includes('text/html'));
    const html = await res.text();
    assert.ok(html.includes('STARLIGHT HYPER-VAULT PALACE'));
    assert.ok(html.includes('canvas-container'));
  });

  it('11. Universal Vector Router resolves Vectorize, Pinecone, and Qdrant dynamically', async () => {
    const { UniversalVectorRouter } = await import('../services/starlight-cloud-worker/src/providers/universal-vector.js');

    // Default: Vectorize
    const defaultProvider = UniversalVectorRouter.resolveProvider({});
    assert.equal(defaultProvider.name, 'cloudflare_vectorize');

    // Pinecone BYO
    const pineconeHeaders = new Headers({
      'X-Starlight-Vector-Provider': 'pinecone',
      'X-Pinecone-Key': 'pc_test_key_12345',
      'X-Pinecone-Host': 'https://starlight-index.svc.us-east1.pinecone.io',
    });
    const pineconeProvider = UniversalVectorRouter.resolveProvider({}, pineconeHeaders);
    assert.equal(pineconeProvider.name, 'pinecone');

    // Qdrant BYO
    const qdrantHeaders = new Headers({
      'X-Starlight-Vector-Provider': 'qdrant',
      'X-Qdrant-Url': 'https://qdrant-cluster.starlight.internal:6333',
    });
    const qdrantProvider = UniversalVectorRouter.resolveProvider({}, qdrantHeaders);
    assert.equal(qdrantProvider.name, 'qdrant');
  });

});

import type { Env } from '../services/starlight-cloud-worker/src/index.js';
import type { IngestionRequest, IngestionResult, QueryRequest, QueryResponse, TenantContext } from '../services/starlight-cloud-worker/src/types.js';

/** Synthetic internal checks; these do not qualify protected HTTP access or durable recovery. */
const component = StarlightCloudWorker as unknown as {
  handleAppend(tenant: TenantContext, request: IngestionRequest, env: Env): Promise<IngestionResult>;
  handleQuery(tenant: TenantContext, request: QueryRequest, env: Env): Promise<QueryResponse>;
};
let serial = 0;
const tenant = (): TenantContext => ({
  tenantId: `synthetic-write-ack-${serial++}`,
  orgName: 'Synthetic fixture', plan: 'solo', quotaRemaining: 1, byovEnabled: false,
});
const request = { content: 'synthetic acknowledgement fixture' };
const database = (run: () => Promise<unknown>) => ({
  prepare() { return { bind() { return { run }; } }; },
});
const cachedCount = async (actor: TenantContext) =>
  (await component.handleQuery(actor, { query: 'acknowledgement' }, {})).count;

describe('Configured D1 acknowledgement ordering (synthetic component)', () => {
  for (const [name, run] of [
    ['throws', async () => { throw new Error('synthetic-private-provider-detail'); }],
    ['explicit failure', async () => ({ success: false })],
    ['undefined acknowledgement', async () => undefined],
    ['null acknowledgement', async () => null],
    ['empty acknowledgement', async () => ({})],
    ['truthy nonboolean acknowledgement', async () => ({ success: 'true' })],
  ] as const) {
    it(`rejects ${name} before publishing caches`, async () => {
      const actor = tenant();
      let kvWrites = 0;
      await assert.rejects(
        component.handleAppend(actor, request, {
          STARLIGHT_DB: database(run),
          STARLIGHT_KV: { async put() { kvWrites++; } },
        }),
        { message: 'Memory persistence failed.' },
      );
      assert.equal(kvWrites, 0);
      assert.equal(await cachedCount(actor), 0);
    });
  }

  it('does not expose an atom while the configured write is pending', async () => {
    const actor = tenant();
    let acknowledge!: (value: unknown) => void;
    let attempted!: () => void;
    const started = new Promise<void>((resolve) => { attempted = resolve; });
    const pending = new Promise((resolve) => { acknowledge = resolve; });
    let kvWrites = 0;
    const append = component.handleAppend(actor, request, {
      STARLIGHT_DB: database(async () => { attempted(); return pending; }),
      STARLIGHT_KV: { async put() { kvWrites++; } },
    });
    try {
      await started;
      assert.equal(await cachedCount(actor), 0);
      assert.equal(kvWrites, 0);
    } finally {
      acknowledge({ success: true });
      await append;
    }
    assert.equal(await cachedCount(actor), 1);
    assert.equal(kvWrites, 1);
  });

  it('publishes an affirmed write after D1 succeeds', async () => {
    const actor = tenant();
    const events: string[] = [];
    const result = await component.handleAppend(actor, request, {
      STARLIGHT_DB: database(async () => { events.push('d1'); return { success: true }; }),
      STARLIGHT_KV: { async put() { events.push('kv'); } },
    });
    assert.equal(result.success, true);
    assert.deepEqual(events, ['d1', 'kv']);
    assert.equal(await cachedCount(actor), 1);
  });

  it('retains the explicit no-binding in-memory component mode, not durable acceptance', async () => {
    const actor = tenant();
    const result = await component.handleAppend(actor, request, {});
    assert.equal(result.success, true);
    assert.equal(await cachedCount(actor), 1);
  });
});

import { SwarmCoordinator } from '../services/starlight-cloud-worker/src/index.js';

describe('Direct SwarmCoordinator containment (synthetic requests)', () => {
  const expected = {
    error: 'Service Unavailable',
    code: 'swarm_coordinator_unavailable',
    message: 'Swarm coordination unavailable: verified identity and durable lease arbitration are not configured.',
  };
  for (const [method, path] of [
    ['POST', '/lease/acquire'],
    ['POST', '/v1/swarm/lease/acquire'],
    ['GET', '/lease/acquire'],
    ['OPTIONS', '/lease/acquire'],
    ['POST', '/lease/release'],
    ['GET', '/health'],
    ['GET', '/'],
    ['DELETE', '/other'],
  ] as const) {
    it(`refuses direct ${method} ${path} without a lease or active claim`, async () => {
      let effects = 0;
      const forbidden = new Proxy({}, {
        get() { effects++; throw new Error('Protected binding accessed'); },
      });
      const coordinator = new SwarmCoordinator(forbidden, forbidden);
      const response = await coordinator.fetch(new Request(`https://synthetic.invalid${path}`, {
        method,
        headers: { Authorization: 'Bearer synthetic', 'X-Starlight-Tenant': 'synthetic-tenant' },
        ...(method === 'POST' ? { body: '{invalid-json' } : {}),
      }));
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.match(response.headers.get('Content-Type') || '', /^application\/json/);
      assert.deepEqual(await response.json(), expected);
      assert.equal(effects, 0);
    });
  }

  it('does not read the request, state or environment while unavailable', async () => {
    let effects = 0;
    const forbidden = new Proxy({}, {
      get() { effects++; throw new Error('Protected input accessed'); },
    });
    const coordinator = new SwarmCoordinator(forbidden, forbidden);
    const response = await coordinator.fetch(forbidden as Request);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), expected);
    assert.equal(effects, 0);
  });
});


