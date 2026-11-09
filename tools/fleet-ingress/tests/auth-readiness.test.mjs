import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest, verifySignature } from '../src/index.ts';
import { createHmac } from 'node:crypto';

const secret = 'synthetic-fixture-secret';
const credentials = {
  GITHUB_WEBHOOK_SECRET: secret,
  GCP_PROJECT_ID: 'fixture-project',
  GCP_REGION: 'europe-west4',
  CLOUD_RUN_JOB: 'fixture-job',
  GCP_SERVICE_ACCOUNT_TOKEN: 'synthetic-fixture-token',
};
const push = { ref: 'refs/heads/main', after: 'a'.repeat(40), repository: { full_name: 'fixture/example' } };

function signedRequest(payload = push, path = '/webhook') {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return new Request('https://local.invalid' + path, {
    method: 'POST',
    headers: {
      'x-github-event': 'push',
      'x-hub-signature-256': 'sha256=' + createHmac('sha256', secret).update(body).digest('hex'),
    },
    body,
  });
}

test('webhook refuses unsigned traffic when no verification secret is configured', async () => {
  const response = await handleRequest(new Request('https://local.invalid/webhook', {
    method: 'POST',
    headers: { 'x-github-event': 'ping' },
    body: '{}',
  }), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'webhook_unavailable' });
});

test('malformed HMAC never reaches Web Crypto as a partial signature', async () => {
  for (const signature of ['sha256=', 'sha256=00', 'sha256=' + 'g'.repeat(64), 'sha256=' + 'a'.repeat(63)]) {
    assert.equal(await verifySignature('{}', signature, 'fixture-secret'), false);
  }
});

test('blank verification secret fails closed without calling the executor', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('executor must not run'); });
  const response = await handleRequest(signedRequest(), { ...credentials, GITHUB_WEBHOOK_SECRET: '  ' });
  assert.equal(response.status, 503);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('missing or incorrect signature is rejected before dispatch', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('executor must not run'); });
  for (const signature of [null, 'sha256=' + '0'.repeat(64)]) {
    const request = signedRequest();
    if (signature) request.headers.set('x-hub-signature-256', signature);
    else request.headers.delete('x-hub-signature-256');
    const response = await handleRequest(request, credentials);
    assert.equal(response.status, 401);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('both webhook aliases refuse an unconfigured executor', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('executor must not run'); });
  for (const path of ['/webhook', '/v1/github/events']) {
    const response = await handleRequest(signedRequest(push, path), { GITHUB_WEBHOOK_SECRET: secret });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'runner_unavailable' });
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('a missing or blank dispatch binding never returns a queued receipt', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('executor must not run'); });
  for (const key of ['GCP_PROJECT_ID', 'GCP_REGION', 'CLOUD_RUN_JOB', 'GCP_SERVICE_ACCOUNT_TOKEN']) {
    for (const value of [undefined, '  ']) {
      const response = await handleRequest(signedRequest(), { ...credentials, [key]: value });
      assert.equal(response.status, 503);
    }
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('signed malformed or non-object JSON returns 400', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('executor must not run'); });
  for (const payload of ['{', 'null', '[]', '1', '"text"']) {
    const response = await handleRequest(signedRequest(payload), credentials);
    assert.equal(response.status, 400);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('upstream denial or outage returns a sanitized 502', async (t) => {
  for (const status of [401, 403, 500]) {
    t.mock.method(globalThis, 'fetch', async () => new Response('private upstream diagnostic', { status }));
    const response = await handleRequest(signedRequest(), credentials);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'runner_dispatch_failed' });
    t.mock.restoreAll();
  }
});

test('network failure returns a sanitized 502', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('private upstream diagnostic'); });
  const response = await handleRequest(signedRequest(), credentials);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'runner_dispatch_failed' });
});

test('202 requires a successful executor response and preserves the source binding', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('{"name":"fixture-operation"}', { status: 200 }));
  const response = await handleRequest(signedRequest(), credentials);
  assert.equal(response.status, 202);
  const result = await response.json();
  assert.equal(result.gcp.dispatched, true);
  assert.equal(result.gcp.queued, undefined);
  assert.equal(fetchMock.mock.callCount(), 1);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, 'https://run.googleapis.com/v2/projects/fixture-project/locations/europe-west4/jobs/fixture-job:run');
  const env = JSON.parse(options.body).overrides.containerOverrides[0].env;
  assert.equal(env.find((item) => item.name === 'COMMIT_SHA').value, push.after);
});
