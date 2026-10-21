/**
 * Starlight Intelligence System — Contradiction Detector Unit Tests
 * Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)
 *
 * Verifies:
 *   - Tokenization and word-trigram Jaccard similarity scoring
 *   - Defect fix: 'do' removed from POS directives (no false opposing-polarity boost on questions)
 *   - Defect fix: scanVaults scores and sorts all candidates by similarity descending BEFORE slicing to limit
 *   - Vault entry parsing (JSONL and partitioned Markdown formats)
 *   - checkEntry ad-hoc contradiction evaluation against existing corpus
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ContradictionDetector } from "../src/contradiction.js";

describe("ContradictionDetector — similarity and polarity logic", () => {
  const detector = new ContradictionDetector();

  it("returns 0 for short phrases with fewer than 3 tokens", () => {
    assert.equal(detector.similarity("yes", "no"), 0);
    assert.equal(detector.similarity("short phrase", "other short"), 0);
  });

  it("computes accurate trigram Jaccard similarity for overlapping texts", () => {
    const textA = "alpha beta gamma delta epsilon zeta eta theta iota kappa";
    const textB = "alpha beta gamma delta epsilon zeta eta theta iota kappa";
    const score = detector.similarity(textA, textB);
    assert.equal(score, 1);

    const disjointA = "one two three four five six seven";
    const disjointB = "red green blue purple orange yellow brown";
    assert.equal(detector.similarity(disjointA, disjointB), 0);
  });

  it("DEFECT FIX: does not give 'do' questions a false opposing polarity boost", () => {
    // Sentence A is a question containing 'do' (interrogative / auxiliary).
    // Sentence B contains a negative word 'never', but A is not an imperative positive directive.
    const questionText = "Alpha beta gamma delta epsilon zeta eta do we support user session tokens in cache";
    const statementNeg = "Alpha beta gamma delta epsilon zeta eta we never support user session tokens in cache";

    // With 'do' removed from POS, questionText has no positive directive.
    // Base trigram similarity is 9/17 = 0.529. Without opposing boost, it remains 0.529.
    const scoreQuestion = detector.similarity(questionText, statementNeg);
    assert.equal(scoreQuestion, 0.529, "Question with 'do' must not receive +0.25 opposing polarity boost");

    // In contrast, with a real directive ('must'), opposing polarity triggers and adds +0.25:
    // Base similarity (10/16 = 0.625) + 0.25 = 0.875
    const directiveText = "Alpha beta gamma delta epsilon zeta eta we must support user session tokens in cache";
    const scoreDirective = detector.similarity(directiveText, statementNeg);
    assert.equal(scoreDirective, 0.875, "Directive with 'must' vs 'never' must receive +0.25 opposing polarity boost");
  });

  it("boosts similarity by 0.25 when true opposing directives ('always' vs 'never') are present", () => {
    const textPos = "We always enable automatic snapshot compaction during nightly memory backup cycles.";
    const textNeg = "We never enable automatic snapshot compaction during nightly memory backup cycles.";
    const score = detector.similarity(textPos, textNeg);
    // Overlapping tokens: enable automatic snapshot compaction during nightly memory backup cycles
    // Base overlap is high, and opposing directives ('always' vs 'never') trigger +0.25 boost.
    assert.ok(score >= 0.85, `Score should be high with opposing boost, got ${score}`);
  });
});

describe("ContradictionDetector — scanVaults sorting and limit", () => {
  it("DEFECT FIX: scores/sorts ALL cross-vault candidate pairs before applying limit", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-contra-sort-"));
    const detector = new ContradictionDetector();

    try {
      // Create entries across two vaults.
      // We create pairs in file order such that lower-similarity pairs appear FIRST,
      // and the highest-similarity pairs appear LAST.
      // The buggy code stopped scanning as soon as results.length == limit,
      // so it would return the first low-similarity pairs and miss the higher ones.

      // Vault 1: strategic
      const stratEntries = [
        // Entry S0: moderate similarity to T0 (~0.62)
        {
          id: "strat-0",
          vault: "strategic",
          createdAt: new Date().toISOString(),
          insight: "We prefer standard distributed transactions across distributed nodes whenever replication latency allows it.",
        },
        // Entry S1: moderate similarity to T1 (~0.65)
        {
          id: "strat-1",
          vault: "strategic",
          createdAt: new Date().toISOString(),
          insight: "Cache invalidation should happen synchronously upon entity modification in all database clusters.",
        },
        // Entry S2: VERY HIGH similarity to T2 (>0.90) — appears LAST in file order
        {
          id: "strat-2",
          vault: "strategic",
          createdAt: new Date().toISOString(),
          insight: "Every sovereign agent must always sign outgoing workpackets with cryptographic hardware keys before transmission.",
        },
      ];

      // Vault 2: technical
      const techEntries = [
        // Entry T0: moderate match to S0
        {
          id: "tech-0",
          vault: "technical",
          createdAt: new Date().toISOString(),
          insight: "We avoid standard distributed transactions across distributed nodes whenever network latency allows it.",
        },
        // Entry T1: moderate match to S1
        {
          id: "tech-1",
          vault: "technical",
          createdAt: new Date().toISOString(),
          insight: "Cache invalidation should happen asynchronously upon entity modification in background queue workers.",
        },
        // Entry T2: VERY HIGH match to S2, with opposing directive ('never' vs 'must always')
        {
          id: "tech-2",
          vault: "technical",
          createdAt: new Date().toISOString(),
          insight: "Every sovereign agent must never sign outgoing workpackets with cryptographic hardware keys before transmission.",
        },
      ];

      writeFileSync(join(tmp, "strategic.jsonl"), stratEntries.map((e) => JSON.stringify(e)).join("\n") + "\n");
      writeFileSync(join(tmp, "technical.jsonl"), techEntries.map((e) => JSON.stringify(e)).join("\n") + "\n");

      // Scan with limit = 1 and minSimilarity = 0.5.
      // Under the defect, the first pair found (S0 vs T0) would be taken and scanning halted.
      // Under the fix, ALL pairs are scored, sorted descending, and S2 vs T2 (highest score) is returned.
      const top1 = detector.scanVaults(tmp, { minSimilarity: 0.5, limit: 1 });
      assert.equal(top1.length, 1, "Should return exactly 1 result with limit=1");
      assert.ok(
        top1[0].entryA.id.includes("strat-2") || top1[0].entryB.id.includes("strat-2"),
        `Top result must be the highest similarity pair (strat-2/tech-2), but got: ${top1[0].entryA.id} & ${top1[0].entryB.id} (sim: ${top1[0].similarity})`,
      );
      assert.ok(top1[0].similarity >= 0.85, `Similarity should be >= 0.85, got ${top1[0].similarity}`);

      // Scan with limit = 2: results must be sorted descending by similarity
      const top2 = detector.scanVaults(tmp, { minSimilarity: 0.5, limit: 2 });
      assert.equal(top2.length, 2, "Should return 2 results with limit=2");
      assert.ok(top2[0].similarity >= top2[1].similarity, "Results must be sorted descending by similarity");
      assert.ok(
        top2[0].entryA.id.includes("strat-2") || top2[0].entryB.id.includes("strat-2"),
        "First of top2 must be strat-2/tech-2",
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("skips entries from the same vault and handles empty/missing directories", () => {
    const detector = new ContradictionDetector();
    assert.deepEqual(detector.scanVaults("/nonexistent/vault/path"), []);

    const tmp = mkdtempSync(join(tmpdir(), "sis-contra-same-"));
    try {
      const sameVaultEntries = [
        { id: "e1", vault: "tech", createdAt: new Date().toISOString(), insight: "All systems require secure memory isolation." },
        { id: "e2", vault: "tech", createdAt: new Date().toISOString(), insight: "All systems require secure memory isolation." },
      ];
      writeFileSync(join(tmp, "tech.jsonl"), sameVaultEntries.map((e) => JSON.stringify(e)).join("\n") + "\n");
      const results = detector.scanVaults(tmp, { minSimilarity: 0.5 });
      assert.equal(results.length, 0, "Intra-vault pairs must not be flagged as cross-vault contradictions");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("supports SIS canonical Markdown vault format partitioned by ### headings", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sis-contra-md-"));
    const detector = new ContradictionDetector();
    try {
      // Long enough sections (>= 100 chars) in .md format
      const mdStrat = `# Strategic Vault\n\n### Core Tenet\nWe always require strict provenance validation on every memory entry before indexing into persistent storage to preserve truth.\n\n### Secondary Tenet\nShort preamble that gets skipped if under one hundred chars.\n`;
      const mdTech = `# Technical Vault\n\n### Provenance Architecture\nWe never require strict provenance validation on every memory entry before indexing into persistent storage to preserve speed.\n`;

      writeFileSync(join(tmp, "strategic-vault.md"), mdStrat);
      writeFileSync(join(tmp, "technical-vault.md"), mdTech);

      const results = detector.scanVaults(tmp, { minSimilarity: 0.6 });
      assert.ok(results.length >= 1, "Should detect cross-vault contradiction between MD sections");
      assert.equal(results[0].entryA.vault, "strategic");
      assert.equal(results[0].entryB.vault, "technical");
      assert.ok(results[0].similarity >= 0.7);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("ContradictionDetector — checkEntry", () => {
  const detector = new ContradictionDetector();

  it("checks candidate content against existing entries and sorts descending", () => {
    const existing = [
      {
        id: "v1-0",
        vault: "creative",
        content: "We must prefer minimal ambient animations that enhance user focus across the entire interface.",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "v2-0",
        vault: "operational",
        content: "We must avoid minimal ambient animations that enhance user focus across the entire interface.",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "v3-0",
        vault: "wisdom",
        content: "Irrelevant content about database query optimization and transaction batching.",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const candidate = "We must prefer minimal ambient animations that enhance user focus across the entire interface.";
    const matches = detector.checkEntry(candidate, "technical", existing);

    assert.ok(matches.length >= 1, "Should find matching contradiction above 0.6 threshold");
    assert.equal(matches[0].entryA.id, "pending");
    assert.equal(matches[0].entryA.vault, "technical");
    assert.equal(matches[0].entryB.vault, "creative");
    assert.equal(matches[0].similarity, 1.0);
    // Verify descending sort if multiple matches
    for (let i = 0; i < matches.length - 1; i++) {
      assert.ok(matches[i].similarity >= matches[i + 1].similarity);
    }
  });

  it("skips existing entries with the same vault", () => {
    const existing = [
      {
        id: "same-1",
        vault: "technical",
        content: "We must ensure deterministic execution across all distributed substrate nodes.",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const matches = detector.checkEntry(
      "We must ensure deterministic execution across all distributed substrate nodes.",
      "technical",
      existing,
    );
    assert.equal(matches.length, 0);
  });
});
