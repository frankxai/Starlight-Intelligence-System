/**
 * Track D v0.1 — eval 4: vault privacy contract
 *
 * Substrate trust contract: a VaultLoopEntry recorded via sis.vault.record
 * with privacy_status='private' MUST NOT leak through ANY of:
 *   • sis.memory.search results
 *   • the knowledge-graph stream (graph-edges.jsonl)
 *   • artifact ledger / pack registry
 *
 * Structural guarantee: vault.record writes to memory/_audit/vault-loop.jsonl;
 * memory.search reads from VaultMemory under <repoRoot>/.starlight/. Disjoint
 * surfaces. If a future bug merges them, this eval surfaces it.
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isOk, errOf, withServer } from './_helpers.ts';

const SENTINEL = 'PRIVATE-DESIRE-' + Math.random().toString(36).slice(2, 10);

describe('Track D / eval 4 — vault privacy contract', () => {
  it('private vault.record entries do NOT appear in sis.memory.search results', () => {
    withServer((server) => {
      const rec = server.callTool('sis.vault.record', {
        vault_entry_kind: 'desire',
        payload: { wish: `${SENTINEL} build the substrate`, level: 'private' },
        privacy_status: 'private',
      });
      assert.ok(isOk(rec), errOf(rec));
      const search = server.callTool('sis.memory.search', {
        query: SENTINEL, limit: 100, minConfidence: 0,
      });
      assert.ok(isOk(search), errOf(search));
      const results = (search as { results: unknown[] }).results;
      assert.equal(results.length, 0, 'private vault-loop entry leaked into memory.search');
    });
  });

  it('private vault.record entries do NOT appear in the graph-edges stream', () => {
    withServer((server, root) => {
      server.callTool('sis.vault.record', {
        vault_entry_kind: 'visualization',
        payload: { content: SENTINEL },
        privacy_status: 'private',
      });
      const path = join(root, 'memory', '_audit', 'graph-edges.jsonl');
      if (existsSync(path)) {
        assert.equal(readFileSync(path, 'utf-8').includes(SENTINEL), false,
          'sentinel leaked into graph-edges.jsonl');
      }
    });
  });

  it('private vault.record entries do NOT leak into the artifact ledger', () => {
    withServer((server, root) => {
      server.callTool('sis.vault.record', {
        vault_entry_kind: 'intuition',
        payload: { content: SENTINEL },
        privacy_status: 'private',
      });
      const path = join(root, 'memory', '_audit', 'artifacts.jsonl');
      if (existsSync(path)) {
        assert.equal(readFileSync(path, 'utf-8').includes(SENTINEL), false,
          'sentinel leaked into artifacts');
      }
    });
  });

  it('private vault.record entries do NOT leak into the pack registry', () => {
    withServer((server, root) => {
      server.callTool('sis.vault.record', {
        vault_entry_kind: 'aligned_action',
        payload: { content: SENTINEL },
        privacy_status: 'private',
      });
      const path = join(root, 'packs', 'registry.json');
      if (existsSync(path)) {
        assert.equal(readFileSync(path, 'utf-8').includes(SENTINEL), false,
          'sentinel leaked into pack registry');
      }
    });
  });

  it('private vault.record IS written to vault-loop.jsonl (write surface intact)', () => {
    withServer((server, root) => {
      const rec = server.callTool('sis.vault.record', {
        vault_entry_kind: 'desire',
        payload: { content: SENTINEL },
        privacy_status: 'private',
      });
      assert.ok(isOk(rec), errOf(rec));
      const path = join(root, 'memory', '_audit', 'vault-loop.jsonl');
      assert.ok(existsSync(path), 'vault-loop.jsonl must exist');
      const lines = readFileSync(path, 'utf-8').split('\n').filter((l) => l.trim());
      assert.equal(lines.length, 1);
      const stored = JSON.parse(lines[0]);
      assert.equal(stored.privacyStatus, 'private');
    });
  });

  it('public vault.record entries are isolated from memory.search too (surface separation)', () => {
    // vault.record / memory.search are disjoint surfaces regardless of
    // privacy_status. If a future bug merges them this catches it.
    withServer((server) => {
      const TOKEN = 'PUBLIC-EVIDENCE-' + Math.random().toString(36).slice(2, 8);
      server.callTool('sis.vault.record', {
        vault_entry_kind: 'evidence',
        payload: { note: TOKEN },
        privacy_status: 'public',
      });
      const search = server.callTool('sis.memory.search', {
        query: TOKEN, limit: 100, minConfidence: 0,
      });
      assert.ok(isOk(search), errOf(search));
      const results = (search as { results: unknown[] }).results;
      assert.equal(results.length, 0, 'vault-loop and memory.search must stay disjoint');
    });
  });

  it('memory.add → memory.search round-trips (proves search works on the right surface)', () => {
    // Anchor — if this fails the privacy tests above would falsely pass.
    withServer((server) => {
      const TOKEN = 'PUBLIC-MEMORY-' + Math.random().toString(36).slice(2, 8);
      server.callTool('sis.memory.add', {
        content: `${TOKEN} the substrate sees`,
        vault: 'operational',
        confidence: 0.9,
      });
      const search = server.callTool('sis.memory.search', {
        query: TOKEN, limit: 10, minConfidence: 0,
      });
      assert.ok(isOk(search), errOf(search));
      const results = (search as { results: unknown[] }).results;
      assert.ok(results.length >= 1, 'memory.add must be findable by memory.search');
    });
  });
});
