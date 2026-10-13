import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { projectRecall, recallContext, SanitizationGateway } from '../dist/index.js';

const memory = { recall: async () => [] };
const options = { memory, tenantId: 'tenant-a', workspaceId: 'workspace-a' };

test('Supabase secret keys are fully redacted while publishable keys remain usable', () => {
  const veil = new SanitizationGateway({ scrubPII: false });
  for (const suffix of ['fixture_' + 'a'.repeat(32), 'fixture-' + 'a'.repeat(32) + '-_']) {
    const key = 'sb_secret_' + suffix;
    assert.equal(veil.sanitize('before ' + key + ' after'), 'before [REDACTED] after');
    assert.equal(new SanitizationGateway({ scrubPII: false, maskString: '$&' }).sanitize(key), '$&');
    assert.equal(new SanitizationGateway({ scrubPII: false, scrubSecrets: false }).sanitize(key), key);
  }
  const publicKey = 'sb_publishable_fixture_' + 'a'.repeat(32);
  assert.equal(veil.sanitize(publicKey), publicKey);
});

test('named Supabase server-key fields mask opaque values in nested contexts', () => {
  const veil = new SanitizationGateway({ scrubPII: false });
  const result = veil.sanitizeContext({ SUPABASE_SECRET_KEY: 'opaque-fixture', nested: {
    supabase_secret_key: 'opaque-fixture', SUPABASE_SERVICE_ROLE_KEY: 'opaque-fixture',
    supabase_service_role_key: 'opaque-fixture', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-fixture',
  } });
  assert.equal(result.SUPABASE_SECRET_KEY, '[REDACTED]');
  for (const name of ['supabase_secret_key', 'SUPABASE_SERVICE_ROLE_KEY', 'supabase_service_role_key']) {
    assert.equal(result.nested[name], '[REDACTED]');
  }
  assert.equal(result.nested.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'public-fixture');
});

test('Supabase credentials cannot leave recall through the provider query or returned context', async () => {
  const secret = 'sb_secret_' + 'fixture_' + 'a'.repeat(32);
  const requests = [];
  const recalled = await recallContext('Find ' + secret, { ...options, memory: {
    recall: async request => {
      requests.push(request);
      return [hit(secret, { normalized_fact: 'Credential ' + secret })];
    },
  } });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].query, 'Find [REDACTED]');
  assert.deepEqual(recalled, [{ id: '[REDACTED]', content: 'Credential [REDACTED]', score: 0.9 }]);
});

test('every shipped core schema is available through a public package subpath', async () => {
  const directory = new URL('.', import.meta.resolve('@starlight-intelligence/core/schemas/work-packet'));
  const files = (await readdir(directory)).filter(file => file.endsWith('.schema.json'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const specifier = `@starlight-intelligence/core/schemas/${file.slice(0, -'.schema.json'.length)}`;
    const entry = import.meta.resolve(specifier);
    assert.equal(entry, new URL(file, directory).href);
    assert.equal(typeof JSON.parse(await readFile(new URL(entry))), 'object');
  }
});

test('bearer redaction consumes the complete RFC 6750 token alphabet and padding', () => {
  const sanitizer = new SanitizationGateway();
  for (const token of ['+fixture/fixture==', 'fixture+fixture/fixture==', 'fixture._~-fixture/+=']) {
    assert.equal(sanitizer.sanitize(`Authorization: Bearer ${token}`), 'Authorization: [REDACTED]');
  }
});

test('context sanitization preserves nested arrays, sparse lengths and cycle safety', () => {
  const sparse = new Array(3); sparse[0] = 'fixture@example.org';
  const cycle = []; cycle.push(cycle);
  const result = new SanitizationGateway().sanitizeContext({
    items: ['safe', { token: 'fixture', nested: [false, 42, null] }], sparse, cycle,
  });
  assert.deepEqual(result.items, ['safe', { token: '[REDACTED]', nested: [false, 42, null] }]);
  assert.ok(Array.isArray(result.sparse)); assert.equal(result.sparse.length, 3);
  assert.equal(result.sparse[0], '[REDACTED]'); assert.equal(1 in result.sparse, false);
  assert.deepEqual(result.cycle, [{ __circular: true }]);
});

test('adversarial non-email and token runs finish within a bounded subprocess deadline', () => {
  const entry = import.meta.resolve('../dist/index.js');
  const script = `import { SanitizationGateway } from ${JSON.stringify(entry)};
    const veil = new SanitizationGateway();
    for (const input of ['a'.repeat(100000), 'eyJ'.repeat(33333), '-eyJ'.repeat(25000), '=eyJ'.repeat(25000), '@eyJ'.repeat(25000), 'a@' + 'a.'.repeat(50000)]) veil.sanitize(input);
    if (veil.sanitize('name+tag@example.org') !== '[REDACTED]') throw Error('Email leaked');`;
  execFileSync(process.execPath, ['--input-type=module', '--eval', script], { timeout: 5000, stdio: 'pipe' });
});

test('oversized facts never reach a host sanitizer before the per-record budget check', () => {
  const inputs = [];
  const result = projectRecall([hit('large', { normalized_fact: 'a'.repeat(16001) }), hit('small')],
    { ...options, sanitizer: { sanitize(text) { inputs.push(text); return text; } } });
  assert.deepEqual(result.map(item => item.id), ['small']);
  assert.ok(inputs.every(text => text.length <= 16000));
});

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
  await assert.rejects(recallContext('query', { ...options, timeoutMs: 10, memory: { recall: () => new Promise(() => {}) } }), { name: 'TimeoutError' });
  const failing = { ...options, memory: { recall: async () => { throw new Error('credential-in-error'); } } };
  await assert.rejects(recallContext('query', failing), error => !error.message.includes('credential-in-error'));
});

