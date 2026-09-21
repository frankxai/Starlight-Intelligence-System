import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runWorkGraphCli } from "../src/work-graph-cli.js";
import type { WorkGraphEvent } from "../src/work-graph.js";

function graphEvent(
  eventId: string,
  kind: WorkGraphEvent["kind"],
  data: Record<string, unknown> = {},
): WorkGraphEvent {
  return {
    schemaVersion: "1.0",
    eventId,
    workId: "work_cli",
    correlationId: "corr_cli",
    projectId: "frankxai/Starlight-Intelligence-System",
    kind,
    source: { system: "github", sourceId: eventId },
    actorId: "agent:test",
    occurredAt: "2026-08-05T12:00:00.000Z",
    observedAt: "2026-08-05T12:00:00.000Z",
    evidenceRefs: [`evidence://${eventId}`],
    visibility: "internal",
    retention: "audit",
    summary: kind,
    data,
  };
}

describe("work graph CLI", () => {
  it("projects a JSONL delivery stream into a completion receipt", () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-work-graph-cli-"));
    try {
      const path = join(dir, "events.jsonl");
      writeFileSync(
        path,
        [
          graphEvent("evt_admit", "work.admitted", {
            requirements: {
              artifact: true,
              change: false,
              checks: false,
              deployment: false,
              verification: false,
            },
          }),
          graphEvent("evt_artifact", "artifact.produced"),
          graphEvent("evt_complete", "work.completed"),
        ].map((item) => JSON.stringify(item)).join("\n") + "\n",
        "utf8",
      );

      const result = runWorkGraphCli(["project", path]);
      const output = JSON.parse(result.stdout) as {
        workItems: Array<{ completed: boolean }>;
        issues: unknown[];
      };

      assert.equal(result.exitCode, 0);
      assert.equal(output.workItems[0]?.completed, true);
      assert.deepEqual(output.issues, []);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
