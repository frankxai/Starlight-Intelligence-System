import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilePlaybook, parsePlaybook, projectExecution, RECEIPT_SCHEMA } from '../dist/index.js';

const hash = (character = 'a') => character.repeat(64);
const pin = (id, kind) => ({ id, kind, version: '1.0.0', sha256: hash(), uri: `registry:demo/${id}` });
const task = (id, extra = {}) => ({ kind: 'task', id, bindings: { skill: 'draft', outputSchema: 'markdown', tools: [], memory: [] }, limits: { modelCalls: 0, toolCalls: 0 }, ...extra });
const sequence = (...steps) => ({ kind: 'sequence', id: 'workflow', steps });
const base = (flow = sequence(task('first'), task('second'))) => ({ schema: 'starlight.playbook.v1', id: 'launch', version: '1.0.0', title: 'Build a launch draft', resources: [pin('draft', 'skill'), pin('markdown', 'schema')], limits: { maxNodes: 32, maxParallel: 2, modelCalls: 4, toolCalls: 16 }, flow });
const compile = (manifest) => compilePlaybook(JSON.stringify(manifest));
const host = { runId: 'run-1', verifyReceipt: () => true };
const receipt = (plan, id, status, extra = {}) => ({ schema: RECEIPT_SCHEMA, id: `${id}:${status}`, runId: host.runId, planDigest: plan.digest, nodeId: id, status, ...extra });
const complete = (plan, id, extra = {}) => [receipt(plan, id, 'started'), receipt(plan, id, 'completed', { outputDigest: hash(), ...extra })];
const project = (plan, receipts = [], verifier = host) => projectExecution(plan, JSON.stringify(receipts), verifier);
const rejects = (fn, code) => assert.rejects(fn, (error) => error.code === code);

test('compile is deterministic across object key order and resource order, and commits all capability pins', async () => {
  const input = base(); const a = await compile(input);
  const reordered = Object.fromEntries(Object.entries(input).reverse()); reordered.resources.reverse();
  const b = await compile(reordered); assert.equal(a.digest, b.digest);
  input.resources[0].sha256 = hash('b'); const c = await compile(input); assert.notEqual(a.digest, c.digest);
  assert.throws(() => { a.nodes[0].bindings.skill = 'injected'; }, TypeError);
  assert.equal(Object.isFrozen(a.nodes[0].bindings), true);
});

test('sequential progress requires started effects and immutable output evidence', async () => {
  const plan = await compile(base()); assert.deepEqual((await project(plan)).ready, ['first']);
  await rejects(() => project(plan, [receipt(plan, 'first', 'completed', { outputDigest: hash() })]), 'invalid_transition');
  assert.deepEqual((await project(plan, complete(plan, 'first'))).ready, ['second']);
  assert.equal((await project(plan, [...complete(plan, 'first'), ...complete(plan, 'second')])).status, 'completed');
});

test('parallel branches join only after both finish and obey global concurrency', async () => {
  const input = base(sequence({ kind: 'parallel', id: 'research', branches: [task('left'), task('right')] }, task('reduce')));
  input.limits.maxParallel = 1; const plan = await compile(input);
  assert.deepEqual((await project(plan)).ready, ['left']);
  await rejects(() => project(plan, [receipt(plan, 'left', 'started'), receipt(plan, 'right', 'started')]), 'invalid_transition');
  assert.deepEqual((await project(plan, complete(plan, 'left'))).ready, ['right']);
  assert.deepEqual((await project(plan, [...complete(plan, 'left'), ...complete(plan, 'right')])).ready, ['reduce']);
});

test('router receipts select one branch and the join excludes skipped branches', async () => {
  const router = task('choose', { kind: 'router', cases: [{ value: 'web', flow: task('web') }, { value: 'community', flow: task('community') }] });
  const plan = await compile(base(sequence(router, task('publish_draft'))));
  const chosen = complete(plan, 'choose', { route: 'web' });
  const state = await project(plan, chosen); assert.deepEqual(state.ready, ['web']); assert.equal(state.nodes.community.status, 'skipped');
  await rejects(() => project(plan, [...chosen, receipt(plan, 'community', 'started')]), 'invalid_transition');
  await rejects(() => project(plan, complete(plan, 'choose', { route: 'unreviewed' })), 'invalid_evidence');
  await rejects(() => project(plan, complete(plan, 'choose')), 'invalid_evidence');
  assert.deepEqual((await project(plan, [...chosen, ...complete(plan, 'web')])).ready, ['publish_draft']);
});

