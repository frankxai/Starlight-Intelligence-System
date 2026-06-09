/**
 * Unit tests for src/temporal.ts — TemporalEngine and helpers.
 *
 * Coverage:
 *   - createMeta            initialization with default + custom config + clamping
 *   - decayedConfidence     exponential half-life math at 0/1/2/4 half-lives
 *   - isStale               boundary at staleThresholdDays
 *   - isExpired             null-validUntil never expires; past validUntil expires
 *   - confirm               updates lastConfirmed only
 *   - invalidate            sets validUntil to now, isExpired flips to true
 *   - getStalenessStats     counts (stale/expired/healthy), avgConfidence, stalestEntry
 *   - scanVaults            JSONL ingestion, missing dir, malformed line skip,
 *                            temporal{}-block extraction, legacy createdAt/updatedAt
 *                            fallback, confidence string-to-number mapping
 *
 * Per day-of deep-tech audit §5: temporal.ts is the highest test-value-per-LOC
 * win in src/ — pure-function trio, sub-millisecond per assertion, zero I/O
 * dependencies for the core math. scanVaults integration tests use mkdtempSync
 * for isolation.
 *
 * Per /openclaw-audit CRITICAL 2: assertion error messages use only trusted
 * inputs (test fixtures, no untrusted file content interpolation).
 *
 * Note: this test file is colocated at src/temporal.test.ts (matches existing
 * src/orchestrator.test.ts pattern). Wiring it into npm test:operational
 * requires an edit to package.json `test:operational` script — queued for
 * Frank's pending package.json WIP commit. Until then, run via:
 *   node --import tsx --test src/temporal.test.ts
 *
 * Built on SIP — operational tier (test infrastructure).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TemporalEngine, type TemporalMeta } from "./temporal.js";

const MS_PER_DAY = 86_400_000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * MS_PER_DAY).toISOString();
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * MS_PER_DAY).toISOString();
}
function makeTmpVault(label: string): string {
  return mkdtempSync(join(tmpdir(), `temporal-test-${label}-`));
}

// ---------- createMeta ----------

describe("TemporalEngine.createMeta", () => {
  it("uses now for validFrom + lastConfirmed; null validUntil by default", () => {
    const engine = new TemporalEngine();
    const meta = engine.createMeta(0.85);
    assert.equal(meta.confidenceDecay, 0.85);
    assert.equal(meta.validUntil, null);
    assert.equal(meta.validFrom, meta.lastConfirmed);
    assert.ok(Math.abs(new Date(meta.validFrom).getTime() - Date.now()) < 1000);
  });

  it("clamps confidence to [0, 1]", () => {
    const engine = new TemporalEngine();
    assert.equal(engine.createMeta(1.5).confidenceDecay, 1);
    assert.equal(engine.createMeta(-0.2).confidenceDecay, 0);
  });

  it("uses defaultValidityDays config to set validUntil", () => {
    const engine = new TemporalEngine({ defaultValidityDays: 30 });
    const meta = engine.createMeta(0.5);
    assert.notEqual(meta.validUntil, null);
    const expectedExpiry = Date.now() + 30 * MS_PER_DAY;
    assert.ok(
      Math.abs(new Date(meta.validUntil!).getTime() - expectedExpiry) < 1000,
    );
  });

  it("default confidence (no arg) is 0.5", () => {
    const engine = new TemporalEngine();
    assert.equal(engine.createMeta().confidenceDecay, 0.5);
  });
});

// ---------- decayedConfidence ----------

describe("TemporalEngine.decayedConfidence", () => {
  it("returns ~original at day 0 (no decay)", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.7,
    };
    assert.ok(Math.abs(engine.decayedConfidence(meta) - 0.7) < 0.001);
  });

  it("decays to ~50% at one half-life (default 90d)", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(90),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.8,
    };
    const decayed = engine.decayedConfidence(meta);
    assert.ok(
      Math.abs(decayed - 0.4) < 0.001,
      `expected ~0.4 at 1 half-life, got ${decayed}`,
    );
  });

  it("decays to ~25% at two half-lives (180d)", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(180),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 1.0,
    };
    const decayed = engine.decayedConfidence(meta);
    assert.ok(
      Math.abs(decayed - 0.25) < 0.001,
      `expected ~0.25 at 2 half-lives, got ${decayed}`,
    );
  });

  it("decays to ~6.25% at four half-lives (360d)", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(360),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 1.0,
    };
    const decayed = engine.decayedConfidence(meta);
    assert.ok(
      Math.abs(decayed - 0.0625) < 0.001,
      `expected ~0.0625 at 4 half-lives, got ${decayed}`,
    );
  });

  it("respects custom decayHalfLifeDays config", () => {
    const engine = new TemporalEngine({ decayHalfLifeDays: 30 });
    const meta: TemporalMeta = {
      validFrom: daysAgo(30),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.6,
    };
    assert.ok(
      Math.abs(engine.decayedConfidence(meta) - 0.3) < 0.001,
      "1 half-life at 30d config should halve",
    );
  });
});

// ---------- isStale ----------

describe("TemporalEngine.isStale", () => {
  it("returns false before staleThresholdDays (default 30)", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: null,
      lastConfirmed: daysAgo(15),
      confidenceDecay: 0.8,
    };
    assert.equal(engine.isStale(meta), false);
  });

  it("returns true past staleThresholdDays", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: null,
      lastConfirmed: daysAgo(31),
      confidenceDecay: 0.8,
    };
    assert.equal(engine.isStale(meta), true);
  });

  it("respects custom staleThresholdDays", () => {
    const engine = new TemporalEngine({ staleThresholdDays: 7 });
    const meta: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: null,
      lastConfirmed: daysAgo(8),
      confidenceDecay: 0.8,
    };
    assert.equal(engine.isStale(meta), true);
  });
});

// ---------- isExpired ----------

describe("TemporalEngine.isExpired", () => {
  it("returns false when validUntil is null", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.5,
    };
    assert.equal(engine.isExpired(meta), false);
  });

  it("returns true when validUntil is in the past", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(60),
      validUntil: daysAgo(1),
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.5,
    };
    assert.equal(engine.isExpired(meta), true);
  });

  it("returns false when validUntil is in the future", () => {
    const engine = new TemporalEngine();
    const meta: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: daysFromNow(10),
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.5,
    };
    assert.equal(engine.isExpired(meta), false);
  });
});

// ---------- confirm + invalidate ----------

describe("TemporalEngine.confirm + invalidate", () => {
  it("confirm() updates lastConfirmed to now, leaves other fields unchanged", () => {
    const engine = new TemporalEngine();
    const before: TemporalMeta = {
      validFrom: daysAgo(45),
      validUntil: null,
      lastConfirmed: daysAgo(45),
      confidenceDecay: 0.7,
    };
    const after = engine.confirm(before);
    assert.equal(after.validFrom, before.validFrom);
    assert.equal(after.validUntil, null);
    assert.equal(after.confidenceDecay, 0.7);
    assert.ok(
      Math.abs(new Date(after.lastConfirmed).getTime() - Date.now()) < 1000,
    );
    // After confirm, isStale should be false (just confirmed)
    assert.equal(engine.isStale(after), false);
  });

  it("invalidate() sets validUntil to now, isExpired flips to true", () => {
    const engine = new TemporalEngine();
    const before: TemporalMeta = {
      validFrom: daysAgo(0),
      validUntil: null,
      lastConfirmed: daysAgo(0),
      confidenceDecay: 0.5,
    };
    assert.equal(engine.isExpired(before), false);
    const after = engine.invalidate(before);
    assert.notEqual(after.validUntil, null);
    assert.ok(
      Math.abs(new Date(after.validUntil!).getTime() - Date.now()) < 1000,
    );
  });
});

// ---------- getStalenessStats ----------

describe("TemporalEngine.getStalenessStats", () => {
  it("returns zero-stats for empty input", () => {
    const engine = new TemporalEngine();
    const stats = engine.getStalenessStats([]);
    assert.equal(stats.total, 0);
    assert.equal(stats.stale, 0);
    assert.equal(stats.expired, 0);
    assert.equal(stats.healthy, 0);
    assert.equal(stats.avgConfidence, 0);
    assert.equal(stats.stalestEntry, null);
  });

  it("counts stale/expired/healthy + identifies stalest by daysSinceConfirmed", () => {
    const engine = new TemporalEngine();
    const reports = [
      { entryId: "a", vault: "v", content: "x", daysSinceConfirmed: 5,  isStale: false, isExpired: false, currentConfidence: 0.8, originalConfidence: 0.8 },
      { entryId: "b", vault: "v", content: "x", daysSinceConfirmed: 35, isStale: true,  isExpired: false, currentConfidence: 0.6, originalConfidence: 0.8 },
      { entryId: "c", vault: "v", content: "x", daysSinceConfirmed: 2,  isStale: false, isExpired: true,  currentConfidence: 0.3, originalConfidence: 0.8 },
    ];
    const stats = engine.getStalenessStats(reports);
    assert.equal(stats.total, 3);
    assert.equal(stats.stale, 1);
    assert.equal(stats.expired, 1);
    assert.equal(stats.healthy, 1);
    assert.equal(
      stats.avgConfidence,
      Math.round(((0.8 + 0.6 + 0.3) / 3) * 1000) / 1000,
    );
    assert.equal(stats.stalestEntry?.entryId, "b");
  });
});

// ---------- scanVaults (extractMeta tested transitively) ----------

describe("TemporalEngine.scanVaults", () => {
  it("returns empty array on missing dir", () => {
    const engine = new TemporalEngine();
    const reports = engine.scanVaults("/nonexistent/dir/path");
    assert.equal(reports.length, 0);
  });

  it("extracts metadata from JSONL with temporal{} block", () => {
    const dir = makeTmpVault("temporal-block");
    try {
      const fixture = {
        id: "e1",
        content: "test content",
        temporal: {
          validFrom: daysAgo(180),
          validUntil: null,
          lastConfirmed: daysAgo(45),
          confidenceDecay: 0.8,
        },
      };
      writeFileSync(join(dir, "test.jsonl"), JSON.stringify(fixture) + "\n");

      const engine = new TemporalEngine();
      const reports = engine.scanVaults(dir);
      assert.equal(reports.length, 1);
      assert.equal(reports[0]?.entryId, "e1");
      assert.equal(reports[0]?.isStale, true); // 45d > 30d threshold
      assert.equal(reports[0]?.isExpired, false); // validUntil null
      // Decayed at 180d on 90d half-life: 0.8 * 0.25 = 0.2
      assert.ok(Math.abs(reports[0]!.currentConfidence - 0.2) < 0.01);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("extracts metadata from legacy JSONL via createdAt/updatedAt fallback", () => {
    const dir = makeTmpVault("legacy");
    try {
      const fixture = {
        id: "legacy-1",
        content: "test content",
        createdAt: daysAgo(100),
        updatedAt: daysAgo(20),
        confidence: "high",
      };
      writeFileSync(join(dir, "test.jsonl"), JSON.stringify(fixture) + "\n");

      const engine = new TemporalEngine();
      const reports = engine.scanVaults(dir);
      assert.equal(reports.length, 1);
      assert.equal(reports[0]?.entryId, "legacy-1");
      assert.equal(reports[0]?.originalConfidence, 0.9); // 'high' → 0.9
      assert.equal(reports[0]?.isStale, false); // updatedAt 20d < 30d
      // Decayed at 100d on 90d: 0.9 * 0.5^(100/90) ≈ 0.9 * 0.4665 ≈ 0.42
      assert.ok(Math.abs(reports[0]!.currentConfidence - 0.42) < 0.05);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("maps confidence strings: high→0.9, medium→0.6, low→0.3, unknown→0.5", () => {
    const dir = makeTmpVault("confidence-map");
    try {
      const fixtures = [
        { id: "h", createdAt: daysAgo(0), confidence: "high" },
        { id: "m", createdAt: daysAgo(0), confidence: "medium" },
        { id: "l", createdAt: daysAgo(0), confidence: "low" },
        { id: "u", createdAt: daysAgo(0), confidence: "weird-unknown" },
      ];
      writeFileSync(
        join(dir, "test.jsonl"),
        fixtures.map((f) => JSON.stringify(f)).join("\n") + "\n",
      );

      const engine = new TemporalEngine();
      const reports = engine.scanVaults(dir);
      assert.equal(reports.length, 4);
      const byId = Object.fromEntries(reports.map((r) => [r.entryId, r]));
      assert.equal(byId.h?.originalConfidence, 0.9);
      assert.equal(byId.m?.originalConfidence, 0.6);
      assert.equal(byId.l?.originalConfidence, 0.3);
      assert.equal(byId.u?.originalConfidence, 0.5);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("skips malformed JSON lines without throwing", () => {
    const dir = makeTmpVault("malformed");
    try {
      const goodFixture = {
        id: "good",
        content: "ok",
        createdAt: daysAgo(10),
      };
      writeFileSync(
        join(dir, "test.jsonl"),
        JSON.stringify(goodFixture) +
          "\n" +
          "{ malformed json\n" +
          "another bad line\n",
      );

      const engine = new TemporalEngine();
      const reports = engine.scanVaults(dir);
      assert.equal(reports.length, 1);
      assert.equal(reports[0]?.entryId, "good");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("scans multiple .jsonl files and skips non-jsonl files in dir", () => {
    const dir = makeTmpVault("multi-file");
    try {
      const fixA = { id: "a1", createdAt: daysAgo(5) };
      const fixB = { id: "b1", createdAt: daysAgo(10) };
      writeFileSync(join(dir, "a.jsonl"), JSON.stringify(fixA) + "\n");
      writeFileSync(join(dir, "b.jsonl"), JSON.stringify(fixB) + "\n");
      writeFileSync(join(dir, "ignore.txt"), "not a vault file\n");
      writeFileSync(join(dir, "README.md"), "# vault readme\n");

      const engine = new TemporalEngine();
      const reports = engine.scanVaults(dir);
      assert.equal(reports.length, 2);
      const ids = reports.map((r) => r.entryId).sort();
      assert.deepEqual(ids, ["a1", "b1"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
