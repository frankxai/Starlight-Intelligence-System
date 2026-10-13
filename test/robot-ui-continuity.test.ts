import test from "node:test";
import assert from "node:assert/strict";

// Import safety envelope logic from RobotContinuityKernel
import { RobotContinuityKernel } from "../src/robotics/continuity-kernel.js";

test("Robot Fleet UI & Kernel Invariants — Hazard Zone Proximity Safety", () => {
  const kernel = new RobotContinuityKernel();

  // Register a physical quadruped node
  kernel.registerNode({
    robotId: "rover-zenoh-01",
    name: "Ares-4 Quadruped",
    model: "Spot-v2",
    middleware: "zenoh",
    status: "idle",
    safetyLocked: false,
    lastHeartbeat: new Date().toISOString(),
  });

  // Record a hazard zone landmark
  kernel.recordLandmark({
    id: "hz-1",
    name: "High Voltage Substation",
    category: "hazard_zone",
    coordinates: { x: 80, y: 30, z: 0, frameId: "map" },
  });

  // Test 1: Navigation command into safe area
  const safeCmdResult = kernel.evaluateSafety({
    commandId: "cmd-001",
    robotId: "rover-zenoh-01",
    action: "navigate",
    targetCoordinates: { x: 40, y: 40, z: 0, frameId: "map" },
    safetyEnvelopeRadiusMeters: 10,
    requiresHumanSupervision: false,
    issuedAt: new Date().toISOString(),
  });

  assert.equal(safeCmdResult.passed, true);
  assert.equal(safeCmdResult.rule, "BENEVOLENT_SAFETY_ENVELOPE_VERIFIED");

  // Test 2: Navigation command breaching hazard zone envelope
  const hazardCmdResult = kernel.evaluateSafety({
    commandId: "cmd-002",
    robotId: "rover-zenoh-01",
    action: "navigate",
    targetCoordinates: { x: 82, y: 31, z: 0, frameId: "map" },
    safetyEnvelopeRadiusMeters: 10,
    requiresHumanSupervision: false,
    issuedAt: new Date().toISOString(),
  });

  assert.equal(hazardCmdResult.passed, false);
  assert.equal(hazardCmdResult.rule, "HAZARD_ZONE_PROXIMITY");

  // Dispatching hazardous command triggers instant fail-closed e-stop
  const dispatchRes = kernel.dispatchCommand({
    commandId: "cmd-002",
    robotId: "rover-zenoh-01",
    action: "navigate",
    targetCoordinates: { x: 82, y: 31, z: 0, frameId: "map" },
    safetyEnvelopeRadiusMeters: 10,
    requiresHumanSupervision: false,
    issuedAt: new Date().toISOString(),
  });

  assert.equal(dispatchRes.dispatched, false);
  assert.equal(dispatchRes.executionState, "e-stopped");
  assert.equal(kernel.getNode("rover-zenoh-01")?.safetyLocked, true);
});

test("Robot Fleet UI & Kernel Invariants — Human Inspection Unlock Receipt", () => {
  const kernel = new RobotContinuityKernel();

  kernel.registerNode({
    robotId: "rover-zenoh-01",
    name: "Ares-4 Quadruped",
    model: "Spot-v2",
    middleware: "zenoh",
    status: "e-stopped",
    safetyLocked: true,
    lastHeartbeat: new Date().toISOString(),
  });

  // Invalid receipt fails
  const invalidUnlock = kernel.unlockNodeWithHumanReceipt("rover-zenoh-01", "invalid_receipt_123");
  assert.equal(invalidUnlock, false);
  assert.equal(kernel.getNode("rover-zenoh-01")?.safetyLocked, true);

  // Valid receipt unlocks
  const validUnlock = kernel.unlockNodeWithHumanReceipt("rover-zenoh-01", "human_ack_certified_op_942");
  assert.equal(validUnlock, true);
  assert.equal(kernel.getNode("rover-zenoh-01")?.safetyLocked, false);
  assert.equal(kernel.getNode("rover-zenoh-01")?.status, "idle");
});
