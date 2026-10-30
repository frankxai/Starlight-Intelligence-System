import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { mint } from '../scripts/mint-tokens.mjs';
import { smoke } from '../scripts/smoke.mjs';
import { handleRequest } from '../src/handler.ts';
import { execute } from '../src/ops.ts';
import { memorySql } from './helpers.mjs';

const BASE = 'https://cp.example.invalid';
const QUEEN = { agentId: 'queen', harness: 'claude', provider: 'anthropic', roles: ['producer', 'worker'] };
const CODEX = { agentId: 'codex-1', harness: 'codex', provider: 'openai', roles: ['worker', 'verifier'] };

function scratch(identities) {
  const dir = mkdtempSync(join(tmpdir(), 'cp-mint-'));
  const ids = join(dir, 'identities.json');
  writeFileSync(ids, JSON.stringify(identities));
  return { dir, ids, table: join(dir, 'agent-tokens.json'), tokens: join(dir, 'tokens.json') };
}

function worker(table) {
  const sql = memorySql();
  let clock = 1_800_000_000_000;
  const stub = { run: async (op, who, args) => execute(sql, op, who, args, clock++, () => 'id') };
  return (url, init) => handleRequest(new Request(url, init), { AGENT_TOKENS: readFileSync(table, 'utf8') }, stub);
}

test('minted tokens authenticate against the Worker and pass the smoke check', async () => {
  const s = scratch([QUEEN, CODEX]);
  const out = await mint([s.ids, '--table', s.table, '--tokens', s.tokens]);
  assert.deepEqual(out.minted, ['queen', 'codex-1']);
  const tokens = JSON.parse(readFileSync(s.tokens, 'utf8'));
  assert.match(tokens.queen, /^cp_[A-Za-z0-9_-]{43}$/);
  assert.ok(!readFileSync(s.table, 'utf8').includes(tokens.queen), 'the table never holds a raw token');

  const result = await smoke({ CONTROL_PLANE_URL: BASE, CONTROL_PLANE_TOKEN: tokens['codex-1'] }, worker(s.table));
  assert.equal(result.code, 0, result.lines.join('\n'));
  const stranger = await smoke({ CONTROL_PLANE_URL: BASE, CONTROL_PLANE_TOKEN: 'cp_not-a-minted-token-000' }, worker(s.table));
  assert.equal(stranger.code, 1);
  assert.ok(stranger.lines.includes('FAIL status accepts this token'));
});

test('a second run appends to the table and refuses a reused agentId', async () => {
  const s = scratch([QUEEN]);
  await mint([s.ids, '--table', s.table, '--tokens', s.tokens]);
  writeFileSync(s.ids, JSON.stringify([CODEX]));
  const second = await mint([s.ids, '--table', s.table, '--tokens', join(s.dir, 'tokens-2.json')]);
  assert.equal(second.tableEntries, 2);
  writeFileSync(s.ids, JSON.stringify([{ ...CODEX, harness: 'other' }]));
  await assert.rejects(mint([s.ids, '--table', s.table, '--tokens', join(s.dir, 'tokens-3.json')]), /codex-1 appears twice/);
});

test('bad identities, overwrites and tokens inside a git tree are refused', async () => {
  const s = scratch([{ ...QUEEN, provider: 'Anthropic' }]);
  await assert.rejects(mint([s.ids, '--table', s.table, '--tokens', s.tokens]), /invalid identity/);
  writeFileSync(s.tokens, '{}');
  await assert.rejects(mint([s.ids, '--table', s.table, '--tokens', s.tokens]), /refusing to overwrite/);
  const ok = scratch([QUEEN]);
  await assert.rejects(mint([ok.ids, '--table', ok.table, '--tokens', join(process.cwd(), 'leak.json')]), /inside a git work tree/);
  await assert.rejects(mint([ok.ids]), /usage/);
});

test('a table that is not an object of valid entries is refused before any token exists', async () => {
  for (const content of ['[]', JSON.stringify({ nothex: QUEEN }), JSON.stringify({ ['a'.repeat(64)]: { agentId: 'x' } })]) {
    const s = scratch([CODEX]);
    writeFileSync(s.table, content);
    await assert.rejects(mint([s.ids, '--table', s.table, '--tokens', s.tokens]), /must be a JSON object|invalid entry/);
    assert.ok(!existsSync(s.tokens), 'no raw tokens left behind');
    assert.equal(readFileSync(s.table, 'utf8'), content);
  }
  const s = scratch([CODEX]);
  await assert.rejects(mint([s.ids, '--table', join(s.dir, 'missing-dir', 't.json'), '--tokens', s.tokens]));
  assert.ok(!existsSync(s.tokens), 'a failed table write leaves no raw tokens');
});

test('the raw-token file is readable by the current user alone', { skip: process.platform !== 'win32' }, async () => {
  const s = scratch([QUEEN]);
  await mint([s.ids, '--table', s.table, '--tokens', s.tokens]);
  const aces = execFileSync('icacls', [s.tokens], { encoding: 'utf8' }).split(/\r?\n/).filter((l) => l.includes(':('));
  assert.equal(aces.length, 1, aces.join('\n'));
  assert.match(aces[0], new RegExp(userInfo().username, 'i'));
});

test('smoke fails a token that lacks the tools its job needs', async () => {
  const s = scratch([QUEEN, { agentId: 'frank', harness: 'human', provider: 'human', roles: ['human'] }]);
  await mint([s.ids, '--table', s.table, '--tokens', s.tokens]);
  const tokens = JSON.parse(readFileSync(s.tokens, 'utf8'));
  const env = { CONTROL_PLANE_URL: BASE, CONTROL_PLANE_TOKEN: tokens.frank };
  const asWorker = await smoke(env, worker(s.table), ['--expect', 'claim_task']);
  assert.equal(asWorker.code, 1);
  assert.ok(asWorker.lines.includes('FAIL MCP offers claim_task'));
  assert.equal((await smoke(env, worker(s.table), ['--expect', 'approve_task'])).code, 0);
});

test('smoke fails when an unknown token gets in', async () => {
  const s = scratch([QUEEN]);
  await mint([s.ids, '--table', s.table, '--tokens', s.tokens]);
  const real = worker(s.table);
  const leaky = (url, init) => {
    const headers = new Headers(init.headers);
    if (headers.get('authorization')?.includes('smoke-not-a-real-token')) {
      headers.set('authorization', `Bearer ${JSON.parse(readFileSync(s.tokens, 'utf8')).queen}`);
    }
    return real(url, { ...init, headers });
  };
  const r = await smoke({ CONTROL_PLANE_URL: BASE, CONTROL_PLANE_TOKEN: JSON.parse(readFileSync(s.tokens, 'utf8')).queen }, leaky);
  assert.ok(r.lines.includes('FAIL status refuses an unknown token'));
});

test('smoke refuses plain http to a remote host before sending the token', async () => {
  const r = await smoke({ CONTROL_PLANE_URL: 'http://cp.example.invalid', CONTROL_PLANE_TOKEN: 'x'.repeat(20) }, () => assert.fail('fetched'));
  assert.equal(r.code, 2);
});
