import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest, sha256Hex } from '../src/handler.ts';
import { execute } from '../src/ops.ts';
import { memorySql } from './helpers.mjs';

const TOKENS = { queen: 'queen-token-fixture-0001', codex: 'codex-token-fixture-0002', frank: 'frank-token-fixture-0003' };
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
  let rpcId = 0;
  const raw = (as, body, headers = {}, method = 'POST') => handleRequest(new Request('https://cp.example.invalid/mcp', {
    method,
    headers: { authorization: `Bearer ${TOKENS[as]}`, 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), env, stub);
  const rpc = async (as, method, params = {}, headers = {}) => {
    const res = await raw(as, { jsonrpc: '2.0', id: ++rpcId, method, params }, headers);
    return { status: res.status, body: await res.json() };
  };
  const tool = async (as, name, args = {}) => (await rpc(as, 'tools/call', { name, arguments: args })).body.result;
  return { raw, rpc, tool };
}

test('legacy clients complete the initialize handshake', async () => {
  const { raw, rpc } = await fixture();
  const init = await rpc('queen', 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } });
  assert.equal(init.status, 200);
  assert.equal(init.body.result.protocolVersion, '2025-06-18');
  assert.deepEqual(init.body.result.capabilities, { tools: {} });
  const unknown = await rpc('queen', 'initialize', { protocolVersion: '2024-01-01' });
  assert.equal(unknown.body.result.protocolVersion, '2025-11-25');
  assert.equal((await raw('queen', { jsonrpc: '2.0', method: 'notifications/initialized' })).status, 202);
  assert.equal((await rpc('queen', 'ping')).status, 200);
});

test('modern clients discover versions and send matching _meta', async () => {
  const { rpc } = await fixture();
  const headers = { 'mcp-protocol-version': '2026-07-28', 'mcp-method': 'server/discover' };
  const meta = { _meta: { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' } };
  const disc = await rpc('queen', 'server/discover', meta, headers);
  assert.deepEqual(disc.body.result.supportedVersions, ['2026-07-28', '2025-11-25', '2025-06-18']);
  assert.equal(disc.body.result.resultType, 'complete');
  assert.equal(disc.body.result._meta['io.modelcontextprotocol/serverInfo'].name, 'starlight-control-plane');

  const mismatch = await rpc('queen', 'tools/list', { _meta: { 'io.modelcontextprotocol/protocolVersion': '2025-11-25' } }, headers);
  assert.equal(mismatch.status, 400);
  const old = await rpc('queen', 'tools/list', {}, { 'mcp-protocol-version': '1900-01-01' });
  assert.equal(old.status, 400);
  assert.equal(old.body.error.code, -32022);
  assert.equal(old.body.error.data.requested, '1900-01-01');
});

test('modern requests must repeat version, method and tool name in matching headers', async () => {
  const { rpc } = await fixture();
  const meta = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' };
  const call = (headers, params) => rpc('queen', 'tools/call', { name: 'queue_status', arguments: {}, _meta: meta, ...params }, headers);
  const good = { 'mcp-protocol-version': '2026-07-28', 'mcp-method': 'tools/call', 'mcp-name': 'queue_status' };
  assert.equal((await call(good)).status, 200);
  for (const bad of [
    { ...good, 'mcp-method': undefined },
    { ...good, 'mcp-method': 'tools/list' },
    { ...good, 'mcp-name': undefined },
    { ...good, 'mcp-name': 'enqueue_task' },
  ]) {
    const headers = Object.fromEntries(Object.entries(bad).filter(([, v]) => v !== undefined));
    const r = await call(headers);
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, -32020);
  }
  const headerOnly = await rpc('queen', 'tools/call', { name: 'queue_status', arguments: {} }, good);
  assert.equal(headerOnly.status, 400);
  const metaOnly = await rpc('queen', 'tools/call', { name: 'queue_status', arguments: {}, _meta: meta }, { 'mcp-method': 'tools/call', 'mcp-name': 'queue_status' });
  assert.equal(metaOnly.status, 400);
});

test('browser origins are refused unless allow-listed', async () => {
  const { raw } = await fixture();
  const ping = { jsonrpc: '2.0', id: 1, method: 'ping' };
  assert.equal((await raw('queen', ping, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await raw('queen', ping)).status, 200);
});

test('tools/list shows each identity only the tools its roles allow', async () => {
  const { rpc } = await fixture();
  const names = async (as) => (await rpc(as, 'tools/list')).body.result.tools.map((t) => t.name).sort();
  assert.deepEqual(await names('frank'), ['approve_task', 'get_task', 'queue_status']);
  assert.deepEqual(await names('codex'), ['claim_task', 'complete_task', 'get_task', 'heartbeat_task', 'queue_status', 'release_task', 'verify_task']);
  assert.ok((await names('queen')).includes('enqueue_task'));
  assert.ok(!(await names('queen')).includes('verify_task'));
});

test('the whole loop runs over MCP tools, with the gates intact', async () => {
  const { tool } = await fixture();
  const queued = await tool('queen', 'enqueue_task', {
    id: 'ship-copy', title: 'Ship copy', doneCondition: 'preview shows copy', priority: 2, repo: 'frankx', paths: ['app/copy/**'], gates: ['publish'],
  });
  assert.equal(queued.structuredContent.state, 'held');
  assert.equal((await tool('codex', 'claim_task')).structuredContent.task, null);

  const denied = await tool('queen', 'approve_task', { id: 'ship-copy' });
  assert.equal(denied.isError, true);
  assert.match(denied.content[0].text, /role human required/);
  await tool('frank', 'approve_task', { id: 'ship-copy' });

  assert.equal((await tool('queen', 'claim_task', { repo: 'frankx' })).structuredContent.task.id, 'ship-copy');
  const noEvidence = await tool('queen', 'complete_task', { id: 'ship-copy', resultRef: '' });
  assert.equal(noEvidence.isError, true);
  await tool('queen', 'complete_task', { id: 'ship-copy', resultRef: 'https://github.com/frankxai/x/pull/1' });
  assert.equal((await tool('codex', 'verify_task', { id: 'ship-copy', verdict: 'pass' })).structuredContent.state, 'done');
  assert.equal((await tool('codex', 'get_task', { id: 'ship-copy' })).structuredContent.verifier_agent, 'codex-1');
});

test('protocol errors are JSON-RPC errors; tool failures are isError results', async () => {
  const { raw, rpc } = await fixture();
  assert.equal((await rpc('queen', 'tools/call', { name: 'drop_tables' })).body.error.code, -32602);
  assert.equal((await rpc('queen', 'tools/call', { name: '__proto__' })).body.error.code, -32602);
  assert.equal((await rpc('queen', 'resources/list')).body.error.code, -32601);
  assert.equal((await raw('queen', { jsonrpc: '1.0', id: 1, method: 'ping' })).status, 400);
  assert.equal((await raw('queen', { jsonrpc: '2.0', id: { x: 1 }, method: 'ping' })).status, 400);
  assert.equal((await raw('queen', [{ jsonrpc: '2.0', id: 1, method: 'ping' }])).status, 400);
  assert.equal((await raw('queen', undefined, {}, 'GET')).status, 405);
});

test('MCP needs the same bearer token as REST', async () => {
  const { raw } = await fixture();
  const res = await handleRequest(new Request('https://cp.example.invalid/mcp', {
    method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  }), { AGENT_TOKENS: '{}' }, { run: async () => assert.fail('queue reached without auth') });
  assert.equal(res.status, 401);
  assert.ok(raw);
});
