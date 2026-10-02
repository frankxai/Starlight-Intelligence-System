import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import {
  BRAND_STAGES, brandDigest, compileBrandWorkflow, createBrandJournal, inspectBrandWorkflow,
  runBrandWorkflow, validateBrandContract, type BrandJournal, type BrandReceipt,
  type BrandStage, type BrandWorkflowContract, type BrandWorkflowHost,
} from '../src/brand-workflow.js';
import { parseWorkGraphJsonl, projectWorkGraph } from '../src/work-graph.js';

function contract(): BrandWorkflowContract {
  return {
    schema: 'starlight.brand-workflow.v1', workId: 'sample-save', brand: 'sample-studio', repository: 'example/studio',
    intent: { revision: 'feedback-2', outcome: 'A creator can save and reopen a draft', sourceRefs: ['intent://sample/turn-2'] },
    criteria: [
      { id: 'save', kind: 'behavior', description: 'Reopened content equals saved content' },
      { id: 'tests', kind: 'engineering', description: 'Persistence regression checks pass' },
      { id: 'design', kind: 'design', description: 'First-time use and recovery states are reviewed against the named reference' },
    ],
    references: [{ name: 'Sample reference', url: 'https://example.com/reference' }],
    constraints: ['Preserve existing draft content'], maker: { actorId: 'maker', provider: 'provider-a' },
    checker: { actorId: 'checker', provider: 'provider-b' }, maxAttempts: 3, contextBudgetChars: 8000,
  };
}
const artifact = brandDigest('draft content');
function journal(c = contract()): BrandJournal {
  return createBrandJournal(c, 'attempt-1', 1, '2026-09-15T12:00:00.000Z');
}
function receipt(stage: BrandStage, c = contract(), artifactDigest = artifact): BrandReceipt {
  const actor = stage === 'verify' ? c.checker : c.maker;
  const r: BrandReceipt = { stage, ...actor, contractDigest: brandDigest(c), artifactDigest,
    operationId: brandDigest([c.workId, 'attempt-1', brandDigest(c), stage]),
    evidenceRef: `evidence://sample/${stage}`, verdict: 'pass' };
  if (stage === 'verify' || stage === 'check') r.criteria = c.criteria
    .filter((x) => stage === 'verify' || x.kind === 'engineering')
    .map((x) => ({ id: x.id, verdict: 'pass', evidenceRef: `evidence://sample/${stage}/${x.id}` }));
  return r;
}
function complete(c = contract()): BrandJournal {
  return { ...journal(c), receipts: BRAND_STAGES.map((stage) => receipt(stage, c)) };
}

test('one graph template compiles for different brands and keeps acceptance in context', () => {
  for (const brand of ['gencreator', 'arcanea', 'starlight', 'another-brand']) {
    const c = { ...contract(), brand };
    const result = compileBrandWorkflow(c);
    assert.equal(result.graph.nodes.length, 7);
    assert.equal(result.graph.nodes[4].id, 'refine');
    assert.deepEqual(result.contract.criteria, c.criteria);
  }
});

test('contract fingerprint is stable across JSON key ordering and changes with feedback', () => {
  const a = contract(); const b = Object.fromEntries(Object.entries(a).reverse());
  assert.equal(brandDigest(a), brandDigest(b));
  b.intent = { ...a.intent, revision: 'feedback-3' };
  assert.notEqual(brandDigest(a), brandDigest(b));
  const compiled = compileBrandWorkflow(a);
  a.intent.outcome = 'Changed after admission';
  assert.notEqual(compiled.contract.intent.outcome, a.intent.outcome);
});

test('incomplete criteria, duplicate IDs, identical providers and oversized context are rejected', () => {
  const cases = [
    { ...contract(), criteria: [] },
    { ...contract(), criteria: contract().criteria.slice(1) },
    { ...contract(), criteria: [...contract().criteria, contract().criteria[0]] },
    { ...contract(), checker: { actorId: 'checker', provider: 'provider-a' } },
    { ...contract(), checker: { actorId: 'maker', provider: 'provider-b' } },
    { ...contract(), constraints: ['x'.repeat(1000), 'y'.repeat(1000)], contextBudgetChars: 1000 },
    { ...contract(), references: [{ name: 'secret', url: 'https://user:password@example.com' }] },
  ];
  for (const c of cases) assert.ok(validateBrandContract(c).length);
});

