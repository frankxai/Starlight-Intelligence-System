import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TemporalFactSpine } from '../src/memory/temporal-spine.js';

function withTempSpine(fn: (spine: TemporalFactSpine, dir: string) => void): void {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-temporal-spine-'));
  const spine = new TemporalFactSpine(path.join(tmpDir, 'facts.jsonl'));
  try {
    fn(spine, tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('TemporalFactSpine (Bi-Temporal Fact Ledger)', () => {
  it('asserts a fact and supersedes prior conflicting objects in the same (vault, subject, predicate) slot', () => {
    withTempSpine((spine) => {
      const r1 = spine.assertFact({
        vault: 'operational',
        subject: 'service:shared-tool-plane',
        predicate: 'port',
        object: '3791',
        confidence: 0.9,
        tValid: '2026-10-01T00:00:00.000Z',
        tCreated: '2026-10-01T00:00:00.000Z',
        provenance: { repo: 'starlight-estate', filePath: 'docs/old.md' },
      });
      assert.equal(r1.supersededIds.length, 0);
      assert.equal(r1.deduplicated, false);

      const r2 = spine.assertFact({
        vault: 'operational',
        subject: 'service:shared-tool-plane',
        predicate: 'port',
        object: '7317',
        confidence: 0.98,
        tValid: '2026-10-15T00:00:00.000Z',
        tCreated: '2026-10-15T00:00:00.000Z',
        provenance: { repo: 'starlight-estate', prNumber: 54 },
      });
      assert.deepEqual(r2.supersededIds, [r1.fact.id]);

      // Present active query returns only 7317
      const current = spine.queryActiveFacts({
        vault: 'operational',
        subject: 'service:shared-tool-plane',
        predicate: 'port',
      });
      assert.equal(current.length, 1);
      assert.equal(current[0].object, '7317');

      // Point-in-time query before 2026-10-15 returns 3791
      const historical = spine.queryFactsAt('2026-10-10T00:00:00.000Z', {
        vault: 'operational',
        subject: 'service:shared-tool-plane',
      });
      assert.equal(historical.length, 1);
      assert.equal(historical[0].object, '3791');

      // Lineage tracks both records in chronological order
      const lineage = spine.getLineage('operational', 'service:shared-tool-plane', 'port');
      assert.equal(lineage.length, 2);
      assert.equal(lineage[0].supersededBy, r2.fact.id);
      assert.equal(lineage[1].supersededBy, null);
    });
  });

  it('is idempotent when re-asserting the same (vault, subject, predicate, object)', () => {
    withTempSpine((spine) => {
      const first = spine.assertFact({
        vault: 'technical',
        subject: 'repo:starlight-memory',
        predicate: 'doctor_status',
        object: 'healthy',
        confidence: 0.85,
        provenance: { repo: 'starlight-memory', prNumber: 41 },
      });
      const second = spine.assertFact({
        vault: 'technical',
        subject: 'repo:starlight-memory',
        predicate: 'doctor_status',
        object: 'healthy',
        confidence: 0.99,
        provenance: { repo: 'starlight-memory', commitSha: '8a593c0' },
      });

      assert.equal(second.deduplicated, true);
      assert.equal(second.supersededIds.length, 0);
      assert.equal(second.fact.id, first.fact.id);
      assert.equal(second.fact.confidence, 0.99);
      assert.equal(second.fact.provenance?.prNumber, 41);
      assert.equal(second.fact.provenance?.commitSha, '8a593c0');
    });
  });

  it('formats active facts into a deterministic, token-bounded Turn-0 block', () => {
    withTempSpine((spine) => {
      spine.assertFact({
        vault: 'technical',
        subject: 'harness:codex',
        predicate: 'project_doc_max_bytes',
        object: '98304',
        provenance: { repo: 'starlight-estate', prNumber: 54 },
      });
      spine.assertFact({
        vault: 'operational',
        subject: 'service:langfuse-eu',
        predicate: 'ingestion_status',
        object: 'spooled_locally_on_403',
        provenance: { repo: 'starlight-agent-config', prNumber: 128 },
      });

      const block = spine.formatCompactBlock({ maxChars: 500 });
      assert.match(
        block,
        /- \[operational:service:langfuse-eu\] ingestion_status -> spooled_locally_on_403 \(starlight-agent-config#128\)/
      );
      assert.match(
        block,
        /- \[technical:harness:codex\] project_doc_max_bytes -> 98304 \(starlight-estate#54\)/
      );
    });
  });
});
