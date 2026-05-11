/**
 * Track D v0.1 — eval 4: vault privacy contract
 *
 * THE substrate trust contract. A VaultLoopEntry written via sis.vault.record
 * with privacyStatus='private' MUST NOT leak through ANY of:
 *   • sis.memory.search results
 *   • the knowledge-graph stream (graph-edges.jsonl)
 *   • SIP attestation output (artifact register / pack registry)
 *   • any export readable by other tools
 *
 * If this fails, the demo silently exfiltrates private rows. Stop ship.
 *
 * Track T4 (VaultLoopEntry schema with privacyStatus enum) is in flight per
 * the prompt. Current MCP server records privacyStatus on the entry but the
 * structural separation (vault.record writes to vault-loop.jsonl; memory.search
 * reads from <vaultDir>/*.jsonl) is itself the contract being tested here.
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  rmSync,
  existsSync,
  readFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SisMcpServerV01 } from '../../dist/mcp-server-v01.js';

const SENTINEL = 'PRIVATE-DESIRE-' + Math.random().toString(36).slice(2, 10);

function withServer<T>(fn: (s: InstanceType<typeof SisMcpServerV01>, root: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), 'v01-vault-'));
  const server = new SisMcpServerV01({
    vaultDir: join(root, 'vaults'),
    substrateDir: root,
    repoRoot: root,
  });
  try {
    return fn(server, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('Track D / eval 4 — vault privacy contract', () => {
  it('private vault.record entries do NOT appear in sis.memory.search results', () => {
    withServer((server) => {
      // Record a PRIVATE entry containing the sentinel.
      const rec = server.callTool('sis.vault.record', {
        vault_entry_kind: 'desire',
        payload: { wish: `${SENTINEL} build the substrate`, level: 'private' },
        privacy_status: 'private',
      });
      assert.equal(rec.status, 'ok');

      // Search across vaults for the sentinel.
      const search = server.callTool('sis.memory.search', {
        query: SENTINEL,
        limit: 100,
        minConfidence: 0,
      });
      assert.equal(search.status, 'ok');
      const results = (search as { data: unknown[] }).data;
      assert.equal(
        results.length,
        0,
        'private vault-loop entry must not appear in memory.search',
      );
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
        const raw = readFileSync(path, 'utf-8');
        assert.equal(
          raw.includes(SENTINEL),
          false,
          'sentinel leaked into graph-edges.jsonl',
        );
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
        const raw = readFileSync(path, 'utf-8');
        assert.equal(raw.includes(SENTINEL), false, 'sentinel leaked into artifacts');
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
        const raw = readFileSync(path, 'utf-8');
        assert.equal(raw.includes(SENTINEL), false, 'sentinel leaked into pack registry');
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
      assert.equal(rec.status, 'ok');
      const path = join(root, 'memory', '_audit', 'vault-loop.jsonl');
      assert.ok(existsSync(path), 'vault-loop.jsonl must exist after write');
      const lines = readFileSync(path, 'utf-8')
        .split('\n')
        .filter((l) => l.trim().length > 0);
      assert.equal(lines.length, 1);
      const stored = JSON.parse(lines[0]);
      assert.equal(stored.privacyStatus, 'private');
    });
  });

  it('public vault.record entries are isolated from memory.search too (surface separation)', () => {
    // The vault.record / memory.search disjoint-surface contract holds
    // regardless of privacy_status — vault-loop is a separate stream from
    // the kind-named vault stores. We assert the separation so a future
    // bug that merges them would surface here.
    withServer((server) => {
      const PUBLIC_TOKEN = 'PUBLIC-EVIDENCE-' + Math.random().toString(36).slice(2, 8);
      server.callTool('sis.vault.record', {
        vault_entry_kind: 'evidence',
        payload: { note: PUBLIC_TOKEN },
        privacy_status: 'public',
      });
      const search = server.callTool('sis.memory.search', {
        query: PUBLIC_TOKEN,
        limit: 100,
        minConfidence: 0,
      });
      assert.equal(search.status, 'ok');
      const results = (search as { data: unknown[] }).data;
      assert.equal(
        results.length,
        0,
        'vault-loop and memory.search must remain disjoint surfaces',
      );
    });
  });

  it('memory.add → memory.search round-trips (proves search works on the right surface)', () => {
    // Sanity check — if this failed, eval 1 would falsely pass because the
    // search surface is broken everywhere. We need a positive test to anchor.
    withServer((server) => {
      const TOKEN = 'PUBLIC-MEMORY-' + Math.random().toString(36).slice(2, 8);
      server.callTool('sis.memory.add', {
        content: `${TOKEN} the substrate sees`,
        vault: 'operational',
        confidence: 0.9,
      });
      const search = server.callTool('sis.memory.search', {
        query: TOKEN,
        limit: 10,
        minConfidence: 0,
      });
      assert.equal(search.status, 'ok');
      const results = (search as { data: unknown[] }).data;
      assert.ok(results.length >= 1, 'memory.add must be findable by memory.search');
    });
  });
});
