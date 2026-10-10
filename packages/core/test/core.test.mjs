import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projectRecall, recallContext, SanitizationGateway } from '../dist/index.js';

const memory = { recall: async () => [] };
const options = { memory, tenantId: 'tenant-a', workspaceId: 'workspace-a' };
function hit(id, extra = {}) {
  return { score: 0.9, record: { memory_id: id, tenant_id: 'tenant-a', workspace_id: 'workspace-a',
    privacy_class: 'public', normalized_fact: 'Use the reviewed release artifact.', ...extra } };
}

test('scope, privacy and retention are checked before projection; no provider metadata leaks', () => {
  const results = [hit('public', { raw_content: 'must never leave', provider_shadow_refs: { token: 'must never leave' } }),
    hit('tenant', { tenant_id: 'tenant-b' }), hit('workspace', { workspace_id: 'workspace-b' }),
    ...['private', 'secret', 'regulated', 'private-shareable'].map(privacy_class => hit(privacy_class, { privacy_class })),
    hit('expired', { retention_until: '2000-01-01' }), hit('malformed-expiry', { retention_until: 'unknown' }),
    hit('public'), hit('nan')];
  results.at(-1).score = NaN;
  const output = projectRecall(results, options);
  assert.deepEqual(output.map(x => x.id), ['public']);
  assert.ok(!JSON.stringify(output).includes('must never leave'));
  assert.equal(projectRecall([hit('share', { privacy_class: 'private-shareable' })], { ...options, allowShareable: true }).length, 1);
});

test('sanitize, deduplicate, and bound context; never inject raw-only records', () => {
  const output = projectRecall([hit('first', { normalized_fact: 'Contact person@example.org' }),
    hit('raw', { normalized_fact: undefined, raw_content: 'raw data' }), hit('second')], { ...options, maxCharacters: 12 });
  assert.equal(output.length, 1);
  assert.equal(output[0].content.length, 12);
  assert.ok(!output[0].content.includes('@'));
  assert.throws(() => projectRecall([hit('a')], { ...options, sanitizer: { sanitize() { throw new Error('denied'); } } }));
});

test('invalid budgets and scope deny work before invoking provider', async () => {
  let calls = 0;
  const configured = { ...options, memory: { recall: async () => { calls++; return []; } }, limit: 0 };
  await assert.rejects(recallContext('query', configured));
  assert.equal(calls, 0);
});

test('abort and timeout deny hung reads; sensitive provider errors stay private', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(recallContext('query', options, controller.signal));
  await assert.rejects(recallContext('query', { ...options, timeoutMs: 10, memory: { recall: () => new Promise(() => {}) } }), /unavailable or denied/);
  const failing = { ...options, memory: { recall: async () => { throw new Error('credential-in-error'); } } };
  await assert.rejects(recallContext('query', failing), error => !error.message.includes('credential-in-error'));
});

test('portable runtime imports without Node globals and has zero dependencies', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0);
  assert.equal(Object.keys(pkg.peerDependencies ?? {}).length, 0);
  const previous = globalThis.process;
  try { globalThis.process = undefined; assert.equal(new SanitizationGateway().sanitize('a@example.org'), '[REDACTED]'); }
  finally { globalThis.process = previous; }
});
