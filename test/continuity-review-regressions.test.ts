/**
 * Regressions for the independent Grok review of PR 273 (block at 45052aa):
 * crash windows, observation binding, fail-open states, lock/torn-line safety,
 * owner presence and the proof gate.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { continuityStatus, importContinuityBundle, reconcileWork } from "../src/continuity-import.js";
import { runContinuityCli } from "../src/continuity-cli.js";
import { capture, deadPid, lockOwnedBy, policy, writeBundle } from "./_lib/continuity-fixture.js";

const store = () => join(mkdtempSync(join(tmpdir(), "continuity-regress-")), "store");
const owner = { method: "interactive-terminal" as const, typedWorkId: "work:continuity" };
const admit = { workId: "work:continuity", actorId: "actor:frank", decision: "admit" as const, reason: "checked", confirmation: owner };

describe("review finding 1: crash between events and observations", () => {
  it("backfills the observation on replay, so paused work still needs acknowledgement", () => {
    const s = store();
    const bundle = writeBundle([capture()]);
    importContinuityBundle(bundle, s, policy);
    // Simulate the old crash window: events stored, observation and receipt lost.
    rmSync(join(s, "observations.jsonl"));
    rmSync(join(s, "imports.jsonl"));
    assert.equal(continuityStatus(s, policy).works[0].state, "input-required", "missing observation fails closed");
    assert.throws(() => reconcileWork(s, policy, admit), /acknowledge it explicitly/);
    const replay = importContinuityBundle(bundle, s, policy);
    assert.deepEqual([replay.accepted.length, replay.duplicates.length], [0, 1]);
    assert.deepEqual(continuityStatus(s, policy).works[0].reportedState, { value: "paused", verification: "operator-supplied" });
  });
});

describe("review finding 2: observation binding", () => {
  it("binds each event to its own session's observation and quarantines ambiguity", () => {
    const paused = capture({ sessionId: "s-paused" });
    const active = capture({ sessionId: "s-active", reportedState: "active" });
    // Same work, digest and head, different sessions: each event must keep its own state.
    const s = store();
    importContinuityBundle(writeBundle([paused, active]), s, policy);
    const status = continuityStatus(s, policy).works[0];
    assert.equal(status.intent.observations, 2);
    const result = importContinuityBundle(writeBundle([paused], { observations: [paused.observation, { ...paused.observation }] }), store(), policy);
    assert.equal(result.status, "imported");
    assert.deepEqual(result.quarantined.map((q) => q.reason), ["observation-ambiguous"]);
  });
});

describe("review finding 3: fail-closed states and claim validation", () => {
  it("requires acknowledgement for any reported state except active", () => {
    for (const reportedState of ["unknown", "complete", "blocked"]) {
      const s = store();
      importContinuityBundle(writeBundle([capture({ reportedState })]), s, policy);
      assert.equal(continuityStatus(s, policy).works[0].state, "input-required", reportedState);
      assert.throws(() => reconcileWork(s, policy, admit), /acknowledge it explicitly/);
    }
    const s = store();
    importContinuityBundle(writeBundle([capture({ reportedState: "active" })]), s, policy);
    assert.equal(continuityStatus(s, policy).works[0].state, "submitted");
  });

  it("carries native goal-store verification and rejects malformed claims", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture({ reportedState: "blocked", stateVerification: "native-goal-store" })]), s, policy);
    assert.equal(continuityStatus(s, policy).works[0].reportedState?.verification, "native-goal-store");
    const bad = [
      capture({ reportedState: "running-somewhere" }),
      capture({ stateVerification: "trust-me" }),
    ];
    const spoofed = capture();
    spoofed.event = { ...spoofed.event, source: { ...spoofed.event.source, system: "claude" } };
    for (const part of [...bad, spoofed]) {
      assert.equal(importContinuityBundle(writeBundle([part]), store(), policy).quarantined[0]?.reason, "claim-invalid");
    }
    const unverified = capture();
    unverified.event = { ...unverified.event, data: { ...unverified.event.data, sourceVerification: "signed" } };
    assert.equal(importContinuityBundle(writeBundle([unverified]), store(), policy).quarantined[0]?.reason, "claim-invalid");
  });
});

describe("review finding 4: locks and torn lines", () => {
  it("ignores and trims a torn final line before appending", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    appendFileSync(join(s, "events.jsonl"), '{"schemaVersion":"1.0","eventId":"torn');
    assert.equal(continuityStatus(s, policy).works.length, 1);
    importContinuityBundle(writeBundle([capture({ sessionId: "s-2", observedAt: "2026-10-04T13:00:00.000Z" })]), s, policy);
    const lines = readFileSync(join(s, "events.jsonl"), "utf8").trim().split("\n");
    assert.equal(lines.length, 2);
    assert.ok(lines.every((line) => JSON.parse(line).eventId.startsWith("capture:")));
  });

  it("reclaims an abandoned lock once and never deletes a lock it does not own", () => {
    const s = store();
    mkdirSync(s, { recursive: true });
    writeFileSync(join(s, ".import.lock"), lockOwnedBy(deadPid()));
    assert.equal(importContinuityBundle(writeBundle([capture()]), s, policy).status, "imported");
    assert.equal(existsSync(join(s, ".import.lock")), false);
    const live = lockOwnedBy(process.pid);
    writeFileSync(join(s, ".import.lock"), live);
    assert.match(importContinuityBundle(writeBundle([capture({ sessionId: "s-3" })]), s, policy).refusal ?? "", /in progress/);
    assert.equal(readFileSync(join(s, ".import.lock"), "utf8"), live);
  });
});

describe("review finding 5: owner presence", () => {
  it("refuses reconciliation without an interactive terminal or the typed work ID", () => {
    const previous = process.env.SIS_CONTINUITY_HOME;
    const home = mkdtempSync(join(tmpdir(), "continuity-presence-"));
    writeFileSync(join(home, "trust-policy.json"), JSON.stringify(policy));
    process.env.SIS_CONTINUITY_HOME = home;
    try {
      runContinuityCli(["import", writeBundle([capture()])]);
      const argv = ["reconcile", "--work", "work:continuity", "--actor", "actor:frank", "--decision", "admit", "--reason", "x", "--acknowledge-paused"];
      const agent = runContinuityCli(argv, { interactive: false, ask: () => "work:continuity" });
      assert.equal(agent.exitCode, 1);
      assert.match(agent.stderr, /interactive terminal/);
      assert.equal(runContinuityCli(argv, { interactive: true, ask: () => "work:other" }).exitCode, 1);
      const human = runContinuityCli(argv, { interactive: true, ask: () => "work:continuity" });
      assert.equal(JSON.parse(human.stdout).recorded, "work.admitted");
      assert.throws(() => reconcileWork(join(home, "store"), policy, { ...admit, acknowledgePaused: true, confirmation: undefined as never }), /interactive terminal/);
    } finally {
      if (previous === undefined) delete process.env.SIS_CONTINUITY_HOME; else process.env.SIS_CONTINUITY_HOME = previous;
    }
  });
});

describe("review finding 6: proof gate", () => {
  it("refuses requirements that would complete without verification", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture({ reportedState: "active" })]), s, policy);
    assert.throws(() => reconcileWork(s, policy, { ...admit, requirements: { artifact: false, change: false, checks: false, deployment: false, verification: false } }), /verification proof/);
    reconcileWork(s, policy, admit);
    const [work] = continuityStatus(s, policy).works;
    assert.equal(work.delivery.readyToComplete, false);
    assert.ok(work.delivery.missingProofs.includes("verification"));
  });
});

describe("round two: replayed quarantine, repeated IDs, corruption and lock age", () => {
  it("records a quarantined event once across replays and later manifests", () => {
    const s = store();
    const untrusted = capture({ workId: "work:unknown" });
    const bundle = writeBundle([untrusted]);
    importContinuityBundle(bundle, s, policy);
    rmSync(join(s, "imports.jsonl"));
    const replay = importContinuityBundle(bundle, s, policy);
    assert.deepEqual([replay.quarantined.length, replay.duplicates.length], [0, 1], "a replayed quarantine is a duplicate, not a new row");
    importContinuityBundle(writeBundle([untrusted, capture({ sessionId: "s-other" })]), s, policy);
    assert.equal(readFileSync(join(s, "quarantine.jsonl"), "utf8").trim().split("\n").length, 1);
    assert.equal(continuityStatus(s, policy).unattributedQuarantine, 1);
  });

  it("refuses a bundle that repeats an event ID with different claims", () => {
    const active = capture({ reportedState: "active" });
    const paused = capture({ reportedState: "paused" });
    paused.event = { ...paused.event, eventId: active.event.eventId };
    const s = store();
    const result = importContinuityBundle(writeBundle([active, paused]), s, policy);
    assert.equal(result.status, "refused");
    assert.match(result.refusal ?? "", /repeats event ID/);
    assert.equal(existsSync(join(s, "events.jsonl")), false);
  });

  it("reports a corrupt complete line as corruption, not as replayable", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    const file = join(s, "events.jsonl");
    writeFileSync(file, "{not json}\n" + readFileSync(file, "utf8"));
    const result = importContinuityBundle(writeBundle([capture({ sessionId: "s-9" })]), s, policy);
    assert.equal(result.status, "refused");
    assert.match(result.refusal ?? "", /corrupt line 1; restore it from a backup/);
  });

  it("never preempts a live holder however old, nor a lock from another host or an unreadable one", () => {
    const s = store();
    mkdirSync(s, { recursive: true });
    const lock = join(s, ".import.lock");
    writeFileSync(lock, lockOwnedBy(process.pid));
    const ancient = new Date(Date.now() - 24 * 60 * 60_000);
    utimesSync(lock, ancient, ancient);
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /in progress/);
    writeFileSync(lock, lockOwnedBy(deadPid(), "another-machine"));
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /in progress/);
    writeFileSync(lock, "not a lock");
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /unreadable; remove it only after confirming/);
    assert.equal(existsSync(join(s, "events.jsonl")), false);
  });});

describe("round three: real concurrent importers", () => {
  it("two processes importing the same bundle at once leave one copy and one receipt", async () => {
    const { spawn } = await import("node:child_process");
    const { repoRootFromTestFile } = await import("./_lib/repo.js");
    const root = repoRootFromTestFile(import.meta.url);
    const home = mkdtempSync(join(tmpdir(), "continuity-concurrent-"));
    writeFileSync(join(home, "trust-policy.json"), JSON.stringify(policy));
    const bundle = writeBundle([capture(), capture({ sessionId: "s-2", observedAt: "2026-10-04T13:00:00.000Z" })]);
    const run = () => new Promise<number>((resolve) => {
      const child = spawn(process.execPath, ["--import", "tsx", join(root, "src", "continuity-cli.ts"), "import", bundle],
        { cwd: root, env: { ...process.env, SIS_CONTINUITY_HOME: home }, stdio: "ignore" });
      child.on("exit", (code) => resolve(code ?? -1));
    });
    const codes = await Promise.all([run(), run(), run()]);
    // Losers are refused while the lock is held, or replay to already-imported; none duplicates.
    assert.ok(codes.includes(0));
    const events = readFileSync(join(home, "store", "events.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l).eventId);
    assert.equal(events.length, 2);
    assert.equal(new Set(events).size, 2);
    assert.equal(readFileSync(join(home, "store", "imports.jsonl"), "utf8").trim().split("\n").length, 1);
    assert.equal(existsSync(join(home, "store", ".import.lock")), false);
  });
});

describe("round four: orphaned observations and the reclaim mutex", () => {
  it("refuses a reused event ID whose claims differ from an orphaned observation", () => {
    const s = store();
    const active = capture({ reportedState: "active" });
    importContinuityBundle(writeBundle([active]), s, policy);
    // Crash after observations but before events: only the observation survives.
    rmSync(join(s, "events.jsonl"));
    rmSync(join(s, "imports.jsonl"));
    const paused = capture({ reportedState: "paused" });
    paused.event = { ...paused.event, eventId: active.event.eventId };
    const result = importContinuityBundle(writeBundle([paused]), s, policy);
    assert.equal(result.status, "refused");
    assert.match(result.refusal ?? "", /conflicts with the observation stored by an earlier or interrupted import/);
    assert.equal(existsSync(join(s, "events.jsonl")), false);
    // The identical replay still completes.
    assert.equal(importContinuityBundle(writeBundle([active]), s, policy).status, "imported");
  });

  it("serializes reclaimers and leaves a crashed reclaimer's mutex to an operator", () => {
    const s = store();
    mkdirSync(s, { recursive: true });
    const lock = join(s, ".import.lock");
    writeFileSync(lock, lockOwnedBy(deadPid()));
    writeFileSync(`${lock}.reclaim`, lockOwnedBy(process.pid));
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /in progress/);
    assert.ok(existsSync(lock), "a live reclaimer's target is left alone");
    writeFileSync(`${lock}.reclaim`, lockOwnedBy(deadPid()));
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /crashed lock reclaimer left .*remove it/);
    assert.ok(existsSync(`${lock}.reclaim`), "never cleared automatically");
    rmSync(`${lock}.reclaim`);
    assert.equal(importContinuityBundle(writeBundle([capture()]), s, policy).status, "imported");
    assert.equal(existsSync(lock), false);
  });
});

describe("follow-up: operator-facing lock messages", () => {
  it("names an unreadable reclaim mutex instead of reporting a running import", () => {
    const s = store();
    mkdirSync(s, { recursive: true });
    const lock = join(s, ".import.lock");
    writeFileSync(lock, lockOwnedBy(deadPid()));
    writeFileSync(`${lock}.reclaim`, "not a lock");
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /reclaim mutex at .*\.import\.lock\.reclaim is unreadable/);
    assert.ok(existsSync(`${lock}.reclaim`));
  });
});

describe("workspace sessions outside any checkout", () => {
  const workspaceCapture = (over: Parameters<typeof capture>[0] = {}) => {
    const part = capture({ reportedState: "blocked", stateVerification: "native-goal-store", ...over });
    part.event = { ...part.event, data: { ...part.event.data, scope: "workspace", repositoryHead: null } };
    const { repository: _repository, ...rest } = part.observation;
    return { event: part.event, observation: { ...rest, repository: null, scope: "workspace", workspace: { root: "C:/Users/frank" } } as unknown as typeof part.observation };
  };
  const workspacePolicy = { ...policy, works: [{ workId: "work:continuity", projectId: "project:sis", ownerActorId: "actor:frank" }] };

  it("imports a workspace session for a work registered without a checkout", () => {
    const s = store();
    const result = importContinuityBundle(writeBundle([workspaceCapture()]), s, workspacePolicy);
    assert.equal(result.accepted.length, 1);
    const [work] = continuityStatus(s, workspacePolicy).works;
    assert.deepEqual([work.scope, work.checkout, work.workspace, work.state], ["workspace", null, { root: "C:/Users/frank" }, "input-required"]);
    assert.deepEqual(work.reportedState, { value: "blocked", verification: "native-goal-store" });
  });

  it("refuses a workspace session for a work registered with a checkout, and scope disagreements", () => {
    assert.equal(importContinuityBundle(writeBundle([workspaceCapture()]), store(), policy).quarantined[0]?.reason, "checkout-mismatch");
    const mixed = workspaceCapture();
    mixed.event = { ...mixed.event, data: { ...mixed.event.data, scope: undefined } };
    assert.equal(importContinuityBundle(writeBundle([mixed]), store(), workspacePolicy).quarantined[0]?.reason, "observation-missing");
  });

  it("reports checkout scope for ordinary sessions", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    const [work] = continuityStatus(s, policy).works;
    assert.deepEqual([work.scope, work.workspace], ["checkout", null]);
  });
});
