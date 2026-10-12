import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RobotContinuityKernel,
  type RobotFleetNode,
} from "../src/robotics/continuity-kernel.js";
import {
  TrapezoidVelocityProfiler,
  SpatialPointCloudSemanticExtractor,
  ZenohRealtimeBridge,
  type DetectedObjectCluster,
} from "../src/robotics/zenoh-bridge.js";

describe("Robot Fleet — Zenoh Bridge & Actuation Profiler", () => {
  it("smooths step velocity respecting acceleration constraints", () => {
    const profiler = new TrapezoidVelocityProfiler({
      maxLinearAccMps2: 1.0, // 1.0 m/s^2
      maxLinearVelMps: 2.0,
    });

    const now = Date.now();
    // Step 1: Request 2.0 m/s suddenly after 500ms
    const step1 = profiler.step({ linearX: 2.0, linearY: 0, angularZ: 0 }, now + 500);
    // At 1.0 m/s^2 and 0.5s dt, max delta is 0.5 m/s
    assert.ok(step1.linearX <= 0.51 && step1.linearX >= 0.49);

    // Step 2: Another 500ms
    const step2 = profiler.step({ linearX: 2.0, linearY: 0, angularZ: 0 }, now + 1000);
    assert.ok(step2.linearX <= 1.01 && step2.linearX >= 0.99);

    // Reset
    profiler.reset();
    assert.equal(profiler.getCurrentVelocity().linearX, 0);
  });

  it("extracts and categorizes spatial perception clusters into landmarks", () => {
    const dockCluster: DetectedObjectCluster = {
      id: "cluster-dock-01",
      label: "charging_dock",
      confidence: 0.92,
      centroid: { x: 5.0, y: 12.0, z: 0.0, frameId: "map" },
      dimensions: { width: 0.8, depth: 0.6, height: 0.4 },
    };

    const hazardCluster: DetectedObjectCluster = {
      id: "cluster-fire-01",
      label: "fire_hazard_area",
      confidence: 0.88,
      centroid: { x: 8.5, y: -3.2, z: 0.0, frameId: "map" },
      dimensions: { width: 2.0, depth: 2.0, height: 1.0 },
    };

    const lowConfidenceCluster: DetectedObjectCluster = {
      id: "cluster-ghost",
      label: "human_obstacle",
      confidence: 0.45,
      centroid: { x: 1.0, y: 1.0, z: 0.0, frameId: "map" },
      dimensions: { width: 0.5, depth: 0.5, height: 1.8 },
    };

    const dock = SpatialPointCloudSemanticExtractor.extractLandmark(dockCluster);
    assert.ok(dock);
    assert.equal(dock?.category, "charging_station");
    assert.equal(dock?.coordinates.x, 5.0);

    const hazard = SpatialPointCloudSemanticExtractor.extractLandmark(hazardCluster);
    assert.ok(hazard);
    assert.equal(hazard?.category, "hazard_zone");

    const rejected = SpatialPointCloudSemanticExtractor.extractLandmark(lowConfidenceCluster);
    assert.equal(rejected, null);
  });

  it("bridges velocity commands and fails closed when robot is safety-locked", async () => {
    const kernel = new RobotContinuityKernel();
    const node: RobotFleetNode = {
      robotId: "unitree-go2-01",
      name: "Unitree Quadruped Sentinel",
      model: "Unitree Go2 Pro",
      middleware: "zenoh",
      status: "idle",
      safetyLocked: false,
      lastHeartbeat: new Date().toISOString(),
    };
    kernel.registerNode(node);

    const bridge = new ZenohRealtimeBridge(kernel);
    await bridge.connect();
    assert.equal(bridge.isActive(), true);

    // 1. Dispatch safe velocity
    const result1 = bridge.publishVelocityCommand("unitree-go2-01", {
      linearX: 1.5,
      linearY: 0,
      angularZ: 0.2,
    });
    assert.equal(result1.dispatched, true);
    assert.ok(result1.smoothed.linearX > 0);
    assert.equal(result1.ros2Message.topic, "/fleet/unitree-go2-01/cmd_vel");

    // 2. Lock node for safety
    const registered = kernel.getNode("unitree-go2-01")!;
    registered.safetyLocked = true;
    const result2 = bridge.publishVelocityCommand("unitree-go2-01", {
      linearX: 1.5,
      linearY: 0,
      angularZ: 0.2,
    });
    assert.equal(result2.dispatched, false);
    assert.equal(result2.smoothed.linearX, 0); // Instant zeroing

    bridge.disconnect();
    assert.equal(bridge.isActive(), false);
  });
});
