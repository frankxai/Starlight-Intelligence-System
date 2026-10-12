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

  it("routes tasks accurately across cross-runtime targets", () => {
    const queen = new StarlightQueen();

    const route1 = queen.routeTask("Run a parallel agent swarm with browser control");
    assert.equal(route1.target, "antigravity");
    assert.ok(route1.confidence > 0.9);

    const route2 = queen.routeTask("Fast creative synthesis and personal excellence");
    assert.equal(route2.target, "grok");

    const route3 = queen.routeTask("Strict implementation and test fix refactoring");
    assert.equal(route3.target, "codex");

    const route4 = queen.routeTask("Execute background op tool call");
    assert.equal(route4.target, "openagent");

    const route5 = queen.routeTask("Architect core system topology");
    assert.equal(route5.target, "claude_code");

    const forced = queen.routeTask({ prompt: "anything", forceRuntime: "grok" });
    assert.equal(forced.target, "grok");
    assert.equal(forced.confidence, 1.0);
  });

  it("audits fleet node health and opens escalation gate on critical hazards", () => {
    const queen = new StarlightQueen();

    const healthyReport = queen.auditFleetHealth([
      { nodeId: "node_1", role: "agent", status: "healthy", lastSeen: new Date().toISOString() },
      { nodeId: "node_2", role: "robot", status: "healthy", lastSeen: new Date().toISOString() },
    ]);
    assert.equal(healthyReport.status, "healthy");
    assert.equal(healthyReport.hazardsDetected, 0);
    assert.equal(queen.getOpenGates().length, 0);

    const hazardReport = queen.auditFleetHealth([
      { nodeId: "node_1", role: "agent", status: "healthy", lastSeen: new Date().toISOString() },
      { nodeId: "node_bot", role: "robot", status: "unresponsive", hazardDetected: true, lastSeen: new Date().toISOString() },
    ]);
    assert.equal(hazardReport.status, "critical");
    assert.equal(hazardReport.hazardsDetected, 1);
    assert.equal(hazardReport.unresponsiveCount, 1);

    const openGates = queen.getOpenGates();
    assert.equal(openGates.length, 1);
    assert.equal(openGates[0].actionId, "fleet_health_alarm");
  });

  it("triages memory promotion and runs dreaming loops", () => {
    const queen = new StarlightQueen();

    const candidates = [
      { id: "mem_1", content: "High confidence core architectural rule", confidence: "high", accessCount: 5 },
      { id: "mem_2", content: "Unverified temporary hypothesis", confidence: "low", accessCount: 0 },
      { id: "mem_3", content: "Standard working observation", confidence: "medium", accessCount: 1 },
    ];

    const result = queen.runDreamingLoop(candidates);
    assert.deepEqual(result.promoted, ["mem_1"]);
    assert.deepEqual(result.retained, ["mem_3"]);
    assert.deepEqual(result.demoted, ["mem_2"]);
  });

  it("fails closed on production or irreversible code edits", () => {
    const queen = new StarlightQueen();

    const devAction: QueenTaskAction = {
      id: "code_dev_1",
      name: "Update local unit test",
      category: "code_edit",
      riskTier: "medium_review",
      params: { production: false },
    };
    assert.equal(queen.evaluateRisk(devAction), "medium_review");

    const prodAction: QueenTaskAction = {
      id: "code_prod_1",
      name: "Overwrite production database migration script",
      category: "code_edit",
      riskTier: "medium_review",
      params: { production: true },
    };
    assert.equal(queen.evaluateRisk(prodAction), "high_irreversible_gate");

    const res = queen.handleAction(prodAction);
    assert.equal(res.executed, false);
    assert.ok(res.gateOpened);
  });
});
