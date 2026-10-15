import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { brandDigest, runBrandWorkflow, type BrandJournal, type BrandStage, type BrandWorkflowContract } from '../src/brand-workflow.js';
import { BrandWorkflowStore, brandOutcomePayload, type BrandDatabase, type SignedBrandOutcome } from '../src/brand-workflow-store.js';

const require = createRequire(import.meta.url);
function database(file: string): BrandDatabase & { close(): void } {
  // Node 20 CI uses the existing better-sqlite3 dependency; Node 24 can use its built-in driver.
  let native: { DatabaseSync: new (file: string) => BrandDatabase & { close(): void } } | undefined;
  try { native = require('node:sqlite'); } catch { /* Older supported Node release. */ }
  return native ? new native.DatabaseSync(file) : new (require('better-sqlite3'))(file);
}
function contract(): BrandWorkflowContract {
  return {
    schema: 'starlight.brand-workflow.v1', workId: 'sample', brand: 'sample', repository: 'example/studio',
    intent: { revision: 'feedback-2', outcome: 'Save and reopen a draft', sourceRefs: ['intent://sample/2'] },
    criteria: [
      { id: 'save', kind: 'behavior', description: 'Reopened draft matches saved content' },
      { id: 'test', kind: 'engineering', description: 'Persistence regression passes' },
      { id: 'design', kind: 'design', description: 'Save and recovery controls are discoverable' },
    ], references: [{ name: 'Sample', url: 'https://example.com/reference' }], constraints: [],
    maker: { actorId: 'maker', provider: 'provider-a' }, checker: { actorId: 'checker', provider: 'provider-b' },
    maxAttempts: 2, contextBudgetChars: 8000,
  };
}
const artifact = brandDigest('sample content');
function fixture(global = 50, clock = Date.now) {
  const dir = mkdtempSync(join(tmpdir(), 'sis-brand-store-')); const file = join(dir, 'workflow.sqlite');
  const db = database(file); const connections = [db];
  const store = new BrandWorkflowStore(db, { totalMicroUsd: global, now: clock });
  const keys = { maker: generateKeyPairSync('ed25519'), checker: generateKeyPairSync('ed25519') };
  const c = contract();
  for (const principal of [c.maker, c.checker]) store.registerPrincipal({ ...principal,
    publicKey: keys[principal.actorId as keyof typeof keys].publicKey.export({ type: 'spki', format: 'pem' }).toString() });
  const lease = store.acquire('repo://sample-studio', 'worker-1', 60_000);
  const budget = { totalMicroUsd: 40, stageMicroUsd: 5 };
  store.admit(c, 'attempt-1', lease, budget);
  function outcome(stage: BrandStage, baseline = c, cost: number | null = 1, attempt = 'attempt-1'): SignedBrandOutcome {
    const actor = stage === 'verify' ? baseline.checker : baseline.maker;
    const receipt = { stage, ...actor, contractDigest: brandDigest(baseline), artifactDigest: artifact,
      operationId: brandDigest([baseline.workId, attempt, brandDigest(baseline), stage]), evidenceRef: `evidence://fixture/${stage}`, verdict: 'pass' as const,
      ...(['check', 'verify'].includes(stage) ? { criteria: baseline.criteria.filter(x => stage === 'verify' || x.kind === 'engineering')
        .map(x => ({ id: x.id, verdict: 'pass' as const, evidenceRef: `evidence://fixture/${stage}/${x.id}` })) } : {}),
    };
    const unsigned = { receipt, costMicroUsd: cost, usageRef: 'usage://synthetic/local-test' };
    return { ...unsigned, signature: sign(null, brandOutcomePayload(unsigned), keys[actor.actorId as keyof typeof keys].privateKey).toString('base64') };
  }
  const hostOptions = { workId: c.workId, attemptId: 'attempt-1', lease, timeoutMs: 500,
    readContract: async () => c, artifactDigest: async () => artifact, capacity: async () => true,
    execute: async (stage: BrandStage, baseline: BrandWorkflowContract) => outcome(stage, baseline),
  };
  return { dir, file, db, store, c, keys, lease, budget, outcome, hostOptions,
    reopen: () => { const next = database(file); connections.push(next); return new BrandWorkflowStore(next, { totalMicroUsd: global, now: clock }); },
    close: () => { for (const connection of connections) { try { connection.close(); } catch { /* Already closed by the restart test. */ } }
      assert.equal(dirname(resolve(dir)), resolve(tmpdir())); assert.ok(basename(dir).startsWith('sis-brand-store-'));
      rmSync(dir, { recursive: true, force: true }); },
  };
}
function reserved(j: BrandJournal): BrandJournal { return { ...j, inFlight: 'recover' }; }

