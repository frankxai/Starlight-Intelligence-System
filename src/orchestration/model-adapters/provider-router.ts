/**
 * Starlight Frontier Provider Router
 *
 * Coordinates dynamic multi-model routing across frontier providers:
 *   - Anthropic: Claude Sonnet 5.5, Claude Opus 5.5
 *   - Google: Gemini 4 Argon, Gemini 4 Flash
 *   - OpenAI: GPT-6.1 Sol, GPT-6 Astra
 *
 * Features:
 *   - Intent & Tier-driven dynamic model selection
 *   - Graceful offline & missing-key fallback to high-fidelity deterministic synthetic traces
 *   - Live REST completion with streaming support
 *   - Detailed token usage and cost accounting
 *
 * Attestation: Built on SIP § 3 — Model Provider Router
 */

import type {
  IModelProviderAdapter,
  ModelCatalogEntry,
  ModelCompletionResponse,
  ModelProviderName,
  ModelRequest,
  ModelStreamChunk,
  ModelTier,
} from "./types.js";
import { MODEL_CATALOG, lookupModelCatalog } from "./synthetic-generator.js";
import { anthropicAdapter } from "./anthropic-adapter.js";
import { googleAdapter } from "./google-adapter.js";
import { openaiAdapter } from "./openai-adapter.js";

export interface ModelResolutionResult {
  modelId: string;
  modelName: string;
  provider: ModelProviderName;
  tier: ModelTier;
  entry: ModelCatalogEntry;
}

export interface ProviderStatusSummary {
  provider: ModelProviderName;
  available: boolean;
  hasKey: boolean;
  supportedModels: string[];
}

