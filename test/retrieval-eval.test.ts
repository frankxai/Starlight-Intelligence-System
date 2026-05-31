/**
 * Retrieval eval — keyword (FTS5 + bm25) recall@k baseline.
 *
 * The README asserts "SQLite FTS5 with bm25 beats embeddings for <10k entries."
 * That claim was previously unmeasured. This eval grounds it: it indexes the
 * shipped `public-vault/*.jsonl` corpus with the real `RetrievalIndex` (the
 * same code path the operational layer uses) and runs a small labeled query set
 * where each query has a known relevant entry id, then reports recall@1/3/5.
 *
 * When a semantic layer is added later (sqlite-vec, see
 * docs/bring-your-own-model.md), this same harness can score the hybrid path
 * head-to-head against this keyword baseline — so "best of its kind" becomes a
 * measured claim, not an asserted one.
 *
 * Built on SIP — operational tier (retrieval eval).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { RetrievalIndex } from "../src/retrieval.js";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const CORPUS = join(REPO_ROOT, "public-vault");

/**
 * Labeled queries: natural-language query → the entry id a good keyword index
 * should surface near the top. Drawn from the shipped public-vault corpus.
 */
const LABELED: Array<{ query: string; expectedId: string }> = [
  { query: "Cinzel font Inter Space Grotesk", expectedId: "creative_20260402_001" },
  { query: "R2 free egress Supabase media", expectedId: "tech_20260402_002" },
  { query: "FTS5 bm25 scoring hybrid lexical", expectedId: "tech_20260410_002" },
  { query: "JSONL source of truth SQLite rebuildable index", expectedId: "tech_20260410_001" },
  { query: "BYOK first managed support burden", expectedId: "strat_20260402_001" },
  { query: "gap memory landscape local-first structured vaults", expectedId: "strat_20260410_005" },
  { query: "MCP distribution not plumbing protocol", expectedId: "strat_20260410_004" },
  { query: "word trigram Jaccard contradiction detection", expectedId: "tech_20260410_004" },
  { query: "Server Components Next.js client components", expectedId: "tech_20260410_005" },
  { query: "LemonSqueezy Stripe payments Supabase", expectedId: "strat_20260402_002" },
];

function rankOf(index: RetrievalIndex, query: string, expectedId: string): number {
  const results = index.search(query, { limit: 10 });
  const idx = results.findIndex((r) => r.entry.id === expectedId);
  return idx < 0 ? Infinity : idx + 1; // 1-based rank, Infinity if absent
}

describe("retrieval eval — keyword FTS5 recall@k", () => {
  it("meets a recall baseline on the public-vault corpus", () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-eval-"));
    try {
      const index = new RetrievalIndex(join(dir, "index.sqlite"));
      const total = index.rebuildFromVaults(CORPUS);
      assert.ok(total > 0, "corpus indexed with at least one entry");

      let r1 = 0;
      let r3 = 0;
      let r5 = 0;
      const misses: string[] = [];
      for (const { query, expectedId } of LABELED) {
        const rank = rankOf(index, query, expectedId);
        if (rank <= 1) r1++;
        if (rank <= 3) r3++;
        if (rank <= 5) r5++;
        if (rank > 5) misses.push(`"${query}" → ${expectedId} (rank ${rank})`);
      }
      index.close();

      const n = LABELED.length;
      const pct = (x: number) => `${Math.round((x / n) * 100)}%`;
      // eslint-disable-next-line no-console
      console.log(
        `\n  retrieval eval (n=${n}, corpus=${total} entries): ` +
        `recall@1=${pct(r1)} recall@3=${pct(r3)} recall@5=${pct(r5)}`,
      );
      if (misses.length) console.log("  misses:\n    " + misses.join("\n    "));

      // Baseline thresholds — keyword retrieval should comfortably clear these
      // on a clean, lexically-distinct corpus. Tightening these later guards
      // against silent retrieval regressions.
      assert.ok(r5 >= Math.ceil(n * 0.9), `recall@5 below baseline (${r5}/${n})`);
      assert.ok(r3 >= Math.ceil(n * 0.8), `recall@3 below baseline (${r3}/${n})`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
