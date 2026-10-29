import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest } from '../dispatcher/src/handler.ts';
import { limitsFor, sha256Hex, worstCaseMicroUsd } from '../dispatcher/src/core.ts';
const RESERVE = worstCaseMicroUsd(limitsFor('team'));
import { agentNameFor, isPurge, OAUTH_CALLBACK_PATH as TENANT_CALLBACK } from '../tenant-template/src/identity.ts';
import { OAUTH_CALLBACK_PATH as DISPATCH_CALLBACK } from '../dispatcher/src/core.ts';

const DOMAIN = 'tenants.example.invalid';
const TOKENS = { acme: 'token-acme-fixture', globex: 'token-globex-fixture' };

async function fixture({ ledgerThrows = false, states = {}, spent = {}, tenantResponse = null, getThrows = null } = {}) {
  const ledgers = {};
  for (const id of Object.keys(TOKENS)) {
    const record = { tenantId: id, state: states[id] ?? 'active', plan: 'team', capMicroUsd: 1_000, tokenHash: await sha256Hex(TOKENS[id]) };
    const usage = { periodStart: '2026-10-01T00:00:00.000Z', spentMicroUsd: spent[id] ?? 0 };
    const pending = new Map();
    ledgers[id] = {
      usage,
      pending,
      async release(micro) { usage.spentMicroUsd -= micro; },
      async addOAuthState(hash, at) { pending.set(hash, at); return true; },
      async consumeOAuthState(hash) { const at = pending.get(hash); pending.delete(hash); return at !== undefined && at > Date.now(); },
      async read() { if (ledgerThrows) throw new Error('ledger down'); return { record, usage: { ...usage } }; },
      async reserve(micro) { if (usage.spentMicroUsd + micro > record.capMicroUsd) return false; usage.spentMicroUsd += micro; return true; },
    };
  }
  const calls = [];
  const env = {
    PLATFORM_DOMAIN: DOMAIN,
    ledgerFor: (id) => ledgers[id] ?? { read: async () => ({ record: null, usage: { periodStart: '', spentMicroUsd: 0 } }), reserve: async () => false },
    DISPATCHER: {
      get(name, args, options) {
        if (getThrows) throw new Error(getThrows);
        calls.push({ name, props: args?.props, limits: options?.limits });
        return { fetch: async (req) => tenantResponse ? tenantResponse() : Response.json({ name, auth: req.headers.get('authorization') }) };
      },
    },
  };
  return { env, calls, ledgers };
}

const req = (host, path = '/', headers = {}) => new Request(`https://${host}${path}`, { headers });
const bearer = (id) => ({ authorization: 'Bearer ' + TOKENS[id] });

test('a request reaches only the tenant named by the platform hostname', async () => {
  const { env, calls } = await fixture();
  const res = await handleRequest(req(`acme.${DOMAIN}`, '/', { ...bearer('acme'), 'x-tenant-id': 'globex' }), env);
  assert.equal(res.status, 200);
  assert.deepEqual(calls, [{ name: 'tenant--acme', props: { tenantId: 'acme' }, limits: { cpuMs: 200, subRequests: 50 } }]);
});

