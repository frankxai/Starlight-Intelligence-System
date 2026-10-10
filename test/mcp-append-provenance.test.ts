import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { StarlightMcpServer } from '../src/mcp-server.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

type Stored = { agent?: string; brand?: string; domain?: string; unit?: string; source?: string; tags: string[] };

function call(server: StarlightMcpServer, id: number, name: string, args: Record<string, unknown>) {
  return server.handleRequest({
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name, arguments: args },
  });
}

function isError(response: ReturnType<StarlightMcpServer['handleRequest']>) {
  return (response?.result as { isError?: boolean } | undefined)?.isError;
}

function appendedId(response: ReturnType<StarlightMcpServer['handleRequest']>) {
  assert.equal(isError(response), undefined, JSON.stringify(response));
  return (response?.result as { structuredContent: { id: string } }).structuredContent.id;
}

function ids(server: StarlightMcpServer, id: number, query: string, scope?: string) {
  const response = call(server, id, 'sis_search', { query, ...(scope ? { scope } : {}), limit: 10 });
  const rows = (response?.result as { structuredContent?: { results?: Array<{ id: string }> } })?.structuredContent?.results;
  assert.ok(rows, JSON.stringify(response));
  return rows.map(row => row.id);
}

function storedLines(vaultDir: string, vault: string): Stored[] {
  return readFileSync(join(vaultDir, `${vault}.jsonl`), 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line) as Stored);
}

function withVault(prefix: string, run: (vaultDir: string, server: StarlightMcpServer) => void) {
  const vaultDir = mkdtempSync(join(tmpdir(), prefix));
  try {
    run(vaultDir, new StarlightMcpServer(vaultDir));
  } finally {
    rmSync(vaultDir, { recursive: true, force: true });
  }
}

test('agent is author provenance only; brand sets the unit scope', () => {
  withVault('sis-provenance-', (vaultDir, server) => {
    const id = appendedId(call(server, 1, 'sis_append_entry', {
      vault: 'strategic',
      content: 'shared launch plan for the studio',
      agent: 'gencreator',
      brand: 'frankx',
      domain: 'marketing',
    }));
    const [stored] = storedLines(vaultDir, 'strategic');
    assert.equal(stored.agent, 'gencreator');
    assert.equal(stored.brand, 'frankx');
    assert.equal(stored.domain, 'marketing');
    assert.equal(stored.unit, 'frankx');
    assert.equal(stored.source, undefined);
    assert.ok(stored.tags.includes('agent:gencreator'));
    assert.ok(stored.tags.includes('brand:frankx'));
    assert.ok(stored.tags.includes('domain:marketing'));
    assert.ok(stored.tags.includes('unit:frankx'));
    assert.ok(!stored.tags.includes('unit:gencreator'), 'the author must not become a unit scope');

    assert.deepEqual(ids(server, 2, 'shared launch plan', 'unit:frankx'), [id]);
    assert.deepEqual(ids(server, 3, 'shared launch plan', 'unit:gencreator'), []);
    assert.deepEqual(ids(server, 4, 'shared launch plan', 'unit:arcanea'), []);
  });
});

test('an explicit unit wins over brand and differs from the agent; scoped recall follows the unit', () => {
  withVault('sis-provenance-unit-', (vaultDir, server) => {
    const id = appendedId(call(server, 1, 'sis_append_entry', {
      vault: 'technical',
      content: 'render pipeline decision for the lab',
      agent: 'gencreator',
      brand: 'frankx',
      unit: 'arcanea',
    }));
    const [stored] = storedLines(vaultDir, 'technical');
    assert.equal(stored.agent, 'gencreator');
    assert.equal(stored.unit, 'arcanea');
    assert.ok(stored.tags.includes('unit:arcanea'));
    assert.ok(!stored.tags.includes('unit:gencreator'));
    assert.ok(!stored.tags.includes('unit:frankx'));

    assert.deepEqual(ids(server, 2, 'render pipeline decision', 'unit:arcanea'), [id]);
    assert.deepEqual(ids(server, 3, 'render pipeline decision', 'unit:gencreator'), []);
    assert.deepEqual(ids(server, 4, 'render pipeline decision', 'unit:frankx'), []);
    assert.deepEqual(ids(server, 5, 'render pipeline decision'), [id]);
  });
});

test('an agent without brand or unit adds no unit scope', () => {
  withVault('sis-provenance-agent-', (vaultDir, server) => {
    const id = appendedId(call(server, 1, 'sis_append_entry', {
      vault: 'creative',
      content: 'moodboard notes from the author',
      agent: 'gencreator',
    }));
    const [stored] = storedLines(vaultDir, 'creative');
    assert.equal(stored.unit, undefined);
    assert.deepEqual(stored.tags.filter(tag => tag.startsWith('unit:')), []);
    assert.deepEqual(ids(server, 2, 'moodboard notes', 'unit:gencreator'), []);
    assert.deepEqual(ids(server, 3, 'moodboard notes'), [id]);
  });
});

