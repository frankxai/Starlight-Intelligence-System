/**
 * Platform Adapter — Test Suite
 *
 * First real tests exercising the adapter classes (previously only doc-symmetry
 * tests existed, none of which imported an adapter). Covers the factory, the
 * PlatformAdapter contract for every platform, the optional multi-file harness
 * method, and a regression lock against phantom MCP servers.
 *
 * Uses Node.js built-in test runner (node:test + node:assert).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAdapter, supportedPlatforms } from './index.js';
import type { PlatformAdapter, VaultEntry } from './types.js';

const ENTRIES: VaultEntry[] = [
  { id: 'a1', vault: 'strategic', content: 'Decision: ship the launcher, not a swarm.', confidence: 'high', tags: ['orchestration'], createdAt: '2026-06-04T00:00:00Z' },
  { id: 'a2', vault: 'technical', content: 'Hooks must be .cjs under type:module.', createdAt: '2026-06-04T00:00:00Z' },
];

const ALL = ['claude-code', 'cursor', 'codex', 'gemini-cli', 'opencode', 'antigravity', 'grok', 'hermes'];

describe('adapter factory', () => {
  it('lists exactly the supported platforms', () => {
    assert.deepEqual([...supportedPlatforms()].sort(), [...ALL].sort());
  });

  it('creates an adapter for every supported platform', () => {
    for (const p of ALL) {
      const a = createAdapter(p);
      assert.equal(a.platform.length > 0, true, `${p} has a platform id`);
      assert.equal(typeof a.maxContextTokens, 'number');
      assert.equal(a.maxContextTokens > 0, true, `${p} has positive context budget`);
    }
  });

  it('throws on an unknown platform, naming the supported set', () => {
    assert.throws(() => createAdapter('not-a-platform'), /Unknown platform.*Supported:/s);
  });
});

describe('PlatformAdapter contract (all platforms)', () => {
  for (const p of ALL) {
    it(`${p}: formatContext returns a ContextInjection`, () => {
      const a = createAdapter(p);
      const ctx = a.formatContext(ENTRIES, { includeMetadata: true });
      assert.ok(['markdown', 'xml', 'json'].includes(ctx.format), `${p} format is valid`);
      assert.equal(typeof ctx.content, 'string');
      assert.equal(ctx.content.length > 0, true, `${p} produced content`);
      assert.equal(typeof ctx.tokenEstimate, 'number');
      assert.equal(ctx.tokenEstimate > 0, true, `${p} estimated tokens`);
    });

    it(`${p}: getMcpConfig exposes an mcpServers object`, () => {
      const a = createAdapter(p);
      const cfg = a.getMcpConfig('dist/mcp-server.js') as { mcpServers?: Record<string, unknown> };
      assert.equal(typeof cfg, 'object');
      // opencode is intentionally empty, hermes has flat config; others carry mcpServers
      if (p !== 'opencode' && p !== 'hermes') {
        assert.ok(cfg.mcpServers, `${p} declares mcpServers`);
      }
    });

    it(`${p}: generateMemoryFile returns a named file with content`, () => {
      const a = createAdapter(p);
      const f = a.generateMemoryFile(ENTRIES);
      assert.equal(typeof f.filename, 'string');
      assert.equal(f.filename.length > 0, true);
      assert.equal(typeof f.content, 'string');
      assert.equal(f.content.length > 0, true);
    });
  }
});

describe('optional multi-file harness surface', () => {
  it('grok, antigravity and hermes implement generateAllAdapterFiles; others omit it', () => {
    const has = (p: string) => typeof (createAdapter(p) as PlatformAdapter).generateAllAdapterFiles === 'function';
    assert.equal(has('grok'), true, 'grok implements it');
    assert.equal(has('antigravity'), true, 'antigravity implements it');
    assert.equal(has('hermes'), true, 'hermes implements it');
    for (const p of ['claude-code', 'cursor', 'codex', 'gemini-cli', 'opencode']) {
      assert.equal(has(p), false, `${p} omits it (honest asymmetry)`);
    }
  });

  for (const p of ['grok', 'antigravity', 'hermes']) {
    it(`${p}: generateAllAdapterFiles yields {filename, content} items`, () => {
      const a = createAdapter(p) as Required<Pick<PlatformAdapter, 'generateAllAdapterFiles'>> & PlatformAdapter;
      const files = a.generateAllAdapterFiles(ENTRIES, 'dist/mcp-server.js');
      assert.equal(Array.isArray(files), true);
      assert.equal(files.length > 0, true, `${p} emitted files`);
      for (const f of files) {
        assert.equal(typeof f.filename, 'string');
        assert.equal(f.filename.length > 0, true);
        assert.equal(typeof f.content, 'string');
      }
    });
  }
});

describe('regression: no phantom MCP servers', () => {
  it('grok getMcpConfig declares only starlight-substrate (no never-built servers)', () => {
    const cfg = createAdapter('grok').getMcpConfig('dist/mcp-server.js') as { mcpServers: Record<string, unknown> };
    const servers = Object.keys(cfg.mcpServers);
    assert.deepEqual(servers, ['starlight-substrate']);
    const json = JSON.stringify(cfg);
    assert.equal(json.includes('_MCP_PATH'), false, 'no unresolved ${..._MCP_PATH} placeholders');
    assert.equal(json.includes('excellence-audit-mcp'), false);
    assert.equal(json.includes('subagent-telemetry'), false);
  });
});
