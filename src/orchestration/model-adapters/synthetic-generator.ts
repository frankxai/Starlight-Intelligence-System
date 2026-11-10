/**
 * Starlight Synthetic Trace Generator
 *
 * Produces deterministic, high-fidelity synthetic model completion traces
 * for offline, test, or fallback execution modes.
 *
 * Attestation: Built on SIP § 3 — Deterministic Model Synthesis
 */

import { createHash } from "node:crypto";
import type {
  ModelCatalogEntry,
  ModelCompletionResponse,
  ModelRequest,
  ModelTier,
  TokenUsage,
} from "./types.js";

export const MODEL_CATALOG: Record<string, ModelCatalogEntry> = {
  "claude-sonnet-5-5": {
    id: "claude-sonnet-5-5",
    displayName: "Claude Sonnet 5.5",
    provider: "anthropic",
    tier: "standard",
    contextWindow: 200_000,
    maxOutputTokens: 8192,
    costPerMillionInputTokensUsd: 3.0,
    costPerMillionOutputTokensUsd: 15.0,
    upstreamApiModelId: "claude-3-5-sonnet-20241022",
    description: "Frontier standard coding, systems reasoning, and high-speed execution.",
  },
  "claude-opus-5-5": {
    id: "claude-opus-5-5",
    displayName: "Claude Opus 5.5",
    provider: "anthropic",
    tier: "frontier",
    contextWindow: 200_000,
    maxOutputTokens: 8192,
    costPerMillionInputTokensUsd: 15.0,
    costPerMillionOutputTokensUsd: 75.0,
    upstreamApiModelId: "claude-3-opus-20240229",
    description: "Peak architectural synthesis, formal verification, council deliberation.",
  },
  "gemini-4-argon": {
    id: "gemini-4-argon",
    displayName: "Gemini 4 Argon",
    provider: "google",
    tier: "light",
    contextWindow: 1_000_000,
    maxOutputTokens: 8192,
    costPerMillionInputTokensUsd: 0.15,
    costPerMillionOutputTokensUsd: 0.6,
    upstreamApiModelId: "gemini-1.5-pro-latest",
    description: "Massive context, deep search distillation, rapid multimodal ingestion.",
  },
  "gemini-4-flash": {
    id: "gemini-4-flash",
    displayName: "Gemini 4 Flash",
    provider: "google",
    tier: "light",
    contextWindow: 1_000_000,
    maxOutputTokens: 8192,
    costPerMillionInputTokensUsd: 0.075,
    costPerMillionOutputTokensUsd: 0.3,
    upstreamApiModelId: "gemini-1.5-flash-latest",
    description: "Ultra-low latency triage, linting, health checking, and json filtering.",
  },
  "gpt-6-1-sol": {
    id: "gpt-6-1-sol",
    displayName: "GPT-6.1 Sol",
    provider: "openai",
    tier: "standard",
    contextWindow: 128_000,
    maxOutputTokens: 4096,
    costPerMillionInputTokensUsd: 2.5,
    costPerMillionOutputTokensUsd: 10.0,
    upstreamApiModelId: "gpt-4o",
    description: "Resilient agentic execution, structured tool calling, multi-step problem solving.",
  },
  "gpt-6-astra": {
    id: "gpt-6-astra",
    displayName: "GPT-6 Astra",
    provider: "openai",
    tier: "frontier",
    contextWindow: 200_000,
    maxOutputTokens: 16384,
    costPerMillionInputTokensUsd: 10.0,
    costPerMillionOutputTokensUsd: 30.0,
    upstreamApiModelId: "o1",
    description: "Maximum capability formal reasoning, mathematics, compiler synthesis.",
  },
};

/**
 * Normalizes any model string (display name, ID, or alias) to a catalog entry.
 */