test('nested router guards suppress all unselected descendants', async () => {
  const inner = task('inner', { kind: 'router', cases: [{ value: 'one', flow: task('one') }, { value: 'two', flow: task('two') }] });
  const outer = task('outer', { kind: 'router', cases: [{ value: 'inside', flow: inner }, { value: 'outside', flow: task('outside') }] });
  const plan = await compile(base(sequence(outer, task('finish'))));
  const state = await project(plan, [...complete(plan, 'outer', { route: 'outside' }), ...complete(plan, 'outside')]);
  assert.deepEqual(state.ready, ['finish']); assert.equal(state.nodes.inner.status, 'skipped'); assert.equal(state.nodes.one.status, 'skipped'); assert.equal(state.nodes['join.inner'].status, 'skipped');
});

test('evaluator binds the produced artifact and failed verdict blocks downstream work', async () => {
  const plan = await compile(base(sequence(task('draft'), task('evaluate', { kind: 'evaluator', subject: 'draft' }), task('ship'))));
  const initial = complete(plan, 'draft');
  await rejects(() => project(plan, [...initial, ...complete(plan, 'evaluate', { verdict: 'pass', subjectDigest: hash('b') })]), 'invalid_evidence');
  const blocked = await project(plan, [...initial, ...complete(plan, 'evaluate', { verdict: 'fail', subjectDigest: hash() })]);
  assert.equal(blocked.status, 'blocked'); assert.deepEqual(blocked.ready, []);
  const passed = await project(plan, [...initial, ...complete(plan, 'evaluate', { verdict: 'pass', subjectDigest: hash() })]); assert.deepEqual(passed.ready, ['ship']);
});

test('approval requires host verification, a bound subject digest and explicit decision', async () => {
  const plan = await compile(base(sequence(task('draft'), { kind: 'approval', id: 'approve', subject: 'draft' }, task('export'))));
  const initial = [...complete(plan, 'draft'), receipt(plan, 'approve', 'started')];
  const approval = { subjectNodeId: 'draft', subjectDigest: hash(), decision: 'approved', attestationRef: 'host:approval-1' };
  const approved = receipt(plan, 'approve', 'completed', { approval });
  await rejects(() => project(plan, [...initial, approved], { ...host, verifyReceipt: (item) => item.nodeId !== 'approve' }), 'unverified_receipt');
  await rejects(() => project(plan, [...initial, receipt(plan, 'approve', 'completed', { outputDigest: hash() })]), 'invalid_evidence');
  await rejects(() => project(plan, [...initial, { ...approved, approval: { ...approval, subjectDigest: hash('b') } }]), 'invalid_evidence');
  assert.deepEqual((await project(plan, [...initial, approved])).ready, ['export']);
  assert.equal((await project(plan, [...initial, { ...approved, approval: { ...approval, decision: 'rejected' } }])).status, 'blocked');
});

test('unknown effects and failed effects are terminal and cannot be rescheduled', async () => {
  const plan = await compile(base());
  for (const status of ['unknown', 'failed']) {
    const journal = [receipt(plan, 'first', 'started'), receipt(plan, 'first', status)];
    const state = await project(plan, journal); assert.equal(state.status, 'blocked'); assert.deepEqual(state.ready, []);
    await rejects(() => project(plan, [...journal, { ...receipt(plan, 'first', 'started'), id: 'retry' }]), 'invalid_transition');
    await rejects(() => project(plan, [...journal, receipt(plan, 'first', 'completed', { outputDigest: hash() })]), 'invalid_transition');
  }
});

test('byte-identical duplicate receipts replay once; conflicting duplicate IDs fail', async () => {
  const plan = await compile(base()); const journal = complete(plan, 'first');
  assert.equal((await project(plan, [...journal, ...journal])).receiptCount, 2);
  await rejects(() => project(plan, [...journal, { ...journal[1], outputDigest: hash('b') }]), 'receipt_conflict');
});