test('malformed input fails closed', () => {
  for (const c of [null, [], {}, { ...contract(), intent: null }, { ...contract(), maxAttempts: NaN }]) {
    assert.equal(inspectBrandWorkflow(c, journal(), artifact).status, 'blocked');
  }
  for (const j of [null, [], {}, { ...journal(), receipts: [null] }, { ...journal(), attemptNumber: 99 }]) {
    assert.equal(inspectBrandWorkflow(contract(), j, artifact).status, 'blocked');
  }
});

test('initial criteria are not passing until all stages have receipts', () => {
  assert.equal(inspectBrandWorkflow(contract(), journal(), artifact).status, 'ready');
  assert.equal(inspectBrandWorkflow(contract(), journal(), artifact).next, 'recover');
  const prefix = { ...journal(), receipts: [receipt('recover'), receipt('research')] };
  assert.equal(inspectBrandWorkflow(contract(), prefix, artifact).next, 'design');
});

test('completed workflow projects through the existing work graph', () => {
  const result = inspectBrandWorkflow(contract(), complete(), artifact);
  assert.equal(result.status, 'complete');
  const parsed = parseWorkGraphJsonl(result.events.join('\n'));
  assert.equal(projectWorkGraph(parsed.events).workItems[0].completed, true);
  assert.ok(result.events.some((event) => JSON.parse(event).kind === 'verification.passed'));
});

test('latest feedback and acceptance changes invalidate even a previously complete run', () => {
  for (const edit of [(c: BrandWorkflowContract) => { c.intent.revision = 'feedback-3'; },
    (c: BrandWorkflowContract) => { c.criteria[0].description = 'Also recover an interrupted save'; }]) {
    const c = contract(); edit(c);
    assert.equal(inspectBrandWorkflow(c, complete(), artifact).reason, 'intent-changed');
  }
});

test('a changed artifact cannot reuse an earlier pass', () => {
  assert.equal(inspectBrandWorkflow(contract(), complete(), brandDigest('different')).reason, 'artifact-drift');
  const j = complete(); j.receipts[6].artifactDigest = brandDigest('changed by reviewer');
  assert.equal(inspectBrandWorkflow(contract(), j, j.receipts[6].artifactDigest).reason, 'artifact-changed-after-refinement');
});

test('another attempt cannot reuse authenticated evidence from a prior attempt', () => {
  const j = complete(); j.attemptId = 'attempt-2'; j.attemptNumber = 2;
  assert.equal(inspectBrandWorkflow(contract(), j, artifact).reason, 'invalid-receipt');
});

test('skipping refinement, forged provider labels and duplicate receipts never complete', () => {
  const skipped = complete(); skipped.receipts.splice(4, 1);
  const forged = complete(); forged.receipts[6].provider = 'provider-a';
  const duplicate = complete(); duplicate.receipts.push(receipt('verify'));
  for (const j of [skipped, forged, duplicate]) assert.equal(inspectBrandWorkflow(contract(), j, artifact).status, 'blocked');
});

test('verification must cover every behavior, engineering and design criterion exactly once', () => {
  const missing = complete(); missing.receipts[6].criteria!.pop();
  const duplicate = complete(); duplicate.receipts[6].criteria![1] = duplicate.receipts[6].criteria![0];
  const failed = complete(); failed.receipts[6].criteria![0].verdict = 'fail';
  const absentEvidence = complete(); absentEvidence.receipts[6].criteria![0].evidenceRef = '';
  for (const j of [missing, duplicate, failed, absentEvidence]) {
    assert.equal(inspectBrandWorkflow(contract(), j, artifact).status, 'blocked');
  }
});

