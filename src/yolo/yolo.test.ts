import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  loadScope,
  incrementSessionCount,
  activeRepos,
  shouldRunPhaseInReview,
  unlockPhaseIn,
  YoloScopeError,
} from "./scope.js";

import {
  openSession,
  appendEvent,
  closeSession,
  abortSession,
  readSession,
  recordDrift,
  readDriftLog,
} from "./audit.js";

function withTempRepo<T>(fn: (repoRoot: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "yolo-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const VALID_SCOPE = {
  version: "1.0.0",
  schema: "https://starlightintelligence.org/schema/yolo-scope.v1.json",
  budget: { session_threshold_usd: 20, action_threshold_usd: 5 },
  phase_in: {
    phase_in_repo: "SIS",
    session_count: 0,
    unlock_status: "closed" as const,
    unlock_review_passed: false,
    notes: "test",
  },
  repos: [
    { name: "SIS", path: "/tmp/sis", alliance_touched: false, tier: "active" as const },
    { name: "FrankX", path: "/tmp/frankx", alliance_touched: false, tier: "active" as const },
  ],
};

describe("yolo/scope", () => {
  it("loadScope returns valid object for well-formed JSON", () => {
    withTempRepo((root) => {
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "yolo-scope.json"), JSON.stringify(VALID_SCOPE));
      const scope = loadScope(root);
      assert.equal(scope.phase_in.phase_in_repo, "SIS");
      assert.equal(scope.repos.length, 2);
    });
  });

  it("loadScope throws YoloScopeError if file missing", () => {
    withTempRepo((root) => {
      assert.throws(() => loadScope(root), YoloScopeError);
    });
  });

  it("loadScope throws on bad JSON", () => {
    withTempRepo((root) => {
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "yolo-scope.json"), "{ not valid json");
      assert.throws(() => loadScope(root), YoloScopeError);
    });
  });

  it("loadScope rejects alliance-touched repo (sovereignty hygiene)", () => {
    withTempRepo((root) => {
      const bad = JSON.parse(JSON.stringify(VALID_SCOPE));
      bad.repos.push({ name: "AllianceRepo", path: "/tmp/a", alliance_touched: true, tier: "active" });
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "yolo-scope.json"), JSON.stringify(bad));
      assert.throws(() => loadScope(root), /alliance-touched/);
    });
  });

  it("loadScope rejects phase_in_repo not in repos list", () => {
    withTempRepo((root) => {
      const bad = JSON.parse(JSON.stringify(VALID_SCOPE));
      bad.phase_in.phase_in_repo = "DoesNotExist";
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "yolo-scope.json"), JSON.stringify(bad));
      assert.throws(() => loadScope(root), /not found in repos/);
    });
  });

  it("incrementSessionCount atomically updates session_count", () => {
    withTempRepo((root) => {
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "yolo-scope.json"), JSON.stringify(VALID_SCOPE));
      const newCount = incrementSessionCount(root);
      assert.equal(newCount, 1);
      const reloaded = loadScope(root);
      assert.equal(reloaded.phase_in.session_count, 1);
    });
  });

  it("activeRepos returns [phase_in_repo] when locked", () => {
    const scope = JSON.parse(JSON.stringify(VALID_SCOPE));
    const repos = activeRepos(scope);
    assert.deepEqual(repos, ["SIS"]);
  });

  it("activeRepos returns full list when unlocked", () => {
    const scope = JSON.parse(JSON.stringify(VALID_SCOPE));
    scope.phase_in.unlock_status = "open";
    const repos = activeRepos(scope);
    assert.deepEqual(repos, ["SIS", "FrankX"]);
  });

  it("shouldRunPhaseInReview triggers at session_count >= 3 + closed + not-passed", () => {
    const scope = JSON.parse(JSON.stringify(VALID_SCOPE));
    scope.phase_in.session_count = 3;
    assert.equal(shouldRunPhaseInReview(scope), true);
  });

  it("shouldRunPhaseInReview does NOT trigger if already passed", () => {
    const scope = JSON.parse(JSON.stringify(VALID_SCOPE));
    scope.phase_in.session_count = 5;
    scope.phase_in.unlock_review_passed = true;
    assert.equal(shouldRunPhaseInReview(scope), false);
  });

  it("unlockPhaseIn flips status to open + passed to true", () => {
    withTempRepo((root) => {
      mkdirSync(join(root, "private"), { recursive: true });
      writeFileSync(join(root, "private", "yolo-scope.json"), JSON.stringify(VALID_SCOPE));
      const updated = unlockPhaseIn(root);
      assert.equal(updated.phase_in.unlock_status, "open");
      assert.equal(updated.phase_in.unlock_review_passed, true);
      const reloaded = loadScope(root);
      assert.equal(reloaded.phase_in.unlock_status, "open");
    });
  });
});

describe("yolo/audit", () => {
  it("openSession mkdirs audit dir + writes session-open event", () => {
    withTempRepo((root) => {
      const h = openSession(root, "SIS", 1);
      assert.match(h.session_id, /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
      assert.ok(existsSync(h.log_path));
      const events = readSession(h.log_path);
      assert.equal(events.length, 1);
      assert.equal(events[0].event, "session-open");
    });
  });

  it("appendEvent adds JSONL line", () => {
    withTempRepo((root) => {
      const h = openSession(root, "SIS", 1);
      appendEvent(h.log_path, {
        event: "move-picked",
        ts: new Date().toISOString(),
        move: { title: "Test move" },
      });
      const events = readSession(h.log_path);
      assert.equal(events.length, 2);
      assert.equal(events[1].event, "move-picked");
    });
  });

  it("closeSession appends session-close with summary", () => {
    withTempRepo((root) => {
      const h = openSession(root, "SIS", 1);
      closeSession(h, 1234, 2, 5.5);
      const events = readSession(h.log_path);
      const last = events[events.length - 1];
      assert.equal(last.event, "session-close");
      if (last.event === "session-close") {
        assert.equal(last.duration_ms, 1234);
        assert.equal(last.moves_shipped, 2);
        assert.equal(last.usd_spent, 5.5);
      }
    });
  });

  it("abortSession appends session-abort with rollback details", () => {
    withTempRepo((root) => {
      const h = openSession(root, "SIS", 1);
      abortSession(h, "user-requested", "git_commit", "success");
      const events = readSession(h.log_path);
      const last = events[events.length - 1];
      assert.equal(last.event, "session-abort");
    });
  });

  it("recordDrift + readDriftLog round-trips", () => {
    withTempRepo((root) => {
      recordDrift(root, "test drift entry", "low", "session-abc");
      const drifts = readDriftLog(root);
      assert.equal(drifts.length, 1);
      assert.equal(drifts[0].description, "test drift entry");
      assert.equal(drifts[0].severity, "low");
    });
  });

  it("readDriftLog returns empty array when no drift", () => {
    withTempRepo((root) => {
      const drifts = readDriftLog(root);
      assert.equal(drifts.length, 0);
    });
  });
});
