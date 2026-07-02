import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ApprovalQueue } from "./approval.js";
import type { TradeIntent } from "./types.js";

function intent(overrides: Partial<TradeIntent> = {}): TradeIntent {
  return {
    intentId: `ti_${Math.random().toString(36).slice(2)}`,
    instrument: "VWCE",
    assetClass: "etf",
    side: "buy",
    notional: 100,
    currency: "EUR",
    broker: "paper",
    dca: false,
    ...overrides,
  };
}

function tempQueue(): { queue: ApprovalQueue; dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "trade-gate-approvals-"));
  return { queue: new ApprovalQueue(dir), dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test("propose returns PENDING and nothing else", () => {
  const { queue, cleanup } = tempQueue();
  try {
    const pa = queue.propose(intent(), "non-dca");
    assert.equal(pa.status, "pending-human-approval");
    assert.equal((pa as unknown as { approved?: unknown }).approved, undefined);
    assert.equal(queue.listPending().length, 1);
  } finally {
    cleanup();
  }
});

test("token is single-use and bound to its intent", () => {
  const { queue, cleanup } = tempQueue();
  try {
    const ti = intent();
    const pa = queue.propose(ti, "non-dca");
    const token = queue.issueToken(pa.approvalId, "frank");

    // Wrong intent → refuse.
    assert.throws(() => queue.consumeToken(token, "ti_other"), /issued for intent/);

    // Right intent → consumes.
    const done = queue.consumeToken(token, ti.intentId);
    assert.equal(done.status, "executed");

    // Second consume → refuse (single-use is absolute).
    assert.throws(() => queue.consumeToken(token, ti.intentId), /already consumed/);
  } finally {
    cleanup();
  }
});

test("one token per approval — a lost token is not re-issued", () => {
  const { queue, cleanup } = tempQueue();
  try {
    const pa = queue.propose(intent(), "non-dca");
    queue.issueToken(pa.approvalId, "frank");
    assert.throws(() => queue.issueToken(pa.approvalId, "frank"), /already issued/);
  } finally {
    cleanup();
  }
});

test("anonymous approvals refused; unknown approval refused; denied not approvable", () => {
  const { queue, cleanup } = tempQueue();
  try {
    const pa = queue.propose(intent(), "non-dca");
    assert.throws(() => queue.issueToken(pa.approvalId, "  "), /approver identity required/);
    assert.throws(() => queue.issueToken("pa_nope", "frank"), /unknown approval/);
    queue.deny(pa.approvalId, "changed my mind");
    assert.throws(() => queue.issueToken(pa.approvalId, "frank"), /denied/);
    assert.equal(queue.listPending().length, 0);
  } finally {
    cleanup();
  }
});

test("queue state survives a restart (durable JSONL event log)", () => {
  const dir = mkdtempSync(join(tmpdir(), "trade-gate-approvals-"));
  try {
    const ti = intent();
    const q1 = new ApprovalQueue(dir);
    const pa = q1.propose(ti, "non-dca");
    const token = q1.issueToken(pa.approvalId, "frank");

    const q2 = new ApprovalQueue(dir);
    // The consumed-token guard and the intent binding survive the restart.
    const done = q2.consumeToken(token, ti.intentId);
    assert.equal(done.status, "executed");

    const q3 = new ApprovalQueue(dir);
    assert.throws(() => q3.consumeToken(token, ti.intentId), /already consumed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
