/**
 * Run attribution: the layer the registry requires and nothing in the estate implemented.
 *
 * `architecture_observability_and_cost_contract` requires `brand_id`, `product_id`, `agent_id`,
 * `workflow_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `estimated_cost`,
 * `latency_ms` and `outcome_status` on every production agent run.
 *
 * Cost and latency come from the Vercel AI Gateway's own accounting for the generation, not from
 * a price table maintained here. A local price table goes stale the day a vendor changes pricing
 * and then quietly reports the wrong number, which is worse than reporting nothing.
 */

import { gateway, type LanguageModelUsage } from 'ai';
import {
  redactAttribution,
  validateAttribution,
  type AgentRunAttribution,
  type AgentRunScope,
} from '@starlight-intelligence/core';

export interface GatewayGenerationInfo {
  id: string;
  totalCost: number;
  latency: number;
  promptTokens: number;
  completionTokens: number;
  finishReason: string;
  model: string;
  providerName: string;
}

/** The slice of gateway metadata that carries the generation id. */
interface GatewayMetadata {
  generationId?: string;
}

export interface AttributionInput {
  scope: AgentRunScope;
  model: string;
  usage?: LanguageModelUsage;
  generationId?: string;
  outcomeStatus: AgentRunAttribution['outcome_status'];
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
 * happened still happened, and a missing cost must not erase the rest of the record. The caller
 * decides whether an uncosted run is acceptable.
 */
export async function fetchGenerationInfo(
  generationId: string,
): Promise<GatewayGenerationInfo | undefined> {
  try {
    const info = await gateway.getGenerationInfo({ id: generationId });
    return info as GatewayGenerationInfo;
  } catch {
    return undefined;
  }
}

/**
 * Build the attribution record for a run.
 *
 * Token counts come from the SDK's own usage when available and fall back to the gateway's
 * accounting. Cost and latency come only from the gateway.
 */
export async function buildAttribution(
  input: AttributionInput,
): Promise<AgentRunAttribution> {
  const { scope } = input;

  let cost = 0;
  let latency = 0;
  let inputTokens = input.usage?.inputTokens ?? 0;
  let outputTokens = input.usage?.outputTokens ?? 0;
  let provider = input.model.split('/')[0] ?? input.model;
  let model = input.model;

  if (input.generationId) {
    const info = await fetchGenerationInfo(input.generationId);
    if (info) {
      cost = info.totalCost;
      latency = info.latency;
      // Prefer the gateway's counts when the SDK did not report usage.
      inputTokens = input.usage?.inputTokens ?? info.promptTokens;
      outputTokens = input.usage?.outputTokens ?? info.completionTokens;
      if (info.model) model = info.model;
      if (info.providerName) provider = info.providerName;
    }
  }

  const record: AgentRunAttribution = {
    brand_id: scope.brand_id,
    product_id: scope.product_id,
    agent_id: scope.agent_id,
    workflow_id: scope.workflow_id,
    provider,
    model,
    input_tokens: inputTokens ?? 0,
    output_tokens: outputTokens ?? 0,
    estimated_cost: cost,
    latency_ms: latency,
    outcome_status: input.outcomeStatus,
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
