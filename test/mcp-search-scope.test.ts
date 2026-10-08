import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { StarlightMcpServer } from '../src/mcp-server.js';

test('MCP sis_search honors scope rule and ranks appropriately', () => {
  const vaultDir = mkdtempSync(join(tmpdir(), 'sis-mcp-scope-'));
  const createdAt = '2026-10-03T00:00:00.000Z';

  try {
    const server = new StarlightMcpServer(vaultDir);

    writeFileSync(join(vaultDir, 'strategic.jsonl'), [
      JSON.stringify({ id: 'c1', content: 'test query 1 company', tags: ['company'], createdAt }),
      JSON.stringify({ id: 'g1', content: 'test query 1 gencreator', tags: ['unit:gencreator'], createdAt }),
      JSON.stringify({ id: 'a1', content: 'test query 1 arcanea', tags: ['unit:arcanea'], createdAt })
    ].join('\n') + '\n', 'utf-8');

    const res1 = server.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'sis_search',
        arguments: { query: 'test query 1', scope: 'unit:gencreator', limit: 10 }
      }
    });

    const result1 = (res1?.result as any).structuredContent?.results;
    assert.ok(result1, 'Results should exist: ' + JSON.stringify(res1));
    assert.deepEqual(
      new Set(result1.map((r: any) => r.id)),
      new Set(['c1', 'g1'])
    );

    const t2Entries = [];
    for (let i = 0; i < 8; i++) {
      t2Entries.push(JSON.stringify({ id: `a2_${i}`, content: 'test query 2', tags: ['unit:arcanea'], confidence: 'high', createdAt }));
    }
    t2Entries.push(JSON.stringify({ id: 'g2', content: 'test query 2', tags: ['unit:gencreator'], confidence: 'low', createdAt }));
    writeFileSync(join(vaultDir, 'operational.jsonl'), t2Entries.join('\n') + '\n', 'utf-8');

    const res2 = server.handleRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'sis_search',
        arguments: { query: 'test query 2', scope: 'unit:gencreator', limit: 1 }
      }
    });

    const result2 = (res2?.result as any).structuredContent?.results;
    assert.ok(result2, 'Results should exist: ' + JSON.stringify(res2));
    assert.equal(result2.length, 1);
    assert.equal(result2[0].id, 'g2');

  } finally {
    rmSync(vaultDir, { recursive: true, force: true });
  }
});
