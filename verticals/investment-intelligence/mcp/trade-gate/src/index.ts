#!/usr/bin/env node
/**
 * Trade-gate MCP — fail-closed approve/execute surface for the Investment
 * Intelligence vertical.
 *
 * ⚠️ v0.1. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Five tools:
 *   - propose_trade      TradeIntent → auto-approved (DCA whitelist, capped) | pending | rejected
 *   - request_approval   the human approves (single-use token) or denies a pending intent
 *   - list_pending       pending-approval queue
 *   - execute_approved   approved intent → broker adapter (paper is the only functional one)
 *   - read_audit         append-only JSONL audit trail
 *
 * Invariants:
 *   - No live-broker code or credentials exist in this repo: alpaca/ibkr/coinbase
 *     adapters throw NOT_WIRED. Paper is the default and the only in-repo fill path.
 *   - No non-DCA intent executes without a human-issued single-use approval token.
 *   - Over ANY cap → pending (escalate) — never auto-approved, DCA included.
 *   - Audit-first: the attempt is logged before the broker is called; a failed
 *     audit write fails the action.
 *   - Every tool output carries the R5 non-advisory footer.
 *
 * Pattern lineage: payment-intelligence-system/mcp (shape reused, repo untouched —
 * trading is a distinct risk domain). Board record:
 * docs/boards/2026-07-02-investment-intelligence-vertical-spawn.md
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import type { BrokerAdapter, BrokerId, TradeIntent } from "./types.js";
import { AuditLog, resolveDataDir } from "./audit.js";
import { CapLedger, dcaEligible } from "./caps.js";
import { ApprovalQueue } from "./approval.js";
import { PaperBroker } from "./brokers/paper.js";
import { AlpacaStub } from "./brokers/alpaca.stub.js";
import { IbkrStub } from "./brokers/ibkr.stub.js";
import { CoinbaseStub } from "./brokers/coinbase.stub.js";

export const R5_FOOTER =
  "\n—\nThis is system architecture, not financial / investment / tax advice. " +
  "Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. " +
  "The practitioner accepts capital risk; the substrate accepts no claim.";

// ---- Zod schemas (input validation is itself a fail-closed gate) ----
const intentSchema = z.object({
  intentId: z.string().min(1).max(100),
  instrument: z.string().min(1).max(64),
  assetClass: z.enum(["equity", "etf", "fund", "bond", "crypto", "other"]),
  side: z.enum(["buy", "sell"]),
  notional: z.number().positive(),
  currency: z.string().min(1).max(10),
  broker: z.enum(["paper", "alpaca", "ibkr", "coinbase"]),
  dca: z.boolean(),
  rationaleRef: z.string().max(256).optional(),
});

const capsSchema = z.object({
  perOrder: z.number().positive(),
  perDay: z.number().positive(),
  perAssetClassDay: z
    .record(z.enum(["equity", "etf", "fund", "bond", "crypto", "other"]), z.number().positive())
    .optional(),
});

const dcaWhitelistSchema = z.array(
  z.object({
    instrument: z.string().min(1).max(64),
    side: z.literal("buy"),
    maxNotional: z.number().positive(),
  }),
);

function textResult(text: string, structured: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: text + R5_FOOTER }],
    structuredContent: structured,
  };
}

function errorResult(text: string, structured: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: text + R5_FOOTER }],
    structuredContent: structured,
    isError: true,
  };
}

/**
 * Durable registry of auto-approved (DCA) intents and executed intent ids.
 * Append-only JSONL (`gate.jsonl`), replayed on construction, so an approved
 * DCA order and the executed-once guard survive a restart.
 */
class ExecutionRegistry {
  private readonly autoApproved = new Map<string, TradeIntent>();
  private readonly executed = new Set<string>();
  private readonly path: string;

  constructor(dataDir?: string) {
    this.path = join(resolveDataDir(dataDir), "gate.jsonl");
    mkdirSync(dirname(this.path), { recursive: true });
    this.load();
  }

  private load(): void {
    if (!existsSync(this.path)) return;
    for (const line of readFileSync(this.path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        this.apply(JSON.parse(trimmed));
      } catch {
        continue; // corrupt line skipped, never rewritten
      }
    }
  }

  private apply(ev: { type: string; intent?: TradeIntent; intentId?: string }): void {
    if (ev.type === "auto-approved" && ev.intent) {
      this.autoApproved.set(ev.intent.intentId, ev.intent);
    } else if (ev.type === "executed" && ev.intentId) {
      this.executed.add(ev.intentId);
    }
  }

  private record(ev: Record<string, unknown>): void {
    appendFileSync(this.path, JSON.stringify({ ...ev, ts: Date.now() }) + "\n", "utf8");
    this.apply(ev as { type: string; intent?: TradeIntent; intentId?: string });
  }

  registerAutoApproved(intent: TradeIntent): void {
    this.record({ type: "auto-approved", intent });
  }

