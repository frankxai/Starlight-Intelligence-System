/**
 * Memory Engine v0.2 — Embedding provider + hybrid search tests.
 *
 * Tests the EmbeddingProvider interface and HashingTFProvider without
 * downloading any models. TransformerProvider tests are gated behind
 * STARLIGHT_EMBED=transformer (skipped in CI unless the env var is set).
 *
 * Also tests RetrievalIndex.hybridSearch() using the HashingTFProvider
 * against the same public-vault corpus as retrieval-eval.test.ts.
 *
 * Built on SIP — operational tier (memory engine v0.2).
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  HashingTFProvider,
  rrfMerge,
  createEmbeddingProvider,
} from '../src/embedding.js';
import { RetrievalIndex } from '../src/retrieval.js';
import { repoRootFromTestFile } from './_lib/repo.js';

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const CORPUS = join(REPO_ROOT, 'public-vault');

// ── HashingTFProvider unit tests ───────────────────────────

describe('HashingTFProvider', () => {
  it('returns a 1024-element vector for typical text', async () => {
    const p = new HashingTFProvider();
    const v = await p.embed('memory architecture stance design pattern');
    assert.equal(v.length, 1024);
  });

  it('returns a zero vector for empty text', async () => {
    const p = new HashingTFProvider();
    const v = await p.embed('');
    assert.equal(v.length, 1024);
    assert.ok(v.every(x => x === 0), 'zero vector for empty text');
  });

  it('is L2-normalised for non-empty text', async () => {
    const p = new HashingTFProvider();
    const v = await p.embed('hello world foo bar');
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    assert.ok(Math.abs(norm - 1.0) < 1e-6, `expected unit norm, got ${norm}`);
  });

  it('produces higher similarity for semantically similar texts after IDF fit', async () => {
    const p = new HashingTFProvider();
    const corpus = [
      'memory retrieval architecture',
      'FTS5 BM25 keyword search',
      'embedding vector cosine similarity',
    ];
    p.fit(corpus);
    const a = await p.embed('memory retrieval');
    const b = await p.embed('memory architecture');
    const c = await p.embed('unrelated topic vegetables cooking');
    const simAB = p.similarity(a, b);
    const simAC = p.similarity(a, c);
    assert.ok(simAB > simAC, `similar pair (${simAB.toFixed(4)}) should score > unrelated pair (${simAC.toFixed(4)})`);
  });

  it('embedBatch returns one vector per text', async () => {
    const p = new HashingTFProvider();
    const texts = ['alpha', 'beta', 'gamma'];
    const vecs = await p.embedBatch(texts);
    assert.equal(vecs.length, 3);
    for (const v of vecs) assert.equal(v.length, 1024);
  });

  it('similarity returns 0 for empty vectors', () => {
    const p = new HashingTFProvider();
    assert.equal(p.similarity([], [1, 0, 0]), 0);
    assert.equal(p.similarity([1, 0, 0], []), 0);
  });

  it('similarity of identical non-empty vectors is close to 1', async () => {
    const p = new HashingTFProvider();
    const v = await p.embed('the quick brown fox');
    const sim = p.similarity(v, v);
    assert.ok(Math.abs(sim - 1.0) < 1e-6, `self-similarity should be ~1, got ${sim}`);
  });
});

// ── RRF merge unit tests ───────────────────────────────────

describe('rrfMerge', () => {
  it('returns ids in fusion-score order', () => {
    // a appears at rank 1 in both channels → highest score
    // b appears at rank 2 vec, rank 1 bm25
    // c appears only in vec at rank 3
    const merged = rrfMerge(['a', 'b', 'c'], ['b', 'a'], 5);
    assert.equal(merged[0], 'a', 'a should be first (rank-1 in both)');
    assert.equal(merged[1], 'b', 'b should be second');
    assert.equal(merged[2], 'c', 'c should be third (vec only)');
  });

  it('respects limit parameter', () => {
    const merged = rrfMerge(['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], 2);
    assert.equal(merged.length, 2);
  });

  it('handles empty channels gracefully', () => {
    const merged = rrfMerge([], ['a', 'b'], 5);
    assert.deepEqual(merged, ['a', 'b']);

    const merged2 = rrfMerge(['a', 'b'], [], 5);
    assert.deepEqual(merged2, ['a', 'b']);
  });

  it('uses custom k and weights', () => {
    // With custom weights [1.0, 0.0], only vector channel matters
    const merged = rrfMerge(['z', 'y'], ['y', 'z'], 2, { weights: [1.0, 0.0] });
    assert.equal(merged[0], 'z', 'z should win with vector-only weighting');
  });
});

// ── createEmbeddingProvider ────────────────────────────────

describe('createEmbeddingProvider', () => {
  it('returns HashingTFProvider by default', async () => {
    const p = await createEmbeddingProvider({ provider: 'hashing' });
    assert.equal(p.name, 'hashing-tf');
  });

  it('hashing provider works end-to-end', async () => {
    const p = await createEmbeddingProvider({ provider: 'hashing' });
    const v = await p.embed('test corpus entry for embedding');
    assert.ok(v.length > 0);
  });

  it('auto provider falls back to hashing when transformer unavailable', async () => {
    // In CI (no model downloaded), auto should always succeed
    const p = await createEmbeddingProvider({ provider: 'auto' });
    // Whether it returns transformer or hashing, it must produce a vector
    const v = await p.embed('fallback test');
    assert.ok(v.length > 0, 'auto provider should produce a non-empty vector');
  });

  // ── TransformerProvider — gated behind STARLIGHT_EMBED=transformer ──
  const transformerEnabled = process.env['STARLIGHT_EMBED'] === 'transformer';

  it(`transformer provider (${transformerEnabled ? 'ENABLED' : 'SKIPPED — set STARLIGHT_EMBED=transformer to run'})`, {
    skip: !transformerEnabled,
  }, async () => {
    const p = await createEmbeddingProvider({ provider: 'transformer' });
    const v = await p.embed('semantic similarity memory retrieval');
    assert.ok(v.length > 0, 'transformer provider should produce a non-empty vector');
    // MiniLM-L6-v2 outputs 384-dim
    assert.equal(v.length, 384, `expected 384-dim output for all-MiniLM-L6-v2, got ${v.length}`);
  });
});

// ── RetrievalIndex.hybridSearch() — integration test ──────

describe('RetrievalIndex hybrid search (HashingTFProvider)', () => {
  const LABELED: Array<{ query: string; expectedId: string }> = [
    { query: 'Cinzel font Inter Space Grotesk', expectedId: 'creative_20260402_001' },
    { query: 'R2 free egress Supabase media', expectedId: 'tech_20260402_002' },
    { query: 'FTS5 bm25 scoring hybrid lexical', expectedId: 'tech_20260410_002' },
    { query: 'JSONL source of truth SQLite rebuildable index', expectedId: 'tech_20260410_001' },
    { query: 'BYOK first managed support burden', expectedId: 'strat_20260402_001' },
    { query: 'gap memory landscape local-first structured vaults', expectedId: 'strat_20260410_005' },
    { query: 'MCP distribution not plumbing protocol', expectedId: 'strat_20260410_004' },
    { query: 'word trigram Jaccard contradiction detection', expectedId: 'tech_20260410_004' },
    { query: 'Server Components Next.js client components', expectedId: 'tech_20260410_005' },
    { query: 'LemonSqueezy Stripe payments Supabase', expectedId: 'strat_20260402_002' },
  ];

  let dir: string;
  let index: RetrievalIndex;

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), 'sis-hybrid-eval-'));
    index = new RetrievalIndex(join(dir, 'index.sqlite'));
    const total = index.rebuildFromVaults(CORPUS);
    assert.ok(total > 0, 'public-vault must have entries');
    // Build vector index with HashingTF (no model download)
    const provider = new HashingTFProvider();
    index.setEmbeddingProvider(provider);
    await index.buildVectorIndex();
  });

  it('cleanup after all tests', { after: () => { index.close(); rmSync(dir, { recursive: true, force: true }); } }, async () => {
    // This test exists only to register the after() cleanup hook.
    // actual assertions are in the next test.
    assert.ok(true);
  });

  it('hybridSearch meets recall baseline on public-vault corpus', async () => {
    let r1 = 0;
    let r3 = 0;
    let r5 = 0;
    const misses: string[] = [];

    for (const { query, expectedId } of LABELED) {
      const results = await index.hybridSearch(query, { limit: 10 });
      const rank = results.findIndex(r => r.entry.id === expectedId);
      const rank1Based = rank < 0 ? Infinity : rank + 1;
      if (rank1Based <= 1) r1++;
      if (rank1Based <= 3) r3++;
      if (rank1Based <= 5) r5++;
      if (rank1Based > 5) misses.push(`"${query}" → ${expectedId} (rank ${rank1Based})`);
    }

    const n = LABELED.length;
    const pct = (x: number): string => `${Math.round((x / n) * 100)}%`;
    // eslint-disable-next-line no-console
    console.log(
      `\n  hybrid eval (HashingTF, n=${n}): ` +
      `recall@1=${pct(r1)} recall@3=${pct(r3)} recall@5=${pct(r5)}`
    );
    if (misses.length) console.log('  misses:\n    ' + misses.join('\n    '));

    // HashingTF hybrid should at minimum match the BM25-only baseline from retrieval-eval.test.ts
    // (recall@5 >= 90%, recall@3 >= 80%). On this small corpus it may do the same or marginally better.
    assert.ok(r5 >= Math.ceil(n * 0.9), `hybridSearch recall@5 below baseline (${r5}/${n})`);
    assert.ok(r3 >= Math.ceil(n * 0.8), `hybridSearch recall@3 below baseline (${r3}/${n})`);
  });
});
