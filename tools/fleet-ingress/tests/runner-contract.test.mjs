import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildCloudRunExecutionPayload } from '../src/index.ts';
import { sha } from './fixtures.mjs';
const script = fileURLToPath(new URL('../../runner/runner-entrypoint.sh', import.meta.url));

function runFixture(t, { env = {}, args = [], head = sha, lock = 'package-lock.json', installExit = 0 } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'fleet-runner-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, 'bin'); mkdirSync(bin);
  const log = join(root, 'calls.jsonl');
  // Network and package manager operations are test doubles, not real installs.
  for (const name of ['git', 'npm', 'pnpm']) {
    const stub = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({name:${JSON.stringify(name)},args,environmentKeys:Object.keys(process.env)})+'\\n');
if (${JSON.stringify(name)} === 'git') {
  if (args.includes('init')) { const d=args.at(-1); fs.mkdirSync(d+'/.git',{recursive:true}); ${lock ? `fs.writeFileSync(d+${JSON.stringify('/' + lock)},'{}');` : ''} }
  if (args.includes('rev-parse')) process.stdout.write(${JSON.stringify(head)}+'\\n');
} else if (args.includes('ci') || args.includes('install')) process.exit(${installExit});
`;
    writeFileSync(join(bin, name), stub, { mode: 0o755 });
  }
  const result = spawnSync('bash', [script, ...args], { encoding: 'utf8', timeout: 10000,
    env: { ...process.env, PATH: bin + ':' + process.env.PATH, TMPDIR: root,
      STARLIGHT_REPO: 'fixture/example', STARLIGHT_COMMIT_SHA: sha, STARLIGHT_TIMEOUT_SECONDS: '30',
      GITHUB_TOKEN: 'synthetic-checkout-token', GH_TOKEN: 'synthetic-gh-token',
      GCP_SERVICE_ACCOUNT_TOKEN: 'synthetic-provider-token', MODEL_API_KEY: 'synthetic-model-token',
      ...env } });
  const calls = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(s => JSON.parse(s)) : [];
  return { ...result, calls };
}
test('ingress source variable names match the runner contract', () => {
  const p = buildCloudRunExecutionPayload({ repo: 'fixture/example', sha, sender: 'fixture', event: 'push' });
  const e = Object.fromEntries(p.overrides.containerOverrides[0].env.map(x => [x.name, x.value]));
  assert.equal(e.STARLIGHT_REPO, 'fixture/example'); assert.equal(e.STARLIGHT_COMMIT_SHA, sha);
});
test('runner fetches the exact commit, detaches and verifies HEAD before fixed tests', t => {
  const r = runFixture(t); assert.equal(r.status, 0, r.stderr);
  const fetch = r.calls.find(c => c.name === 'git' && c.args.includes('fetch'));
  assert.equal(fetch.args.at(-1), sha); assert.equal(fetch.args.includes('--branch'), false);
  assert.ok(r.calls.some(c => c.args.includes('--detach')));
  assert.deepEqual(r.calls.filter(c => c.name === 'npm').map(c => c.args), [['ci', '--ignore-scripts', '--include=dev'], ['test', '--ignore-scripts']]);
  assert.match(r.stdout, /"source_verified":true/); assert.match(r.stdout, /"customer_accepted":false/);
});
test('workload child receives no inherited provider or checkout credentials', t => {
  const r = runFixture(t); assert.equal(r.status, 0, r.stderr);
  for (const c of r.calls) {
    for (const k of ['GITHUB_TOKEN', 'GH_TOKEN', 'GCP_SERVICE_ACCOUNT_TOKEN', 'MODEL_API_KEY'])
      assert.equal(c.environmentKeys.includes(k), false, k);
    if (c.name !== 'git') assert.equal(c.environmentKeys.includes('GIT_CONFIG_VALUE_0'), false);
    assert.equal(c.args.some(a => a.includes('synthetic-checkout-token') || a.includes('x-access-token:')), false);
  }
  assert.equal(r.stdout.includes('synthetic-checkout-token'), false);
});
test('mismatched checked-out SHA stops before install or tests', t => {
  const r = runFixture(t, { head: 'b'.repeat(40) }); assert.equal(r.status, 65);
  assert.equal(r.calls.some(c => c.name !== 'git'), false); assert.match(r.stdout, /"source_verified":false/);
});
test('missing lockfile is refused instead of resolving mutable dependencies', t => {
  const r = runFixture(t, { lock: null }); assert.equal(r.status, 66);
  assert.equal(r.calls.some(c => c.name !== 'git'), false);
});
test('install failure has no mutable-install fallback', t => {
  const r = runFixture(t, { installExit: 17 }); assert.equal(r.status, 17);
  assert.equal(r.calls.filter(c => c.name === 'npm').length, 1);
});
test('pnpm profile requires frozen dependencies and disables install scripts', t => {
  const r = runFixture(t, { lock: 'pnpm-lock.yaml' }); assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.calls.filter(c => c.name === 'pnpm').map(c => c.args), [['install', '--frozen-lockfile', '--ignore-scripts'], ['test']]);
});
for (const env of [
  { STARLIGHT_REPO: 'bad;repo/name' }, { STARLIGHT_COMMIT_SHA: '' },
  { STARLIGHT_COMMIT_SHA: 'main' }, { STARLIGHT_TIMEOUT_SECONDS: '901' },
  { STARLIGHT_COMMAND: 'echo unsafe' }, { STARLIGHT_REF: 'main' },
  { STARLIGHT_CALLBACK_URL: 'https://other.invalid' },
]) {
  test(`runner rejects unsupported or unsafe input ${Object.keys(env)[0]}`, t => {
    const r = runFixture(t, { env }); assert.equal(r.status, 64); assert.equal(r.calls.length, 0);
  });
}
test('legacy positional arguments are not an authorization fallback', t => {
  const r = runFixture(t, { args: ['fixture/example', 'main'] });
  assert.equal(r.status, 64); assert.equal(r.calls.length, 0);
});
