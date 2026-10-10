import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { projectRecall, recallContext, SanitizationGateway } from '../dist/index.js';

const memory = { recall: async () => [] };
const options = { memory, tenantId: 'tenant-a', workspaceId: 'workspace-a' };

test('sanitizer masks complete credentials, literal replacement text and named context secrets', () => {
  const veil = new SanitizationGateway({ scrubPII: false });
  const frame = (action, kind) => '-'.repeat(5) + action + ' ' + kind + ' PRIVATE KEY' + '-'.repeat(5);
  const fixtures = [
    'sk-' + 'proj-' + 'a'.repeat(100),
    'sk-' + 'ant-api03_' + 'a'.repeat(40),
    'sk_' + 'live_' + 'a'.repeat(40),
    'github_' + 'pat_' + 'a'.repeat(80),
    'ASIA' + 'A'.repeat(16), 'hf_' + 'a'.repeat(34),
    'npm_' + 'a'.repeat(36), 'whsec_' + 'a'.repeat(32),
    'postgres://example:opaque@localhost/project',
    frame('BEGIN', 'OPENSSH') + '\nsynthetic fixture\n' + frame('END', 'OPENSSH'),
    frame('BEGIN', 'RSA') + '\nsynthetic incomplete fixture',
  ];
  for (const secret of fixtures) assert.equal(veil.sanitize('before ' + secret + ' after'), secret.includes('incomplete') ? 'before [REDACTED]' : 'before [REDACTED] after');
  assert.equal(new SanitizationGateway({ scrubPII: false, maskString: '$&' }).sanitize(fixtures[0]), '$&');
  const context = veil.sanitizeContext(JSON.parse('{"password":"opaque","api_key":"opaque","nested":{"client_secret":"opaque"},"__proto__":{"safe":true}}'));
  assert.equal(context.password, '[REDACTED]');
  assert.equal(context.api_key, '[REDACTED]');
  assert.equal(context.nested.client_secret, '[REDACTED]');
  assert.equal(Object.getPrototypeOf(context), Object.prototype);
  assert.equal(Object.hasOwn(context, '__proto__'), true);
  assert.equal({}.safe, undefined);
  assert.equal(new SanitizationGateway({ scrubSecrets: false, scrubPII: false }).sanitize(fixtures[0]), fixtures[0]);
});
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

test('untyped host grants never coerce strings, numbers or objects into sharing authority', async () => {
  let calls = 0;
  const memory = { recall: async () => { calls++; return [hit('shared', { privacy_class: 'private-shareable' })]; } };
  for (const allowShareable of ['false', 'true', 0, 1, null, [], {}]) {
    const config = { ...options, memory, allowShareable };
    assert.throws(() => projectRecall([hit('shared', { privacy_class: 'private-shareable' })], config));
    await assert.rejects(recallContext('query', config));
  }
  assert.equal(calls, 0);
  assert.equal((await recallContext('query', { ...options, memory, allowShareable: false })).length, 0);
  assert.equal((await recallContext('query', { ...options, memory, allowShareable: true })).length, 1);
});

test('provider expiry values must be strings; malformed neighbors never enter recalled context', async () => {
  const malformed = [2099, ['2099-01-01'], null, {}, true, '', 'unknown'];
  const results = [hit('retained', { retention_until: '2099-01-01' }),
    hit('without-expiry'), hit('expired', { retention_until: '2000-01-01' }),
    hit('missing-delete-deadline', { retention_policy: 'delete_by' }),
    ...malformed.map((retention_until, index) => hit(`malformed-${index}`, { retention_until }))];
  assert.deepEqual(projectRecall(results, options).map(record => record.id), ['retained', 'without-expiry']);
  const requests = [];
  const recalled = await recallContext('retention constraints', { ...options,
    memory: { recall: async request => { requests.push(request); return results; } } });
  assert.equal(requests.length, 1);
  assert.deepEqual(recalled.map(record => record.id), ['retained', 'without-expiry']);
});

test('invalid budgets and scope deny work before invoking provider', async () => {
  let calls = 0;
  const configured = { ...options, memory: { recall: async () => { calls++; return []; } }, limit: 0 };
  await assert.rejects(recallContext('query', configured));
  assert.equal(calls, 0);
});

test('recall forwards the host-selected workspace so providers can deny wrong-scope work', async () => {
  const requests = [];
  const scoped = { ...options, memory: { recall: async request => { requests.push(request); return [hit('allowed')]; } } };
  assert.equal((await recallContext('query', scoped)).length, 1);
  assert.equal(requests[0].tenant_id, options.tenantId);
  assert.equal(requests[0].workspace_id, options.workspaceId);
  await recallContext('query', { ...scoped, workspaceId: undefined });
  assert.equal(requests[1].workspace_id, undefined);
});

test('abort and timeout deny hung reads; sensitive provider errors stay private', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(recallContext('query', options, controller.signal));
  await assert.rejects(recallContext('query', { ...options, timeoutMs: 10, memory: { recall: () => new Promise(() => {}) } }), /unavailable or denied/);
  const failing = { ...options, memory: { recall: async () => { throw new Error('credential-in-error'); } } };
  await assert.rejects(recallContext('query', failing), error => !error.message.includes('credential-in-error'));
});

test('portable runtime cold-imports and recalls without Node globals and has zero dependencies', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0);
  assert.equal(Object.keys(pkg.peerDependencies ?? {}).length, 0);
  // A fresh module graph catches Node globals used during module initialization.
  // The consumer runner resolves this same specifier against the installed tarball.
  const entry = import.meta.resolve('../dist/index.js');
  const script = `
    globalThis.process = undefined;
    globalThis.Buffer = undefined;
    globalThis.global = undefined;
    const { SanitizationGateway, recallContext } = await import(${JSON.stringify(entry)});
    if (new SanitizationGateway().sanitize('a@example.org') !== '[REDACTED]') throw new Error('Sanitizer failed');
    let calls = 0;
    const memory = { recall: async request => {
      calls++;
      if (request.tenant_id !== 'tenant-a' || request.workspace_id !== 'workspace-a') throw new Error('Scope lost');
      return [];
    }};
    const result = await recallContext('query', { memory, tenantId: 'tenant-a', workspaceId: 'workspace-a' });
    if (calls !== 1 || result.length !== 0) throw new Error('Recall failed');
    const controller = new AbortController();
    controller.abort();
    let denied = false;
    try { await recallContext('query', { memory, tenantId: 'tenant-a' }, controller.signal); }
    catch { denied = true; }
    if (!denied || calls !== 1) throw new Error('Cancellation failed');
  `;
  execFileSync(process.execPath, ['--input-type=module', '--eval', script], { timeout: 10_000, stdio: 'pipe' });
});
