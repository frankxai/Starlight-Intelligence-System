import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseWorkGraphJsonl,
  projectWorkGraph,
  type WorkGraphEvent,
} from "../src/work-graph.js";

const at = "2026-08-05T12:00:00.000Z";

function event(
  eventId: string,
  kind: WorkGraphEvent["kind"],
  data: Record<string, unknown> = {},
): WorkGraphEvent {
  return {
    schemaVersion: "1.0",
    eventId,
    workId: "work_sis_mesh",
    correlationId: "corr_sis_mesh",
    projectId: "frankxai/Starlight-Intelligence-System",
    kind,
    source: {
      system: "hermes",
      sourceId: "session_20260805",
    },
    actorId: "agent:hermes",
    occurredAt: at,
    observedAt: at,
    evidenceRefs: [`evidence://${eventId}`],
    visibility: "internal",
    retention: "audit",
    summary: kind,
    data,
  };
}

describe("operational work graph", () => {
  it("refuses completion until every admitted proof gate is satisfied", () => {
    const result = projectWorkGraph([
      event("evt_admit", "work.admitted", {
        requirements: {
          artifact: true,
          change: true,
          checks: true,
          deployment: false,
          verification: true,
        },
      }),
      event("evt_artifact", "artifact.produced"),
      event("evt_change", "change.opened"),
      event("evt_check", "check.passed"),
      event("evt_complete", "work.completed"),
    ]);

    assert.equal(result.workItems.length, 1);
    assert.equal(result.workItems[0]?.completed, false);
    assert.equal(result.workItems[0]?.readyToComplete, false);
    assert.deepEqual(result.workItems[0]?.missingProofs, ["verification"]);
    assert.ok(result.issues.some((issue) => issue.code === "completion-gate-failed"));
  });

  it("deduplicates identical retries and rejects conflicting event ids", () => {
    const admitted = event("evt_admit", "work.admitted", {
      requirements: {
        artifact: true,
        change: false,
        checks: false,
        deployment: false,
        verification: false,
      },
    });
    const artifact = event("evt_artifact", "artifact.produced");
    const conflicting = { ...artifact, kind: "check.passed" as const };

    const result = projectWorkGraph([admitted, artifact, { ...artifact }, conflicting]);

    assert.deepEqual(result.workItems[0]?.proofEventIds.artifact, ["evt_artifact"]);
    assert.deepEqual(result.workItems[0]?.proofEventIds.checks, []);
    assert.ok(result.issues.some((issue) => issue.code === "event-id-conflict"));
  });

  it("rejects malformed ingress before it reaches the projection", () => {
    const malformed = {
      ...event("evt_invalid", "artifact.produced"),
      observedAt: "not-a-timestamp",
      evidenceRefs: [],
    };

    const parsed = parseWorkGraphJsonl(`${JSON.stringify(malformed)}\n`);

    assert.deepEqual(parsed.events, []);
    assert.equal(parsed.issues[0]?.code, "invalid-event");
    assert.match(parsed.issues[0]?.message ?? "", /observedAt/);
    assert.match(parsed.issues[0]?.message ?? "", /evidenceRefs/);
  });

  it("enforces schema parity for admission, timestamps, source, and unknown fields", () => {
    const malformed = {
      ...event("evt_invalid_admission", "work.admitted"),
      occurredAt: "2026-08-05",
      source: {
        system: "hermes",
        sourceId: "session_20260805",
        uri: "",
        unexpected: true,
      },
      unexpected: true,
      data: { requirements: { artifact: true } },
    };

    const parsed = parseWorkGraphJsonl(`${JSON.stringify(malformed)}\n`);

    assert.deepEqual(parsed.events, []);
    assert.match(parsed.issues[0]?.message ?? "", /occurredAt/);
    assert.match(parsed.issues[0]?.message ?? "", /source\.uri/);
    assert.match(parsed.issues[0]?.message ?? "", /unknown source field/);
    assert.match(parsed.issues[0]?.message ?? "", /unknown event field/);
    assert.match(parsed.issues[0]?.message ?? "", /requirements/);
  });

  it("requires explicit admission before work can complete", () => {
    const result = projectWorkGraph([
      event("evt_artifact", "artifact.produced"),
      event("evt_complete", "work.completed"),
    ]);

    assert.equal(result.workItems[0]?.completed, false);
    assert.equal(result.workItems[0]?.admitted, false);
    assert.ok(result.issues.some((issue) => issue.code === "completion-gate-failed"));
  });
});
