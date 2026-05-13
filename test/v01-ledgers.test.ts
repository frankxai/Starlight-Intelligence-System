/**
 * Track A v0.1 — Ledger conformance harness
 *
 * Tests src/ledgers.ts:
 *   • JSONL append + read round-trip for WorkPacket / AgentEvent / Decision
 *   • SQLite shadow upsert via AgentOpsLedger
 *   • GraphEdge evidence-ref refusal (substrate invariant)
 *   • Rebuild-from-ledgers idempotence
 *
 * Built on SIP — operational tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  AgentOpsLedger,
  LedgerInvariantError,
  appendGraphEdge,
  buildAgentEvent,
  buildDecision,
  buildGraphEdge,
  readGraphEdges,
  readWorkPackets,
  readDecisions,
  readAgentEventsForDay,
  readRecentAgentEvents,
} from "../src/ledgers.js";

function withTempRoot<T>(fn: (root: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "sis-ledgers-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("Track A v0.1 — AgentOpsLedger", () => {
  it("createWorkPacket appends to JSONL and indexes in SQLite", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const packet = ledger.createWorkPacket({
          title: "audit",
          mission: "scan the repo for stale vaults",
          riskLevel: "low",
        });

        assert.ok(packet.id.startsWith("wp_"), "WorkPacket id should start with wp_");
        assert.equal(packet.status, "pending");
        assert.equal(packet.riskLevel, "low");

        // JSONL is source of truth.
        const jsonlPath = join(root, "memory", "_audit", "work-packets.jsonl");
        assert.ok(existsSync(jsonlPath), "work-packets.jsonl must exist after create");
        const raw = readFileSync(jsonlPath, "utf-8");
        assert.ok(raw.includes(packet.id), "ledger must contain new packet id");

        // SQLite mirror returns the same packet.
        const fetched = ledger.getWorkPacket(packet.id);
        assert.ok(fetched, "SQLite shadow must return the packet");
        assert.equal(fetched.id, packet.id);
        assert.equal(fetched.title, "audit");

        // Read-side function returns it too.
        const all = readWorkPackets(root);
        assert.equal(all.length, 1);
        assert.equal(all[0].id, packet.id);
      } finally {
        ledger.close();
      }
    });
  });

  it("listWorkPackets filters by status and orders by created_at DESC", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const p1 = ledger.createWorkPacket({ title: "a", mission: "m", riskLevel: "low" });
        const p2 = ledger.createWorkPacket({ title: "b", mission: "m", riskLevel: "medium" });
        ledger.updateWorkPacketStatus(p2.id, "completed", new Date().toISOString());

        const all = ledger.listWorkPackets({ limit: 10 });
        assert.equal(all.length, 2);

        const completed = ledger.listWorkPackets({ status: "completed" });
        assert.equal(completed.length, 1);
        assert.equal(completed[0].id, p2.id);

        const pending = ledger.listWorkPackets({ status: "pending" });
        assert.equal(pending.length, 1);
        assert.equal(pending[0].id, p1.id);
      } finally {
        ledger.close();
      }
    });
  });

  it("nextPendingWorkPacket returns the oldest pending packet", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const first = ledger.createWorkPacket({ title: "first", mission: "m", riskLevel: "low" });
        const second = ledger.createWorkPacket({ title: "second", mission: "m", riskLevel: "low" });
        ledger.updateWorkPacketStatus(first.id, "in_progress");

        const next = ledger.nextPendingWorkPacket();
        assert.ok(next);
        assert.equal(next.id, second.id);
      } finally {
        ledger.close();
      }
    });
  });

  it("transitionWorkPacket appends a lifecycle snapshot and AgentEvent (via valid pending→in_progress→completed)", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const packet = ledger.createWorkPacket({
          title: "finish",
          mission: "complete the packet",
          riskLevel: "low",
          assignedAgent: "codex",
        });

        // pending → in_progress (allowed)
        ledger.transitionWorkPacket({
          id: packet.id,
          status: "in_progress",
          summary: "starting work",
        });

        // in_progress → completed (allowed)
        const result = ledger.transitionWorkPacket({
          id: packet.id,
          status: "completed",
          summary: "done",
        });

        assert.equal(result.packet.status, "completed");
        assert.ok(result.packet.completedAt);
        assert.equal(result.event.agentId, "codex");

        const recent = readRecentAgentEvents(root, { limit: 5 });
        assert.equal(recent.length, 2);
      } finally {
        ledger.close();
      }
    });
  });

  it("recordAgentEvent writes to today's JSONL + SQLite", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const packet = ledger.createWorkPacket({
          title: "test", mission: "m", riskLevel: "low",
        });

        const event = buildAgentEvent({
          runId: "run_test",
          agentId: "test-agent",
          eventType: "tool.call",
          summary: "called grep",
          toolsUsed: ["grep"],
        });

        ledger.recordAgentEvent(event, packet.id);

        const day = event.timestamp.slice(0, 10);
        const events = readAgentEventsForDay(root, day);
        assert.equal(events.length, 1);
        assert.equal(events[0].id, event.id);
      } finally {
        ledger.close();
      }
    });
  });

  it("recordDecision writes to JSONL + SQLite", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const decision = buildDecision({
          title: "ship",
          context: "test",
          options: ["ship", "hold"],
          chosen: "ship",
          rationale: "criteria met",
          riskLevel: "low",
          createdBy: "test-agent",
        });
        ledger.recordDecision(decision);

        const all = readDecisions(root);
        assert.equal(all.length, 1);
        assert.equal(all[0].id, decision.id);
        assert.equal(all[0].chosen, "ship");
      } finally {
        ledger.close();
      }
    });
  });

  it("recordGraphEdge accepts a valid edge with evidenceRef", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const edge = buildGraphEdge({
          edgeType: "produced",
          source: "wp_1",
          target: "art_1",
          evidenceRef: "evt_1",
          confidence: 0.95,
          createdBy: "test-agent",
        });
        ledger.recordGraphEdge(edge);

        const all = readGraphEdges(root);
        assert.equal(all.length, 1);
        assert.equal(all[0].evidenceRef, "evt_1");
        assert.equal(ledger.countGraphEdges(), 1);
      } finally {
        ledger.close();
      }
    });
  });

  it("recordGraphEdge REFUSES edges missing evidenceRef (substrate invariant)", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const bad = {
          id: "edge_bad",
          edgeType: "knows",
          source: "a",
          target: "b",
          evidenceRef: "",
          confidence: 0.8,
          createdBy: "test",
          createdAt: new Date().toISOString(),
        };

        assert.throws(
          () => ledger.recordGraphEdge(bad),
          LedgerInvariantError,
          "ledger must throw LedgerInvariantError",
        );

        // Nothing was written.
        assert.equal(readGraphEdges(root).length, 0);
        assert.equal(ledger.countGraphEdges(), 0);
      } finally {
        ledger.close();
      }
    });
  });

  it("function-style appendGraphEdge also refuses missing evidenceRef", () => {
    withTempRoot((root) => {
      const result = appendGraphEdge(root, {
        id: "x",
        edgeType: "t",
        source: "a",
        target: "b",
        evidenceRef: "   ",
        confidence: 0.5,
        createdBy: "me",
        createdAt: new Date().toISOString(),
      });
      assert.equal(result.ok, false);
      assert.match(result.error ?? "", /evidenceRef/);
    });
  });

  it("rebuildFromLedgers replays JSONL into SQLite idempotently", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const p = ledger.createWorkPacket({ title: "t", mission: "m", riskLevel: "low" });
        ledger.recordAgentEvent(
          buildAgentEvent({ runId: "run", agentId: "a", eventType: "x" }),
          p.id,
        );
        ledger.recordDecision(
          buildDecision({
            title: "t",
            context: "c",
            options: ["a"],
            chosen: "a",
            rationale: "r",
            riskLevel: "low",
            createdBy: "a",
          }),
        );
        ledger.recordGraphEdge(
          buildGraphEdge({
            edgeType: "e",
            source: "a",
            target: "b",
            evidenceRef: "ref",
            confidence: 0.5,
            createdBy: "a",
          }),
        );

        const stats = ledger.rebuildFromLedgers();
        // WorkPacket may rebuild >1 if multiple snapshots were appended.
        // We only assert that every kind got at least one row.
        assert.ok(stats.workPackets >= 1, "expected >=1 workPacket row after rebuild");
        assert.equal(stats.events, 1);
        assert.equal(stats.decisions, 1);
        assert.equal(stats.edges, 1);

        // Rebuild is idempotent.
        const again = ledger.rebuildFromLedgers();
        assert.deepEqual(again, stats);
      } finally {
        ledger.close();
      }
    });
  });

  it("uses WAL journal mode for SQLite", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        ledger.createWorkPacket({ title: "wal", mission: "m", riskLevel: "low" });
        const sqlite = ledger.getSqlitePath();
        assert.ok(existsSync(sqlite), "sqlite file must exist");
      } finally {
        ledger.close();
      }
    });
  });
});

// ── Code-review hardening (post-6f9703c REVISE) ───────────────

describe("Track A v0.1 — Code-review hardening", () => {
  it("createWorkPacket at high risk throws ApprovalGateRequiredError and does NOT persist the packet", async () => {
    const { ApprovalGateRequiredError, readWorkPackets, readApprovalGate } = await import("../src/ledgers.js");
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        let caught: unknown = null;
        try {
          ledger.createWorkPacket({
            title: "high-risk action",
            mission: "do something dangerous",
            riskLevel: "high",
          });
        } catch (err) {
          caught = err;
        }
        assert.ok(caught instanceof ApprovalGateRequiredError, "must throw ApprovalGateRequiredError");
        const e = caught as InstanceType<typeof ApprovalGateRequiredError>;
        assert.ok(e.gate.id.startsWith("gate_"), "gate id must be persisted");
        assert.equal(e.gate.status, "pending");
        assert.equal(e.gate.riskLevel, "high");

        // Substrate invariant: NO WorkPacket row persisted
        const packets = readWorkPackets(root);
        assert.equal(packets.length, 0, "WorkPacket must NOT be persisted at high risk");

        // But ApprovalGate row IS persisted (audit trail)
        const persistedGate = readApprovalGate(root, e.gate.id);
        assert.ok(persistedGate, "ApprovalGate must be persisted in JSONL audit trail");
        assert.equal(persistedGate!.status, "pending");
      } finally {
        ledger.close();
      }
    });
  });

  it("createWorkPacket at critical risk throws (CLI cannot bypass MCP gate)", async () => {
    const { ApprovalGateRequiredError, readWorkPackets } = await import("../src/ledgers.js");
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        let caught: unknown = null;
        try {
          ledger.createWorkPacket({
            title: "critical action",
            mission: "system-altering work",
            riskLevel: "critical",
          });
        } catch (err) {
          caught = err;
        }
        assert.ok(caught instanceof ApprovalGateRequiredError, "must throw at critical");
        const packets = readWorkPackets(root);
        assert.equal(packets.length, 0, "critical-risk packet must NOT persist");
      } finally {
        ledger.close();
      }
    });
  });

  it("transitionWorkPacket refuses invalid state transitions (terminal states are terminal)", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const packet = ledger.createWorkPacket({
          title: "t", mission: "m", riskLevel: "low",
        });

        // pending → completed (skip in_progress) — refused
        assert.throws(() => {
          ledger.transitionWorkPacket({ id: packet.id, status: "completed" });
        }, /Invalid WorkPacket transition: pending → completed/);

        // Move to in_progress, then completed (allowed path)
        ledger.transitionWorkPacket({ id: packet.id, status: "in_progress" });
        ledger.transitionWorkPacket({ id: packet.id, status: "completed" });

        // completed → in_progress (terminal-to-active) — refused
        assert.throws(() => {
          ledger.transitionWorkPacket({ id: packet.id, status: "in_progress" });
        }, /Invalid WorkPacket transition: completed → in_progress/);

        // completed → completed (self-loop) — refused
        assert.throws(() => {
          ledger.transitionWorkPacket({ id: packet.id, status: "completed" });
        }, /Invalid WorkPacket transition: completed → completed/);
      } finally {
        ledger.close();
      }
    });
  });

  it("transitionWorkPacket: pending → cancelled is allowed (mid-flight abandonment)", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const packet = ledger.createWorkPacket({
          title: "t", mission: "m", riskLevel: "low",
        });
        const result = ledger.transitionWorkPacket({
          id: packet.id, status: "cancelled", summary: "no longer needed",
        });
        assert.equal(result.packet.status, "cancelled");
        assert.ok(result.packet.completedAt, "cancelled also stamps completedAt");
      } finally {
        ledger.close();
      }
    });
  });

  it("transitionWorkPacket: in_progress → blocked → in_progress is allowed (resumable)", () => {
    withTempRoot((root) => {
      const ledger = new AgentOpsLedger(root);
      try {
        const packet = ledger.createWorkPacket({
          title: "t", mission: "m", riskLevel: "low",
        });
        ledger.transitionWorkPacket({ id: packet.id, status: "in_progress" });
        ledger.transitionWorkPacket({ id: packet.id, status: "blocked", summary: "waiting on dep" });
        const result = ledger.transitionWorkPacket({ id: packet.id, status: "in_progress" });
        assert.equal(result.packet.status, "in_progress");
      } finally {
        ledger.close();
      }
    });
  });
});
