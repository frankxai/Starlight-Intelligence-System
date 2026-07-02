/**
 * Coinbase adapter — NOT_WIRED stub, by design.
 *
 * Crypto execution goes through Coinbase for Agents / AgentKit (MPC wallet,
 * programmable session caps, per-transaction limits) wired locally per
 * RUNBOOK.md — custody is never self-built and never lives in this repo.
 * Until that local act, execution against 'coinbase' fails closed.
 */

import type { BrokerAdapter, Fill, TradeIntent } from "../types.js";

export class CoinbaseStub implements BrokerAdapter {
  readonly id = "coinbase" as const;
  readonly mode = "live" as const;

  execute(_intent: TradeIntent): Fill {
    throw new Error(
      "NOT_WIRED: coinbase adapter is a stub — wire Coinbase AgentKit locally per RUNBOOK.md; " +
        "no live-broker code or credentials ship in this repo",
    );
  }
}
