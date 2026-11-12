/**
 * Provider-neutral model routing.
 *
 * The contract is a *route*, not a vendor SDK call. A route names a capability; this module
 * resolves it to a Vercel AI Gateway model id and hands back an AI SDK `LanguageModel`.
 *
 * Why the Gateway and not per-vendor packages: the estate's accepted
 * `architecture_experience_plane` names AI Gateway as the default multi-provider model gateway,
 * and one namespace covers Anthropic, OpenAI, Google and xAI with a single key. Adding a vendor
 * then costs one row in a table rather than a new dependency and a new credential path.
 *
 * Model ids below were verified against the live Gateway catalog on 2026-11-12. Note the
 * `spacexai/` prefix on Grok: it is not `xai/`.
 */

import { gateway, type LanguageModel } from 'ai';

export type AgentModelTier = 'reasoning-heavy' | 'balanced' | 'fast';

export type AgentModelRoute =
  | { kind: 'frontier'; tier: AgentModelTier }
  | { kind: 'explicit'; gatewayModelId: string };

/**
 * The vendor table. One row per vendor the estate wants, with the model that tier resolves to.
 *
 * This is deliberately a small, versioned table in source rather than a config file or an env
 * var: a wrong default should be a one-line diff and a review, not a hunt through deployments.
 */
const TIER_MODELS: Record<AgentModelTier, string> = {
  'reasoning-heavy': 'anthropic/claude-opus-5.5',
  balanced: 'anthropic/claude-sonnet-5.5',
  fast: 'openai/gpt-6-luna',
};

/**
 * Vendors the estate routes to, with a verified Gateway model id each.
 *
 * The Gateway namespace prefix is not always the vendor name: xAI's models are served under
 * `spacexai/`. `vendorOf` maps a prefix back to the vendor, and this table is the mapping.
 */
export const SUPPORTED_VENDORS = {
  anthropic: 'anthropic/claude-opus-5.5',
  openai: 'openai/gpt-6-astra',
  google: 'google/gemini-4-argon',
  xai: 'spacexai/grok-4.7',
} as const;

export type SupportedVendor = keyof typeof SUPPORTED_VENDORS;

/** Gateway namespace prefix -> vendor. The prefix is not always the vendor name. */
const VENDOR_BY_PREFIX: Record<string, SupportedVendor> = {
  anthropic: 'anthropic',
  openai: 'openai',
  google: 'google',
  spacexai: 'xai',
};

export class ModelRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelRouteError';
  }
}

/**
 * A Gateway model id is `namespace/model`. Validate the shape here so a typo fails at
 * resolution time with a named error, not later as an opaque provider 404.
 */
function assertGatewayModelId(modelId: string): string {
  const match = /^([a-z][a-z0-9-]*)\/([A-Za-z0-9._-]+)$/.exec(modelId);
  if (!match) {
    throw new ModelRouteError(
      `Invalid gateway model id "${modelId}"; expected the form "namespace/model"`,
    );
  }
  return match[1];
}

/** Resolve a route to the Gateway model id it names. */
export function resolveModelId(route: AgentModelRoute): string {
  if (route.kind === 'frontier') {
    const modelId = TIER_MODELS[route.tier];
    if (!modelId) {
      throw new ModelRouteError(
        `Unknown model tier "${route.tier}"; expected one of ${Object.keys(TIER_MODELS).join(', ')}`,
      );
    }
    return modelId;
  }
  const modelId = route.gatewayModelId;
  if (typeof modelId !== 'string' || modelId.trim() === '') {
    throw new ModelRouteError('An explicit route requires a non-empty gatewayModelId');
  }
  // Validate the namespace, not just the syntax: `anthropic/does-not-exist` is a
  // well-formed id for a vendor the estate does route to, and `other/model` is a
  // well-formed id for a vendor it does not. Both must fail here rather than
  // later as an opaque provider error.
  vendorOf(modelId);
  return modelId;
}

/**
 * Resolve a route to a model.
 *
 * `gateway()` comes from the `ai` package, which already depends on `@ai-sdk/gateway`. No
 * vendor-specific package is involved anywhere in this module.
 */
export function resolveModel(route: AgentModelRoute): LanguageModel {
  return gateway(resolveModelId(route));
}

/**
 * The vendor that serves a resolved model id.
 *
 * A namespace prefix that the estate does not route to is an error, not a passthrough: an
 * unrouted vendor means a model the estate has not chosen to spend on.
 */
export function vendorOf(gatewayModelId: string): SupportedVendor {
  const prefix = assertGatewayModelId(gatewayModelId);
  // Own-property lookup only. A plain index read would resolve inherited keys
  // such as "constructor" or "toString" to a function rather than failing.
  const vendor = Object.prototype.hasOwnProperty.call(VENDOR_BY_PREFIX, prefix)
    ? VENDOR_BY_PREFIX[prefix]
    : undefined;
  if (!vendor) {
    throw new ModelRouteError(
      `Unknown gateway namespace "${prefix}"; the estate routes to ${Object.keys(VENDOR_BY_PREFIX).join(', ')}`,
    );
  }
  return vendor;
}
