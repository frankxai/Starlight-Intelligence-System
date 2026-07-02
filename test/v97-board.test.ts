/**
 * v9.7 Executable Starlight Board — test suite.
 *
 * Guards runBoard:
 *   • with an injected executor returning scripted per-vector votes, the five
 *     votes feed the consensus + board-review math and produce the documented
 *     verdict + on-disk JSON/MD record shape.
 *   • unparseable vector responses default to REVISE at 0.5 (never crash).
 *   • dry-run mode writes an UNRESOLVED record with zero votes — never fabricates.
 *
 * All writes are pointed at a temp outDir; docs/boards/ is never touched.
 *
 * Built on SIP — operational tier.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { runBoard, type BoardVector } from "../src/board.js";
import type { AgentExecutor } from "../src/types.js";

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "sis-v97-"));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Executor that replies with a scripted response per vector (by agent id). */
function scriptedExecutor(script: Partial<Record<BoardVector, string>>): AgentExecutor {
  const vectors = Object.keys(script) as BoardVector[];
  return async (agent) => {
    const match = vectors.find((v) => `starlight-board-${v.toLowerCase()}` === agent);
    return match ? script[match]! : "{}";
  };
}

const vote = (verdict: string, confidence: number, reasoning = "because") =>
  JSON.stringify({ verdict, confidence, reasoning });

describe("v9.7 board — executor path", () => {
  it("all vectors PROCEED → verdict PROCEED with a full record shape", async () => {
    await withTempDir(async (dir) => {
      const record = await runBoard("adopt the swarm bridge", {
        outDir: dir,
        now: new Date("2026-07-02T00:00:00.000Z"),
        executor: scriptedExecutor({
          Sovereign: vote("PROCEED", 0.9),
          Seer: vote("PROCEED", 0.85),
          Harmonizer: vote("PROCEED", 0.8),
          Strategist: vote("PROCEED", 0.9),
          Verifier: vote("PROCEED", 0.88),
        }),
      });

      assert.equal(record.method, "executor");
      assert.equal(record.verdict, "PROCEED");
      assert.equal(record.vectors.length, 5);
      assert.ok(record.consensus);
      assert.equal(record.consensus?.recommendedAction, "PROCEED");
      assert.equal(record.proposal, "adopt the swarm bridge");

      // JSON file on disk matches the returned record.
      assert.ok(record.paths);
      const onDisk = JSON.parse(readFileSync(record.paths!.json, "utf8"));
      assert.equal(onDisk.method, "executor");
      assert.equal(onDisk.verdict, "PROCEED");
      assert.equal(onDisk.vectors.length, 5);
      assert.equal(onDisk.proposal, "adopt the swarm bridge");
      assert.ok(existsSync(record.paths!.md));
    });
  });

  it("two STOP votes veto to STOP (board-review ceiling)", async () => {
    await withTempDir(async (dir) => {
      const record = await runBoard("irreversible migration", {
        outDir: dir,
        executor: scriptedExecutor({
          Sovereign: vote("STOP", 0.9),
          Seer: vote("STOP", 0.9),
          Harmonizer: vote("PROCEED", 0.7),
          Strategist: vote("PROCEED", 0.7),
          Verifier: vote("PROCEED", 0.7),
        }),
      });
      assert.equal(record.verdict, "STOP");
    });
  });

  it("an unparseable vector response defaults to REVISE at 0.5", async () => {
    await withTempDir(async (dir) => {
      const record = await runBoard("half-formed idea", {
        outDir: dir,
        executor: scriptedExecutor({
          Sovereign: "I cannot produce JSON, sorry.",
          Seer: vote("PROCEED", 0.8),
          Harmonizer: vote("PROCEED", 0.8),
          Strategist: vote("PROCEED", 0.8),
          Verifier: vote("PROCEED", 0.8),
        }),
      });

      const sovereign = record.vectors.find((v) => v.vector === "Sovereign");
      assert.equal(sovereign?.verdict, "REVISE");
      assert.equal(sovereign?.confidence, 0.5);
      assert.match(sovereign?.note ?? "", /unparseable/);
    });
  });
});

describe("v9.7 board — dry-run", () => {
  it("writes an UNRESOLVED record with zero fabricated votes", async () => {
    await withTempDir(async (dir) => {
      const record = await runBoard("should we ship?", {
        outDir: dir,
        dryRun: true,
        now: new Date("2026-07-02T00:00:00.000Z"),
      });

      assert.equal(record.method, "dry-run");
      assert.equal(record.verdict, "UNRESOLVED");
      assert.equal(record.vectors.length, 0);
      assert.equal(record.consensus, null);

      const onDisk = JSON.parse(readFileSync(record.paths!.json, "utf8"));
      assert.equal(onDisk.method, "dry-run");
      assert.equal(onDisk.verdict, "UNRESOLVED");
      assert.deepEqual(onDisk.vectors, []);
    });
  });

  it("defaults to dry-run when no executor is supplied", async () => {
    await withTempDir(async (dir) => {
      const record = await runBoard("no backend here", { outDir: dir });
      assert.equal(record.method, "dry-run");
      assert.equal(record.verdict, "UNRESOLVED");
    });
  });
});
