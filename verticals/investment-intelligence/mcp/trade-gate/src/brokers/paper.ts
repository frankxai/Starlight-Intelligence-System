/**
 * Paper broker — the ONLY functional adapter in this repo.
 *
 * ⚠️ v0.1. UNAUDITED. Simulated fills only; no market connection, no
 * slippage model, no order book. Exists so the full propose → approve →
 * execute → audit → trajectory loop can run end-to-end with zero capital risk.
 */

import { randomUUID } from "node:crypto";
import type { BrokerAdapter, Fill, TradeIntent } from "../types.js";

export class PaperBroker implements BrokerAdapter {
  readonly id = "paper" as const;
  readonly mode = "paper" as const;

  execute(intent: TradeIntent): Fill {
    return {
      fillId: `fill_${randomUUID()}`,
      intentId: intent.intentId,
      broker: this.id,
      status: "filled-paper",
      instrument: intent.instrument,
      side: intent.side,
      notional: intent.notional,
      currency: intent.currency,
      filledAt: Date.now(),
    };
  }
}