export function lookupModelCatalog(modelOrAlias: string): ModelCatalogEntry {
  const normalized = modelOrAlias.toLowerCase().trim().replace(/[\s_.]+/g, "-");

  // Direct ID check
  if (MODEL_CATALOG[normalized]) {
    return MODEL_CATALOG[normalized];
  }

  // Common aliases
  if (normalized.includes("opus")) return MODEL_CATALOG["claude-opus-5-5"];
  if (normalized.includes("sonnet")) return MODEL_CATALOG["claude-sonnet-5-5"];
  if (normalized.includes("argon")) return MODEL_CATALOG["gemini-4-argon"];
  if (normalized.includes("flash")) return MODEL_CATALOG["gemini-4-flash"];
  if (normalized.includes("astra")) return MODEL_CATALOG["gpt-6-astra"];
  if (normalized.includes("sol") || normalized.includes("gpt-6")) return MODEL_CATALOG["gpt-6-1-sol"];
  if (normalized.includes("gemini")) return MODEL_CATALOG["gemini-4-argon"];
  if (normalized.includes("claude")) return MODEL_CATALOG["claude-sonnet-5-5"];

  // Default fallback to Claude Sonnet 5.5
  return MODEL_CATALOG["claude-sonnet-5-5"];
}

export class SyntheticTraceGenerator {
  /**
   * Generates a deterministic hash from prompt, teammate, and model
   */
  private generateSeed(prompt: string, teammateId: string, modelId: string): Buffer {
    return createHash("sha256")
      .update(`${modelId}::${teammateId}::${prompt.trim()}`)
      .digest();
  }

