import assert from 'node:assert/strict';
import test from 'node:test';
import { run } from '../scripts/cp.mjs';
import { handleRequest, sha256Hex } from '../src/handler.ts';
import { execute } from '../src/ops.ts';
import { memorySql } from './helpers.mjs';

const TOKEN = 'hermes-token-fixture-0004';
const BASE = 'https://cp.example.invalid';

async function fixture() {
  const sql = memorySql();
  execute(sql, 'enqueue', { agentId: 'queen', harness: 'claude', provider: 'anthropic', roles: ['producer'] },
    { id: 'a', title: 'a', doneCondition: 'd', priority: 4, repo: 'r', paths: ['x'], gates: ['none'] }, 1, () => 'unused');
  const env = { AGENT_TOKENS: JSON.stringify({ [await sha256Hex(TOKEN)]: { agentId: 'hermes', harness: 'hermes', provider: 'xai', roles: ['worker'] } }) };
  let clock = 1_800_000_000_000;
  const stub = { run: async (op, who, args) => execute(sql, op, who, args, clock++, () => 'id') };
  const fetchImpl = (url, init) => handleRequest(new Request(url, init), env, stub);
  const cli = (...argv) => run(argv, { CONTROL_PLANE_URL: BASE, CONTROL_PLANE_TOKEN: TOKEN }, fetchImpl);
  return { cli, fetchImpl };
}

test('a shell worker claims, heartbeats and completes through the CLI', async () => {
  const { cli } = await fixture();
  const claimed = await cli('claim', '--repo', 'r');
  assert.equal(claimed.code, 0);
  assert.equal(claimed.out.task.id, 'a');
  assert.equal((await cli('heartbeat', 'a')).code, 0);
  assert.equal((await cli('complete', 'a', 'receipts/a.md')).out.state, 'awaiting_verify');
});

test('refusals exit 1, usage errors exit 2', async () => {
  const { cli } = await fixture();
  assert.equal((await cli('verify', 'a', 'pass')).code, 1);
  assert.equal((await cli('complete', 'a')).code, 2);
  assert.equal((await cli('explode')).code, 2);
});

test('refuses to send the token over plain HTTP to a remote host', async () => {
  const { fetchImpl } = await fixture();
  const leaked = [];
  const spy = (url, init) => {
    leaked.push(String(url));
    return fetchImpl(url, init);
  };
  const r = await run(['status'], { CONTROL_PLANE_URL: 'http://cp.example.invalid', CONTROL_PLANE_TOKEN: TOKEN }, spy);
  assert.equal(r.code, 2);
  assert.deepEqual(leaked, []);
  assert.equal((await run(['status'], {}, spy)).code, 2);
});

test('ids are URL-encoded, so a crafted id cannot reach another route', async () => {
  const { cli } = await fixture();
  const r = await cli('get', '../status');
  assert.equal(r.code, 1);
});
