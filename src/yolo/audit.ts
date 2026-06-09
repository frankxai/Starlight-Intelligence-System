/**
 * /yolo audit log helper — deterministic JSONL IO for /yolo sessions.
 *
 * Schema per spec §8.1. One JSONL file per session at
 * memory/_audit/yolo/<YYYY-MM-DD-HHMMSS>.jsonl. Append-only — never rewrite.
 *
 * Directory is gitignored — runtime-created per session.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type YoloEvent =
  | { event: "session-open"; ts: string; session_id: string; phase_in_repo: string | null; scope_size: number }
  | { event: "scan-dispatched"; ts: string; agents: string[]; budget_ms: number }
  | { event: "scan-returned"; ts: string; agent: string; duration_ms: number; moves_count: number; drift_flags_count: number }
  | { event: "synthesis-complete"; ts: string; ranked_moves: number }
  | { event: "move-picked"; ts: string; move: Record<string, unknown> }
  | { event: "plan-produced"; ts: string; actions_count: number }
  | { event: "pre-qa"; ts: string; status: "pass" | "fail"; findings_count: number }
  | { event: "board-verdict"; ts: string; verdict: "PROCEED" | "PROCEED-WITH-REVISE" | "REVISE" | "BLOCK"; revise_items?: string[] }
  | { event: "sovereign-re-ack"; ts: string; granted: boolean; context: string }
  | { event: "action"; ts: string; action_type: string; result: "ok" | "fail" | "skipped"; verification: Record<string, unknown> }
  | { event: "final-qa"; ts: string; status: "pass" | "fail"; findings_count: number }
  | { event: "move-shipped"; ts: string; move_id: string; commits: string[]; verification: Record<string, unknown> }
  | { event: "drift-detected"; ts: string; description: string; severity: "low" | "med" | "high" }
  | { event: "session-close"; ts: string; duration_ms: number; moves_shipped: number; usd_spent: number }
  | { event: "session-abort"; ts: string; reason: string; in_flight_action: string | null; rollback_status: "success" | "partial" | "drift-recorded" };

export interface SessionHandle {
  session_id: string;
  log_path: string;
}

/**
 * Open a new /yolo session — mkdir, generate session_id, write session-open event.
 * Returns a SessionHandle for subsequent appends.
 */
export function openSession(
  repoRoot: string,
  phaseInRepo: string | null,
  scopeSize: number,
): SessionHandle {
  const auditDir = join(repoRoot, "memory", "_audit", "yolo");
  if (!existsSync(auditDir)) {
    mkdirSync(auditDir, { recursive: true });
  }

  const now = new Date();
  const session_id = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace(/T/, "-")
    .slice(0, 19);
  const log_path = join(auditDir, `${session_id}.jsonl`);

  appendEvent(log_path, {
    event: "session-open",
    ts: now.toISOString(),
    session_id,
    phase_in_repo: phaseInRepo,
    scope_size: scopeSize,
  });

  return { session_id, log_path };
}

/**
 * Append one event to the session log. JSONL — one event per line, append-only.
 */
export function appendEvent(logPath: string, event: YoloEvent): void {
  const line = JSON.stringify(event) + "\n";
  appendFileSync(logPath, line, "utf8");
}

/**
 * Close session — write session-close event and return summary.
 * Does NOT compute monthly-roll-up; that's a separate caller responsibility.
 */
export function closeSession(
  handle: SessionHandle,
  durationMs: number,
  movesShipped: number,
  usdSpent: number,
): void {
  appendEvent(handle.log_path, {
    event: "session-close",
    ts: new Date().toISOString(),
    duration_ms: durationMs,
    moves_shipped: movesShipped,
    usd_spent: usdSpent,
  });
}

/**
 * Abort session — write session-abort event with rollback details.
 */
export function abortSession(
  handle: SessionHandle,
  reason: string,
  inFlightAction: string | null,
  rollbackStatus: "success" | "partial" | "drift-recorded",
): void {
  appendEvent(handle.log_path, {
    event: "session-abort",
    ts: new Date().toISOString(),
    reason,
    in_flight_action: inFlightAction,
    rollback_status: rollbackStatus,
  });
}

/**
 * Read all events from a session log. Useful for post-session drift detection
 * and roll-up generation.
 */
export function readSession(logPath: string): YoloEvent[] {
  if (!existsSync(logPath)) {
    return [];
  }
  const raw = readFileSync(logPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
  return lines.map((l) => JSON.parse(l) as YoloEvent);
}

/**
 * Append a drift event to the shared _drift.jsonl log. Surfaces on next session-open.
 */
export function recordDrift(
  repoRoot: string,
  description: string,
  severity: "low" | "med" | "high",
  sessionId: string | null,
): void {
  const auditDir = join(repoRoot, "memory", "_audit", "yolo");
  if (!existsSync(auditDir)) {
    mkdirSync(auditDir, { recursive: true });
  }
  const driftPath = join(auditDir, "_drift.jsonl");
  const line =
    JSON.stringify({
      event: "drift-detected",
      ts: new Date().toISOString(),
      description,
      severity,
      origin_session: sessionId,
    }) + "\n";
  appendFileSync(driftPath, line, "utf8");
}

/**
 * Read all drift events. Conductor calls this on session-open to surface
 * accumulated drift since last session.
 */
export function readDriftLog(repoRoot: string): Array<{
  event: "drift-detected";
  ts: string;
  description: string;
  severity: "low" | "med" | "high";
  origin_session: string | null;
}> {
  const driftPath = join(repoRoot, "memory", "_audit", "yolo", "_drift.jsonl");
  if (!existsSync(driftPath)) {
    return [];
  }
  const raw = readFileSync(driftPath, "utf8");
  return raw
    .split(/\r?\n/)
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l));
}
