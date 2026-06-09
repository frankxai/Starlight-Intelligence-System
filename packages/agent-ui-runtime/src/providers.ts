// @starlight/agent-ui-runtime — Provider-pattern interfaces.
// Per Board REVISE 2026-05-03: the wrapper accesses memory / canon / identity / calculators
// ONLY via these provider interfaces. The consuming app injects implementations.

// ── Canon provider ──
// Consumer apps with mythic / symbolic / domain knowledge inject this.
// Arcanea injects an MCP-canon provider; ACOS injects nothing or a no-op.
export interface CanonProvider {
  /** Look up a canonical term (Guardian name, Vel'Tara concept, etc.) */
  query(term: string): Promise<CanonResult>;
}

export interface CanonResult {
  found: boolean;
  term: string;
  body?: string;
  source?: string;
  attribution?: string;
}

// ── Memory provider ──
// Consumer apps with durable memory storage inject this.
// SIS injects @starlight/memory (when it exists); other apps inject their own store.
export interface MemoryProvider {
  /** Recall memory entries relevant to a query */
  recall(query: string): Promise<MemoryRecallResult>;
  /** Optionally append a new memory entry — gated on the app's policy */
  remember?(entry: MemoryEntry): Promise<void>;
}

export interface MemoryRecallResult {
  entries: ReadonlyArray<MemoryEntry>;
  query: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  source: string;
  recorded_at: string;
}

// ── Identity provider ──
// Consumer apps determine current sovereign identity. Wrapper never decides.
export interface IdentityProvider {
  current(): SovereignIdentity;
}

export interface SovereignIdentity {
  id: string;
  display_name?: string;
  jurisdiction?: string;     // Affects @starlight/validation extension
  permissions?: ReadonlyArray<string>;
}

// ── Calculator provider ──
// The wrapper renders calculator results but does not run them.
// The consuming app supplies a registry of named calculators.
export interface CalculatorProvider {
  run<I, O>(name: string, input: I): Promise<CalculatorResultLike<O>>;
}

// A subset of @starlight/calculators's CalculatorResult — enough for rendering.
// Avoids hard import to honor the boundary rule.
export interface CalculatorResultLike<T> {
  output: T;
  assumptions: readonly string[];
  confidence: "high" | "medium" | "low";
  warnings: readonly string[];
  required_validation: readonly string[];
  trace?: { method: string; version: string; ran_at: string };
}

// ── Bundled provider object ──
// Single injection point at the runtime root.
export interface AgentUIProviders {
  canon?: CanonProvider;
  memory?: MemoryProvider;
  identity?: IdentityProvider;
  calculators?: CalculatorProvider;
}
