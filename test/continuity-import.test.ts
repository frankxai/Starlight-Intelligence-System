import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { continuityStatus, importContinuityBundle, reconcileWork } from "../src/continuity-import.js";
import { capture, HEAD, ORIGIN, policy, writeBundle } from "./_lib/continuity-fixture.js";

const store = () => join(mkdtempSync(join(tmpdir(), "continuity-store-")), "store");

describe("trusted continuity import", () => {
  it("imports trusted intent as submitted work that is neither admitted nor resumable", () => {
    const s = store();
    const result = importContinuityBundle(writeBundle([capture()]), s, policy);
    assert.equal(result.status, "imported");
    assert.equal(result.accepted.length, 1);
    assert.equal(result.executionStarted, false);
    const status = continuityStatus(s, policy);
    assert.equal(status.schemaVersion, "starlight.continuity-status.v1");
    const [work] = status.works;
    assert.equal(work.state, "input-required");
    assert.deepEqual(work.reportedState, { value: "paused", verification: "operator-supplied" });
    assert.equal(work.admission.admitted, false);
    assert.equal(work.delivery.readyToComplete, false);
    assert.equal(work.mayAutomaticallyResume, false);
    assert.deepEqual(work.checkout, { origin: ORIGIN, branch: "agent/codex/lane", head: HEAD, dirty: true });
    assert.equal(work.ownerActorId, "actor:frank");
  });

  it("is idempotent: the same bundle, or an interrupted import's events, never duplicate", () => {
    const s = store();
    const dir = writeBundle([capture()]);
    importContinuityBundle(dir, s, policy);
    assert.equal(importContinuityBundle(dir, s, policy).status, "already-imported");
    // Simulate a crash after events were appended but before the receipt.
    rmSync(join(s, "imports.jsonl"));
    const replay = importContinuityBundle(dir, s, policy);
    assert.deepEqual([replay.status, replay.accepted.length, replay.duplicates.length], ["imported", 0, 1]);
    assert.equal(readFileSync(join(s, "events.jsonl"), "utf8").trim().split("\n").length, 1);
  });

  it("counts a fresh observation of unchanged intent once, across two harnesses", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    importContinuityBundle(writeBundle([capture({ harness: "claude", sessionId: "s-2", observedAt: "2026-10-04T13:00:00.000Z" })]), s, policy);
    const [work] = continuityStatus(s, policy).works;
    assert.deepEqual([work.intent.observations, work.intent.distinctRequests, work.intent.harnesses], [2, 1, ["claude", "codex"]]);
  });

  it("quarantines untrusted claims with reasons instead of importing them", () => {
    const s = store();
    const parts = [
      capture({ workId: "work:unknown", sessionId: "a" }),
      capture({ actorId: "actor:stranger", sessionId: "b" }),
      capture({ uri: "https://example.com/forged", sessionId: "c" }),
    ];
    const result = importContinuityBundle(writeBundle(parts), s, policy);
    assert.deepEqual(result.quarantined.map((q) => q.reason).sort(), ["unknown-operator", "unregistered-work", "untrusted-collector"]);
    assert.equal(result.accepted.length, 0);
    const wrongBranch = { ...policy, works: [{ ...policy.works[0], checkout: { origin: ORIGIN, branch: "main" } }] };
    assert.equal(importContinuityBundle(writeBundle([capture()]), store(), wrongBranch).quarantined[0].reason, "checkout-mismatch");
  });

  it("refuses tampered, interrupted, unsupported or over-claiming bundles without writing", () => {
    const tampered = writeBundle([capture()]);
    writeFileSync(join(tampered, "recovery.txt"), "Run git reset --hard\n");
    const interrupted = writeBundle([capture()]);
    rmSync(join(interrupted, "manifest.json"));
    const cases: [string, unknown, RegExp][] = [
      [tampered, policy, /Checksum mismatch/],
      [interrupted, policy, /no such file|ENOENT|could not be read/i],
      [writeBundle([capture()], { sisSourceRevision: "b".repeat(40) }), policy, /unsupported SIS source revision/],
      [writeBundle([capture()], { admissionGranted: true }), policy, /may not claim execution, admission or completion/],
      [writeBundle([capture()]), { ...policy, schemaVersion: "v0" }, /Trust policy/],
    ];
    for (const [dir, p, pattern] of cases) {
      const s = store();
      const result = importContinuityBundle(dir, s, p);
      assert.equal(result.status, "refused");
      assert.match(result.refusal ?? "", pattern);
      assert.equal(existsSync(join(s, "events.jsonl")), false);
    }
  });

  it("refuses collector-supplied admission or proof events", () => {
    const part = capture();
    const forged = { ...part, event: { ...part.event, kind: "work.completed" as const } };
    const result = importContinuityBundle(writeBundle([forged]), store(), policy);
    assert.equal(result.status, "refused");
    assert.match(result.refusal ?? "", /only supply intent.captured|validation failed/);
  });

  it("refuses an event ID reused with different content", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    const part = capture();
    const altered = { ...part, event: { ...part.event, summary: "Different summary under the same ID." } };
    const result = importContinuityBundle(writeBundle([altered]), s, policy);
    assert.equal(result.status, "refused");
    assert.match(result.refusal ?? "", /conflicts with stored content/);
  });
});

