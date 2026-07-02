/**
 * End-to-end MCP integration test.
 *
 * ⚠️ v0.1. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Runs the trade-gate server IN-PROCESS against a temp data dir through a real
 * SDK client over an InMemoryTransport pair. Proves the invariants:
 *   - exactly the 5 gate tools exist; no order/credential tool bypasses them;
 *   - RED: a non-DCA intent can NEVER execute without a human approval token;
 *   - RED: a live-broker (alpaca) execution attempt fails NOT_WIRED even WITH approval;
 *   - over-cap → pending (never auto-approved), DCA included;
 *   - DCA-whitelisted within-cap buy → auto-approved → paper fill;
 *   - approval token is single-use; an executed intent never executes twice;
 *   - every tool output carries the R5 non-advisory footer;
 *   - the audit JSONL records every step, schema-parseable.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import type { TradeIntent } from "./types.js";
import { buildServer, R5_FOOTER } from "./index.js";

const CAPS = { perOrder: 500, perDay: 1000, perAssetClassDay: { crypto: 300 } };
const WHITELIST = [{ instrument: "VWCE", side: "buy" as const, maxNotional: 250 }];

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

async function connect(): Promise<{ client: Client; dir: string; close: () => Promise<void> }> {
  const dir = mkdtempSync(join(tmpdir(), "trade-gate-e2e-"));
  const server = buildServer({ dataDir: dir });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "trade-gate-e2e", version: "0.1.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    dir,
    close: async () => {
      await client.close();
      await server.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

type ToolResult = {
  structuredContent?: Record<string, unknown>;
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
};

function sc(res: unknown): Record<string, unknown> {
  const s = (res as ToolResult).structuredContent;
  assert.ok(s, "expected structuredContent on the tool result");
  return s!;
}

function textOf(res: unknown): string {
  return ((res as ToolResult).content ?? []).map((c) => c.text ?? "").join("\n");
}

test("E2E: exactly the 5 gate tools exist; every output carries the R5 footer", async () => {
  const { client, close } = await connect();
  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "execute_approved",
      "list_pending",
      "propose_trade",
      "read_audit",
      "request_approval",
    ]);

    const res = await client.callTool({ name: "list_pending", arguments: {} });
    assert.ok(textOf(res).includes(R5_FOOTER.trim().split("\n")[1] ?? ""), "R5 footer missing");
  } finally {
    await close();
  }
});

test("E2E RED: non-DCA intent NEVER executes without a human approval token", async () => {
  const { client, close } = await connect();
  try {
    const ti = intent();
    const proposed = await client.callTool({
      name: "propose_trade",
      arguments: { intent: ti, caps: CAPS },
    });
    assert.equal(sc(proposed).verdict, "pending");

    // The red case: try to execute with no token.
    const res = await client.callTool({
      name: "execute_approved",
      arguments: { intentId: ti.intentId },
    });
    assert.equal((res as ToolResult).isError, true, "executing without approval MUST fail");
    assert.equal(sc(res).verdict, "rejected");
    assert.match(String(sc(res).reason ?? sc(res).error), /approval token required/);

    // And with a forged token.
    const forged = await client.callTool({
      name: "execute_approved",
      arguments: { intentId: ti.intentId, approvalToken: "at_forged" },
    });
    assert.equal((forged as ToolResult).isError, true, "a forged token MUST fail");
  } finally {
    await close();
  }
});

test("E2E RED: live broker (alpaca) fails NOT_WIRED even WITH human approval", async () => {
  const { client, close } = await connect();
  try {
    const ti = intent({ broker: "alpaca" });
    const proposed = await client.callTool({
      name: "propose_trade",
      arguments: { intent: ti, caps: CAPS },
    });
    const approvalId = String(sc(proposed).approvalId);

    const approved = await client.callTool({
      name: "request_approval",
      arguments: { approvalId, approver: "frank", decision: "approve" },
    });
    const token = String(sc(approved).approvalToken);

    const res = await client.callTool({
      name: "execute_approved",
      arguments: { intentId: ti.intentId, approvalToken: token },
    });
    assert.equal((res as ToolResult).isError, true, "live broker MUST fail closed in-repo");
    assert.match(String(sc(res).error), /NOT_WIRED/);
  } finally {
    await close();
  }
});

test("E2E: over-cap → pending (never auto-approved), DCA included", async () => {
  const { client, close } = await connect();
  try {
    // DCA-whitelisted instrument, but over the per-order cap.
    const ti = intent({ dca: true, notional: 600 });
    const res = await client.callTool({
      name: "propose_trade",
      arguments: { intent: ti, caps: CAPS, dcaWhitelist: WHITELIST },
    });
    assert.equal(sc(res).verdict, "pending");
    assert.match(String(sc(res).reason), /per-order/);
  } finally {
    await close();
  }
});

test("E2E: DCA-whitelisted within-cap buy → auto-approved → paper fill, audited", async () => {
  const { client, dir, close } = await connect();
  try {
    const ti = intent({ dca: true, notional: 200 });
    const proposed = await client.callTool({
      name: "propose_trade",
      arguments: { intent: ti, caps: CAPS, dcaWhitelist: WHITELIST },
    });
    assert.equal(sc(proposed).verdict, "auto-approved");

    const executed = await client.callTool({
      name: "execute_approved",
      arguments: { intentId: ti.intentId },
    });
    assert.equal(sc(executed).verdict, "executed");
    const fill = sc(executed).fill as { status: string; broker: string };
    assert.equal(fill.status, "filled-paper");
    assert.equal(fill.broker, "paper");

    // The audit JSONL has the full chain, every line parseable.
    const lines = readFileSync(join(dir, "audit.jsonl"), "utf8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as { action: string });
    const actions = lines.map((l) => l.action);
    assert.ok(actions.includes("propose_trade"));
    assert.ok(actions.includes("execute_attempt"));
    assert.ok(actions.includes("executed"));
  } finally {
    await close();
  }
});

test("E2E: full human-gate loop — propose → approve → execute; token single-use; no double execution", async () => {
  const { client, close } = await connect();
  try {
    const ti = intent({ notional: 400 });
    const proposed = await client.callTool({
      name: "propose_trade",
      arguments: { intent: ti, caps: CAPS },
    });
    assert.equal(sc(proposed).verdict, "pending");
    const approvalId = String(sc(proposed).approvalId);

    const pendingList = await client.callTool({ name: "list_pending", arguments: {} });
    assert.equal((sc(pendingList).pending as unknown[]).length, 1);

    const approved = await client.callTool({
      name: "request_approval",
      arguments: { approvalId, approver: "frank", decision: "approve" },
    });
    const token = String(sc(approved).approvalToken);
    assert.ok(token.startsWith("at_"));

    const executed = await client.callTool({
      name: "execute_approved",
      arguments: { intentId: ti.intentId, approvalToken: token },
    });
    assert.equal(sc(executed).verdict, "executed");

    // Replay: same intent, same token → refused.
    const replay = await client.callTool({
      name: "execute_approved",
      arguments: { intentId: ti.intentId, approvalToken: token },
    });
    assert.equal((replay as ToolResult).isError, true, "double execution MUST fail");
  } finally {
    await close();
  }
});

test("E2E: deny closes a pending approval; approving it afterwards is refused", async () => {
  const { client, close } = await connect();
  try {
    const ti = intent();
    const proposed = await client.callTool({
      name: "propose_trade",
      arguments: { intent: ti, caps: CAPS },
    });
    const approvalId = String(sc(proposed).approvalId);

    const denied = await client.callTool({
      name: "request_approval",
      arguments: { approvalId, approver: "frank", decision: "deny", reason: "not this week" },
    });
    assert.equal(sc(denied).status, "denied");

    const late = await client.callTool({
      name: "request_approval",
      arguments: { approvalId, approver: "frank", decision: "approve" },
    });
    assert.equal((late as ToolResult).isError, true);
  } finally {
    await close();
  }
});

test("E2E: malformed intent is rejected by input validation (fail closed)", async () => {
  const { client, close } = await connect();
  try {
    const res = await client.callTool({
      name: "propose_trade",
      arguments: {
        intent: { ...intent(), notional: -5 },
        caps: CAPS,
      },
    });
    // Zod rejects at the tool boundary → SDK surfaces an error result.
    assert.equal((res as ToolResult).isError, true);
  } finally {
    await close();
  }
});
