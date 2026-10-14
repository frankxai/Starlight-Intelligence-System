import assert from 'node:assert/strict';
import test from 'node:test';
import worker, {
  handleRequest,
  verifySignature,
  extractEventMetadata,
  shouldDispatchRunner,
  buildCloudRunExecutionPayload,
} from '../src/index.ts';
import crypto from 'node:crypto';

const TEST_SECRET = 'starlight-test-webhook-secret-994';

function computeHmacSha256(secret, body) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return `sha256=${hmac.digest('hex')}`;
}

test('verifySignature validates authentic GitHub webhook payload', async () => {
  const body = JSON.stringify({ action: 'opened', repository: { full_name: 'frankxai/agenticincome' } });
  const sig = computeHmacSha256(TEST_SECRET, body);

  const isValid = await verifySignature(body, sig, TEST_SECRET);
  assert.equal(isValid, true, 'valid HMAC signature must pass');
});

test('verifySignature rejects tampered body or invalid secret', async () => {
  const body = JSON.stringify({ action: 'opened', repository: { full_name: 'frankxai/agenticincome' } });
  const sig = computeHmacSha256(TEST_SECRET, body);

  const tamperedValid = await verifySignature(body + ' ', sig, TEST_SECRET);
  assert.equal(tamperedValid, false, 'tampered body must fail');

  const wrongSecretValid = await verifySignature(body, sig, 'wrong-secret');
  assert.equal(wrongSecretValid, false, 'incorrect secret must fail');

  const missingPrefixValid = await verifySignature(body, 'invalid_prefix', TEST_SECRET);
  assert.equal(missingPrefixValid, false, 'signature without sha256= prefix must fail');
});

test('extractEventMetadata accurately parses pull_request and push events', () => {
  const prPayload = {
    action: 'opened',
    pull_request: {
      number: 42,
      head: { sha: 'abcdef1234567890', ref: 'agent/jules/feature-x' },
    },
    repository: { full_name: 'frankxai/gencreator.ai' },
    sender: { login: 'frankxai' },
  };

  const meta = extractEventMetadata('pull_request', prPayload);
  assert.ok(meta);
  assert.equal(meta.event, 'pull_request');
  assert.equal(meta.action, 'opened');
  assert.equal(meta.repo, 'frankxai/gencreator.ai');
  assert.equal(meta.prNumber, 42);
  assert.equal(meta.sha, 'abcdef1234567890');
  assert.equal(meta.ref, 'agent/jules/feature-x');

  const pushPayload = {
    ref: 'refs/heads/main',
    after: '998877665544',
    repository: { full_name: 'frankxai/arcanea-ai-app' },
    sender: { login: 'frankxai' },
  };

  const pushMeta = extractEventMetadata('push', pushPayload);
  assert.ok(pushMeta);
  assert.equal(pushMeta.event, 'push');
  assert.equal(pushMeta.repo, 'frankxai/arcanea-ai-app');
  assert.equal(pushMeta.sha, '998877665544');
  assert.equal(pushMeta.ref, 'refs/heads/main');
});

test('shouldDispatchRunner triggers only on actionable continuous integration states', () => {
  assert.equal(shouldDispatchRunner({ event: 'pull_request', action: 'opened', repo: 'test', sender: 'user' }), true);
  assert.equal(shouldDispatchRunner({ event: 'pull_request', action: 'synchronize', repo: 'test', sender: 'user' }), true);
  assert.equal(shouldDispatchRunner({ event: 'pull_request', action: 'closed', repo: 'test', sender: 'user' }), false);

  assert.equal(shouldDispatchRunner({ event: 'push', ref: 'refs/heads/main', repo: 'test', sender: 'user' }), true);
  assert.equal(shouldDispatchRunner({ event: 'push', ref: 'refs/heads/feature-branch', repo: 'test', sender: 'user' }), false);

  assert.equal(shouldDispatchRunner({ event: 'workflow_job', action: 'queued', repo: 'test', sender: 'user' }), true);
  assert.equal(shouldDispatchRunner({ event: 'workflow_job', action: 'completed', repo: 'test', sender: 'user' }), false);
});

test('buildCloudRunExecutionPayload constructs correct container environment overrides', () => {
  const meta = {
    event: 'pull_request',
    action: 'opened',
    repo: 'frankxai/frankx.ai-vercel-website',
    prNumber: 981,
    sha: 'a8c679b6297f8abd9d7c63af5f37351d6fddf916',
    ref: 'agent/codex/architecture-showroom',
    sender: 'frankxai',
  };

  const payload = buildCloudRunExecutionPayload(meta, 'https://ingress.starlight.workers.dev/callback');
  assert.ok(payload.overrides);
  assert.ok(payload.overrides.containerOverrides[0].env);

  const envs = Object.fromEntries(
    payload.overrides.containerOverrides[0].env.map((item) => [item.name, item.value])
  );

  assert.equal(envs.REPO, 'frankxai/frankx.ai-vercel-website');
  assert.equal(envs.PR_NUMBER, '981');
  assert.equal(envs.COMMIT_SHA, 'a8c679b6297f8abd9d7c63af5f37351d6fddf916');
  assert.equal(envs.TRIGGER_EVENT, 'pull_request');
  assert.equal(envs.CALLBACK_URL, 'https://ingress.starlight.workers.dev/callback');
});

test('worker fetch handles /health and verifies webhook requests', async () => {
  const healthReq = new Request('https://ingress.starlight.local/health');
  const healthRes = await handleRequest(healthReq, {});
  assert.equal(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.equal(healthJson.status, 'healthy');
  assert.equal(healthJson.protocol, 'SIP-1.1.1');

  // Ping request
  const pingBody = JSON.stringify({ zen: 'Keep it logically awesome.' });
  const pingReq = new Request('https://ingress.starlight.local/webhook', {
    method: 'POST',
    headers: {
      'x-github-event': 'ping',
      'Content-Type': 'application/json',
    },
    body: pingBody,
  });
  const pingRes = await handleRequest(pingReq, {});
  assert.equal(pingRes.status, 200);
  const pingJson = await pingRes.json();
  assert.equal(pingJson.pong, true);
});
