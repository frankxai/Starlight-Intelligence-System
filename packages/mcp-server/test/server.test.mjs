import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { createStarlightMcpServer } from '../dist/index.js';
import { createGatewayReader } from '../dist/gateway.js';

const record = { memory_id: 'fact', tenant_id: 'a', workspace_id: 'w', privacy_class: 'public', normalized_fact: 'Contact test@example.org' };

async function connected(options) {
  const server = createStarlightMcpServer(options);
  const client = new Client({ name: 'starlight-test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return { client, server, close: async () => { await client.close(); await server.close(); } };
}

test('official client initializes, lists read-only tools, calls sanitized recall, and denies injected scope', { timeout: 15_000 }, async () => {
  let calls = 0;
  const connection = await connected({ tenantId: 'a', workspaceId: 'w', memory: { recall: async request => {
    assert.equal(request.workspace_id, 'w'); calls++; return [{ record, score: 1 }];
  } } });
  try {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
    assert.deepEqual(connection.client.getServerVersion(), { name: 'starlight-memory', version: pkg.version });
    assert.deepEqual((await connection.client.listTools()).tools.map(tool => tool.name), ['starlight_memory_recall']);
    const result = await connection.client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'Contact?' } });
    assert.ok(JSON.stringify(result).includes('[REDACTED]'));
    assert.ok(!JSON.stringify(result).includes('test@example.org'));
    const before = calls;
    const denied = await connection.client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'Contact?', tenantId: 'b' } });
    assert.equal(denied.isError, true);
    assert.equal(calls, before);
  } finally { await connection.close(); }
});

test('writes and deletion require host grants; stored text is sanitized and errors are redacted', { timeout: 15_000 }, async () => {
  let stored;
  const connection = await connected({ tenantId: 'a', workspaceId: 'w', allowWrite: true, memory: {
    recall: async () => { throw new Error('secret-backend-detail'); }, remember: async entry => { stored = entry; return entry; },
    forget: async () => true,
  } });
  try {
    const names = (await connection.client.listTools()).tools.map(tool => tool.name);
    assert.ok(names.includes('starlight_memory_remember'));
    assert.ok(!names.includes('starlight_memory_forget'));
    await connection.client.callTool({ name: 'starlight_memory_remember', arguments: { id: 'stable', fact: 'Contact test@example.org' } });
    assert.equal(stored.tenant_id, 'a'); assert.equal(stored.workspace_id, 'w');
    assert.equal(stored.normalized_fact, 'Contact [REDACTED]');
    const denied = await connection.client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'Contact?' } });
    assert.equal(denied.isError, true); assert.ok(!JSON.stringify(denied).includes('secret-backend-detail'));
  } finally { await connection.close(); }
});

test('factory rejects malformed host grants and blank workspace before registering tools', async () => {
  let calls = 0;
  const memory = { recall: async () => [], remember: async () => { calls++; return record; }, forget: async () => { calls++; return true; } };
  for (const name of ['allowShareable', 'allowWrite', 'allowDelete']) {
    for (const value of ['false', 'true', 0, 1, null, [], {}]) {
      assert.throws(() => createStarlightMcpServer({ tenantId: 'a', memory, [name]: value }));
    }
  }
  assert.throws(() => createStarlightMcpServer({ tenantId: 'a', workspaceId: ' ', memory, allowWrite: true }));
  const connection = await connected({ tenantId: 'a', memory, allowWrite: false, allowDelete: false });
  try {
    assert.deepEqual((await connection.client.listTools()).tools.map(tool => tool.name), ['starlight_memory_recall']);
    await assert.rejects(connection.client.callTool({ name: 'starlight_memory_remember', arguments: { id: 'x', fact: 'x' } }), /not found/);
    assert.equal(calls, 0);
  } finally { await connection.close(); }
});

