# trade-gate-mcp

> Fail-closed approve/execute MCP for the Investment Intelligence vertical. **v0.1. UNAUDITED. NOT FOR LIVE FUNDS.**

The gate between the decision swarm and any broker. Agents propose; humans approve; paper is the default; every step is audited append-only.

## Tools

| Tool | What |
|---|---|
| `propose_trade` | TradeIntent + cap policy (+ optional DCA whitelist) → `auto-approved` (DCA-whitelisted, within-cap buy — still capped + audited) \| `pending` (everything else, over-cap included) \| `rejected` (replay / malformed) |
| `request_approval` | **The human's act.** `approve` → single-use token bound to the intent; `deny` → closed. One token per approval; a lost token is not re-issued. |
| `list_pending` | Pending-approval queue. |
| `execute_approved` | Approved intent → broker adapter. Paper fills in-repo; `alpaca`/`ibkr`/`coinbase` throw `NOT_WIRED` until wired locally per the vertical's `RUNBOOK.md`. Audit-first; an intent executes once, ever. |
| `read_audit` | The append-only JSONL audit trail. |

## Invariants (tested)

- A non-DCA intent **never** executes without a human approval token (`e2e.test.ts` red case).
- A live-broker attempt fails `NOT_WIRED` **even with approval** — no live code or credentials ship here (red case).
- Over ANY cap → pending, never auto-approved, DCA included.
- Approval tokens are single-use and intent-bound; executed intents never re-execute; replayed intent ids are rejected.
- Audit write fails → the action fails. Durable JSONL state (audit, spend, approvals, gate) survives restart.
- Every output carries the R5 non-advisory footer.

## Run

```bash
npm install
npm test          # typecheck + 21 tests
npm run build && npm start   # stdio MCP server; state under ./.trade-gate-data (TRADE_GATE_DATA_DIR to override)
```

Wire it into Claude Code / Hermes Agent as a stdio MCP server. Only the operator's session should hold `request_approval` — treat it as the human's surface, not the swarm's.

## Lineage

Shape ports from [`payment-intelligence-system/mcp`](https://github.com/frankxai/payment-intelligence-system) (fail-closed verdicts, caps, append-only audit, human gate). Trading is a distinct risk domain — code shape reused, repo untouched. Board record: `docs/boards/2026-07-02-investment-intelligence-vertical-spawn.md`.

---

*This is system architecture, not financial / investment / tax advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim.*

**Built on SIP** — trade-gate-mcp · v0.1 · MIT
