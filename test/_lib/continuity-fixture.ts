import { spawnSync } from "node:child_process";
import { hostname } from "node:os";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONTINUITY_POLICY_SCHEMA, type ContinuityTrustPolicy } from "../../src/continuity-import.js";
import type { WorkGraphEvent } from "../../src/work-graph.js";

// Mirrors the bundle layout written by agentic-ops lifecycle/sis-continuity.js.
export const REVISION = "12d794a389959a2360bd4c920689510f0949f02b";
export const HEAD = "a".repeat(40);
export const ORIGIN = "https://github.com/frankxai/example.git";
export const digest = (v: string) => createHash("sha256").update(v).digest("hex");

export const policy: ContinuityTrustPolicy = {
  schemaVersion: CONTINUITY_POLICY_SCHEMA,
  supportedSourceRevisions: [REVISION],
  collectors: [{ harness: "codex", sourceRefPrefix: "session:" }, { harness: "claude", sourceRefPrefix: "session:" }],
  operators: ["actor:frank"],
  works: [{ workId: "work:continuity", projectId: "project:sis", ownerActorId: "actor:frank", checkout: { origin: ORIGIN, branch: "agent/codex/lane" } }],
};

export function capture(over: { harness?: string; sessionId?: string; observedAt?: string; request?: string; workId?: string; actorId?: string; uri?: string; reportedState?: string; stateVerification?: string } = {}) {
  const reportedState = over.reportedState ?? "paused";
  const stateVerification = over.stateVerification ?? "operator-supplied";
  const harness = over.harness ?? "codex";
  const sessionId = over.sessionId ?? "s-1";
  const observedAt = over.observedAt ?? "2026-10-04T12:00:00.000Z";
  const requestDigest = digest(over.request ?? "/goal ship continuity");
  const workId = over.workId ?? "work:continuity";
  const event: WorkGraphEvent = {
    schemaVersion: "1.0",
    eventId: `capture:${digest([observedAt, harness, sessionId, requestDigest, workId].join("|"))}`,
    workId, correlationId: workId, projectId: "project:sis", kind: "intent.captured",
    source: { system: harness as WorkGraphEvent["source"]["system"], sourceId: sessionId, uri: over.uri ?? `session:${sessionId}` },
    actorId: over.actorId ?? "actor:frank", occurredAt: observedAt, observedAt,
    evidenceRefs: [`session:${sessionId}`, `sha256:${requestDigest}`], visibility: "private", retention: "operational",
    summary: "Complete user directive captured; task admission and release proof remain external.",
    data: { harness, requestDigest, goalAuthority: "explicit-user-directive", goalSourceRef: `session:${sessionId}#lastPrompt`,
      sourceVerification: "collector-claimed", reportedState, stateVerification,
      repositoryHead: HEAD, mayAutomaticallyResume: false },
  };
  const observation = { sessionKey: JSON.stringify([harness, sessionId]), workId, projectId: "project:sis", reportedState,
    stateVerification, goalAuthority: "explicit-user-directive", requestDigest, captureCompleteness: "complete",
    repository: { root: "C:/checkout", head: HEAD, branch: "agent/codex/lane", origin: ORIGIN, dirty: true }, mayAutomaticallyResume: false };
  return { event, observation };
}

export function writeBundle(parts: ReturnType<typeof capture>[], over: Record<string, unknown> = {}): string {
  const dir = join(mkdtempSync(join(tmpdir(), "continuity-bundle-")), "bundle");
  mkdirSync(dir);
  const events = parts.map((p) => p.event);
  const bundle = { schemaVersion: "starlight.continuity-bundle.v1", sisSourceRevision: REVISION, observedAt: "2026-10-04T12:00:00.000Z",
    privacy: "metadata-only", observations: parts.map((p) => p.observation), events, issues: [], unboundSessions: [],
    executionStarted: false, admissionGranted: false, completionClaimed: false, ...over };
  const files: Record<string, string> = {
    "events.jsonl": events.map((e) => JSON.stringify(e)).join("\n") + (events.length ? "\n" : ""),
    "continuity.json": JSON.stringify(bundle, null, 2) + "\n",
    "recovery.txt": "No command has been executed.\n",
  };
  const checksums: Record<string, string> = {};
  for (const [name, value] of Object.entries(files)) { writeFileSync(join(dir, name), value); checksums[name] = digest(value); }
  writeFileSync(join(dir, "manifest.json"), JSON.stringify({ schemaVersion: "starlight.continuity-manifest.v1", checksums,
    eventCount: events.length, issueCount: 0, complete: true }, null, 2) + "\n");
  return dir;
}


/** A lock file in the importer's format, owned by the given process. */
export function lockOwnedBy(pid: number, host = hostname()): string {
  return JSON.stringify({ pid, host, token: `test-${pid}` });
}

/** The PID of a process that has already exited. */
export function deadPid(): number {
  return spawnSync(process.execPath, ["-e", ""]).pid!;
}
