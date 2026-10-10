/**
 * Starlight Queen Autonomic Runner
 * Built on SIP — Subscription Tier
 */

import { StarlightQueen } from "../../../src/orchestration/starlight-queen.js";
import type { QueenTaskAction } from "../../../src/orchestration/starlight-queen.js";

export function initializeQueen(): StarlightQueen {
  return new StarlightQueen();
}

export function executeQueenAction(queen: StarlightQueen, action: QueenTaskAction) {
  return queen.handleAction(action);
}
