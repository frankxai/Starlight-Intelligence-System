import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
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

test('extractEventMetadata and shouldDispatchRunner classify actionable CI events', () => {
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
  assert.equal(meta.repo, 'frankxai/gencreator.ai');
  assert.equal(meta.prNumber, 42);
  assert.equal(shouldDispatchRunner(meta), true);
  assert.equal(shouldDispatchRunner({ ...meta, action: 'closed' }), false);

  const pushMeta = extractEventMetadata('push', {
    ref: 'refs/heads/main',
    after: '998877665544',
    repository: { full_name: 'frankxai/arcanea-ai-app' },
    sender: { login: 'frankxai' },
  });
  assert.ok(pushMeta);
  assert.equal(shouldDispatchRunner(pushMeta), true);
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
    pull_request: { number: 77, head: { sha: 'deadbeef', ref: 'agent/antigravity/cf' } },
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
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
  try {
    let acked = 0;
    let retried = 0;
    await worker.queue(
      {
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
      },
      queueEnv,
    );
    assert.equal(acked, 1);
    assert.equal(retried, 0);
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
