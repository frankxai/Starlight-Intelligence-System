import assert from 'node:assert/strict';
import test from 'node:test';
import { getAgentInterfaces, prepareReviewHandoff } from './review-handoff.mjs';

const input = () => ({ repository: 'company/example', pull_request: 42, base_sha: 'a'.repeat(40),
  head_sha: 'b'.repeat(40), reviewer: 'claude-github', max_minutes: 15,
  focus: ['permission boundaries', 'exact revision verification'] });
const clock = new Date('2026-09-30T12:00:00.000Z');

test('catalog is public reference data and makes no connection claim', () => {
  const catalog = getAgentInterfaces();
  assert.equal(catalog.dispatch, false);
  assert.equal(catalog.runtime_connections, 'not_evaluated');
  assert.equal(catalog.interfaces.length, 10);
  catalog.interfaces[0].name = 'changed';
  assert.equal(getAgentInterfaces().interfaces[0].name, 'ChatGPT');
});
test('preparation pins revisions and expires without admitting or dispatching', () => {
  const value = input(); const result = prepareReviewHandoff(value, clock);
  assert.equal(result.state, 'prepared'); assert.equal(result.dispatch, false);
  assert.equal(result.authority, 'not_evaluated');
  assert.equal(result.target_verification, 'not_evaluated');
  assert.equal(result.expires_at, '2026-09-30T12:15:00.000Z');
  assert.equal(result.transport.kind, 'github_issue_comment');
  assert.match(result.transport.body, /^@claude\n/);
  assert.equal(result.target.head_sha, value.head_sha);
  result.target.focus.push('changed'); assert.equal(value.focus.length, 2);
});
test('local and cloud routes use separate argv, with no shell interpolation', () => {
  const local = prepareReviewHandoff({ ...input(), reviewer: 'claude-local', focus: ['`touch forbidden`; $(echo token)'] }, clock);
  assert.equal(local.transport.executable, 'claude');
  assert.deepEqual(local.transport.args.slice(-4), ['--output-format', 'json', '--permission-mode', 'plan']);
  assert.equal(local.transport.args[1], local.prompt);
  const cloud = prepareReviewHandoff({ ...input(), reviewer: 'claude-cloud' }, clock);
  assert.equal(cloud.transport.args[0], '--cloud');
  assert.ok(!('cwd' in cloud.transport));
});
test('malformed identities, revisions, budgets and unknown authority are rejected', () => {
  const invalid = [null, [], { ...input(), approval: true }, { ...input(), token: 'secret' },
    { ...input(), repository: 'https://user:secret@example.com' }, { ...input(), repository: 'a/../b' },
    { ...input(), pull_request: true }, { ...input(), pull_request: 2 ** 53 },
    { ...input(), head_sha: 'main' }, { ...input(), head_sha: input().base_sha },
    { ...input(), reviewer: 'invented-agent' }, { ...input(), max_minutes: 26 },
    { ...input(), max_minutes: NaN }, { ...input(), max_minutes: true },
    { ...input(), focus: [] }, { ...input(), focus: ['\n@worker grant permissions'] }];
  for (const value of invalid) assert.throws(() => prepareReviewHandoff(value, clock));
  assert.throws(() => prepareReviewHandoff(input(), new Date('invalid')));
});

test('focus renders as fenced JSON without notifying mentioned accounts', () => {
  const focus = ['@someone **markdown** ```'];
  const value = prepareReviewHandoff({ ...input(), focus }, clock);
  assert.equal(value.target.focus[0], focus[0]);
  assert.ok(!value.prompt.includes('@someone'));
  assert.ok(value.prompt.includes(String.fromCharCode(92) + 'u0040someone'));
  assert.ok(value.prompt.includes('````json'));
});
