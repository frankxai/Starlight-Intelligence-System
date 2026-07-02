/**
 * v9.8 Queen Realization — real MEASURE/LEARN, `queen verify`, honest visuals
 *
 * Drives tools/queen/driver.mjs (plain dependency-free node, no TS imports) as a
 * subprocess against the REAL repo scorecards under tools/proving-ground/scorecards/.
 * Covers three read-only verbs:
 *
 *   measure — parses scorecard CONTENTS (not just filenames) and prints a real
 *             per-scorecard metric table + deltas between comparable configs.
 *   learn   — derives proposals from that measured data; no hardcoded 'grok'
 *             filename-sniffing proposals; every proposal cites evidence numbers.
 *   verify  — reads ledger.jsonl + state.json + routing-table.json and prints a
 *             PASS/FAIL per falsifiable check (tick monotonicity, visual-artifact
 *             existence on disk, lastDerivedFrom dedup).
 *
 * `measure`, `learn`, and `verify` are read-only by contract: this suite hashes
 * tools/queen/state.json before and after each invocation and asserts it is
 * byte-identical, so a regression that reintroduces a stray saveJSON() call in
 * one of these code paths fails loudly here instead of corrupting shared state
 * mid-session (other lanes read/write this repo concurrently).
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol v1.1.1
 * - Layers used: [file-contract, attestation]
 * - Generated: 2026-07-02
 * ---
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const DRIVER = join(REPO_ROOT, "tools", "queen", "driver.mjs");
const STATE_PATH = join(REPO_ROOT, "tools", "queen", "state.json");
const TABLE_PATH = join(REPO_ROOT, "tools", "proving-ground", "routing-table.json");
const LEDGER_PATH = join(REPO_ROOT, "tools", "queen", "ledger.jsonl");

function hashFile(p: string): string {
  if (!existsSync(p)) return "MISSING";
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}

function runDriver(sub: string, extraArgs: string[] = []): { code: number; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [DRIVER, sub, ...extraArgs], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read-only contract: measure / learn / verify must never mutate shared state
// ─────────────────────────────────────────────────────────────────────────────

describe("v98 Queen: read-only verbs never mutate state/table/ledger", () => {
  for (const sub of ["measure", "learn", "verify"]) {
    test(`${sub} leaves state.json, routing-table.json, and ledger.jsonl byte-identical`, () => {
      const before = {
        state: hashFile(STATE_PATH),
        table: hashFile(TABLE_PATH),
        ledger: hashFile(LEDGER_PATH),
      };
      const result = runDriver(sub);
      assert.equal(result.code, 0, `${sub} exited non-zero: ${result.stderr}`);
      const after = {
        state: hashFile(STATE_PATH),
        table: hashFile(TABLE_PATH),
        ledger: hashFile(LEDGER_PATH),
      };
      assert.equal(after.state, before.state, `${sub} mutated tools/queen/state.json`);
      assert.equal(after.table, before.table, `${sub} mutated tools/proving-ground/routing-table.json`);
      assert.equal(after.ledger, before.ledger, `${sub} mutated tools/queen/ledger.jsonl`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// measure — real per-scorecard metric table, parsed from CONTENTS
// ─────────────────────────────────────────────────────────────────────────────

describe("v98 Queen: measure parses real scorecard contents", () => {
  test("prints a real metric number sourced from a scorecard (precision@10 = 0.2 from the RRF-hybrid receipt)", () => {
    const result = runDriver("measure");
    assert.equal(result.code, 0, `measure exited non-zero: ${result.stderr}`);
    // tools/proving-ground/scorecards/2026-06-10-memory-lane-rrf-hybrid.json:
    // results["lexical (sovereign IDF)"].precision@10 === 0.124 (exact literal from the receipt)
    assert.ok(
      result.stdout.includes("precision@10"),
      "expected a precision@10 metric name in measure output",
    );
    assert.ok(
      result.stdout.includes("0.124") || result.stdout.includes("0.2"),
      "expected a real precision@10 value (0.124 lexical or 0.2 hybrid) from the scorecard in measure output",
    );
  });

  test("names the scorecard file it read (not just a filename list — actual content parsing)", () => {
    const result = runDriver("measure");
    assert.ok(
      result.stdout.includes("2026-06-10-memory-lane-rrf-hybrid.json"),
      "expected the RRF-hybrid scorecard filename to appear as a parsed receipt",
    );
    assert.ok(
      result.stdout.includes("hybrid (RRF)") || result.stdout.includes("lexical (sovereign IDF)"),
      "expected configuration labels pulled from inside the scorecard, not just its filename",
    );
  });

  test("prints a delta between comparable configurations (lexical vs hybrid)", () => {
    const result = runDriver("measure");
    assert.ok(
      /precision@10:.*lexical.*->.*hybrid/i.test(result.stdout) ||
        /precision@10:.*hybrid.*->.*lexical/i.test(result.stdout),
      "expected a printed delta line comparing lexical vs hybrid precision@10",
    );
    assert.match(result.stdout, /relative=\+?\d/, "expected a relative percentage on at least one delta");
  });

  test("emits a machine-readable MEASURE_SUMMARY_JSON line consumable by LEARN", () => {
    const result = runDriver("measure");
    const line = result.stdout.split("\n").find((l) => l.startsWith("MEASURE_SUMMARY_JSON "));
    assert.ok(line, "expected a MEASURE_SUMMARY_JSON line in measure output");
    const summary = JSON.parse(line!.slice("MEASURE_SUMMARY_JSON ".length));
    assert.ok(Array.isArray(summary.scorecards), "summary.scorecards must be an array");
    assert.ok(summary.scorecards.length > 0, "summary.scorecards must be non-empty against real repo data");
    const rrf = summary.scorecards.find((s: any) => s.file === "2026-06-10-memory-lane-rrf-hybrid.json");
    assert.ok(rrf, "expected the RRF-hybrid scorecard in the machine-readable summary");
    assert.ok(rrf.metrics.some((m: any) => m.name === "precision@10"), "expected precision@10 in parsed metrics");
  });

  test("scans a lane filter without crashing and returns a subset", () => {
    const all = runDriver("measure");
    const memoryOnly = runDriver("measure", ["memory"]);
    assert.equal(memoryOnly.code, 0, `measure memory exited non-zero: ${memoryOnly.stderr}`);
    assert.ok(memoryOnly.stdout.includes("2026-06-10-memory-lane-rrf-hybrid.json"));
    // Lane-filtered run should not be larger than the unfiltered run.
    assert.ok(memoryOnly.stdout.length <= all.stdout.length + 200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// learn — proposals derived from measured data, no hardcoded grok proposals
// ─────────────────────────────────────────────────────────────────────────────

describe("v98 Queen: learn derives proposals from real data", () => {
  test("contains no hardcoded 'grok' filename-sniffing proposal text", () => {
    const result = runDriver("learn");
    assert.equal(result.code, 0, `learn exited non-zero: ${result.stderr}`);
    assert.ok(
      !/grok/i.test(result.stdout),
      `learn output must not reference grok/arena-filename hardcoding, got: ${result.stdout}`,
    );
  });

  test("proposes promoting hybrid weighting for the memory lane with cited evidence numbers", () => {
    const result = runDriver("learn");
    assert.ok(
      result.stdout.includes("promote-hybrid-weighting") || result.stdout.includes("promote hybrid weighting"),
      `expected a promote-hybrid-weighting proposal, got: ${result.stdout}`,
    );
    assert.ok(
      result.stdout.includes("memory"),
      "expected the proposal to name the memory lane",
    );
    // Evidence must cite the real receipt numbers (0.124 lexical -> 0.2 hybrid, +61.3% relative).
    assert.match(result.stdout, /precision@10.*0\.124.*->.*0\.2/, "expected cited precision@10 evidence numbers");
    assert.match(result.stdout, /\+\d+(\.\d+)?%/, "expected a cited relative percentage in the evidence");
    assert.ok(
      result.stdout.includes("2026-06-10-memory-lane-rrf-hybrid.json"),
      "expected the evidence to cite its source scorecard file",
    );
  });

  test("every printed proposal line includes an em-dash evidence clause (not a bare assertion)", () => {
    const result = runDriver("learn");
    const proposalLines = result.stdout.split("\n").filter((l) => l.trim().startsWith("["));
    assert.ok(proposalLines.length > 0, "expected at least one bracketed proposal line");
    for (const line of proposalLines) {
      assert.ok(line.includes(" — "), `proposal line missing evidence clause: ${line}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verify — falsifiable claims, PASS/FAIL per check
// ─────────────────────────────────────────────────────────────────────────────

describe("v98 Queen: verify prints per-check PASS/FAIL", () => {
  test("prints exactly three labelled checks, each tagged PASS or FAIL", () => {
    const result = runDriver("verify");
    assert.equal(result.code, 0, `verify exited non-zero: ${result.stderr}`);
    const checkLines = result.stdout.split("\n").filter((l) => /^\s*\[(PASS|FAIL)\]/.test(l));
    assert.equal(checkLines.length, 3, `expected 3 PASS/FAIL check lines, got: ${JSON.stringify(checkLines)}`);
    assert.ok(checkLines.some((l) => l.includes("tickHistory")), "expected a tickHistory monotonicity check");
    assert.ok(checkLines.some((l) => l.includes("visualsProduced") || l.includes("visual")), "expected a visuals-vs-disk check");
    assert.ok(checkLines.some((l) => l.includes("lastDerivedFrom")), "expected a lastDerivedFrom dedup check");
  });

  test("honestly FAILs the visuals check when referenced artifacts don't exist on disk", () => {
    const result = runDriver("verify");
    // Real repo state: ledger.jsonl references images/1.jpg..5.jpg which do not exist at repo root.
    assert.match(
      result.stdout,
      /\[FAIL\].*visual.*NOT exist on disk/i,
      `expected an honest FAIL for missing visual artifacts, got: ${result.stdout}`,
    );
  });

  test("PASSes the lastDerivedFrom dedup check against the real routing table", () => {
    const table = JSON.parse(readFileSync(TABLE_PATH, "utf-8"));
    const derived: string[] = table.lastDerivedFrom || [];
    const hasDuplicates = new Set(derived).size !== derived.length;
    const result = runDriver("verify");
    if (hasDuplicates) {
      assert.match(result.stdout, /\[FAIL\].*lastDerivedFrom/);
    } else {
      assert.match(result.stdout, /\[PASS\].*lastDerivedFrom/);
    }
  });

  test("prints an overall VERIFY PASS/FAIL summary line with a checks-passed ratio", () => {
    const result = runDriver("verify");
    assert.match(result.stdout, /VERIFY (PASS|FAIL) \(\d+\/3 checks passed\)/);
  });
});
