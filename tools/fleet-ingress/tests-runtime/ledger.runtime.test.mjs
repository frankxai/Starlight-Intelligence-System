import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { operation, payload, policy, secret, signed } from '../tests/fixtures.mjs';

// Compile the actual deployment entry. A test-only wrapper could hide invalid
// module exports or a deployment/source mismatch.
const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse((await readFile(path.join(root, 'wrangler.jsonc'), 'utf8'))
  .replace(/^\s*\/\/.*$/gm, ''));
assert.equal(typeof config.main, 'string');
assert.equal(config.workers_dev, false);
assert.equal(config.preview_urls, false);
const bundle = await build({
  entryPoints: [path.resolve(root, config.main)], bundle: true, write: false,
  format: 'esm', platform: 'browser', target: 'es2022',
});

async function runtime(t, { responder, bound = true, admission = policy() } = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fleet-runtime-'));
  const attempts = [];
  const outboundErrors = [];
  let instance;
  async function start() {
    const value = new Miniflare(convertV4MiniflareOptions({
      name: 'fleet-runtime-qualification', modules: true,
      script: bundle.outputFiles[0].text,
      compatibilityDate: config.compatibility_date,
      compatibilityFlags: config.compatibility_flags,
      host: '127.0.0.1', port: 0, cf: false,
      bindings: {
        GITHUB_WEBHOOK_SECRET: secret,
        GCP_PROJECT_ID: 'fixture-project', GCP_REGION: 'europe-west4',
        CLOUD_RUN_JOB: 'fixture-job',
        GCP_SERVICE_ACCOUNT_TOKEN: 'synthetic-fixture-token',
        FLEET_ADMISSION_POLICY: JSON.stringify(admission),
      },
      durableObjects: bound
        ? { FLEET_DELIVERIES: { className: 'FleetDelivery', useSQLite: true } } : {},
      resourcePersistencePath: path.join(dir, 'persist'),
      resourceTmpPath: path.join(dir, 'runtime'),
      unsafeDevRegistryPath: path.join(dir, 'registry'),
      outboundService: async request => {
        // Record entry before validation. Miniflare turns handler exceptions
        // into HTTP 500s, which the production boundary correctly sanitizes.
        const attempt = { url: request.url, method: request.method };
        attempts.push(attempt);
        try {
        assert.equal(request.url,
          'https://run.googleapis.com/v2/projects/fixture-project/locations/europe-west4/jobs/fixture-job:run');
        assert.equal(request.method, 'POST');
        const body = await request.json();
        assert.equal(body.etag, 'fixture-etag');
        assert.equal(body.overrides.taskCount, 1);
        const variables = Object.fromEntries(body.overrides.containerOverrides[0].env.map(v => [v.name, v.value]));
        assert.equal(variables.STARLIGHT_COMMIT_SHA, 'a'.repeat(40));
        assert.equal(variables.STARLIGHT_REPO, 'fixture/example');
        attempt.body = body;
        return responder ? responder(request) : Response.json({ name: operation });
        } catch (error) {
          outboundErrors.push(String(error));
          throw error;
        }
      },
    }));
    // Assign before readiness so failed startup also has an owned cleanup path.
    instance = value;
    await value.ready;
  }
  t.after(async () => {
    try { if (instance) await instance.dispose(); }
    finally {
      assert.ok(path.isAbsolute(dir));
      assert.equal(path.dirname(dir), path.resolve(os.tmpdir()));
      assert.ok(path.basename(dir).startsWith('fleet-runtime-'));
      await rm(dir, { recursive: true, force: true });
    }
    assert.deepEqual(outboundErrors, [], 'Outbound fixture assertions must not be hidden as sanitized 500s');
  });
  await start();
  return {
    attempts,
    async invoke(request = signed()) {
      return instance.dispatchFetch(request.url, {
        method: request.method, headers: request.headers, body: await request.text(),
      });
    },
    async restart() {
      await instance.dispose(); instance = undefined;
      await start();
    },
  };
}

test('real SQLite serializes concurrent duplicate deliveries into one provider attempt', { timeout: 60000 }, async t => {
  const r = await runtime(t);
  const responses = await Promise.all(Array.from({ length: 12 }, () => r.invoke()));
  const statuses = responses.map(response => response.status);
  assert.equal(statuses.filter(status => status === 202).length, 1);
  // A concurrent replay can see the committed uncertain claim before acceptance.
  assert.ok(statuses.every(status => [200, 202, 409].includes(status)));
  assert.equal(r.attempts.length, 1);
  const replay = await r.invoke();
  assert.equal(replay.status, 200);
  const receipt = await replay.json();
  assert.equal(receipt.duplicate, true);
  assert.equal(receipt.receipt.state, 'accepted');
});

test('accepted receipt survives a fresh workerd process with the same SQLite store', { timeout: 60000 }, async t => {
  const r = await runtime(t);
  const first = await r.invoke();
  assert.equal(first.status, 202);
  assert.equal((await first.json()).completion_verified, false);
  await r.restart();
  const replay = await r.invoke(signed(payload(), 'push', '/webhook', { 'x-github-delivery': 'new-unsigned-header' }));
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).duplicate, true);
  assert.equal(r.attempts.length, 1);
});

test('uncertain provider result stays held after workerd restart and is never replayed', { timeout: 60000 }, async t => {
  const r = await runtime(t, { responder: () => Response.json({ private_diagnostic: 'fixture-only' }) });
  const first = await r.invoke();
  assert.equal(first.status, 502);
  assert.deepEqual(await first.json(), { error: 'runner_dispatch_uncertain', reconciliation_required: true });
  await r.restart();
  assert.equal((await r.invoke()).status, 409);
  assert.equal(r.attempts.length, 1);
});

test('real Worker never follows a provider redirect and preserves its uncertain hold', { timeout: 60000 }, async t => {
  const r = await runtime(t, { responder: () => new Response(null, {
    status: 302, headers: { Location: 'https://outside.invalid/credential-sink' },
  }) });
  assert.equal((await r.invoke()).status, 502);
  assert.equal(r.attempts.length, 1);
  await r.restart();
  assert.equal((await r.invoke()).status, 409);
  assert.equal(r.attempts.length, 1);
});

test('real Worker refuses unsigned, fork and unlabelled input before any provider effect', { timeout: 60000 }, async t => {
  const r = await runtime(t);
  const unsigned = new Request('https://local.invalid/webhook', { method: 'POST', body: '{}' });
  assert.equal((await r.invoke(unsigned)).status, 401);
  const fork = payload('pull_request');
  fork.pull_request.head.repo = { id: 999, full_name: 'outside/fork' };
  assert.equal((await r.invoke(signed(fork, 'pull_request'))).status, 403);
  const job = payload('workflow_job'); job.workflow_job.labels = ['ubuntu-latest'];
  assert.equal((await r.invoke(signed(job, 'workflow_job'))).status, 403);
  assert.equal(r.attempts.length, 0);
});

test('missing production journal binding fails closed in the actual Worker runtime', { timeout: 60000 }, async t => {
  const r = await runtime(t, { bound: false });
  const response = await r.invoke();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'ledger_unavailable' });
  assert.equal(r.attempts.length, 0);
});
