/**
 * v9.5 Dreaming Persistence — the write side of a dream cycle must be durable
 * and idempotent.
 *
 * Before v9.5, DreamingAgent.dream() identified promotions/insights/contradictions
 * and the runner logged their COUNTS — but persisted nothing. applyDreamResult
 * closes that gap. This suite pins the three durability contracts:
 *   - PROMOTIONS  → append `wis_promo_<sourceId>` to wisdom.jsonl with provenance;
 *                   ledger-guarded so a source is promoted at most once, ever.
 *                   Works for both JSONL atoms and `md:*` vault-doc sections —
 *                   the promotion carries its own source text inline, so no
 *                   separate atom-index lookup (and no format-based skip) is
 *                   needed at persistence time.
 *   - INSIGHTS    → append to <suggestedVault>.jsonl with a content-hash id, so a
 *                   repeated run never materializes the same insight twice.
 *   - CONTRADICTIONS → overwrite contradictions.jsonl each run (report, not ledger).
 *
 * Built on SIP — operational tier (memory persistence).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { applyDreamResult, type DreamResult } from "../src/dreaming.js";
import type { Contradiction } from "../src/contradiction.js";

function withTempDir(prefix: string, fn: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const now = () => new Date().toISOString();

/** Read a JSONL file into parsed records (empty array if absent/empty). */
function readJsonl(filePath: string): Array<Record<string, unknown>> {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Record<string, unknown>);
}

/** A DreamResult with one promotable JSONL atom, one insight, one contradiction. */
function seedResult(): DreamResult {
  const contradiction: Contradiction = {
    entryA: { id: "t1", vault: "technical", content: "always cache the index", createdAt: now() },
    entryB: { id: "s1", vault: "strategic", content: "never cache the index", createdAt: now() },
    similarity: 0.72,
    type: "potential",
    detectedAt: now(),
  };
  return {
    extractedInsights: [
      { content: "High-output session: 7 commits", suggestedVault: "operational", confidence: 0.8, source: "sess-a.json" },
    ],
    contradictions: [contradiction],
    promotions: [
      { entryId: "t1", fromVault: "technical", toVault: "wisdom",
        reason: "Cross-vault pattern: found in technical + operational",
        content: "Read the file before editing it to avoid clobbering concurrent state" },
    ],
    processedFiles: 1,
    timestamp: now(),
  };
}

/** Lay down the source atoms a promotion needs to resolve its text. */
function seedVault(dir: string): void {
  writeFileSync(join(dir, "technical.jsonl"), JSON.stringify({
    id: "t1", vault: "technical", createdAt: now(),
    content: "Read the file before editing it to avoid clobbering concurrent state",
  }) + "\n");
  writeFileSync(join(dir, "operational.jsonl"), JSON.stringify({
    id: "o1", vault: "operational", createdAt: now(),
    insight: "Read the file before editing it to avoid clobbering concurrent state",
  }) + "\n");
}