test('an entry never carries two unit tags: conflicting unit tags are rejected', () => {
  withVault('sis-provenance-conflict-', (vaultDir, server) => {
    const conflicts: Array<Record<string, unknown>> = [
      { tags: ['unit:frankx'], unit: 'arcanea' },
      { tags: ['unit:frankx'], brand: 'arcanea' },
      { tags: ['unit:frankx', 'unit:arcanea'] },
      { tags: ['unit:frankx', 'unit:arcanea'], unit: 'arcanea' },
    ];
    for (const [i, extra] of conflicts.entries()) {
      const response = call(server, i + 1, 'sis_append_entry', { vault: 'strategic', content: 'cross unit leak probe', ...extra });
      assert.equal(isError(response), true, JSON.stringify(extra));
    }
    assert.throws(() => readFileSync(join(vaultDir, 'strategic.jsonl'), 'utf8'), 'a rejected append writes nothing');
    assert.deepEqual(ids(server, 10, 'cross unit leak probe', 'unit:frankx'), []);
    assert.deepEqual(ids(server, 11, 'cross unit leak probe', 'unit:arcanea'), []);
  });
});

test('matching and duplicate unit tags collapse to one; scoped recall misses every other unit', () => {
  withVault('sis-provenance-dupes-', (vaultDir, server) => {
    const id = appendedId(call(server, 1, 'sis_append_entry', {
      vault: 'strategic',
      content: 'arcanea roadmap checkpoint',
      tags: ['unit:arcanea', 'unit:arcanea', 'roadmap'],
      unit: 'arcanea',
      brand: 'frankx',
      agent: 'gencreator',
    }));
    const [stored] = storedLines(vaultDir, 'strategic');
    assert.deepEqual(stored.tags.filter(tag => tag.startsWith('unit:')), ['unit:arcanea']);
    assert.equal(stored.tags.filter(tag => tag === 'roadmap').length, 1);
    assert.equal(stored.unit, 'arcanea');
    assert.deepEqual(ids(server, 2, 'arcanea roadmap checkpoint', 'unit:arcanea'), [id]);
    for (const [n, stale] of ['unit:frankx', 'unit:gencreator'].entries()) {
      assert.deepEqual(ids(server, 3 + n, 'arcanea roadmap checkpoint', stale), [], stale);
    }
  });
});

test('a caller unit tag with no unit or brand stays the single unit (pre-#318 scoping)', () => {
  withVault('sis-provenance-legacy-', (vaultDir, server) => {
    const id = appendedId(call(server, 1, 'sis_append_entry', {
      vault: 'technical',
      content: 'legacy scoped note',
      tags: ['unit:arcanea'],
      agent: 'gencreator',
    }));
    const [stored] = storedLines(vaultDir, 'technical');
    assert.equal(stored.unit, 'arcanea');
    assert.deepEqual(stored.tags.filter(tag => tag.startsWith('unit:')), ['unit:arcanea']);
    assert.deepEqual(ids(server, 2, 'legacy scoped note', 'unit:arcanea'), [id]);
    assert.deepEqual(ids(server, 3, 'legacy scoped note', 'unit:gencreator'), []);

    const sameBrand = appendedId(call(server, 4, 'sis_append_entry', {
      vault: 'technical',
      content: 'brand agrees with tag',
      tags: ['unit:frankx'],
      brand: 'frankx',
    }));
    assert.deepEqual(ids(server, 5, 'brand agrees with tag', 'unit:frankx'), [sameBrand]);
  });
});

test('registered agent names are normalized to slugs; unusable values are refused', () => {
  withVault('sis-provenance-slug-', (vaultDir, server) => {
    appendedId(call(server, 1, 'sis_append_entry', {
      vault: 'operational',
      content: 'voice and video handoff',
      agent: 'starlight-voice-&-video-is',
    }));
    const [stored] = storedLines(vaultDir, 'operational');
    assert.equal(stored.agent, 'starlight-voice-video-is');
    assert.ok(stored.tags.includes('agent:starlight-voice-video-is'));

    for (const agent of ['---', '9lives', 'a'.repeat(40)]) {
      assert.equal(isError(call(server, 2, 'sis_append_entry', { vault: 'strategic', content: 'bad slug', agent })), true, agent);
    }
    assert.equal(isError(call(server, 3, 'sis_append_entry', { vault: 'strategic', content: 'bad unit', unit: '&&' })), true);
  });
});

test('legacy operations and ops vaults are refused and the six vaults still append', () => {
  withVault('sis-provenance-vaults-', (_vaultDir, server) => {
    for (const vault of ['operations', 'ops']) {
      assert.equal(isError(call(server, 1, 'sis_append_entry', { vault, content: 'do not write the legacy file' })), true);
    }
    for (const vault of ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon']) {
      const ok = call(server, 2, 'sis_append_entry', { vault, content: `kept in ${vault}` });
      assert.equal(isError(ok), undefined);
      assert.equal((ok?.result as { structuredContent: { vault: string } }).structuredContent.vault, vault);
    }
  });
});

test('importing the server module does not start the stdio server', async () => {
  const moduleUrl = pathToFileURL(join(ROOT, 'src', 'mcp-server.ts')).href;
  const child = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `await import(${JSON.stringify(moduleUrl)});`], {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += String(chunk); });
  // stdin stays open: a server listening on it would keep the process alive.
  const code = await new Promise<number | null>((resolveExit, reject) => {
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`import kept the process alive; stderr: ${stderr}`));
    }, 30_000);
    child.on('exit', exitCode => { clearTimeout(timer); resolveExit(exitCode); });
  });
  assert.equal(code, 0, stderr);
  assert.ok(!stderr.includes('MCP server started'), stderr);
});