test('standalone installed CLI speaks stdio to the official client and reconnects to the same gateway', { timeout: 25_000 }, async () => {
  const http = createServer((request, response) => {
    if (request.headers.authorization !== 'Bearer synthetic-test-token') { response.writeHead(401); response.end('{}'); return; }
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ ok: true, results: [{ score: 1, entry: { id: 'stable', content: 'Contact test@example.org', tags: ['public'] } }] }));
  });
  http.listen(0, '127.0.0.1'); await once(http, 'listening');
  const gateway = `http://127.0.0.1:${http.address().port}`;
  try {
    for (let run = 0; run < 2; run++) {
      const client = new Client({ name: 'stdio-test', version: '1.0.0' });
      const transport = new StdioClientTransport({ command: process.execPath,
        args: [fileURLToPath(new URL('../dist/cli.js', import.meta.url)), '--gateway', gateway, '--tenant', 'a'],
        env: { ...process.env, STARLIGHT_GATEWAY_TOKEN: 'synthetic-test-token' }, stderr: 'pipe' });
      try {
        await client.connect(transport);
        const result = await client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'Contact?' } });
        assert.ok(JSON.stringify(result).includes('[REDACTED]'));
      } finally { await client.close(); }
    }
  } finally { http.closeAllConnections(); await new Promise(resolve => http.close(resolve)); }
});

test('gateway denies cross-tenant reads, credentials in URL and plaintext remote transport', async () => {
  assert.throws(() => createGatewayReader({ url: 'http://remote.example', tenantId: 'a', token: 'synthetic' }));
  assert.throws(() => createGatewayReader({ url: 'https://user:password@remote.example', tenantId: 'a', token: 'synthetic' }));
  const reader = createGatewayReader({ url: 'http://localhost:1', tenantId: 'a', token: 'synthetic' });
  await assert.rejects(reader.recall({ tenant_id: 'b', query: 'denied' }), /Tenant denied/);
});

test('exported gateway rejects unsupported workspace isolation and validates budgets before HTTP', async () => {
  let requests = 0;
  const previous = globalThis.fetch;
  globalThis.fetch = async () => { requests++; return Response.json({ ok: true, results: [] }); };
  try {
    assert.throws(() => createGatewayReader({ url: 'https://gateway.example', tenantId: 'a', workspaceId: 'w', token: 'synthetic' }), /isolation is not supported/);
    const reader = createGatewayReader({ url: 'https://gateway.example', tenantId: 'a', token: 'synthetic' });
    for (const change of [{ workspace_id: 'other' },
      { query: '' }, { query: ' ' }, { query: 'x'.repeat(16_001) }, { limit: 0 }, { limit: 101 }, { limit: 1.5 }]) {
      await assert.rejects(reader.recall({ tenant_id: 'a', query: 'recall', ...change }));
    }
    assert.equal(requests, 0);
    assert.deepEqual(await reader.recall({ tenant_id: 'a', query: 'recall', limit: 5 }), []);
    assert.equal(requests, 1);
    assert.throws(() => createGatewayReader({ url: 'https://gateway.example', tenantId: 'a', workspaceId: ' ', token: 'synthetic' }));
  } finally { globalThis.fetch = previous; }
});

test('gateway excludes malformed expiry and privacy tags even when shareable recall is authorized', { timeout: 15_000 }, async () => {
  const previous = globalThis.fetch;
  const base = { id: 'valid', content: 'reviewed fixture', tags: ['public'] };
  const entries = [base, { ...base, id: 'unclassified', tags: undefined },
    ...[null, 42, true, {}, '', 'not-a-date'].map((expiresAt, i) => ({ ...base, id: 'invalid-expiry-' + i, expiresAt })),
    ...[null, 'private', {}, ['public', 42]].map((tags, i) => ({ ...base, id: 'invalid-tags-' + i, tags })),
    { ...base, id: 'private', tags: ['public', 'private'] },
    { ...base, id: 'expired', expiresAt: '2000-01-01T00:00:00Z' }];
  globalThis.fetch = async () => Response.json({ ok: true, results: entries.map(entry => ({ score: 1, entry })) });
  let connection;
  try {
    const memory = createGatewayReader({ url: 'https://gateway.example', token: 'synthetic', tenantId: 'a' });
    const rows = await memory.recall({ tenant_id: 'a', query: 'query' });
    assert.deepEqual(rows.map(row => row.record.memory_id), ['valid', 'unclassified', 'private', 'expired']);
    assert.equal(rows.find(row => row.record.memory_id === 'expired').record.retention_until, '2000-01-01T00:00:00Z');
    connection = await connected({ memory, tenantId: 'a', allowShareable: true });
    const result = await connection.client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'query' } });
    assert.notEqual(result.isError, true);
    assert.deepEqual(result.structuredContent.memories.map(row => row.id), ['valid', 'unclassified']);
  } finally { if (connection) await connection.close(); globalThis.fetch = previous; }
});

