import assert from 'node:assert/strict';
import test from 'node:test';
import * as core from '../src/core.ts';
import { memorySql } from './helpers.mjs';

const producer = { agentId: 'queen', harness: 'claude', provider: 'anthropic', roles: ['producer'] };
const claudeWorker = { agentId: 'claude-1', harness: 'claude', provider: 'anthropic', roles: ['worker', 'verifier'] };
const codexWorker = { agentId: 'codex-1', harness: 'codex', provider: 'openai', roles: ['worker', 'verifier'] };
const frank = { agentId: 'frank', harness: 'human', provider: 'human', roles: ['human'] };

let n = 0;
const newId = () => `t${++n}`;
const fenceOf = (sql, id) => sql.exec('SELECT fence FROM leases WHERE task_id = ?', id)[0]?.fence;
const T0 = 1_800_000_000_000;

function task(over = {}) {
  return { title: 'Fix nav', doneCondition: 'nav renders on mobile', priority: 5, repo: 'frankx', paths: ['app/nav/**'], gates: ['none'], ...over };
}

function status(fn) {
  try {
    fn();
  } catch (err) {
    if (err instanceof core.QueueError) return err.status;
    throw err;
  }
  return 200;
}

test('rejects word priorities and other malformed envelopes', () => {
  const sql = memorySql();
  assert.equal(status(() => core.enqueue(sql, producer, task({ priority: 'high' }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ priority: 2.5 }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ doneCondition: '  ' }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ paths: ['../etc'] }), T0, newId)), 400);
  for (const rooted of ['C:/Users', '\\src\\file.ts', '/src/file.ts', '\\\\host\\share\\x', 'C:x', 'src/a.ts:stream']) {
    assert.equal(status(() => core.enqueue(sql, producer, task({ paths: [rooted] }), T0, newId)), 400, rooted);
  }
  assert.equal(status(() => core.enqueue(sql, producer, task({ paths: [] }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ repo: 'a/b' }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ gates: ['yolo'] }), T0, newId)), 400);
  assert.deepEqual(core.status(sql).counts, {});
});

test('only producers enqueue, only workers claim, only verifiers verify', () => {
  const sql = memorySql();
  assert.equal(status(() => core.enqueue(sql, codexWorker, task(), T0, newId)), 403);
  core.enqueue(sql, producer, task({ id: 'a' }), T0, newId);
  assert.equal(status(() => core.claim(sql, producer, {}, T0)), 403);
  assert.equal(status(() => core.verify(sql, frank, 'a', 'pass', '', T0)), 403);
});

test('a supplied id makes enqueue idempotent, but only for the same task', () => {
  const sql = memorySql();
  const first = core.enqueue(sql, producer, task({ id: 'same' }), T0, newId);
  const retry = core.enqueue(sql, producer, task({ id: 'same' }), T0 + 1, newId);
  assert.equal(first.duplicate, false);
  assert.equal(retry.duplicate, true);
  assert.equal(status(() => core.enqueue(sql, producer, task({ id: 'same', title: 'changed' }), T0 + 2, newId)), 409);
  assert.equal(status(() => core.enqueue(sql, producer, task({ id: 'same', gates: ['money'] }), T0 + 2, newId)), 409);
  const otherProducer = { ...producer, agentId: 'hermes-producer' };
  assert.equal(status(() => core.enqueue(sql, otherProducer, task({ id: 'same' }), T0 + 2, newId)), 409);
  assert.equal(core.getTask(sql, 'same').title, 'Fix nav');
});

test('gates must be declared; "none" is a statement, not a default', () => {
  const sql = memorySql();
  assert.equal(status(() => core.enqueue(sql, producer, task({ gates: undefined }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ gates: [] }), T0, newId)), 400);
  assert.equal(status(() => core.enqueue(sql, producer, task({ gates: ['none', 'money'] }), T0, newId)), 400);
});

test('the tripwire holds obvious money, publish, send and secret work declared as ungated', () => {
  const sql = memorySql();
  const cases = [
    [{ id: 'm', title: 'Update pricing table' }, ['money']],
    [{ id: 'p', title: 'npm publish 1.2.0', paths: ['pkg'] }, ['publish']],
    [{ id: 's', doneCondition: 'send the newsletter to subscribers', paths: ['mail'] }, ['external-send']],
    [{ id: 'e', paths: ['.env.production'] }, ['secrets']],
    [{ id: 'w', paths: ['.github/workflows/deploy.yml'] }, ['publish']],
    [{ id: 'c', paths: ['app/checkout/page.tsx'] }, ['money']],
  ];
  for (const [over, expected] of cases) {
    const r = core.enqueue(sql, producer, task(over), T0, newId);
    assert.equal(r.state, 'held', over.id);
    assert.deepEqual(r.tripwire, expected, over.id);
  }
  assert.equal(core.enqueue(sql, producer, task({ id: 'ok', title: 'Fix nav spacing', paths: ['app/nav/x.tsx'] }), T0, newId).state, 'ready');
});