test('privacy sanitization precedes provider egress and a failed sanitizer performs no reads', async () => {
  const requests = [];
  const configured = { ...options, memory: { recall: async request => { requests.push(request); return []; } } };
  const credential = 'sk-' + 'a'.repeat(60);
  await recallContext('Contact person@example.org with ' + credential, configured);
  assert.equal(requests[0].query, 'Contact [REDACTED] with [REDACTED]');
  await assert.rejects(recallContext('query', { ...configured, sanitizer: { sanitize() { throw new Error('denied'); } } }));
  await assert.rejects(recallContext('query', { ...configured, sanitizer: { sanitize() { return 'x'.repeat(16_001); } } }));
  assert.equal(requests.length, 1);
});

test('oversized provider identifiers are rejected before any sanitizer work', () => {
  const inputs = [];
  const sanitizer = { sanitize(value) { inputs.push(value); return value; } };
  const result = projectRecall([hit('x'.repeat(257)), hit('safe')], { ...options, sanitizer });
  assert.deepEqual(result.map(item => item.id), ['safe']);
  assert.ok(inputs.every(value => value.length <= 256));
});

test('pending cancellation stays recognizable and never exposes a caller reason', async () => {
  const controller = new AbortController();
  let providerSignal;
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  const result = recallContext('query', { ...options, memory: { recall(request) {
    providerSignal = request.signal; started(); return new Promise(() => {});
  } } }, controller.signal);
  await ready;
  controller.abort('private cancellation reason');
  await assert.rejects(result, error => error.name === 'AbortError' && !error.message.includes('private'));
  assert.equal(providerSignal.aborted, true);
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


test('shared acyclic context branches are retained and repeated traversal stays bounded', () => {
 const shared={ note:'safe', token:'opaque-secret' };
 const result=new SanitizationGateway().sanitizeContext({ first:shared,second:shared });
 assert.deepEqual(result.first,{note:'safe',token:'[REDACTED]'});assert.deepEqual(result.second,result.first);
 let dag={ note:'safe' };for(let i=0;i<20;i++)dag={left:dag,right:dag};
 const bounded=new SanitizationGateway().sanitizeContext(dag);
 assert.ok(JSON.stringify(bounded).includes('__truncated'));
});

// The host may reuse its configuration while a provider read is pending.
async function pendingRecall(configure, mutate, results) {
  let started, finish;
  const entered = new Promise(resolve => { started = resolve; });
  const response = new Promise(resolve => { finish = resolve; });
  const provider = { recall(request) { started(request); return response; } };
  const config = { memory: provider, tenantId: 'tenant-a', workspaceId: 'workspace-a', ...configure };
  const pending = recallContext('reviewed release', config);
  const request = await entered;
  try { mutate(config); } finally { finish(results); }
  return { request, context: await pending };
}

test('in-flight recall retains the admitted tenant when caller configuration changes', async () => {
  const { request, context } = await pendingRecall({}, config => { config.tenantId = 'tenant-b'; },
    [hit('admitted'), hit('other', { tenant_id: 'tenant-b' })]);
  assert.equal(request.tenant_id, 'tenant-a');
  assert.deepEqual(context.map(item => item.id), ['admitted']);
});

test('in-flight recall retains the admitted workspace when caller configuration changes', async () => {
  const { request, context } = await pendingRecall({}, config => { config.workspaceId = 'workspace-b'; },
    [hit('admitted'), hit('other', { workspace_id: 'workspace-b' })]);
  assert.equal(request.workspace_id, 'workspace-a');
  assert.deepEqual(context.map(item => item.id), ['admitted']);
});

test('in-flight recall never expands its admitted sharing grant', async () => {
  const { context } = await pendingRecall({ allowShareable: false }, config => { config.allowShareable = true; },
    [hit('shareable', { privacy_class: 'private-shareable' }), hit('public')]);
  assert.deepEqual(context.map(item => item.id), ['public']);
});

test('in-flight recall retains the admitted result limit', async () => {
  const { context } = await pendingRecall({ limit: 1 }, config => { config.limit = 2; }, [hit('first'), hit('second')]);
  assert.deepEqual(context.map(item => item.id), ['first']);
});

test('in-flight recall retains the admitted character budget', async () => {
  const { context } = await pendingRecall({ maxCharacters: 5 }, config => { config.maxCharacters = 100; }, [hit('first')]);
  assert.equal(context[0].content, 'Use t');
});

test('in-flight recall retains default sanitization when the caller replaces its sanitizer', async () => {
  const { context } = await pendingRecall({}, config => { config.sanitizer = { sanitize: text => text }; },
    [hit('contact', { normalized_fact: 'fixture@example.org' })]);
  assert.equal(context[0].content, '[REDACTED]');
});

test('recall selects its provider method before yielding and preserves its receiver', async () => {
  let originalCalls = 0, replacementCalls = 0;
  const provider = { marker: 'original', async recall() {
    assert.equal(this.marker, 'original'); originalCalls++; return [hit('original')];
  } };
  const pending = recallContext('reviewed release', { ...options, memory: provider });
  provider.recall = async () => { replacementCalls++; return [hit('replacement')]; };
  assert.deepEqual((await pending).map(item => item.id), ['original']);
  assert.equal(originalCalls, 1); assert.equal(replacementCalls, 0);
});

test('in-flight recall selects one sanitizer method and preserves its receiver', async () => {
  const sanitizer = { marker: 'original', sanitize(text) {
    assert.equal(this.marker, 'original'); return text.replace('fixture@example.org', '[REDACTED]');
  } };
  const { context } = await pendingRecall({ sanitizer }, () => { sanitizer.sanitize = text => text; },
    [hit('contact', { normalized_fact: 'fixture@example.org' })]);
  assert.equal(context[0].content, '[REDACTED]');
});

test('a query sanitizer cannot change the admitted scope before provider egress', async () => {
  const config = { ...options, memory: { async recall(request) {
    assert.equal(request.tenant_id, 'tenant-a'); return [hit('admitted')];
  } } };
  config.sanitizer = { sanitize(text) { config.tenantId = 'tenant-b'; return text; } };
  assert.deepEqual((await recallContext('reviewed release', config)).map(item => item.id), ['admitted']);
});

test('query sanitizer diagnostics are withheld and provider work never starts', async () => {
  let calls = 0;
  await assert.rejects(recallContext('reviewed release', { ...options,
    memory: { async recall() { calls++; return []; } },
    sanitizer: { sanitize() { throw new Error('synthetic private host diagnostic'); } },
  }), error => error.message === 'Memory recall unavailable or denied');
  assert.equal(calls, 0);
});

test('standalone projection retains scope and sharing permission across sanitizer callbacks', () => {
  const config = { ...options, allowShareable: false };
  config.sanitizer = { sanitize(text) {
    config.tenantId = 'tenant-b'; config.allowShareable = true; return text;
  } };
  const context = projectRecall([hit('admitted'), hit('foreign', { tenant_id: 'tenant-b' }),
    hit('shareable', { tenant_id: 'tenant-b', privacy_class: 'private-shareable' })], config);
  assert.deepEqual(context.map(item => item.id), ['admitted']);
});

test('standalone projection retains its sanitizer method across host callbacks', () => {
  const sanitizer = { sanitize(text) {
    this.sanitize = value => value;
    return text.replace('fixture@example.org', '[REDACTED]');
  } };
  const context = projectRecall([hit('fixture@example.org', { normalized_fact: 'safe first fact' }),
    hit('second', { normalized_fact: 'fixture@example.org' })], { ...options, sanitizer });
  assert.equal(context[0].id, '[REDACTED]');
  assert.equal(context[1].content, '[REDACTED]');
});

test('cancellation during query sanitization prevents provider work without an unhandled rejection', async () => {
  const controller = new AbortController();
  let calls = 0;
  await assert.rejects(recallContext('reviewed release', { ...options,
    memory: { async recall() { calls++; return []; } },
    sanitizer: { sanitize(text) { controller.abort('synthetic private caller reason'); return text; } },
  }, controller.signal), error => error.name === 'AbortError' && !error.message.includes('synthetic'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 0);
});
