/**
 * The edge meter: the same run, priced two ways.
 *
 * The cascade's own euros against what those identical token counts would have
 * cost on a closed API at its published list price. Four axes, because one
 * number is an anecdote: cost, quality, speed, and the cited share (verified
 * claims whose marker reached the brief; it does not show the prose follows
 * from the source).
 *
 * Every figure can be absent. An absent figure is reported as absent; nothing
 * here estimates, and the comparison stays silent until both sides are priced
 * and every model call's token counts are known.
 *
 * Built on SIP — operational tier.
 */
import { USAGE_UNREPORTED } from "./cost-copy";
import { baselineCostEur, PRICING, type PricingTable } from "./pricing";

export interface EdgeInput {
  costEur: number;
  latencyMs: number;
  tokens: { input: number; output: number };
  groundingRate: number;
  rubricScore: number | null;
  pricesVerified: boolean;
  /**
   * True when every model call reported its token counts. When one did not,
   * `tokens` holds only the reported counts, so the baseline is withheld
   * rather than priced from a partial count.
   */
  tokensComplete: boolean;
}

export interface EdgeRow {
  axis: "cost" | "quality" | "speed" | "grounding";
  label: string;
  ours: string;
  baseline: string;
  /** Baseline euros over the cascade's euros, when both sides carry a price. Below 1 the cascade cost more. */
  ratio: number | null;
  /** The ratio in words, pointing the right way: "30.9x cheaper", "2x more expensive", or "same cost". */
  comparison: string | null;
}

export interface EdgeMeter {
  rows: EdgeRow[];
  /** True when every row that needs a price has one, so the table may be read aloud. */
  readable: boolean;
  baselineLabel: string;
}

export function edgeMeter(input: EdgeInput, baseline = "closed-api", table: PricingTable = PRICING): EdgeMeter {
  const baselineEur = input.tokensComplete ? baselineCostEur(input.tokens.input, input.tokens.output, baseline, table) : null;
  const priced = input.pricesVerified && typeof baselineEur === "number";
  const ratio = priced && input.costEur > 0 ? round1((baselineEur as number) / input.costEur) : null;
  const comparison = priced && input.costEur > 0 && (baselineEur as number) > 0 ? compare(input.costEur, baselineEur as number) : null;

  const rows: EdgeRow[] = [
    {
      axis: "cost",
      label: "€ per brief",
      ours: input.pricesVerified ? eur(input.costEur) : "unpriced",
      baseline: !input.tokensComplete ? USAGE_UNREPORTED : typeof baselineEur === "number" ? eur(baselineEur) : "unpriced",
      ratio,
      comparison,
    },
    {
      axis: "quality",
      label: "Rubric, 0 to 10",
      ours: input.rubricScore === null ? "—" : `${input.rubricScore}`,
      baseline: "same rubric, run it",
      ratio: null,
      comparison: null,
    },
    {
      axis: "speed",
      label: "Seconds per brief",
      ours: `${(input.latencyMs / 1000).toFixed(1)} s`,
      baseline: "—",
      ratio: null,
      comparison: null,
    },
    {
      axis: "grounding",
      label: "Verified claims cited in the brief",
      ours: `${Math.round(input.groundingRate * 100)}%`,
      baseline: "—",
      ratio: null,
      comparison: null,
    },
  ];

  return { rows, readable: priced, baselineLabel: table.baselines[baseline]?.label ?? baseline };
}

/** The cascade against the baseline in words; a multiple that rounds to 1 is the same cost. */
function compare(ours: number, baseline: number): string {
  if (baseline >= ours) {
    const times = round1(baseline / ours);
    return times === 1 ? "same cost" : `${times}x cheaper`;
  }
  const times = round1(ours / baseline);
  return times === 1 ? "same cost" : `${times}x more expensive`;
}

function eur(value: number): string {
  return `€${value.toFixed(4)}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
