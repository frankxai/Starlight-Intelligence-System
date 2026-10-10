/**
 * Robot Fleet Continuity & Actuator Bridge Test Suite
 * Built on SIP — Robotics Substrate Tier
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RobotContinuityKernel } from "../src/robotics/continuity-kernel.js";
import type { RobotFleetNode, RobotActuatorCommand, SpatialLandmark } from "../src/robotics/continuity-kernel.js";

describe("Robot Fleet Continuity Kernel", () => {
  it("registers nodes and landmarks", () => {
    const kernel = new RobotContinuityKernel();
    const node: RobotFleetNode = {
      robotId: "bot_01",
      name: "Unitree Go2 Pro",
      model: "quadruped",
      middleware: "zenoh",
      status: "idle",
      safetyLocked: false,
      lastHeartbeat: new Date().toISOString(),
    };
    kernel.registerNode(node);
    assert.equal(kernel.getNode("bot_01")?.name, "Unitree Go2 Pro");

    const hazard: SpatialLandmark = {
      id: "hazard_1",
      name: "Deep Pit",
      category: "hazard_zone",
      coordinates: { x: 10, y: 10, z: 0, frameId: "map" },
    };
    kernel.recordLandmark(hazard);
    assert.equal(kernel.getLandmarks().length, 1);
  });

  it("permits safe navigation command within safety envelope", () => {
    const kernel = new RobotContinuityKernel();
    kernel.registerNode({
      robotId: "bot_01",
      name: "Unitree Go2 Pro",
      model: "quadruped",
      middleware: "zenoh",
      status: "idle",
      safetyLocked: false,
      lastHeartbeat: new Date().toISOString(),
    });

    const cmd: RobotActuatorCommand = {
      commandId: "cmd_01",
      robotId: "bot_01",
      action: "navigate",
      targetCoordinates: { x: 1, y: 1, z: 0, frameId: "map" },
      safetyEnvelopeRadiusMeters: 1.5,
      requiresHumanSupervision: false,
      issuedAt: new Date().toISOString(),
    };

    const res = kernel.dispatchCommand(cmd);
    assert.equal(res.dispatched, true);
    assert.equal(res.executionState, "executing");
  });

  it("fails closed and locks node on hazard zone boundary breach", () => {
    const kernel = new RobotContinuityKernel();
    kernel.registerNode({
      robotId: "bot_01",
      name: "Unitree Go2 Pro",
      model: "quadruped",
      middleware: "zenoh",
      status: "idle",
      safetyLocked: false,
      lastHeartbeat: new Date().toISOString(),
    });
    kernel.recordLandmark({
      id: "hazard_pit",
      name: "High Voltage Electrical Transformer",
      category: "hazard_zone",
      coordinates: { x: 5, y: 5, z: 0, frameId: "map" },
    });

    // Command targets dangerously close to hazard zone
    const dangerousCmd: RobotActuatorCommand = {
      commandId: "cmd_danger",
      robotId: "bot_01",
      action: "navigate",
      targetCoordinates: { x: 5.2, y: 5.1, z: 0, frameId: "map" }, // Distance < 0.3m
      safetyEnvelopeRadiusMeters: 2.0, // Envelope is 2.0m -> Violation!
      requiresHumanSupervision: false,
      issuedAt: new Date().toISOString(),
    };

    const res = kernel.dispatchCommand(dangerousCmd);
    assert.equal(res.dispatched, false);
    assert.equal(res.executionState, "e-stopped");
    assert.equal(kernel.getNode("bot_01")?.safetyLocked, true);
  });
});
