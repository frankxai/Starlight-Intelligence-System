import test from 'node:test';
import assert from 'node:assert/strict';
import {
  capacityAllowsDispatch,
  claimDaemonLock,
  classifyChecks,
  classifyRisk,
  decideLand,
  julesDraftAction,
  reviewCounts,
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
  authorSeat: 'codex',
  files: [{ path: 'docs/guide.md' }],
  statusCheckRollup: [{ status: 'COMPLETED', conclusion: 'SUCCESS' }],
};

const gates = {
  autoMerge: true,
  owned: true,
  review: { reviewer: 'claude-code', headSha: 'abc123', verdict: 'PASS' },
  defaultBranch: 'main',
  protectedRepos: ['frankxai/frankx.ai-vercel-website'],
};

test('a green low-risk pull request with a separate exact-head PASS can land', () => {
  assert.deepEqual(decideLand(green, gates), { decision: 'merge', reason: 'abc123' });
});

test('auto-merge off never lands', () => {
  assert.equal(decideLand(green, { ...gates, autoMerge: false }).reason, 'auto-merge off');
});

test('a session this conductor did not start is not landed', () => {
  assert.equal(decideLand(green, { ...gates, owned: false }).reason, 'session not owned');
});

test('no PASS means no land', () => {
  assert.equal(decideLand(green, { ...gates, review: undefined }).decision, 'skip');
});

test('a self-review never counts', () => {
  for (const seat of ['codex', 'claude-code', 'antigravity', 'cto']) {
    const pr = { ...green, authorSeat: seat };
    const review = { reviewer: seat, headSha: 'abc123', verdict: 'PASS' };
    assert.match(decideLand(pr, { ...gates, review }).reason, /self-review never counts/);
  }
  assert.equal(reviewCounts({ reviewer: 'Claude Code', headSha: 'x', verdict: 'PASS' }, 'claude_code', 'x').ok, false);
});

test('a PASS on an older head does not count', () => {
  const review = { reviewer: 'cto', headSha: 'old999', verdict: 'PASS' };
  assert.match(decideLand(green, { ...gates, review }).reason, /exact head/);
});

test('only codex, claude-code, antigravity and cto are valid reviewers', () => {
  for (const reviewer of ['jules', 'frankx-eth', 'grok', 'gemini', '']) {
    assert.equal(reviewCounts({ reviewer, headSha: 'abc123', verdict: 'PASS' }, 'codex', 'abc123').ok, false);
  }
  for (const reviewer of ['claude-code', 'antigravity', 'cto']) {
    assert.equal(reviewCounts({ reviewer, headSha: 'abc123', verdict: 'PASS' }, 'codex', 'abc123').ok, true);
  }
  assert.equal(reviewCounts({ reviewer: 'cto', headSha: 'abc123', verdict: 'WARN' }, 'codex', 'abc123').ok, false);
});

test('jules opens drafts only and never lands, even with a PASS', () => {
  const pr = { ...green, authorSeat: 'jules' };
  assert.match(decideLand(pr, gates).reason, /jules opens drafts only/);
});

test('high-risk paths never auto-merge, even with a CTO PASS', () => {
  const cto = { reviewer: 'cto', headSha: 'abc123', verdict: 'PASS' };
  for (const path of ['src/payments/checkout.ts', 'scripts/publish.mjs', 'lib/auth/session.ts',
    'LICENSE', '.env.example', 'tools/merge-review/merge_review_gate.py',
    'tools/jules-conductor/config.json', '.github/workflows/ci.yml', 'src/app/page.tsx', 'docs/AGENTS.md']) {
    const pr = { ...green, files: [{ path }] };
    assert.equal(decideLand(pr, { ...gates, review: cto }).decision, 'skip', path);
  }
});

test('only docs, copy and patch-level dependency bumps are low risk', () => {
  assert.equal(classifyRisk([{ path: 'docs/a.md' }, { path: 'content/blog/post.mdx' }]), 'low');
  assert.equal(classifyRisk([{ path: 'package.json' }, { path: 'package-lock.json' }], { depBump: 'patch' }), 'low');
  assert.equal(classifyRisk([{ path: 'package.json' }], { depBump: 'minor' }), 'high');
  assert.equal(classifyRisk([{ path: 'docs/release-notes.md' }]), 'high');
  assert.equal(classifyRisk([]), 'high');
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

test('a ready Jules pull request is converted back to draft', () => {
  assert.equal(julesDraftAction({ state: 'OPEN', isDraft: false }), 'convert-to-draft');
  assert.equal(julesDraftAction({ isDraft: false }), 'convert-to-draft');
  assert.equal(julesDraftAction({ state: 'OPEN', isDraft: true }), 'none');
  assert.equal(julesDraftAction({ state: 'MERGED', isDraft: false }), 'none');
});