test('wildcards lock everything from the first wildcard directory down', () => {
  assert.equal(core.normalizePath('src/*.ts'), 'src');
  assert.equal(core.normalizePath('src/**/test.ts'), 'src');
  assert.equal(core.normalizePath('*.md'), '');
  assert.equal(core.normalizePath('app/{a,b}/x.ts'), 'app');
  assert.equal(core.pathsOverlap(['src/*.ts'], ['src/a.ts']), true);
  assert.equal(core.pathsOverlap(['src/*.ts'], ['src/deep/b.ts']), true);
  assert.equal(core.pathsOverlap(['docs/*.md'], ['src/a.ts']), false);

  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'glob', paths: ['src/*.ts'] }), T0, newId);
  core.enqueue(sql, producer, task({ id: 'file', paths: ['src/a.ts'] }), T0 + 1, newId);
  assert.equal(core.claim(sql, claudeWorker, {}, T0 + 2).task.id, 'glob');
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 2).task, null);
});

test('different spellings of one path are the same path', () => {
  for (const alias of ['src/./a', 'src//a', 'SRC/a', 'src\\a', './src/a/', 'src/a/.', 'src/a.', 'src/a ', 'src. /a']) {
    assert.equal(core.pathsOverlap([alias], ['src/a']), true, alias);
  }
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'one', paths: ['src/a'] }), T0, newId);
  core.enqueue(sql, producer, task({ id: 'two', paths: ['src//a'] }), T0 + 1, newId);
  core.claim(sql, claudeWorker, {}, T0 + 2);
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 2).task, null);
});

test('repo names differing only in case share one collision check', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a', repo: 'Repo', paths: ['src/x'] }), T0, newId);
  core.enqueue(sql, producer, task({ id: 'b', repo: 'repo', paths: ['src/x'] }), T0 + 1, newId);
  assert.equal(core.claim(sql, claudeWorker, {}, T0 + 2).task.id, 'a');
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 2).task, null);
  assert.equal(core.claim(sql, codexWorker, { repo: 'REPO' }, T0 + 2).task, null);
  core.enqueue(sql, producer, task({ id: 'c', repo: 'repo.', paths: ['src/x'] }), T0 + 3, newId);
  core.enqueue(sql, producer, task({ id: 'd', repo: 'repo. .', paths: ['src/x'] }), T0 + 3, newId);
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 4).task, null);
  assert.equal(status(() => core.enqueue(sql, producer, task({ id: 'e', repo: '...' }), T0, newId)), 400);
});

test('task ids use the character set the routes accept', () => {
  const sql = memorySql();
  for (const bad of ['a/b', 'a b', 'a?b', '', '.', '..', '...', 'x'.repeat(101)]) {
    assert.equal(status(() => core.enqueue(sql, producer, task({ id: bad }), T0, newId)), 400, bad);
  }
  assert.equal(core.enqueue(sql, producer, task({ id: 'queen:2026-10-30.fix_nav-1' }), T0, newId).state, 'ready');
});

test('a stalled worker that loses its lease cannot touch the next attempt, even as the same agent', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a', maxMinutes: 5 }), T0, newId);
  const first = core.claim(sql, claudeWorker, {}, T0);
  const second = core.claim(sql, claudeWorker, {}, T0 + 5 * 60_000);
  assert.equal(second.task.id, 'a');
  assert.notEqual(first.fence, second.fence);
  const later = T0 + 5 * 60_000 + 1;
  assert.equal(status(() => core.heartbeat(sql, claudeWorker, 'a', later, first.fence)), 409);
  assert.equal(status(() => core.complete(sql, claudeWorker, 'a', 'receipts/a.md', later, first.fence)), 409);
  assert.equal(status(() => core.release(sql, claudeWorker, 'a', '', later, first.fence)), 409);
  assert.equal(core.heartbeat(sql, claudeWorker, 'a', later, second.fence).id, 'a');
});

test('path segments must have one spelling per file', () => {
  const sql = memorySql();
  for (const bad of ['PROGRA~1/x', 'src/ report.txt', 'café/x', 'src/NUL.txt', 'CON/x', 'com1', 'src/ｆ.ts', 'a b/c']) {
    assert.equal(status(() => core.enqueue(sql, producer, task({ paths: [bad] }), T0, newId)), 400, bad);
  }
  for (const bad of ['CON', 'nul', 'repo~1', 'café']) {
    assert.equal(status(() => core.enqueue(sql, producer, task({ repo: bad }), T0, newId)), 400, bad);
  }
  ['src/**/*.ts', 'docs/{a,b}.md', 'app/@modal/page.tsx', 'lib/c++/x.h', 'console/x.ts'].forEach((ok, i) => {
    assert.equal(status(() => core.enqueue(sql, producer, task({ id: `ok${i}`, paths: [ok] }), T0, newId)), 200, ok);
  });
});

