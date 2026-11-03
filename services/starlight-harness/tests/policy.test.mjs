import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPrompt, decide, newBranchName, planFor, pushedRefs } from '../src/policy.ts';
import { harnessConfig, instanceId } from '../src/config.ts';

const CTX = { gatewayAccount: 'acct', gatewayId: 'default', repos: ['frankxai/Kernel'], allowRegistries: true };
const task = (over = {}) => ({
  id: 'gh:frankxai.kernel.7.abc.fix-ci', title: 'Make CI green',
  doneCondition: 'Every check on https://github.com/frankxai/Kernel/pull/7 passes',
  repo: 'kernel', paths: ['src'], kind: 'fix', attempt: 1, maxMinutes: 60, ...over,
});

function pkt(line) {
  return (line.length + 4).toString(16).padStart(4, '0') + line;
}
const push = (...refs) => new TextEncoder().encode(refs.map((r, i) =>
  pkt(`${'a'.repeat(40)} ${r.del ? '0'.repeat(40) : 'b'.repeat(40)} ${r.ref}${i === 0 ? '\0report-status' : ''}\n`)).join('') + '0000PACK....');

test('the gateway is reachable only for this account, and only over HTTPS', () => {
  assert.deepEqual(decide('POST', 'https://gateway.ai.cloudflare.com/v1/acct/default/anthropic/v1/messages', CTX), { allow: true, add: 'ai-gateway' });
  assert.equal(decide('POST', 'https://gateway.ai.cloudflare.com/v1/other/default/anthropic', CTX).allow, false);
  assert.equal(decide('POST', 'http://gateway.ai.cloudflare.com/v1/acct/default/anthropic', CTX).allow, false);
});

test('git reads work for opted-in repos only', () => {
  assert.deepEqual(decide('GET', 'https://github.com/frankxai/kernel.git/info/refs?service=git-upload-pack', CTX), { allow: true, add: 'github' });
  assert.deepEqual(decide('POST', 'https://github.com/frankxai/Kernel/git-upload-pack', CTX), { allow: true, add: 'github' });
  assert.equal(decide('GET', 'https://github.com/someone/else.git/info/refs?service=git-upload-pack', CTX).allow, false);
  assert.equal(decide('GET', 'https://github.com/frankxai/kernel/settings', CTX).allow, false);
});

test('pushes reach agent branches only, never main and never a deletion', () => {
  const url = 'https://github.com/frankxai/kernel.git/git-receive-pack';
  assert.deepEqual(decide('POST', url, CTX, push({ ref: 'refs/heads/agent/cf-claude/x' })), { allow: true, add: 'github' });
  assert.equal(decide('POST', url, CTX, push({ ref: 'refs/heads/main' })).allow, false);
  assert.equal(decide('POST', url, CTX, push({ ref: 'refs/heads/agent/cf-claude/x' }, { ref: 'refs/heads/main' })).allow, false);
  assert.equal(decide('POST', url, CTX, push({ ref: 'refs/heads/agent/old', del: true })).allow, false);
  assert.equal(decide('POST', url, CTX, push({ ref: 'refs/tags/v1' })).allow, false);
  assert.equal(decide('POST', url, CTX, new TextEncoder().encode('garbage')).allow, false);
  assert.equal(decide('POST', url, CTX).allow, false);
});

test('pushedRefs reads the command list and stops at the flush packet', () => {
  assert.deepEqual(pushedRefs(push({ ref: 'refs/heads/codex/a' }, { ref: 'refs/heads/agent/b' })), { refs: ['refs/heads/codex/a', 'refs/heads/agent/b'], deletes: false });
  assert.equal(pushedRefs(new TextEncoder().encode('00ffshort')), null);
});

test('registries allow downloads only, and can be switched off', () => {
  assert.deepEqual(decide('GET', 'https://registry.npmjs.org/zod', CTX), { allow: true, add: 'none' });
  assert.equal(decide('PUT', 'https://registry.npmjs.org/zod', CTX).allow, false);
  assert.equal(decide('GET', 'https://registry.npmjs.org/zod', { ...CTX, allowRegistries: false }).allow, false);
  assert.equal(decide('GET', 'https://example.com/', CTX).allow, false);
});

test('planFor maps the bare queue repo back to its owner and reads the PR', () => {
  assert.deepEqual(planFor(task(), CTX.repos), { owner: 'frankxai', repo: 'Kernel', mode: 'pr-branch', prNumber: 7 });
  assert.equal(planFor(task({ kind: 'build', doneCondition: 'A draft PR links https://github.com/frankxai/Kernel/issues/3' }), CTX.repos).mode, 'new-branch');
  assert.equal(planFor(task({ kind: 'review', doneCondition: 'no PR here' }), CTX.repos), null);
  assert.equal(planFor(task({ repo: 'unknown' }), CTX.repos), null);
  // A PR link to another repository is not this task's PR.
  assert.equal(planFor(task({ doneCondition: 'see https://github.com/x/y/pull/9' }), CTX.repos).prNumber, null);
});

test('prompts carry the done condition and forbid pushing; reviews forbid editing', () => {
  const plan = planFor(task(), CTX.repos);
  const p = buildPrompt(task(), plan, 'agent/claude/x');
  assert.match(p, /Done when: Every check/);
  assert.match(p, /Do not push/);
  const r = buildPrompt(task({ kind: 'review' }), { ...plan, mode: 'review' }, 'agent/claude/x');
  assert.match(r, /Do not change any file/);
  assert.match(r, /VERDICT: PASS/);
});

test('branch names and workflow ids are safe', () => {
  assert.equal(newBranchName('claude', 'gh:frankxai.kernel.issue-3.build'), 'agent/cf-claude/gh-frankxai.kernel.issue-3.build');
  assert.equal(instanceId('gh:a.b.7.abc.fix', 2), 'gh-a-b-7-abc-fix-a2');
});

test('harness config turns off malformed entries', () => {
  assert.deepEqual(harnessConfig('{'), {});
  const cfg = harnessConfig(JSON.stringify({ claude: { agentId: 'cf-claude', max: 2, kinds: ['fix'] }, codex: { agentId: 'cf-codex', max: 99, kinds: [] } }));
  assert.deepEqual(Object.keys(cfg), ['claude']);
});
