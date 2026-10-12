import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./should-deploy.sh', import.meta.url));
const bash = process.env.STARLIGHT_TEST_BASH || 'bash';
const environment = Object.fromEntries(Object.entries(process.env)
  .filter(([key]) => !/^(GIT_|VERCEL_)/i.test(key)));
// These disposable fixture repositories contain only test strings, not product commits.
environment.GIT_CONFIG_NOSYSTEM = '1';
environment.GIT_CONFIG_GLOBAL = process.platform === 'win32' ? 'NUL' : '/dev/null';

function decision(changedPath, variables = {}) {
  const prefix = join(tmpdir(), 'starlight-deploy-test-');
  const root = mkdtempSync(prefix);
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, env: environment, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const write = (path, content) => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  try {
    git('init', '--quiet');
    git('config', 'user.name', 'Deployment fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    write('site/scripts/fixture.txt', 'base');
    copyFileSync(script, join(root, 'site/scripts/should-deploy.sh'));
    git('add', '.');
    git('-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture base');
    write(changedPath, 'changed');
    git('add', '.');
    git('-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture change');
    const head = git('rev-parse', 'HEAD');
    const env = { ...environment, ...variables };
    if (variables.sameSha) {
      delete env.sameSha;
      env.VERCEL_GIT_COMMIT_SHA = head;
      env.VERCEL_GIT_PREVIOUS_SHA = head;
    }
    const result = spawnSync(bash, ['scripts/should-deploy.sh'], {
      cwd: join(root, 'site'), env, encoding: 'utf8', timeout: 10_000,
    });
    assert.ifError(result.error);
    return result;
  } finally {
    assert.ok(resolve(root).startsWith(resolve(prefix)));
    rmSync(root, { recursive: true, force: true });
  }
}

for (const path of ['site/fixture.txt', 'metrics/current.json', 'skills/skill-rules.json',
  'public-vault/horizon.jsonl', 'src/cli.ts']) {
  test(`builds when a site build input changes: ${path}`, () => {
    const result = decision(path);
    assert.equal(result.status, 1, result.stdout + result.stderr);
  });
}
test('skips a change unrelated to the site build', () => {
  assert.equal(decision('docs/fixture.md').status, 0);
});
test('production builds even when the last commit only changes unrelated docs', () => {
  assert.equal(decision('docs/fixture.md', { VERCEL_ENV: 'production' }).status, 1);
});
test('an explicit same-commit redeploy builds', () => {
  assert.equal(decision('docs/fixture.md', { sameSha: true }).status, 1);
});
