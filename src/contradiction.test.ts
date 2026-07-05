/**
 * ContradictionDetector — no dedicated coverage existed before this file.
 * Pins the behavior DreamingAgent.detectContradictions() depends on:
 *   - similarity() boosts opposing-polarity pairs, capped at 1.0.
 *   - scanVaults() gates on minSimilarity and never pairs same-vault entries.
 *   - scanVaults({ excludeVaults }) drops entries from named vaults entirely —
 *     the mechanism DreamingAgent uses to exclude "wisdom" (a vault whose
 *     entries are verbatim promoted copies of their own source, so comparing
 *     wisdom back against its source is a guaranteed self-match, not a real
 *     contradiction).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { ContradictionDetector } from "./contradiction.js";

function withTempDir(prefix: string, fn: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("ContradictionDetector.similarity", () => {
  it("scores identical text at 1.0", () => {
    const d = new ContradictionDetector();
    assert.equal(d.similarity("always cache the index for speed", "always cache the index for speed"), 1);
  });

  it("boosts a same-topic pair with opposing polarity terms", () => {
    const d = new ContradictionDetector();
    const withoutOpposing = d.similarity("cache the shared index between sessions", "index the shared cache between sessions");
    const withOpposing = d.similarity("always cache the shared index between sessions", "never cache the shared index between sessions");
    assert.ok(withOpposing > withoutOpposing, "opposing-polarity pair scores higher than a neutral rewording of similar length");
  });

  it("returns 0 for texts under the 3-token floor", () => {
    const d = new ContradictionDetector();
    assert.equal(d.similarity("hi there", "yo friend"), 0);
  });
});

describe("ContradictionDetector.scanVaults", () => {
  it("never pairs two entries from the same vault", () => {
    withTempDir("sis-contra-samevault-", (dir) => {
      writeFileSync(join(dir, "technical.jsonl"),
        [
          JSON.stringify({ id: "a", vault: "technical", insight: "always run migrations before deploy", createdAt: "2026-01-01T00:00:00Z" }),
          JSON.stringify({ id: "b", vault: "technical", insight: "never run migrations before deploy", createdAt: "2026-01-01T00:00:00Z" }),
        ].join("\n") + "\n");
      const d = new ContradictionDetector();
      const results = d.scanVaults(dir, { minSimilarity: 0.1 });
      assert.equal(results.length, 0, "same-vault entries are never compared, however similar");
    });
  });

  it("finds a genuine cross-vault opposing pair at a real-world MD-doc threshold", () => {
    withTempDir("sis-contra-md-", (dir) => {
      // Section-per-heading MD format, same shape as memory/vaults/*.md.
      writeFileSync(join(dir, "strategic-vault.md"),
        "---\ntype: vault\nvault: strategic\n---\n\n" +
        "## Deploy policy\n\nAlways ship the closed beta before opening the public registry, to protect early trust.\n");
      writeFileSync(join(dir, "technical-vault.md"),
        "---\ntype: vault\nvault: technical\n---\n\n" +
        "## Deploy policy\n\nNever ship the closed beta before opening the public registry, launch in the open from day one.\n");

      const d = new ContradictionDetector();
      const results = d.scanVaults(dir, { minSimilarity: 0.4 });
      assert.equal(results.length, 1, "the opposing deploy-policy pair crosses the calibrated 0.4 threshold");
      assert.ok(results[0].similarity >= 0.4);
    });
  });

  it("excludeVaults drops a named vault's entries from every comparison", () => {
    withTempDir("sis-contra-exclude-", (dir) => {
      writeFileSync(join(dir, "strategic-vault.md"),
        "---\ntype: vault\nvault: strategic\n---\n\n" +
        "## Deploy policy\n\nAlways ship the closed beta before opening the public registry, to protect early trust.\n");
      writeFileSync(join(dir, "wisdom-vault.md"),
        "---\ntype: vault\nvault: wisdom\n---\n\n" +
        "## Deploy policy\n\nAlways ship the closed beta before opening the public registry, to protect early trust.\n");

      const d = new ContradictionDetector();
      const withWisdom = d.scanVaults(dir, { minSimilarity: 0.4 });
      assert.equal(withWisdom.length, 1, "sanity: identical text across two vaults matches without exclusion");

      const withoutWisdom = d.scanVaults(dir, { minSimilarity: 0.4, excludeVaults: ["wisdom"] });
      assert.equal(withoutWisdom.length, 0, "excluding wisdom removes its guaranteed self-match against its own source");
    });
  });
});

// Built on SIP — operational tier (test coverage for ContradictionDetector).
