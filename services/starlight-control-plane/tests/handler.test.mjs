import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest, sha256Hex } from '../src/handler.ts';
import { execute } from '../src/ops.ts';
import { memorySql } from './helpers.mjs';

const TOKENS = {
  queen: 'queen-token-fixture-0001',
  codex: 'codex-token-fixture-0002',
  frank: 'frank-token-fixture-0003',
};
const IDENTITIES = {
  queen: { agentId: 'queen', harness: 'claude', provider: 'anthropic', roles: ['producer', 'worker'] },
  codex: { agentId: 'codex-1', harness: 'codex', provider: 'openai', roles: ['worker', 'verifier'] },
  frank: { agentId: 'frank', harness: 'human', provider: 'human', roles: ['human'] },
};

async function fixture() {
  const table = {};
  for (const k of Object.keys(TOKENS)) table[await sha256Hex(TOKENS[k])] = IDENTITIES[k];
  const sql = memorySql();
  let clock = 1_800_000_000_000;
  let n = 0;
  const stub = { run: async (op, who, args) => execute(sql, op, who, args, clock++, () => `t${++n}`) };
  const env = { AGENT_TOKENS: JSON.stringify(table) };
  const call = (as, method, path, body) => handleRequest(new Request(`https://cp.example.invalid${path}`, {
    method,
    headers: as ? { authorization: `Bearer ${TOKENS[as] ?? as}` } : {},
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  }), env, stub);
  return { call, env, stub };
}

test('health is public, everything else needs a known token', async () => {
  const { call } = await fixture();
  assert.equal((await call(null, 'GET', '/health')).status, 200);
  assert.equal((await call(null, 'GET', '/v1/status')).status, 401);
  assert.equal((await call('not-a-registered-token-xyz', 'GET', '/v1/status')).status, 401);
  assert.equal((await call('short', 'GET', '/v1/status')).status, 401);
  assert.equal((await call('queen', 'GET', '/v1/status')).status, 200);
});

test('a malformed or missing token table locks everyone out', async () => {
  const { stub } = await fixture();
  for (const env of [{ AGENT_TOKENS: '{nope' }, {}, { AGENT_TOKENS: JSON.stringify({ x: { agentId: 'a' } }) }]) {
    const res = await handleRequest(new Request('https://cp.example.invalid/v1/status', {
      headers: { authorization: `Bearer ${TOKENS.queen}` },
    }), env, stub);
    assert.equal(res.status, 401);
  }
});

test('unknown provider spellings and shared agentIds lock the table', async () => {
  const { stub } = await fixture();
  const hash = await sha256Hex(TOKENS.queen);
  const other = await sha256Hex(TOKENS.codex);
  const tables = [
    { [hash]: { ...IDENTITIES.queen, provider: 'OpenAI' } },
    { [hash]: IDENTITIES.queen, [other]: { ...IDENTITIES.codex, agentId: 'queen' } },
  ];
  for (const t of tables) {
    const res = await handleRequest(new Request('https://cp.example.invalid/v1/status', {
      headers: { authorization: `Bearer ${TOKENS.queen}` },
    }), { AGENT_TOKENS: JSON.stringify(t) }, stub);
    assert.equal(res.status, 401);
  }
});

test('the full loop over HTTP: enqueue, gate, claim, complete, cross-provider verify', async () => {
  const { call } = await fixture();
  let res = await call('queen', 'POST', '/v1/tasks', {
    id: 'stage-price', title: 'Stage price page', doneCondition: 'preview URL', priority: 3,
    repo: 'frankx', paths: ['app/pricing/**'], gates: ['money'],
  });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).state, 'held');
  assert.equal((await call('codex', 'POST', '/v1/tasks/claim', {})).status, 200);
  assert.equal((await call('queen', 'POST', '/v1/tasks/stage-price/approve')).status, 403);
  assert.equal((await call('frank', 'POST', '/v1/tasks/stage-price/approve')).status, 200);

  res = await call('queen', 'POST', '/v1/tasks/claim', { repo: 'frankx' });
  const claimed = await res.json();
  assert.equal(claimed.task.id, 'stage-price');
  const { fence } = claimed;
  assert.equal((await call('queen', 'POST', '/v1/tasks/stage-price/heartbeat')).status, 409);
  assert.equal((await call('queen', 'POST', '/v1/tasks/stage-price/heartbeat', { fence })).status, 200);
  assert.equal((await call('queen', 'POST', '/v1/tasks/stage-price/complete', { fence, resultRef: 'https://github.com/frankxai/x/pull/1' })).status, 200);
  const shown = await (await call('codex', 'GET', '/v1/status')).json();
  assert.ok(!JSON.stringify(shown).includes(fence), 'the fence is never shown to other agents');
  assert.equal((await call('codex', 'POST', '/v1/tasks/stage-price/verify', { verdict: 'pass' })).status, 200);

  res = await call('codex', 'GET', '/v1/tasks/stage-price');
  const t = await res.json();
  assert.equal(t.state, 'done');
  assert.equal(t.approved_by, 'frank');
  assert.equal(t.verifier_agent, 'codex-1');
});

test('the URL id wins over an id smuggled in the body', async () => {
  const { call } = await fixture();
  await call('queen', 'POST', '/v1/tasks', { id: 'a', title: 'a', doneCondition: 'd', priority: 5, repo: 'r', paths: ['x'], gates: ['none'] });
  await call('queen', 'POST', '/v1/tasks', { id: 'b', title: 'b', doneCondition: 'd', priority: 5, repo: 'r', paths: ['y'], gates: ['none'] });
  await call('codex', 'POST', '/v1/tasks/claim', {});
  const res = await call('codex', 'POST', '/v1/tasks/b/complete', { id: 'a', resultRef: 'receipts/r.md' });
  assert.equal(res.status, 409);
  assert.equal((await (await call('codex', 'GET', '/v1/tasks/a')).json()).state, 'leased');
});

test('bad bodies and unknown routes are refused before reaching the queue', async () => {
  const { call } = await fixture();
  assert.equal((await call('queen', 'POST', '/v1/tasks', 'not json')).status, 400);
  assert.equal((await call('queen', 'POST', '/v1/tasks', '[1]')).status, 400);
  assert.equal((await call('queen', 'POST', '/v1/tasks', JSON.stringify({ pad: 'x'.repeat(20_000) }))).status, 413);
  assert.equal((await call('queen', 'POST', '/v1/tasks/a/explode')).status, 404);
  assert.equal((await call('queen', 'DELETE', '/v1/tasks/a')).status, 404);
  assert.equal((await call('queen', 'GET', '/v1/tasks/missing')).status, 404);
});
