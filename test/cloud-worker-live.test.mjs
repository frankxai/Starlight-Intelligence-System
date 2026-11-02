import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkCloudContainment } from '../scripts/test-cloud-worker-live.mjs';

const health = { service: 'starlight-cloud-worker', protectedApi: {
  status: 'unavailable', reason: 'identity_membership_verifier_missing',
} };
function fixture(url, options) {
  if (url.endsWith('/v1/health')) return Response.json(health);
  if (!options.headers.Authorization) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json({ code: 'protected_api_unavailable' }, { status: 503 });
}

test('four GET-only probes use synthetic identity, no effects, no redirects and no production-ready claim', async () => {
  const requests = [];
  const result = await checkCloudContainment({ fetchImpl: async (url, options) => {
    requests.push({ url, options }); return fixture(url, options);
  } });
  assert.equal(result.status, 'verified_contained');
  assert.equal(result.productionReady, false);
  assert.equal(requests.length, 4);
  for (const { url, options } of requests) {
    assert.equal(options.method, 'GET');
    assert.equal(options.body, undefined);
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    assert.ok(url.endsWith('/v1/health') || url.endsWith('/v1/__containment_probe__'));
    if (options.headers.Authorization) assert.equal(options.headers.Authorization,
      'Bearer containment-probe-not-an-issued-credential');
  }
  assert.deepEqual(requests.slice(2).map(r => r.options.headers['X-Starlight-Tenant']), ['tenant-a', 'tenant-b']);
});

for (const [name, override] of [
  ['old healthy response', () => Response.json({ status: 'healthy' })],
  ['successful protected response', () => Response.json({ success: true })],
  ['edge block instead of application proof', () => new Response('blocked', { status: 403 })],
  ['redirect', () => new Response(null, { status: 302, headers: { location: 'https://other.invalid' } })],
  ['provider JSON error', () => Response.json({ error: 'private diagnostic' }, { status: 500 })],
  ['invalid JSON', () => new Response('{', { headers: { 'content-type': 'application/json' } })],
  ['oversized declared body', () => new Response('{}', { headers: {
    'content-type': 'application/json', 'content-length': '16385',
  } })],
  ['oversized streamed body', () => new Response(' '.repeat(16385), { headers: { 'content-type': 'application/json' } })],
  ['invalid UTF-8', () => new Response(new Uint8Array([0xff]), { headers: { 'content-type': 'application/json' } })],
]) {
  test(`${name} cannot certify containment`, async () => {
    const result = await checkCloudContainment({ fetchImpl: async () => override() });
    assert.equal(result.status, 'unverified');
    assert.equal(result.productionReady, false);
    assert.equal(result.checks.filter(c => !c.passed).length, 4);
    assert.equal(JSON.stringify(result).includes('private diagnostic'), false);
  });
}

test('unknown-route 404 with an arbitrary credential fails even when health matches', async () => {
  const result = await checkCloudContainment({ fetchImpl: async (url, options) =>
    options.headers.Authorization ? Response.json({ error: 'Not Found' }, { status: 404 }) : fixture(url, options) });
  assert.equal(result.status, 'unverified');
  assert.deepEqual(result.checks.map(c => c.passed), [true, true, false, false]);
});

test('stalled requests return within finite deadlines even if injected fetch ignores cancellation', { timeout: 2000 }, async () => {
  const signals = [];
  const result = await checkCloudContainment({ timeoutMs: 15, fetchImpl: (_url, options) => {
    signals.push(options.signal); return new Promise(() => {});
  } });
  assert.equal(result.status, 'unverified');
  assert.equal(signals.length, 4);
  assert.ok(signals.every(signal => signal.aborted));
});

test('a stalled response stream cannot hold the verifier open', { timeout: 2000 }, async () => {
  let cancelled = 0;
  const result = await checkCloudContainment({ timeoutMs: 15, fetchImpl: async () => new Response(
    new ReadableStream({ start() {}, cancel() { cancelled++; } }), { headers: { 'content-type': 'application/json' } },
  ) });
  assert.equal(result.status, 'unverified');
  assert.equal(cancelled, 4);
});

test('invalid target and deadline fail before fetch; URL credentials never leave configuration', async () => {
  let calls = 0;
  const fetchImpl = () => { calls++; throw new Error('must not fetch'); };
  for (const endpoint of ['http://worker.invalid', 'https://user:secret@worker.invalid',
    'https://worker.invalid/path', 'https://worker.invalid?key=private', 'https://worker.invalid/#fragment', 'invalid']) {
    await assert.rejects(checkCloudContainment({ endpoint, fetchImpl }));
  }
  for (const timeoutMs of [0, 5001, NaN, '5']) await assert.rejects(checkCloudContainment({ timeoutMs, fetchImpl }));
  assert.equal(calls, 0);
});

test('transport errors are summarized without raw diagnostics', async () => {
  const result = await checkCloudContainment({ fetchImpl: async () => { throw new Error('private credential diagnostic'); } });
  assert.equal(result.status, 'unverified');
  assert.equal(JSON.stringify(result).includes('private credential'), false);
});

test('CLI rejects credential-bearing targets with nonzero exit and sanitized output', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/test-cloud-worker-live.mjs', import.meta.url))], {
    env: { ...process.env, STARLIGHT_CLOUD_URL: 'https://operator:private-value@worker.invalid' },
    encoding: 'utf8', timeout: 3000,
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr.includes('private-value'), false);
  assert.match(result.stderr, /Containment check could not run/);
});
