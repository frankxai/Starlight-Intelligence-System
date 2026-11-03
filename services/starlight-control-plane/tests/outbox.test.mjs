import assert from 'node:assert/strict';
import test from 'node:test';
import * as core from '../src/core.ts';
import { drain, ingest, lockPaths, nextDue, outboxStatus } from '../src/outbox.ts';
import { memorySql } from './helpers.mjs';

const ROUTING = { repos: ['frankxai/kernel'], codexBot: 'codex[bot]', selfLogins: ['me[bot]'] };
const NOW = 1_800_000_000_000;
const DELIVERY = '00000000-0000-0000-0000-000000000001';
let n = 0;
const newId = () => `t${++n}`;

function fakeApi(over = {}) {
  const calls = [];
  return {
    calls,
    comment: async (...a) => { calls.push(['comment', ...a]); },
    hasComment: async () => false,
    addLabels: async (...a) => { calls.push(['label', ...a]); },
    prFiles: async () => ({ files: ['src/a.ts', 'src/b.ts', 'README.md'], complete: true }),
    issue: async () => ({ title: 'Add a search box', body: 'Put a search box on the docs page.', open: true }),
    permission: async () => 'write',
    prState: async () => ({ headSha: 'd'.repeat(40), draft: false, open: true, branch: 'agent/claude/x', checksPassed: true, codexPassedHead: true }),
    ...over,
  };
}

const enqueueAction = {
  type: 'enqueue',
  task: { id: 'gh:x.review', title: 'Review it', doneCondition: 'A review is posted', priority: 3, repo: 'kernel', paths: ['.starlight/reviews/pr-1'], gates: ['none'], excludeProvider: 'openai' },
};

test('a redelivered webhook is recognised and does nothing twice', () => {
  const sql = memorySql();
  const first = ingest(sql, DELIVERY, [enqueueAction, { type: 'comment', owner: 'frankxai', repo: 'kernel', number: 1, body: '@codex review' }], NOW, newId);
  assert.equal(first.duplicate, false);
  assert.equal(core.getTask(sql, 'gh:x.review').state, 'ready');
  assert.deepEqual(outboxStatus(sql).counts, { done: 1, pending: 1 });
  const again = ingest(sql, DELIVERY, [enqueueAction], NOW + 1, newId);
  assert.equal(again.duplicate, true);
  assert.deepEqual(outboxStatus(sql).counts, { done: 1, pending: 1 });
});

test('a review task is never leased by the maker family', () => {
  const sql = memorySql();
  ingest(sql, DELIVERY, [enqueueAction], NOW, newId);
  const codex = { agentId: 'codex-1', harness: 'codex', provider: 'openai', roles: ['worker'] };
  const claude = { agentId: 'claude-steward', harness: 'claude', provider: 'anthropic', roles: ['worker'] };
  assert.equal(core.claim(sql, codex, {}, NOW, () => 'f1').task, null);
  assert.equal(core.claim(sql, claude, {}, NOW, () => 'f2').task.excludeProvider, 'openai');
});

test('drain performs remote actions and enqueues PR work on its changed files', async () => {
  const sql = memorySql();
  const api = fakeApi();
  ingest(sql, DELIVERY, [
    { type: 'comment', owner: 'frankxai', repo: 'kernel', number: 1, body: '@codex review' },
    { type: 'enqueue_pr', owner: 'frankxai', repo: 'kernel', number: 1, task: { id: 'gh:x.fix', title: 'Fix it', doneCondition: 'Threads answered', priority: 2, repo: 'kernel', gates: ['none'] } },
  ], NOW, newId);
  assert.deepEqual(await drain(sql, api, ROUTING, NOW, newId), { done: 2, retried: 0, failed: 0 });
  assert.deepEqual(api.calls[0].slice(0, 4), ['comment', 'frankxai', 'kernel', 1]);
  assert.match(api.calls[0][4], /^@codex review\n\n<!-- starlight-cp:00000000-0000-0000-0000-000000000001:\d+ -->$/);
  assert.deepEqual(core.getTask(sql, 'gh:x.fix').paths, ['src/a.ts', 'src/b.ts', 'README.md']);
  assert.equal(nextDue(sql), null);
});

test('a failing call backs off, then gives up after eight attempts', async () => {
  const sql = memorySql();
  const api = fakeApi({ comment: async () => { throw new Error('GitHub POST /x answered 502'); } });
  ingest(sql, DELIVERY, [{ type: 'comment', owner: 'frankxai', repo: 'kernel', number: 1, body: 'x' }], NOW, newId);
  let t = NOW;
  for (let i = 0; i < 7; i++) {
    assert.equal((await drain(sql, api, ROUTING, t, newId)).retried, 1);
    t = nextDue(sql);
  }
  assert.equal((await drain(sql, api, ROUTING, t, newId)).failed, 1);
  assert.equal(outboxStatus(sql).failed[0].error, 'GitHub POST /x answered 502');
});

test('evaluate_land enqueues a land task only when checks and Codex both passed the head', async () => {
  const sql = memorySql();
  const land = { type: 'evaluate_land', owner: 'frankxai', repo: 'kernel', number: 4 };
  ingest(sql, DELIVERY, [land], NOW, newId);
  await drain(sql, fakeApi({ prState: async () => ({ headSha: 'e'.repeat(40), draft: false, open: true, branch: 'agent/claude/x', checksPassed: false, codexPassedHead: true }) }), ROUTING, NOW, newId);
  assert.deepEqual(core.status(sql).counts, {});
  ingest(sql, '00000000-0000-0000-0000-000000000002', [land], NOW, newId);
  await drain(sql, fakeApi(), ROUTING, NOW, newId);
  const task = core.getTask(sql, `gh:frankxai.kernel.4.${'d'.repeat(12)}.land`);
  assert.equal(task.exclude_provider, 'anthropic');
  assert.match(task.done_condition, /pr-gate\.mjs verify --repo frankxai\/kernel --pr 4/);
});

