import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

test('smoke refuses plain http to a remote host before sending the token', async () => {
  const r = await smoke({ CONTROL_PLANE_URL: 'http://cp.example.invalid', CONTROL_PLANE_TOKEN: 'x'.repeat(20) }, () => assert.fail('fetched'));
  assert.equal(r.code, 2);
});
