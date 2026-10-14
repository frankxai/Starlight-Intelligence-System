/**
 * Starlight Queen Autonomic Single-Operator Engine Test Suite
 * Built on SIP — Queen Orchestration Tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { StarlightQueen } from "../src/orchestration/starlight-queen.js";
import type { QueenTaskAction } from "../src/orchestration/starlight-queen.js";

describe("Starlight Queen Single-Operator Autonomic Engine", () => {
  it("allows autonomous low-risk memory consolidation", () => {
    const queen = new StarlightQueen();
    const action: QueenTaskAction = {
      id: "action_consolidate_1",
      name: "Nightly Memory Dreaming Sweep",
      category: "memory_consolidation",
      riskTier: "low_autonomous",
      params: { max_items: 20 },
    };

    const res = queen.handleAction(action);
    assert.equal(res.executed, true);
    assert.match(res.receipt ?? "", /^queen_exec_/);
    assert.equal(queen.getOpenGates().length, 0);
  });

  it("fails closed on irreversible money movement and opens human escalation gate", () => {
    const queen = new StarlightQueen();
    const action: QueenTaskAction = {
      id: "action_payout_1",
      name: "Release Escrow Funds",
      category: "money_movement",
      riskTier: "high_irreversible_gate",
      params: { amountUsd: 1500, recipient: "contractor_node" },
    };

    const res = queen.handleAction(action);
    assert.equal(res.executed, false);
    assert.ok(res.gateOpened);
    assert.equal(res.gateOpened.requiredRole, "human_operator");

    const openGates = queen.getOpenGates();
    assert.equal(openGates.length, 1);
    assert.equal(openGates[0].gateId, res.gateOpened.gateId);

    // Human operator resolves gate
    const resolved = queen.resolveGate(res.gateOpened.gateId, true, "operator_signed_receipt_999");
    assert.equal(resolved, true);
    assert.equal(queen.getOpenGates().length, 0);
  });

  it("runs autonomic cycle sweep and reports status", () => {
    const queen = new StarlightQueen();
    const report = queen.runAutonomicCycle(5, 42);
    assert.equal(report.nodesAudited, 5);
    assert.equal(report.memoryEntriesConsolidated, 42);
    assert.equal(report.status, "healthy");
  });

  it("enqueues actions and drains queue according to risk tiers", () => {
    const queen = new StarlightQueen();
    queen.enqueueAction({
      id: "act_low",
      name: "Sweep Log",
      category: "health_sweep",
      riskTier: "low_autonomous",
      params: {},
    });
    queen.enqueueAction({
      id: "act_high",
      name: "Deploy Production Container",
      category: "deployment",
      riskTier: "high_irreversible_gate",
      params: {},
    });

    const drain = queen.drainQueue();
    assert.equal(drain.executed.length, 1);
    assert.equal(drain.gated.length, 1);
    assert.equal(drain.gated[0].actionId, "act_high");
  });

  it("tracks operator active liveness and heartbeat", () => {
    const queen = new StarlightQueen();
    assert.equal(queen.isOperatorActive(60000), true);
    queen.recordOperatorHeartbeat("ack_frank_01");
    assert.equal(queen.isOperatorActive(60000), true);
  });
  it("fails closed on production, destructive, irreversible or high-risk code edits", () => {
    for (const flag of ["production", "destructive", "irreversible", "highRisk"]) {
      const queen = new StarlightQueen();
      const action: QueenTaskAction = {
        id: `action_flag_${flag}`,
        name: "Overwrite production database migration script",
        category: "code_edit",
        riskTier: "medium_review",
        params: { [flag]: true },
      };
      assert.equal(queen.evaluateRisk(action), "high_irreversible_gate", flag);
      const res = queen.handleAction(action);
      assert.equal(res.executed, false, flag);
      assert.equal(queen.getOpenGates().length, 1, flag);
    }
    const queen = new StarlightQueen();
    assert.equal(queen.evaluateRisk({
      id: "action_plain_edit", name: "Edit docs", category: "code_edit",
      riskTier: "medium_review", params: { production: false },
    }), "medium_review");
  });
});
