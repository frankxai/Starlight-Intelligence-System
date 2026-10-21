/**
 * Starlight Intelligence System — Memory Eval Harness Unit Tests
 * Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)
 *
 * Verifies:
 *   - readSovereignAtoms: flat and nested atom JSONL schemas, fallbacks, malformed line tolerance
 *   - readEvalQueries: query parsing, field normalization, missing field skips
 *   - runMemoryEval:
 *     - unavailable status when corpus or query set is missing
 *     - full hybrid-rrf evaluation, metrics (hit10, recall5, precision10, mrr10, latency percentiles)
 *     - byClass stratification and sample tracking
 *     - options.limit and custom path overrides
 *   - Integration with canonical eval-50.jsonl if present in repo
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readSovereignAtoms,
  readEvalQueries,
  runMemoryEval,
} from "../src/memory-eval.js";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

describe("readSovereignAtoms", () => {
  it("returns empty array for non-existent path", () => {
    const result = readSovereignAtoms("/nonexistent/atoms.jsonl");
    assert.deepEqual(result, []);
  });

  it("parses flat and nested atom rows with text/content fallbacks and tolerates malformed rows", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-atoms-"));
    const filePath = join(tmp, "atoms.jsonl");

    const lines = [
      // Standard flat row
      JSON.stringify({
        id: "atom-1",
        text: "Sovereign memory is local-first and append-only.",
        namespace: "sis:sovereign",
        source: "vault-sync",
      }),
      "", // empty line should be skipped
      // Nested atom object with content instead of text
      JSON.stringify({
        atom: {
          id: "atom-2",
          content: "Hybrid RRF combines lexical and n-gram representations.",
          namespace: "sis:retrieval",
        },
      }),
      "not valid json {{{", // malformed line should be skipped safely
      // Missing id fallback to atom_${index}
      JSON.stringify({
        text: "Zero-dependency deterministic retrieval scoring.",
      }),
      // Row with neither text nor content should be skipped
      JSON.stringify({
        id: "atom-empty",
        namespace: "empty",
      }),
    ];

    try {
      writeFileSync(filePath, lines.join("\n") + "\n");
      const atoms = readSovereignAtoms(filePath);

      assert.equal(atoms.length, 3, "Should parse exactly 3 valid atom rows");
      assert.deepEqual(atoms[0], {
        id: "atom-1",
        text: "Sovereign memory is local-first and append-only.",
        namespace: "sis:sovereign",
        source: "vault-sync",
      });
      assert.deepEqual(atoms[1], {
        id: "atom-2",
        text: "Hybrid RRF combines lexical and n-gram representations.",
        namespace: "sis:retrieval",
        source: undefined,
      });
      assert.equal(atoms[2].id, "atom_2");
      assert.equal(atoms[2].text, "Zero-dependency deterministic retrieval scoring.");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("readEvalQueries", () => {
  it("returns empty array for non-existent path", () => {
    const result = readEvalQueries("/nonexistent/queries.jsonl");
    assert.deepEqual(result, []);
  });

  it("parses eval queries and skips malformed or incomplete entries", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-queries-"));
    const filePath = join(tmp, "eval-queries.jsonl");

    const lines = [
      // Complete valid query
      JSON.stringify({
        id: "q-101",
        query_text: "How does SIS handle local-first memory?",
        expected_match: "Sovereign memory is local-first and append-only",
        query_class: "foundational",
        vault: "strategic",
        seed_memory: "seed_001",
      }),
      "", // blank line
      // Query missing expected_match (should be skipped)
      JSON.stringify({
        id: "q-bad",
        query_text: "Incomplete query",
      }),
      // Query missing query_text (should be skipped)
      JSON.stringify({
        id: "q-bad-2",
        expected_match: "Match without query",
      }),
      // Valid minimal query
      JSON.stringify({
        id: "q-102",
        query_text: "What scoring algorithm is used for hybrid search?",
        expected_match: "Hybrid RRF combines lexical and n-gram",
      }),
      "MALFORMED JSON LINE",
    ];

    try {
      writeFileSync(filePath, lines.join("\n") + "\n");
      const queries = readEvalQueries(filePath);

      assert.equal(queries.length, 2, "Should parse exactly 2 valid queries");
      assert.deepEqual(queries[0], {
        id: "q-101",
        queryText: "How does SIS handle local-first memory?",
        expectedMatch: "Sovereign memory is local-first and append-only",
        queryClass: "foundational",
        vault: "strategic",
        seedMemory: "seed_001",
      });
      assert.equal(queries[1].id, "q-102");
      assert.equal(queries[1].queryClass, undefined);
      assert.equal(queries[1].vault, undefined);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("reads shipped eval-50.jsonl if present in repository", () => {
    const canonicalPath = join(REPO_ROOT, "docs", "research", "_factory", "memory-foundations-phase0", "eval-50.jsonl");
    if (existsSync(canonicalPath)) {
      const queries = readEvalQueries(canonicalPath);
      assert.ok(queries.length >= 40, `eval-50.jsonl should have at least 40 queries, parsed: ${queries.length}`);
      assert.ok(queries[0].id, "Query should have an id");
      assert.ok(queries[0].queryText, "Query should have queryText");
      assert.ok(queries[0].expectedMatch, "Query should have expectedMatch");
    }
  });
});

describe("runMemoryEval", () => {
  it("returns available=false when either atoms or queries are absent", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-eval-empty-"));
    try {
      const result = runMemoryEval(tmp, {
        atomsPath: join(tmp, "nonexistent-atoms.jsonl"),
        evalPath: join(tmp, "nonexistent-eval.jsonl"),
      });

      assert.equal(result.available, false);
      assert.equal(result.reason, "Missing live sovereign atoms or eval-50 query set");
      assert.equal(result.corpus.atoms, 0);
      assert.equal(result.corpus.queries, 0);
      assert.equal(result.retrieval.mode, "hybrid-rrf");
      assert.deepEqual(result.retrieval.channels, [
        "lexical-token-overlap",
        "semantic-token-ngram",
      ]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("performs full hybrid-rrf retrieval evaluation on synthetic corpus", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-eval-full-"));
    const atomsPath = join(tmp, "atoms.jsonl");
    const evalPath = join(tmp, "eval.jsonl");

    const sampleAtoms = [
      {
        id: "atom-auth-1",
        text: "Cryptographic hardware token authentication protects all sovereign workpacket transactions.",
        namespace: "security",
      },
      {
        id: "atom-auth-2",
        text: "Session verification relies on public key signatures and nonces to prevent replay attacks.",
        namespace: "security",
      },
      {
        id: "atom-perf-1",
        text: "Distributed cache invalidation runs asynchronously using background queue workers.",
        namespace: "performance",
      },
      {
        id: "atom-perf-2",
        text: "Database indexes are optimized using B-tree indexing for low-latency queries.",
        namespace: "performance",
      },
      {
        id: "atom-arch-1",
        text: "Memory architecture maintains six semantic vaults for structured persistence.",
        namespace: "architecture",
      },
    ];

    const sampleQueries = [
      {
        id: "q-1",
        query_text: "hardware token authentication sovereign transactions",
        expected_match: "Cryptographic hardware token authentication protects sovereign transactions",
        query_class: "security",
      },
      {
        id: "q-2",
        query_text: "distributed cache invalidation background workers",
        expected_match: "Distributed cache invalidation runs asynchronously background queue workers",
        query_class: "performance",
      },
      {
        id: "q-3",
        query_text: "semantic vaults structured persistence architecture",
        expected_match: "Memory architecture maintains six semantic vaults for structured persistence",
        query_class: "architecture",
      },
    ];

    try {
      writeFileSync(atomsPath, sampleAtoms.map((a) => JSON.stringify(a)).join("\n") + "\n");
      writeFileSync(evalPath, sampleQueries.map((q) => JSON.stringify(q)).join("\n") + "\n");

      const result = runMemoryEval(tmp, { atomsPath, evalPath });

      assert.equal(result.available, true);
      assert.equal(result.corpus.atoms, 5);
      assert.equal(result.corpus.queries, 3);
      assert.ok(result.metrics, "Metrics should be present when available=true");

      const { hit10, recall5, precision10, mrr10, latencyMs } = result.metrics;
      assert.ok(hit10 >= 0 && hit10 <= 1, `hit10 (${hit10}) must be between 0 and 1`);
      assert.ok(recall5 >= 0 && recall5 <= 1, `recall5 (${recall5}) must be between 0 and 1`);
      assert.ok(precision10 >= 0 && precision10 <= 1, `precision10 (${precision10}) must be between 0 and 1`);
      assert.ok(mrr10 >= 0 && mrr10 <= 1, `mrr10 (${mrr10}) must be between 0 and 1`);

      // All 3 queries should achieve hit10=1 and high MRR with exact matching atoms
      assert.equal(hit10, 1.0, "All target queries should be hit in top 10");
      assert.equal(recall5, 1.0, "All target queries should be recalled in top 5");
      assert.ok(mrr10 >= 0.8, `MRR should be >= 0.8, got ${mrr10}`);

      // Latencies
      assert.ok(latencyMs.p50 >= 0);
      assert.ok(latencyMs.p95 >= 0);
      assert.ok(latencyMs.max >= 0);

      // byClass aggregation
      assert.ok(result.byClass);
      assert.ok(result.byClass.security);
      assert.equal(result.byClass.security.queries, 1);
      assert.equal(result.byClass.security.hit10, 1.0);
      assert.ok(result.byClass.performance);
      assert.equal(result.byClass.performance.queries, 1);
      assert.ok(result.byClass.architecture);
      assert.equal(result.byClass.architecture.queries, 1);

      // Samples
      assert.ok(Array.isArray(result.samples));
      assert.equal(result.samples.length, 3);
      assert.equal(result.samples[0].id, "q-1");
      assert.equal(result.samples[0].queryClass, "security");
      assert.equal(result.samples[0].topRank, 1);
      assert.ok(result.samples[0].topIds.includes("atom-auth-1"));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("respects options.limit to bound evaluated query count", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-eval-limit-"));
    const atomsPath = join(tmp, "atoms.jsonl");
    const evalPath = join(tmp, "eval.jsonl");

    const sampleAtoms = [
      { id: "a-1", text: "Alpha system token" },
      { id: "a-2", text: "Beta system token" },
    ];
    const sampleQueries = [
      { id: "q-1", query_text: "alpha token", expected_match: "Alpha system token" },
      { id: "q-2", query_text: "beta token", expected_match: "Beta system token" },
      { id: "q-3", query_text: "gamma token", expected_match: "Gamma system token" },
      { id: "q-4", query_text: "delta token", expected_match: "Delta system token" },
    ];

    try {
      writeFileSync(atomsPath, sampleAtoms.map((a) => JSON.stringify(a)).join("\n") + "\n");
      writeFileSync(evalPath, sampleQueries.map((q) => JSON.stringify(q)).join("\n") + "\n");

      const result = runMemoryEval(tmp, { atomsPath, evalPath, limit: 2 });
      assert.equal(result.available, true);
      assert.equal(result.corpus.queries, 2, "limit=2 must evaluate only 2 queries");
      assert.equal(result.samples?.length, 2);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
