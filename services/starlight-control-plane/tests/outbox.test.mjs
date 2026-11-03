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
    addLabels: async (...a) => { calls.push(['label', ...a]); },
    prFiles: async () => ['src/a.ts', 'src/b.ts', 'README.md'],
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
  assert.deepEqual(api.calls[0], ['comment', 'frankxai', 'kernel', 1, '@codex review']);
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
