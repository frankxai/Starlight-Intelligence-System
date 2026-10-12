/**
 * Robot Fleet Continuity Bridge
 * Built on SIP — Subscription Tier
 */

import { RobotContinuityKernel } from "../../../src/robotics/continuity-kernel.js";
import type { RobotActuatorCommand, RobotFleetNode } from "../../../src/robotics/continuity-kernel.js";

export function initializeRobotContinuity(nodes: RobotFleetNode[]): RobotContinuityKernel {
  const kernel = new RobotContinuityKernel();
  for (const node of nodes) {
    kernel.registerNode(node);
  }
  return kernel;
}

export function executeSafeCommand(kernel: RobotContinuityKernel, command: RobotActuatorCommand) {
  return kernel.dispatchCommand(command);
}