test('sensitive and malformed caller IDs never reach write or delete providers', { timeout: 15_000 }, async () => {
  let writes = 0;
  let deletes = 0;
  const connection = await connected({ tenantId: 'a', allowWrite: true, allowDelete: true, memory: {
    recall: async () => [], remember: async entry => { writes++; return entry; }, forget: async () => { deletes++; return true; },
  } });
  try {
    for (const id of ['person@example.org', 'sk-' + 'a'.repeat(60), 'npm_' + 'a'.repeat(36),
      'github_pat_' + 'a'.repeat(80), 'x'.repeat(129), 'with spaces', '../outside']) {
      for (const name of ['starlight_memory_remember', 'starlight_memory_forget']) {
        const result = await connection.client.callTool({ name, arguments: { id, ...(name.endsWith('remember') ? { fact: 'safe fact' } : {}) } });
        assert.equal(result.isError, true);
      }
    }
    assert.equal(writes, 0); assert.equal(deletes, 0);
    await connection.client.callTool({ name: 'starlight_memory_remember', arguments: { id: '550e8400-e29b-41d4-a716-446655440000', fact: 'safe' } });
    await connection.client.callTool({ name: 'starlight_memory_forget', arguments: { id: 'stable_id-1' } });
    assert.equal(writes, 1); assert.equal(deletes, 1);
  } finally { await connection.close(); }
});


test('gateway privacy tags with surrounding whitespace override public tags before MCP projection', { timeout: 15_000 }, async () => {
  const previous = globalThis.fetch;
  const sensitiveTags = [' private ', '\tprivacy:SECRET\n', '\u00a0regulated\u00a0'];
  globalThis.fetch = async () => Response.json({ ok: true, results: [
    { score: 1, entry: { id: 'public', content: 'public fixture', tags: [' public '] } },
    ...sensitiveTags.map((tag, i) => ({ score: 1, entry: { id: 'restricted-' + i,
      content: 'restricted fixture', tags: ['public', tag] } })),
  ] });
  try {
    const memory = createGatewayReader({ url: 'https://gateway.example', token: 'synthetic', tenantId: 'a' });
    const rows = await memory.recall({ tenant_id: 'a', query: 'query' });
    assert.deepEqual(rows.map(row => row.record.privacy_class), ['public', 'private', 'private', 'private']);
    for (const allowShareable of [false, true]) {
      const connection = await connected({ memory, tenantId: 'a', allowShareable });
      try {
        const result = await connection.client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'query' } });
        assert.notEqual(result.isError, true);
        assert.deepEqual(result.structuredContent.memories.map(row => row.id), ['public']);
        assert.ok(!JSON.stringify(result).includes('restricted fixture'));
      } finally { await connection.close(); }
    }
  } finally { globalThis.fetch = previous; }
});

test('private-shareable overrides public and still requires an explicit host sharing grant', { timeout: 15_000 }, async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ ok: true, results: [
    { score: 1, entry: { id: 'shared', content: 'shareable fixture', tags: ['public', ' privacy:PRIVATE-SHAREABLE '] } },
    { score: 1, entry: { id: 'restricted', content: 'private fixture', tags: ['public', 'private-shareable', 'private'] } },
  ] });
  try {
    const memory = createGatewayReader({ url: 'https://gateway.example', token: 'synthetic', tenantId: 'a' });
    for (const allowShareable of [false, true]) {
      const connection = await connected({ memory, tenantId: 'a', allowShareable });
      try {
        const result = await connection.client.callTool({ name: 'starlight_memory_recall', arguments: { query: 'query' } });
        assert.deepEqual(result.structuredContent.memories.map(row => row.id), allowShareable ? ['shared'] : []);
        assert.ok(!JSON.stringify(result).includes('private fixture'));
      } finally { await connection.close(); }
    }
  } finally { globalThis.fetch = previous; }
});