  getAutoApproved(intentId: string): TradeIntent | undefined {
    return this.autoApproved.get(intentId);
  }

  markExecuted(intentId: string): void {
    this.record({ type: "executed", intentId });
  }

  isExecuted(intentId: string): boolean {
    return this.executed.has(intentId);
  }
}

/**
 * Build the trade-gate server with its own durable state. Exported so tests
 * run it in-process (InMemoryTransport) against a temp data dir.
 */
export function buildServer(opts: { dataDir?: string } = {}): McpServer {
  const caps = new CapLedger(opts.dataDir);
  const queue = new ApprovalQueue(opts.dataDir);
  const audit = new AuditLog(opts.dataDir);
  const registry = new ExecutionRegistry(opts.dataDir);
  const brokers: Record<BrokerId, BrokerAdapter> = {
    paper: new PaperBroker(),
    alpaca: new AlpacaStub(),
    ibkr: new IbkrStub(),
    coinbase: new CoinbaseStub(),
  };

  const server = new McpServer({
    name: "trade-gate-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "propose_trade",
    {
      title: "Propose Trade",
      description:
        "Submit a TradeIntent to the gate. FAILS CLOSED: replayed or malformed intents are " +
        "rejected; over ANY cap → pending (never auto-approved); only DCA-whitelisted, " +
        "within-cap buys auto-approve (still capped + audited). Everything else awaits a " +
        "human approval token. Does not place orders.",
      inputSchema: {
        intent: intentSchema,
        caps: capsSchema,
        dcaWhitelist: dcaWhitelistSchema.optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ intent, caps: capPolicy, dcaWhitelist }) => {
      const ti = intent as TradeIntent;
      const capResult = caps.check(ti, capPolicy);

      try {
        if (capResult.verdict === "reject") {
          audit.append({ action: "propose_trade", intentId: ti.intentId, verdict: "rejected", reason: capResult.reason });
          return textResult(`REJECTED: ${capResult.reason}`, { verdict: "rejected", reason: capResult.reason });
        }

        if (capResult.verdict === "over-cap") {
          // Escalate — never auto-approve over a cap, DCA included.
          const pending = queue.propose(ti, capResult.reason);
          audit.append({ action: "propose_trade", intentId: ti.intentId, approvalId: pending.approvalId, verdict: "pending", reason: capResult.reason });
          return textResult(
            `PENDING human approval (${pending.approvalId}): ${capResult.reason}`,
            { verdict: "pending", approvalId: pending.approvalId, reason: capResult.reason },
          );
        }

        // Within caps. DCA whitelist is the only auto-approve path.
        if (ti.dca) {
          const dca = dcaEligible(ti, dcaWhitelist ?? []);
          if (dca.verdict === "within-cap") {
            caps.commit(ti);
            registry.registerAutoApproved(ti);
            audit.append({ action: "propose_trade", intentId: ti.intentId, verdict: "auto-approved", reason: dca.reason, instrument: ti.instrument, notional: ti.notional, currency: ti.currency });
            return textResult(
              `AUTO-APPROVED (dca whitelist, capped + audited): ${dca.reason}`,
              { verdict: "auto-approved", intentId: ti.intentId, reason: dca.reason },
            );
          }
          // dca flag claimed but not eligible → human gate with the reason.
          const pending = queue.propose(ti, `dca claim failed: ${dca.reason}`);
          audit.append({ action: "propose_trade", intentId: ti.intentId, approvalId: pending.approvalId, verdict: "pending", reason: `dca claim failed: ${dca.reason}` });
          return textResult(
            `PENDING human approval (${pending.approvalId}): dca claim failed — ${dca.reason}`,
            { verdict: "pending", approvalId: pending.approvalId, reason: dca.reason },
          );
        }

        const pending = queue.propose(ti, "non-dca intent — human gate");
        audit.append({ action: "propose_trade", intentId: ti.intentId, approvalId: pending.approvalId, verdict: "pending", reason: "non-dca intent — human gate" });
        return textResult(
          `PENDING human approval (${pending.approvalId}): non-dca intent — human gate`,
          { verdict: "pending", approvalId: pending.approvalId, reason: "non-dca intent — human gate" },
        );
      } catch (err) {
        // Fail closed: an unloggable or unpersistable decision does not stand.
        return errorResult(`GATE FAILED CLOSED: ${(err as Error).message}`, {
          verdict: "rejected",
          error: (err as Error).message,
        });
      }
    },
  );

  server.registerTool(
    "request_approval",
    {
      title: "Request Approval (human act)",
      description:
        "The HUMAN approves or denies a pending intent. 'approve' issues a single-use " +
        "approval token bound to that intent; 'deny' closes it. One token per approval — " +
        "a lost token is not re-issued (deny and re-propose). Anonymous approvals refused.",
      inputSchema: {
        approvalId: z.string().min(1),
        approver: z.string().min(1).describe("Human identity, e.g. 'frank'"),
        decision: z.enum(["approve", "deny"]),
        reason: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ approvalId, approver, decision, reason }) => {
      try {
        if (decision === "deny") {
          queue.deny(approvalId, reason ?? "denied by human");
          audit.append({ action: "request_approval", approvalId, verdict: "denied", reason: reason ?? "denied by human", actor: approver });
          return textResult(`DENIED ${approvalId}`, { approvalId, status: "denied" });
        }
        const token = queue.issueToken(approvalId, approver);
        audit.append({ action: "request_approval", approvalId, verdict: "token-issued", actor: approver });
        return textResult(
          `APPROVED ${approvalId} — single-use token issued. Pass it to execute_approved.`,
          { approvalId, status: "token-issued", approvalToken: token },
        );
      } catch (err) {
        return errorResult(`APPROVAL REFUSED: ${(err as Error).message}`, {
          approvalId,
          error: (err as Error).message,
        });
      }
    },
  );

  server.registerTool(
    "list_pending",
    {
      title: "List Pending Approvals",
      description: "Pending-approval queue (pending or token-issued-but-unexecuted). Read-only.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => {
      const pending = queue.listPending();
      return textResult(`${pending.length} pending approval(s)`, { pending });
    },
  );

  server.registerTool(
    "execute_approved",
    {
      title: "Execute Approved Intent",
      description:
        "Execute an approved intent via its broker adapter. Paper is the only functional " +
        "adapter in-repo; alpaca/ibkr/coinbase throw NOT_WIRED until the operator wires them " +
        "locally. Auto-approved DCA intents execute by intentId; everything else requires the " +
        "human's single-use approval token. Audit-first: the attempt is logged before the " +
        "broker is called. An executed intent never executes twice.",
      inputSchema: {
        intentId: z.string().min(1),
        approvalToken: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    async ({ intentId, approvalToken }) => {
      try {
        if (registry.isExecuted(intentId)) {
          audit.append({ action: "execute_approved", intentId, verdict: "rejected", reason: "already executed — single execution is absolute" });
          return errorResult(`REJECTED: intent ${intentId} already executed`, {
            verdict: "rejected",
            reason: "already executed",
          });
        }

        let intent = registry.getAutoApproved(intentId);
        if (!intent) {
          // Not auto-approved: the human's single-use token is the only path.
          if (!approvalToken) {
            audit.append({ action: "execute_approved", intentId, verdict: "rejected", reason: "no approval token for non-dca intent — human gate holds" });
            return errorResult(
              `REJECTED: intent ${intentId} is not auto-approved and no approval token was supplied — the human gate holds`,
              { verdict: "rejected", reason: "approval token required" },
            );
          }
          // Burns the token on the attempt (single-use is absolute, even if the
          // broker then refuses — a failed live attempt requires fresh approval).
          const approval = queue.consumeToken(approvalToken, intentId);
          intent = approval.intent;
        }

        // Audit-first: the attempt exists in the log before any broker runs.
        audit.append({ action: "execute_attempt", intentId, broker: intent.broker, instrument: intent.instrument, notional: intent.notional, currency: intent.currency });

        const adapter = brokers[intent.broker];
        let fill;
        try {
          fill = adapter.execute(intent);
        } catch (err) {
          audit.append({ action: "execution_failed", intentId, broker: intent.broker, reason: (err as Error).message });
          return errorResult(`EXECUTION FAILED (${intent.broker}): ${(err as Error).message}`, {
            verdict: "execution-failed",
            broker: intent.broker,
            error: (err as Error).message,
          });
        }

        registry.markExecuted(intentId);
        audit.append({ action: "executed", intentId, broker: intent.broker, verdict: fill.status, instrument: fill.instrument, notional: fill.notional, currency: fill.currency });
        return textResult(
          `EXECUTED (${fill.status}) ${fill.side} ${fill.notional.toFixed(2)} ${fill.currency} ${fill.instrument} via ${fill.broker} — ${fill.fillId}`,
          { verdict: "executed", fill },
        );
      } catch (err) {
        return errorResult(`EXECUTION REFUSED: ${(err as Error).message}`, {
          verdict: "rejected",
          error: (err as Error).message,
        });
      }
    },
  );

  server.registerTool(
    "read_audit",
    {
      title: "Read Audit Trail",
      description: "Read the append-only audit log (most recent last). Read-only.",
      inputSchema: { limit: z.number().int().positive().max(1000).optional() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ limit }) => {
      const all = audit.all();
      const entries = limit ? all.slice(-limit) : all;
      return textResult(`${entries.length} audit entr${entries.length === 1 ? "y" : "ies"} (of ${all.length})`, {
        entries,
        total: all.length,
        file: audit.filePath(),
      });
    },
  );

  return server;
}

async function main() {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr only — stdout is the MCP stdio channel.
  console.error(
    "trade-gate-mcp v0.1.0 (fail-closed, paper-only, human gate above DCA) on stdio — NOT FOR LIVE FUNDS",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("trade-gate-mcp fatal:", err);
    process.exit(1);
  });
}
