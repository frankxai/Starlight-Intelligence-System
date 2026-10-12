import test from 'node:test';
import assert from 'node:assert/strict';
import {
  capacityAllowsDispatch,
  claimDaemonLock,
  classifyChecks,
  decideLand,
  matchPullRequest,
} from '../merge-gate.mjs';

const green = {
  repo: 'frankxai/vibeclubs',
  number: 29,
  state: 'OPEN',
  isDraft: false,
  mergeable: 'MERGEABLE',
  mergeStateStatus: 'CLEAN',
  baseRefName: 'main',
  headRefOid: 'abc123',
  statusCheckRollup: [{ status: 'COMPLETED', conclusion: 'SUCCESS' }],
};

const gates = {
  autoMerge: true,
  owned: true,
  accepted: true,
  defaultBranch: 'main',
  protectedRepos: ['frankxai/frankx.ai-vercel-website'],
};

test('a green owned accepted pull request can land', () => {
  assert.deepEqual(decideLand(green, gates), { decision: 'merge', reason: 'abc123' });
});

test('auto-merge off never lands', () => {
  assert.equal(decideLand(green, { ...gates, autoMerge: false }).reason, 'auto-merge off');
});

test('a session this conductor did not start is not landed', () => {
  assert.equal(decideLand(green, { ...gates, owned: false }).reason, 'session not owned');
});

test('an unaccepted session waits for review', () => {
  assert.equal(decideLand(green, { ...gates, accepted: false }).decision, 'skip');
});

test('a draft is not marked ready and is not merged', () => {
  assert.equal(decideLand({ ...green, isDraft: true }, gates).reason, 'abc123:draft');
});

test('no live checks do not count as green', () => {
  assert.equal(decideLand({ ...green, statusCheckRollup: [] }, gates).reason, 'abc123:no live checks');
  assert.equal(classifyChecks([{ conclusion: 'CANCELLED', status: 'COMPLETED' }]), 'none');
  assert.equal(classifyChecks([{ conclusion: 'SKIPPED' }]), 'none');
});

test('frankx.ai production is protected even when every other gate passes', () => {
  const production = { ...green, repo: 'frankxai/frankx.ai-vercel-website', number: 969 };
  assert.equal(decideLand(production, gates).reason, 'abc123:protected repo');
});

test('a short title prefix does not match a different pull request', () => {
  const prs = [{
    number: 969,
    title: '[Jules Auto-Ship] # Jules Autonomous Execution Card: frankx.ai-vercel-website',
    headRefName: 'agent/jules/other',
    body: 'unrelated',
  }];
  assert.equal(matchPullRequest(prs, '6601719060582331677'), null);
  assert.equal(matchPullRequest(prs, '12'), null);
  assert.equal(matchPullRequest(prs, '6601719060582331677', 'jules-track-abc'), null);
  const hit = matchPullRequest(
    [{ ...prs[0], title: 'Fix dock jules-track-abc' }],
    '6601719060582331677',
    'jules-track-abc',
  );
  assert.equal(hit.number, 969);
});

test('capacity and the process lock fail closed', () => {
  assert.equal(capacityAllowsDispatch(72, 1.1).ok, false);
  assert.equal(capacityAllowsDispatch(72, 6).ok, true);
  assert.equal(capacityAllowsDispatch(Number.NaN, 6).ok, false);
  assert.equal(claimDaemonLock({ existingPid: 26176, existingAlive: true }).take, false);
  assert.equal(claimDaemonLock({ existingPid: 26176, existingAlive: false }).take, true);
  assert.equal(claimDaemonLock({}).take, true);
});
