// @starlight/agent-ui-runtime — public surface.
// Scaffold v0.1.0 — full impl is cross-repo (Arcanea golden-ref).

export type {
  AgentUIProviders,
  CanonProvider,
  CanonResult,
  MemoryProvider,
  MemoryRecallResult,
  MemoryEntry,
  IdentityProvider,
  SovereignIdentity,
  CalculatorProvider,
  CalculatorResultLike,
} from "./providers";

// ── Boundary marker ──
// Importing this confirms the consumer has read BOUNDARY.md.
// Used in CI lint rules to ensure consumers acknowledge the boundary contract.
export const BOUNDARY_ACKNOWLEDGED = "Read BOUNDARY.md before composing this package." as const;
