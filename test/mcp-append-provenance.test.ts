import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { StarlightMcpServer } from '../src/mcp-server.js';

function call(server: StarlightMcpServer, id: number, name: string, args: Record<string, unknown>) {
  return server.handleRequest({
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name, arguments: args },
  });
}

function results(response: ReturnType<StarlightMcpServer['handleRequest']>) {
  return (response?.result as { structuredContent?: { results?: Array<{ id: string }> }; isError?: boolean })?.structuredContent?.results;
}

test('append stores provenance and the scope filter can see the agent', () => {
  const vaultDir = mkdtempSync(join(tmpdir(), 'sis-provenance-'));
  try {
    const server = new StarlightMcpServer(vaultDir);
    const appended = call(server, 1, 'sis_append_entry', {
      vault: 'strategic',
      content: 'shared launch plan for the studio',
      agent: 'gencreator',
      brand: 'frankx',
    });
    assert.equal((appended?.result as { isError?: boolean }).isError, undefined);
    const body = (appended?.result as { structuredContent: { id: string } }).structuredContent;
    const line = readFileSync(join(vaultDir, 'strategic.jsonl'), 'utf8').trim();
    const stored = JSON.parse(line) as { agent?: string; brand?: string; source?: string; tags: string[] };
    assert.equal(stored.agent, 'gencreator');
    assert.equal(stored.brand, 'frankx');
    assert.equal(stored.source, undefined);
    assert.ok(stored.tags.includes('agent:gencreator'));
    assert.ok(stored.tags.includes('brand:frankx'));
    assert.ok(stored.tags.includes('unit:gencreator'));

    const hit = call(server, 2, 'sis_search', {
      query: 'shared launch plan',
      scope: 'unit:gencreator',
      limit: 10,
    });
    assert.deepEqual(results(hit)?.map(row => row.id), [body.id]);

    const miss = call(server, 3, 'sis_search', {
      query: 'shared launch plan',
      scope: 'unit:arcanea',
      limit: 10,
    });
    assert.deepEqual(results(miss), []);
  } finally {
    rmSync(vaultDir, { recursive: true, force: true });
  }
});

test('legacy operations and ops vaults are refused and the six vaults still append', () => {
  const vaultDir = mkdtempSync(join(tmpdir(), 'sis-provenance-vaults-'));
  try {
    const server = new StarlightMcpServer(vaultDir);
    for (const vault of ['operations', 'ops']) {
      const refused = call(server, 1, 'sis_append_entry', { vault, content: 'do not write the legacy file' });
      assert.equal((refused?.result as { isError?: boolean }).isError, true);
    }
    for (const vault of ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon']) {
      const ok = call(server, 2, 'sis_append_entry', { vault, content: `kept in ${vault}` });
      assert.equal((ok?.result as { isError?: boolean }).isError, undefined);
      assert.equal((ok?.result as { structuredContent: { vault: string } }).structuredContent.vault, vault);
    }
    const bad = call(server, 3, 'sis_append_entry', {
      vault: 'strategic',
      content: 'bad slug',
      agent: 'Not A Slug',
    });
    assert.equal((bad?.result as { isError?: boolean }).isError, true);
  } finally {
    rmSync(vaultDir, { recursive: true, force: true });
  }
});
