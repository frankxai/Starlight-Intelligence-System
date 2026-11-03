import assert from 'node:assert/strict';
import test from 'node:test';
import { makerFromBranch, normalize, parseRouting, plan, recurringTasks } from '../src/events.ts';

const ROUTING = {
  repos: ['frankxai/kernel'],
  codexBot: 'chatgpt-codex-connector[bot]',
  selfLogins: ['starlight-control-plane[bot]'],
};
const repository = { full_name: 'frankxai/kernel' };
const pr = (over = {}) => ({
  number: 7, html_url: 'https://github.com/frankxai/kernel/pull/7', state: 'open', draft: false,
  head: { sha: 'a'.repeat(40), ref: 'agent/claude/x' }, ...over,
});

test('makerFromBranch reads the estate branch prefixes', () => {
  assert.deepEqual(makerFromBranch('agent/claude/x'), { harness: 'claude', provider: 'anthropic' });
  assert.deepEqual(makerFromBranch('codex/fix'), { harness: 'codex', provider: 'openai' });
  assert.deepEqual(makerFromBranch('jules-123-thing'), { harness: 'jules', provider: 'google' });
  assert.deepEqual(makerFromBranch('agent/hermes/y'), { harness: 'hermes', provider: null });
  assert.equal(makerFromBranch('feature/human-work'), null);
  assert.equal(makerFromBranch(undefined), null);
});

test('a ready Claude PR asks Codex to review it', () => {
  const s = normalize('pull_request', { action: 'ready_for_review', repository, sender: { login: 'frankxai' }, pull_request: pr() });
  assert.deepEqual(plan(s, ROUTING), [{ type: 'comment', owner: 'frankxai', repo: 'kernel', number: 7, body: '@codex review' }]);
});

test('drafts, closed PRs and human branches trigger nothing', () => {
  assert.equal(normalize('pull_request', { action: 'opened', repository, pull_request: pr({ draft: true }) }), null);
  assert.equal(normalize('pull_request', { action: 'opened', repository, pull_request: pr({ state: 'closed' }) }), null);
  const human = normalize('pull_request', { action: 'opened', repository, sender: { login: 'x' }, pull_request: pr({ head: { sha: 'b', ref: 'feature/y' } }) });
  assert.deepEqual(plan(human, ROUTING), []);
});

test('a Codex PR becomes a review task no OpenAI worker can lease', () => {
  const s = normalize('pull_request', { action: 'opened', repository, sender: { login: 'x' }, pull_request: pr({ head: { sha: 'c'.repeat(40), ref: 'codex/y' } }) });
  const [a] = plan(s, ROUTING);
  assert.equal(a.type, 'enqueue');
  assert.equal(a.task.excludeProvider, 'openai');
  assert.deepEqual(a.task.gates, ['none']);
  assert.match(a.task.id, /^gh:frankxai\.kernel\.7\.cccccccccccc\.review$/);
});

test('repos outside the allow-list and the App itself are ignored', () => {
  const other = normalize('pull_request', { action: 'opened', repository: { full_name: 'x/y' }, sender: { login: 'a' }, pull_request: pr() });
  assert.deepEqual(plan(other, ROUTING), []);
  const self = normalize('pull_request', { action: 'opened', repository, sender: { login: 'starlight-control-plane[bot]' }, pull_request: pr() });
  assert.deepEqual(plan(self, ROUTING), []);
});

test('codexAutoReview repos are not asked twice', () => {
  const s = normalize('pull_request', { action: 'synchronize', repository, sender: { login: 'x' }, pull_request: pr() });
  assert.deepEqual(plan(s, { ...ROUTING, codexAutoReview: ['frankxai/kernel'] }), []);
});

const review = (state, body, commit = 'a'.repeat(40), login = 'chatgpt-codex-connector[bot]') => normalize('pull_request_review', {
  action: 'submitted', repository, sender: { login }, pull_request: pr(), review: { state, body, commit_id: commit },
});

test('Codex findings at the head become a fix task on the PR files', () => {
  const [a] = plan(review('commented', '**P1** Badge: the lease leaks'), ROUTING);
  assert.equal(a.type, 'enqueue_pr');
  assert.match(a.task.id, /fix-review$/);
});

test('a clean Codex review asks for a land evaluation', () => {
  assert.deepEqual(plan(review('commented', "Codex Review: Didn't find any major issues."), ROUTING).map((a) => a.type), ['evaluate_land']);
  assert.deepEqual(plan(review('approved', ''), ROUTING).map((a) => a.type), ['evaluate_land']);
});

test('reviews of an old head, or by anyone but Codex, do nothing', () => {
  assert.deepEqual(plan(review('changes_requested', 'P0', 'f'.repeat(40)), ROUTING), []);
  assert.deepEqual(plan(review('changes_requested', 'P0', 'a'.repeat(40), 'someone'), ROUTING), []);
});

const suite = (conclusion, branch = 'agent/claude/x') => normalize('check_suite', {
  action: 'completed', repository, sender: { login: 'github-actions' },
  check_suite: { conclusion, head_sha: 'a'.repeat(40), head_branch: branch, pull_requests: [{ number: 7 }] },
});

test('red CI becomes a fix task; green asks for a land evaluation', () => {
  assert.equal(plan(suite('failure'), ROUTING)[0].type, 'enqueue_pr');
  assert.equal(plan(suite('success'), ROUTING)[0].type, 'evaluate_land');
  assert.deepEqual(plan(suite('cancelled'), ROUTING), []);
  assert.deepEqual(plan(suite('failure', 'dependabot/npm/x'), ROUTING), []);
});

const labeled = (name) => normalize('issues', {
  action: 'labeled', repository, sender: { login: 'frankxai' }, label: { name },
  issue: { number: 3, state: 'open', html_url: 'https://github.com/frankxai/kernel/issues/3' },
});

test('issue labels dispatch Codex, Jules or the queue, and nothing else', () => {
  const codex = plan(labeled('agent:codex'), ROUTING)[0];
  assert.equal(codex.type, 'comment');
  assert.match(codex.body, /^@codex /);
  assert.deepEqual(plan(labeled('agent:jules'), ROUTING)[0], { type: 'label', owner: 'frankxai', repo: 'kernel', number: 3, labels: ['jules'] });
  const build = plan(labeled('agent:claude'), ROUTING)[0];
  assert.equal(build.type, 'enqueue');
  assert.deepEqual(build.task.paths, ['.']);
  assert.deepEqual(plan(labeled('bug'), ROUTING), []);
});

test('recurring tasks carry the day in their id', () => {
  const tasks = recurringTasks({ ...ROUTING, recurring: [{ name: 'intel', repo: 'kernel', title: 'Read the week', doneCondition: 'A report exists', paths: ['research'], priority: 5 }] }, Date.UTC(2026, 10, 3));
  assert.equal(tasks[0].id, 'cron:intel:2026-11-03');
});

test('parseRouting fails closed on anything malformed', () => {
  assert.equal(parseRouting(undefined), null);
  assert.equal(parseRouting('{'), null);
  assert.equal(parseRouting(JSON.stringify({ ...ROUTING, selfLogins: [] })), null);
  assert.equal(parseRouting(JSON.stringify({ ...ROUTING, repos: ['not a repo'] })), null);
  assert.ok(parseRouting(JSON.stringify(ROUTING)));
});
