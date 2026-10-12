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

  it("ingests telemetry and trips to e-stop on hardware safety trigger", () => {
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

    const res = kernel.ingestTelemetry({
      robotId: "bot_01",
      batteryPercent: 88,
      position: { x: 2, y: 3, z: 0, frameId: "map" },
      hardwareEStopTriggered: true,
      timestamp: new Date().toISOString(),
    });

    assert.equal(res.accepted, true);
    assert.equal(res.nodeStatus, "e-stopped");
    assert.equal(kernel.getNode("bot_01")?.safetyLocked, true);
  });

  it("disconnects nodes on deadman timeout", () => {
    const kernel = new RobotContinuityKernel();
    const staleTime = new Date(Date.now() - 20000).toISOString();
    kernel.registerNode({
      robotId: "bot_stale",
      name: "Stale Node",
      model: "mobile_base",
      middleware: "ros2",
      status: "idle",
      safetyLocked: false,
      lastHeartbeat: staleTime,
    });

    const deadman = kernel.checkDeadman(5000);
    assert.ok(deadman.disconnectedRobots.includes("bot_stale"));
    assert.equal(kernel.getNode("bot_stale")?.status, "disconnected");
  });

  it("formats standard ROS2/Zenoh messages", () => {
    const kernel = new RobotContinuityKernel();
    const eStopMsg = kernel.formatRos2Message({
      commandId: "e_1",
      robotId: "bot_01",
      action: "emergency_stop",
      safetyEnvelopeRadiusMeters: 0,
      requiresHumanSupervision: false,
      issuedAt: "2026-10-11T00:00:00Z",
    });
    assert.equal(eStopMsg.topic, "/fleet/bot_01/emergency_stop");
    assert.equal(eStopMsg.messageType, "std_msgs/msg/Bool");

    const navMsg = kernel.formatRos2Message({
      commandId: "nav_1",
      robotId: "bot_01",
      action: "navigate",
      targetCoordinates: { x: 4, y: 5, z: 0, frameId: "map" },
      safetyEnvelopeRadiusMeters: 1.0,
      requiresHumanSupervision: false,
      issuedAt: "2026-10-11T00:00:00Z",
    });
    assert.equal(navMsg.topic, "/fleet/bot_01/goal_pose");
    assert.equal(navMsg.messageType, "geometry_msgs/msg/PoseStamped");
  });
});
