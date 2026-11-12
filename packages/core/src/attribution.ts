/**
 * Provider-neutral run attribution.
 *
 * These types exist because `registry/architecture_decisions.yaml`
 * (`architecture_observability_and_cost_contract`) requires every production agent run to be
 * attributable and costed, and the JSON Schemas in this package already described the shapes
 * without any TypeScript declaration for them. Nothing else in the estate emitted them.
 *
 * The field names are snake_case on purpose: they are the registry's dimension names, and a
 * runtime that renames them on the way out makes the record unjoinable with the ledger that
 * reads it.
 *
 * This module is type-only plus a small validator, so `packages/core` keeps zero dependencies.
 * No provider, no runtime, no I/O.
 */

/** The registry's required dimensions for one agent run. */
export interface AgentRunAttribution {
  brand_id: string;
  product_id: string;
  agent_id: string;
  workflow_id: string;
  /** Provider that actually served the run, e.g. "anthropic", "openai", "google", "xai". */
  provider: string;
  /** The concrete model id that served the run. */
  model: string;
  input_tokens: number;
  output_tokens: number;
  /** Cost in USD. Sourced from the gateway's own accounting, never a local price table. */
  estimated_cost: number;
  /**
   * Whether `estimated_cost` is a real figure.
   *
   * Absent or false means the cost could not be determined (the gateway's usage
   * ingestion is asynchronous, so a lookup can miss a generation that did happen).
   * A zero with `cost_known: true` is a genuinely free generation. A zero without it is
   * "unknown", and the two must never be confused in a ledger.
   */
  cost_known?: boolean;
  /** Time to first token, in milliseconds, as reported by the gateway. */
  latency_ms: number;
  outcome_status: 'completed' | 'failed' | 'aborted' | 'cancelled';
}

/** Scope of a run: who it was for and which workflow it belonged to. */
export interface AgentRunScope {
  brand_id: string;
  product_id: string;
  agent_id: string;
  workflow_id: string;
}

export class AgentAttributionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentAttributionError';
  }
}

const OUTCOME_STATUSES: readonly AgentRunAttribution['outcome_status'][] = [
  'completed',
  'failed',
  'aborted',
  'cancelled',
];

function requireIdentifier(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AgentAttributionError(`${field} must be a non-empty string`);
  }
  return value;
}

function requireCount(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new AgentAttributionError(`${field} must be a finite non-negative number`);
  }
  return value;
}

/**
 * Validate a record before it leaves the process. A malformed attribution is worse than a
 * missing one: a missing one is visible, a malformed one silently corrupts the ledger.
 */
export function validateAttribution(record: AgentRunAttribution): AgentRunAttribution {
  requireIdentifier(record.brand_id, 'brand_id');
  requireIdentifier(record.product_id, 'product_id');
  requireIdentifier(record.agent_id, 'agent_id');
  requireIdentifier(record.workflow_id, 'workflow_id');
  requireIdentifier(record.provider, 'provider');
  requireIdentifier(record.model, 'model');
  requireCount(record.input_tokens, 'input_tokens');
  requireCount(record.output_tokens, 'output_tokens');
  requireCount(record.estimated_cost, 'estimated_cost');
  requireCount(record.latency_ms, 'latency_ms');
  if (!OUTCOME_STATUSES.includes(record.outcome_status)) {
    throw new AgentAttributionError(
      `outcome_status must be one of ${OUTCOME_STATUSES.join(', ')}`,
    );
  }
  return record;
}

/**
 * Redact anything that looks like a credential before the record is written anywhere.
 *
 * The record is meant to be committed or shipped to a ledger, so a leaked bearer token in a
 * `provider` or `model` field would outlive the run that produced it.
 */
/**
 * Credential shapes worth redacting from an attribution record.
 *
 * The bearer pattern covers the full base64url alphabet plus padding, so a token is not
 * partially redacted with its suffix left behind.
 */
const SECRET_PATTERN =
  /(?:sk-ant-api[\w-]{16,}|sk-[A-Za-z0-9]{20,}|xai-[A-Za-z0-9]{20,}|AIzaSy[\w-]{20,}|gh[pousr]_[\w]{20,}|npm_[\w]{20,}|re_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._~+/=-]{10,}|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,})/g;

export function redactAttribution(record: AgentRunAttribution): AgentRunAttribution {
  const clean = (value: string): string => value.replace(SECRET_PATTERN, '[REDACTED]');
  // Every string field is cleaned, not a chosen subset. A credential that arrives in
  // brand_id or product_id is exactly as exposed as one in provider, and a redaction that
  // only covers the fields the author happened to think of is not a boundary.
  return {
    ...record,
    brand_id: clean(record.brand_id),
    product_id: clean(record.product_id),
    agent_id: clean(record.agent_id),
    workflow_id: clean(record.workflow_id),
    provider: clean(record.provider),
    model: clean(record.model),
  };
}
