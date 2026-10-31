// Test doubles only. These are not Cloudflare runtime or hardware benchmarks.
import { createHmac } from 'node:crypto';
import * as ingress from '../src/index.ts';

export const secret = 'synthetic-fixture-secret';
export const sha = 'a'.repeat(40);
export const operation = 'projects/fixture-project/locations/europe-west4/operations/fixture-operation';
export function policy() {
  return {
    version: 1, policy_id: 'fixture-policy',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    job_etag: 'fixture-etag', max_duration_seconds: 60,
    grants: [{ repository_id: 123, repository: 'fixture/example', installation_id: 456,
      commits: [sha], events: ['push', 'pull_request', 'workflow_job'],
      push_refs: ['refs/heads/main'], pr_base_refs: ['main'], workflow_branches: ['main'] }],
  };
}
export function payload(event = 'push') {
  const common = { repository: { id: 123, full_name: 'fixture/example' },
    installation: { id: 456 }, sender: { login: 'fixture-operator' } };
  if (event === 'push') return { ...common, ref: 'refs/heads/main', after: sha, deleted: false };
  if (event === 'pull_request') return { ...common, action: 'opened', number: 7,
    pull_request: { number: 7, state: 'open', draft: false,
      head: { sha, ref: 'agent/fixture/change', repo: { ...common.repository } },
      base: { ref: 'main', repo: { ...common.repository } } } };
  if (event === 'workflow_job') return { ...common, action: 'queued',
    workflow_job: { id: 89, run_id: 90, status: 'queued', head_sha: sha,
      head_branch: 'main', labels: ['self-hosted', 'starlight-runner'] } };
  throw new Error('unknown fixture');
}
export function signed(body = payload(), event = 'push', path = '/webhook', extra = {}) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return new Request('https://local.invalid' + path, { method: 'POST', headers: {
    'x-github-event': event, 'x-hub-signature-256': 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex'),
    ...extra,
  }, body: raw });
}

// Serial, rollback-on-error transactions; reuse the same store to simulate object recreation.
export class FakeStorage {
  data = new Map();
  tail = Promise.resolve();
  transactions = 0;
  failAt = null;
  async get(key) { return structuredClone(this.data.get(key)); }
  async put(key, value) { this.data.set(key, structuredClone(value)); }
  async transaction(fn) {
    let release;
    const previous = this.tail;
    this.tail = new Promise(resolve => { release = resolve; });
    await previous;
    try {
      this.transactions++;
      if (this.transactions === this.failAt) throw new Error('synthetic storage outage');
      const next = new Map(structuredClone([...this.data]));
      const result = await fn({
        get: async key => structuredClone(next.get(key)),
        put: async (key, value) => { next.set(key, structuredClone(value)); },
      });
      this.data = next;
      return result;
    } finally { release(); }
  }
}
export function environment(p = policy(), stores = new Map()) {
  const env = {
    GITHUB_WEBHOOK_SECRET: secret, GCP_PROJECT_ID: 'fixture-project', GCP_REGION: 'europe-west4',
    CLOUD_RUN_JOB: 'fixture-job', GCP_SERVICE_ACCOUNT_TOKEN: 'synthetic-fixture-token',
    FLEET_ADMISSION_POLICY: JSON.stringify(p),
  };
  env.FLEET_DELIVERIES = {
    idFromName: id => id,
    get: id => ({ fetch: request => {
      if (!stores.has(id)) stores.set(id, new FakeStorage());
      return new ingress.FleetDelivery({ storage: stores.get(id) }, env).fetch(request);
    } }),
  };
  return { env, stores };
}
export function mockProvider(t, responder) {
  return t.mock.method(globalThis, 'fetch', responder ?? (async () =>
    new Response(JSON.stringify({ name: operation }), { status: 200 })));
}