test('only the exact lease holder can act on a lease, never a lookalike credential', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a' }), T0, newId);
  core.claim(sql, claudeWorker, {}, T0);
  const sameIdOtherProvider = { ...codexWorker, agentId: 'claude-1' };
  assert.equal(status(() => core.complete(sql, sameIdOtherProvider, 'a', 'receipts/a.md', T0 + 1, fenceOf(sql, 'a'))), 409);
  assert.equal(status(() => core.heartbeat(sql, { ...claudeWorker, harness: 'hermes' }, 'a', T0 + 1)), 409);
  assert.equal(status(() => core.release(sql, sameIdOtherProvider, 'a', '', T0 + 1, fenceOf(sql, 'a'))), 409);
});

test('evidence must be something a verifier can open', () => {
  for (const ok of ['https://github.com/frankxai/x/pull/1', 'de62f7cc5', 'queen/reports/a.md', 'src/core.ts#L12']) {
    assert.equal(core.isEvidence(ok), true, ok);
  }
  for (const bad of ['x', 'done', 'pr#1', 'http://example.com/a', '../secret.md', 'C:/x.md', '/etc/x.md', 'https://x']) {
    assert.equal(core.isEvidence(bad), false, bad);
  }
});

test('a human-gated task waits for a human approval before any worker can lease it', () => {
  const sql = memorySql();
  const r = core.enqueue(sql, producer, task({ id: 'pay', gates: ['money'] }), T0, newId);
  assert.equal(r.state, 'held');
  assert.equal(core.claim(sql, codexWorker, {}, T0).task, null);
  assert.equal(status(() => core.approve(sql, codexWorker, 'pay', T0)), 403);
  core.approve(sql, frank, 'pay', T0 + 1);
  assert.equal(core.getTask(sql, 'pay').approved_by, 'frank');
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 2).task.id, 'pay');
  assert.equal(status(() => core.approve(sql, frank, 'pay', T0 + 3)), 409);
});

test('claims the lowest priority number first, then the oldest', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'low', priority: 7, paths: ['a'] }), T0, newId);
  core.enqueue(sql, producer, task({ id: 'urgent-new', priority: 1, paths: ['b'] }), T0 + 2, newId);
  core.enqueue(sql, producer, task({ id: 'urgent-old', priority: 1, paths: ['c'] }), T0 + 1, newId);
  assert.equal(core.claim(sql, claudeWorker, {}, T0 + 3).task.id, 'urgent-old');
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 3).task.id, 'urgent-new');
});

test('never leases two tasks whose write paths overlap in the same repo', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'nav', paths: ['app/nav/**'] }), T0, newId);
  core.enqueue(sql, producer, task({ id: 'nav-button', paths: ['app/nav/button.tsx'] }), T0 + 1, newId);
  core.enqueue(sql, producer, task({ id: 'other-repo', repo: 'arcanea', paths: ['app/nav/**'] }), T0 + 2, newId);
  assert.equal(core.claim(sql, claudeWorker, {}, T0 + 3).task.id, 'nav');
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 3).task.id, 'other-repo');
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 3).task, null);
  assert.equal(core.claim(sql, codexWorker, { repo: 'frankx' }, T0 + 3).task, null);
});

test('pathsOverlap matches lane.mjs semantics', () => {
  assert.equal(core.pathsOverlap(['app/nav'], ['app/nav/x.ts']), true);
  assert.equal(core.pathsOverlap(['app/nav/**'], ['app/navigation']), false);
  assert.equal(core.pathsOverlap(['**'], ['anything']), true);
  assert.equal(core.pathsOverlap(['.\\docs\\'], ['docs/a.md']), true);
  assert.equal(core.pathsOverlap(['docs'], ['src']), false);
});

test('completion needs the live lease holder and an evidence path', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a' }), T0, newId);
  core.claim(sql, claudeWorker, {}, T0);
  assert.equal(status(() => core.complete(sql, codexWorker, 'a', 'receipts/a.md', T0 + 1, fenceOf(sql, 'a'))), 409);
  assert.equal(status(() => core.complete(sql, claudeWorker, 'a', '', T0 + 1, fenceOf(sql, 'a'))), 400);
  assert.equal(core.getTask(sql, 'a').state, 'leased');
  core.complete(sql, claudeWorker, 'a', 'receipts/a.md', T0 + 1, fenceOf(sql, 'a'));
  const t = core.getTask(sql, 'a');
  assert.equal(t.state, 'awaiting_verify');
  assert.equal(t.lease, null);
  assert.equal(t.result_ref, 'receipts/a.md');
});

