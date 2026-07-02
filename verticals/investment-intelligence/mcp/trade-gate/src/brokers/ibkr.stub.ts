/**
 * Interactive Brokers adapter — NOT_WIRED stub, by design.
 *
 * IBKR is the natural EU live path: its "AI Instructions" review tab is a
 * broker-side human approval gate that composes with (never replaces) this
 * package's approval token. The operator wires it locally per RUNBOOK.md.
 * Until that local act, execution against 'ibkr' fails closed.
 */

import type { BrokerAdapter, Fill, TradeIntent } from "../types.js";

export class IbkrStub implements BrokerAdapter {
  readonly id = "ibkr" as const;
  readonly mode = "live" as const;

  execute(_intent: TradeIntent): Fill {
    throw new Error(
      "NOT_WIRED: ibkr adapter is a stub — wire IBKR locally per RUNBOOK.md; " +
        "no live-broker code or credentials ship in this repo",
    );
  }
}