export class ProviderRouter {
  private adapters: Map<ModelProviderName, IModelProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter(anthropicAdapter);
    this.registerAdapter(googleAdapter);
    this.registerAdapter(openaiAdapter);
  }

  public registerAdapter(adapter: IModelProviderAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  public getAdapter(provider: ModelProviderName): IModelProviderAdapter | undefined {
    return this.adapters.get(provider);
  }

  /**
   * Returns all available frontier models in the catalog
   */
  public getCatalog(): ModelCatalogEntry[] {
    return Object.values(MODEL_CATALOG);
  }

  /**
   * Look up a model by ID, alias, or display name
   */
  public getModel(modelOrAlias: string): ModelCatalogEntry {
    return lookupModelCatalog(modelOrAlias);
  }

  /**
   * Evaluates the availability and key presence of each registered provider
   */
  public getProviderStatuses(): ProviderStatusSummary[] {
    return [
      {
        provider: "anthropic",
        available: this.adapters.get("anthropic")?.isAvailable() ?? false,
        hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
        supportedModels: ["claude-sonnet-5-5", "claude-opus-5-5"],
      },
      {
        provider: "google",
        available: this.adapters.get("google")?.isAvailable() ?? false,
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        supportedModels: ["gemini-4-argon", "gemini-4-flash"],
      },
      {
        provider: "openai",
        available: this.adapters.get("openai")?.isAvailable() ?? false,
        hasKey: Boolean(process.env.OPENAI_API_KEY),
        supportedModels: ["gpt-6-1-sol", "gpt-6-astra"],
      },
    ];
  }

  /**
   * Dynamically resolves the frontier model based on intent heuristics and tier
   */
  public resolveModel(
    tier: ModelTier = "standard",
    intent: string = "",
    preferredProvider?: ModelProviderName
  ): ModelResolutionResult {
    const cleanIntent = intent.toLowerCase();

    // 1. Explicit model name or ID matches within intent text
    if (/\b(claude\s*opus|opus\s*5\.5|opus-5-5)\b/i.test(cleanIntent)) {
      const entry = MODEL_CATALOG["claude-opus-5-5"];
      return { modelId: entry.id, modelName: entry.displayName, provider: entry.provider, tier: entry.tier, entry };
    }
    if (/\b(gemini\s*flash|gemini-4-flash|4\s*flash|flash)\b/i.test(cleanIntent)) {
      const entry = MODEL_CATALOG["gemini-4-flash"];
      return { modelId: entry.id, modelName: entry.displayName, provider: entry.provider, tier: entry.tier, entry };
    }
    if (/\b(gpt-6\s*astra|astra)\b/i.test(cleanIntent)) {
      const entry = MODEL_CATALOG["gpt-6-astra"];
      return { modelId: entry.id, modelName: entry.displayName, provider: entry.provider, tier: entry.tier, entry };
    }
    if (/\b(gpt-6\.1\s*sol|gpt-6\s*sol|sol)\b/i.test(cleanIntent)) {
      const entry = MODEL_CATALOG["gpt-6-1-sol"];
      return { modelId: entry.id, modelName: entry.displayName, provider: entry.provider, tier: entry.tier, entry };
    }

    // 2. Intent-based tier promotion & model selection
    // Frontier tier: deep architecture, council deliberations, multi-agent synthesis, formal proof
    if (
      tier === "frontier" ||
      /\b(architecture|council|synthesis|proof|refactor-all)\b/i.test(cleanIntent)
    ) {
      const modelKey = preferredProvider === "openai" ? "gpt-6-astra" : "claude-opus-5-5";
      const entry = MODEL_CATALOG[modelKey];
      return {
        modelId: entry.id,
        modelName: entry.displayName,
        provider: entry.provider,
        tier: "frontier",
        entry,
      };
    }

    // Light tier: scraping, linting, fast search queries, json extraction, status checks
    if (
      tier === "light" ||
      /\b(scrape|scraping|lint|linting|search|searching|status|check|checking|json)\b/i.test(cleanIntent)
    ) {
      const modelKey =
        /\b(fast|instant|flash|triage)\b/i.test(cleanIntent)
          ? "gemini-4-flash"
          : "gemini-4-argon";
      const entry = MODEL_CATALOG[modelKey];
      return {
        modelId: entry.id,
        modelName: entry.displayName,
        provider: entry.provider,
        tier: "light",
        entry,
      };
    }

    // Standard tier: coding, component implementation, workflow automation
    const modelKey = preferredProvider === "openai" ? "gpt-6-1-sol" : "claude-sonnet-5-5";
    const entry = MODEL_CATALOG[modelKey];
    return {
      modelId: entry.id,
      modelName: entry.displayName,
      provider: entry.provider,
      tier: "standard",
      entry,
    };
  }

  /**
   * Dispatches a completion request through the appropriate provider adapter
   */
  public async dispatchCompletion(request: ModelRequest): Promise<ModelCompletionResponse> {
    let resolvedModel: ModelCatalogEntry;

    if (request.model) {
      resolvedModel = lookupModelCatalog(request.model);
    } else {
      const resolved = this.resolveModel(request.tier, request.prompt);
      resolvedModel = resolved.entry;
    }

    const adapter = this.adapters.get(resolvedModel.provider);
    if (!adapter) {
      throw new Error(`No adapter registered for provider '${resolvedModel.provider}'.`);
    }

    const effectiveRequest: ModelRequest = {
      ...request,
      model: resolvedModel.id,
      tier: request.tier || resolvedModel.tier,
    };

    return adapter.complete(effectiveRequest);
  }

  /**
   * Streams a completion through the appropriate provider adapter
   */
  public async *dispatchStream(request: ModelRequest): AsyncIterable<ModelStreamChunk> {
    let resolvedModel: ModelCatalogEntry;

    if (request.model) {
      resolvedModel = lookupModelCatalog(request.model);
    } else {
      const resolved = this.resolveModel(request.tier, request.prompt);
      resolvedModel = resolved.entry;
    }

    const adapter = this.adapters.get(resolvedModel.provider);
    if (!adapter) {
      throw new Error(`No adapter registered for provider '${resolvedModel.provider}'.`);
    }

    const effectiveRequest: ModelRequest = {
      ...request,
      model: resolvedModel.id,
      tier: request.tier || resolvedModel.tier,
    };

    if (adapter.stream) {
      yield* adapter.stream(effectiveRequest);
    } else {
      const res = await adapter.complete(effectiveRequest);
      yield {
        id: `${res.id}-full`,
        delta: res.content,
        done: true,
        usage: res.usage,
      };
    }
  }
}

export const providerRouter = new ProviderRouter();