test("one tenant's token cannot open another tenant", async () => {
  const { env, calls } = await fixture();
  const res = await handleRequest(req(`globex.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal(res.status, 401);
  assert.equal(calls.length, 0);
});

test('path and query cannot select another tenant script', async () => {
  const { env, calls } = await fixture();
  await handleRequest(req(`acme.${DOMAIN}`, '/tenant--globex?tenant=globex', bearer('acme')), env);
  assert.equal(calls[0].name, 'tenant--acme');
});

test('hosts outside the platform domain or nested labels never dispatch', async () => {
  const { env, calls } = await fixture();
  for (const host of [`globex.acme.${DOMAIN}`, 'acme.evil.example', `platform.${DOMAIN}`, DOMAIN]) {
    const res = await handleRequest(req(host, '/', bearer('acme')), env);
    assert.equal(res.status, 404, host);
  }
  assert.equal(calls.length, 0);
});

test('the platform token is stripped before tenant code runs', async () => {
  const { env } = await fixture();
  const res = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal((await res.json()).auth, null);
});

test('spend cap refuses before the tenant Worker is invoked', async () => {
  const { env, calls } = await fixture({ spent: { acme: 1_000 - RESERVE + 1 } });
  const res = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal(res.status, 402);
  assert.equal(calls.length, 0);
});

test('spending stops at the cap across repeated calls', async () => {
  const { env, calls, ledgers } = await fixture();
  let last;
  for (let i = 0; i < 1_000; i++) last = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal(last.status, 402);
  assert.ok(ledgers.acme.usage.spentMicroUsd <= 1_000);
  assert.equal(calls.length, Math.floor(1_000 / RESERVE));
});

test('unpaid, suspended and deleted tenants are refused', async () => {
  for (const [state, status] of [['pending_payment', 402], ['suspended', 403], ['deleted', 410]]) {
    const { env, calls } = await fixture({ states: { acme: state } });
    const res = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
    assert.equal(res.status, status, state);
    assert.equal(calls.length, 0);
  }
});

test('ledger outage fails closed', async () => {
  const { env, calls } = await fixture({ ledgerThrows: true });
  const res = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal(res.status, 503);
  assert.equal(calls.length, 0);
});

test('a stranger hitting the OAuth callback is refused before any budget is spent', async () => {
  const { env, calls, ledgers } = await fixture();
  for (const path of ['/mcp-oauth-callback', '/mcp-oauth-callback?state=srv:guessed']) {
    const res = await handleRequest(req(`acme.${DOMAIN}`, path), env);
    assert.equal(res.status, 401, path);
  }
  assert.equal(calls.length, 0);
  assert.equal(ledgers.acme.usage.spentMicroUsd, 0);
  assert.equal(DISPATCH_CALLBACK, '/' + TENANT_CALLBACK);
});

test('a state issued by this tenant opens its callback once, on its own Worker only', async () => {
  const authUrl = 'https://mcp.example.com/authorize?client_id=x&state=srv1:nonce-123';
  const { env, calls } = await fixture({ tenantResponse: () => Response.json({ state: 'authenticating', authUrl }) });
  const start = new Request(`https://acme.${DOMAIN}/mcp/servers`, { method: 'POST', headers: bearer('acme'), body: '{}' });
  assert.equal((await handleRequest(start, env)).status, 200);

  const callback = `/mcp-oauth-callback?state=${encodeURIComponent('srv1:nonce-123')}&code=c`;
  assert.equal((await handleRequest(req(`globex.${DOMAIN}`, callback), env)).status, 401);
  assert.equal((await handleRequest(req(`acme.${DOMAIN}`, callback), env)).status, 200);
  assert.equal((await handleRequest(req(`acme.${DOMAIN}`, callback), env)).status, 401);
  assert.deepEqual(calls.map((c) => c.name), ['tenant--acme', 'tenant--acme']);
});

test('a tenant Worker that is not deployed costs nothing', async () => {
  const { env, ledgers } = await fixture({ getThrows: 'Worker not found: tenant--acme' });
  const res = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal(res.status, 404);
  assert.equal(ledgers.acme.usage.spentMicroUsd, 0);
});

test('a synchronous dispatch error still returns a response', async () => {
  const { env } = await fixture({ getThrows: 'binding exploded' });
  const res = await handleRequest(req(`acme.${DOMAIN}`, '/', bearer('acme')), env);
  assert.equal(res.status, 502);
});

test('tenant Worker takes identity and purge only from dispatcher props', () => {
  assert.equal(agentNameFor({ tenantId: 'acme' }), 'acme');
  for (const props of [undefined, null, {}, { tenantId: '' }, { tenantId: 7 }]) {
    assert.throws(() => agentNameFor(props));
  }
  assert.equal(isPurge({ tenantId: 'acme', purge: true }), true);
  for (const props of [undefined, null, { purge: 'true' }, { purge: 1 }]) assert.equal(isPurge(props), false);
});
