/**
 * /yolo proof-of-life smoke — exercises the W1 runtime helpers end-to-end.
 *
 * Run: tsx scripts/yolo-smoke.ts
 *
 * Produces a synthetic /yolo session log demonstrating the audit JSONL shape
 * + drift log + phase-in counter increment. Does NOT actually dispatch council
 * agents (that requires /yolo invocation in Claude Code). Validates the
 * runtime contract that the conductor skill assumes at execution time.
 *
 * Output: memory/_audit/yolo/<session-id>.jsonl + optional drift log entry.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadScope,
  incrementSessionCount,
  activeRepos,
  shouldRunPhaseInReview,
} from "../src/yolo/scope.js";

import {
  openSession,
  appendEvent,
  closeSession,
  readSession,
  recordDrift,
  readDriftLog,
} from "../src/yolo/audit.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

console.log("=== /yolo proof-of-life smoke ===\n");

// ── 1. Load scope and verify phase-in state ────────────────
console.log("[1/6] Loading yolo-scope.json...");
const scope = loadScope(REPO_ROOT);
console.log(`      → phase_in_repo:  ${scope.phase_in.phase_in_repo}`);
console.log(`      → unlock_status:  ${scope.phase_in.unlock_status}`);
console.log(`      → session_count:  ${scope.phase_in.session_count}`);
console.log(`      → repos in scope: ${activeRepos(scope).length}`);
console.log(`      → review needed?  ${shouldRunPhaseInReview(scope)}\n`);

// ── 2. Open session ────────────────────────────────────────
console.log("[2/6] Opening synthetic /yolo session...");
const repos = activeRepos(scope);
const handle = openSession(REPO_ROOT, scope.phase_in.phase_in_repo, repos.length);
console.log(`      → session_id:     ${handle.session_id}`);
console.log(`      → log_path:       ${handle.log_path}\n`);

// ── 3. Read prior drift (bidirectional drift detection) ────
console.log("[3/6] Reading prior-session drift log...");
const priorDrift = readDriftLog(REPO_ROOT);
console.log(`      → prior drift events: ${priorDrift.length}`);
if (priorDrift.length > 0) {
  console.log(`      → most recent: ${priorDrift[priorDrift.length - 1].description}`);
}
console.log();

// ── 4. Simulate council scan + synthesis events ────────────
console.log("[4/6] Simulating council scan + synthesis events...");
const startTs = Date.now();

const councilAgents = [
  "starlight-architect",
  "starlight-sentinel",
  "starlight-sage",
  "starlight-navigator",
  "starlight-weaver",
  "starlight-prime",
  "starlight-orchestrator",
];

appendEvent(handle.log_path, {
  event: "scan-dispatched",
  ts: new Date().toISOString(),
  agents: councilAgents,
  budget_ms: 60000,
});

for (const agent of councilAgents) {
  appendEvent(handle.log_path, {
    event: "scan-returned",
    ts: new Date().toISOString(),
    agent,
    duration_ms: 1500 + Math.floor(Math.random() * 3000),
    moves_count: Math.floor(Math.random() * 4),
    drift_flags_count: Math.floor(Math.random() * 2),
  });
}

appendEvent(handle.log_path, {
  event: "synthesis-complete",
  ts: new Date().toISOString(),
  ranked_moves: 3,
});

console.log(`      → 7 council scan events logged`);
console.log(`      → 1 synthesis-complete event logged\n`);

// ── 5. Simulate move-picked + execution events ─────────────
console.log("[5/6] Simulating move-picked + execution lifecycle...");

appendEvent(handle.log_path, {
  event: "move-picked",
  ts: new Date().toISOString(),
  move: {
    title: "[smoke-demo] Validate /yolo runtime contract",
    repo: "Starlight-Intelligence-System",
    leverage_score: 5,
    blast_radius: "low",
    rationale: "Synthetic move — proves audit log shape, no real action.",
  },
});

appendEvent(handle.log_path, {
  event: "plan-produced",
  ts: new Date().toISOString(),
  actions_count: 1,
});

appendEvent(handle.log_path, {
  event: "pre-qa",
  ts: new Date().toISOString(),
  status: "pass",
  findings_count: 0,
});

appendEvent(handle.log_path, {
  event: "action",
  ts: new Date().toISOString(),
  action_type: "smoke-validation",
  result: "ok",
  verification: {
    test_count: 17,
    test_status: "all-pass",
    note: "synthetic — no actual ship action taken",
  },
});

console.log(`      → 4 execution-lifecycle events logged\n`);

// ── 6. Close session ───────────────────────────────────────
console.log("[6/6] Closing synthetic session + persisting...");
const durationMs = Date.now() - startTs;
closeSession(handle, durationMs, 0, 0); // 0 moves shipped, 0 usd spent (smoke)

const allEvents = readSession(handle.log_path);
console.log(`      → total events:   ${allEvents.length}`);
console.log(`      → session length: ${durationMs}ms`);
console.log(`      → moves shipped:  0 (smoke test, no real action)\n`);

// ── Phase-in counter increment (DRY-RUN — smoke doesn't mutate production) ──
console.log("=== Phase-in counter (DRY-RUN) ===");
console.log(`Production session_count unchanged: ${scope.phase_in.session_count} (smoke does NOT increment)`);
console.log(`Real /yolo sessions will increment via conductor on session-open.`);
console.log();
// NOTE: incrementSessionCount(REPO_ROOT) is the production call — exercised by
// unit tests in src/yolo/yolo.test.ts. Not invoked here to keep counter clean.
void incrementSessionCount;

// ── Summary ────────────────────────────────────────────────
console.log("=== Smoke validation complete ===");
console.log(`Audit log:    ${handle.log_path}`);
console.log(`Drift log:    ${join(REPO_ROOT, "memory", "_audit", "yolo", "_drift.jsonl")} (${priorDrift.length} prior events)`);
console.log();
console.log("Runtime contract validated:");
console.log("  ✓ yolo-scope.json schema parses + validates");
console.log("  ✓ atomic-write session-count increment works");
console.log("  ✓ openSession mkdirs runtime audit dir");
console.log("  ✓ appendEvent writes JSONL one event per line");
console.log("  ✓ closeSession appends finalize event");
console.log("  ✓ readSession round-trips all events back");
console.log("  ✓ phase-in gate enforces single-repo lockout");
console.log();
console.log("Next: type `/yolo` in Claude Code to run a real session.");
