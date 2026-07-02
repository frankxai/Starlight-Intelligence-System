/**
 * Trade-gate types.
 *
 * ⚠️ v0.1. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Pattern lineage: payment-intelligence-system/mcp (fail-closed verdicts,
 * append-only audit, human gate). Trading is a distinct risk domain — this
 * package reuses the shape, not the repo.
 */

export type AssetClass = "equity" | "etf" | "fund" | "bond" | "crypto" | "other";
export type Side = "buy" | "sell";
export type BrokerId = "paper" | "alpaca" | "ibkr" | "coinbase";

/** A structured, not-yet-approved trade proposal. Never an order by itself. */
export interface TradeIntent {
  intentId: string;
  instrument: string;
  assetClass: AssetClass;
  side: Side;
  /** Order size in currency units. */
  notional: number;
  currency: string;
  broker: BrokerId;
  /** Claims DCA-whitelist eligibility — verified against the whitelist, never trusted. */
  dca: boolean;
  /** Reference to the thesis / strategy-session artifact that produced this intent. */
  rationaleRef?: string;
}

export interface CapPolicy {
  /** Max notional per single order. */
  perOrder: number;
  /** Max total notional per rolling 24h across all asset classes. */
  perDay: number;
  /** Optional per-asset-class rolling 24h ceilings (tighter than perDay). */
  perAssetClassDay?: Partial<Record<AssetClass, number>>;
}

/** Pre-declared recurring buys — the only auto-approvable class. */
export interface DcaWhitelistEntry {
  instrument: string;
  /** DCA is accumulation only; sells always take the human gate. */
  side: "buy";
  maxNotional: number;
}

export type CapVerdict = "within-cap" | "over-cap" | "reject";

export interface CapResult {
  verdict: CapVerdict;
  reason: string;
}

export type ProposeVerdict = "auto-approved" | "pending" | "rejected";

export type ApprovalStatus =
  | "pending-human-approval"
  | "token-issued"
  | "executed"
  | "denied";

export interface PendingApproval {
  approvalId: string;
  status: ApprovalStatus;
  intent: TradeIntent;
  reason: string;
  createdAt: number;
}

export interface Fill {
  fillId: string;
  intentId: string;
  broker: BrokerId;
  /** Paper is the only fill status that exists in-repo. */
  status: "filled-paper";
  instrument: string;
  side: Side;
  notional: number;
  currency: string;
  filledAt: number;
}

export interface BrokerAdapter {
  readonly id: BrokerId;
  readonly mode: "paper" | "live";
  execute(intent: TradeIntent): Fill;
}

export interface AuditEntry {
  ts: number;
  action: string;
  intentId?: string;
  approvalId?: string;
  verdict?: string;
  reason?: string;
  actor?: string;
  broker?: string;
  instrument?: string;
  notional?: number;
  currency?: string;
}
