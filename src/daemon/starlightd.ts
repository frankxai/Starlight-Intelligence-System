/**
 * Starlight Autonomic System Daemon (starlightd)
 *
 * Runs persistent single-operator background ops:
 *   1. Starlight Queen autonomic health sweeps & dreaming loops
 *   2. Robot fleet deadman monitoring & emergency stop enforcement
 *   3. Low-risk prioritized action queue draining
 *   4. Heartbeat status logging to ~/.starlight/starlightd.json
 *
 * Attestation: Built on SIP — Substrate Tier
 */

import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import {
  StarlightQueen,
  type AutonomicCycleReport,
} from "../orchestration/starlight-queen.js";
import { RobotContinuityKernel } from "../robotics/continuity-kernel.js";

export interface StarlightDaemonStatus {
  pid: number;
  startedAt: string;
  uptimeSeconds: number;
  status: "running" | "idle" | "stopped";
  sweepCount: number;
  lastSweepAt?: string;
  lastSweepResult?: AutonomicCycleReport;
  operatorActive: boolean;
  activeRobotsCount: number;
  attestation: "Built on SIP";
}

export class StarlightDaemon {
  private queen: StarlightQueen;
  private robotics: RobotContinuityKernel;
  private statusFilePath: string;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private sweepCount: number = 0;
  private startedAt: string = new Date().toISOString();
  private lastSweepResult?: AutonomicCycleReport;

  constructor(
    customStateDir?: string,
    queen?: StarlightQueen,
    robotics?: RobotContinuityKernel
  ) {
    const stateDir = customStateDir || join(homedir(), ".starlight");
    mkdirSync(stateDir, { recursive: true });
    this.statusFilePath = join(stateDir, "starlightd.json");
    this.queen = queen || new StarlightQueen();
    this.robotics = robotics || new RobotContinuityKernel();
  }

  /**
   * Executes a single daemon maintenance tick.
   */
  public async tick(): Promise<StarlightDaemonStatus> {
    this.sweepCount++;

    // 1. Check deadman timeouts across registered robots
    this.robotics.checkDeadman(15000);

    // 2. Run Queen autonomic cycle sweep
    const landmarksCount = this.robotics.getLandmarks().length;
    this.lastSweepResult = this.queen.runAutonomicCycle(landmarksCount, 0);

    // 3. Drain low-risk actions from queue
    this.queen.drainQueue();

    // 4. Update status file
    const status = this.getStatus();
    writeFileSync(this.statusFilePath, JSON.stringify(status, null, 2), "utf-8");

    return status;
  }

  /**
   * Starts the background daemon loop with given interval in ms.
   */
  public start(intervalMs: number = 60000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startedAt = new Date().toISOString();

    // Initial immediate tick
    this.tick().catch(() => {});

    this.timer = setInterval(() => {
      this.tick().catch(() => {});
    }, intervalMs);
  }

  /**
   * Stops the background daemon.
   */
  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (existsSync(this.statusFilePath)) {
      try {
        unlinkSync(this.statusFilePath);
      } catch {
        // Ignore cleanup failure
      }
    }
  }

  /**
   * Returns current daemon status.
   */
  public getStatus(): StarlightDaemonStatus {
    const now = Date.now();
    const startMs = new Date(this.startedAt).getTime();
    const uptimeSeconds = Math.max(0, Math.floor((now - startMs) / 1000));

    return {
      pid: process.pid,
      startedAt: this.startedAt,
      uptimeSeconds,
      status: this.isRunning ? "running" : "idle",
      sweepCount: this.sweepCount,
      lastSweepAt: this.lastSweepResult?.timestamp,
      lastSweepResult: this.lastSweepResult,
      operatorActive: this.queen.isOperatorActive(),
      activeRobotsCount: this.robotics.getLandmarks().length,
      attestation: "Built on SIP",
    };
  }
}
