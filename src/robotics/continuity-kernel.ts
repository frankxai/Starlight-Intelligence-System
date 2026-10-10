/**
 * Starlight Robot Fleet Continuity Kernel & Actuator Adapter
 *
 * Unifies multi-agent cognitive fleets and physical robotic fleets:
 *   - Same core cognitive substrate (SIP memory, goal checklists, Sentinel)
 *   - Thin overlay actuator bridge (ROS2, Zenoh, WebSockets, simulated)
 *   - Spatial and mission state preservation across handoffs
 *   - Benevolent Fail-Closed Emergency Stop (locks actuator on safety invariant trip)
 *
 * Attestation: Built on SIP — Robotics Substrate Tier
 */

export type ActuatorMiddleware = "ros2" | "zenoh" | "websocket_rpc" | "simulated";

export type ActuatorStatus = "idle" | "executing" | "holding" | "e-stopped" | "disconnected";

export interface SpatialCoordinates {
  x: number;
  y: number;
  z: number;
  yaw?: number;
  frameId: string; // e.g. "map", "world", "base_link"
}

export interface SpatialLandmark {
  id: string;
  name: string;
  category: "waypoint" | "charging_station" | "workspace" | "hazard_zone" | "human_zone";
  coordinates: SpatialCoordinates;
  metadata?: Record<string, unknown>;
}

export interface RobotActuatorCommand {
  commandId: string;
  robotId: string;
  action: "navigate" | "manipulate" | "capture_sensor" | "hold" | "emergency_stop";
  targetCoordinates?: SpatialCoordinates;
  payload?: Record<string, unknown>;
  safetyEnvelopeRadiusMeters: number;
  requiresHumanSupervision: boolean;
  issuedAt: string;
}

export interface SafetyInvariantResult {
  passed: boolean;
  rule: string;
  reason?: string;
}

export interface RobotFleetNode {
  robotId: string;
  name: string;
  model: string;
  middleware: ActuatorMiddleware;
  status: ActuatorStatus;
  currentPosition?: SpatialCoordinates;
  activeGoalId?: string;
  safetyLocked: boolean;
  lastHeartbeat: string;
}

export class RobotContinuityKernel {
  private nodes: Map<string, RobotFleetNode> = new Map();
  private landmarks: Map<string, SpatialLandmark> = new Map();

  /**
   * Registers a robot node into the continuity mesh.
   */
  public registerNode(node: RobotFleetNode): void {
    this.nodes.set(node.robotId, { ...node, lastHeartbeat: new Date().toISOString() });
  }

  /**
   * Retrieves a robot node.
   */
  public getNode(robotId: string): RobotFleetNode | undefined {
    return this.nodes.get(robotId);
  }

  /**
   * Adds or updates a spatial landmark in the shared environment model.
   */
  public recordLandmark(landmark: SpatialLandmark): void {
    this.landmarks.set(landmark.id, landmark);
  }

  public getLandmarks(): SpatialLandmark[] {
    return Array.from(this.landmarks.values());
  }

  /**
   * Evaluates command against safety invariants before dispatching to physical actuator.
   * Fails closed: any ambiguity or hazard zone violation rejects command and halts actuator.
   */
  public evaluateSafety(command: RobotActuatorCommand): SafetyInvariantResult {
    // 1. Emergency stop always permitted
    if (command.action === "emergency_stop") {
      return { passed: true, rule: "E_STOP_IMMEDIATE" };
    }

    const node = this.nodes.get(command.robotId);
    if (!node) {
      return { passed: false, rule: "NODE_EXISTS", reason: `Robot ${command.robotId} is not registered` };
    }

    if (node.safetyLocked || node.status === "e-stopped") {
      return {
        passed: false,
        rule: "FAIL_CLOSED_LOCK",
        reason: `Robot ${command.robotId} is safety-locked or e-stopped. Manual reset required.`,
      };
    }

    // 2. Proximity check against declared hazard zones
    if (command.targetCoordinates) {
      for (const lm of this.landmarks.values()) {
        if (lm.category === "hazard_zone") {
          const dx = command.targetCoordinates.x - lm.coordinates.x;
          const dy = command.targetCoordinates.y - lm.coordinates.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < command.safetyEnvelopeRadiusMeters) {
            return {
              passed: false,
              rule: "HAZARD_ZONE_PROXIMITY",
              reason: `Target coordinates violate hazard zone buffer '${lm.name}' (distance: ${dist.toFixed(2)}m)`,
            };
          }
        }
      }
    }

    return { passed: true, rule: "BENEVOLENT_SAFETY_ENVELOPE_VERIFIED" };
  }

  /**
   * Dispatches command to actuator if safety invariants pass; triggers fail-closed E-Stop otherwise.
   */
  public dispatchCommand(command: RobotActuatorCommand): {
    dispatched: boolean;
    safetyResult: SafetyInvariantResult;
    executionState: ActuatorStatus;
  } {
    const safety = this.evaluateSafety(command);

    const node = this.nodes.get(command.robotId);
    if (!node) {
      return { dispatched: false, safetyResult: safety, executionState: "disconnected" };
    }

    if (!safety.passed) {
      // Trigger instant fail-closed emergency stop
      node.status = "e-stopped";
      node.safetyLocked = true;
      return { dispatched: false, safetyResult: safety, executionState: "e-stopped" };
    }

    node.status = command.action === "hold" ? "holding" : "executing";
    return { dispatched: true, safetyResult: safety, executionState: node.status };
  }

  /**
   * Manually resets a safety-locked node following certified human inspection.
   */
  public unlockNodeWithHumanReceipt(robotId: string, receiptId: string): boolean {
    const node = this.nodes.get(robotId);
    if (!node || !receiptId.startsWith("human_ack_")) return false;
    node.safetyLocked = false;
    node.status = "idle";
    return true;
  }
}
