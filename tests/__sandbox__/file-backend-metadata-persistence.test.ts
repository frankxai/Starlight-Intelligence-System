/**
 * Failing integration test — VaultEntry.metadata persistence
 *
 * GATE STATUS: BLOCKING (Luminor Board REVISE item 2, 2026-04-29)
 *
 * Bug: file-backend.entryToMd() does not serialize entry.metadata to the .md
 * frontmatter, and mdToEntry() does not parse it back. SIP attestation fields
 * (sip_attest, attest_chain) survive in-RAM only and are lost on reload.
 *
 * Bug location:
 *   - C:\Users\frank\Arcanea-run-graph\packages\memory-system\src\storage\file-backend.ts
 *   - entryToMd() lines 59-67 (metadata never spread)
 *   - mdToEntry() lines 69-87 (metadata never parsed)
 *   - parseFrontmatter()/serializeFrontmatter() lines 26-46 / 49-56 (flat YAML only)
 *
 * Compounding: arcaneMD.ts:212-214 synthesizes metadata from {frequency, gate},
 * silently overwriting real metadata in the alternate code path. Same patch ticket
 * should rewrite parseArcaneMD to merge synthesized + parsed instead of replacing.
 *
 * This test MUST FAIL on current `@arcanea/memory-system` source. It is the
 * gate for the absorption patch into `@starlight/cognitive-substrate`.
 *
 * Patch outline (~12 lines, DO NOT APPLY before provenance gate clears):
 *   1. entryToMd: add `metadata: entry.metadata ? JSON.stringify(entry.metadata) : null`
 *   2. mdToEntry: parse meta['metadata'] via JSON.parse with try/catch
 *   3. serializeFrontmatter: JSON-quote values with \n or starting with [/{
 *   4. parseFrontmatter: when val starts with '"', JSON.parse it
 *
 * Edge cases:
 *   - YAML flat parser cannot represent nested objects → JSON-stringify escape hatch
 *   - Strings containing `:` (e.g. ISO timestamps) must round-trip via quoted branch
 *   - metadata: null preserves undefined (not {})
 *   - Existing entries without metadata: line still parse (guarded conditional)
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// During the failing-test phase, point this at the live Arcanea source:
//   import { FileBackend } from '../../../Arcanea-run-graph/packages/memory-system/src/storage/file-backend.js';
// After absorption into SIS, the path becomes:
//   import { FileBackend } from '@starlight/cognitive-substrate/file-backend';
import { FileBackend } from '@starlight/cognitive-substrate/file-backend';
import type { VaultEntry } from '@starlight/cognitive-substrate/types';

function makeTmpDir(label: string): string {
  return mkdtempSync(join(tmpdir(), `metadata-persist-${label}-`));
}

function baseEntry(overrides: Partial<VaultEntry> = {}): VaultEntry {
  const now = Date.now();
  return {
    id: `strategic_${now.toString(36)}_metatest`,
    vault: 'strategic',
    content: 'Test entry for metadata persistence.',
    tags: ['metadata-test'],
    confidence: 'high',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as VaultEntry;
}

describe('FileBackend — VaultEntry.metadata persistence (failing gate)', () => {
  let root: string;
  let backend: FileBackend;

  before(() => { root = makeTmpDir('root'); });
  after(() => { rmSync(root, { recursive: true, force: true }); });

  beforeEach(async () => {
    const fresh = join(root, `case-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    backend = new FileBackend(fresh);
    await backend.initialize();
  });

  it('a. round-trips SIP attestation block in metadata', async () => {
    const entry = baseEntry({
      id: 'strategic_sip_attest_a',
      metadata: {
        sip_attest: {
          version: 'v7.7',
          substrate: 'sis',
          attest_at: '2026-04-29T00:00:00Z',
          artifact_kind: 'memory-entry',
        },
      },
    });
    await backend.store(entry);
    const reloaded = await backend.retrieve(entry.id);
    assert.ok(reloaded, 'entry retrievable');
    assert.ok(reloaded!.metadata, 'metadata field present after reload');
    const sip = (reloaded!.metadata as any).sip_attest;
    assert.ok(sip, 'sip_attest sub-object present');
    assert.equal(sip.version, 'v7.7', 'sip_attest.version preserved');
    assert.equal(sip.substrate, 'sis');
    assert.equal(sip.artifact_kind, 'memory-entry');
  });

  it('b. round-trips attest_chain array in metadata', async () => {
    const entry = baseEntry({
      id: 'strategic_attest_chain_b',
      metadata: { attest_chain: ['parent-1', 'parent-2'] },
    });
    await backend.store(entry);
    const reloaded = await backend.retrieve(entry.id);
    assert.ok(reloaded?.metadata, 'metadata present');
    assert.deepEqual(
      (reloaded!.metadata as any).attest_chain,
      ['parent-1', 'parent-2'],
      'attest_chain array survives intact',
    );
  });

  it('c. round-trips deeply nested metadata structure', async () => {
    const nested = { a: { b: { c: 1 } } };
    const entry = baseEntry({ id: 'strategic_nested_c', metadata: nested });
    await backend.store(entry);
    const reloaded = await backend.retrieve(entry.id);
    assert.ok(reloaded?.metadata, 'metadata present');
    assert.deepEqual(reloaded!.metadata, nested, 'deep equality preserved');
  });

  it('d. empty metadata object round-trips without crashing', async () => {
    const entry = baseEntry({ id: 'strategic_empty_d', metadata: {} });
    await backend.store(entry);
    const reloaded = await backend.retrieve(entry.id);
    assert.ok(reloaded, 'no crash on empty metadata');
    if (reloaded!.metadata !== undefined) {
      assert.deepEqual(reloaded!.metadata, {}, 'empty object round-trips as empty');
    }
  });

  it('e. undefined metadata does not raise on save or load', async () => {
    const entry = baseEntry({ id: 'strategic_undef_e' });
    delete (entry as any).metadata;
    await backend.store(entry);
    const reloaded = await backend.retrieve(entry.id);
    assert.ok(reloaded, 'entry retrievable with undefined metadata');
    assert.ok(
      reloaded!.metadata === undefined || Object.keys(reloaded!.metadata).length === 0,
      'undefined input results in undefined or empty metadata, never thrown',
    );
  });

  it('f. metadata survives across FileBackend re-creation (cold restart)', async () => {
    const persistPath = join(root, 'cold-restart');
    const a = new FileBackend(persistPath);
    await a.initialize();
    const entry = baseEntry({
      id: 'strategic_cold_f',
      metadata: { sip_attest: { version: 'v7.7', substrate: 'sis' } },
    });
    await a.store(entry);

    const b = new FileBackend(persistPath);
    await b.initialize();
    const reloaded = await b.retrieve(entry.id);
    assert.ok(reloaded?.metadata, 'metadata present after cold restart');
    assert.equal(
      (reloaded!.metadata as any).sip_attest?.version,
      'v7.7',
      'attestation survives cache eviction',
    );
  });
});

/*
 * Expected output on current (buggy) code:
 *
 *   a. sip_attest    → assert.ok(reloaded.metadata) FAILS (undefined)
 *   b. attest_chain  → FAILS on first assert
 *   c. nested        → FAILS (undefined)
 *   d. empty {}      → passes vacuously (lenient branch)
 *   e. undefined     → passes
 *   f. cold restart  → FAILS (undefined after process boundary)
 *
 * Tests a/b/c/f are the gate. Tests d/e are guard-rails so the patch
 * cannot regress the null path.
 *
 * Run via:
 *   node --test tests/__sandbox__/file-backend-metadata-persistence.test.ts
 *
 * After patch + absorption, this test MUST PASS, and is then promoted from
 * tests/__sandbox__/ to packages/cognitive-substrate/tests/.
 */
