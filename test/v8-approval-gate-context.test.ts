/**
 * H3 regression — ApprovalGate audit-trail enrichment.
 *
 * Issue (review 2026-05-12): openApprovalGate used to discard `_reason` and
 * create gates with `workPacketId: ''` and no link to what was being approved.
 * Auditor drilling into a refused high-risk decision could not answer "what
 * was asked?" from the ledger alone.
 *
 * Fix: ApprovalGate now carries:
 *   - `reason` (why this gate opened)
 *   - `pendingContext.{kind,payload}` (the input that was refused)
 *
 * This test pins the contract: every gate row produced by a high/critical
 * risk path must include reason + pendingContext so the audit trail is whole.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SisMcpServerV01 } from "../src/mcp-server-v01.js";

function withServer<T>(fn: (s: SisMcpServerV01, root: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), "v8-gate-"));
  const server = new SisMcpServerV01({
    repoRoot: root,
    vaultStoragePath: join(root, ".starlight"),
  });
  try {
    return fn(server, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function readApprovalLedger(root: string): unknown[] {
  const path = join(root, "memory", "_audit", "approvals.jsonl");
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf-8")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l));
}

describe("H3 ApprovalGate audit-trail enrichment", () => {
  it("sis.decision.log at risk=high opens a gate with reason + pendingContext", () => {
    withServer((server, root) => {
      const r = server.callTool("sis.decision.log", {
        title: "Drop Neo4j",
        context: "Defer hard graph DB to post-v1",
        options: ["keep", "drop"],
        chosen: "drop",
        rationale: "Cost > value at v0.1",
        risk_level: "high",
      }) as { status: string; approvalGateId: string };

      assert.equal(r.status, "approval_required");
      assert.ok(r.approvalGateId.startsWith("gate_"));

      const rows = readApprovalLedger(root) as Array<{
        id: string;
        reason?: string;
        pendingContext?: { kind: string; payload: { title: string; chosen: string } };
      }>;
      assert.equal(rows.length, 1);
      const gate = rows[0];
      assert.equal(gate.id, r.approvalGateId);
      assert.ok(gate.reason, "gate.reason must be populated (H3)");
      assert.match(gate.reason, /Decision/i);
      assert.ok(gate.pendingContext, "gate.pendingContext must be populated (H3)");
      assert.equal(gate.pendingContext.kind, "decision");
      assert.equal(gate.pendingContext.payload.title, "Drop Neo4j");
      assert.equal(gate.pendingContext.payload.chosen, "drop");
    });
  });

  it("sis.decision.log at risk=critical opens a gate with reason + pendingContext", () => {
    withServer((server, root) => {
      const r = server.callTool("sis.decision.log", {
        title: "Wipe ledger",
        context: "Destructive op",
        options: ["wipe", "abort"],
        chosen: "wipe",
        rationale: "test",
        risk_level: "critical",
      }) as { status: string };
      assert.equal(r.status, "approval_required");
      const rows = readApprovalLedger(root) as Array<{
        reason?: string;
        pendingContext?: { kind: string };
      }>;
      assert.equal(rows.length, 1);
      assert.ok(rows[0].reason);
      assert.equal(rows[0].pendingContext?.kind, "decision");
    });
  });

  it("sis.workpacket.create at risk=high opens a gate with title hint + pendingContext", () => {
    withServer((server, root) => {
      const r = server.callTool("sis.workpacket.create", {
        title: "Migrate prod cluster",
        mission: "swap region",
        allowed_tools: ["kubectl"],
        allowed_paths: ["/"],
        risk_level: "high",
      }) as { status: string; approvalGateId: string };

      assert.equal(r.status, "approval_required");

      const rows = readApprovalLedger(root) as Array<{
        workPacketId: string;
        reason?: string;
        pendingContext?: { kind: string; payload: { title: string } };
      }>;
      assert.equal(rows.length, 1);
      const gate = rows[0];
      // H3: workPacketId carries a greppable title hint instead of empty string
      assert.match(gate.workPacketId, /<pending:Migrate prod cluster>/);
      assert.ok(gate.reason);
      assert.equal(gate.pendingContext?.kind, "workpacket");
      assert.equal(gate.pendingContext.payload.title, "Migrate prod cluster");
    });
  });

  it("sis.workpacket.create at risk=low (below gate) does NOT open a gate", () => {
    withServer((server, root) => {
      const r = server.callTool("sis.workpacket.create", {
        title: "Routine task",
        mission: "test",
        allowed_tools: [],
        allowed_paths: [],
        risk_level: "low",
      }) as { ok: boolean; workPacket: { id: string } };
      assert.equal(r.ok, true, "low-risk WorkPacket must succeed");
      assert.match(r.workPacket.id, /^wp_/);
      const rows = readApprovalLedger(root);
      assert.equal(rows.length, 0, "no gate for low-risk");
    });
  });
});
