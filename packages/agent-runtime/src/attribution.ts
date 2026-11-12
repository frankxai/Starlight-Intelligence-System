/**
 * Run attribution: the layer the registry requires and nothing in the estate implemented.
 *
 * `architecture_observability_and_cost_contract` requires `brand_id`, `product_id`, `agent_id`,
 * `workflow_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `estimated_cost`,
 * `latency_ms` and `outcome_status` on every production agent run.
 *
 * Cost and latency come from the Vercel AI Gateway's own accounting for the generation, not from
 * a price table maintained here. A price table goes stale the day a vendor changes pricing and
 * then quietly reports the wrong number, which is worse than reporting nothing.
 */

import { gateway, type LanguageModelUsage } from 'ai';
import {
  redactAttribution,
  validateAttribution,
  type AgentRunAttribution,
  type AgentRunScope,
} from '@starlight-intelligence/core';

/**
 * The Gateway's own generation record.
 *
 * Taken from the SDK's own signature rather than re-declared here, so a field this module reads
 * cannot drift from the field the Gateway actually returns.
 */
export type GatewayGenerationInfo = Awaited<ReturnType<typeof gateway.getGenerationInfo>>;

/** The slice of gateway metadata that carries the generation id. */
interface GatewayMetadata {
  generationId?: string;
}

export interface AttributionInput {
  scope: AgentRunScope;
  model: string;
  /** Token usage summed across every model call in the run, when the SDK reported it. */
  usage?: LanguageModelUsage;
  /**
   * Every generation id in the run, in order. A multi-step run has one per model call, and the
   * run's cost is the SUM of their costs, not the last one's.
   */
  generationIds?: readonly string[];
  outcomeStatus: AgentRunAttribution['outcome_status'];
  /**
   * How a generation's cost is looked up.
   *
   * Defaults to the Gateway. Overridable so a caller (or a test) can supply the accounting it
   * already holds, or a lookup that fails, without this module reaching the network.
   */
  lookup?: (generationId: string) => Promise<GatewayGenerationInfo | undefined>;
}

export class AttributionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttributionError';
  }
}

/**
 * Resolve the generation id from provider metadata.
 *
 * The gateway stamps it on the first content chunk of a stream, so it can be captured before a
 * stream is interrupted and the run becomes unattributable.
 */
export function generationIdOf(providerMetadata: unknown): string | undefined {
  const gatewayMeta = (providerMetadata as { gateway?: GatewayMetadata } | undefined)?.gateway;
  return gatewayMeta?.generationId;
}

/**
 * Fetch cost and latency for a generation from the gateway.
 *
 * Returns `undefined` rather than throwing when the generation cannot be looked up: a run that
 * happened still happened, and a missing cost must not erase the rest of the record.
 *
 * The failure is REPORTED, not absorbed. Gateway usage ingestion is asynchronous and Vercel
 * documents retrying lookup 404s, so "not found yet" is a normal transient state rather than a
 * proof the generation was free. `buildAttribution` therefore marks the record as uncosted
 * instead of substituting a zero that is indistinguishable from a genuinely free generation.
 */
export async function fetchGenerationInfo(
  generationId: string,
): Promise<GatewayGenerationInfo | undefined> {
  try {
    return await gateway.getGenerationInfo({ id: generationId });
  } catch {
    return undefined;
  }
}

/**
 * Build the attribution record for a run.
 *
 * Token counts come from the SDK's own usage when available and fall back to the gateway's
 * accounting. Cost and latency come only from the gateway.
 *
 * A multi-step run has one generation per model call. The run's cost is the SUM of their costs:
 * taking the last one alone understates the run, and a run whose steps cost USD 0.10 and USD 0.20
 * must not be reported as USD 0.20.
 */
export async function buildAttribution(
  input: AttributionInput,
): Promise<AgentRunAttribution> {
  const { scope } = input;

  let cost = 0;
  let latency = 0;
  let inputTokens = input.usage?.inputTokens;
  let outputTokens = input.usage?.outputTokens;
  let provider = input.model.split('/')[0] ?? input.model;
  let model = input.model;
  // A generation that could not be priced is NOT a zero-cost generation. The distinction is
  // carried explicitly so a ledger reading this cannot mistake "not known yet" for "free".
  let costKnown = false;

  const generationIds = input.generationIds ?? [];
  const lookup = input.lookup ?? fetchGenerationInfo;
  // The Gateway's token counts are a FALLBACK for the SDK's. They are summed across every
  // generation, because a two-step run's tokens are the sum of its steps' tokens.
  let gatewayInputTokens = 0;
  let gatewayOutputTokens = 0;
  let pricedGenerations = 0;

  for (const generationId of generationIds) {
    const info = await lookup(generationId);
    if (!info) {
      // One unpriced generation means the run's total is unpriceable. The partial figure below is
      // a lower bound, and `cost_known: false` says so rather than letting a reader treat it as
      // the run's cost.
      continue;
    }
    pricedGenerations += 1;
    cost += info.totalCost;
    latency += info.generationTime;
    gatewayInputTokens += info.promptTokens;
    gatewayOutputTokens += info.completionTokens;
    if (info.model) model = info.model;
    if (info.providerName) provider = info.providerName;
  }

  // The total is known only when EVERY generation was priced. A partial sum is a lower bound, and
  // reporting it as the run's cost would understate a real bill.
  costKnown = pricedGenerations === generationIds.length && generationIds.length > 0;

  // Prefer the SDK's counts; fall back to the Gateway's sum only when the SDK reported none.
  const resolvedInputTokens = inputTokens ?? gatewayInputTokens;
  const resolvedOutputTokens = outputTokens ?? gatewayOutputTokens;

  const record: AgentRunAttribution = {
    brand_id: scope.brand_id,
    product_id: scope.product_id,
    agent_id: scope.agent_id,
    workflow_id: scope.workflow_id,
    provider,
    model,
    input_tokens: resolvedInputTokens ?? 0,
    output_tokens: resolvedOutputTokens ?? 0,
    estimated_cost: cost,
    latency_ms: latency,
    outcome_status: input.outcomeStatus,
    // Emitted on BOTH paths. The core contract says absent or false means unknown, so a
    // successfully priced generation must say true explicitly, otherwise a genuinely free
    // generation is indistinguishable from an unpriced one.
    cost_known: costKnown,
  };

  return redactAttribution(validateAttribution(record));
}

/**
 * Cache and reasoning token splits, for surfaces that show token detail.
 * Absent values stay absent rather than becoming zero, so a surface can tell "not reported"
 * from "reported as none".
 */
export function tokenSplits(usage: LanguageModelUsage | undefined): {
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  reasoningTokens?: number;
} {
  return {
    cacheReadTokens: usage?.inputTokenDetails?.cacheReadTokens,
    cacheWriteTokens: usage?.inputTokenDetails?.cacheWriteTokens,
    reasoningTokens: usage?.outputTokenDetails?.reasoningTokens,
  };
}
