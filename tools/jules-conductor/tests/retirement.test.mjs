import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { julesCommandPolicy, SHUTDOWN_AT } from '../retirement.mjs';
import { inventory, prepareHandoff } from '../migration.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(readFileSync(join(root, 'config.json')));
const action = JSON.parse(readFileSync(join(root, 'next-actions.json'))).actions.find(a => a.id === 'gencreator-minor-bumps');
const now = Date.parse('2026-10-30T12:00:00Z');
const admission = {
  issue_url: `https://github.com/${action.repo}/issues/123`, base_sha: 'a'.repeat(40),
  branch: 'agent/claude-code/dependency-repair', expires_at: '2026-10-30T13:00:00Z',
  idempotency_key: 'fixture:gencreator-minor-bumps', max_minutes: 15, max_cost_usd: 0,
  acceptance: ['Dependency update excludes all semver majors.'],
};

test('new sessions and unknown provider commands are denied throughout retirement', () => {
  for (const args of [['new'], ['new', '--repo', action.repo], ['approve', '123'], ['cancel', '123'], ['remote', 'pull', '--session', '123', '--apply'], [], null]) {
    assert.equal(julesCommandPolicy(args, now).allowed, false);
  }
});

test('preservation reads work before cutoff and fail closed at shutdown', () => {
  for (const args of [['get', '123'], ['remote', 'list', '--session'], ['remote', 'pull', '--session', '123']]) {
    assert.equal(julesCommandPolicy(args, SHUTDOWN_AT - 1).allowed, true);
    assert.equal(julesCommandPolicy(args, SHUTDOWN_AT).allowed, false);
    assert.equal(julesCommandPolicy(args, NaN).allowed, false);
  }
});

test('manual entrypoints leave state bytes untouched even with autoDispatch enabled', () => {
  const temp = mkdtempSync(join(tmpdir(), 'jules-retirement-'));
  try {
    const copy = join(temp, 'tools', 'jules-conductor');
    cpSync(root, copy, { recursive: true });
    const c = structuredClone(config); c.automation.autoDispatch = true;
    writeFileSync(join(copy, 'config.json'), JSON.stringify(c));
    const before = inventory(copy);
    for (const args of [['dispatch', action.repo, 'A bounded fixture task'], ['run-ready'], ['arm', action.id]]) {
      const result = spawnSync(process.execPath, [join(copy, 'conductor.mjs'), ...args], { encoding: 'utf8', env: { ...process.env, PATH: '' } });
      assert.equal(result.status, 2, result.stderr);
      assert.match(result.stderr, /dispatch is retired/);
      assert.deepEqual(inventory(copy), before);
    }
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('automatic tick cannot dispatch an armed task or remove it from backlog', () => {
  const temp = mkdtempSync(join(tmpdir(), 'jules-tick-'));
  try {
    const copy = join(temp, 'tools', 'jules-conductor'); cpSync(root, copy, { recursive: true });
    // Capacity must pass so only the retirement boundary prevents dispatch.
    const conductor = join(copy, 'conductor.mjs');
    const source = readFileSync(conductor, 'utf8');
    assert.ok(source.includes('const room = readCapacity();'));
    writeFileSync(conductor, source.replace('const room = readCapacity();', 'const room = { ok: true };'));
    const c = structuredClone(config); c.automation.autoDispatch = true;
    writeFileSync(join(copy, 'config.json'), JSON.stringify(c));
    writeFileSync(join(copy, 'state/ledger.json'), JSON.stringify({ sessions: {}, metrics: {} }));
    const backlog = JSON.stringify({ queue: [{ id: action.id, repo: action.repo, ready: true, description: action.prompt, scopeFiles: action.where }] });
    writeFileSync(join(copy, 'state/backlog.json'), backlog);
    const bin = join(temp, 'bin'); mkdirSync(bin);
    const marker = join(temp, 'called');
    writeFileSync(join(bin, 'jules'), '#!/bin/sh\nprintf called > "' + marker + '"\n', { mode: 0o755 });
    const probe = spawnSync(join(bin, 'jules'), [], { env: { PATH: bin } });
    assert.equal(probe.status, 0);
    assert.equal(existsSync(marker), true);
    rmSync(marker);
    const result = spawnSync(process.execPath, [join(copy, 'conductor.mjs'), 'tick'], { encoding: 'utf8', env: { ...process.env, PATH: bin } });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(marker), false);
    assert.equal(readFileSync(join(copy, 'state/backlog.json'), 'utf8'), backlog);
    assert.match(result.stdout, /DISPATCH HELD/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('inventory is deterministic and retains archive byte digests', () => {
  assert.deepEqual(inventory(), inventory());
  assert.equal(inventory().source_files.length, 5);
  assert.ok(inventory().source_files.find(f => f.path.endsWith('archive.jsonl')).bytes > 0);
  assert.ok(inventory().sessions.every(s => s.current_remote_status === 'unverified'));
});

test('handoff retains task identity and remains held with no raw prompt or execution', () => {
  const result = prepareHandoff(action, admission, config, now);
  assert.deepEqual(result, prepareHandoff(action, admission, config, now));
  assert.equal(result.contract.task_id, action.id);
  assert.equal(result.contract.idempotency_key, admission.idempotency_key);
  assert.equal(result.execution_performed, false);
  assert.equal(result.status, 'held_for_host_admission');
  assert.equal(result.resource_proposal.max_cost_usd, 0);
  assert.equal(JSON.stringify(result).includes(action.prompt), false);
  assert.equal(result.contract.risk_class, 'high');
});

test('path escapes, credentials, protected and unprofiled repositories are rejected', () => {
  for (const path of ['/tmp/code', '../escape', 'C:\\code', 'a//b', 'a/./b', 'src/**', '.git/config', '.env.local', 'key.pem', 'private/export.json', 'memory/_audit/report.md']) {
    assert.throws(() => prepareHandoff({ ...action, where: [path] }, admission, config, now));
  }
  for (const repo of ['frankxai/frankx.ai-vercel-website', 'other/unprofiled']) {
    assert.throws(() => prepareHandoff({ ...action, repo }, admission, config, now));
  }
});

test('malformed admission, stale expiry, unbounded resources and unsafe review policy reject', () => {
  for (const change of [{ max_cost_usd: NaN }, { max_cost_usd: -1 }, { max_minutes: 26 }, { max_minutes: 0 },
    { expires_at: '2026-10-29T13:00:00Z' }, { expires_at: '2026-11-30T13:00:00Z' },
    { expires_at: '2026-10-30T24:00:00Z' }, { expires_at: '2026-10-30T13:00Z' }, { expires_at: '2026-02-30T13:00:00Z' },
    { branch: 'main' }, { base_sha: 'main' }, { issue_url: 'https://github.com/other/repo/issues/1' },
    { acceptance: [] }, { command: 'arbitrary-command' }]) {
    assert.throws(() => prepareHandoff(action, { ...admission, ...change }, config, now));
  }
  const unsafe = structuredClone(config); unsafe.automation.autoMerge = true;
  assert.throws(() => prepareHandoff(action, admission, unsafe, now));
});
