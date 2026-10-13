import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./should-deploy.sh', import.meta.url));
const shell = process.env.STARLIGHT_TEST_SH || 'sh';
const base = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^VERCEL_/i.test(k)));

function run(vars) {
  const r = spawnSync(shell, [script], { env: { ...base, ...vars }, encoding: 'utf8', timeout: 10_000 });
  assert.ifError(r.error);
  return r.status;
}

test('production on main builds', () => {
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' }), 1);
});
test('production on a non-main ref skips', () => {
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'feature/x' }), 0);
});
for (const ref of ['dependabot/npm/next-16', 'agent/codex/x', 'claude/fix', 'codex/y',
  'ccr-123', 'google-jules/task', 'fix-jules-thing']) {
  test(`bot/agent preview skips: ${ref}`, () => {
    assert.equal(run({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: ref, VERCEL_GIT_PULL_REQUEST_ID: '1' }), 0);
  });
}
for (const ref of ['cto/revert-1', 'preview/landing']) {
  test(`opted-in preview builds: ${ref}`, () => {
    assert.equal(run({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: ref }), 1);
  });
}
test('other previews skip by default', () => {
  assert.equal(run({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feature/x' }), 0);
});
test('missing env skips', () => {
  assert.equal(run({}), 0);
});
test('script makes no network calls', async () => {
  const { readFileSync } = await import('node:fs');
  assert.doesNotMatch(readFileSync(script, 'utf8'), /\b(curl|wget|nc)\b/);
});
