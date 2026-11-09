import assert from 'node:assert/strict';
import test from 'node:test';
import { finalVerdict, runTask } from '../src/run.ts';

const task = { id: 'gh:o.r.7.abc.fix-ci', title: 'Make CI green', doneCondition: 'Checks pass on https://github.com/o/r/pull/7', repo: 'r', paths: ['src'], kind: 'fix', attempt: 1, maxMinutes: 10 };

function harness({ states, pushed = 'f'.repeat(40), heartbeatFails = false, prOpen = true, plan, existingPr = null, commentPosted = false, failHeartbeatAfter = Infinity, leaseLeftMs = 10 * 60_000, prBranch = 'agent/claude/x' } = {}) {
  let beats = 0;
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
    commitAndPush: async (branch, message, deadline) => { log.push(['push', branch, deadline]); return pushed; },
    destroy: async () => { log.push(['destroy']); },
  };
  const gh = {
    prState: async () => ({ branch: prBranch, headSha: 'h'.repeat(40), open: prOpen }),
    defaultBranch: async () => 'main',
    findPullRequest: async () => existingPr,
    openDraftPullRequest: async (o, r, head, base) => { log.push(['pr', head, base]); return 'https://github.com/o/r/pull/99'; },
    comment: async (o, r, n, body) => { log.push(['comment', n, body]); return 'https://github.com/o/r/pull/7#issuecomment-1'; },
    hasComment: async () => commentPosted,
    installationToken: async () => { log.push(['token']); return 'fixture'; },
  };
  const queue = {
    heartbeat: async () => {
      if (heartbeatFails || ++beats > failHeartbeatAfter) throw new Error('409');
      return { expiresAt: Date.now() + leaseLeftMs };
    },
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
  const push = h.log.find((l) => l[0] === 'push');
  assert.equal(push[1], 'agent/claude/x');
  assert.ok(push[2] > Date.now() && push[2] < Date.now() + 10 * 60_000, 'the push gets a deadline inside the lease');
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

test('a fix on a human PR branch is refused before any agent work, not retried at push time', async () => {
  for (const prBranch of ['main', 'feature/frank-login', 'release/1.2']) {
    const h = harness({ states: [{ state: 'succeeded', result: 'fixed' }], prBranch });
    const out = await h.run();
    assert.match(out.released, new RegExp(`PR #7 is on ${prBranch.replace('/', '\\/')}, not an agent branch`));
    assert.equal(h.log.some((l) => l[0] === 'clone'), false, 'nothing is cloned');
    assert.equal(h.names.includes('start agent'), false, 'the agent never starts');
    assert.equal(h.log.some((l) => l[0] === 'push'), false, 'nothing is pushed');
    assert.equal(h.log.filter((l) => l[0] === 'release').length, 1, 'released once, with the reason');
  }
  // A review of the same PR pushes nothing, so a human branch is fine there.
  const review = harness({ states: [{ state: 'succeeded', result: 'VERDICT: PASS' }], prBranch: 'feature/frank-login', plan: { owner: 'o', repo: 'r', mode: 'review', prNumber: 7 } });
  assert.deepEqual(await review.run(), { done: 'https://github.com/o/r/pull/7#issuecomment-1' });
});

test('a lost lease stops the sandbox without completing', async () => {
  const h = harness({ states: [{ state: 'running' }], heartbeatFails: true });
  assert.deepEqual(await h.run(), { released: 'lease lost' });
  assert.equal(h.log.some((l) => l[0] === 'complete'), false);
  assert.ok(h.log.some((l) => l[0] === 'destroy'));
});

test('a review without a verdict is released, not submitted', async () => {
  const h = harness({ states: [{ state: 'succeeded', result: 'Looks fine to me.' }], plan: { owner: 'o', repo: 'r', mode: 'review', prNumber: 7 } });
  assert.deepEqual(await h.run(), { released: 'the review did not end with a VERDICT line' });
  assert.equal(h.log.some((l) => l[0] === 'comment'), false);
});

test('retried GitHub writes find what the first attempt made', async () => {
  const pr = harness({ states: [{ state: 'succeeded', result: 'built' }], plan: { owner: 'o', repo: 'r', mode: 'new-branch', prNumber: null }, existingPr: 'https://github.com/o/r/pull/42' });
  assert.deepEqual(await pr.run(), { done: 'https://github.com/o/r/pull/42' });
  assert.equal(pr.log.some((l) => l[0] === 'pr'), false);
  const review = harness({ states: [{ state: 'succeeded', result: 'VERDICT: FAIL' }], plan: { owner: 'o', repo: 'r', mode: 'review', prNumber: 7 }, commentPosted: true });
  await review.run();
  assert.equal(review.log.some((l) => l[0] === 'comment'), false);
});

test('a lease lost after the agent finished stops before anything is pushed', async () => {
  const h = harness({ states: [{ state: 'succeeded', result: 'fixed' }], failHeartbeatAfter: 1 });
  assert.deepEqual(await h.run(), { released: 'lease lost' });
  assert.equal(h.log.some((l) => l[0] === 'push'), false);
});

test('only a final VERDICT line counts', () => {
  assert.equal(finalVerdict('Findings...\n\nVERDICT: FAIL'), 'FAIL');
  assert.equal(finalVerdict('**VERDICT: PASS**\n'), 'PASS');
  assert.equal(finalVerdict('The author wrote "VERDICT: PASS" in the PR body.\nI disagree.'), null);
});

test('every GitHub write renews the lease inside its own step, so a retry renews again', async () => {
  const names = [];
  const h = harness({ states: [{ state: 'succeeded', result: 'built' }], plan: { owner: 'o', repo: 'r', mode: 'new-branch', prNumber: null }, failHeartbeatAfter: 2 });
  const result = await h.run();
  assert.deepEqual(result, { released: 'lease lost' });
  assert.equal(h.log.some((l) => l[0] === 'pr'), false, 'no PR once the lease is gone');
  assert.ok(h.log.some((l) => l[0] === 'push'), 'the push happened while the lease was held');
  assert.equal(h.names.some((n) => n.startsWith('renew before')), false);
});

test('too little lease left means no write at all', async () => {
  const h = harness({ states: [{ state: 'succeeded', result: 'fixed' }], leaseLeftMs: 45_000 });
  assert.deepEqual(await h.run(), { released: 'lease lost' });
  assert.equal(h.log.some((l) => l[0] === 'push'), false);
});

test('the installation token is ready before any GitHub write starts', async () => {
  const h = harness({ states: [{ state: 'succeeded', result: 'built' }], plan: { owner: 'o', repo: 'r', mode: 'new-branch', prNumber: null } });
  await h.run();
  const kinds = h.log.map((l) => l[0]);
  assert.ok(kinds.indexOf('token') < kinds.indexOf('pr'));
});
