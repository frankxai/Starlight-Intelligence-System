/**
 * What the Desk page says about a run's cost when it cannot state a total.
 *
 * Kept apart from the page so it can be tested without a browser. The copy
 * separates a subtotal from a total, names each stage left out and why, and
 * says which gaps a price can close: an unpriced stage closes once its price
 * is verified; a stage whose token usage or billable call count is unknown
 * stays open for that run whatever the price table holds.
 *
 * Built on SIP — operational tier.
 */
/** Why a paid stage carries no euro figure. The cascade imports these; the page must not import the cascade. */
export const UNPRICED = "unpriced";
export const USAGE_UNREPORTED = "usage unreported";
export const CALL_COUNT_UNKNOWN = "call count unknown";

export interface CostGap {
  stage: string;
  reason: string;
}

const WHY: Record<string, string> = {
  [UNPRICED]: "no verified price yet",
  [USAGE_UNREPORTED]: "the provider did not report its token usage",
  [CALL_COUNT_UNKNOWN]: "the number of billable search calls is unknown",
};

export function gapPhrase(gap: CostGap): string {
  return `${gap.stage} (${WHY[gap.reason] ?? gap.reason})`;
}

/** The figure shown where a total would go. */
export function costFigure(costComplete: boolean, costEur: number): string {
  return costComplete ? euro(costEur) : `${euro(costEur)} subtotal`;
}

/** The warning under the result when the run's cost is incomplete. */
export function costWarning(subtotalEur: number, gaps: CostGap[]): string {
  const left = gaps.map(gapPhrase).join("; ");
  const priceable = gaps.filter((gap) => gap.reason === UNPRICED).map((gap) => gap.stage);
  const unrecoverable = gaps.filter((gap) => gap.reason !== UNPRICED).map((gap) => gap.stage);
  const parts = [
    `This run's cost is incomplete. ${euro(subtotalEur)} is a subtotal of the stages with a known cost, and it leaves out: ${left}.`,
  ];
  if (priceable.length > 0) {
    parts.push(`Once a price is verified, ${list(priceable)} will be counted on later runs.`);
  }
  if (unrecoverable.length > 0) {
    parts.push(`For ${list(unrecoverable)} the usage itself is unknown, so no price can complete this run's total.`);
  }
  parts.push("The receipt is an unsigned draft.");
  return parts.join(" ");
}

function list(names: string[]): string {
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function euro(value: number): string {
  return `€${value.toFixed(4)}`;
}
