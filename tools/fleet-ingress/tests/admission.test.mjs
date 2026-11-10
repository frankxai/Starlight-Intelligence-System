import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeSource, parsePolicy } from '../src/admission.ts';
import { environment, policy, payload, signed, mockProvider } from './fixtures.mjs';
import { handleRequest } from '../src/index.ts';

for (const event of ['push', 'pull_request', 'workflow_job']) {
  test(`valid ${event} fixture passes the operator source policy`, () => {
    assert.doesNotThrow(() => authorizeSource(event, payload(event), parsePolicy(JSON.stringify(policy()))));
  });
}
const cases = [
  ['wrong repository ID', 'push', p => { p.repository.id = 999; }],
  ['wrong repository name', 'push', p => { p.repository.full_name = 'fixture/other'; }],
  ['wrong installation', 'push', p => { p.installation.id = 999; }],
  ['missing installation', 'push', p => { delete p.installation; }],
  ['string repository ID', 'push', p => { p.repository.id = '123'; }],
  ['case-variant repository name requires readmission', 'push', p => { p.repository.full_name = 'Fixture/example'; }],
  ['unapproved commit', 'push', p => { p.after = 'b'.repeat(40); }],
  ['short commit', 'push', p => { p.after = 'abc'; }],
  ['branch delete', 'push', p => { p.deleted = true; }],
  ['missing deleted marker', 'push', p => { delete p.deleted; }],
  ['unapproved ref', 'push', p => { p.ref = 'refs/heads/unreviewed'; }],
  ['fork pull request', 'pull_request', p => { p.pull_request.head.repo.id = 999; }],
  ['base repository mismatch', 'pull_request', p => { p.pull_request.base.repo.full_name = 'fixture/other'; }],
  ['draft pull request', 'pull_request', p => { p.pull_request.draft = true; }],
  ['closed pull request', 'pull_request', p => { p.pull_request.state = 'closed'; }],
  ['missing draft marker', 'pull_request', p => { delete p.pull_request.draft; }],
  ['PR number mismatch', 'pull_request', p => { p.number = 8; }],
  ['PR unapproved commit', 'pull_request', p => { p.pull_request.head.sha = 'b'.repeat(40); }],
  ['PR base mismatch', 'pull_request', p => { p.pull_request.base.ref = 'other'; }],
  ['PR head option injection', 'pull_request', p => { p.pull_request.head.ref = '--unsafe'; }],
  ['coerced PR action', 'pull_request', p => { p.action = ['opened']; }],
  ['wrong workflow labels', 'workflow_job', p => { p.workflow_job.labels = ['ubuntu-latest']; }],
  ['missing self-hosted label', 'workflow_job', p => { p.workflow_job.labels = ['starlight-runner']; }],
  ['missing runner label', 'workflow_job', p => { p.workflow_job.labels = ['self-hosted']; }],
  ['completed workflow', 'workflow_job', p => { p.workflow_job.status = 'completed'; }],
  ['unapproved workflow branch', 'workflow_job', p => { p.workflow_job.head_branch = 'other'; }],
  ['invalid workflow ID', 'workflow_job', p => { p.workflow_job.id = 0; }],
  ['workflow unapproved SHA', 'workflow_job', p => { p.workflow_job.head_sha = 'b'.repeat(40); }],
];
for (const [label, event, mutate] of cases) {
  test(`${label} is denied with zero provider calls`, async t => {
    const p = payload(event); mutate(p);
    const { env } = environment(); const provider = mockProvider(t);
    assert.equal((await handleRequest(signed(p, event), env)).status, 403);
    assert.equal(provider.mock.callCount(), 0);
  });
}
for (const [label, mutate] of [
  ['unknown key', p => { p.additional = 'not allowed'; }],
  ['unsafe ID', p => { p.grants[0].repository_id = 1e20; }],
  ['empty commits', p => { p.grants[0].commits = []; }],
  ['zero commit', p => { p.grants[0].commits = ['0'.repeat(40)]; }],
  ['unknown event', p => { p.grants[0].events = ['issue_comment']; }],
  ['coerced event', p => { p.grants[0].events = [['push']]; }],
  ['invalid duration', p => { p.max_duration_seconds = 901; }],
  ['fractional duration', p => { p.max_duration_seconds = 1.5; }],
  ['duplicate grant', p => { p.grants.push(p.grants[0]); }],
  ['duplicate commit', p => { p.grants[0].commits.push(p.grants[0].commits[0]); }],
  ['wildcard ref', p => { p.grants[0].push_refs = ['refs/heads/*']; }],
  ['noncanonical date', p => { p.expires_at = '2027-02-31T00:00:00.000Z'; }],
  ['missing etag', p => { delete p.job_etag; }],
]) {
  test(`malformed policy: ${label}`, () => {
    const p = policy(); mutate(p);
    assert.throws(() => parsePolicy(JSON.stringify(p)), /admission_unavailable/);
  });
}
test('policy is invalid at the expiry boundary', () => {
  const p = policy();
  assert.throws(() => parsePolicy(JSON.stringify(p), Date.parse(p.expires_at)), /admission_expired/);
});
test('mixed event body cannot be relabeled using unsigned event headers', async t => {
  const p = { ...payload(), pull_request: payload('pull_request').pull_request };
  const { env } = environment(); const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(p), env)).status, 400);
  assert.equal(provider.mock.callCount(), 0);
});
test('push body relabeled as workflow_job is rejected', async t => {
  const { env } = environment(); const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(payload(), 'workflow_job'), env)).status, 400);
  assert.equal(provider.mock.callCount(), 0);
});
test('events outside the grant cannot reach a worker', async t => {
  const p = policy(); p.grants[0].events = ['push'];
  const { env } = environment(p); const provider = mockProvider(t);
  assert.equal((await handleRequest(signed(payload('workflow_job'), 'workflow_job'), env)).status, 403);
  assert.equal(provider.mock.callCount(), 0);
});