test('a pending side effect and an explicit failed stage require reconciliation or repair', () => {
  assert.equal(inspectBrandWorkflow(contract(), { ...journal(), inFlight: 'recover' }, artifact).reason, 'reconciliation-required');
  const j = journal(); j.receipts.push({ ...receipt('recover'), verdict: 'fail' });
  assert.equal(inspectBrandWorkflow(contract(), j, artifact).reason, 'stage-failed');
});

function memoryHost() {
  let c = contract(); let saved = journal(c); let calls = 0;
  const host: BrandWorkflowHost = {
    readContract: async () => structuredClone(c), artifactDigest: async () => artifact,
    load: async () => structuredClone(saved),
    save: async (next, expected) => { assert.equal(brandDigest(saved), expected); saved = structuredClone(next); },
    admit: async () => true, authenticate: async () => true,
    execute: async (stage) => { calls++; assert.equal(saved.inFlight, stage); return receipt(stage, c); },
  };
  return { host, calls: () => calls, saved: () => saved, changeIntent: () => { c = { ...c, intent: { ...c.intent, revision: 'new' } }; } };
}

test('bounded wakes resume from saved receipts without rerunning prior stages', async () => {
  const h = memoryHost();
  assert.equal((await runBrandWorkflow(h.host, 2)).next, 'design');
  assert.equal((await runBrandWorkflow(h.host, 5)).status, 'complete');
  assert.equal(h.calls(), 7);
  assert.equal((await runBrandWorkflow(h.host)).status, 'complete');
  assert.equal(h.calls(), 7);
});

test('host authenticates restored receipts before trusting completion', async () => {
  const h = memoryHost(); await runBrandWorkflow(h.host, 7);
  h.host.authenticate = async () => false;
  assert.equal((await runBrandWorkflow(h.host)).reason, 'unauthenticated-receipt');
  assert.equal(h.calls(), 7);
});

test('feedback changing during restored-evidence authentication prevents stale completion', async () => {
  const h = memoryHost(); await runBrandWorkflow(h.host, 7);
  h.host.authenticate = async () => { h.changeIntent(); return true; };
  assert.equal((await runBrandWorkflow(h.host)).reason, 'intent-changed');
  assert.equal(h.calls(), 7);
});

test('capacity and cancellation prevent dispatch', async () => {
  const h = memoryHost(); h.host.admit = async () => false;
  assert.equal((await runBrandWorkflow(h.host)).reason, 'capacity-held');
  const controller = new AbortController(); controller.abort();
  assert.equal((await runBrandWorkflow(h.host, 1, controller.signal)).reason, 'cancelled');
  assert.equal(h.calls(), 0);
});

test('journal conflict prevents an effect; unknown effect is not blindly retried', async () => {
  const conflict = memoryHost(); conflict.host.save = async () => { throw new Error('other writer'); };
  assert.equal((await runBrandWorkflow(conflict.host)).reason, 'journal-conflict');
  assert.equal(conflict.calls(), 0);
  const uncertain = memoryHost(); let effects = 0;
  uncertain.host.execute = async () => { effects++; throw new Error('lost response'); };
  assert.equal((await runBrandWorkflow(uncertain.host)).reason, 'reconciliation-required');
  assert.equal((await runBrandWorkflow(uncertain.host)).reason, 'reconciliation-required');
  assert.equal(effects, 1);
});

test('feedback changes during admission stop execution', async () => {
  const h = memoryHost(); h.host.admit = async () => { h.changeIntent(); return true; };
  assert.equal((await runBrandWorkflow(h.host)).reason, 'intent-changed');
  assert.equal(h.calls(), 0);
});

test('a host-owned object mutated during admission cannot replace the admitted baseline', async () => {
  const h = memoryHost(); const shared = contract();
  h.host.readContract = async () => shared;
  h.host.admit = async () => { shared.intent.revision = 'new'; return true; };
  assert.equal((await runBrandWorkflow(h.host)).reason, 'intent-changed');
  assert.equal(h.calls(), 0);
});

