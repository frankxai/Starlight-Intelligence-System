/**
 * Human-approval queue + single-use approval tokens — durable.
 *
 * ⚠️ v0.1. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * `propose` returns a PENDING object and NOTHING ELSE — no code path in this
 * class resolves a proposal to executable except `issueToken` (the human's
 * explicit act, out of the agent's hands) followed by `consumeToken` at
 * execution. One token per approval, single-use, bound to its intent. A lost
 * token is not re-issued: deny and re-propose (fail closed beats convenient).
 *
 * State is an append-only JSONL event log (`approvals.jsonl`), replayed on
 * construction so pending approvals and consumed tokens survive a restart.
 */

import { randomUUID } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { PendingApproval, TradeIntent } from "./types.js";
import { resolveDataDir } from "./audit.js";

const APPROVALS_FILE = "approvals.jsonl";

type ApprovalEvent =
  | { type: "proposed"; approval: PendingApproval; ts: number }
  | { type: "token-issued"; approvalId: string; token: string; approver: string; ts: number }
  | { type: "consumed"; approvalId: string; token: string; ts: number }
  | { type: "denied"; approvalId: string; reason: string; ts: number };

interface TokenRecord {
  token: string;
  approvalId: string;
  consumed: boolean;
}

export class ApprovalQueue {
  private readonly approvals = new Map<string, PendingApproval>();
  private readonly tokens = new Map<string, TokenRecord>();
  /** approvalId → token, to enforce one-token-per-approval. */
  private readonly issuedFor = new Map<string, string>();
  private readonly path: string;

  constructor(dataDir?: string) {
    this.path = join(resolveDataDir(dataDir), APPROVALS_FILE);
    mkdirSync(dirname(this.path), { recursive: true });
    this.load();
  }

  private load(): void {
    if (!existsSync(this.path)) return;
    const raw = readFileSync(this.path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let ev: ApprovalEvent;
      try {
        ev = JSON.parse(trimmed) as ApprovalEvent;
      } catch {
        continue; // corrupt line skipped, never rewritten
      }
      this.apply(ev);
    }
  }

  /** Pure state transition, shared by replay and live paths. */
  private apply(ev: ApprovalEvent): void {
    switch (ev.type) {
      case "proposed":
        this.approvals.set(ev.approval.approvalId, { ...ev.approval });
        break;
      case "token-issued": {
        const a = this.approvals.get(ev.approvalId);
        if (a) a.status = "token-issued";
        this.tokens.set(ev.token, { token: ev.token, approvalId: ev.approvalId, consumed: false });
        this.issuedFor.set(ev.approvalId, ev.token);
        break;
      }
      case "consumed": {
        const t = this.tokens.get(ev.token);
        if (t) t.consumed = true;
        const a = this.approvals.get(ev.approvalId);
        if (a) a.status = "executed";
        break;
      }
      case "denied": {
        const a = this.approvals.get(ev.approvalId);
        if (a) a.status = "denied";
        break;
      }
    }
  }

  /** Durable write FIRST; memory mutates only after the event persists. */
  private record(ev: ApprovalEvent): void {
    appendFileSync(this.path, JSON.stringify(ev) + "\n", "utf8");
    this.apply(ev);
  }

  /** Create a pending approval. Never resolves to approved by itself. */
  propose(intent: TradeIntent, reason: string, now: number = Date.now()): PendingApproval {
    const approval: PendingApproval = {
      approvalId: `pa_${randomUUID()}`,
      status: "pending-human-approval",
      intent,
      reason,
      createdAt: now,
    };
    this.record({ type: "proposed", approval, ts: now });
    return { ...approval };
  }

  /**
   * The human's explicit act: issue the single-use approval token for a
   * pending approval. Fail-closed errors: unknown approval, already executed
   * or denied, token already issued (lost token → deny + re-propose).
   */
  issueToken(approvalId: string, approver: string, now: number = Date.now()): string {
    const approval = this.approvals.get(approvalId);
    if (!approval) {
      throw new Error(`unknown approval '${approvalId}'`);
    }
    if (approval.status === "executed" || approval.status === "denied") {
      throw new Error(`approval '${approvalId}' is ${approval.status} — not approvable`);
    }
    if (this.issuedFor.has(approvalId)) {
      throw new Error(
        `token already issued for '${approvalId}' — a lost token is not re-issued; deny and re-propose`,
      );
    }
    if (!approver || !approver.trim()) {
      throw new Error("approver identity required — anonymous approvals are refused");
    }
    const token = `at_${randomUUID()}`;
    this.record({ type: "token-issued", approvalId, token, approver, ts: now });
    return token;
  }

  /**
   * Consume a token at execution time. Single-use, bound to the intent it was
   * issued for. Throws on: unknown token, consumed token, intent mismatch.
   */
  consumeToken(token: string, intentId: string, now: number = Date.now()): PendingApproval {
    const rec = this.tokens.get(token);
    if (!rec) {
      throw new Error("unknown approval token — refusing execution");
    }
    if (rec.consumed) {
      throw new Error("approval token already consumed — single-use is absolute");
    }
    const approval = this.approvals.get(rec.approvalId);
    if (!approval) {
      throw new Error(`token references unknown approval '${rec.approvalId}'`);
    }
    if (approval.intent.intentId !== intentId) {
      throw new Error(
        `token was issued for intent '${approval.intent.intentId}', not '${intentId}' — refusing execution`,
      );
    }
    this.record({ type: "consumed", approvalId: rec.approvalId, token, ts: now });
    return { ...approval, status: "executed" };
  }

  /** Deny a pending approval (human act; also the recovery path for a lost token). */
  deny(approvalId: string, reason: string, now: number = Date.now()): void {
    const approval = this.approvals.get(approvalId);
    if (!approval) {
      throw new Error(`unknown approval '${approvalId}'`);
    }
    this.record({ type: "denied", approvalId, reason, ts: now });
  }

  /** Approvals still awaiting a human (pending or token-issued-but-unexecuted). */
  listPending(): PendingApproval[] {
    return [...this.approvals.values()]
      .filter((a) => a.status === "pending-human-approval" || a.status === "token-issued")
      .map((a) => ({ ...a }));
  }

  get(approvalId: string): PendingApproval | undefined {
    const a = this.approvals.get(approvalId);
    return a ? { ...a } : undefined;
  }

  filePath(): string {
    return this.path;
  }
}