test('scope and provenance checks reject arbitrary caller receipts', async () => {
  const plan = await compile(base()); const journal = complete(plan, 'first');
  await rejects(() => project(plan, journal, { runId: 'other', verifyReceipt: () => true }), 'receipt_scope');
  await rejects(() => project(plan, [{ ...journal[0], planDigest: hash('b') }]), 'receipt_scope');
  await rejects(() => project(plan, journal, { runId: host.runId }), 'verifier_required');
  await rejects(() => project(plan, journal, { ...host, verifyReceipt: () => 'true' }), 'unverified_receipt');
  await rejects(() => project(plan, journal, { ...host, verifyReceipt: () => { throw Error('secret token'); } }), 'unverified_receipt');
  await rejects(() => project(plan, [{ ...journal[0], verified: true }]), 'invalid_shape');
  await rejects(() => project(structuredClone(plan), journal), 'uncompiled_plan');
});

test('host methods and run identity are captured before awaiting verification', async () => {
  const plan = await compile(base());
  let calls = 0; const mutableHost = { runId: host.runId, async verifyReceipt() { calls++; this.runId = 'changed'; this.verifyReceipt = () => false; return true; } };
  const result = await project(plan, complete(plan, 'first'), mutableHost);
  assert.equal(result.runId, host.runId); assert.equal(calls, 2);
});

test('invalid subjects, forward references and cyclic intent cannot compile', async () => {
  await rejects(() => compile(base(sequence(task('check', { kind: 'evaluator', subject: 'later' }), task('later')))), 'invalid_subject');
  await rejects(() => compile(base(sequence(task('draft'), { kind: 'approval', id: 'gate', subject: 'gate' }))), 'invalid_subject');
  const router = task('choose', { kind: 'router', cases: [{ value: 'a', flow: task('a') }, { value: 'b', flow: task('b') }] });
  await rejects(() => compile(base(sequence(router, { kind: 'approval', id: 'gate', subject: 'a' }))), 'conditional_subject');
  assert.throws(() => parsePlaybook({ flow: 'executable-object' }), (error) => error.code === 'input_too_large');
});

test('strict shape, pins, references and bounds fail closed', async () => {
  const cases = [
    [x => { x.resources[0].version = 'latest'; }, 'unpinned_version'],
    [x => { x.resources[0].sha256 = 'main'; }, 'invalid_digest'],
    [x => { x.flow.steps[0].bindings.skill = 'missing'; }, 'missing_resource'],
    [x => { x.flow.steps[0].bindings.skill = 'markdown'; }, 'missing_resource'],
    [x => { x.resources.push(x.resources[0]); }, 'duplicate_id'],
    [x => { x.flow.steps[1].id = 'first'; }, 'duplicate_id'],
    [x => { x.limits.maxNodes = 1; }, 'graph_too_large'],
    [x => { x.limits.maxParallel = 9; }, 'invalid_limit'],
    [x => { x.shell = 'arbitrary shell'; }, 'invalid_shape'],
    [x => { x.flow.steps[0].dependsOn = ['second']; }, 'invalid_shape'],
    [x => { x.flow.steps[0].limits.modelCalls = 1; }, 'invalid_limit'],
    [x => { x.flow.steps[0].id = 'join.workflow'; }, 'invalid_id'],
    [x => { x.resources[0].uri = 'https://user:password@example.com/skill'; }, 'invalid_resource'],
    [x => { x.resources[0].kind = ['skill']; }, 'invalid_resource'],
    [x => { x.flow.steps[0].kind = ['task']; }, 'invalid_pattern'],
  ];
  for (const [mutate, code] of cases) { const input = base(); mutate(input); await rejects(() => compile(input), code); }
  await rejects(() => compilePlaybook(' '.repeat(131073)), 'input_too_large');
  await rejects(() => compilePlaybook('{invalid}'), 'invalid_json');
});

test('receipt enum values are strings, never coerced JSON arrays', async () => {
  const plan = await compile(base());
  await rejects(() => project(plan, [{ ...receipt(plan, 'first', 'started'), status: ['started'] }]), 'invalid_receipt');
});