describe("applyDreamResult — promotions land in wisdom.jsonl with provenance", () => {
  it("appends a promoted atom carrying source text + provenance metadata", () => {
    withTempDir("sis-v95-promo-", (dir) => {
      seedVault(dir);
      const stats = applyDreamResult(seedResult(), dir);

      assert.equal(stats.promotionsWritten, 1);
      const wisdom = readJsonl(join(dir, "wisdom.jsonl"));
      const promo = wisdom.find((a) => a.id === "wis_promo_t1");
      assert.ok(promo, "wis_promo_t1 atom must exist");
      assert.equal(promo!.vault, "wisdom");
      assert.equal(promo!.content, "Read the file before editing it to avoid clobbering concurrent state");
      assert.equal(promo!.category, "insight");
      assert.equal(promo!.confidence, "high");
      assert.equal(promo!.source, "dreaming-promotion");
      const meta = promo!.metadata as Record<string, unknown>;
      assert.equal(meta.promotedFrom, "technical");
      assert.equal(meta.sourceId, "t1");
      assert.match(String(meta.reason), /Cross-vault pattern/);

      // Ledger records the promoted source id.
      const ledger = JSON.parse(readFileSync(join(dir, ".promotion-ledger.json"), "utf-8")) as string[];
      assert.deepEqual(ledger, ["t1"]);
    });
  });

  it("promotes md:* vault-doc sections using their own inline content", () => {
    withTempDir("sis-v95-md-", (dir) => {
      seedVault(dir);
      const result = seedResult();
      result.promotions.push({
        entryId: "md:strategic-vault.md#2", fromVault: "strategic", toVault: "wisdom",
        reason: "chunk overlap", content: "Never ship the closed beta without a rollback plan.",
      });
      const stats = applyDreamResult(result, dir);

      assert.equal(stats.promotionsWritten, 2, "both the JSONL atom and the MD chunk are promoted");
      const wisdom = readJsonl(join(dir, "wisdom.jsonl"));
      const mdPromo = wisdom.find((a) => String(a.id).includes("md:"));
      assert.ok(mdPromo, "the md:* chunk reaches wisdom.jsonl");
      assert.equal(mdPromo!.content, "Never ship the closed beta without a rollback plan.");
      assert.equal((mdPromo!.metadata as Record<string, unknown>).sourceId, "md:strategic-vault.md#2");
    });
  });

  it("skips a promotion with no content (nothing real to promote)", () => {
    withTempDir("sis-v95-nocontent-", (dir) => {
      seedVault(dir);
      const result = seedResult();
      result.promotions = [{ entryId: "ghost", fromVault: "strategic", toVault: "wisdom", reason: "unresolvable", content: "" }];
      const stats = applyDreamResult(result, dir);

      assert.equal(stats.promotionsWritten, 0);
      assert.equal(stats.promotionsSkipped, 1);
    });
  });

  it("is idempotent — a second run promotes nothing new (ledger works)", () => {
    withTempDir("sis-v95-promo-idem-", (dir) => {
      seedVault(dir);
      applyDreamResult(seedResult(), dir);
      const stats2 = applyDreamResult(seedResult(), dir);

      assert.equal(stats2.promotionsWritten, 0);
      assert.equal(stats2.promotionsSkipped, 1);
      const wisdom = readJsonl(join(dir, "wisdom.jsonl"));
      const promos = wisdom.filter((a) => a.id === "wis_promo_t1");
      assert.equal(promos.length, 1, "no duplicate promotion after re-run");
    });
  });
});

describe("applyDreamResult — insights materialize idempotently", () => {
  it("appends an insight atom to the suggested vault with a hash id", () => {
    withTempDir("sis-v95-insight-", (dir) => {
      seedVault(dir);
      const stats = applyDreamResult(seedResult(), dir);

      assert.equal(stats.insightsWritten, 1);
      const operational = readJsonl(join(dir, "operational.jsonl"));
      const insight = operational.find((a) => a.source === "dreaming-insight");
      assert.ok(insight, "an insight atom is appended to operational.jsonl");
      assert.match(String(insight!.id), /^ins_[0-9a-f]{16}$/);
      assert.equal(insight!.content, "High-output session: 7 commits");
      assert.equal((insight!.metadata as Record<string, unknown>).originSource, "sess-a.json");
      // The pre-existing atom is untouched.
      assert.ok(operational.some((a) => a.id === "o1"), "existing atoms are preserved");
    });
  });

  it("does not duplicate an insight on a second run (content-hash id)", () => {
    withTempDir("sis-v95-insight-idem-", (dir) => {
      seedVault(dir);
      applyDreamResult(seedResult(), dir);
      const stats2 = applyDreamResult(seedResult(), dir);

      assert.equal(stats2.insightsWritten, 0);
      assert.equal(stats2.insightsSkipped, 1);
      const materialized = readJsonl(join(dir, "operational.jsonl")).filter((a) => a.source === "dreaming-insight");
      assert.equal(materialized.length, 1, "insight materialized exactly once across runs");
    });
  });
});

describe("applyDreamResult — contradictions are a report, overwritten each run", () => {
  it("writes contradictions.jsonl and rewrites (not appends) on re-run", () => {
    withTempDir("sis-v95-contra-", (dir) => {
      seedVault(dir);
      const stats = applyDreamResult(seedResult(), dir);
      assert.equal(stats.contradictionsWritten, 1);

      let rows = readJsonl(join(dir, "contradictions.jsonl"));
      assert.equal(rows.length, 1);
      assert.equal((rows[0].entryA as Record<string, unknown>).id, "t1");

      // Second run with an empty contradiction list must overwrite to empty.
      const empty = seedResult();
      empty.contradictions = [];
      applyDreamResult(empty, dir);
      rows = readJsonl(join(dir, "contradictions.jsonl"));
      assert.equal(rows.length, 0, "report reflects the latest run, not an accumulation");
    });
  });
});
