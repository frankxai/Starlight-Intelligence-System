/**
 * Alpaca adapter — NOT_WIRED stub, by design.
 *
 * No live-broker code or credentials exist in this repo. The operator wires
 * the official Alpaca MCP server V2 locally (paper-by-default:
 * ALPACA_PAPER_TRADE=True) per the vertical's RUNBOOK.md, and only then flips
 * this adapter. Until that local act, execution against 'alpaca' fails closed.
 */

import type { BrokerAdapter, Fill, TradeIntent } from "../types.js";

export class AlpacaStub implements BrokerAdapter {
  readonly id = "alpaca" as const;
  readonly mode = "live" as const;

  execute(_intent: TradeIntent): Fill {
    throw new Error(
      "NOT_WIRED: alpaca adapter is a stub — wire the official Alpaca MCP locally per RUNBOOK.md; " +
        "no live-broker code or credentials ship in this repo",
    );
  }
}
