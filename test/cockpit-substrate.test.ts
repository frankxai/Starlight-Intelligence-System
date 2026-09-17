import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LocalMemorySubstrate } from '../cockpit/web/src/memory/sqliteSubstrate.js';
import { ALL_VAULT_METADATA, INITIAL_VAULT_ENTRIES } from '../cockpit/web/src/memory/vaultData.js';
import { generateSipConsensusArtifact } from '../cockpit/web/src/council/sipConsensus.js';
import type { VaultType } from '../cockpit/web/src/types/cockpit.js';

describe('Starlight Cockpit Substrate & Canvas Engine', () => {
  it('should verify all 6 semantic memory vaults exist in metadata and have entries', () => {
    assert.equal(ALL_VAULT_METADATA.length, 6, 'Must contain exactly 6 vaults');
    const expectedVaults: VaultType[] = [
      'strategic',
      'technical',
      'creative',
      'operational',
      'wisdom',
      'horizon',
    ];

    expectedVaults.forEach((v) => {
      const found = ALL_VAULT_METADATA.find((m) => m.id === v);
      assert.ok(found, `Vault ${v} must be present in metadata`);
    });

    assert.ok(INITIAL_VAULT_ENTRIES.length >= 100, 'Must have 100+ real JSONL entries');
  });

  it('should initialize local in-memory SQLite substrate with zero network calls', () => {
    const db = new LocalMemorySubstrate();
    const stats = db.getStats();

    assert.equal(stats.networkRequests, 0, 'Must make zero network requests');
    assert.equal(stats.totalEntries, INITIAL_VAULT_ENTRIES.length);
    assert.ok(stats.indexedTokens > 50, 'Must index tokens into FTS table');
  });

  it('should execute FTS lexical queries in <2ms', () => {
    const db = new LocalMemorySubstrate();
    const queries = ['architecture', 'sqlite', 'glass', 'skyrim', 'monetization'];

    for (const q of queries) {
      const results = db.searchFTS(q, { limit: 5 });
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0, `Search for "${q}" should return results`);
      assert.ok(
        results[0].latencyMs < 2.0,
        `Query latency for "${q}" was ${results[0].latencyMs}ms, expected < 2ms`
      );
    }
  });

  it('should execute vector similarity and hybrid RRF search in <2ms', () => {
    const db = new LocalMemorySubstrate();
    const results = db.hybridSearch('planetary scale abundance and sovereign memory', { limit: 10 });

    assert.ok(results.length > 0, 'Hybrid search should return results');
    assert.ok(results[0].score > 0, 'Score should be positive');
    assert.ok(results[0].latencyMs < 2.0, `Hybrid search latency was ${results[0].latencyMs}ms, expected < 2ms`);
  });

  it('should benchmark 100 consecutive queries with p95 < 2ms', () => {
    const db = new LocalMemorySubstrate();
    const bench = db.benchmark(100);

    assert.equal(bench.runs, 100);
    assert.equal(bench.networkCalls, 0, 'Network requests must strictly be 0');
    assert.ok(
      bench.p95Ms < 2.0,
      `P95 latency was ${bench.p95Ms}ms, expected strictly < 2.0ms`
    );
    assert.equal(bench.passed, true, 'Benchmark criteria passed');
  });

  it('should generate signed SIP Consensus JSON artifact adhering to SIP v1.1.1', () => {
    const artifact = generateSipConsensusArtifact({
      topic: 'Spatial Canvas & Zero-Latency Substrate Architecture',
      connectedVaults: ['strategic', 'technical'],
      architectSummary: 'Spatial engine topology verified at 120 FPS with SQLite WASM in-memory indexing.',
      sentinelSummary: 'Taste.md standard passed. Zero PII leakage confirmed.',
      primeSummary: 'Synthesized execution plan ratified with unanimous council consensus.',
      executionSteps: [
        'Mount spatial canvas engine',
        'Mount in-memory SQLite substrate',
        'Establish context link cables',
      ],
      tasteScore: 0.99,
    });

    assert.equal(artifact.sip_version, '1.1.1');
    assert.equal(artifact.protocol, 'starlight-intelligence-protocol');
    assert.equal(artifact.consensus_status, 'RATIFIED');
    assert.ok(artifact.consensus_id.startsWith('sip-cns-'));
    assert.ok(artifact.attestation.signature.includes('sip_sig_ed25519_'));
    assert.equal(artifact.attestation.seal, 'Built on SIP — Sovereign Substrate (Layer 2 Verifiable)');
    assert.equal(artifact.council.architect.verdict, 'APPROVED');
    assert.equal(artifact.council.sentinel.verdict, 'RATIFIED');
    assert.equal(artifact.council.prime.verdict, 'CONVERGED');
  });
});
