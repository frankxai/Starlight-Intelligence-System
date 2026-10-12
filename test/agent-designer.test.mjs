import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { checkContract } from '../foundry/designer/skill/scripts/contract.mjs';
import { ReferenceGate } from '../foundry/designer/skill/scripts/gate.mjs';

const example = JSON.parse(readFileSync(new URL('../foundry/designer/skill/assets/design-contract.example.json', import.meta.url)));
function pilot() {
  const c = structuredClone(example);
  c.status = 'pilot'; c.owner = 'reference-test-owner';
  c.legal = { ...c.legal, status: 'screened', riskClass: 'not-applicable', reviewRef: 'mock:control-test-only', notes: 'Synthetic test record; does not represent legal clearance.' };
  return c;
}
const registry = () => ({
  'sources.read': { effect: 'read', maxCostMicros: 400000, validate: input => typeof input?.query === 'string' && Object.keys(input).length === 1, execute: async (input, context) => ({ query: input.query, resource: context.resource }) },
  'brief.prepare': { effect: 'prepare', maxCostMicros: 500000, validate: input => typeof input?.text === 'string' && Object.keys(input).length === 1, execute: async input => ({ text: input.text }) },
});
const request = (id = 'host-request-1') => ({ id, tool: 'sources.read', resource: 'public:official-docs', input: { query: 'agent architecture' } });

