/**
 * The edge meter: the same run, priced two ways.
 *
 * The cascade's own euros against what those identical token counts would have
 * cost on a closed API at its published list price. Four axes, because one
 * number is an anecdote: cost, quality, speed, and how much of the brief is
 * anchored to a source.
 *
 * Every figure can be absent. An absent figure is reported as absent; nothing
 * here estimates, and the comparison stays silent until both sides are priced.
 *
 * Built on SIP — operational tier.
 */
import { baselineCostEur, PRICING, type PricingTable } from "./pricing";

export interface EdgeInput {
  costEur: number;
  latencyMs: number;
  tokens: { input: number; output: number };
  groundingRate: number;
  rubricScore: number | null;
  pricesVerified: boolean;
}

export interface EdgeRow {
  axis: "cost" | "quality" | "speed" | "grounding";
  label: string;
  ours: string;
  baseline: string;
  /** How many times cheaper the cascade is, when both sides carry a price. */
  ratio: number | null;
}

export interface EdgeMeter {
  rows: EdgeRow[];
  /** True when every row that needs a price has one, so the table may be read aloud. */
  readable: boolean;
  baselineLabel: string;
}

export function edgeMeter(input: EdgeInput, baseline = "closed-api", table: PricingTable = PRICING): EdgeMeter {
  const baselineEur = baselineCostEur(input.tokens.input, input.tokens.output, baseline, table);
  const priced = input.pricesVerified && typeof baselineEur === "number";
  const ratio = priced && input.costEur > 0 ? round1((baselineEur as number) / input.costEur) : null;

  const rows: EdgeRow[] = [
    {
      axis: "cost",
      label: "€ per brief",
      ours: input.pricesVerified ? eur(input.costEur) : "unpriced",
      baseline: typeof baselineEur === "number" ? eur(baselineEur) : "unpriced",
      ratio,
    },
    {
      axis: "quality",
      label: "rubric, 0 to 10",
      ours: input.rubricScore === null ? "—" : `${input.rubricScore}`,
      baseline: "same rubric, run it",
      ratio: null,
    },
    {
      axis: "speed",
      label: "seconds per brief",
      ours: `${(input.latencyMs / 1000).toFixed(1)} s`,
      baseline: "—",
      ratio: null,
    },
    {
      axis: "grounding",
      label: "claims that reached the brief",
      ours: `${Math.round(input.groundingRate * 100)}%`,
      baseline: "—",
      ratio: null,
    },
  ];

  return { rows, readable: priced, baselineLabel: table.baselines[baseline]?.label ?? baseline };
}

function eur(value: number): string {
  return `€${value.toFixed(4)}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
