import { EventEmitter } from "node:events";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { type ChildProcess } from "node:child_process";
import { type EventEnvelope } from "../types/envelope.js";

export interface SessionConfig {
  maxConcurrentSessions: number;
  idleTimeoutMs: number;
  auditLogPath?: string;
}

export interface OperatorSession {
  sessionId: string;
  runId: string;
  provider: string;
  createdAt: number;
  lastActivityAt: number;
  status: "active" | "idle" | "terminated";
  process?: ChildProcess;
}

export class AcpSessionManager extends EventEmitter {
  private sessions = new Map<string, OperatorSession>();
  private idleCheckTimer: NodeJS.Timeout | null = null;
  private readonly config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    super();
    this.config = {
      maxConcurrentSessions: config.maxConcurrentSessions ?? 3,
      idleTimeoutMs: config.idleTimeoutMs ?? 1800_000, // 30 minutes
      auditLogPath: config.auditLogPath,
    };

    this.idleCheckTimer = setInterval(() => this.reapIdleSessions(), 60_000);
  }

  public getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.status === "active") count++;
    }
    return count;
  }

  /**
   * Capacity admission check before creating a new session.
   */
  public canAdmitSession(): { admitted: boolean; reason?: string } {
    if (this.getActiveSessionCount() >= this.config.maxConcurrentSessions) {
      return {
        admitted: false,
        reason: `Capacity limit reached: ${this.config.maxConcurrentSessions} active sessions running.`,
      };
    }
    return { admitted: true };
  }

  public registerSession(session: OperatorSession): void {
    const check = this.canAdmitSession();
    if (!check.admitted) {
      throw new Error(check.reason);
    }
    this.sessions.set(session.sessionId, session);
    this.emit("session_created", session);
  }

  public touchSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = Date.now();
      session.status = "active";
    }
  }

  public terminateSession(sessionId: string, reason = "normal"): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (session.process && !session.process.killed) {
      session.process.kill("SIGTERM");
    }

    session.status = "terminated";
    this.sessions.delete(sessionId);
    this.emit("session_terminated", { sessionId, reason });
  }

  private reapIdleSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (session.status !== "terminated" && now - session.lastActivityAt > this.config.idleTimeoutMs) {
        this.terminateSession(id, "idle_timeout");
      }
    }
  }

  /**
   * Audit log writer with fail-closed guarantee on critical events.
   */
  public async logAuditEvent(event: EventEnvelope, failClosed = false): Promise<void> {
    if (!this.config.auditLogPath) return;

    const line = JSON.stringify(event) + "\n";
    try {
      await fs.mkdir(path.dirname(this.config.auditLogPath), { recursive: true });
      await fs.appendFile(this.config.auditLogPath, line, "utf-8");
    } catch (err) {
      this.emit("audit_error", err);
      if (failClosed) {
        throw new Error(`Audit write failed for critical security event: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  public dispose(): void {
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }
    for (const sessionId of this.sessions.keys()) {
      this.terminateSession(sessionId, "manager_disposed");
    }
  }
}
