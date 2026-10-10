import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StarlightGeniusServer } from '../src/mcp-genius.js';

test('Starlight Genius MCP v7 — Consolidated 3-Primitive Architecture', async (t) => {
  const tempDir = mkdtempSync(join(tmpdir(), 'sis-genius-test-'));

  t.after(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // cleanup
    }
  });

  const server = new StarlightGeniusServer(tempDir);

  await t.test('Exposes exactly 3 consolidated high-leverage primitives', () => {
    const tools = server.getTools();
    assert.equal(tools.length, 3, 'Must expose exactly 3 primitives');
    const names = tools.map(t => t.name).sort();
    assert.deepEqual(names, ['starlight_pulse', 'starlight_recall', 'starlight_remember']);

    // Measure schema compact footprint
    const schemaText = JSON.stringify(tools);
    const estTokens = Math.round(schemaText.length / 4);
    assert.ok(estTokens < 600, `Schema footprint (${estTokens} tokens) must be ultra-compact (<600 tokens)`);
  });

  await t.test('JSON-RPC initialize protocol compliance', () => {
    const resp = server.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {}
    });
    assert.ok(resp);
    assert.equal(resp.id, 1);
    const result = resp.result as any;
    assert.equal(result.serverInfo.name, 'starlight-genius-mcp');
    assert.equal(result.serverInfo.version, '7.0.0');
  });

  await t.test('starlight_pulse returns ambient briefing', async () => {
    const pulse = await server.executeTool('starlight_pulse', {});
    assert.equal(pulse.status, 'healthy');
    assert.equal(pulse.totalEntries, 0);
    assert.ok(typeof pulse.vaultCounts === 'object');
    assert.equal(pulse.vaultCounts.strategic, 0);
  });

  await t.test('starlight_remember persists to canonical vault and invalidates cache', async () => {
    const result = await server.executeTool('starlight_remember', {
      content: 'Never compromise on local memory sovereignty. Substrate is the moat.',
      vault: 'strategic',
      tags: ['sovereignty', 'moat', 'architecture'],
      category: 'decision',
      confidence: 'high'
    });

    assert.equal(result.success, true);
    assert.ok(result.id.startsWith('sis_'));
    assert.equal(result.vault, 'strategic');

    // Verify written file
    const vaultFile = join(tempDir, 'strategic.jsonl');
    assert.ok(existsSync(vaultFile));
    const content = readFileSync(vaultFile, 'utf-8');
    assert.ok(content.includes('Never compromise on local memory sovereignty'));
  });

  await t.test('starlight_recall retrieves memory with high score and cached recall in <5ms', async () => {
    // Initial call loads and indexes
    const recall = await server.executeTool('starlight_recall', {
      query: 'memory sovereignty',
      mode: 'relevant',
      limit: 5
    });

    assert.ok(recall.length >= 1, 'Should find the stored memory');
    assert.ok(recall[0].content.includes('local memory sovereignty'));
    assert.ok(recall[0].score > 0.5, `Score should be high, got ${recall[0].score}`);

    // Subsequent call verifies ultra-fast in-memory hot path
    const t0 = performance.now();
    const cached = await server.executeTool('starlight_recall', {
      query: 'memory sovereignty',
      mode: 'relevant',
      limit: 5
    });
    const dt = performance.now() - t0;
    assert.ok(dt < 5, `In-memory cached recall must be ultra-fast (<5ms), took ${dt.toFixed(2)}ms`);
    assert.equal(cached.length, recall.length);
  });

  await t.test('starlight_recall recent mode returns chronological items', async () => {
    // Add second item
    await server.executeTool('starlight_remember', {
      content: 'Consolidated MCP server v7 reduces prompt token overhead by 90%.',
      vault: 'technical',
      tags: ['mcp', 'tokens', 'optimization'],
      category: 'architecture',
      confidence: 'high'
    });

    const recent = await server.executeTool('starlight_recall', {
      query: '',
      mode: 'recent',
      limit: 5
    });

    assert.equal(recent.length, 2);
    assert.ok(recent[0].content.includes('Consolidated MCP server v7'));
  });

  await t.test('JSON-RPC tools/call handles execution cleanly', () => {
    const resp = server.handleRequest({
      jsonrpc: '2.0',
      id: 42,
      method: 'tools/call',
      params: {
        name: 'starlight_pulse',
        arguments: {}
      }
    });

    assert.ok(resp);
    assert.equal(resp.id, 42);
    assert.ok(!resp.error);
    const result = resp.result as any;
    assert.ok(Array.isArray(result.content));
    assert.equal(result.content[0].type, 'text');
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.totalEntries, 2);
  });
});