test('deeply nested flow trees are bounded before compilation', async () => {
  let flow = task('leaf');
  for (let i = 0; i < 18; i++) flow = { kind: 'sequence', id: `level-${i}`, steps: [flow] };
  await rejects(() => compile(base(flow)), 'graph_too_large');
});

test('memory revision and purpose are pinned and purpose changes the plan digest', async () => {
  const input = base(); input.resources.push(pin('context', 'memory'));
  input.flow.steps[0].bindings.memory = [{ resource: 'context', purpose: 'offer-draft' }];
  const first = await compile(input);
  input.flow.steps[0].bindings.memory[0].purpose = 'website-draft';
  assert.notEqual(first.digest, (await compile(input)).digest);
  input.flow.steps[0].bindings.memory[0].content = 'private memory';
  await rejects(() => compile(input), 'invalid_shape');
});

test('compiler applies conservative aggregate call budgets across branches', async () => {
  const input = base({ kind: 'parallel', id: 'branches', branches: [task('a'), task('b')] });
  input.resources.push(pin('reasoner', 'model'));
  for (const node of input.flow.branches) { node.bindings.model = 'reasoner'; node.limits.modelCalls = 2; }
  input.limits.modelCalls = 3; await rejects(() => compile(input), 'budget_exceeded');
  input.limits.modelCalls = 4; assert.equal((await compile(input)).worstCaseCalls.modelCalls, 4);
});

test('portable runtime imports and runs without Node process/Buffer/global', async () => {
  const { spawnSync } = await import('node:child_process');
  const source = `const input=${JSON.stringify(base())}; delete globalThis.process; delete globalThis.Buffer; delete globalThis.global; const api = await import(${JSON.stringify(new URL('../dist/index.js', import.meta.url).href)}); const plan = await api.compilePlaybook(JSON.stringify(input)); const state = await api.projectExecution(plan, '[]', {runId:'portable', verifyReceipt:()=>false}); if(state.ready[0]!=='first') throw Error('bad projection');`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
});

test('pinned founder example creates editable drafts and stops before human approval', async () => {
  const { spawnSync } = await import('node:child_process');
  const { mkdtemp, readFile, rm, readdir } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const target = await mkdtemp(join(tmpdir(), 'starlight-playbooks-'));
  try {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../examples/run.mjs', import.meta.url)), target], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const state = JSON.parse(await readFile(join(target, 'progress.json'), 'utf8'));
    assert.deepEqual(state.ready, ['approve-kit']); assert.equal(state.nodes.export.status, 'pending');
    assert.equal(state.nodes['community-plan'].status, 'skipped');
    assert.equal((await readdir(target)).filter(name => name.endsWith('.md')).length, 7);
    assert.match(await readFile(join(target, 'assemble.md'), 'utf8'), /Founder launch kit/);
    const events = JSON.parse(await readFile(join(target, 'receipts.json'), 'utf8'));
    assert.equal(events.some(event => event.approval), false);
  } finally { await rm(target, { recursive: true, force: true }); }
});

test('example rejects a changed tool before evaluating its top-level code', async () => {
  const { spawnSync } = await import('node:child_process');
  const { mkdtemp, appendFile, cp, rm, access } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
  const target = await mkdtemp(join(tmpdir(), 'starlight-pin-check-'));
  try {
    await cp(new URL('../examples/', import.meta.url), join(target, 'examples'), { recursive: true });
    await cp(new URL('../dist/', import.meta.url), join(target, 'dist'), { recursive: true });
    const marker = join(target, 'should-not-exist');
    await appendFile(join(target, 'examples', 'draft-tool.mjs'), `\nimport {writeFileSync} from 'node:fs'; writeFileSync(${JSON.stringify(marker)}, 'executed');\n`);
    const result = spawnSync(process.execPath, [join(target, 'examples', 'run.mjs'), join(target, 'output')], { encoding: 'utf8' });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Pinned example resource changed/);
    await assert.rejects(() => access(marker), (error) => error.code === 'ENOENT');
  } finally { await rm(target, { recursive: true, force: true }); }
});
