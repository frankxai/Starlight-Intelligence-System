// @starlight/validation — ValidationRequirement enum + jurisdiction extension.
// Substrate ratified 2026-05-03 (docs/boards/2026-05-03-calculator-validation-substrate.md).
//
// Per Board REVISE: extensible enum. Core canonical members ship here;
// jurisdictions extend via extendValidationRequirement().

// ── Core canonical members ──
// These are register-neutral and apply in any jurisdiction.
export const CORE_VALIDATION_REQUIREMENTS = [
  "human_review",
  "tax_advisor_review",
  "legal_review",
  "financial_advisor_review",
  "manufacturer_spec_check",
  "site_survey_required",
] as const;

export type CoreValidationRequirement = (typeof CORE_VALIDATION_REQUIREMENTS)[number];

// ── Extended members ──
// Populated by extendValidationRequirement() at runtime.
const extendedMembers: Map<string, Set<string>> = new Map();

export interface ValidationRequirementExtension {
  /** ISO-3166 country code or country-region code, e.g. "DE", "US-CA" */
  jurisdiction: string;
  /** Member names; convention is to suffix with `_<jurisdiction>` to prevent collision */
  members: string[];
}

export function extendValidationRequirement(extension: ValidationRequirementExtension): void {
  const set = extendedMembers.get(extension.jurisdiction) ?? new Set<string>();
  for (const m of extension.members) {
    set.add(m);
  }
  extendedMembers.set(extension.jurisdiction, set);
}

export function getExtendedMembers(jurisdiction: string): readonly string[] {
  return Array.from(extendedMembers.get(jurisdiction) ?? []);
}

export function getAllValidationRequirements(): readonly string[] {
  const all: string[] = [...CORE_VALIDATION_REQUIREMENTS];
  for (const set of extendedMembers.values()) {
    for (const m of set) all.push(m);
  }
  return all;
}

// ── ValidationRequirement type ──
// Permissive at the type level — any string is allowed because extensions
// are runtime-registered. Runtime validators check against
// getAllValidationRequirements() to confirm the member is registered.
export type ValidationRequirement = CoreValidationRequirement | (string & { __extended: true });

export function isRegisteredValidationRequirement(value: string): boolean {
  if ((CORE_VALIDATION_REQUIREMENTS as readonly string[]).includes(value)) return true;
  for (const set of extendedMembers.values()) {
    if (set.has(value)) return true;
  }
  return false;
}

// ── Severity ──
// Some requirements are purely informational ("human_review"); others gate
// irreversible actions ("licensed_electrician_review_de"). The severity
// hint is advisory — the consuming surface decides what to do with it.
export type RequirementSeverity = "advisory" | "gating-recommended" | "gating-required";

export function defaultSeverity(req: string): RequirementSeverity {
  if (req === "human_review") return "advisory";
  if (req.includes("licensed_") || req.includes("certified_") || req.includes("grid_operator_")) {
    return "gating-required";
  }
  return "gating-recommended";
}