  /**
   * Generates realistic, deterministic token usage and cost for a request
   */
  public calculateUsage(
    prompt: string,
    model: ModelCatalogEntry,
    seed: Buffer,
    tier: ModelTier
  ): { usage: TokenUsage; durationMs: number } {
    const seedInt1 = seed.readUInt32BE(0);
    const seedInt2 = seed.readUInt32BE(4);

    // Prompt tokens roughly 3.8 chars per token with minor deterministic variance
    const basePromptTokens = Math.max(16, Math.round(prompt.length / 3.8));
    const promptTokens = basePromptTokens + (seedInt1 % 11);

    // Realistic completion token count based on model tier
    let baseCompletionTokens = 320;
    let completionVariance = 120;
    let baseDuration = 360;
    let durationVariance = 180;

    if (tier === "light") {
      baseCompletionTokens = 150;
      completionVariance = 90;
      baseDuration = 180;
      durationVariance = 120;
    } else if (tier === "frontier") {
      baseCompletionTokens = 580;
      completionVariance = 240;
      baseDuration = 620;
      durationVariance = 280;
    }

    const completionTokens = baseCompletionTokens + (seedInt2 % completionVariance);
    const totalTokens = promptTokens + completionTokens;

    // Duration in ms with realistic response latency
    const durationMs = baseDuration + (seedInt1 % durationVariance);

    // Cost calculation
    const inputCost = (promptTokens * model.costPerMillionInputTokensUsd) / 1_000_000;
    const outputCost = (completionTokens * model.costPerMillionOutputTokensUsd) / 1_000_000;
    const estimatedCostUsd = Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;

    return {
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCostUsd,
      },
      durationMs,
    };
  }

  /**
   * Synthesizes high-fidelity domain-aligned response content
   */
  public synthesizeContent(
    request: ModelRequest,
    model: ModelCatalogEntry,
    seed: Buffer
  ): string {
    const prompt = request.prompt.trim();
    const teammate = request.teammateName || request.teammateId || "Starlight Teammate";
    const tier = request.tier || model.tier;
    const seedHex = seed.toString("hex").slice(0, 8);

    const voice = (request.metadata?.voice as string) || "architect";
    const vaults = (request.metadata?.activeVaults as string[]) || ["operational", "technical", "wisdom"];

    let header = "";
    let body = "";

    switch (voice) {
      case "queen":
        header = `[Starlight Queen Autonomic Directive — ${model.displayName}]`;
        body =
          `1. Objective Evaluated: "${prompt}"\n` +
          `2. Fleet Alignment: Bound to vaults (${vaults.join(", ")}). State anchored with zero conflicts.\n` +
          `3. Autonomic Actions: Dispatched microvm task tree, inspected telemetry hooks, verified memory half-life.\n` +
          `4. Governance Attestation: Verified within sovereign autonomy band. All locks green.`;
        break;

      case "sentinel":
        header = `[Sentinel Guardian Audit & Security Verification — ${model.displayName}]`;
        body =
          `1. Threat & Invariant Analysis: "${prompt}"\n` +
          `2. Sanitization Check: The Veil verified zero secret or PII leakage.\n` +
          `3. Safety Invariants: Money fails closed (verified); protected branches clean.\n` +
          `4. Sentinel Attestation: Code integrity verified. 0 vulnerabilities detected.`;
        break;

      case "weaver":
        header = `[Weaver Relational Synthesis — ${model.displayName}]`;
        body =
          `1. Contextual Harmony: Exploring "${prompt}" across community and creative planes.\n` +
          `2. Resonance Anchors: Connected to vaults (${vaults.join(", ")}).\n` +
          `3. Synthesis Delivery: High-bandwidth alignment established, preserving brand tone and emotional resonance.\n` +
          `4. Creative Receipt: Trace hash #${seedHex} committed.`;
        break;

      case "sage":
        header = `[Sage Wisdom Ledger & Memory Distillation — ${model.displayName}]`;
        body =
          `1. Memory Query: Sifting past decisions for "${prompt}".\n` +
          `2. Vault Consolidation: Cross-referenced ${vaults.length} vaults with SQLite FTS5 hybrid index.\n` +
          `3. Lesson Extracted: Confirmed historical patterns; temporal half-life maintained at 100% coherence.\n` +
          `4. Wisdom Footprint: Insight promoted to persistent graph.`;
        break;

      default: // architect or default
        header = `[Frontier Systems Execution — ${model.displayName}]`;
        body =
          `1. Architecture Assessment: Executed instruction "${prompt}" at ${tier} tier.\n` +
          `2. Substrate Coordination: MicroVM sandbox initialized, verified against SIP § 3 standards.\n` +
          `3. Result Pipeline: State synchronized across ${vaults.join(", ")} vaults.\n` +
          `4. Trace Receipt: Deterministic trace receipt #${seedHex} validated.`;
        break;
    }

    return (
      `${header}\n\n` +
      `Autonomous execution initiated for teammate ${teammate}.\n\n` +
      `${body}\n\n` +
      `Completed: "${prompt}". Executed with ${model.displayName} across bound vaults (${vaults.join(", ")}). All receipts anchored.\n\n` +
      `Built on SIP § 3 — Teammates Orchestration Engine`
    );
  }

  /**
   * Produces a complete deterministic synthetic completion response
   */
  public generate(request: ModelRequest): ModelCompletionResponse {
    const model = lookupModelCatalog(request.model || "claude-sonnet-5-5");
    const teammateId = request.teammateId || "teammate-default";
    const seed = this.generateSeed(request.prompt, teammateId, model.id);
    const tier = request.tier || model.tier;

    const { usage, durationMs } = this.calculateUsage(request.prompt, model, seed, tier);
    const content = this.synthesizeContent(request, model, seed);
    const traceId = `trace-syn-${seed.toString("hex").slice(0, 12)}`;

    return {
      id: traceId,
      model: model.displayName,
      provider: model.provider,
      content,
      usage,
      durationMs,
      finishReason: "synthetic",
      synthetic: true,
      timestamp: new Date().toISOString(),
      raw: {
        seed: seed.toString("hex").slice(0, 16),
        catalogId: model.id,
        upstreamId: model.upstreamApiModelId,
      },
    };
  }
}

export const syntheticGenerator = new SyntheticTraceGenerator();
