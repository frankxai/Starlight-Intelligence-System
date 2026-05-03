// @starlight/calculators — Deterministic-not-LLM math contract.
// Substrate ratified 2026-05-03 (docs/boards/2026-05-03-calculator-validation-substrate.md).
//
// Per Board REVISE: explicit promotion pipeline modes.

import type { ValidationRequirement } from "@starlight/validation";

// ── Promotion pipeline modes ──
export type CalculatorMode =
  | "shadow"               // Runs alongside legacy; logged not shown
  | "live-with-warnings"   // User-visible with explicit warning banner
  | "live"                 // User-visible, canonical
  | "deprecated";          // Replay-only

// ── Result shape ──
export interface CalculatorResult<T> {
  output: T;
  inputs_used: unknown;                       // echo for traceability
  assumptions: readonly string[];             // explicit, named
  confidence: "high" | "medium" | "low";
  warnings: readonly string[];
  required_validation: readonly ValidationRequirement[];
  trace: {
    method: string;
    version: string;
    ran_at: string;                           // ISO-8601
  };
}

// ── Calculator interface ──
export interface Calculator<Input, Output> {
  readonly name: string;
  readonly version: string;
  readonly mode: CalculatorMode;
  run(input: Input): CalculatorResult<Output>;
}

// ── Base helper for implementing calculators ──
export abstract class BaseCalculator<Input, Output> implements Calculator<Input, Output> {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly mode: CalculatorMode;

  abstract compute(input: Input): {
    output: Output;
    assumptions: readonly string[];
    confidence: "high" | "medium" | "low";
    warnings: readonly string[];
    required_validation: readonly ValidationRequirement[];
  };

  run(input: Input): CalculatorResult<Output> {
    const computed = this.compute(input);
    return {
      ...computed,
      inputs_used: input,
      trace: {
        method: this.name,
        version: this.version,
        ran_at: new Date().toISOString(),
      },
    };
  }
}

// ── Mode-aware shipping helpers ──
export function isUserVisible(mode: CalculatorMode): boolean {
  return mode === "live-with-warnings" || mode === "live";
}

export function shouldShowWarningBanner(mode: CalculatorMode): boolean {
  return mode === "live-with-warnings";
}

export function isDeprecated(mode: CalculatorMode): boolean {
  return mode === "deprecated";
}

// ── Replay support ──
// Calculators can be replayed against a historical input/output corpus
// to verify they still produce expected outputs after refactoring.
export interface CalculatorReplayCase<Input, Output> {
  input: Input;
  expected_output: Output;
  recorded_at: string;
}

export function replay<I, O>(
  calc: Calculator<I, O>,
  cases: readonly CalculatorReplayCase<I, O>[]
): { matches: number; mismatches: { case_index: number; actual: O; expected: O }[] } {
  let matches = 0;
  const mismatches: { case_index: number; actual: O; expected: O }[] = [];
  cases.forEach((c, idx) => {
    const actual = calc.run(c.input).output;
    if (JSON.stringify(actual) === JSON.stringify(c.expected_output)) {
      matches++;
    } else {
      mismatches.push({ case_index: idx, actual, expected: c.expected_output });
    }
  });
  return { matches, mismatches };
}