test('feedback changes during execution are retained but do not certify the old outcome', async () => {
  const h = memoryHost(); h.host.execute = async (stage) => { h.changeIntent(); return receipt(stage); };
  assert.equal((await runBrandWorkflow(h.host)).reason, 'intent-changed');
  assert.equal(h.saved().receipts.length, 1);
});

test('artifact changes during capacity admission stop dispatch', async () => {
  const h = memoryHost(); let changed = false;
  h.host.artifactDigest = async () => changed ? brandDigest('external edit') : artifact;
  h.host.admit = async () => { changed = true; return true; };
  assert.equal((await runBrandWorkflow(h.host)).reason, 'artifact-drift');
  assert.equal(h.calls(), 0);
});

test('real file host saves, refines, checks and reopens across independent runner calls', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sis-brand-workflow-'));
  try {
    const file = join(dir, 'draft.txt'); const log = join(dir, 'journal.json'); const c = contract();
    await writeFile(file, 'first draft'); await writeFile(log, JSON.stringify(journal(c)));
    const executed: BrandStage[] = [];
    const currentDigest = async () => brandDigest(await readFile(file, 'utf8'));
    const host: BrandWorkflowHost = {
      readContract: async () => c, artifactDigest: currentDigest,
      load: async () => JSON.parse(await readFile(log, 'utf8')),
      // Single-writer fixture. Production hosts must use atomic CAS, not read-then-write.
      save: async (next, expected) => {
        assert.equal(brandDigest(JSON.parse(await readFile(log, 'utf8'))), expected);
        await writeFile(log, JSON.stringify(next));
      },
      admit: async () => true, authenticate: async () => true,
      execute: async (stage, baseline, operationId) => {
        assert.match(operationId, /^[a-f0-9]{64}$/); executed.push(stage);
        if (stage === 'build') await writeFile(file, 'saved draft');
        if (stage === 'refine') await writeFile(file, 'saved and reviewed draft');
        if (stage === 'check' || stage === 'verify') assert.equal(await readFile(file, 'utf8'), 'saved and reviewed draft');
        return receipt(stage, baseline, await currentDigest());
      },
    };
    assert.equal((await runBrandWorkflow(host, 4)).next, 'refine');
    assert.equal((await runBrandWorkflow(host, 3)).status, 'complete');
    assert.deepEqual(executed, [...BRAND_STAGES]);
    await writeFile(file, 'changed after verification');
    assert.equal((await runBrandWorkflow(host)).reason, 'artifact-drift');
  } finally {
    assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
    assert.ok(basename(dir).startsWith('sis-brand-workflow-'));
    await rm(dir, { recursive: true, force: true });
  }
});

test('CLI distinguishes structural completion from authentication and rejects changed intent', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sis-brand-workflow-'));
  try {
    const c = contract(); const input = join(dir, 'contract.json'); const log = join(dir, 'journal.json');
    await writeFile(input, JSON.stringify(c)); await writeFile(log, JSON.stringify(complete(c)));
    const run = (...args: string[]) => spawnSync(process.execPath,
      [...process.execArgv, 'scripts/brand-workflow.ts', ...args], { encoding: 'utf8' });
    const plan = run('plan', input);
    assert.equal(plan.status, 0, plan.stderr);
    assert.equal(JSON.parse(plan.stdout).status, 'planned');
    const result = run('inspect', input, log, artifact);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).status, 'structurally-complete');
    assert.equal(JSON.parse(result.stdout).authentication, 'not-checked');
    c.intent.revision = 'new-feedback'; await writeFile(input, JSON.stringify(c));
    const changed = run('inspect', input, log, artifact);
    assert.equal(changed.status, 2);
    assert.equal(JSON.parse(changed.stdout).reason, 'intent-changed');
  } finally {
    assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
    assert.ok(basename(dir).startsWith('sis-brand-workflow-'));
    await rm(dir, { recursive: true, force: true });
  }
});