test('lockPaths keeps one spelling per file and degrades to coarser locks', () => {
  assert.deepEqual(lockPaths(['src/a.ts', 'src/a.ts']), ['src/a.ts']);
  assert.deepEqual(lockPaths(['docs/My File.md']), ['docs']);
  assert.deepEqual(lockPaths(['Café.md']), ['.']);
  const many = Array.from({ length: 60 }, (_, i) => `pkg${i % 3}/f${i}.ts`);
  assert.deepEqual(lockPaths(many), ['pkg0', 'pkg1', 'pkg2']);
});

test('a task the queue refuses is recorded, not retried forever', () => {
  const sql = memorySql();
  const bad = { type: 'enqueue', task: { ...enqueueAction.task, id: 'gh:bad', priority: 'high' } };
  const r = ingest(sql, DELIVERY, [bad], NOW, newId);
  assert.match(r.results[0].refused, /priority must be an integer/);
});

test('workers claim only the kinds they ask for', () => {
  const sql = memorySql();
  const producer = core.SYSTEM_PRODUCER;
  core.enqueue(sql, producer, { id: 'land-1', title: 'Land it', doneCondition: 'Merged', priority: 1, repo: 'kernel', paths: ['.starlight/land/pr-1'], gates: ['none'], kind: 'land' }, NOW, newId);
  core.enqueue(sql, producer, { id: 'fix-1', title: 'Fix it', doneCondition: 'Green', priority: 2, repo: 'kernel', paths: ['src'], gates: ['none'], kind: 'fix' }, NOW, newId);
  const sandbox = { agentId: 'cf-claude', harness: 'cloudflare-sandbox', provider: 'anthropic', roles: ['worker'] };
  assert.equal(core.claim(sql, sandbox, { kinds: ['fix', 'review'] }, NOW, () => 'f').task.id, 'fix-1');
  assert.equal(core.claim(sql, sandbox, { kinds: ['fix', 'review'] }, NOW, () => 'g').task, null);
  assert.throws(() => core.enqueue(sql, producer, { title: 'x', doneCondition: 'y', priority: 1, repo: 'kernel', paths: ['a'], gates: ['none'], kind: 'Bad Kind' }, NOW, newId), /kind must be/);
});

test('a comment that already went out before a crash is not posted again', async () => {
  const sql = memorySql();
  const api = fakeApi({ hasComment: async () => true });
  ingest(sql, DELIVERY, [{ type: 'comment', owner: 'frankxai', repo: 'kernel', number: 1, body: '@codex review' }], NOW, newId);
  assert.equal((await drain(sql, api, ROUTING, NOW, newId)).done, 1);
  assert.equal(api.calls.length, 0);
});

test('an incomplete file list locks the whole repository', () => {
  assert.deepEqual(lockPaths(['src/a.ts'], false), ['.']);
});

const dispatch = (label, sender = 'frankxai') => ({ type: 'dispatch_issue', owner: 'frankxai', repo: 'kernel', number: 3, label, sender });

test('issue dispatch needs a sender who can write', async () => {
  const sql = memorySql();
  ingest(sql, DELIVERY, [dispatch('agent:claude', 'drive-by')], NOW, newId);
  await drain(sql, fakeApi({ permission: async () => 'read' }), ROUTING, NOW, newId);
  assert.deepEqual(core.status(sql).counts, {});
});

test('issue dispatch reads the body: sensitive asks become a held gate task, not agent work', async () => {
  const sql = memorySql();
  const api = fakeApi({ issue: async () => ({ title: 'Small fix', body: 'Also change the pricing on the checkout page.', open: true }) });
  ingest(sql, DELIVERY, [dispatch('agent:codex')], NOW, newId);
  await drain(sql, api, ROUTING, NOW, newId);
  assert.equal(api.calls.length, 0, 'Codex is not asked');
  const gate = core.getTask(sql, 'gh:frankxai.kernel.issue-3.gate');
  assert.equal(gate.state, 'held');
  assert.deepEqual(gate.gates, ['money']);
});

test('clean issue dispatch reaches Codex, Jules or the queue', async () => {
  const sql = memorySql();
  const api = fakeApi();
  ingest(sql, DELIVERY, [dispatch('agent:codex'), dispatch('agent:jules'), dispatch('agent:claude')], NOW, newId);
  await drain(sql, api, ROUTING, NOW, newId);
  assert.match(api.calls[0][4], /^@codex Implement/);
  assert.deepEqual(api.calls[1], ['label', 'frankxai', 'kernel', 3, ['jules']]);
  const build = core.getTask(sql, 'gh:frankxai.kernel.issue-3.build');
  assert.match(build.title, /Add a search box/);
  assert.equal(build.kind, 'build');
});

test('tasks created before kind and excludeProvider existed stay idempotent', () => {
  const sql = memorySql();
  const legacy = { id: 'legacy-1', title: 'Old', doneCondition: 'Done', priority: 3, repo: 'kernel', paths: ['src'], gates: ['none'] };
  core.enqueue(sql, core.SYSTEM_PRODUCER, legacy, NOW, newId);
  assert.equal(core.enqueue(sql, core.SYSTEM_PRODUCER, legacy, NOW + 1, newId).duplicate, true);
});
