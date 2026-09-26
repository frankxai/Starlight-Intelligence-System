/**
 * What a Desk run costs, in euros, from token counts.
 *
 * Every price here starts null. A null price means the Desk reports the run
 * with no euro figure at all; it never estimates one. Fill `pricing.json` from
 * the Token Factory console (day-prep step F4) and set `verifiedAt` to the date
 * you read it; from that moment every euro on screen is a number someone checked.
 *
 * Built on SIP — operational tier.
 */

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
  retrieval: {
    tavily: { eurPerCall: null, verifiedAt: null, source: "unverified" },
  },
};

function unpriced(): ModelPrice {
  return { eurPerMillionInput: null, eurPerMillionOutput: null, verifiedAt: null, source: "unverified" };
}

/** A price is usable when both halves are present and a person dated them. */
export function isVerified(price: Pick<ModelPrice, "eurPerMillionInput" | "eurPerMillionOutput" | "verifiedAt"> | undefined): boolean {
  return Boolean(
    price &&
      typeof price.eurPerMillionInput === "number" &&
      typeof price.eurPerMillionOutput === "number" &&
      typeof price.verifiedAt === "string" &&
      price.verifiedAt.length > 0,
  );
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
  if (!price || typeof price.eurPerCall !== "number" || !price.verifiedAt) return null;
  return round4(price.eurPerCall * calls);
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

/** Every price the table carries is dated, so a receipt may state euros without a caveat. */
export function pricingIsComplete(table: PricingTable = PRICING): boolean {
  return (
    Object.values(table.models).every((price) => isVerified(price)) &&
    Object.values(table.baselines).every((price) => isVerified(price))
  );
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