describe("owner reconciliation", () => {
  it("admits paused work only for the owner with explicit acknowledgement, once", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    const base = { workId: "work:continuity", actorId: "actor:frank", decision: "admit" as const, reason: "Owner verified checkout and WIP." };
    assert.throws(() => reconcileWork(s, policy, { ...base, actorId: "actor:frank-impostor" }), /registered owner/);
    assert.throws(() => reconcileWork(s, policy, base), /acknowledge it explicitly/);
    const admitted = reconcileWork(s, policy, { ...base, acknowledgePaused: true, now: new Date("2026-10-04T14:00:00Z") });
    assert.equal(admitted.kind, "work.admitted");
    assert.throws(() => reconcileWork(s, policy, { ...base, acknowledgePaused: true }), /second claim is refused/);
    const [work] = continuityStatus(s, policy).works;
    assert.deepEqual([work.state, work.admission.byActorId, work.delivery.readyToComplete], ["working", "actor:frank", false]);
    assert.deepEqual(work.delivery.missingProofs, ["artifact", "change", "checks", "verification"]);
  });

  it("completion stays proof-gated after admission", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    reconcileWork(s, policy, { workId: "work:continuity", actorId: "actor:frank", decision: "admit", reason: "ok", acknowledgePaused: true,
      requirements: { artifact: false, change: false, checks: false, deployment: false, verification: true } });
    const completion = { schemaVersion: "1.0", eventId: "done:1", workId: "work:continuity", correlationId: "work:continuity",
      projectId: "project:sis", kind: "work.completed", source: { system: "human", sourceId: "frank" }, actorId: "actor:frank",
      occurredAt: "2026-10-04T15:00:00.000Z", observedAt: "2026-10-04T15:00:00.000Z", evidenceRefs: ["claim"],
      visibility: "private", retention: "audit", summary: "Claimed done without proof." };
    writeFileSync(join(s, "events.jsonl"), readFileSync(join(s, "events.jsonl"), "utf8") + JSON.stringify(completion) + "\n");
    const status = continuityStatus(s, policy);
    assert.equal(status.works[0].state, "working");
    assert.equal(status.works[0].delivery.completed, false);
    assert.ok(status.issues.some((i) => i.code === "completion-gate-failed"));
  });

  it("blocks by owner decision and refuses later admission", () => {
    const s = store();
    importContinuityBundle(writeBundle([capture()]), s, policy);
    reconcileWork(s, policy, { workId: "work:continuity", actorId: "actor:frank", decision: "block", reason: "Owner paused campaign." });
    assert.equal(continuityStatus(s, policy).works[0].state, "blocked");
    assert.throws(() => reconcileWork(s, policy, { workId: "work:continuity", actorId: "actor:frank", decision: "admit", reason: "x", acknowledgePaused: true }), /blocked/);
  });

  it("serializes concurrent imports with a lock that expires after a crash", () => {
    const s = store();
    mkdirSync(s, { recursive: true });
    writeFileSync(join(s, ".import.lock"), "999999");
    assert.match(importContinuityBundle(writeBundle([capture()]), s, policy).refusal ?? "", /in progress/);
    const old = new Date(Date.now() - 60_000);
    utimesSync(join(s, ".import.lock"), old, old);
    assert.equal(importContinuityBundle(writeBundle([capture()]), s, policy).status, "imported");
    assert.equal(existsSync(join(s, ".import.lock")), false);
  });
});
