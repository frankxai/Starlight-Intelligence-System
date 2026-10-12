/**
 * Starlight Alexandria — shared types.
 *
 * Alexandria is the catalogued-intelligence layer of the Starlight Intelligence
 * System: every data source the estate can call is a *provider* exposing typed
 * *capabilities* under a published contract, every call returns typed records
 * plus a *receipt* (content hash, provenance, cost), and every receipt can carry
 * the SIP attestation block because the record genuinely composed SIP elements.
 *
 * Three provider kinds share one contract:
 *   - `firecrawl-alexandria` — Firecrawl's Alexandria catalogue (executed through
 *     `firecrawl_scrape` with an `alexandria` body, billed per capability).
 *   - `native` — Starlight's own corpus (vaults, metrics ledger, research,
 *     registries). Free, local, no network.
 *   - `connector` — runtimes and distribution rails that are *called by* the
 *     swarm rather than queried (managed agents, generation lanes, billing).
 *     Listed for routing; never executed through the data transport.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

export type ProviderKind = 'firecrawl-alexandria' | 'native' | 'connector';

export interface CapabilityOption {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'string[]' | 'object';
  about?: string;
  default?: string | number | boolean;
  oneOf?: readonly string[];
}

export interface Capability {
  /** `<provider>/<capability>` — the execution address. */
  id: string;
  /** Capability path as the provider publishes it, e.g. `crypto/wallet_profile`. */
  capability: string;
  name: string;
  description: string;
  /** Firecrawl credits per call (or per record when `perRecord`). 0 for native. */
  creditsCost: number;
  perRecord: boolean;
  /** Groups of option names of which at least one must be supplied. */
  requiresOneOf?: readonly (readonly string[])[];
  options?: readonly CapabilityOption[];
  /** Routing vocabulary. Lower-case single words or hyphenated phrases. */
  tags: readonly string[];
}

export interface Provider {
  id: string;
  kind: ProviderKind;
  name: string;
  description: string;
  categories: readonly string[];
  /** Required source attribution text, when the provider mandates one. */
  attribution?: string;
  /** Where the records come from; shown on every receipt. */
  source: string;
  capabilities: readonly Capability[];
}

export interface Catalog {
  version: string;
  /** Firecrawl catalogue digest the entries were last reconciled against. */
  catalogueVersion?: string;
  reconciledAt: string;
  providers: readonly Provider[];
}

export interface AlexandriaCall {
  provider: string;
  capability: string;
  options?: Record<string, unknown>;
  version?: string;
  /** Idempotency key. A retry of an uncertain call reuses the same id and payload. */
  requestId?: string;
}

export interface CallError {
  code: string;
  message: string;
  /** Safe provider metadata, e.g. Firecrawl's `requiresAction` for a terms gate. Never acted on automatically. */
  details?: unknown;
}

export interface CallResult {
  provider: string;
  capability: string;
  /** Typed records, as the provider's contract describes them. */
  records: unknown[];
  creditsCost: number;
  observedAt: string;
  requestId?: string;
  error?: CallError;
}

export interface Transport {
  readonly kind: ProviderKind;
  execute(calls: readonly AlexandriaCall[]): Promise<CallResult[]>;
}

export interface Receipt {
  id: string;
  issuedAt: string;
  /** Budget session the call was charged to. Spend is restored per session, never across the whole ledger. */
  sessionId: string;
  /** Idempotency key sent to the provider, when the transport supports one. */
  requestId?: string;
  provider: string;
  capability: string;
  options: Record<string, unknown>;
  recordCount: number;
  /** sha256 over the canonical JSON of the records. */
  contentHash: string;
  /** Credits reserved against the budget before the call ran. */
  reserved: number;
  /** Credits the provider actually charged. Greater than `reserved` means the declared record ceiling was exceeded. */
  creditsCost: number;
  source: string;
  attribution?: string;
  /** SIP layers the record composed. Empty means no attestation block is emitted. */
  sipLayers: readonly string[];
  /** The declared "Built on SIP" block, present only when `sipLayers` is non-empty. */
  attestation?: string;
  error?: CallError;
}

export interface Budget {
  /** Identifies the session whose spend this budget tracks. */
  sessionId: string;
  /** Hard ceiling in Firecrawl credits for this session. */
  maxCredits: number;
  /** Credits spent or reserved in this session. */
  spent: number;
}

export interface FindHit {
  capability: Capability;
  provider: Provider;
  score: number;
}

export type ExperimentStatus = 'proposed' | 'running' | 'proven' | 'falsified' | 'parked';

export interface Experiment {
  id: string;
  house: string;
  hypothesis: string;
  /** The single metric that decides it. */
  metric: string;
  /** What result kills the hypothesis. Required; an experiment without one is a wish. */
  falsifier: string;
  /** Budget ceiling in credits, euros, or hours, stated as a string with unit. */
  budget: string;
  owner: string;
  status: ExperimentStatus;
  openedAt: string;
  closesBy: string;
  /** Receipt ids that back the current status. */
  receipts: readonly string[];
  notes?: string;
}
