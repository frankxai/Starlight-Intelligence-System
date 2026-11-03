import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import worker, {
  MAX_WEBHOOK_BYTES,
  WebhookDeduplicator,
  buildCloudRunExecutionPayload,
  extractEventMetadata,
  handleQueueBatch,
  handleRequest,
  shouldDispatchRunner,
  verifyCallbackSignature,
  verifySignature,
} from '../src/index.ts';

const TEST_SECRET = ['starlight', 'test', 'webhook', '994'].join('-');
const TEST_CALLBACK_SECRET = ['starlight', 'callback', 'hmac', '771'].join('-');
const TEST_BEARER = ['starlight', 'mcp', 'diag', '552'].join('-');

function computeHmacSha256(secret, body) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return `sha256=${hmac.digest('hex')}`;
}

function computeCallbackSig(secret, timestampSec, body) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${timestampSec}.${body}`);
  return `v1=${hmac.digest('hex')}`;
}

function createSqliteBackedNamespace() {
  const rows = new Map();
  const sql = {
    exec(query, ...bindings) {
      const normalized = query.replace(/\s+/g, ' ').trim();
      if (normalized.startsWith('CREATE TABLE')) {
        return { toArray: () => [] };
      }
      if (normalized.startsWith('DELETE FROM webhook_deliveries WHERE expires_at_ms <= ?')) {
        const cutoff = Number(bindings[0]);
        for (const [k, row] of rows.entries()) {
          if (row.expires_at_ms <= cutoff) rows.delete(k);
        }
        return { toArray: () => [] };
      }
      if (normalized.startsWith('DELETE FROM webhook_deliveries WHERE delivery_id = ?')) {
        rows.delete(String(bindings[0]));
        return { toArray: () => [] };
      }
      if (normalized.startsWith('SELECT delivery_id,')) {
        const found = rows.get(String(bindings[0]));
        return { toArray: () => (found ? [found] : []) };
      }
      if (normalized.startsWith('INSERT INTO webhook_deliveries')) {
        const [
          delivery_id,
          event_type,
          repo,
          status,
          detail,
          first_seen_ms,
          updated_ms,
          expires_at_ms,
        ] = bindings;
        const prior = rows.get(String(delivery_id));
        rows.set(String(delivery_id), {
          delivery_id,
          event_type,
          repo: repo ?? prior?.repo ?? null,
          status,
          detail: detail ?? null,
          first_seen_ms,
          updated_ms,
          expires_at_ms,
        });
        return { toArray: () => [] };
      }
      if (normalized.startsWith('SELECT status, COUNT(*) AS count')) {
        const counts = new Map();
        for (const row of rows.values()) {
          counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
        }
        return {
          toArray: () =>
            Array.from(counts.entries()).map(([status, count]) => ({ status, count })),
        };
      }
      throw new Error(`Unhandled SQL in mock: ${normalized}`);
    },
  };

  const instance = new WebhookDeduplicator({ storage: { sql } });
  return {
    idFromName(name) {
      return { toString: () => name };
    },
    get() {
      return {
        fetch(input, init) {
          const req = input instanceof Request ? input : new Request(String(input), init);
          return instance.fetch(req);
        },
      };
    },
  };
}

test('verifySignature validates authentic GitHub webhook payload and rejects tampering', async () => {
  const body = JSON.stringify({ action: 'opened', repository: { full_name: 'frankxai/agenticincome' } });
  const sig = computeHmacSha256(TEST_SECRET, body);

  assert.equal(await verifySignature(body, sig, TEST_SECRET), true);
  assert.equal(await verifySignature(body + ' ', sig, TEST_SECRET), false);
  assert.equal(await verifySignature(body, sig, 'wrong-secret'), false);
  assert.equal(await verifySignature(body, 'invalid_prefix', TEST_SECRET), false);
});

test('extractEventMetadata and shouldDispatchRunner classify actionable CI events and block untrusted fork PRs', () => {
  const prPayload = {
    action: 'opened',
    pull_request: {
      number: 42,
      author_association: 'OWNER',
      head: {
        sha: 'abcdef1234567890',
        ref: 'agent/jules/feature-x',
        repo: { full_name: 'frankxai/gencreator.ai', fork: false },
      },
      base: {
        repo: { full_name: 'frankxai/gencreator.ai' },
      },
    },
    repository: { full_name: 'frankxai/gencreator.ai' },
    sender: { login: 'frankxai' },
  };

  const meta = extractEventMetadata('pull_request', prPayload);
  assert.ok(meta);
  assert.equal(meta.repo, 'frankxai/gencreator.ai');
  assert.equal(meta.prNumber, 42);
  assert.equal(meta.isFork, false);
  assert.equal(shouldDispatchRunner(meta), true);
  assert.equal(shouldDispatchRunner({ ...meta, action: 'closed' }), false);

  // Fork PRs and untrusted external contributors MUST fail closed before privileged dispatch
  const forkMeta = extractEventMetadata('pull_request', {
    ...prPayload,
    pull_request: {
      ...prPayload.pull_request,
      author_association: 'FIRST_TIME_CONTRIBUTOR',
      head: {
        sha: 'badcafe0000',
        ref: 'main',
        repo: { full_name: 'attacker/gencreator.ai', fork: true },
      },
    },
  });
  assert.ok(forkMeta);
  assert.equal(forkMeta.isFork, true);
  assert.equal(shouldDispatchRunner(forkMeta), false, 'fork PR must be blocked at ingress');
  assert.equal(
    shouldDispatchRunner({ ...meta, authorAssociation: 'CONTRIBUTOR' }),
    false,
    'non-collaborator PR must be blocked at ingress',
  );

  const pushMeta = extractEventMetadata('push', {
    ref: 'refs/heads/main',
    after: '998877665544',
    repository: { full_name: 'frankxai/arcanea-ai-app' },
    sender: { login: 'frankxai' },
  });
  assert.ok(pushMeta);
  assert.equal(shouldDispatchRunner(pushMeta), true);

  // workflow_job: requires starlight-runner label AND same-repo non-fork provenance
  const hostedJobMeta = extractEventMetadata('workflow_job', {
    action: 'queued',
    workflow_job: {
      head_sha: '11223344',
      head_branch: 'main',
      labels: ['ubuntu-latest'],
      head_repository: { full_name: 'frankxai/arcanea-ai-app', fork: false },
    },
    repository: { full_name: 'frankxai/arcanea-ai-app', fork: false },
    sender: { login: 'frankxai' },
  });
  assert.equal(shouldDispatchRunner(hostedJobMeta), false, 'ubuntu-latest jobs must not spin up Cloud Run');

  const forkJobMeta = extractEventMetadata('workflow_job', {
    action: 'queued',
    workflow_job: {
      head_sha: 'evilsha9999',
      head_branch: 'main',
      labels: ['self-hosted', 'starlight-runner'],
      head_repository: { full_name: 'attacker/arcanea-ai-app', fork: true },
    },
    repository: { full_name: 'frankxai/arcanea-ai-app', fork: false },
    sender: { login: 'attacker' },
  });
  assert.equal(shouldDispatchRunner(forkJobMeta), false, 'fork workflow_job must be blocked');

  const unverifiedJobMeta = extractEventMetadata('workflow_job', {
    action: 'queued',
    workflow_job: {
      head_sha: 'evilsha8888',
      head_branch: 'main',
      labels: ['starlight-runner'],
    },
    repository: { full_name: 'frankxai/arcanea-ai-app', fork: false },
    sender: { login: 'external-user' },
  });
  assert.equal(shouldDispatchRunner(unverifiedJobMeta), false, 'workflow_job without provenance or collaborator trust must fail closed');

  const trustedJobMeta = extractEventMetadata('workflow_job', {
    action: 'queued',
    workflow_job: {
      head_sha: 'goodsha7777',
      head_branch: 'main',
      labels: ['self-hosted', 'starlight'],
      head_repository: { full_name: 'frankxai/arcanea-ai-app', fork: false },
    },
    repository: { full_name: 'frankxai/arcanea-ai-app', fork: false },
    sender: { login: 'frankxai' },
  });
  assert.equal(shouldDispatchRunner(trustedJobMeta), true, 'trusted same-repo starlight workflow_job dispatches');
});

test('buildCloudRunExecutionPayload constructs container env overrides including DELIVERY_ID', () => {
  const meta = {
    event: 'pull_request',
    action: 'opened',
    repo: 'frankxai/frankx.ai-vercel-website',
    prNumber: 981,
    sha: 'a8c679b6297f8abd9d7c63af5f37351d6fddf916',
    ref: 'agent/codex/architecture-showroom',
    sender: 'frankxai',
  };

  const payload = buildCloudRunExecutionPayload(
    meta,
    'https://ingress.starlightintelligence.ai/v1/runner/callback',
    'deliv-981',
  );
  const envs = Object.fromEntries(
    payload.overrides.containerOverrides[0].env.map((item) => [item.name, item.value]),
  );

  assert.equal(envs.REPO, 'frankxai/frankx.ai-vercel-website');
  assert.equal(envs.PR_NUMBER, '981');
  assert.equal(envs.CALLBACK_URL, 'https://ingress.starlightintelligence.ai/v1/runner/callback');
  assert.equal(envs.DELIVERY_ID, 'deliv-981');
});

test('webhook fails closed with 503 when secret missing and 413 when payload exceeds 1 MiB', async () => {
  const unconfiguredRes = await handleRequest(
    new Request('https://ingress.starlight.local/webhook', { method: 'POST', body: '{}' }),
    {},
  );
  assert.equal(unconfiguredRes.status, 503);

  const oversizedReq = new Request('https://ingress.starlight.local/webhook', {
    method: 'POST',
    headers: {
      'content-length': String(MAX_WEBHOOK_BYTES + 128),
    },
    body: '{}',
  });
  const oversizedRes = await handleRequest(oversizedReq, { GITHUB_WEBHOOK_SECRET: TEST_SECRET });
  assert.equal(oversizedRes.status, 413);
});

test('SQLite Durable Object deduplicates duplicate x-github-delivery IDs and releases failed dispatches for retry', async () => {
  const DEDUPLICATOR = createSqliteBackedNamespace();
  const baseEnv = {
    GITHUB_WEBHOOK_SECRET: TEST_SECRET,
    GCP_PROJECT_ID: 'starlight-estate',
    GCP_REGION: 'europe-west4',
    CLOUD_RUN_JOB: 'runner-job',
    GCP_SERVICE_ACCOUNT_TOKEN: 'gcp-token-placeholder',
    DEDUPLICATOR,
  };

  const prBody = JSON.stringify({
    action: 'opened',
    pull_request: {
      number: 77,
      author_association: 'MEMBER',
      head: {
        sha: 'deadbeef',
        ref: 'agent/antigravity/cf',
        repo: { full_name: 'frankxai/Starlight-Intelligence-System', fork: false },
      },
      base: {
        repo: { full_name: 'frankxai/Starlight-Intelligence-System' },
      },
    },
    repository: { full_name: 'frankxai/Starlight-Intelligence-System' },
    sender: { login: 'frankxai' },
  });

  const originalFetch = globalThis.fetch;
  let cloudRunCalls = 0;
  let shouldFailNext = true;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (url.startsWith('https://run.googleapis.com/')) {
      cloudRunCalls += 1;
      if (shouldFailNext) {
        shouldFailNext = false;
        return new Response(JSON.stringify({ error: 'transient_503' }), { status: 503 });
      }
      return new Response(JSON.stringify({ name: 'executions/exec-77' }), { status: 200 });
    }
    return originalFetch(input, init);
  };

  try {
    const makeWebhookReq = () =>
      new Request('https://ingress.starlight.local/webhook', {
        method: 'POST',
        headers: {
          'x-github-event': 'pull_request',
          'x-github-delivery': 'delivery-uuid-77',
          'x-hub-signature-256': computeHmacSha256(TEST_SECRET, prBody),
          'content-type': 'application/json',
        },
        body: prBody,
      });

    // Attempt 1: Cloud Run returns 503 -> Worker returns 502 AND releases DO claim so retry works
    const firstRes = await handleRequest(makeWebhookReq(), baseEnv);
    assert.equal(firstRes.status, 502);
    assert.equal(cloudRunCalls, 1);

    // Attempt 2 (GitHub retry with same delivery ID): succeeds with 202
    const retryRes = await handleRequest(makeWebhookReq(), baseEnv);
    assert.equal(retryRes.status, 202);
    assert.equal(cloudRunCalls, 2);

    // Attempt 3 (duplicate replay): short-circuits at edge with 200 deduplicated: true
    const dupRes = await handleRequest(makeWebhookReq(), baseEnv);
    assert.equal(dupRes.status, 200);
    const dupJson = await dupRes.json();
    assert.equal(dupJson.deduplicated, true);
    assert.equal(cloudRunCalls, 2, 'duplicate delivery must not call Cloud Run again');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Queue producer enqueues webhook and handleQueueBatch consumer acks or retries', async () => {
  const DEDUPLICATOR = createSqliteBackedNamespace();
  const sentMessages = [];
  const queueEnv = {
    GITHUB_WEBHOOK_SECRET: TEST_SECRET,
    GCP_PROJECT_ID: 'starlight-estate',
    GCP_REGION: 'europe-west4',
    CLOUD_RUN_JOB: 'runner-job',
    GCP_SERVICE_ACCOUNT_TOKEN: 'gcp-token-placeholder',
    DISPATCH_MODE: 'queue',
    DEDUPLICATOR,
    FLEET_DISPATCH_QUEUE: {
      async send(msg) {
        sentMessages.push(msg);
      },
    },
  };

  const pushBody = JSON.stringify({
    ref: 'refs/heads/main',
    after: '112233445566',
    repository: { full_name: 'frankxai/agenticincome' },
    sender: { login: 'frankxai' },
  });

  const enqueueRes = await handleRequest(
    new Request('https://ingress.starlight.local/v1/github/events', {
      method: 'POST',
      headers: {
        'x-github-event': 'push',
        'x-github-delivery': 'delivery-queue-1',
        'x-hub-signature-256': computeHmacSha256(TEST_SECRET, pushBody),
      },
      body: pushBody,
    }),
    queueEnv,
  );
  assert.equal(enqueueRes.status, 202);
  const enqueueJson = await enqueueRes.json();
  assert.equal(enqueueJson.queued, true);
  assert.equal(sentMessages.length, 1);

  const originalFetch = globalThis.fetch;
  let cloudRunLaunches = 0;
  globalThis.fetch = async () => {
    cloudRunLaunches += 1;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    let acked = 0;
    let retried = 0;
    const makeBatch = () => ({
      queue: 'starlight-fleet-dispatch',
      messages: [
        {
          id: 'msg-1',
          body: sentMessages[0],
          ack() {
            acked += 1;
          },
          retry() {
            retried += 1;
          },
        },
      ],
    });
    await worker.queue(makeBatch(), queueEnv);
    // Redelivering the exact same queued message must ack without launching a second Cloud Run job
    await worker.queue(makeBatch(), queueEnv);
    assert.equal(acked, 2);
    assert.equal(retried, 0);
    assert.equal(cloudRunLaunches, 1, 'consumer-side idempotency must prevent duplicate Cloud Run launches');

    // Race test: consumer runs DURING producer send() before producer /complete('queued') executes, followed by redelivery
    let raceLaunches = 0;
    globalThis.fetch = async () => {
      raceLaunches += 1;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    let racedMessage = null;
    const racingQueueEnv = {
      ...queueEnv,
      FLEET_DISPATCH_QUEUE: {
        async send(msg) {
          racedMessage = msg;
          // Consumer claims and dispatches BEFORE send() resolves back to producer!
          await worker.queue(
            {
              queue: 'starlight-fleet-dispatch',
              messages: [{ id: 'race-1', body: msg, ack() {}, retry() {} }],
            },
            queueEnv,
          );
        },
      },
    };
    const racePushRes = await handleRequest(
      new Request('https://ingress.starlight.local/v1/github/events', {
        method: 'POST',
        headers: {
          'x-github-event': 'push',
          'x-github-delivery': 'delivery-queue-race-2',
          'x-hub-signature-256': computeHmacSha256(TEST_SECRET, pushBody),
        },
        body: pushBody,
      }),
      racingQueueEnv,
    );
    assert.equal(racePushRes.status, 202);
    assert.ok(racedMessage);
    // Subsequent queue redelivery after producer finished must NOT launch a second Cloud Run job
    await worker.queue(
      {
        queue: 'starlight-fleet-dispatch',
        messages: [{ id: 'race-2', body: racedMessage, ack() {}, retry() {} }],
      },
      queueEnv,
    );
    assert.equal(raceLaunches, 1, 'producer must not revert consumer dispatched state back to queued');

    // Lease recovery test 1: consumer terminates after /claim-dispatch before Cloud Run responds;
    // redelivery during active lease retries (never acks), and redelivery after lease expiry recovers and dispatches!
    const crashMsg = {
      deliveryId: 'delivery-crash-lease-3',
      meta: sentMessages[0].meta,
      callbackUrl: sentMessages[0].callbackUrl,
      enqueuedAt: new Date().toISOString(),
    };
    const stub = DEDUPLICATOR.get(DEDUPLICATOR.idFromName('estate-primary'));
    const t0 = Date.now();
    await stub.fetch('https://dedup.internal/claim-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryId: crashMsg.deliveryId,
        eventType: crashMsg.meta.event,
        repo: crashMsg.meta.repo,
        nowMs: t0,
        leaseMs: 30_000,
      }),
    });

    let leaseAcked = 0;
    let leaseRetried = 0;
    let leaseLaunches = 0;
    globalThis.fetch = async () => {
      leaseLaunches += 1;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    // During active lease (t0 + 5s): must retry, NEVER ack and drop the task
    await handleQueueBatch(
      {
        queue: 'starlight-fleet-dispatch',
        messages: [
          {
            id: 'crash-redeliver-active',
            body: crashMsg,
            ack() {
              leaseAcked += 1;
            },
            retry() {
              leaseRetried += 1;
            },
          },
        ],
      },
      queueEnv,
      { nowMs: t0 + 5_000, leaseMs: 30_000 },
    );
    assert.equal(leaseAcked, 0, 'active consumer lease must not ack redelivery before job completion');
    assert.equal(leaseRetried, 1);
    assert.equal(leaseLaunches, 0);

    // After lease expires (t0 + 31s): recovers stale dispatching_consumer lease and dispatches once
    await handleQueueBatch(
      {
        queue: 'starlight-fleet-dispatch',
        messages: [
          {
            id: 'crash-redeliver-expired',
            body: crashMsg,
            ack() {
              leaseAcked += 1;
            },
            retry() {
              leaseRetried += 1;
            },
          },
        ],
      },
      queueEnv,
      { nowMs: t0 + 31_000, leaseMs: 30_000 },
    );
    assert.equal(leaseAcked, 1);
    assert.equal(leaseLaunches, 1, 'expired lease must recover and launch Cloud Run job');

    // Lease recovery test 2: Cloud Run fails with 503 AND resetting DO status to queued throws a storage error;
    // subsequent retry after lease expiry still recovers and dispatches!
    const resetFailMsg = {
      deliveryId: 'delivery-reset-fail-4',
      meta: sentMessages[0].meta,
      callbackUrl: sentMessages[0].callbackUrl,
      enqueuedAt: new Date().toISOString(),
    };
    let failNextCloudRun = true;
    let failCompleteWrite = true;
    const flakyDedup = {
      idFromName(name) {
        return DEDUPLICATOR.idFromName(name);
      },
      get(id) {
        const inner = DEDUPLICATOR.get(id);
        return {
          async fetch(input, init) {
            const u = typeof input === 'string' ? input : input.url;
            if (failCompleteWrite && u.endsWith('/complete')) {
              failCompleteWrite = false;
              throw new Error('simulated_do_reset_failure');
            }
            return inner.fetch(input, init);
          },
        };
      },
    };
    let recoveredLaunches = 0;
    globalThis.fetch = async () => {
      if (failNextCloudRun) {
        failNextCloudRun = false;
        return new Response(JSON.stringify({ error: '503' }), { status: 503 });
      }
      recoveredLaunches += 1;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    let rfAcked = 0;
    let rfRetried = 0;
    await handleQueueBatch(
      {
        queue: 'starlight-fleet-dispatch',
        messages: [
          {
            id: 'rf-1',
            body: resetFailMsg,
            ack() {
              rfAcked += 1;
            },
            retry() {
              rfRetried += 1;
            },
          },
        ],
      },
      { ...queueEnv, DEDUPLICATOR: flakyDedup },
      { nowMs: t0 + 60_000, leaseMs: 30_000 },
    );
    assert.equal(rfAcked, 0);
    assert.equal(rfRetried, 1);

    await handleQueueBatch(
      {
        queue: 'starlight-fleet-dispatch',
        messages: [
          {
            id: 'rf-2',
            body: resetFailMsg,
            ack() {
              rfAcked += 1;
            },
            retry() {
              rfRetried += 1;
            },
          },
        ],
      },
      { ...queueEnv, DEDUPLICATOR: flakyDedup },
      { nowMs: t0 + 95_000, leaseMs: 30_000 },
    );
    assert.equal(rfAcked, 1);
    assert.equal(recoveredLaunches, 1, 'failed reset write must still recover after lease expiry');

    // Post-enqueue bookkeeping failure test (reproduces @codex P2 4450895884):
    // Queue.send() succeeds AND fast consumer dispatches, then producer's post-send /complete throws.
    // Producer MUST still return 202, preserve the consumer's dispatched receipt, and block redelivery duplicates!
    let postSendLaunches = 0;
    globalThis.fetch = async () => {
      postSendLaunches += 1;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    let postSendMessage = null;
    let throwProducerComplete = false;
    const postSendDedup = {
      idFromName(name) {
        return DEDUPLICATOR.idFromName(name);
      },
      get(id) {
        const inner = DEDUPLICATOR.get(id);
        return {
          async fetch(input, init) {
            const u = typeof input === 'string' ? input : input.url;
            if (throwProducerComplete && u.endsWith('/complete')) {
              const parsed = init?.body ? JSON.parse(String(init.body)) : {};
              if (parsed.status === 'queued') {
                throwProducerComplete = false;
                throw new Error('simulated_post_enqueue_complete_error');
              }
            }
            return inner.fetch(input, init);
          },
        };
      },
    };
    const postSendEnv = {
      ...queueEnv,
      DEDUPLICATOR: postSendDedup,
      FLEET_DISPATCH_QUEUE: {
        async send(msg) {
          postSendMessage = msg;
          await worker.queue(
            {
              queue: 'starlight-fleet-dispatch',
              messages: [{ id: 'ps-1', body: msg, ack() {}, retry() {} }],
            },
            queueEnv,
          );
          throwProducerComplete = true;
        },
      },
    };
    const postSendRes = await handleRequest(
      new Request('https://ingress.starlight.local/v1/github/events', {
        method: 'POST',
        headers: {
          'x-github-event': 'push',
          'x-github-delivery': 'delivery-post-send-5',
          'x-hub-signature-256': computeHmacSha256(TEST_SECRET, pushBody),
        },
        body: pushBody,
      }),
      postSendEnv,
    );
    assert.equal(postSendRes.status, 202, 'accepted queue send must return 202 even if post-send /complete throws');
    const receiptCheck = await stub.fetch('https://dedup.internal/receipt?id=delivery-post-send-5');
    assert.equal(receiptCheck.status, 200, 'consumer dispatch receipt must not be deleted by producer catch');
    const receiptCheckJson = await receiptCheck.json();
    assert.equal(receiptCheckJson.receipt.status, 'dispatched');

    // Redelivering the message must ack without launching a second Cloud Run job
    await worker.queue(
      {
        queue: 'starlight-fleet-dispatch',
        messages: [{ id: 'ps-2', body: postSendMessage, ack() {}, retry() {} }],
      },
      queueEnv,
    );
    assert.equal(postSendLaunches, 1, 'preserved consumer claim must block duplicate Cloud Run job on redelivery');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('/v1/runner/callback verifies timestamped HMAC receipt and /mcp serves authenticated diagnostics', async () => {
  const DEDUPLICATOR = createSqliteBackedNamespace();
  const env = {
    GITHUB_WEBHOOK_SECRET: TEST_SECRET,
    RUNNER_CALLBACK_SECRET: TEST_CALLBACK_SECRET,
    INGRESS_AUTH_BEARER: TEST_BEARER,
    DEDUPLICATOR,
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const receiptBody = JSON.stringify({
    deliveryId: 'delivery-cb-9',
    repo: 'frankxai/Starlight-Intelligence-System',
    status: 'succeeded',
    exitCode: 0,
    commitSha: 'abcdef99',
    durationMs: 4120,
  });

  // Stale timestamp must fail with 401
  const staleCheck = await verifyCallbackSignature(
    receiptBody,
    String(nowSec - 300),
    computeCallbackSig(TEST_CALLBACK_SECRET, nowSec - 300, receiptBody),
    TEST_CALLBACK_SECRET,
  );
  assert.equal(staleCheck.valid, false);
  assert.equal(staleCheck.reason, 'stale_timestamp');

  // Authentic callback succeeds and records in SQLite Durable Object
  const cbRes = await handleRequest(
    new Request('https://ingress.starlight.local/v1/runner/callback', {
      method: 'POST',
      headers: {
        'x-starlight-timestamp': String(nowSec),
        'x-starlight-signature': computeCallbackSig(TEST_CALLBACK_SECRET, nowSec, receiptBody),
        'content-type': 'application/json',
      },
      body: receiptBody,
    }),
    env,
  );
  assert.equal(cbRes.status, 200);
  const cbJson = await cbRes.json();
  assert.equal(cbJson.recorded, true);

  // Unauthenticated MCP request rejected with 401
  const unauthMcp = await handleRequest(
    new Request('https://ingress.starlight.local/mcp', {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
    }),
    env,
  );
  assert.equal(unauthMcp.status, 401);

  // Authenticated MCP tools/call retrieves the stored runner receipt
  const mcpCallRes = await handleRequest(
    new Request('https://ingress.starlight.local/mcp', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${TEST_BEARER}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'fleet_delivery_receipt',
          arguments: { deliveryId: 'delivery-cb-9' },
        },
      }),
    }),
    env,
  );
  assert.equal(mcpCallRes.status, 200);
  const mcpJson = await mcpCallRes.json();
  assert.equal(mcpJson.result.structuredContent.found, true);
  assert.equal(mcpJson.result.structuredContent.receipt.status, 'runner_succeeded');
});

test('production src/worker.ts entrypoint exports only default handler and WebhookDeduplicator DO class, and ALLOWED_REPO_OWNERS filters external orgs', async () => {
  const prodEntry = await import('../src/worker.ts');
  assert.deepEqual(
    Object.keys(prodEntry).sort(),
    ['WebhookDeduplicator', 'default'],
    'workerd entrypoint must not export primitive constants',
  );

  const foreignPush = JSON.stringify({
    ref: 'refs/heads/main',
    after: '1'.repeat(40),
    repository: { full_name: 'untrusted-org/some-repo' },
    sender: { login: 'someone' },
  });
  const res = await handleRequest(
    new Request('https://ingress.starlight.local/webhook', {
      method: 'POST',
      headers: {
        'x-github-event': 'push',
        'x-hub-signature-256': computeHmacSha256(TEST_SECRET, foreignPush),
      },
      body: foreignPush,
    }),
    {
      GITHUB_WEBHOOK_SECRET: TEST_SECRET,
      ALLOWED_REPO_OWNERS: 'frankxai,Starlight-Intelligence',
    },
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.skipped, 'untrusted_repository_owner');
});

test('runner isolation contract enforces setgid staging, sandbox process reaping, and zero-argv stdin HMAC signing', async () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '..', '..', '..');
  const dockerfilePath = path.join(repoRoot, 'tools', 'runner', 'Dockerfile.runner');
  const entrypointPath = path.join(repoRoot, 'tools', 'runner', 'runner-entrypoint.sh');

  const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
  const entrypoint = fs.readFileSync(entrypointPath, 'utf8');

  // 1. Dockerfile must avoid Ubuntu 24.04 UID 1000 collisions, add starlight to starlight-sandbox supplementary group, and setgid 2750 on /work
  assert.doesNotMatch(
    dockerfile,
    /useradd[^\n]*-u\s+1000\b/,
    'Dockerfile must not collide with ubuntu:24.04 pre-existing UID 1000 account',
  );
  assert.match(
    dockerfile,
    /useradd\s+-m\s+-u\s+10001\s+-g\s+starlight\s+-G\s+starlight-sandbox\s+-s\s+\/bin\/bash\s+starlight/,
    'supervisor starlight must use dedicated UID 10001 and belong to supplementary group starlight-sandbox',
  );
  assert.match(
    dockerfile,
    /chown\s+starlight:starlight-sandbox\s+\/work[\s\\]+&&\s+chmod\s+2750\s+\/work/,
    '/work must carry setgid 2750 with group starlight-sandbox',
  );
  assert.match(dockerfile, /^USER\s+starlight\s*$/m, 'container default USER must be starlight');
  assert.doesNotMatch(
    dockerfile,
    /^ENV\s+PATH=.*starlight-sandbox/m,
    'supervisor container ENV PATH must never prepend sandbox-writable PNPM_HOME',
  );
  assert.match(
    dockerfile,
    /^ENV\s+PATH="\/usr\/local\/sbin:\/usr\/local\/bin:\/usr\/sbin:\/usr\/bin:\/sbin:\/bin"\s*$/m,
    'supervisor container ENV PATH must be locked to root-owned system directories',
  );

  // 2. Entrypoint must lock supervisor PATH, resolve root-owned TRUSTED_NODE_BIN, assign sandbox group on staging,
  // reap surviving sandbox processes, and never pass secrets in argv
  assert.match(
    entrypoint,
    /^export PATH="\/usr\/local\/sbin:\/usr\/local\/bin:\/usr\/sbin:\/usr\/bin:\/sbin:\/bin"\s*$/m,
  );
  assert.match(entrypoint, /"\$TRUSTED_NODE_BIN"\s+-e\s+'/);
  assert.doesNotMatch(
    entrypoint,
    /\|\s*node\s+-e\b/,
    'callback signing must invoke root-owned $TRUSTED_NODE_BIN rather than bare PATH-resolved node',
  );
  assert.match(entrypoint, /chgrp\s+-R\s+"\$SANDBOX_GROUP"\s+"\$\{STAGE_ROOT\}\/source"/);
  assert.match(entrypoint, /kill\s+-9\s+-1/);
  assert.match(entrypoint, /verify_no_surviving_sandbox_processes/);
  assert.doesNotMatch(
    entrypoint,
    /openssl\s+dgst[^\n]*-hmac/,
    'callback signing must not pass HMAC key via openssl CLI argv',
  );
  assert.doesNotMatch(
    entrypoint,
    /-c\s+"http\.https:\/\/github\.com\/\.extraHeader=/,
    'git clone auth must use GIT_CONFIG_* env rather than -c argv',
  );
  assert.match(entrypoint, /GIT_CONFIG_VALUE_0="Authorization: Basic \$\{AUTH_B64\}"/);

  // 3. Validate bash syntax + poisoned PNPM_HOME/node substitution defense when bash is installed
  const gitBashWin = 'C:\\Program Files\\Git\\bin\\bash.exe';
  const bashBin = process.platform === 'win32' && fs.existsSync(gitBashWin) ? gitBashWin : 'bash';
  const bashCheck = spawnSync(bashBin, ['--version'], { encoding: 'utf8' });
  if (bashCheck.status === 0) {
    const syntaxCheck = spawnSync(bashBin, ['-n', entrypointPath], { encoding: 'utf8' });
    assert.equal(syntaxCheck.status, 0, `bash -n failed: ${syntaxCheck.stderr}`);

    // Substitution-attack + real startup sequence execution proof:
    // 1) Execute the ACTUAL runner-entrypoint.sh script with a poisoned PNPM_HOME/node prepended to PATH
    //    and verify the startup sequence (set -eo pipefail, PATH lock, unset, banner, credential scrub)
    //    completes without readonly/syntax errors and reaches the deterministic fail-closed checks!
    const tmpPoisonDir = fs.mkdtempSync(path.join(repoRoot, 'tools', 'fleet-ingress', '.tmp-pnpm-poison-'));
    try {
      const markerFile = path.join(tmpPoisonDir, 'pwned.marker');
      const fakeNode = path.join(tmpPoisonDir, 'node');
      fs.writeFileSync(fakeNode, `#!/usr/bin/env bash\necho PWNED > "${markerFile.replace(/\\/g, '/')}"\nexit 0\n`, { mode: 0o755 });
      const poisonPath = `${tmpPoisonDir}${path.delimiter}${process.env.PATH || ''}`;

      const startupNoRepo = spawnSync(bashBin, [entrypointPath], {
        env: {
          ...process.env,
          PATH: poisonPath,
          PNPM_HOME: tmpPoisonDir,
          NODE_OPTIONS: '--require=/tmp/evil.js',
          STARLIGHT_REPO: '',
          REPO: '',
        },
        encoding: 'utf8',
      });
      assert.equal(startupNoRepo.status, 1);
      assert.match(
        startupNoRepo.stderr,
        /Error: No repository specified/,
        `expected runner-entrypoint.sh to execute startup sequence cleanly and reach repo validation, got stderr: ${startupNoRepo.stderr}`,
      );
      assert.doesNotMatch(startupNoRepo.stderr, /readonly variable/i);

      const startupMissingSandbox = spawnSync(bashBin, [entrypointPath], {
        env: {
          ...process.env,
          PATH: poisonPath,
          PNPM_HOME: tmpPoisonDir,
          STARLIGHT_REPO: 'frankxai/Starlight-Intelligence-System',
          STARLIGHT_SANDBOX_USER: 'nonexistent-starlight-sandbox-99999',
        },
        encoding: 'utf8',
      });
      assert.equal(startupMissingSandbox.status, 1);
      assert.match(
        startupMissingSandbox.stderr,
        /Isolated sandbox user 'nonexistent-starlight-sandbox-99999' does not exist/,
        `expected fail-closed sandbox check after startup, got stderr: ${startupMissingSandbox.stderr}`,
      );
      assert.equal(fs.existsSync(markerFile), false, 'poisoned node shim must never execute');
    } finally {
      fs.rmSync(tmpPoisonDir, { recursive: true, force: true });
    }
  }

  // 4. Execute the exact Node stdin HMAC callback signer against a live local HTTP listener
  // and prove: (a) process.argv excludes secret & signature, (b) /v1/runner/callback verifies the signature!
  const signerMatch = entrypoint.match(/"\$TRUSTED_NODE_BIN" -e '([\s\S]*?)' -- \\/);
  assert.ok(signerMatch, 'expected inline Node stdin callback signer in runner-entrypoint.sh');
  const signerScript = signerMatch[1];

  let capturedHeaders = null;
  let capturedBody = '';
  const server = http.createServer((req, res) => {
    capturedHeaders = req.headers;
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      capturedBody = Buffer.concat(chunks).toString('utf8');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    const callbackUrl = `http://127.0.0.1:${port}/v1/runner/callback`;
    const nowSec = String(Math.floor(Date.now() / 1000));
    const cliArgs = [
      '-e',
      signerScript,
      '--',
      callbackUrl,
      'deliv-runner-e2e-1',
      'frankxai/Starlight-Intelligence-System',
      'refs/heads/main',
      'abc123def456',
      'succeeded',
      '12',
      '4',
      '0',
      nowSec,
    ];

    for (const arg of cliArgs) {
      assert.equal(
        arg.includes(TEST_CALLBACK_SECRET),
        false,
        'callback signing secret must never appear in node process argv',
      );
    }

    const runSigner = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, cliArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (d) => {
        stderr += d.toString('utf8');
      });
      child.on('error', reject);
      child.on('close', (status) => resolve({ status, stderr }));
      child.stdin.end(TEST_CALLBACK_SECRET);
    });
    assert.equal(runSigner.status, 0, `signer exited non-zero: ${runSigner.stderr}`);
    assert.ok(capturedHeaders, 'callback HTTP server did not receive POST');

    const check = await verifyCallbackSignature(
      capturedBody,
      String(capturedHeaders['x-starlight-timestamp'] ?? ''),
      String(capturedHeaders['x-starlight-signature'] ?? ''),
      TEST_CALLBACK_SECRET,
    );
    assert.equal(check.valid, true, `callback HMAC verification failed: ${check.reason}`);
    const parsed = JSON.parse(capturedBody);
    assert.equal(parsed.deliveryId, 'deliv-runner-e2e-1');
    assert.equal(parsed.status, 'succeeded');
    assert.equal(parsed.durationMs, 12000);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
