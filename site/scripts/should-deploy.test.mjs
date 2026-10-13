import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./should-deploy.sh', import.meta.url));
const shell = process.env.STARLIGHT_TEST_SH || 'sh';
const base = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^VERCEL_/i.test(k)));
const CANON = 'prj_wDNGrb1R1rB5PJOG9cUEICSER887';

function run(vars) {
  const r = spawnSync(shell, [script], { env: { ...base, ...vars }, encoding: 'utf8', timeout: 10_000 });
  assert.ifError(r.error);
  return r.status;
}
const preview = (ref, extra = {}) => run({ VERCEL_ENV: 'preview', VERCEL_PROJECT_ID: CANON, VERCEL_GIT_COMMIT_REF: ref, ...extra });

test('production on main builds', () => {
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' }), 1);
});
test('production CLI deploy without a Git ref builds', () => {
  assert.equal(run({ VERCEL_ENV: 'production' }), 1);
});
test('production on a non-main ref skips', () => {
  assert.equal(run({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'feature/x' }), 0);
});
for (const ref of ['dependabot/npm/next-16', 'agent/codex/x', 'claude/fix', 'codex/y',
  'ccr-123', 'google-jules/task', 'fix-jules-thing']) {
  test(`bot/agent preview skips: ${ref}`, () => {
    assert.equal(preview(ref, { VERCEL_GIT_PULL_REQUEST_ID: '1' }), 0);
  });
  test(`bot/agent preview skips in clones too: ${ref}`, () => {
    assert.equal(preview(ref, { VERCEL_PROJECT_ID: 'prj_clone' }), 0);
  });
}
for (const ref of ['cto/revert-1', 'preview/landing']) {
  test(`opted-in preview builds: ${ref}`, () => {
    assert.equal(preview(ref), 1);
  });
}
test('other previews skip in the canonical project', () => {
  assert.equal(preview('feature/x'), 0);
});
test('other previews build in Deploy-with-Vercel clones', () => {
  assert.equal(preview('feature/customize', { VERCEL_PROJECT_ID: 'prj_clone' }), 1);
});
test('script makes no network calls', () => {
  assert.doesNotMatch(readFileSync(script, 'utf8'), /\b(curl|wget|nc)\b/);
});
test('script documents the redeploy bypass', () => {
  assert.match(readFileSync(script, 'utf8'), /UNCHECK "Use project's Ignore Build Step"/);
});
