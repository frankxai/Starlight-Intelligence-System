import assert from 'node:assert/strict';
import test from 'node:test';
import { runTask } from '../src/run.ts';

const task = { id: 'gh:o.r.7.abc.fix-ci', title: 'Make CI green', doneCondition: 'Checks pass on https://github.com/o/r/pull/7', repo: 'r', paths: ['src'], kind: 'fix', attempt: 1, maxMinutes: 5 };

function harness({ states, pushed = 'f'.repeat(40), heartbeatFails = false, prOpen = true, plan } = {}) {
  const log = [];
  const names = [];
  const step = {
    async do(name, fn) { names.push(name); return fn(); },
    async sleep(name) { names.push(name); },
  };
  let i = 0;
  const sandbox = {
    clone: async (...a) => { log.push(['clone', ...a]); },
    startTask: async () => 'started',
    readTask: async () => states[Math.min(i++, states.length - 1)],
    commitAndPush: async (branch) => { log.push(['push', branch]); return pushed; },
    destroy: async () => { log.push(['destroy']); },
  };
  const gh = {
    prState: async () => ({ branch: 'agent/claude/x', headSha: 'h'.repeat(40), open: prOpen }),
    defaultBranch: async () => 'main',
    openDraftPullRequest: async (o, r, head, base) => { log.push(['pr', head, base]); return 'https://github.com/o/r/pull/99'; },
    comment: async (o, r, n, body) => { log.push(['comment', n, body]); return 'https://github.com/o/r/pull/7#issuecomment-1'; },
  };
  const queue = {
    heartbeat: async () => { if (heartbeatFails) throw new Error('409'); },
    complete: async (id, fence, ref) => { log.push(['complete', ref]); },
    release: async (id, fence, reason) => { log.push(['release', reason]); },
  };
  const params = { task, fence: 'f1', harness: 'claude', codexBot: 'codex[bot]', plan: plan ?? { owner: 'o', repo: 'r', mode: 'pr-branch', prNumber: 7 } };
  return { log, names, run: () => runTask(params, step, sandbox, gh, queue) };
}

test('a fix on a PR branch pushes to that branch and completes with the commit', async () => {
  const h = harness({ states: [{ state: 'running' }, { state: 'succeeded', result: 'fixed' }] });
  assert.deepEqual(await h.run(), { done: `https://github.com/o/r/commit/${'f'.repeat(40)}` });
  assert.deepEqual(h.log.find((l) => l[0] === 'clone'), ['clone', 'o', 'r', 'agent/claude/x', null]);
  assert.deepEqual(h.log.find((l) => l[0] === 'push'), ['push', 'agent/claude/x']);
  assert.equal(new Set(h.names).size, h.names.length, 'step names must be unique for a Workflow');
});

test('new work gets its own agent branch and a draft PR', async () => {
  const h = harness({ states: [{ state: 'succeeded', result: 'built' }], plan: { owner: 'o', repo: 'r', mode: 'new-branch', prNumber: null } });
  assert.deepEqual(await h.run(), { done: 'https://github.com/o/r/pull/99' });
  assert.deepEqual(h.log.find((l) => l[0] === 'pr'), ['pr', 'agent/cf-claude/gh-o.r.7.abc.fix-ci', 'main']);
});

test('a review posts the verdict as a comment and pushes nothing', async () => {
  const h = harness({ states: [{ state: 'succeeded', result: 'VERDICT: PASS' }], plan: { owner: 'o', repo: 'r', mode: 'review', prNumber: 7 } });
  assert.deepEqual(await h.run(), { done: 'https://github.com/o/r/pull/7#issuecomment-1' });
  assert.equal(h.log.some((l) => l[0] === 'push'), false);
  assert.match(h.log.find((l) => l[0] === 'comment')[2], /at h{40}[\s\S]*VERDICT: PASS/);
});

test('failures, timeouts, empty work and closed PRs release the task', async () => {
  assert.match((await harness({ states: [{ state: 'failed', error: 'gateway 401' }] }).run()).released, /agent failed: gateway 401/);
  assert.match((await harness({ states: [{ state: 'running' }] }).run()).released, /no result within 5 minutes/);
  assert.equal((await harness({ states: [{ state: 'succeeded', result: '' }], pushed: null }).run()).released, 'the agent changed nothing');
  assert.match((await harness({ states: [{ state: 'running' }], prOpen: false }).run()).released, /closed/);
});

test('a lost lease stops the sandbox without completing', async () => {
  const h = harness({ states: [{ state: 'running' }], heartbeatFails: true });
  assert.deepEqual(await h.run(), { released: 'lease lost' });
  assert.equal(h.log.some((l) => l[0] === 'complete'), false);
  assert.ok(h.log.some((l) => l[0] === 'destroy'));
});
