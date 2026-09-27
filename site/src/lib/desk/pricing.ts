/**
 * What a Desk run costs, in euros, from token counts.
 *
 * Every price here starts null. A null price means the Desk reports the run
 * with no euro figure at all; it never estimates one. Fill `pricing.json` from
 * the Token Factory console (day-prep step F4) and set `verifiedAt` to the date
 * you read it; from that moment every euro on screen is a number someone checked.
 *
 * A run is cost-complete only when every stage that did paid work carries a
 * euro figure: each model stage that ran, and retrieval, because Tavily bills
 * per call. A run that is not says which stages are unpriced, and the route
 * does not sign its receipt (see signing.ts).
 *
 * Built on SIP — operational tier.
 */
import type { RunReceiptStage } from "./run-receipt";

export interface ModelPrice {
  eurPerMillionInput: number | null;
  eurPerMillionOutput: number | null;
  verifiedAt: string | null;
  source: string;
}

export interface PricingTable {
  schema: string;
  note: string;
  currency: string;
  models: Record<string, ModelPrice>;
  baselines: Record<string, ModelPrice & { label: string }>;
  retrieval: Record<string, { eurPerCall: number | null; verifiedAt: string | null; source: string }>;
}

/**
 * The table. Every number starts null on purpose: an unpriced model reports no
 * euros rather than a guess. Day-prep step F4 fills these from the console and
 * dates them; from then on the receipt's euros are numbers a person checked.
 */
export const PRICING: PricingTable = {
  schema: "starlight.desk-pricing.v1",
  currency: "EUR",
  note: "The Token Factory console is the source of truth. Until an entry carries a verifiedAt date, the Desk reports the run without a euro figure.",
  models: {
    "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B": unpriced(),
    "deepseek-ai/DeepSeek-V4-Flash-0731": unpriced(),
    "openai/gpt-oss-120b": unpriced(),
  },
  baselines: {
    "closed-api": { label: "Closed API, published list price", ...unpriced() },
  },
  // Retrieval is paid work too: a run that used it is not cost-complete until
  // this carries a dated per-call price.
  retrieval: {
    tavily: { eurPerCall: null, verifiedAt: null, source: "unverified" },
  },
};

function unpriced(): ModelPrice {
  return { eurPerMillionInput: null, eurPerMillionOutput: null, verifiedAt: null, source: "unverified" };
}

/** A rate is usable when it is a finite number of euros, zero or more. */
export function isRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** A verification date is a real calendar date, written YYYY-MM-DD, optionally followed by an ISO time. */
export function isVerificationDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && !Number.isNaN(Date.parse(value));
}

/** A price is usable when both halves are finite, nonnegative rates and a person dated them with a real date. */
export function isVerified(price: Pick<ModelPrice, "eurPerMillionInput" | "eurPerMillionOutput" | "verifiedAt"> | undefined): boolean {
  return Boolean(
    price && isRate(price.eurPerMillionInput) && isRate(price.eurPerMillionOutput) && isVerificationDate(price.verifiedAt),
  );
}

/** A per-call retrieval price is usable on the same terms. */
export function isVerifiedCallPrice(price: { eurPerCall: number | null; verifiedAt: string | null } | undefined): boolean {
  return Boolean(price && isRate(price.eurPerCall) && isVerificationDate(price.verifiedAt));
}

/** Euros for one model call, or null when the model has no verified price. */
export function modelCostEur(model: string, inputTokens: number, outputTokens: number, table: PricingTable = PRICING): number | null {
  const price = table.models[model];
  if (!isVerified(price)) return null;
  const input = (inputTokens / 1_000_000) * (price.eurPerMillionInput as number);
  const output = (outputTokens / 1_000_000) * (price.eurPerMillionOutput as number);
  return round4(input + output);
}

/** Euros for one retrieval call, or null when unpriced. */
export function retrievalCostEur(provider: string, calls = 1, table: PricingTable = PRICING): number | null {
  const price = table.retrieval[provider];
  if (!isVerifiedCallPrice(price)) return null;
  return round4((price.eurPerCall as number) * calls);
}

/**
 * What the same token counts would have cost on the closed-API baseline.
 * Null until someone dates that price too, so the edge meter stays honest.
 */
export function baselineCostEur(inputTokens: number, outputTokens: number, baseline = "closed-api", table: PricingTable = PRICING): number | null {
  const price = table.baselines[baseline];
  if (!isVerified(price)) return null;
  const input = (inputTokens / 1_000_000) * (price.eurPerMillionInput as number);
  const output = (outputTokens / 1_000_000) * (price.eurPerMillionOutput as number);
  return round4(input + output);
}

/** Every price the table carries is dated, retrieval included, so a receipt may state euros without a caveat. */
export function pricingIsComplete(table: PricingTable = PRICING): boolean {
  return (
    Object.values(table.models).every((price) => isVerified(price)) &&
    Object.values(table.baselines).every((price) => isVerified(price)) &&
    Object.values(table.retrieval).every((price) => isVerifiedCallPrice(price))
  );
}

/** A stage did paid work when it ran against a model, or against a retrieval provider the table lists. */
export function isPaidStage(stage: RunReceiptStage, table: PricingTable = PRICING): boolean {
  if (stage.status === "skipped") return false;
  if (stage.model) return true;
  return stage.provider !== undefined && Object.prototype.hasOwnProperty.call(table.retrieval, stage.provider);
}

/**
 * The names of stages that did paid work and carry no euro figure. Empty
 * means the run is cost-complete and its total is one the Desk can vouch for.
 */
export function unpricedStages(stages: RunReceiptStage[], table: PricingTable = PRICING): string[] {
  return stages.filter((stage) => isPaidStage(stage, table) && typeof stage.costEur !== "number").map((stage) => stage.name);
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