test('durable host completes across closed connections and authenticates persisted evidence', async () => {
  const f = fixture();
  try {
    assert.equal((await runBrandWorkflow(f.store.host(f.hostOptions), 3)).next, 'build');
    f.db.close(); const next = f.reopen();
    assert.equal((await runBrandWorkflow(next.host(f.hostOptions), 4)).status, 'complete');
    assert.deepEqual(next.usage(f.c.workId), { chargedMicroUsd: 7, unresolved: 0, ceilingMicroUsd: 40 });
    assert.equal((await runBrandWorkflow(next.host(f.hostOptions))).status, 'complete');
  } finally { f.close(); }
});

test('atomic journal CAS permits only one competing writer', () => {
  const f = fixture();
  try {
    const other = f.reopen(); const j = f.store.load(f.c.workId, 'attempt-1');
    f.store.reserve(f.c.workId, reserved(j), brandDigest(j), f.lease);
    assert.throws(() => other.reserve(f.c.workId, reserved(j), brandDigest(j), f.lease), /conflict/i);
    assert.equal(f.store.usage(f.c.workId).chargedMicroUsd, 5);
  } finally { f.close(); }
});

test('separate processes racing one journal dispatch reservation get one winner', async () => {
  const f = fixture();
  try {
    const j = f.store.load(f.c.workId, 'attempt-1');
    const payload = Buffer.from(JSON.stringify({ file: f.file, lease: f.lease, next: reserved(j), expected: brandDigest(j) })).toString('base64');
    const code = `import {createRequire} from 'node:module'; import {BrandWorkflowStore} from './src/brand-workflow-store.ts';
      const require=createRequire(import.meta.url); const p=JSON.parse(Buffer.from(process.argv[1],'base64').toString());
      let db;try {db=new (require('node:sqlite').DatabaseSync)(p.file);}catch {db=new (require('better-sqlite3'))(p.file);}
      const store=new BrandWorkflowStore(db,{totalMicroUsd:50});
      try {store.reserve('sample',p.next,p.expected,p.lease);console.log('won');}catch {console.log('lost');}finally{db.close();}`;
    const run = () => new Promise<string>((resolveRun, reject) => {
      const child = spawn(process.execPath, [...process.execArgv, '--input-type=module', '-e', code, payload], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
      let output = ''; let errors = ''; const timer = setTimeout(() => child.kill(), 10_000);
      child.stdout.on('data', x => { output += x; }); child.stderr.on('data', x => { errors += x; });
      child.on('error', reject); child.on('close', exit => { clearTimeout(timer); exit === 0 ? resolveRun(output.trim()) : reject(new Error(errors)); });
    });
    assert.deepEqual((await Promise.all([run(), run()])).sort(), ['lost', 'won']);
    assert.equal(f.store.usage(f.c.workId).chargedMicroUsd, 5);
  } finally { f.close(); }
});

test('lease ownership and fencing reject expired or superseded writers', () => {
  let now = Date.now(); const f = fixture(50, () => now);
  try {
    assert.throws(() => f.store.acquire(f.lease.resource, 'worker-2', 1000), /already leased/);
    now += 60_001; const replacement = f.store.acquire(f.lease.resource, 'worker-2', 1000);
    assert.ok(replacement.fence > f.lease.fence);
    assert.equal(f.store.canDispatch(f.c.workId, f.lease), false);
    assert.equal(f.store.canDispatch(f.c.workId, replacement), true);
    assert.throws(() => f.store.release(f.lease), /Lease/);
  } finally { f.close(); }
});

test('a lost outcome prevents redispatch and holds other work sharing the artifact resource', async () => {
  let now = Date.now(); const f = fixture(50, () => now); let effects = 0;
  try {
    const host = f.store.host({ ...f.hostOptions, execute: async () => { effects++; throw new Error('response lost'); } });
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
    const journal = f.store.load(f.c.workId, 'attempt-1');
    const op = f.outcome('recover').receipt.operationId;
    await assert.rejects(host.execute('recover', f.c, op), /already dispatched/);
    assert.equal(effects, 1);
    assert.throws(() => f.store.admit(f.c, 'attempt-2', f.lease, f.budget), /Reconciliation/);
    now += 60_001; const lease = f.store.acquire(f.lease.resource, 'replacement', 1000);
    const other = { ...f.c, workId: 'other-work' };
    f.store.admit(other, 'other-attempt', lease, f.budget);
    assert.equal(f.store.canDispatch(other.workId, lease), false);
    const next = { ...journal, receipts: [f.outcome('recover').receipt] }; delete next.inFlight;
    f.store.settle(f.c.workId, next, brandDigest(journal), lease, f.outcome('recover'));
    assert.equal(f.store.canDispatch(other.workId, lease), true);
  } finally { f.close(); }
});

test('provider reference survives a timeout; remote cancellation is not assumed', async () => {
  const f = fixture(); let aborted = false;
  try {
    const host = f.store.host({ ...f.hostOptions, timeoutMs: 15, execute: async (_stage, _c, context) => {
      context.recordProviderReference('provider://synthetic/request-1');
      context.signal.addEventListener('abort', () => { aborted = true; });
      return new Promise(() => {});
    } });
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
    assert.equal(aborted, true);
    const op = f.db.prepare('SELECT provider_ref,state FROM brand_operations').get() as { provider_ref: string; state: string };
    assert.equal(op.provider_ref, 'provider://synthetic/request-1'); assert.equal(op.state, 'dispatched');
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
  } finally { f.close(); }
});

test('attempt counters and spending limits survive reopen and cannot be reset by callers', async () => {
  const f = fixture();
  try {
    await runBrandWorkflow(f.store.host(f.hostOptions), 7);
    const other = f.reopen();
    assert.throws(() => other.admit(f.c, 'attempt-2', f.lease, { ...f.budget, totalMicroUsd: 100 }), /limits/);
    assert.equal(other.admit(f.c, 'attempt-2', f.lease, f.budget).attemptNumber, 2);
    assert.throws(() => other.admit(f.c, 'attempt-3', f.lease, f.budget), /attempt/);
    assert.throws(() => new BrandWorkflowStore(f.db, { totalMicroUsd: 100 }), /Global budget changed/);
  } finally { f.close(); }
});

test('global reservation ceiling applies across different work and resource identities', () => {
  const f = fixture(5);
  try {
    const j = f.store.load(f.c.workId, 'attempt-1'); f.store.reserve(f.c.workId, reserved(j), brandDigest(j), f.lease);
    const lease = f.store.acquire('repo://other', 'worker-2', 1000); const c = { ...f.c, workId: 'other' };
    const next = f.store.admit(c, 'attempt-1', lease, f.budget);
    assert.equal(f.store.canDispatch(c.workId, lease), false);
    assert.throws(() => f.store.reserve(c.workId, reserved(next), brandDigest(next), lease), /budget/);
  } finally { f.close(); }
});

test('unknown usage stays reserved until signed reconciliation and preserves both reports', async () => {
  const f = fixture();
  try {
    const host = f.store.host({ ...f.hostOptions, execute: async stage => f.outcome(stage, f.c, null) });
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
    assert.deepEqual(f.store.usage(f.c.workId), { chargedMicroUsd: 5, unresolved: 1, ceilingMicroUsd: 40 });
    const previous = f.store.load(f.c.workId, 'attempt-1'); const known = f.outcome('recover', f.c, 2);
    const next = { ...previous, receipts: [known.receipt] }; delete next.inFlight;
    f.store.settle(f.c.workId, next, brandDigest(previous), f.lease, known);
    assert.deepEqual(f.store.usage(f.c.workId), { chargedMicroUsd: 2, unresolved: 0, ceilingMicroUsd: 40 });
    assert.equal((f.db.prepare('SELECT COUNT(*) AS n FROM brand_outcomes').get() as { n: number }).n, 2);
  } finally { f.close(); }
});

test('reported provider overage is recorded and blocks further work', async () => {
  const f = fixture();
  try {
    const host = f.store.host({ ...f.hostOptions, execute: async stage => f.outcome(stage, f.c, 6) });
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
    assert.equal(f.store.usage(f.c.workId).chargedMicroUsd, 6);
    assert.equal(f.store.canDispatch(f.c.workId, f.lease), false);
  } finally { f.close(); }
});

for (const cost of [null, 6]) test(`unreconciled cost ${cost} holds dispatch across resources, including prior reservations`, async () => {
  const f = fixture();
  try {
    const lease = f.store.acquire('repo://other', 'worker-2', 1000);
    const c = { ...f.c, workId: 'other' };
    const j = f.store.admit(c, 'attempt-1', lease, f.budget);
    f.store.reserve(c.workId, reserved(j), brandDigest(j), lease);
    const freshLease = f.store.acquire('repo://third', 'worker-3', 1000);
    const third = { ...f.c, workId: 'third' };
    f.store.admit(third, 'attempt-1', freshLease, f.budget);
    const host = f.store.host({ ...f.hostOptions, execute: async stage => f.outcome(stage, f.c, cost) });
    assert.equal((await runBrandWorkflow(host)).reason, 'reconciliation-required');
    assert.equal(f.store.canDispatch(third.workId, freshLease), false);
    const op = brandDigest([c.workId, j.attemptId, j.contractDigest, 'recover']);
    assert.throws(() => f.store.dispatch(c.workId, j.attemptId, 'recover', c, op, lease), /reconciliation/i);
    assert.equal((f.db.prepare('SELECT state FROM brand_operations WHERE operation=?').get(op) as { state: string }).state, 'reserved');
  } finally { f.close(); }
});

test('an undispatched reservation can be abandoned with evidence, freeing a fresh bounded attempt', async () => {
  const f = fixture();
  try {
    const j = f.store.load(f.c.workId, 'attempt-1'); const pending = reserved(j);
    f.store.reserve(f.c.workId, pending, brandDigest(j), f.lease);
    assert.throws(() => f.store.abandonUndispatched(f.c.workId, j.attemptId, brandDigest(j), f.lease, 'intent changed'), /conflict/);
    f.store.abandonUndispatched(f.c.workId, j.attemptId, brandDigest(pending), f.lease, 'intent changed');
    assert.deepEqual(f.store.usage(f.c.workId), { chargedMicroUsd: 0, unresolved: 0, ceilingMicroUsd: 40 });
    assert.equal(f.store.load(f.c.workId, j.attemptId).inFlight, 'recover');
    const op = brandDigest([f.c.workId, j.attemptId, j.contractDigest, 'recover']);
    assert.throws(() => f.store.dispatch(f.c.workId, j.attemptId, 'recover', f.c, op, f.lease), /not reserved/);
    assert.equal((f.db.prepare('SELECT resolution FROM brand_operations WHERE operation=?').get(op) as { resolution: string }).resolution, 'intent changed');
    assert.equal(f.store.admit(f.c, 'attempt-2', f.lease, f.budget).attemptNumber, 2);
  } finally { f.close(); }
});

test('abandonment cannot clear a dispatched effect or another resource owner', async () => {
  const f = fixture();
  try {
    await runBrandWorkflow(f.store.host({ ...f.hostOptions, execute: async () => { throw new Error('lost'); } }));
    const j = f.store.load(f.c.workId, 'attempt-1');
    const otherLease = f.store.acquire('repo://other', 'worker-2', 1000);
    assert.throws(() => f.store.abandonUndispatched(f.c.workId, j.attemptId, brandDigest(j), otherLease, 'cancel'), /Lease/);
    assert.throws(() => f.store.abandonUndispatched(f.c.workId, j.attemptId, brandDigest(j), f.lease, 'cancel'), /dispatched/);
    assert.equal(f.store.usage(f.c.workId).unresolved, 1);
  } finally { f.close(); }
});

test('tampered receipts, usage, provider claims and revoked signing identities fail authentication', async () => {
  const f = fixture();
  try {
    const good = f.outcome('recover'); assert.equal(f.store.verifyOutcome(good), true);
    for (const bad of [ { ...good, costMicroUsd: 0 }, { ...good, usageRef: 'usage://forged' },
      { ...good, receipt: { ...good.receipt, provider: 'provider-b' } },
      { ...good, receipt: { ...good.receipt, artifactDigest: brandDigest('forged') } } ]) assert.equal(f.store.verifyOutcome(bad), false);
    await runBrandWorkflow(f.store.host(f.hostOptions), 7);
    f.store.revokePrincipal('checker');
    assert.equal((await runBrandWorkflow(f.store.host(f.hostOptions))).reason, 'unauthenticated-receipt');
  } finally { f.close(); }
});

test('two claimed principals cannot share one signing key or silently replace a trusted binding', () => {
  const f = fixture();
  try {
    const key = f.keys.maker.publicKey.export({ type: 'spki', format: 'pem' }).toString();
    assert.throws(() => f.store.registerPrincipal({ actorId: 'third', provider: 'provider-c', publicKey: key }), /UNIQUE/);
    assert.throws(() => f.store.registerPrincipal({ actorId: 'maker', provider: 'different-provider', publicKey: key }), /binding/);
    f.store.revokePrincipal('maker');
    assert.throws(() => f.store.registerPrincipal({ actorId: 'maker', provider: 'provider-a', publicKey: key }), /revoked/);
  } finally { f.close(); }
});