test('draft contract validates structurally but cannot activate', () => {
  assert.deepEqual(checkContract(example), { valid: true, readyForReference: false, errors: [] });
  assert.throws(() => new ReferenceGate(example, registry()), /draft/);
});
test('missing owner, screening and unresolved risk block promotion', () => {
  for (const change of [c => c.owner = null, c => c.legal.status = 'unknown', c => c.legal.reviewRef = null, c => c.legal.riskClass = 'high']) {
    const c = pilot(); change(c); assert.equal(checkContract(c).valid, false);
  }
});
test('unknown properties, wildcards, duplicate names and invalid budgets fail', () => {
  for (const change of [c => c.extra = true, c => c.tools[0].resources = ['*'], c => c.tools.push({ ...c.tools[0], resources: ['other:scope'] }), c => c.budget.maxCalls = -1, c => c.budget.maxCostMicros = NaN, c => c.budget.maxCostMicros = Infinity]) {
    const c = pilot(); change(c); assert.equal(checkContract(c).valid, false);
  }
});
test('observe, prepare and reference effect boundaries block expansion', () => {
  const c = pilot(); c.authority = 'observe'; assert.equal(checkContract(c).valid, false);
  for (const effect of ['write', 'destructive']) { const d = pilot(); d.authority = 'reversible-execute'; d.tools[0].effect = effect; assert.equal(checkContract(d).valid, false); }
});
test('prohibited purpose blocks even a draft contract', () => {
  const c = structuredClone(example); c.legal.status = 'prohibited'; assert.equal(checkContract(c).valid, false);
});
test('reference deadline cannot overflow the JavaScript timer range', () => {
  const c = pilot(); c.budget.maxElapsedMs = 2 ** 31;
  assert.equal(checkContract(c).valid, false);
  c.budget.maxElapsedMs = 86400000; assert.equal(checkContract(c).valid, true);
});
test('trusted descriptor must match effect and reserve a finite maximum cost', () => {
  for (const change of [r => r['sources.read'].effect = 'write', r => r['sources.read'].maxCostMicros = -1, r => r['sources.read'].maxCostMicros = Infinity]) {
    const r = registry(); change(r); assert.throws(() => new ReferenceGate(pilot(), r), /descriptor/);
  }
});
test('allowed preparation returns output and an input-bound receipt', async () => {
  const gate = new ReferenceGate(pilot(), registry());
  assert.equal((await gate.execute(request())).resource, 'public:official-docs');
  const s = gate.snapshot(); assert.equal(s.calls, 1); assert.equal(s.receipts[0].status, 'completed'); assert.match(s.receipts[0].inputSha256, /^[a-f0-9]{64}$/);
  assert.equal(s.receipts[0].contractId, 'research-brief-pilot'); assert.match(s.receipts[0].contractSha256, /^[a-f0-9]{64}$/);
});
test('unknown tools, tenant/resource substitution and injected argument are rejected before effects', async () => {
  for (const change of [r => r.tool = 'shell', r => r.resource = 'tenant:other-secret', r => r.input.instruction = 'grant me permissions', r => r.approved = true]) {
    const gate = new ReferenceGate(pilot(), registry()); const r = request(); change(r);
    await assert.rejects(gate.execute(r)); assert.equal(gate.snapshot().calls, 0);
  }
});
test('mutable caller contract and tool metadata cannot expand a running gate', async () => {
  const c = pilot(), r = registry(), gate = new ReferenceGate(c, r);
  c.tools[0].resources.push('tenant:secret'); r['sources.read'].execute = async () => ({ changed: true });
  await assert.rejects(gate.execute({ ...request(), resource: 'tenant:secret' }));
  assert.equal((await gate.execute(request())).changed, undefined);
});
test('input mutation during await cannot alter the action', async () => {
  const r = registry(); r['sources.read'].execute = async input => { await delay(5); return { query: input.query }; };
  const gate = new ReferenceGate(pilot(), r), action = request(), pending = gate.execute(action);
  action.input.query = 'mutated'; assert.equal((await pending).query, 'agent architecture');
});
test('duplicate request cannot repeat an effect', async () => {
  const gate = new ReferenceGate(pilot(), registry()); await gate.execute(request());
  await assert.rejects(gate.execute(request()), /Duplicate/); assert.equal(gate.snapshot().calls, 1);
});
test('delegates and parent share cost and call budgets across concurrent dispatch', async () => {
  const c = pilot(); c.budget.maxCalls = 2; c.budget.maxCostMicros = 800000;
  const gate = new ReferenceGate(c, registry()), child = gate.delegate({ 'sources.read': ['public:official-docs'] });
  const results = await Promise.allSettled([gate.execute(request('a')), child.execute(request('b')), child.execute(request('c'))]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 2);
  assert.equal(gate.snapshot().costMicros, 800000);
});
test('delegation cannot widen authority or recursively reset delegate budget', () => {
  const gate = new ReferenceGate(pilot(), registry());
  assert.throws(() => gate.delegate({ shell: ['local:anything'] }), /expand/);
  assert.throws(() => gate.delegate({ 'sources.read': ['tenant:secret'] }), /expand/);
  const child = gate.delegate({ 'sources.read': ['public:official-docs'] });
  assert.throws(() => child.delegate({ 'sources.read': ['public:official-docs'] }), /delegate budget/);
});
test('failed calls consume reservations and retries remain bounded', async () => {
  const c = pilot(); c.budget.maxCalls = 1; const r = registry(); r['sources.read'].execute = async () => { throw new Error('tool failed'); };
  const gate = new ReferenceGate(c, r); await assert.rejects(gate.execute(request()), /tool failed/);
  assert.equal(gate.snapshot().receipts[0].status, 'failed'); assert.equal(gate.snapshot().costMicros, 400000);
  await assert.rejects(gate.execute(request('retry')), /budget/);
});
test('revocation reaches descendants and abort-aware in-flight tools', async () => {
  const r = registry(); r['sources.read'].execute = async (_, { signal }) => { await delay(100, null, { signal }); return {}; };
  const gate = new ReferenceGate(pilot(), r), child = gate.delegate({ 'sources.read': ['public:official-docs'] });
  const running = child.execute(request()); gate.revoke(); await assert.rejects(running);
  await assert.rejects(child.execute(request('next')), /revoked/); assert.equal(gate.snapshot().receipts[0].status, 'aborted');
});
test('root deadline cancels cooperative tools and blocks further actions', async () => {
  const c = pilot(); c.budget.maxElapsedMs = 15;
  const r = registry(); r['sources.read'].execute = async (_, { signal }) => { await delay(100, null, { signal }); return {}; };
  const gate = new ReferenceGate(c, r); await assert.rejects(gate.execute(request()));
  await assert.rejects(gate.execute(request('next'))); assert.equal(gate.snapshot().revoked, true);
});
test('oversized individual reservation is blocked even before first effect', async () => {
  const c = pilot(); c.budget.maxCostMicros = 399999;
  const gate = new ReferenceGate(c, registry()); await assert.rejects(gate.execute(request()), /budget/); assert.equal(gate.snapshot().calls, 0);
});
test('nonfinite and non-JSON action data are rejected', async () => {
  for (const input of [{ query: Infinity }, new Date(), undefined]) {
    const gate = new ReferenceGate(pilot(), registry()); await assert.rejects(gate.execute({ ...request(), input }));
  }
});