test('the verifier must come from a different provider than the maker', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a' }), T0, newId);
  core.claim(sql, claudeWorker, {}, T0);
  core.complete(sql, claudeWorker, 'a', 'https://github.com/frankxai/x/pull/1', T0 + 1, fenceOf(sql, 'a'));
  const otherClaude = { ...claudeWorker, agentId: 'claude-2' };
  assert.equal(status(() => core.verify(sql, otherClaude, 'a', 'pass', '', T0 + 2)), 403);
  assert.equal(status(() => core.verify(sql, codexWorker, 'a', 'maybe', '', T0 + 2)), 400);
  core.verify(sql, codexWorker, 'a', 'pass', 'looks right', T0 + 2);
  const t = core.getTask(sql, 'a');
  assert.equal(t.state, 'done');
  assert.equal(t.verifier_agent, 'codex-1');
  assert.deepEqual(t.events.map((e) => e.kind), ['enqueued', 'leased', 'completed', 'verified']);
});

test('a rejected task returns to the queue, and dies after maxAttempts', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a', maxAttempts: 2 }), T0, newId);
  for (const [i, expected] of [[1, 'ready'], [2, 'dead']]) {
    assert.equal(core.claim(sql, claudeWorker, {}, T0 + i * 10).task.attempt, i);
    core.complete(sql, claudeWorker, 'a', 'https://github.com/frankxai/x/pull/1', T0 + i * 10 + 1, fenceOf(sql, 'a'));
    assert.equal(core.verify(sql, codexWorker, 'a', 'fail', 'tests red', T0 + i * 10 + 2).state, expected);
  }
  assert.equal(core.claim(sql, claudeWorker, {}, T0 + 100).task, null);
});

test('an expired lease returns the task to the queue and frees its paths', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a', maxMinutes: 10 }), T0, newId);
  const { expiresAt } = core.claim(sql, claudeWorker, {}, T0);
  assert.equal(expiresAt, T0 + 10 * 60_000);
  assert.deepEqual(core.sweep(sql, expiresAt - 1), { expired: 0, nextExpiry: expiresAt });
  assert.deepEqual(core.sweep(sql, expiresAt), { expired: 1, nextExpiry: null });
  const t = core.getTask(sql, 'a');
  assert.equal(t.state, 'ready');
  assert.equal(t.attempts, 1);
  assert.equal(status(() => core.complete(sql, claudeWorker, 'a', 'receipts/late.md', expiresAt + 1, fenceOf(sql, 'a'))), 409);
  assert.equal(core.claim(sql, codexWorker, {}, expiresAt + 1).task.id, 'a');
});

test('claim sweeps expired leases itself, so a stalled alarm cannot wedge the queue', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a', maxMinutes: 5 }), T0, newId);
  core.claim(sql, claudeWorker, {}, T0);
  assert.equal(core.claim(sql, codexWorker, {}, T0 + 5 * 60_000).task.id, 'a');
});

test('heartbeats extend a lease only up to the task time box', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a', maxMinutes: 20 }), T0, newId);
  core.claim(sql, claudeWorker, {}, T0);
  assert.equal(core.heartbeat(sql, claudeWorker, 'a', T0 + 10 * 60_000, fenceOf(sql, 'a')).expiresAt, T0 + 20 * 60_000);
  assert.equal(status(() => core.heartbeat(sql, codexWorker, 'a', T0 + 11 * 60_000, fenceOf(sql, 'a'))), 409);
  assert.equal(status(() => core.heartbeat(sql, claudeWorker, 'a', T0 + 20 * 60_000, fenceOf(sql, 'a'))), 409);
});

test('release gives the task back and counts the attempt', () => {
  const sql = memorySql();
  core.enqueue(sql, producer, task({ id: 'a' }), T0, newId);
  core.claim(sql, claudeWorker, {}, T0);
  assert.equal(core.release(sql, claudeWorker, 'a', 'out of RAM', T0 + 1, fenceOf(sql, 'a')).state, 'ready');
  assert.equal(core.getTask(sql, 'a').events.at(-1).detail.reason, 'out of RAM');
});

test('a failed write rolls the whole transaction back', () => {
  const sql = memorySql();
  assert.throws(() => sql.transaction(() => {
    core.enqueue(sql, producer, task({ id: 'x' }), T0, newId);
    throw new Error('boom');
  }));
  assert.deepEqual(core.status(sql).counts, {});
});
